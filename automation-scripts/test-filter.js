const Airtable = require('airtable');
const apiKey = process.env.AIRTABLE_API_KEY || "";
const base = new Airtable({apiKey: apiKey}).base('appeJqZ5yjyPmh1MC');

async function test() {
    try {
        const lead = await base('tblXC5DVlvsecX8GC').find('recnslu7PwIUBewcU');
        const convoIds = lead.get('Conversations') || [];
        console.log("Convo IDs:", convoIds);
        
        if (convoIds.length > 0) {
            const formula = `OR(${convoIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
            const records = await base('tblHHtMcNrH9RocXN').select({
                filterByFormula: formula
            }).firstPage();
            console.log("Fetched records:", records.length);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
