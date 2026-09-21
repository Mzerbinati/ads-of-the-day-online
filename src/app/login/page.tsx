import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Auth is disabled — the archive is public. */
export default function LoginPage() {
  redirect("/");
}
