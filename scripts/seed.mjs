#!/usr/bin/env node
/* Seed PocketBase with example datasets */
import fs from 'node:fs/promises';

const PB_URL = process.env.PB_URL;
const PB_TOKEN = process.env.PB_TOKEN;

if (!PB_URL || !PB_TOKEN) {
  console.error('Missing PB_URL or PB_TOKEN environment variables');
  process.exit(1);
}

async function postRecord(collection, item) {
  const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed POST ${collection}: ${res.status} ${text}`);
  }
  return res.json();
}

async function loadJSON(path) {
  const raw = await fs.readFile(new URL(path, import.meta.url));
  return JSON.parse(raw.toString());
}

function fillJobPlaceholders(arr, ids) {
  const map = {};
  ids.forEach((id, idx) => { map[`{JOB_ID_${idx+1}}`] = id; });
  return arr.map((it) => {
    const copy = { ...it };
    if (typeof copy.job_id === 'string' && map[copy.job_id]) copy.job_id = map[copy.job_id];
    return copy;
  });
}

async function main() {
  console.log('Seeding PocketBase at', PB_URL);
  const base = '../scripts/data/';

  // 1) jobs first (capture ids)
  const MODALITY_ALLOWED = new Set(["full_time","part_time","freelance","per_hour","temporary"]);
  function fixJob(job) {
    const copy = { ...job };
    if (!MODALITY_ALLOWED.has(copy.modality)) {
      copy.modality = copy.price_unit === 'hour' ? 'per_hour' : 'freelance';
    }
    if (Array.isArray(copy.images) && copy.images.length === 0) delete copy.images;
    if (typeof copy.expires_at === 'string') copy.expires_at = copy.expires_at.replace('.000Z','Z');
    return copy;
  }

  const jobsRaw = await loadJSON(base + 'jobs.json');
  const jobs = jobsRaw.map(fixJob);
  const jobIds = [];
  for (const j of jobs) {
    const { id } = await postRecord('jobs', j);
    jobIds.push(id);
  }
  console.log('Created jobs:', jobIds.join(', '));

  // 2) simple collections
  const interests = await loadJSON(base + 'interests.json');
  for (const it of interests) await postRecord('interests', it);
  console.log('Created interests:', interests.length);

  const portfolios = await loadJSON(base + 'portfolios.json');
  for (const p of portfolios) await postRecord('portfolios', p);
  console.log('Created portfolios:', portfolios.length);

  const weekly = await loadJSON(base + 'weekly_availabilities.json');
  for (const w of weekly) await postRecord('weekly_availabilities', w);
  console.log('Created weekly_availabilities:', weekly.length);

  // 3) dependent on job ids
  const reviewsRaw = await loadJSON(base + 'reviews.json');
  const reviews = fillJobPlaceholders(reviewsRaw, jobIds);
  for (const r of reviews) await postRecord('reviews', r);
  console.log('Created reviews:', reviews.length);

  const savesRaw = await loadJSON(base + 'saves.json');
  const saves = fillJobPlaceholders(savesRaw, jobIds);
  for (const s of saves) await postRecord('saves', s);
  console.log('Created saves:', saves.length);

  const logsRaw = await loadJSON(base + 'whatsapp_logs.json');
  const logs = fillJobPlaceholders(logsRaw, jobIds);
  for (const l of logs) await postRecord('whatsapp_logs', l);
  console.log('Created whatsapp_logs:', logs.length);

  console.log('Seed completed successfully.');
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
