import type { Profile } from "@/lib/profile";

export function formatCreativeRole(profile: Pick<Profile, "creativeRole" | "creativeRoleOther">): string | null {
  if (!profile.creativeRole?.trim()) return null;
  if (profile.creativeRole === "Altro") {
    return profile.creativeRoleOther?.trim() || "Altro";
  }
  return profile.creativeRole;
}
