export const CREATIVE_ROLES = [
  "Art Director",
  "Copywriter",
  "Direttore Creativo",
  "Strategist",
  "Account",
  "Producer",
  "Motion/Video Designer",
  "Graphic Designer",
  "Social Media Manager",
  "Studente",
  "Altro",
] as const;

export type CreativeRole = (typeof CREATIVE_ROLES)[number];

export type Profile = {
  id: string;
  displayName: string | null;
  username: string | null;
  creativeRole: string | null;
  creativeRoleOther: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  if (!profile.displayName?.trim()) return false;
  if (!profile.username?.trim()) return false;
  if (!profile.creativeRole?.trim()) return false;
  if (profile.creativeRole === "Altro" && !profile.creativeRoleOther?.trim()) {
    return false;
  }
  return true;
}

export function slugifyUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(username) && username.length >= 3;
}
