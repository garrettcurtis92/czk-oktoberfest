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
    jimmy: '/captains/jimmy.jpg',
    allie: '/captains/allie.png', // TODO: replace placeholder with real photo & convert to jpg
    grams: '/captains/grams.png', // TODO: replace placeholder
  },
  orange: {
    tyler: '/captains/tyler.png', // TODO: replace placeholder
    brandon: '/captains/brandon.png', // TODO: replace placeholder
    zack: '/captains/zach.jpg',
  },
  yellow: {
    becca: '/captains/becca.png',
    tanner: '/captains/tanner.png', // TODO: replace placeholder
  },
  green: {
    allyssa: '/captains/allyssa.jpg',
    gramps: '/captains/gramps.jpg',
    natalie: '/captains/natalie.jpg',
  },
  blue: {
    garrett: '/captains/garrett.jpg',
    jason: '/captains/jason.jpg',
  },
  purple: {
    kyle: '/captains/kyle.jpg',
    leah: '/captains/leah.jpg',
    grammie: '/captains/grammie.jpg',
  },
};

export function getMemberImage(color: TeamColor, name: string) {
  const slug = slugify(name);
  return MEMBER_IMAGES[color]?.[slug];
}
