import { NextResponse } from "next/server";
import {
  buildChatArchiveContext,
  searchArchiveCampaigns,
} from "@/lib/chat-context";
import { ensureDatabaseReady } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 120;

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma4:26b";

const SYSTEM_PROMPT = `Sei l'assistente personale di ADS of the day, un archivio locale di campagne pubblicitarie premiate.
Rispondi sempre in italiano, in modo chiaro e conciso (poche frasi, elenchi quando utile).
Aiuti il creativo a ricordare cosa ha già visto, cosa gli è piaciuto (preferiti e voti), e a cercare brand, temi, agenzie o categorie.
Usa SOLO i dati forniti nel contesto archivio e nei risultati di ricerca: non inventare campagne, voti o note.
Se qualcosa non è nell'archivio, dillo chiaramente.
Puoi citare titolo, brand, agenzia, premio, data di visione, voto e note personali.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  try {
    ensureDatabaseReady();
    const body = await request.json();
    const messages = (body.messages ?? []) as ChatMessage[];
    const lastUser = [...messages].reverse().find((m) => m.role === "user");

    if (!lastUser?.content?.trim()) {
      return NextResponse.json({ error: "Messaggio vuoto" }, { status: 400 });
    }

    const archive = buildChatArchiveContext();
    const searchHits = searchArchiveCampaigns(lastUser.content, 15);

    const system = [
      SYSTEM_PROMPT,
      "",
      "### Contesto archivio",
      archive,
      "",
      "### Risultati ricerca legati all'ultima domanda",
      searchHits || "(nessuna corrispondenza aggiuntiva)",
    ].join("\n");

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: "system", content: system },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        options: {
          temperature: 0.3,
          num_ctx: 8192,
        },
      }),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      return NextResponse.json(
        {
          error:
            ollamaRes.status === 404
              ? `Modello ${OLLAMA_MODEL} non trovato. Controlla che Ollama sia attivo.`
              : `Ollama non risponde (${ollamaRes.status}): ${text.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const data = (await ollamaRes.json()) as {
      message?: { content?: string };
    };

    const reply = data.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "Risposta vuota da Ollama" },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore chat sconosciuto";
    const hint = message.includes("ECONNREFUSED")
      ? "Ollama non è in esecuzione. Avvia Ollama e riprova."
      : message;
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
