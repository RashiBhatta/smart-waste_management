const Program = require('../models/Program');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Create a new program (Admin only)
exports.createProgram = async (req, res) => {
  try {
    const { title, description, organization, zone, location, startDate, endDate, volunteerLimit, requirements, benefits } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const program = await Program.create({
      title, description, organization, zone, location,
      startDate: start, endDate: end,
      volunteerLimit: volunteerLimit || 50,
      requirements: requirements || [],
      benefits: benefits || [],
      createdBy: req.user.id,
      status: start > new Date() ? 'upcoming' : 'active'
    });

    // Notify residents in the specific zone
    const residents = await User.find({ role: 'resident', isActive: true });
    const notifications = residents
      .filter(r => zone === 'all' || r.address.zone === zone)
      .map(r => ({
        recipient: r._id,
        sender: req.user.id,
        type: 'program',
        title: 'New Volunteer Program!',
        message: `${organization} launched ${title}. Join and earn coins!`,
        data: { programId: program._id },
        priority: 'medium'
      }));

    if (notifications.length > 0) await Notification.insertMany(notifications);

    res.status(201).json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating program', error: error.message });
  }
};

// @desc    Join program (Resident only)
exports.joinProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    if (program.volunteers.some(v => v.user.toString() === req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already joined this program' });
    }

    if (program.currentVolunteers >= program.volunteerLimit) {
      return res.status(400).json({ success: false, message: 'Volunteer limit reached' });
    }

    program.volunteers.push({ user: req.user.id, status: 'pending', joinedAt: new Date() });
    await program.save();

    // Notify Admins
    const admins = await User.find({ role: 'admin' });
    const adminNotifs = admins.map(admin => ({
      recipient: admin._id,
      sender: req.user.id,
      type: 'volunteer',
      title: 'New Volunteer Request',
      message: `${req.user.name} wants to join ${program.title}`,
      data: { programId: program._id, userId: req.user.id }
    }));
    await Notification.insertMany(adminNotifs);

    res.json({ success: true, message: 'Application submitted for approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error joining program' });
  }
};

// @desc    Approve volunteer & Award Coins
exports.approveVolunteer = async (req, res) => {
  try {
    const { programId, userId } = req.params;
    const program = await Program.findById(programId);
    
    const volunteer = program.volunteers.find(v => v.user.toString() === userId);
    if (!volunteer || volunteer.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Invalid request or already approved' });
    }

    volunteer.status = 'approved';
    volunteer.approvedAt = new Date();
    program.currentVolunteers += 1;
    await program.save();

    // Award Reward Coins (100 coins for volunteering)
    const resident = await User.findById(userId);
    resident.coins = (resident.coins || 0) + 100;
    await resident.save();

    // Notify Resident
    await Notification.create({
      recipient: userId,
      type: 'reward',
      title: 'Volunteer Approved! 🏆',
      message: `You earned 100 coins for joining ${program.title}!`,
      data: { programId: program._id, coinsEarned: 100 }
    });

    res.json({ success: true, message: 'Volunteer approved and rewarded.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Approval failed' });
  }
}

// @desc    Get Program Stats (Admin Analytics)
exports.getProgramStats = async (req, res) => {
  try {
    const stats = await Program.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalVolunteers: { $sum: '$currentVolunteers' }
        }
      }
    ]);

    const zoneStats = await Program.aggregate([
      { $group: { _id: '$zone', count: { $sum: 1 }, volunteers: { $sum: '$currentVolunteers' } } }
    ]);

    res.json({ success: true, stats: stats[0], zoneStats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Stats fetch failed' });
  }
};