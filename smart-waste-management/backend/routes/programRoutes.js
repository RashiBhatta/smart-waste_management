// ============================================================
// FEATURE 2: Resident Volunteer Participation
// FILE: backend/routes/programRoutes.js  (resident-facing routes)
// BASE URL: /api/programs
// ============================================================

const express = require('express');
const router = express.Router();
const Program      = require('../models/Program');
const User         = require('../models/User');
const VolunteerRequest = require('../models/VolunteerRequest');
const Participation = require('../models/Participation');
const { protect, authorize } = require('../middleware/auth');

// ============================================================
// @desc    GET all programs — with per-resident join status
// @route   GET /api/programs
// @access  Private (any logged-in role)
// ============================================================
router.get('/', protect, async (req, res) => {
  try {
    const programs = await Program.find({ status: { $ne: 'cancelled' } })
      .sort('-createdAt')
      .populate('createdBy', 'name')
      .select('-__v');

    const currentUserId = req.user._id.toString();
    const participations = await Participation.find({ resident: req.user._id });

    // Attach resident-specific flags to each program
    const enriched = programs.map((prog) => {
      const obj = prog.toObject();

      const myRecord = prog.volunteers.find(
        (v) => v.user && v.user.toString() === currentUserId
      );
      
      const myParticipation = participations.find(p => p.program.toString() === prog._id.toString());

      return {
        ...obj,
        hasJoined:       !!myRecord,
        volunteerStatus: myRecord ? myRecord.status : null,   // 'pending' | 'approved' | 'rejected' | 'completed'
        participationStatus: myParticipation ? myParticipation.status : null,
        spotsLeft:       prog.maxVolunteers - prog.currentVolunteers,
        isFull:          prog.currentVolunteers >= prog.maxVolunteers,
        // Strip full volunteer list — residents don't need other applicants' info
        volunteers:      undefined,
      };
    });

    res.json({ success: true, programs: enriched });
  } catch (err) {
    console.error('Get programs error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET single program detail (resident view)
// @route   GET /api/programs/:id
// @access  Private
// ============================================================
router.get('/:id', protect, async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('createdBy', 'name organization');

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    const currentUserId = req.user._id.toString();
    const myRecord = program.volunteers.find(
      (v) => v.user && v.user.toString() === currentUserId
    );
    const myParticipation = await Participation.findOne({ resident: req.user._id, program: program._id });

    const obj = program.toObject();

    res.json({
      success: true,
      program: {
        ...obj,
        hasJoined:       !!myRecord,
        volunteerStatus: myRecord ? myRecord.status : null,
        participationStatus: myParticipation ? myParticipation.status : null,
        appliedAt:       myRecord ? myRecord.appliedAt : null,
        approvedAt:      myRecord ? myRecord.approvedAt : null,
        spotsLeft:       program.maxVolunteers - program.currentVolunteers,
        isFull:          program.currentVolunteers >= program.maxVolunteers,
        // Hide other applicant details from residents
        volunteers:      undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    JOIN a program as a volunteer (resident only)
// @route   POST /api/programs/:id/join
// @access  Private/Resident
//
// Flow:
//  1. Validate program exists & is not full
//  2. Guard against duplicate applications
//  3. Push volunteer record with status:'pending'
//  4. Notify all admins (DB + Socket)
// ============================================================
router.post('/:id/join', protect, authorize('resident'), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // ── Guard: already applied ───────────────────────────────
    const alreadyJoined = program.volunteers.some(
      (v) => v.user && v.user.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this program',
      });
    }

    // ── Guard: program full ──────────────────────────────────
    if (program.currentVolunteers >= program.maxVolunteers) {
      return res.status(400).json({
        success: false,
        message: 'This program is already full',
      });
    }

    // ── 1. Add volunteer record ──────────────────────────────
    program.volunteers.push({
      user:      req.user._id,
      status:    'pending',
      appliedAt: new Date(),
    });
    await program.save();

    // ── 2. Log VolunteerRequest (for admin workflow) ──────────
    try {
      await VolunteerRequest.create({
        userId:        req.user._id,
        programId:     program._id,
        programName:   program.title,
        status:        'pending',
        coinsToAward:  program.rewardCoins || 100,
      });
    } catch (e) {
      console.warn('VolunteerRequest log failed (non-critical):', e.message);
    }

    // ── 3. Notify all admins ─────────────────────────────────
    const admins = await User.find({ role: 'admin' }).select('_id');

    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((admin) => ({
          recipient: admin._id,
          sender:    req.user._id,
          type:      'volunteer_request',
          title:     'New Volunteer Application',
          message:   `${req.user.name} applied to join "${program.title}"`,
          data: {
            programId:    program._id,
            programTitle: program.title,
            userId:       req.user._id,
            userName:     req.user.name,
          },
          read: false,
        }))
      );
    }

    // ── 4. Real-time socket push to admin room ────────────────
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('newVolunteerApplication', {
        programId:    program._id,
        programTitle: program.title,
        userId:       req.user._id,
        userName:     req.user.name,
        appliedAt:    new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted! Waiting for admin approval.',
      applicationStatus: 'pending',
    });
  } catch (err) {
    console.error('Join program error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET resident's own program applications
// @route   GET /api/programs/my/applications
// @access  Private/Resident
// ============================================================
router.get('/my/applications', protect, authorize('resident'), async (req, res) => {
  try {
    const programs = await Program.find({ 'volunteers.user': req.user._id })
      .sort('-createdAt')
      .select('title organization zone status volunteers rewardCoins startDate endDate description');

    const participations = await Participation.find({ resident: req.user._id });

    const result = programs.map((prog) => {
      const myRecord = prog.volunteers.find(
        (v) => v.user.toString() === req.user._id.toString()
      );
      const myParticipation = participations.find(p => p.program.toString() === prog._id.toString());
      return {
        _id:               prog._id,
        title:             prog.title,
        organization:      prog.organization,
        zone:              prog.zone,
        programStatus:     prog.status,
        startDate:         prog.startDate,
        endDate:           prog.endDate,
        description:       prog.description,
        rewardCoins:       prog.rewardCoins || 100,
        applicationStatus: myRecord?.status,       // 'pending' | 'approved' | 'rejected' | 'completed'
        participationStatus: myParticipation?.status,
        appliedAt:         myRecord?.appliedAt,
        approvedAt:        myRecord?.approvedAt,
      };
    });

    res.json({ success: true, applications: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    SUBMIT participation proof for a program
// @route   POST /api/programs/:id/participate
// @access  Private/Resident
// ============================================================
router.post('/:id/participate', protect, authorize('resident'), async (req, res) => {
  try {
    const { proof } = req.body;
    if (!proof?.trim()) {
      return res.status(400).json({ success: false, message: 'Proof description is required' });
    }

    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    // Validate that the user is an approved volunteer
    const volunteerRec = program.volunteers.find(v => v.user.toString() === req.user._id.toString());
    if (!volunteerRec || volunteerRec.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'You must be an approved volunteer to submit proof.' });
    }

    // Check if a pending or approved participation already exists
    const existing = await Participation.findOne({ resident: req.user._id, program: program._id });
    if (existing) {
      if (existing.status === 'approved') return res.status(400).json({ success: false, message: 'Already marked as completed' });
      if (existing.status === 'pending') return res.status(400).json({ success: false, message: 'Submission already pending review' });
    }

    // Save participation
    if (existing && existing.status === 'rejected') {
      // Allow resubmission
      existing.status = 'pending';
      existing.proof = proof;
      existing.submittedAt = new Date();
      await existing.save();
    } else {
      await Participation.create({
        resident: req.user._id,
        program: program._id,
        proof,
      });
    }

    // Notify admins
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('newParticipationProof', {
        programId: program._id,
        userId: req.user._id,
        userName: req.user.name
      });
    }

    res.json({ success: true, message: 'Participation submitted for review.' });
  } catch (err) {
    console.error('Submit participation error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;