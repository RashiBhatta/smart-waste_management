const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/smart-waste')
  .then(() => mongoose.connection.db.collection('collections').updateMany({status: 'Completed'}, { $set: { status: 'Collected' } }))
  .then(res => { console.log(res); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
