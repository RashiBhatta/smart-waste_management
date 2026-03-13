// const express = require('express');
// const router = express.Router();
// const Collection = require('../models/Collection');
// const { protect } = require('../middleware/auth');

// // @desc    Create a new waste collection request (Handles both / and /request)
// // @route   POST /api/collections/ OR POST /api/collections/request
// router.post(['/', '/request'], protect, async (req, res) => {
//   try {
//     const { wasteType, actualWeight, notes } = req.body;
//     const currentUserId = req.user._id || req.user.id;

//     const collection = new Collection({
//       resident: currentUserId,
//       address: {
//         zone: req.user.address?.zone || 'Unassigned',
//         street: req.user.address?.street || 'Unknown'
//       },
//       wasteType: wasteType || 'Mixed',
//       actualWeight: Number(actualWeight) || 0,
//       notes: notes || '',
//       status: 'Pending'
//     });

//     await collection.save();
//     res.status(201).json({ success: true, collection });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // @desc    Get current resident's history
// // @route   GET /api/collections/my
// router.get('/my', protect, async (req, res) => {
//   try {
//     const currentUserId = req.user._id || req.user.id;
//     const collections = await Collection.find({ resident: currentUserId }).sort({ createdAt: -1 });
//     res.json({ success: true, collections });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // @desc    Get single collection details (Fixes the 404 in your log)
// // @route   GET /api/collections/:id
// router.get('/:id', protect, async (req, res) => {
//   try {
//     const collection = await Collection.findById(req.params.id).populate('collector', 'name');
//     if (!collection) return res.status(404).json({ success: false, message: 'Not found' });
//     res.json({ success: true, collection });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const Collection = require('../models/Collection');
// const { protect } = require('../middleware/auth');

// // @desc    Create a new waste collection request
// // @route   POST /api/collections/ OR POST /api/collections/request
// // This array ['/', '/request'] ensures either URL works
// router.post(['/', '/request'], protect, async (req, res) => {
//   try {
//     const { wasteType, actualWeight, notes } = req.body;
    
//     // Safety check for user ID
//     const currentUserId = req.user._id || req.user.id;

//     const collection = new Collection({
//       resident: currentUserId,
//       address: {
//         zone: req.user.address?.zone || 'Unassigned',
//         street: req.user.address?.street || 'Unknown'
//       },
//       wasteType: wasteType || 'Mixed',
//       actualWeight: Number(actualWeight) || 0,
//       notes: notes || '',
//       status: 'Pending'
//     });

//     await collection.save();
    
//     // Emit real-time socket events if socket.io is attached to the app
//     const io = req.app.get('io');
//     if (io) {
//       io.to('admins').emit('newCollectionRequest', collection);
//     }

//     res.status(201).json({ success: true, collection });
//   } catch (err) {
//     console.error("🔥 COLLECTION POST ERROR:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // @desc    Get history for logged in resident
// // @route   GET /api/collections/my
// router.get('/my', protect, async (req, res) => {
//   try {
//     const currentUserId = req.user._id || req.user.id;
//     const collections = await Collection.find({ resident: currentUserId }).sort({ createdAt: -1 });
//     res.json({ success: true, collections });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
// // @desc    Update Collection Status and Assign Collector
// // @route   PATCH /api/collections/:id/status
// // Explicitly including /status in the path to match the frontend call
// router.patch('/:id/status', protect, async (req, res) => {
//   try {
//     const { status, collector, notes, actualWeight } = req.body;

//     // Find the collection by ID from the URL params
//     const collection = await Collection.findById(req.params.id);

//     if (!collection) {
//       return res.status(404).json({ success: false, message: 'Collection not found' });
//     }

//     // Update fields if they are provided in the request body
//     if (status) collection.status = status;
//     if (collector) collection.collector = collector;
//     if (notes) collection.notes = notes;
//     if (actualWeight) collection.actualWeight = Number(actualWeight);

//     await collection.save();

//     // Populate for the response so the UI updates with names
//     const updatedCollection = await Collection.findById(collection._id)
//       .populate('resident', 'name')
//       .populate('collector', 'name');

//     res.json({ success: true, collection: updatedCollection });
//   } catch (err) {
//     console.error("🔥 PATCH STATUS ERROR:", err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const Collection = require('../models/Collection');
// const User = require('../models/User');
// const { protect } = require('../middleware/auth'); 

// /**
//  * @desc    Universal GET for collections (Crucial for Dashboard Filters)
//  * @route   GET /api/collections
//  */
// router.get('/', protect, async (req, res) => {
//   try {
//     const { status, collector, zone } = req.query;
//     let query = {};

//     // Apply filters if they exist in the URL params
//     if (status) query.status = status;
//     if (collector) query.collector = collector;
//     if (zone) query['address.zone'] = zone;

//     // If a resident calls this, force them to only see their own
//     if (req.user.role === 'resident') {
//       query.resident = req.user._id;
//     }

//     const collections = await Collection.find(query)
//       .populate('resident', 'name phone address')
//       .populate('collector', 'name phone')
//       .sort({ createdAt: -1 });

//     res.json({ 
//       success: true, 
//       collections,
//       count: collections.length 
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * @desc    Get logged in resident's collection history
//  * @route   GET /api/collections/my
//  */
// router.get('/my', protect, async (req, res) => {
//   try {
//     const collections = await Collection.find({ resident: req.user._id })
//       .populate('collector', 'name phone')
//       .sort({ createdAt: -1 });
//     res.json({ success: true, collections });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * @desc    Submit a new collection request
//  * @route   POST /api/collections OR POST /api/collections/request
//  */
// router.post(['/', '/request'], protect, async (req, res) => {
//   try {
//     const collection = new Collection({
//       ...req.body,
//       resident: req.user._id,
//       status: 'Pending',
//       requestDate: new Date()
//     });
//     await collection.save();
//     res.status(201).json({ success: true, collection });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// /**
//  * @desc    Update Status / Weight / Collector Assignment
//  * @route   PATCH /api/collections/:id/status
//  */
// router.patch('/:id/status', protect, async (req, res) => {
//     try {
//       const { status, collector, actualWeight, notes } = req.body;
//       const collection = await Collection.findById(req.params.id);
  
//       if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
  
//       if (status) collection.status = status;
//       if (collector) collection.collector = collector;
//       if (notes) collection.notes = notes;
//       if (actualWeight) {
//         collection.actualWeight = Number(actualWeight);
//         // Award points if completed (1kg = 10 coins)
//         if (status === 'Completed') {
//           const points = Math.floor(Number(actualWeight) * 10);
//           await User.findByIdAndUpdate(collection.resident, { $inc: { coins: points } });
//         }
//       }
  
//       await collection.save();
//       res.json({ success: true, collection });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); 

/**
 * @desc    Universal GET for collections
 * @route   GET /api/collections
 */
router.get('/', protect, async (req, res) => {
  try {
    const { status, collector, zone } = req.query;
    let query = {};

    if (status) query.status = status;
    if (collector) query.collector = collector;
    if (zone) query['address.zone'] = zone;

    if (req.user.role === 'resident') {
      query.resident = req.user._id;
    }

    const collections = await Collection.find(query)
      .populate('resident', 'name phone address')
      .populate('collector', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, collections, count: collections.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @desc    Get logged in resident's collection history
 * @route   GET /api/collections/my
 */
router.get('/my', protect, async (req, res) => {
  try {
    const collections = await Collection.find({ resident: req.user._id })
      .populate('collector', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, collections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @desc    Submit a new collection request
 * @route   POST /api/collections OR /api/collections/request
 */
router.post(['/', '/request'], protect, async (req, res) => {
  try {
    const { wasteType, estimatedWeight, notes, address } = req.body;
    const currentUserId = req.user._id;

    // FIX: Fallback to user's registered address if the frontend doesn't send one
    const collectionAddress = address || {
      zone: req.user.address?.zone || 'Unassigned',
      street: req.user.address?.street || 'Unknown',
      city: req.user.address?.city || 'Unknown'
    };

    const collection = new Collection({
      resident: currentUserId,
      address: collectionAddress,
      wasteType: wasteType || 'Mixed',
      estimatedWeight: Number(estimatedWeight) || 0,
      notes: notes || '',
      status: 'Pending',
      requestDate: new Date()
    });

    await collection.save();
    
    // Optional: Populate resident info before sending to socket
    await collection.populate('resident', 'name phone email');

    // Emit real-time alert to Admins
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('new_collection_request', {
        collectionId: collection._id,
        resident: req.user.name
      });
    }

    res.status(201).json({ success: true, collection });
  } catch (err) {
    console.error("🔥 COLLECTION POST ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @desc    Update Status / Weight / Collector Assignment
 * @route   PUT and PATCH /api/collections/:id/status
 */
const updateStatus = async (req, res) => {
  try {
    const { status, collector, actualWeight, notes } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection document not found.' });
    }

    if (status) collection.status = status;
    if (collector) collection.collector = collector;
    if (notes) collection.notes = notes;
    
    if (actualWeight) {
      collection.actualWeight = Number(actualWeight);
      // Award points if completed (1kg = 10 coins)
      if (status === 'Completed') {
        const points = Math.floor(Number(actualWeight) * 10);
        await User.findByIdAndUpdate(collection.resident, { $inc: { coins: points, totalCoinsEarned: points } });
      }
    }

    await collection.save();
    res.json({ success: true, collection });
  } catch (err) {
    console.error(`🔥 STATUS UPDATE ERROR:`, err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Bind both PUT and PATCH to prevent 404s from different frontend calls
router.put('/:id/status', protect, updateStatus);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;