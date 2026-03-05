import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY || "";
const baseId = "appeJqZ5yjyPmh1MC";
const base = new Airtable({ apiKey }).base(baseId);

const TABLES = {
  LEADS: "tblXC5DVlvsecX8GC",
  CONVERSATIONS: "tblHHtMcNrH9RocXN",
  TASKS: "tblXlsLiHhXudrd7h",
  CHECKOUTS: "tblOwBkOONytvWDwi",
  REGISTRATIONS: "tblF6gLxCuiNF7uni",
};

async function seedDemoData() {
  console.log("Seeding demo data...");

  // 1. Create a Lead
  const leadRecord = await base(TABLES.LEADS).create({
    "Full Name": "Sarah Jenkins",
    "Email": "s.jenkins@brightfutureai.com",
    "Phone": "+15550198273",
    "phone_e164": "+15550198273",
    "primary_channel": "sms",
    "Sales Stage": "Close",
    "Lead Score": 95,
  });
  console.log(`Created Lead: ${leadRecord.id}`);

  // 2. Create Conversations (A realistic back-and-forth)
  const timestamps = [
    new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    new Date(Date.now() - 1000 * 60 * 58 * 2).toISOString(),
    new Date(Date.now() - 1000 * 60 * 55 * 2).toISOString(),
    new Date(Date.now() - 1000 * 60 * 50 * 2).toISOString(),
    new Date(Date.now() - 1000 * 60 * 48 * 2).toISOString(),
    new Date(Date.now() - 1000 * 60 * 5 * 2).toISOString(), // 10 mins ago
  ];

  await base(TABLES.CONVERSATIONS).create([
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "SMS",
        "Direction": "Inbound",
        "Content": "Hey, I saw your ad on Facebook about the AI automation tools. What exactly does the EdgeMax Core include?",
        "Timestamp": timestamps[0],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "SMS",
        "Direction": "Outbound",
        "Content": "Hi Sarah! Thanks for reaching out. The EdgeMax AI CORE ($199) is our foundation package. It includes comprehensive AI automation tools, integration with your existing systems, and advanced analytics reporting. \n\nAre there any specific bottlenecks in your business you're looking to solve?",
        "Timestamp": timestamps[1],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "SMS",
        "Direction": "Inbound",
        "Content": "Mostly just lead follow-up. I'm losing track of people who don't buy immediately.",
        "Timestamp": timestamps[2],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "SMS",
        "Direction": "Outbound",
        "Content": "EdgeMax CORE handles exactly that. It can automatically route your leads, trigger personalized follow-ups, and even handle objections directly via SMS or Messenger before a human ever needs to step in.\n\nWould you like me to send over the link to get started?",
        "Timestamp": timestamps[3],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "SMS",
        "Direction": "Inbound",
        "Content": "Yeah, that sounds perfect. Let's do it. My email is s.jenkins@brightfutureai.com",
        "Timestamp": timestamps[4],
      }
    },
    {
      fields: {
        "Lead": [leadRecord.id],
        "Channel": "SMS",
        "Direction": "Outbound",
        "Content": "Awesome! Here is your secure payment link to get set up with the EdgeMax AI CORE:\n\n[Complete Your Purchase - $199](https://buy.stripe.com/test_12345)\n\nOnce completed, I'll send over the onboarding documentation.",
        "Timestamp": timestamps[5],
      }
    }
  ]);
  console.log("Seeded Conversation History.");

  // 3. Create a Checkout Record
  await base(TABLES.CHECKOUTS).create({
    "Checkout Title": "Edge Core - s.jenkins@brightfutureai.com",
    "Lead": [leadRecord.id],
    "Stripe Checkout ID": "cs_test_b1Z...",
    "Amount": 199,
    "Status": "Pending"
  });
  console.log("Seeded Checkout.");

  // 4. Create a Follow-up Task
  await base(TABLES.TASKS).create({
    "Task Name": "Verify Onboarding Completion",
    "Lead": [leadRecord.id],
    "Due At": new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    "Reason": "Ensure the client completed the Stripe checkout and received the onboarding email payload.",
    "Status": "Open"
  });
  console.log("Seeded Follow-up Task.");

  console.log("Demo environment seeded successfully!");
}

seedDemoData().catch(console.error);
