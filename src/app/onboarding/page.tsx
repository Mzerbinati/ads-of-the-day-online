import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { getCurrentProfile } from "@/lib/auth";
import { isProfileComplete, slugifyUsername } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (isProfileComplete(current.profile)) redirect("/");

  const suggestedUsername = slugifyUsername(
    current.user.user_metadata?.full_name ||
      current.user.email?.split("@")[0] ||
      ""
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-[960px] flex-col justify-center px-6 py-16">
      <div className="glass-panel mx-auto w-full max-w-xl p-8 md:p-10">
        <p className="label mb-3">Primo accesso</p>
        <h1 className="headline mb-3 text-[32px] md:text-[40px]">
          Completa il tuo profilo
        </h1>
        <p className="mb-8 text-[15px] text-secondary">
          Serve una sola volta: così gli altri potranno trovarti e il tuo
          archivio resterà personale.
        </p>
        <OnboardingForm
          initialDisplayName={
            current.profile.displayName ||
            current.user.user_metadata?.full_name ||
            ""
          }
          initialUsername={current.profile.username || suggestedUsername}
        />
      </div>
    </div>
  );
}
