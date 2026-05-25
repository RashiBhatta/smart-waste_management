#!/usr/bin/env node
/*
  Migration script to fix duplicate-key error on participations.
  - Drops old 'resident_1_program_1' index if present
  - Deletes documents where `resident` or `program` is null
  - Creates a partial unique index that only applies when both are ObjectIds

  Usage: from backend folder run `node scripts/fix_participations_index.js`
*/
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_waste_management';

(async function main(){
  try {
    console.log('Connecting to', uri.replace(/:[^:]*@/, ':***@'));
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const coll = mongoose.connection.collection('participations');

    const indexes = await coll.indexes();
    const names = indexes.map(i => i.name);
    if (names.includes('resident_1_program_1')) {
      console.log('Dropping old index: resident_1_program_1');
      await coll.dropIndex('resident_1_program_1');
    } else {
      console.log('Old index not present');
    }

    const query = { $or: [ { resident: null }, { program: null } ] };
    const badDocs = await coll.find(query).toArray();
    const badCount = badDocs.length;
    console.log('Found', badCount, 'participation docs with null resident/program');

    if (badCount > 0) {
      // Backup to file before deletion
      const fs = require('fs');
      const backupPath = `./scripts/participations_backup_${Date.now()}.json`;
      fs.writeFileSync(backupPath, JSON.stringify(badDocs, null, 2));
      console.log('Backed up documents to', backupPath);

      const res = await coll.deleteMany(query);
      console.log('Deleted', res.deletedCount, 'documents');
    }

    console.log('Creating partial unique index on { resident:1, program:1 }');
    await coll.createIndex(
      { resident: 1, program: 1 },
      { unique: true, partialFilterExpression: { resident: { $type: 'objectId' }, program: { $type: 'objectId' } } }
    );

    console.log('Done — index fixed');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    try { await mongoose.connection.close(); } catch(e){}
    process.exit(1);
  }
})();
