async function run() {
  try {
    const response = await fetch("https://api.airtable.com/v0/meta/bases/appeJqZ5yjyPmh1MC/tables", {
      headers: {
        "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });
    
    const data = await response.json();
    data.tables.forEach(t => {
      console.log(`${t.id} : ${t.name}`);
    });
  } catch (err) {
    console.error(err.message);
  }
}

run();