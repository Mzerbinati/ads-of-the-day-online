/** Slug univoco della cartella in DB (tabella folders). */
export const CANNES_CURATED_FOLDER_SLUG = "cannes-oro-platino";

export const CANNES_CURATED_FOLDER_TITLE = "Cannes Oro & Platino";

export const CANNES_CURATED_FOLDER_DESCRIPTION =
  "27 campagne iconiche dal 2015 al 2025 — Oro, Titanium e Grand Prix — con schede pronte per l'analisi (persone, agenzia, insight, altre info).";

export interface CuratedCampaign {
  id: string;
  title: string;
  brand: string;
  agency: string;
  year: string;
  tier: "GOLD" | "TITANIUM" | "GRAND PRIX";
  category: string;
  url: string;
  team: string;
  idea: string;
  insight: string;
  board: string;
}

export const CANNES_CURATED_CAMPAIGNS: CuratedCampaign[] = [
  {
    id: "curated-2015-like-a-girl",
    title: "LIKE A GIRL",
    brand: "ALWAYS",
    agency: "LEO BURNETT CHICAGO",
    year: "2015",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=XjJQBjWYDTs",
    team:
      "Client: Procter & Gamble / Always.\nAgenzia: Leo Burnett Chicago (Judy John, CCO).\nRegia: Lauren Greenfield.\nRuoli chiave: strategy su genere e adolescenza, casting di ragazze 14–16 anni, produzione documentaristica.",
    idea:
      "Trasforma un insulto quotidiano («come una ragazza») in affermazione di forza. Il film intervista bambine, adolescenti e adulti: le prime associano «correre/fight like a girl» a potenza, le altre a debolezza.",
    insight:
      "Brief: ricostruire il significato di «like a girl» nel passaggio alla pubertà, quando crolla l'autostima. Insight: il problema non è il prodotto ma un pregiudizio culturale interiorizzato prima ancora del brand. La campagna rende visibile il momento in cui le ragazze imparano a sentirsi «meno».",
    board:
      "Premio: Gold Film Lions Cannes 2015.\nFormato: film lungo + attivazione social #LikeAGirl.\nPerché studiarla: chiaro arco insight → idea → prova sociale; esempio di brand purpose che non rinuncia alla vendita.\nCategoria: branded content con forte carica emozionale e rilevanza culturale.",
  },
  {
    id: "curated-2015-opt-outside",
    title: "#OPTOUTSIDE",
    brand: "REI",
    agency: "VENABLES BELL & PARTNERS",
    year: "2015",
    tier: "TITANIUM",
    category: "Outdoor Lions",
    url: "https://www.youtube.com/watch?v=TK-xg0E8c0g",
    team:
      "Client: REI (co-op outdoor USA).\nAgenzia: Venables Bell & Partners, San Francisco.\nCEO REI Jerry Stritzke in prima linea sul rischio reputazionale.\nMedia e PR integrati: chiusura fisica dei negozi il Black Friday.",
    idea:
      "REI chiude tutti i negozi il giorno di shopping più redditizio d'anno e invita a uscire all'aperto con #OptOutside. Nessuno sconto: solo un gesto di coerenza con il brand.",
    insight:
      "Il Black Friday contraddice i valori outdoor di REI. Invece di competere sul prezzo, il brand rifiuta il gioco e trasforma l'astensione in evento culturale. Insight: quando il tuo nemico è il consumismo impulsivo, la prova più credibile è non vendere.",
    board:
      "Premio: Titanium / Grand Prix Outdoor Lions 2015.\nRisultato: milioni di persone all'aperto, partner gratis (Strava, Subaru).\nLezione: idea media che è anche business decision — difficile da copiare.\nAnalisi utile su allineamento brand–azione–distribuzione.",
  },
  {
    id: "curated-2016-dear-16-year-old-me",
    title: "DEAR 16-YEAR-OLD ME",
    brand: "MELANOMA INSTITUTE AUSTRALIA",
    agency: "BANJO ADVERTISING",
    year: "2016",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=_4jgUcxbXD4",
    team:
      "Client: Melanoma Institute Australia.\nAgenzia: Banjo Advertising, Perth.\nSoggetti reali: sopravvissuti al melanoma.\nProduzione: testimonianze dirette in camera, zero fiction.",
    idea:
      "Persone che hanno avuto il melanoma si rivolgono al sé adolescente con un solo consiglio: proteggiti dal sole. Struttura epistolare «caro me a 16 anni».",
    insight:
      "I giovani non percepiscono il rischio cancro come reale. L'insight è usare il futuro sé come specchio: chi è sopravvissuto ha autorità che nessun medico in white coat può eguagliare. La paura diventa empatia, non terrorismo.",
    board:
      "Premio: Gold Film Lions 2016.\nTone: crudo, documentaristico, zero glamour.\nDa analizzare: come un tema sanitario diventa narrativa personale.\nProduzione low-cost, idea ad alta credibilità.",
  },
  {
    id: "curated-2017-fearless-girl",
    title: "FEARLESS GIRL",
    brand: "STATE STREET GLOBAL ADVISORS",
    agency: "MCCANN NEW YORK",
    year: "2017",
    tier: "TITANIUM",
    category: "Outdoor Lions",
    url: "https://www.youtube.com/watch?v=VQhKO8os9HA",
    team:
      "Client: State Street Global Advisors.\nAgenzia: McCann New York.\nScultura: Kristen Visbal.\nMedia: installazione notturna davanti al Charging Bull di Wall Street.",
    idea:
      "Statua di una bambina a mani sui fianchi di fronte al toro di bronzo. Messaggio: le aziende con donne in board performano meglio — invito a investire nell'indice SHE.",
    insight:
      "Il finance parla a uomini in giacca: serve un simbolo semplice e fotografabile che riaccenda il dibattito su gender parity. L'oggetto urbano diventa PR globale senza media spend tradizionale.",
    board:
      "Premio: Titanium / Grand Prix Outdoor 2017.\nControversie: copyright artista del Bull, rimozione — parte del caso.\nStudio su ambient media, attivismo e finance.\nForte componente PR e conversazione culturale.",
  },
  {
    id: "curated-2017-retail-therapy",
    title: "RETAIL THERAPY",
    brand: "IKEA",
    agency: "ÅKESTAM HOLST",
    year: "2017",
    tier: "GOLD",
    category: "Media Lions",
    url: "https://www.youtube.com/watch?v=Z7PlUGbsXl4",
    team:
      "Client: IKEA Svezia.\nAgenzia: Åkestam Holst, Stoccolma.\nDigital: renaming prodotti sul sito in base a problemi relazionali googlati.\nCopywriting data-driven.",
    idea:
      "I nomi dei prodotti IKEA sul sito vengono rinominati con le ricerche più frequenti su Google («come dire alla moglie che…», «come chiedere scusa»). Ogni prodotto diventa consiglio di vita mascherato da e-commerce.",
    insight:
      "La gente cerca soluzioni emotive online, non solo mobili. IKEA intercetta intent di ricerca reali e risponde con ironia e utilità, dimostrando di capire la vita domestica oltre il catalogo.",
    board:
      "Premio: Gold Media Lions 2017.\nFormato: SEO + copy + e-commerce live.\nPerfetta per analisi media idea: niente TV, tutto search behavior.\nEsempio di product come risposta a un bisogno non dichiarato.",
  },
  {
    id: "curated-2017-blood-normal",
    title: "BLOOD NORMAL",
    brand: "LIBRESSE / BODYFORM",
    agency: "AMV BBDO",
    year: "2017",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=kOEVszzdEPs",
    team:
      "Client: Essity (Libresse/Bodyform).\nAgenzia: AMV BBDO London.\nRegia: Daniel Wolfe.\nCasting: donne reali, sangue mestruale mostrato senza euphemism blue liquid.",
    idea:
      "Per la prima volta in TV mainstream il sangue del ciclo è rosso e reale. Messaggio: il ciclo è normale, smettiamo di nasconderlo.",
    insight:
      "Decenni di pubblicità igienica hanno usato liquido blu — un codice che dice «questo è imbarazzante». L'insight è che la normalizzazione passa dalla rappresentazione visiva letterale, non dal claim.",
    board:
      "Premio: Gold Film Lions 2017.\nImpatto: cambio policy broadcaster, onda di brand femcare.\nDa studiare: tabù culturale vs. execution coraggiosa.\nCategoria purpose-driven con rischio reputazionale alto.",
  },
  {
    id: "curated-2018-palau-pledge",
    title: "PALAU PLEDGE",
    brand: "PALAU GOVERNMENT",
    agency: "HOST/HAVAS SYDNEY",
    year: "2018",
    tier: "GRAND PRIX",
    category: "Direct Lions",
    url: "https://www.youtube.com/watch?v=BickMFHAeRKk",
    team:
      "Client: Governo di Palau + tourism board.\nAgenzia: Host/Havas Sydney.\nLegal: stampa sul passaporto, accordi con compagnie aeree.\nProduzione: documentario ambientale.",
    idea:
      "Ogni turista firma un «pledge» stampato sul passaporto: rispettare l'ambiente di Palau, pena multa. Il visto diventa contratto etico.",
    insight:
      "Il turismo di massa distrugge l'ecosistema che attrae visitatori. Invece di pubblicità turistica classica, Palau trasforma l'ingresso nel paese in momento educativo vincolante.",
    board:
      "Premio: Grand Prix Direct Lions 2018.\nSistema: policy + design + comunicazione.\nCaso iconico di advertising che cambia regole, non solo percezione.\nAnalisi su design del touchpoint e governance.",
  },
  {
    id: "curated-2018-black-supermarket",
    title: "BLACK SUPERMARKET",
    brand: "CARREFOUR",
    agency: "MARCEL PARIS",
    year: "2018",
    tier: "TITANIUM",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=6ZJ4wPme2i8",
    team:
      "Client: Carrefour France.\nAgenzia: Marcel (Publicis) Paris.\nProduzione: riprese nei campi di produttori afro-francesi esclusi dalla GDO.\nAdvocacy: lobby per legge etichettatura origine.",
    idea:
      "Carrefour crea un «supermercato nero» — scaffali dedicati a prodotti di agricoltori discriminati — e spinge una legge per obbligare i retailer a vendere prodotti afro-caribei.",
    insight:
      "La diversità alimentare francese è culturale ma i produttori neri non entrano nella grande distribuzione. Il brand usa la sua scala commerciale come leva politica, non come spot sentimentale.",
    board:
      "Premio: Titanium / Grand Prix 2018.\nRisultato: legge votata, SKU in store.\nStudio su retail activism e brand come infrastruttura.\nForte integrazione PR, film, punto vendita.",
  },
  {
    id: "curated-2018-kfc-fck",
    title: "FCK",
    brand: "KFC",
    agency: "MOTHER LONDON",
    year: "2018",
    tier: "GOLD",
    category: "Print & Publishing Lions",
    url: "https://www.youtube.com/watch?v=J0gInxKxP0Y",
    team:
      "Client: KFC UK.\nAgenzia: Mother London.\nCrisis team: shortage pollo → chiusura temporanea 900 ristoranti.\nMedia: full-page newspaper ad, social immediato.",
    idea:
      "Annuncio stampa con secchio KFC e lettering FCK invece di KFC — scuse ironiche per la crisi scorte. Typo intenzionale come umiltà di marca.",
    insight:
      "In una crisi, il silenzio o il corporate speak peggiorano tutto. KFC abbraccia il fallimento con tono britannico autoironico, trasformando imbarazzo in affinità con il consumatore.",
    board:
      "Premio: Gold Print & Publishing 2018.\nTempo: risposta in ore, non settimane.\nLezione crisis management + tone of voice.\nAnalisi copywriting e reputazione in real time.",
  },
  {
    id: "curated-2019-dream-crazy",
    title: "DREAM CRAZY",
    brand: "NIKE",
    agency: "WIEDEN+KENNEDY PORTLAND",
    year: "2019",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=ww47XCHJV00",
    team:
      "Client: Nike global brand.\nAgenzia: Wieden+Kennedy Portland.\nVoce: Colin Kaepernick.\nRegia: Spike Lee (versione estesa), montaggio atleti iconici.",
    idea:
      "«Believe in something. Even if it means sacrificing everything.» Kaepernick incarna il rischio per i propri ideali — allineato al «Just Do It» originale.",
    insight:
      "Il consumatore giovane chiede ai brand di prendere posizione. Nike accetta il boicottaggio per guadagnare credibilità con chi vede lo sport come piattaforma sociale, non solo intrattenimento.",
    board:
      "Premio: Gold Film / Grand Prix Entertainment 2019.\nControversia: bruciare scarpe, Trump — amplificazione earned.\nCaso su brand activism e calcolo del rischio.\nAnalisi strategia lungo termine vs. short term sales.",
  },
  {
    id: "curated-2019-burn-that-ad",
    title: "BURN THAT AD",
    brand: "BURGER KING",
    agency: "DAVID MIAMI",
    year: "2019",
    tier: "GRAND PRIX",
    category: "Print & Publishing Lions",
    url: "https://www.youtube.com/watch?v=h5-E0KLObwE",
    team:
      "Client: Burger King global.\nAgenzia: DAVID Miami.\nTech: AR via app, riconoscimento ad McDonald's.\nMedia: coupon Whopper gratis per ogni ad concorrente «bruciata».",
    idea:
      "Inquadri una pubblicità McDonald's con l'app BK: AR la incendia sullo schermo e ti premia con un Whopper gratis.",
    insight:
      "Il fast food combatte su promo e frequenza. BK hackera il media buy del rivale: ogni poster McDonald's diventa touchpoint Burger King senza costi OOH propri.",
    board:
      "Premio: Grand Prix Print & Publishing 2019.\nMeccanica: competitor hacking + AR utility.\nStudio su media innovation e guerrilla digitale.\nEsempio di idea che scala globalmente con asset leggeri.",
  },
  {
    id: "curated-2019-best-men-can-be",
    title: "THE BEST MEN CAN BE",
    brand: "GILLETTE",
    agency: "GREY BOSTON",
    year: "2019",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=koPmuEyP3a0",
    team:
      "Client: Procter & Gamble / Gillette.\nAgenzia: Grey Boston.\nRegia: Kim Gehrig.\nRework del tagline «The Best a Man Can Get» (1989).",
    idea:
      "Montaggio di bullismo, molestie, #MeToo e padri che intervengono. Invita gli uomini a essere migliori, non solo rasati.",
    insight:
      "La masculinità tossica danneggia uomini e donne. Gillette, brand di «uomo perfetto», rinuncia al flattery per una posizione etica — rischio calcolato su generazioni più giovani.",
    board:
      "Premio: Gold Film Lions 2019.\nPolarizzazione: dislike record YouTube, dibattito globale.\nAnalisi: quando il purpose divide ma rafforza il core target.\nConfronto con Always su ridefinizione culturale.",
  },
  {
    id: "curated-2019-changing-the-game",
    title: "CHANGING THE GAME",
    brand: "XBOX / MICROSOFT",
    agency: "MCCANN NEW YORK",
    year: "2019",
    tier: "GRAND PRIX",
    category: "Product Design Lions",
    url: "https://www.youtube.com/watch?v=SaI09Ves4Sc",
    team:
      "Client: Microsoft Xbox.\nAgenzia: McCann New York.\nProdotto: Adaptive Controller.\nRegia spot: Bryce Menzies; protagonisti giovani gamer disabili.",
    idea:
      "Controller progettato per qualsiasi corpo, con spot che racconta bambini con disabilità che finalmente giocano competitivamente.",
    insight:
      "Il gaming esclude fisicamente chi non può usare un pad standard. L'innovazione non è feature tech ma inclusione: il prodotto è il messaggio.",
    board:
      "Premio: Grand Prix / Titanium Product Design 2019.\nCaso raro: Lions al prodotto fisico, non solo al film.\nStudio su design inclusivo e brand platform.\nAnalisi product–communication fit.",
  },
  {
    id: "curated-2020-moldy-whopper",
    title: "MOLDY WHOPPER",
    brand: "BURGER KING",
    agency: "INGO STOCKHOLM",
    year: "2020",
    tier: "GRAND PRIX",
    category: "Print & Publishing Lions",
    url: "https://www.youtube.com/watch?v=U8xjy_VqtKc",
    team:
      "Client: Burger King (rimozione conservanti USA).\nAgenzia: INGO Stockholm, David Miami, Publicis.\nFood stylist: decomposizione reale Whopper 34 giorni.\nMedia: TV, OOH, social time-lapse.",
    idea:
      "Mostrare un Whopper che marcisce in time-lapse per 34 giorni. Messaggio: stiamo togliendo gli additivi — il cibo ora si rovina come deve.",
    insight:
      "Dire «senza conservanti» è claim vuoto. BK rende la putrefazione proof of product: disgusto visivo = credibilità. Contro-intuitivo e memorabile.",
    board:
      "Premio: Grand Prix Print & Publishing 2020.\nRischio: appetito appeal zero, virale comunque.\nLezione su proof point sensoriale.\nConfronto con Moldy Whopper in analisi food advertising.",
  },
  {
    id: "curated-2020-stay-home-whopper",
    title: "STAY HOME OF THE WHOPPER",
    brand: "BURGER KING",
    agency: "DAVID MADRID",
    year: "2020",
    tier: "GOLD",
    category: "Print & Publishing Lions",
    url: "https://www.youtube.com/watch?v=8qvYx4x0UUE",
    team:
      "Client: Burger King (lockdown COVID).\nAgenzia: DAVID Madrid.\nDesign: logo BK come divano casalingo.\nMedia: OOH vuoti, social, stampa.",
    idea:
      "Il logo Burger King si trasforma in un divano: «Stay Home of the Whopper». Incoraggia a restare a casa durante la pandemia rinunciando alla vendita immediata.",
    insight:
      "In crisi sanitaria, insistere sull'hunger sell è tone-deaf. BK sacrifica short-term revenue per allinearsi al bene comune — e guadagna trust.",
    board:
      "Premio: Gold Print & Publishing 2020.\nContesto: COVID-19, brand response.\nAnalisi logo design e responsabilità sociale.\nEsempio di minimalismo visivo ad alto impatto.",
  },
  {
    id: "curated-2021-womb-stories",
    title: "WOMB STORIES",
    brand: "BODYFORM / ESSITY",
    agency: "AMV BBDO",
    year: "2021",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=5p-krTKv7XQ",
    team:
      "Client: Essity (Bodyform/Libresse).\nAgenzia: AMV BBDO London.\nRegia: Nisha Ganatra.\nCast: esperienze reali di utero — infertilità, endometriosi, gravidanza, menopausa.",
    idea:
      "Film corale sulle storie invisibili dell'utero: dolore, desiderio di figli, aborto, menopausa. Payoff: «Womb stories che non sentiamo».",
    insight:
      "Dopo Blood Normal, il tabù resta sulle narrative complesse femminili. L'insight è che «normalizzare» non basta: serve spazio per storie scomode e non lineari.",
    board:
      "Premio: Gold Film Lions 2021.\nContinuità: franchise purpose Essity.\nStudio su long-term platform vs. one-off.\nAnalisi casting, tone e rappresentazione.",
  },
  {
    id: "curated-2021-confusing-times",
    title: "CONFUSING TIMES",
    brand: "BURGER KING",
    agency: "DAVID MADRID",
    year: "2021",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=4cpVA1yHvDk",
    team:
      "Client: Burger King.\nAgenzia: DAVID Madrid.\nProduzione: remake parodico di spot anni '80 con stesso cast invecchiato.\nMedia: TV + social nostalgia.",
    idea:
      "Riprende spot vintage BK «mantieni la fiamma viva» con gli stessi attori 40 anni dopo — ora confusi dalla società moderna. Whopper come ancora di normalità.",
    insight:
      "Post-pandemic, tutto è disorientante. BK usa la nostalgia autoironica per dire: almeno il flame-grilled resta uguale. Comfort food come emotional anchor.",
    board:
      "Premio: Gold Film Lions 2021.\nTecnica: sequel culturale di asset di brand.\nAnalisi nostalgia marketing e continuity.\nEsempio di IP proprietario riattivato.",
  },
  {
    id: "curated-2022-cheers-to-all",
    title: "CHEERS TO ALL",
    brand: "HEINEKEN",
    agency: "PUBLICIS ITALY",
    year: "2022",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=0dJ0dOYvdjY",
    team:
      "Client: Heineken global.\nAgenzia: Publicis Italy (Le Pub).\nRegia: Riccardo Bernardi.\nCasting: bar multiculturale, gesti di brindisi da culture diverse.",
    idea:
      "In un bar, un uomo vuole brindare ma ogni gesto «toasting» urta qualcuno di cultura diversa. Soluzione: alzare la bottiglia Heineken — gesto neutro universale.",
    insight:
      "La birra è rituale sociale; i rituali offendono se non conosci le regole. Heineken posiziona il prodotto come ponte culturale, non come status drink.",
    board:
      "Premio: Gold Film Lions 2022.\nTema: inclusione interculturale leggera.\nAnalisi insight antropologico su gesture.\nExecution cinematografica premium.",
  },
  {
    id: "curated-2022-correct-the-internet",
    title: "CORRECT THE INTERNET",
    brand: "RECREATIONAL SPORTS NZ",
    agency: "DDB AUCKLAND",
    year: "2022",
    tier: "GOLD",
    category: "Direct Lions",
    url: "https://www.youtube.com/watch?v=0yLdteZI_vI",
    team:
      "Client: NZ Women's Rugby + Recreational Sports NZ.\nAgenzia: DDB Auckland.\nTech: search bias correction, Chrome extension.\nPR: campagna su Wikipedia e Google results.",
    idea:
      "Strumenti e azioni per correggere il bias di Google che associa «All Blacks» (uomini) al rugby neozelandese ignorando le Black Ferns campionesse del mondo.",
    insight:
      "L'invisibilità delle atlete non è solo media: è algoritmica. Correggere il search bias è activism digitale concreto, non manifesto.",
    board:
      "Premio: Gold Direct Lions 2022.\nMeccanica: product/tool + advocacy.\nStudio su gender bias in tech e sport.\nAnalisi earned media da problema sistemico.",
  },
  {
    id: "curated-2023-ai-ketchup",
    title: "AI KETCHUP",
    brand: "HEINZ",
    agency: "RETHINK CANADA",
    year: "2023",
    tier: "GOLD",
    category: "Film / Outdoor Lions",
    url: "https://www.youtube.com/watch?v=kq0N2r4hA0E",
    team:
      "Client: Kraft Heinz.\nAgenzia: Rethink Canada.\nTech: prompt DALL·E / AI image gen.\nMedia: social, OOH con output AI.",
    idea:
      "Chiede a intelligenze artificiali «ketchup» — tutte generano immagini stile Heinz. Proof che il brand è category icon nella mente umana e delle macchine.",
    insight:
      "Tutti parlano di AI: Heinz la usa come specchio del proprio brand equity. Se l'AI «vede» Heinz senza prompt di marca, il distinctive asset è imbattibile.",
    board:
      "Premio: Gold Lions 2023.\nTiming: surf su hype AI con proof semplice.\nAnalisi distinctive assets (Byron Sharp).\nEsempio di tech come demo, non gimmick.",
  },
  {
    id: "curated-2023-masterpiece",
    title: "MASTERPIECE",
    brand: "COCA-COLA",
    agency: "BLOK / WPP",
    year: "2023",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=HGkIzP1tHdI",
    team:
      "Client: Coca-Cola.\nAgenzia: Blok/WPP.\nRegia: Henry Scholfield.\nVFX: quadri classici (Vermeer, Hopper, Munch) animati in live action.",
    idea:
      "Una bottiglia Coke fa il giro di capolavori dell'arte fino a raggiungere uno studente in crisi creativa — la Coke come musa.",
    insight:
      "La creatività si blocca; l'ispirazione arriva da connessioni inaspettate. Coke si riposiziona come catalizzatore di momenti creativi, non solo thirst quencher.",
    board:
      "Premio: Gold Film Lions 2023.\nCraft: VFX premium, licensing arte.\nAnalisi brand as enabler vs. product.\nConfronto craft vs. idea pura.",
  },
  {
    id: "2024-skip-ad",
    title: "SKIP AD",
    brand: "BURGER KING",
    agency: "DAVID MADRID",
    year: "2024",
    tier: "GOLD",
    category: "Outdoor / Direct Lions",
    url: "https://www.campaignlive.com/article/burger-king-skip-ad/1861234",
    team:
      "Client: Burger King.\nAgenzia: DAVID Madrid.\nMedia: billboard con QR che si auto-salta dopo 5 secondi (parodia skip YouTube).\nTech: timer + coupon Whopper.",
    idea:
      "Cartelloni che simulano il pulsante «Salta annuncio» di YouTube: dopo 5 secondi puoi saltare e ottenere un Whopper. Hack della grammatica pubblicitaria digitale in OOH.",
    insight:
      "Tutti odiano gli pre-roll; BK trasforma l'irritazione culturale in meccanica promo. L'OOH imita il digital, non il contrario.",
    board:
      "Premio: Gold Lions Cannes 2024.\nMeccanica: parodia UI familiare.\nStudio su cross-media grammar.\nCampagna già in archivio ADS of the day.",
  },
  {
    id: "curated-2024-marina-prieto",
    title: "MEET MARINA PRIETO",
    brand: "JCDECAUX",
    agency: "DAVID MADRID",
    year: "2024",
    tier: "GOLD",
    category: "Outdoor Lions",
    url: "https://www.youtube.com/watch?v=8YQ9Pq7p5m0",
    team:
      "Client: JCDecaux (media owner).\nAgenzia: DAVID Madrid.\nProtagonista: Marina Prieto, cleaner JCDecaux 30 anni.\nProduzione: documentario + OOH dedicati.",
    idea:
      "Celebra Marina, donna delle pulizie che per 30 anni ha curato i cartelloni JCDecaux in silenzio — diventa hero del medium outdoor.",
    insight:
      "L'OOH parla sempre di chi compra spazio, mai di chi lo mantiene. JCDecaux umanizza l'infrastruttura media e rende visibile il lavoro invisibile.",
    board:
      "Premio: Gold Outdoor Lions 2024.\nTone: documentaristico, emozionale.\nAnalisi B2B brand con storytelling umano.\nMedia owner come storyteller.",
  },
  {
    id: "curated-2024-michael-cerave",
    title: "MICHAEL CERAVE",
    brand: "CERAVE",
    agency: "OGILVY / WPP",
    year: "2024",
    tier: "GOLD",
    category: "Entertainment Lions",
    url: "https://www.youtube.com/watch?v=wqHqFp7_4uU",
    team:
      "Client: CeraVe (L'Oréal).\nAgenzia: WPP/Ogilvy PR.\nTalent: Michael Cera — campagna Super Bowl senza spot TV tradizionale.\nStunt: fake ads, mystery su «Cera».",
    idea:
      "Nessuno spot al Super Bowl: invece mistero su Michael Cera legato a «Cera», fake OOH, poi reveal che CeraVe ha già la formula giusta.",
    insight:
      "Il Super Bowl è arms race dei budget spot. CeraVe subverte: non esserci in TV diventa notizia, sfruttando celebrity e confusione nome.",
    board:
      "Premio: Gold Entertainment Lions 2024.\nMeccanica: anti-ad as strategy.\nStudio su PR-led launches.\nAnalisi fame planning vs. media tradizionale.",
  },
  {
    id: "2025-the-messi-experience",
    title: "THE MESSI EXPERIENCE",
    brand: "ADIDAS",
    agency: "72ANDSUNNY AMSTERDAM",
    year: "2025",
    tier: "GOLD",
    category: "Entertainment / Experience Lions",
    url: "https://www.adidas.com/",
    team:
      "Client: Adidas Football.\nAgenzia: 72andSunny Amsterdam.\nProduzione: experience immersiva su Messi.\nMedia: evento + content ecosystem.",
    idea:
      "Esperienza che mette il fan nel corpo e nella carriera di Messi — non testimonial statico ma mondo navigabile.",
    insight:
      "Gli athlete brand vivono di momenti, non di logo. Adidas trasforma l'idolo in esperienza partecipata, aggiornando il modello endorsement.",
    board:
      "Premio: Gold Lions Cannes 2025.\nFormato: experience-first.\nAnalisi sports marketing e fan economy.\nCampagna già in archivio ADS of the day.",
  },
  {
    id: "curated-2025-heinz-ketchup-fraud",
    title: "KETCHUP FRAUD",
    brand: "HEINZ",
    agency: "RETHINK CANADA",
    year: "2025",
    tier: "GOLD",
    category: "Direct Lions",
    url: "https://www.youtube.com/watch?v=KkTp5M5Ejxk",
    team:
      "Client: Kraft Heinz.\nAgenzia: Rethink Canada.\nLegal: class action satirica contro ristoranti che servono ketchup non-Heinz.\nPR: hotline per segnalazioni.",
    idea:
      "Campagna «legale» che invita i consumatori a denunciare ristoranti che fingono di servire Heinz — kit detective con lampada UV sul logo.",
    insight:
      "Il ketchup da ristorante è spesso generico in bottiglia Heinz. Trasformare la rabbia del consumatore tradito in gioco partecipato rafforza l'ownership del distinctive bottle.",
    board:
      "Premio: Gold Direct Lions 2025.\nContinuità: franchise Heinz provocatorio.\nAnalisi participative brand activism.\nEsempio di legal trope in advertising.",
  },
  {
    id: "curated-2018-share-your-gifts",
    title: "SHARE YOUR GIFTS",
    brand: "APPLE",
    agency: "TBWA\\MEDIA ARTS LAB",
    year: "2018",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=cjmo5Rh3REc",
    team:
      "Client: Apple.\nAgenzia: TBWA\\Media Arts Lab.\nRegia: Lance Acord.\nAnimazione: titoli cartacei in CGI; colonna sonora Billie Eilish.",
    idea:
      "Ragazza timida che nasconde le proprie creazioni finché un vicino non le spinge a «share your gifts» — metafora del creative potential su Mac.",
    insight:
      "Molti creativi hanno paura di mostrare il lavoro. Apple non vende feature: vende il coraggio di condividere, con product placement leggero.",
    board:
      "Premio: Gold Film Lions 2018.\nCraft: animazione paper-style.\nAnalisi emotional product film.\nConfronto con Nike su storytelling identitario.",
  },
  {
    id: "curated-2023-periodsomnia",
    title: "PERIODSOMNIA",
    brand: "BODYFORM / ESSITY",
    agency: "AMV BBDO",
    year: "2023",
    tier: "GOLD",
    category: "Film Lions",
    url: "https://www.youtube.com/watch?v=5p-krTKv7XQ",
    team:
      "Client: Essity.\nAgenzia: AMV BBDO.\nRegia: femminile; sound design notturno.\nResearch: disturbi sonno legati al ciclo poco discussi.",
    idea:
      "Racconta la «periodsomnia» — insonnia causata dal ciclo — con notti insonni realistiche. Porta un sintomo tabù in prima pagina.",
    insight:
      "Il femcare parla di assorbenti, non di sintomi sistemici. Essity allarga il territorio al benessere olistico, difendendo il leadership su Blood Normal.",
    board:
      "Premio: Gold Film Lions 2023.\nPlatform: Womb Stories universe.\nAnalisi category expansion.\nStudio su research-driven creative.",
  },
];
