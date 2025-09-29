// Static member image mapping (structured like captain images) 
// Keys use slug form of member names (lowercase, hyphenated)
import type { TeamColor } from './rosters';

// Helper slug function kept consistent with MemberCard
function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// NOTE: Some images still use .png in repo (will normalize to .jpg later)
// Only list actual committed files to avoid 404s in production.
export const MEMBER_IMAGES: Record<TeamColor, Record<string, string>> = {
  red: {
    jimmy: '/teams/red/jimmy.jpg',
    allie: '/teams/red/allie.png',
    grams: '/teams/red/grams.png',
  },
  orange: {
    tyler: '/teams/orange/tyler.png',
    brandon: '/teams/orange/brandon.png',
    // zack image missing - fallback will use initial
  },
  yellow: {
    becca: '/teams/yellow/becca.png',
    tanner: '/teams/yellow/tanner.png',
  },
  green: {
    allyssa: '/teams/green/allyssa.jpg',
    gramps: '/teams/green/gramps.jpg',
    natalie: '/teams/green/natalie.jpg',
  },
  blue: {
    garrett: '/teams/blue/garrett.jpg',
    jason: '/teams/blue/jason.jpg',
  },
  purple: {
    kyle: '/teams/purple/kyle.jpg',
    leah: '/teams/purple/leah.jpg',
    grammie: '/teams/purple/grammie.jpg',
  },
};

export function getMemberImage(color: TeamColor, name: string) {
  const slug = slugify(name);
  return MEMBER_IMAGES[color]?.[slug];
}
