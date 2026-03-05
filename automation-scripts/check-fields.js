const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function checkFields() {
  try {
    const records = await base('Live Sessions').select({
      maxRecords: 1,
      view: 'Grid view'
    }).firstPage();

    if (records.length > 0) {
      console.log('Available fields:', Object.keys(records[0].fields));
      console.log('Sample record:', records[0].fields);
    } else {
      console.log('No records found.');
    }
  } catch (err) {
    console.error(err);
  }
}

checkFields();
