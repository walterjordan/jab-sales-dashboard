import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function evaluateLevelingFields() {
  console.log('Evaluating Leveling Fields in Participants Table...');
  
  try {
    // 1. Fetch Levels to understand the mapping
    const levelRecords = await base('Levels').select({
      sort: [{ field: 'Level Number', direction: 'asc' }]
    }).all();

    const levelsMap = levelRecords.map(r => ({
      id: r.id,
      number: r.get('Level Number') as number,
      title: r.get('Level Title') as string,
      threshold: r.get('XP Threshold') as number
    })).filter(l => l.number !== undefined);

    console.log('\n--- Reference Levels ---');
    levelsMap.forEach(l => console.log(`Level ${l.number}: ${l.title} (>= ${l.threshold} XP)`));

    // 2. Fetch Participants
    const participants = await base('Participants').select({
      maxRecords: 20
    }).all();

    console.log('\n--- Participant Evaluation ---');
    
    participants.forEach(p => {
      const name = p.get('Full Name');
      const calculatedXp = Number(p.get('Calculated XP') || 0);
      const currentLevelNum = Number(p.get('Current Level Number') || 0);
      const eligibleLevels = (p.get('Eligible Levels') as string[]) || [];
      const nextLevel = p.get('Next Level');

      // Determine what the level SHOULD be based on Effective XP
      const effectiveXp = calculatedXp;
      
      let expectedLevel = levelsMap[0];
      for (const l of levelsMap) {
        if (effectiveXp >= l.threshold) {
          expectedLevel = l;
        } else {
          break;
        }
      }

      const isInconsistent = currentLevelNum !== expectedLevel.number;

      if (isInconsistent) {
          console.log(`\nParticipant: ${name}`);
          console.log(`- XP: ${calculatedXp}`);
          console.log(`- Current Level: ${currentLevelNum} | Expected: ${expectedLevel.number} [INCONSISTENT]`);
          console.log(`- Eligible Levels Count: ${eligibleLevels.length}`);
          console.log(`- Next Level: ${nextLevel}`);
          
          console.log(`  ! Warning: Current Level Number (${currentLevelNum}) does not match expected level (${expectedLevel.number}).`);
      }
    });

    console.log('\n--- Field Evaluation Summary ---');
    console.log('1. Current Level Number: Dependent on "Eligible Levels" linkage. If automation is broken or slow, this will be stale.');
    console.log('2. Next Level: Formula-based, depends on "Next Level Record".');
    console.log('3. Next Level Number: Simple formula, reliable if Current Level Number is reliable.');
    console.log('4. Next Level XP Threshold: Lookup, reliable if Next Level Record is reliable.');
    console.log('5. Next Level Title: Lookup, reliable if Next Level Record is reliable.');

    console.log('\n--- Recommendations ---');
    console.log('A. Consolidate XP: Choose either "Total XP" or "Calculated XP" as the definitive source. Code prefers Calculated XP.');
    console.log('B. Update Automations: Ensure the "Eligible Levels Automation" monitors the chosen definitive XP field.');
    console.log('C. Next Level Linkage: Implement an automation to populate "Next Level Record" whenever "Current Level Number" changes.');
    console.log('D. Sync Progression Logic: Update src/lib/progression.ts to match Airtable Levels table thresholds.');

  } catch (error) {
    console.error('Error during evaluation:', error);
  }
}

evaluateLevelingFields();
