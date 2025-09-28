import fs from 'node:fs';
import path from 'node:path';
import type { TeamColor } from './rosters';

// Root of the repo relative to this compiled file (app dir). We assume process.cwd() is project root.
const PUBLIC_ROOT = path.join(process.cwd(), 'public', 'teams');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

export interface TeamImageMember {
  color: TeamColor;
  name: string;          // Human display name (from filename)
  slug: string;          // slug (filename without extension)
  imagePath: string;     // public path /teams/{color}/{file}
}

function titleCaseFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export function listTeamImageMembers(color: TeamColor): TeamImageMember[] {
  const folder = path.join(PUBLIC_ROOT, color);
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(folder);
  } catch {
    return [];
  }
  return entries
    .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .map(file => {
      const slug = file.replace(/\.[^.]+$/, '');
      return {
        color,
        name: titleCaseFromSlug(slug),
        slug,
        imagePath: `/teams/${color}/${file}`,
      } as TeamImageMember;
    })
    .sort((a,b)=>a.name.localeCompare(b.name));
}
