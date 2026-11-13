/**
 * Script to wipe all recorded visits and follow-ups.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const db = require('../db/database');

console.log('Wiping all stored health records and follow-ups...');
db.deleteAll();
console.log('Database successfully wiped.');
