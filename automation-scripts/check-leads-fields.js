const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function checkLeadsFields() {
  try {
    const records = await base('tblXC5DVlvsecX8GC').select({
      maxRecords: 10
    }).firstPage();

    records.forEach(record => {
        console.log(`Record ID: ${record.id}`);
        console.log('Fields:', Object.keys(record.fields));
        console.log('---');
    });
  } catch (err) {
    console.error(err);
  }
}

checkLeadsFields();
