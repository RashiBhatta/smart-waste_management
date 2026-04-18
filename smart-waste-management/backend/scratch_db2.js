const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/smart-waste')
  .then(() => mongoose.connection.db.collection('collections').aggregate([
      {
        $group: {
          _id:       null,
          total:     { $sum: 1 },
          collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
          skipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
          pending:   { $sum: { $cond: [{ $in:  ['$status', ['Pending', 'Scheduled', 'In Progress']] }, 1, 0] } },
        },
      },
    ]).toArray())
  .then(res => { console.log(res); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
