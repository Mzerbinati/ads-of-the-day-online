import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getAuthUser();
  if (user) redirect("/");

  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/";

  return (
    <div className="mx-auto flex min-h-screen max-w-[960px] flex-col justify-center px-6 py-16">
      <div className="glass-panel mx-auto w-full max-w-lg p-8 md:p-10">
        <p className="label mb-3">Accesso</p>
        <h1 className="headline mb-3 text-[32px] md:text-[40px]">
          Entra in ADS of the day
        </h1>
        <p className="mb-8 text-[15px] text-secondary">
          Accedi con Google o con un magic link via email per vedere la campagna
          del giorno e il tuo archivio personale.
        </p>
        <LoginForm nextPath={nextPath} />
        <p className="mt-8 text-center text-[13px] text-tertiary">
          <Link href="/" className="underline-offset-2 hover:underline">
            Torna alla landing
          </Link>
        </p>
      </div>
    </div>
  );
}
