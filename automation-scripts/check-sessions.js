const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function checkSessions() {
  try {
    const records = await base('Live Sessions').select({
      maxRecords: 10,
      view: 'Grid view'
    }).firstPage();

    console.log('--- Live Sessions ---');
    records.forEach(record => {
      console.log(`ID: ${record.id}`);
      console.log(`Title: ${record.get('Title')}`);
      console.log(`Date: ${record.get('Date')}`);
      console.log(`Google Event ID: ${record.get('Google Event ID')}`);
      console.log(`Status: ${record.get('Status')}`);
      console.log('---');
    });
  } catch (err) {
    console.error(err);
  }
}

checkSessions();
