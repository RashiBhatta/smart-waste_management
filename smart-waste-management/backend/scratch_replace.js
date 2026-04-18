const fs = require('fs');
const files = [
  'server.js',
  'routes/resident.js',
  'routes/payments.js',
  'routes/collectionRoutes.js'
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (f === 'server.js') {
    const updated = content.replace(/status', 'Completed'/g, "status', 'Collected'");
    fs.writeFileSync(f, updated);
  } else {
    const updated = content.replace(/status: 'Completed'/g, "status: 'Collected'")
                           .replace(/status === 'Completed'/g, "status === 'Collected'");
    fs.writeFileSync(f, updated);
  }
});
console.log('Done replacement');
