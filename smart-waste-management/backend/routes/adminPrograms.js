// ============================================================
// ADMIN FEATURE 2: Volunteer Program Management
// FILE: backend/routes/adminPrograms.js
// BASE URL: /api/admin/programs
// ============================================================
// Routes:
//   GET  /api/admin/programs              — list all with pending counts
//   POST /api/admin/programs              — create new program
//   PUT  /api/admin/programs/:id          — edit program
//   PUT  /api/admin/programs/:id/cancel   — cancel program
//   GET  /api/admin/programs/pending      — all pending volunteer applications
//   PUT  /api/admin/programs/:id/volunteers/:uid/approve — approve + award coins
//   PUT  /api/admin/programs/:id/volunteers/:uid/reject  — reject
//   PUT  /api/admin/programs/:id/volunteers/bulk-approve — bulk approve all pending
// ============================================================

const express    = require('express');
const router     = express.Router();
const Program    = require('../models/Program');
const User       = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Participation = require('../models/Participation');
const { protect, authorize } = require('../middleware/auth');

// ── Shared: notify resident of approval/rejection ────────────
const notifyResident = async (recipientId, senderId, type, title, message, data) => {
  try {
    await Notification.create({ recipient: recipientId, sender: senderId, type, title, message, data });
  } catch (e) { console.warn('Notification failed:', e.message); }
};

// ============================================================
// @desc    GET all programs (admin view — includes all volunteer data)
// @route   GET /api/admin/programs
// @access  Private/Admin
// ============================================================
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, zone } = req.query;
    const query = {};
    if (status) query.status = status;
    if (zone)   query.zone   = zone;

    const programs = await Program.find(query)
      .populate('volunteers.user', 'name email phone address')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Attach pending count to each program for badge display
    const enriched = programs.map((p) => {
      const obj = p.toObject();
      obj.pendingCount  = p.volunteers.filter(v => v.status === 'pending').length;
      obj.approvedCount = p.volunteers.filter(v => v.status === 'approved').length;
      obj.rejectedCount = p.volunteers.filter(v => v.status === 'rejected').length;
      return obj;
    });

    res.json({ success: true, programs: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET all pending volunteer applications (global queue)
// @route   GET /api/admin/programs/pending
// @access  Private/Admin
// ============================================================
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const programs = await Program.find({ 'volunteers.status': 'pending' })
      .populate('volunteers.user', 'name email address coins totalCoinsEarned')
      .select('title organization zone volunteers rewardCoins');

    // Flatten into a single queue: one entry per pending volunteer
    const queue = [];
    programs.forEach((prog) => {
      prog.volunteers
        .filter(v => v.status === 'pending')
        .forEach((v) => {
          queue.push({
            programId:    prog._id,
            programTitle: prog.title,
            organization: prog.organization,
            zone:         prog.zone,
            rewardCoins:  prog.rewardCoins || 100,
            volunteerId:  v._id,
            userId:       v.user?._id,
            userName:     v.user?.name,
            userEmail:    v.user?.email,
            userZone:     v.user?.address?.zone,
            userCoins:    v.user?.coins || 0,
            userTotalCoins: v.user?.totalCoinsEarned || 0,
            appliedAt:    v.appliedAt,
          });
        });
    });

    // Sort by oldest first (FIFO)
    queue.sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));

    res.json({ success: true, queue, total: queue.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    CREATE a new program
// @route   POST /api/admin/programs
// @access  Private/Admin
// ============================================================
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title, organization, description, zone, location,
      startDate, endDate, maxVolunteers, rewardCoins,
      requirements, benefits, contactPerson,
    } = req.body;

    if (!title?.trim())   return res.status(400).json({ success: false, message: 'Title is required' });
    if (!startDate)       return res.status(400).json({ success: false, message: 'Start date is required' });
    if (!endDate)         return res.status(400).json({ success: false, message: 'End date is required' });
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const program = await Program.create({
      title:        title.trim(),
      organization: organization?.trim() || 'SWM Admin',
      description:  description?.trim(),
      zone,
      location:     location?.trim() || 'Kathmandu',
      startDate:    new Date(startDate),
      endDate:      new Date(endDate),
      maxVolunteers: maxVolunteers || 20,
      rewardCoins:   rewardCoins   || 100,
      requirements:  requirements  || [],
      benefits:      benefits      || [],
      contactPerson: contactPerson || {},
      createdBy:     req.user._id,
    });

    // Notify all residents (or zone-specific ones)
    const residentQuery = { role: 'resident' };
    if (zone && zone !== 'all') residentQuery['address.zone'] = zone;
    const residents = await User.find(residentQuery).select('_id');

    if (residents.length > 0) {
      await Notification.insertMany(
        residents.map(r => ({
          recipient: r._id,
          sender:    req.user._id,
          type:      'program_created',
          title:     `🌿 New Program: ${program.title}`,
          message:   `${program.organization} launched a new volunteer program. Join and earn ${program.rewardCoins} coins!`,
          data:      { programId: program._id },
          priority:  'medium',
        }))
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('newProgramCreated', { programId: program._id, title: program.title });
    }

    res.status(201).json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    EDIT an existing program
// @route   PUT /api/admin/programs/:id
// @access  Private/Admin
// ============================================================
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title, organization, description, zone, location,
      startDate, endDate, maxVolunteers, rewardCoins,
      requirements, benefits, contactPerson,
    } = req.body;

    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    if (program.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot edit a cancelled program' });
    }

    if (title)        program.title        = title.trim();
    if (organization) program.organization = organization.trim();
    if (description)  program.description  = description.trim();
    if (zone)         program.zone         = zone;
    if (location)     program.location     = location.trim();
    if (startDate)    program.startDate    = new Date(startDate);
    if (endDate)      program.endDate      = new Date(endDate);
    if (maxVolunteers) program.maxVolunteers = maxVolunteers;
    if (rewardCoins)   program.rewardCoins  = rewardCoins;
    if (requirements)  program.requirements = requirements;
    if (benefits)      program.benefits     = benefits;
    if (contactPerson) program.contactPerson = contactPerson;

    await program.save();

    // Notify approved volunteers of the update
    const approvedUserIds = program.volunteers
      .filter(v => v.status === 'approved')
      .map(v => v.user);

    if (approvedUserIds.length > 0) {
      await Notification.insertMany(
        approvedUserIds.map(uid => ({
          recipient: uid,
          sender:    req.user._id,
          type:      'system_alert',
          title:     `📝 Program Updated: ${program.title}`,
          message:   'Details for a program you joined have been updated. Please review.',
          data:      { programId: program._id },
          priority:  'low',
        }))
      );
    }

    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    CANCEL a program
// @route   PUT /api/admin/programs/:id/cancel
// @access  Private/Admin
// ============================================================
router.put('/:id/cancel', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    if (program.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    program.status = 'cancelled';
    await program.save();

    // Notify all volunteers
    const volunteerIds = program.volunteers.map(v => v.user);
    if (volunteerIds.length > 0) {
      await Notification.insertMany(
        volunteerIds.map(uid => ({
          recipient: uid,
          sender:    req.user._id,
          type:      'system_alert',
          title:     `❌ Program Cancelled: ${program.title}`,
          message:   reason
            ? `The program was cancelled. Reason: ${reason}`
            : `The program "${program.title}" has been cancelled by admin.`,
          data:      { programId: program._id },
          priority:  'high',
        }))
      );
    }

    const io = req.app.get('io');
    if (io) io.emit('programCancelled', { programId: program._id });

    res.json({ success: true, message: 'Program cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    APPROVE a volunteer (No coins awarded yet)
// @route   PUT /api/admin/programs/:id/volunteers/:uid/approve
// @access  Private/Admin
// ============================================================
router.put('/:id/volunteers/:uid/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { id: programId, uid: userId } = req.params;

    const [program, resident] = await Promise.all([
      Program.findById(programId),
      User.findById(userId),
    ]);

    if (!program)  return res.status(404).json({ success: false, message: 'Program not found' });
    if (!resident) return res.status(404).json({ success: false, message: 'User not found' });

    const volunteer = program.volunteers.find(v => v.user.toString() === userId);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Application not found' });
    if (volunteer.status === 'approved' || volunteer.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Already approved or completed' });
    }

    // Update volunteer status
    volunteer.status     = 'approved';
    volunteer.approvedAt = new Date();
    program.markModified('volunteers');
    await program.save();

    const rewardMsg = `Your application to participate in "${program.title}" has been approved. Complete the program to earn ${program.rewardCoins || 100} Eco-Coins!`;

    await notifyResident(resident._id, req.user._id, 'volunteer_approved',
      '🎉 Application Approved!', rewardMsg,
      { programId: program._id }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('applicationApproved', {
        message: rewardMsg,
      });
    }

    res.json({
      success: true,
      message: rewardMsg,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    COMPLETE a volunteer program → award coins
// @route   PUT /api/admin/programs/:id/volunteers/:uid/complete
// @access  Private/Admin
// ============================================================
router.put('/:id/volunteers/:uid/complete', protect, authorize('admin'), async (req, res) => {
  try {
    const { id: programId, uid: userId } = req.params;

    const [program, resident] = await Promise.all([
      Program.findById(programId),
      User.findById(userId),
    ]);

    if (!program)  return res.status(404).json({ success: false, message: 'Program not found' });
    if (!resident) return res.status(404).json({ success: false, message: 'User not found' });

    const volunteer = program.volunteers.find(v => v.user.toString() === userId);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Application not found' });
    if (volunteer.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Resident must be approved first' });
    }

    // Update volunteer status
    volunteer.status      = 'completed';
    volunteer.completedAt = new Date();
    program.markModified('volunteers');
    await program.save();

    // Award coins using User.addCoins() (handles milestone + free service)
    const coinsToAward   = program.rewardCoins || 100;
    const prevTotal      = resident.totalCoinsEarned || 0;
    await resident.addCoins(coinsToAward, { type: 'volunteer', programId: program._id });
    await resident.save();
    const newTotal = resident.totalCoinsEarned || 0;
    const milestoneHit = prevTotal < 1000 && newTotal >= 1000;

    // Log transaction
    await Transaction.create({
      user:        resident._id,
      type:        'coin_earned',
      amount:      coinsToAward,
      description: `Program completed: ${program.title}`,
      reference:   { programId: program._id },
      balance:     resident.coins,
      status:      'completed',
    });

    const rewardMsg = milestoneHit
      ? `Completed! You earned ${coinsToAward} coins. 🎉 You've reached 1,000 coins and unlocked 1 month of FREE service!`
      : `Completed! You earned ${coinsToAward} Eco-Coins for finishing "${program.title}".`;

    await notifyResident(resident._id, req.user._id, 'reward',
      '🏆 Program Completed!', rewardMsg,
      { programId: program._id, coinsEarned: coinsToAward, totalCoins: resident.coins }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('programCompleted', {
        message: rewardMsg,
        coins: resident.coins,
        totalCoinsEarned: newTotal,
        freeServiceUntil: resident.freeServiceUntil,
      });
    }

    res.json({
      success: true,
      message: rewardMsg,
      coinsAwarded: coinsToAward,
      milestoneHit,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    REJECT a volunteer application
// @route   PUT /api/admin/programs/:id/volunteers/:uid/reject
// @access  Private/Admin
// ============================================================
router.put('/:id/volunteers/:uid/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { id: programId, uid: userId } = req.params;
    const { reason } = req.body;

    const program = await Program.findById(programId);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    const volunteer = program.volunteers.find(v => v.user.toString() === userId);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Application not found' });
    if (volunteer.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Already rejected' });
    }

    volunteer.status     = 'rejected';
    volunteer.rejectedAt = new Date();
    program.markModified('volunteers');
    await program.save();

    await notifyResident(userId, req.user._id, 'volunteer_rejected',
      'Application Update',
      reason
        ? `Your application for "${program.title}" was not approved. Reason: ${reason}`
        : `Your application for "${program.title}" was not approved at this time.`,
      { programId: program._id }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('applicationRejected', {
        programId: program._id,
        message: `Application for "${program.title}" was not approved.`,
      });
    }

    res.json({ success: true, message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    BULK-APPROVE all pending volunteers in a program
// @route   PUT /api/admin/programs/:id/volunteers/bulk-approve
// @access  Private/Admin
// ============================================================
router.put('/:id/volunteers/bulk-approve', protect, authorize('admin'), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    const pending = program.volunteers.filter(v => v.status === 'pending');
    if (pending.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending applications' });
    }

    const coinsToAward = program.rewardCoins || 100;
    const results = [];

    for (const v of pending) {
      try {
        v.status     = 'approved';
        v.approvedAt = new Date();

        const resident = await User.findById(v.user);
        if (resident) {
          await notifyResident(resident._id, req.user._id, 'volunteer_approved',
            '🎉 Application Approved!',
            `Your application to participate in "${program.title}" has been approved. Complete the program to earn ${coinsToAward} Eco-Coins!`,
            { programId: program._id }
          );

          const io = req.app.get('io');
          if (io) io.to(v.user.toString()).emit('applicationApproved', { });

          results.push({ userId: v.user, success: true });
        }
      } catch (e) {
        results.push({ userId: v.user, success: false, error: e.message });
      }
    }

    program.markModified('volunteers');
    await program.save();

    const succeeded = results.filter(r => r.success).length;
    res.json({
      success: true,
      message: `Bulk approved ${succeeded} of ${pending.length} volunteers`,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET all pending participations (proofs)
// @route   GET /api/admin/programs/participations/pending
// @access  Private/Admin
// ============================================================
router.get('/participations/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const participations = await Participation.find({ reviewStatus: 'pending' })
      .populate('resident', 'name email address')
      .populate('program', 'title rewardCoins organization')
      .sort({ submittedAt: -1 });

    res.json({ success: true, participations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    REVIEW a task completion form submission
// @route   PUT /api/admin/programs/participations/:id/review
// @access  Private/Admin
// ============================================================
router.put('/participations/:id/review', protect, authorize('admin'), async (req, res) => {
  try {
    const { reviewStatus, adminRemarks } = req.body;
    
    if (!['approved', 'rejected'].includes(reviewStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid review status' });
    }

    const participation = await Participation.findById(req.params.id)
      .populate('program')
      .populate('resident');

    if (!participation) return res.status(404).json({ success: false, message: 'Participation not found' });
    if (participation.reviewStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending submissions can be reviewed' });
    }

    participation.reviewStatus = reviewStatus;
    participation.adminRemarks = adminRemarks;
    participation.reviewedAt = new Date();

    const program = participation.program;
    const resident = participation.resident;
    
    let coinsEarned = 0;
    let milestoneHit = false;

    if (reviewStatus === 'approved') {
      // Update volunteer status to completed in the Program model
      const volunteer = program.volunteers.find(v => v.user.toString() === resident._id.toString());
      if (volunteer) {
        volunteer.status = 'completed';
        volunteer.completedAt = new Date();
        program.markModified('volunteers');
        await program.save();
      }

      if (participation.taskCompletedStatus === 'completed') {
        participation.coinsAwarded = true;
        coinsEarned = 100; // As per the requirement: "Add 100 coins"
        
        const prevCoins = resident.coins || 0;
        await resident.addCoins(coinsEarned, { type: 'volunteer', programId: program._id });
        await resident.save();
        
        milestoneHit = prevCoins < 1000 && resident.coins < 1000 && resident.freeServiceMonths > 0; // Check if 1000 coins threshold was hit and reset

        await Transaction.create({
          user: resident._id,
          type: 'coin_earned',
          amount: coinsEarned,
          description: `Task completed verified: ${program.title}`,
          reference: { programId: program._id },
          balance: resident.coins,
          status: 'completed',
        });

        const rewardMsg = milestoneHit 
          ? `Task verified! You earned ${coinsEarned} coins. 🎉 You've reached 1,000 coins and unlocked 1 month of FREE service!`
          : `Task verified! You earned ${coinsEarned} Eco-Coins for finishing "${program.title}".`;
        await notifyResident(resident._id, req.user._id, 'reward', '🏆 Task Completed!', rewardMsg, { programId: program._id });
      } else {
        await notifyResident(resident._id, req.user._id, 'system_alert', 'Task Verified', `Your submission for "${program.title}" was approved but the task was not fully completed.`, { programId: program._id });
      }
    } else {
      await notifyResident(resident._id, req.user._id, 'system_alert', 
        'Task Completion Not Verified',
        adminRemarks ? `Your submission for "${program.title}" was rejected. Remarks: ${adminRemarks}` : `Your submission for "${program.title}" was rejected.`
      );
    }

    await participation.save();

    res.json({ success: true, message: `Task completion ${reviewStatus}`, coinsAwarded: coinsEarned, milestoneHit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;