// src/lib/rosters.ts
// Central roster + helper utilities
export type TeamColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export interface TeamRoster {
  color: TeamColor;
  teamName: string;
  captain: string;
  members: string[]; // excludes captain (captain listed separately)
  captainImage: string; // path under /public/captains
}

export const ROSTERS: TeamRoster[] = [
  { color: "red", teamName: "Red", captain: "Mandi Kelly", members: ["Jimmy", "Allie", "Grams"], captainImage: "/captains/mandi-kelly.jpg" },
  { color: "yellow", teamName: "Yellow", captain: "Dalton Kelly", members: ["Becca", "Tanner"], captainImage: "/captains/dalton-kelly.jpg" },
  { color: "blue", teamName: "Blue", captain: "Amaryllis Zanotelli", members: ["Garrett", "Jason"], captainImage: "/captains/amaryllis-zanotelli.jpg" },
  { color: "orange", teamName: "Orange", captain: "Tim Zanotelli", members: ["Tyler", "Brandon", "Zack"], captainImage: "/captains/tim-zanotelli.jpg" },
  { color: "green", teamName: "Green", captain: "Luke Kelly", members: ["Allyssa", "Gramps", "Natalie"], captainImage: "/captains/luke-kelly.jpg" },
  { color: "purple", teamName: "Purple", captain: "Lexie Curtis", members: ["Kyle", "Leah", "Grammie"], captainImage: "/captains/lexie-curtis.jpg" },
];

export function getRoster(color: string): TeamRoster | undefined {
  return ROSTERS.find(r => r.color === color);
}

// Utility to build member image path; expects you to upload images at /public/members/{color}/{slug}.jpg
export function memberImagePath(color: TeamColor, memberName: string) {
  const slug = memberName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `/members/${color}/${slug}.jpg`;
}

// Deprecated: teamMemberImagePath removed after consolidation to /public/captains for all member photos.
