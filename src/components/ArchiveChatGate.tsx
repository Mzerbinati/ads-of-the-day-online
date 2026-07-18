import { getAuthUser } from "@/lib/auth";
import { ArchiveChat } from "@/components/ArchiveChat";

export async function ArchiveChatGate() {
  const user = await getAuthUser();
  if (!user) return null;
  return <ArchiveChat />;
}
