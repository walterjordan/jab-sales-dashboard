/**
 * PERMANENT SCRIPT: maintain_progression.ts
 * 
 * Purpose:
 * This script ensures that all participant leveling fields (Current Level Number, Next Level, etc.)
 * are kept in sync with their effective XP (Calculated XP or Total XP fallback).
 * 
 * It specifically maintains two critical Linked Record fields in Airtable:
 * 1. "Eligible Levels" - Links to all levels the participant has achieved.
 * 2. "Next Level Record" - Links to the single next level they are working towards.
 * 
 * These linked records drive the lookup/formula fields:
 * - Current Level Number (Formula based on Eligible Levels)
 * - Next Level (Lookup/Formula based on Next Level Record)
 * - Next Level Number (Lookup based on Next Level Record)
 * - Next Level XP Threshold (Lookup based on Next Level Record)
 * 
 * Usage:
 * Run this script periodically (e.g., nightly via cron or Make.com) or ensure the 
 * Airtable "Eligible Levels Automation" covers both Eligible Levels AND Next Level Record updates.
 */

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

async function syncParticipantLevels() {
  console.log('Starting Participant Level Sync...');
  
  try {
    // 1. Fetch Levels
    const levelRecords = await base('Levels').select({
      sort: [{ field: 'Level Number', direction: 'asc' }]
    }).all();

    const levelsMap = levelRecords.map(r => ({
      id: r.id,
      number: r.get('Level Number') as number,
      title: r.get('Level Title') as string,
      threshold: r.get('XP Threshold') as number
    })).filter(l => l.number !== undefined);

    console.log(`Loaded ${levelsMap.length} levels.`);

    // 2. Fetch all Participants (or those needing update)
    // For large bases, you might want to filter, but let's do all for now or first page
    const participants = await base('Participants').select().all();
    console.log(`Processing ${participants.length} participants...`);

    for (const participant of participants) {
      const name = participant.get('Full Name');
      // Source of Truth: Calculated XP (Rollup from XP Ledger)
      const effectiveXp = Number(participant.get('Calculated XP') || 0);

      const currentEligibleLevelIds = (participant.get('Eligible Levels') as string[]) || [];
      const currentNextLevelRecordIds = (participant.get('Next Level Record') as string[]) || [];

      // Determine eligible levels based on effectiveXp
      const eligibleLevels = levelsMap.filter(l => effectiveXp >= l.threshold);
      const eligibleLevelIds = eligibleLevels.map(l => l.id);
      
      const currentLevelNum = eligibleLevels.length > 0 ? Math.max(...eligibleLevels.map(l => l.number)) : 0;
      const nextLevel = levelsMap.find(l => l.number === currentLevelNum + 1);
      const nextLevelRecordId = nextLevel ? [nextLevel.id] : [];

      // Check if update is needed
      const eligibleLevelsChanged = JSON.stringify(currentEligibleLevelIds.sort()) !== JSON.stringify(eligibleLevelIds.sort());
      const nextLevelChanged = JSON.stringify(currentNextLevelRecordIds) !== JSON.stringify(nextLevelRecordId);

      if (eligibleLevelsChanged || nextLevelChanged) {
        console.log(`Updating ${name} (XP: ${effectiveXp}, Level: ${currentLevelNum})`);
        
        try {
            await base('Participants').update(participant.id, {
                "Eligible Levels": eligibleLevelIds,
                "Next Level Record": nextLevelRecordId
            });
        } catch (err) {
            console.error(`Failed to update ${name}:`, err);
        }
      }
    }

    console.log('Sync complete.');

  } catch (error) {
    console.error('Error during sync:', error);
  }
}

syncParticipantLevels();
