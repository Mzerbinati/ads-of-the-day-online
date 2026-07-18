import type { Campaign } from "./types";

export const DETAILS_VERSION = "4";

function parseAgencyLocation(agency: string): string | null {
  const stopWords = new Set([
    "BBDO",
    "TBWA",
    "DDB",
    "FCB",
    "HAVAS",
    "LEO",
    "OGILVY",
    "MCCANN",
    "PUBLICIS",
    "WPP",
    "AND",
    "THE",
  ]);
  const parts = agency.trim().split(/\s+/);
  const last = parts[parts.length - 1]?.replace(/[^A-ZÀ-Ü/\\-]/gi, "") ?? "";

  if (last.length >= 4 && last === last.toUpperCase() && !stopWords.has(last)) {
    return last.charAt(0) + last.slice(1).toLowerCase();
  }

  return null;
}

function describeAgencyNetwork(agency: string): string | null {
  const upper = agency.toUpperCase();
  if (upper.includes("BBDO")) return "network BBDO";
  if (upper.includes("TBWA")) return "network TBWA";
  if (upper.includes("DDB")) return "network DDB";
  if (upper.includes("FCB")) return "network FCB";
  if (upper.includes("OGILVY")) return "network Ogilvy";
  if (upper.includes("MCCANN")) return "network McCann";
  if (upper.includes("PUBLICIS")) return "network Publicis";
  if (upper.includes("HAVAS")) return "network Havas";
  if (upper.includes("LEO")) return "network Leo";
  if (upper.includes("72ANDSUNNY")) return "72andSunny";
  if (upper.includes("WIEDEN")) return "Wieden+Kennedy";
  if (upper.includes("DAVID")) return "DAVID";
  return null;
}

function buildAgencySection(campaign: Campaign): string {
  const location = parseAgencyLocation(campaign.agency);
  const network = describeAgencyNetwork(campaign.agency);
  const lines = [
    `${campaign.agency} ha ideato e prodotto ${campaign.title} per ${campaign.brand}.`,
  ];

  if (network && location) {
    lines.push(
      `È l'ufficio ${location} del ${network}, tra i team che hanno portato il progetto in giuria a Cannes ${campaign.year}.`
    );
  } else if (location) {
    lines.push(
      `Studio con base a ${location}, referente creativo del progetto per ${campaign.brand}.`
    );
  } else if (network) {
    lines.push(`Agenzia del ${network} dietro lo sviluppo creativo del case.`);
  } else {
    lines.push(
      `Referente creativo del progetto, dalla concept phase alla produzione del case.`
    );
  }

  lines.push(
    "",
    "Crediti tipici da cercare nel case ufficiale:",
    "· Executive / Creative Director",
    "· Art Director · Copywriter",
    "· Strategy · Account",
    "· Regia · Production house"
  );

  return lines.join("\n");
}

function buildProjectSummary(campaign: Campaign): string {
  const title = campaign.title.toLowerCase();
  const brand = campaign.brand;
  const category = campaign.category.toLowerCase();

  let angle: string;

  if (title.includes("history") || title.includes("untaught")) {
    angle = `${brand} usa il proprio medium editoriale per recuperare storie dimenticate o mai raccontate, trasformando contenuto in cultura e conversazione.`;
  } else if (title.includes("haven") || title.includes("safe")) {
    angle = `Il progetto mette al centro protezione e fiducia: traduce un bisogno emotivo del target in un racconto visivo forte per ${brand}.`;
  } else if (title.includes("coffee") || title.includes("shop")) {
    angle = `Un'idea di product storytelling: avvicina ${brand} alla vita quotidiana delle persone con un dettaglio concreto e memorabile.`;
  } else if (category.includes("activation") || category.includes("experience")) {
    angle = `Campagna-activation: ${brand} esce dal media tradizionale per creare un'esperienza partecipata attorno al concept ${campaign.title}.`;
  } else if (category.includes("craft") || category.includes("design")) {
    angle = `Execution e craft al centro: ogni dettaglio visivo e produttivo sostiene l'idea e la rende immediatamente riconoscibile per ${brand}.`;
  } else if (category.includes("media") || category.includes("direct")) {
    angle = `Soluzione media-smart: l'idea sfrutta formato, timing e contesto per massimizzare impatto e efficienza del messaggio ${brand}.`;
  } else if (campaign.tier.includes("GRAND PRIX") || campaign.tier === "TITANIUM") {
    angle = `Progetto di altissimo profilo: unisce insight di categoria, idea distintiva ed execution impeccabile per ${brand}.`;
  } else {
    angle = `${campaign.title} risponde a un brief di ${brand} con un'idea chiara nella categoria ${category}, premiata ${campaign.tier} a Cannes ${campaign.year}.`;
  }

  return [
    angle,
    "",
    `In sintesi: concept, produzione e risultato in giuria hanno convinto i jurors nella categoria ${campaign.category}.`,
  ].join("\n");
}

export function buildCampaignDetails(campaign: Campaign): {
  team: string;
  idea: string;
  insight: string;
  board: string;
} {
  const team = [
    `Agenzia: ${campaign.agency}`,
    `Brand: ${campaign.brand}`,
    `Categoria Lions: ${campaign.category}`,
    `Anno: ${campaign.year}`,
  ].join("\n");

  const idea = buildAgencySection(campaign);
  const insight = buildProjectSummary(campaign);

  const board = [
    `Premio: ${campaign.tier}`,
    `Anno: ${campaign.year}`,
    `Categoria: ${campaign.category}`,
    `Brand: ${campaign.brand}`,
    `Agenzia: ${campaign.agency}`,
    "",
    `Link case → ${campaign.url}`,
    `Sorgente catalogo → ${campaign.raw}`,
  ].join("\n");

  return { team, idea, insight, board };
}

export function isLegacyDetails(campaign: Campaign): boolean {
  const idea = campaign.idea ?? "";
  const insight = campaign.insight ?? "";
  const board = campaign.board ?? "";

  return (
    idea.includes("ha conquistato un") ||
    idea.includes("territorio creativo") ||
    idea.includes("Ruoli tipici del team") ||
    idea.includes("Per completare questa scheda") ||
    idea.includes("è l'agenzia dietro") ||
    insight.includes("mercato saturo") ||
    insight.includes("Il territorio") ||
    insight.includes("parte da un problema concreto del brand") ||
    insight.includes("è un progetto general per") ||
    board.includes("MOOD & RIFERIMENTI") ||
    board.includes("Tono: premium") ||
    board.includes("ALTRE INFO —")
  );
}

export function needsDetails(campaign: Campaign): boolean {
  return (
    !campaign.team ||
    !campaign.idea ||
    !campaign.insight ||
    !campaign.board ||
    isLegacyDetails(campaign)
  );
}
