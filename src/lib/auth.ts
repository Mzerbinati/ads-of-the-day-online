import { redirect } from "next/navigation";
import {
  ensureProfileRow,
  getProfileByUserId,
} from "@/lib/db";
import { isProfileComplete, type Profile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getAuthUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
}

export async function getCurrentProfile(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  const user = await getAuthUser();
  if (!user) return null;
  const profile = await ensureProfileRow(user.id);
  return { user, profile };
}

export async function requireCompleteProfile(): Promise<{
  user: User;
  profile: Profile;
}> {
  const user = await requireUser();
  const profile = await ensureProfileRow(user.id);
  if (!isProfileComplete(profile)) {
    redirect("/onboarding");
  }
  return { user, profile };
}

export async function getProfileOrNull(
  userId: string
): Promise<Profile | null> {
  return getProfileByUserId(userId);
}
