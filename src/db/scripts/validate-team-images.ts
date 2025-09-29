#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { ROSTERS, type TeamColor } from '@/lib/rosters';

interface Issue { level: 'error' | 'warn'; message: string; }

// Minimal magic number detection for quick validation
function sniffMagic(filePath: string): 'jpeg' | 'png' | 'other' | 'missing' {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(10);
    const bytes = fs.readSync(fd, buf, 0, 10, 0);
    fs.closeSync(fd);
    if (bytes < 4) return 'other';
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'jpeg';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'png';
    return 'other';
  } catch { return 'missing'; }
}

const allowedExt = ['.png','.jpg','.jpeg','.webp','.avif'];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function collect(): Issue[] {
  const issues: Issue[] = [];
  const publicDir = path.join(process.cwd(),'public');
  const teamsDirLower = path.join(publicDir,'teams');
  const teamsDirUpper = path.join(publicDir,'Teams');

  const hasLower = fs.existsSync(teamsDirLower);
  const hasUpper = fs.existsSync(teamsDirUpper);

  if (hasUpper && !hasLower) {
    issues.push({ level: 'error', message: 'Found directory public/Teams (capital T). Rename to public/teams for case-sensitive deploys.' });
  } else if (hasUpper && hasLower) {
    issues.push({ level: 'error', message: 'Both public/Teams and public/teams exist. Consolidate into one lowercase public/teams.' });
  } else if (!hasLower) {
    issues.push({ level: 'warn', message: 'No public/teams directory found. Skipping image presence checks.' });
    return issues; // nothing else to do
  }

  // Map color -> files (slug -> fileName)
  const colorDirs = fs.readdirSync(teamsDirLower, { withFileTypes: true }).filter(d=>d.isDirectory());
  const fileIndex: Record<string, string[]> = {};
  for (const dir of colorDirs) {
    const color = dir.name as TeamColor;
    const full = path.join(teamsDirLower, dir.name);
    const files = fs.readdirSync(full).filter(f => allowedExt.includes(path.extname(f).toLowerCase()));
    fileIndex[color] = files;
  }

  // Placeholder & magic checks
  for (const [color, files] of Object.entries(fileIndex)) {
    for (const f of files) {
      const full = path.join(teamsDirLower, color, f);
      let stat: fs.Stats | null = null;
      try { stat = fs.statSync(full); } catch { /* ignore */ }
      if (!stat) continue;
      // Tiny file heuristic: < 500 bytes OR exactly 67 bytes (common 1x1 png here)
      if (stat.size < 500) {
        issues.push({ level: 'warn', message: `Suspicious tiny image (potential placeholder) teams/${color}/${f} size=${stat.size}B` });
      }
      const ext = path.extname(f).toLowerCase();
      const magic = sniffMagic(full);
      if (magic === 'jpeg' && ext !== '.jpg' && ext !== '.jpeg') {
        issues.push({ level: 'warn', message: `Extension mismatch: JPEG content but file extension ${ext} at teams/${color}/${f}` });
      } else if (magic === 'png' && ext !== '.png') {
        issues.push({ level: 'warn', message: `Extension mismatch: PNG content but file extension ${ext} at teams/${color}/${f}` });
      } else if (magic === 'other') {
        issues.push({ level: 'warn', message: `Unrecognized image magic for teams/${color}/${f}` });
      }
    }
  }

  for (const roster of ROSTERS) {
    const expectedMembers = roster.members;
    const color = roster.color;
    const files = fileIndex[color] || [];
    const foundSlugs = new Set(files.map(f => f.replace(/\.[^.]+$/, '').toLowerCase()));

    for (const member of expectedMembers) {
      const slug = slugify(member);
      if (!foundSlugs.has(slug)) {
        issues.push({ level: 'warn', message: `Missing image for ${member} (team ${color}) expected one of: ${slug + allowedExt[0]}` });
      }
    }

    // Extra images not in roster
    for (const file of files) {
      const base = file.replace(/\.[^.]+$/, '');
      const displayName = base.split('-').map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(' ');
      if (!expectedMembers.some(m => slugify(m) === base.toLowerCase())) {
        issues.push({ level: 'warn', message: `Extra image file not in roster list for team ${color}: ${file} (derived name: ${displayName})` });
      }
    }
  }

  // Uppercase extension check
  for (const [color, files] of Object.entries(fileIndex)) {
    for (const f of files) {
      if (/[A-Z]/.test(path.extname(f))) {
        issues.push({ level: 'warn', message: `File has uppercase extension: teams/${color}/${f}` });
      }
    }
  }

  return issues;
}

const issues = collect();
const errors = issues.filter(i=>i.level==='error');
const warns = issues.filter(i=>i.level==='warn');

if (issues.length === 0) {
  console.log('✅ Team image validation passed with no issues.');
  process.exit(0);
}

for (const e of errors) console.error('ERROR:', e.message);
for (const w of warns) console.warn('WARN:', w.message);

if (errors.length > 0) process.exit(1);
console.log(`\nSummary: ${errors.length} error(s), ${warns.length} warning(s).`);
