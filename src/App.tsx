import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Answer = [string, number, string?];
type Question = { p: string; a: Answer[] };
type Tier = { min: number; name: string; pts: number; color: string; ico: string };
type RoundResult = { q: Question; text: string; hit: Answer | null; tier: Tier | null; pts: number };
type Screen = "menu" | "play" | "reveal" | "end";

/* Kérdések: [megjelenített név, gyakoriság %, alternatív írásmódok (| jellel)] */
const Q: Question[] = [
    { p: "Nevezz meg egy európai fővárost!", a: [["Párizs",14,"paris"],["London",12],["Berlin",11],["Róma",10,"roma|rome"],["Madrid",9],["Budapest",8],["Bécs",6,"becs|wien|vienna"],["Prága",5,"praga|prague"],["Athén",4,"athen|athens"],["Lisszabon",4,"lisbon"],["Varsó",3,"varso|warsaw"],["Amszterdam",3],["Brüsszel",2.5,"brussel|brussels"],["Dublin",2],["Helsinki",1.5],["Oslo",1.5],["Stockholm",1.5],["Koppenhága",1.2,"koppenhaga|copenhagen"],["Zágráb",1,"zagrab|zagreb"],["Pozsony",1,"bratislava"],["Belgrád",.8,"belgrad|belgrade"],["Bukarest",.7,"bucharest"],["Reykjavík",.6,"reykjavik"],["Valletta",.2],["Andorra la Vella",.1,"andorra"],["Vaduz",.1]] },
    { p: "Nevezz meg egy gyümölcsöt, ami piros is lehet!", a: [["Alma",22],["Eper",18],["Cseresznye",12],["Meggy",7],["Málna",7,"malna"],["Görögdinnye",6,"gorogdinnye|dinnye"],["Ribizli",5],["Paradicsom",4],["Gránátalma",4,"granatalma"],["Vörös áfonya",1.5,"piros afonya|vörös áfonya"],["Licsi",1],["Csipkebogyó",.8,"csipkebogyo"],["Sárkánygyümölcs",.8,"sarkanygyumolcs|pitaja"],["Som",.6],["Goji",.5,"goji bogyo"],["Kaktuszfüge",.3,"kaktuszfuge"],["Berkenye",.2]] },
    { p: "Nevezz meg egy hangszert!", a: [["Gitár",20,"gitar"],["Zongora",18],["Dob",10],["Hegedű",9,"hegedu"],["Fuvola",7],["Trombita",5],["Szaxofon",4],["Cselló",4,"csello"],["Klarinét",3,"klarinet"],["Basszusgitár",3,"basszusgitar|basszus"],["Hárfa",2.5,"harfa"],["Harmonika",2],["Orgona",2],["Furulya",1.5],["Citera",1.5],["Cimbalom",1.2],["Tuba",1],["Oboa",.9],["Duda",.8],["Tárogató",.4,"tarogato"],["Okarina",.3],["Tekerőlant",.15,"tekerolant"],["Teremin",.1,"theremin"],["Üvegharmonika",.05,"uvegharmonika"]] },
    { p: "Nevezz meg egy tengeri élőlényt!", a: [["Cápa",18,"capa"],["Delfin",15],["Bálna",12,"balna"],["Rák",8,"rak"],["Polip",8],["Medúza",7,"meduza"],["Tengeri csillag",5],["Tintahal",4],["Tengeri teknős",4,"teknos|teknőc"],["Kagyló",3,"kagylo"],["Rája",2.5,"raja"],["Fóka",2,"foka"],["Homár",2,"homar"],["Angolna",1.5],["Korall",1.5],["Tengeri csikó",1.5,"tengeri csiko|csikohal"],["Krill",1.2],["Rozmár",1.2,"rozmar"],["Moréna",.8,"morena"],["Szivacs",.8],["Narvál",.5,"narval"],["Ördöghal",.4,"ordoghal"],["Tengeri uborka",.4],["Nautilusz",.3],["Lámpáshal",.2,"lampashal"]] },
    { p: "Nevezz meg egy magyar várost!", a: [["Budapest",20],["Debrecen",12],["Szeged",9],["Pécs",8,"pecs"],["Győr",7,"gyor"],["Miskolc",6],["Eger",5],["Sopron",3],["Székesfehérvár",3,"szekesfehervar"],["Kecskemét",2.5,"kecskemet"],["Veszprém",2.5,"veszprem"],["Szombathely",2],["Nyíregyháza",2,"nyiregyhaza"],["Esztergom",1.5],["Szolnok",1.5],["Zalaegerszeg",1.5],["Siófok",1.5,"siofok"],["Békéscsaba",1,"bekescsaba"],["Tokaj",1.2],["Hódmezővásárhely",.8,"hodmezovasarhely"],["Gyula",.8],["Kalocsa",.5],["Mohács",.5,"mohacs"],["Sárospatak",.4,"sarospatak"],["Tata",.4],["Pannonhalma",.2],["Hollókő",.1,"hollokő|hollokõ"]] },
    { p: "Nevezz meg egy elemet a periódusos rendszerből!", a: [["Oxigén",15,"oxigen"],["Hidrogén",14,"hidrogen"],["Szén",10,"szen"],["Vas",9],["Arany",8],["Nitrogén",6,"nitrogen"],["Hélium",6,"helium"],["Ezüst",4,"ezust"],["Réz",3,"rez"],["Urán",3,"uran"],["Nátrium",2.5,"natrium"],["Klór",2,"klor"],["Kalcium",2],["Higany",2],["Ólom",2,"olom"],["Neon",1.5],["Cink",1.2],["Platina",1],["Kén",1,"ken"],["Foszfor",1],["Szilícium",1,"szilicium"],["Bór",.5,"bor"],["Gallium",.4],["Bizmut",.3],["Ozmium",.1],["Lantán",.1,"lantan"]] },
    { p: "Nevezz meg egy zöldséget!", a: [["Répa",12,"sargarepa|sárgarépa|repa"],["Paradicsom",11],["Burgonya",10,"krumpli"],["Uborka",9],["Paprika",9],["Hagyma",8,"voroshagyma|vöröshagyma"],["Brokkoli",5],["Káposzta",4,"kaposzta"],["Cukkini",3.5],["Karfiol",3],["Spenót",3,"spenot"],["Padlizsán",2,"padlizsan"],["Fokhagyma",2],["Zeller",1.5],["Kukorica",1.5],["Borsó",1.5,"borso|zoldborso"],["Retek",1.2],["Sütőtök",1.2,"sutotok|toktok"],["Spárga",1,"sparga"],["Karalábé",.8,"karalabe"],["Kelkáposzta",.8,"kelkaposzta"],["Cékla",.8,"cekla"],["Édesburgonya",.7,"edesburgonya"],["Kelbimbó",.6,"kelbimbo"],["Pasztinák",.5,"pasztinak"],["Articsóka",.4,"articsoka"],["Mángold",.4,"mangold"],["Torma",.3],["Rebarbara",.1]] },
    { p: "Nevezz meg egy sportágat!", a: [["Foci",25,"labdarugas|futball"],["Kosárlabda",10,"kosarlabda|kosar"],["Tenisz",9],["Úszás",8,"uszas"],["Kézilabda",6,"kezilabda"],["Röplabda",5,"roplabda"],["Atlétika",4,"atletika|futas"],["Jégkorong",4,"jegkorong|hoki"],["Vízilabda",3.5,"vizilabda"],["Torna",3],["Kerékpározás",2.5,"kerekparozas|biciklizes"],["Vívás",2,"vivas"],["Birkózás",1.8,"birkozas"],["Íjászat",1.5,"ijaszat"],["Golf",1.5],["Rögbi",1.5,"rogbi"],["Lovaglás",1.2,"lovaglas"],["Curling",.9],["Cselgáncs",.8,"cselgancs|judo"],["Kajak-kenu",.8,"kajak|kenu"],["Krikett",.7,"cricket"],["Sziklamászás",.6,"sziklamaszas"],["Modern ötpróba",.4,"otproba|pentatlon"],["Skeleton",.15],["Sepak takraw",.05]] },
    { p: "Nevezz meg egy színt!", a: [["Piros",20],["Kék",18,"kek"],["Zöld",16,"zold"],["Sárga",10,"sarga"],["Fekete",6],["Fehér",5,"feher"],["Narancs",5,"narancssarga"],["Lila",4],["Rózsaszín",3,"rozsaszin"],["Barna",3],["Szürke",2.5,"szurke"],["Vörös",1.5,"voros"],["Türkiz",1.5,"turkiz"],["Bordó",1.2,"bordo"],["Ibolya",1.2],["Arany",.8],["Indigó",.6,"indigo"],["Okker",.4],["Bíbor",.4,"bibor"],["Cián",.3,"cian|cyan"],["Magenta",.3],["Karmazsin",.2],["Azúr",.2,"azur"]] },
    { p: "Nevezz meg egy afrikai országot!", a: [["Egyiptom",16],["Dél-Afrika",12],["Nigéria",8,"nigeria"],["Kenya",8],["Marokkó",7,"marokko"],["Etiópia",5,"etiopia"],["Ghána",4,"ghana"],["Tunézia",4,"tunezia"],["Algéria",3.5,"algeria"],["Tanzánia",3,"tanzania"],["Szenegál",2.5,"szenegal"],["Uganda",2],["Kamerun",1.8],["Madagaszkár",1.8,"madagaszkar"],["Szomália",1.2,"szomalia"],["Namíbia",1.2,"namibia"],["Zimbabwe",1],["Botswana",.8],["Mali",.7],["Eritrea",.4],["Szváziföld",.3,"eswatini|svazifold"],["Dzsibuti",.2],["Comore-szigetek",.1,"comore"]] },
    { p: "Nevezz meg egy madarat!", a: [["Sas",12],["Veréb",11,"vereb"],["Galamb",10],["Varjú",8,"varju"],["Fecske",7],["Papagáj",6,"papagaj"],["Bagoly",6],["Gólya",5,"golya"],["Holló",5,"hollo"],["Szarka",4],["Pingvin",4],["Kolibri",3],["Sólyom",3,"solyom"],["Strucc",3],["Flamingó",2.5,"flamingo"],["Cinege",2],["Rigó",2,"rigo"],["Páva",1.8,"pava"],["Harkály",1.5,"harkaly"],["Pelikán",1.5,"pelikan"],["Daru",1.5],["Kakukk",1.5],["Tukán",1,"tukan"],["Albatrosz",1],["Kiwi",.9],["Búbosbanka",.8,"bubosbanka"],["Emu",.7],["Kormorán",.6,"kormoran"],["Kakapó",.1,"kakapo"]] },
    { p: "Nevezz meg egy tésztafélét!", a: [["Spagetti",22,"spaghetti"],["Penne",10],["Lasagne",6,"lasagna|lazanya"],["Tagliatelle",5],["Makaróni",5,"makaroni"],["Fusilli",5],["Gnocchi",4,"nyoki"],["Tortellini",3.5],["Ravioli",3.5],["Farfalle",3],["Fettuccine",2.5],["Rigatoni",2.2],["Cannelloni",2],["Tarhonya",1.5],["Galuska",1.5],["Nokedli",1.5],["Pappardelle",1.2],["Orecchiette",.8],["Csipetke",.7],["Bucatini",.6],["Orzo",.5,"risoni"],["Gemelli",.3],["Cavatappi",.1],["Trofie",.1]] }
  ];

const TIERS: Tier[] = [
    { min: 10, name: "Gyakori", pts: 5, color: "#7a8ea0", ico: "⚪" },
    { min: 5, name: "Ismert", pts: 15, color: "#5aa9e6", ico: "🔵" },
    { min: 2.5, name: "Szokatlan", pts: 30, color: "#3ddc97", ico: "🟢" },
    { min: 1.2, name: "Ritka", pts: 50, color: "#f2c94c", ico: "🟡" },
    { min: .5, name: "Nagyon ritka", pts: 75, color: "#ff9f43", ico: "🟠" },
    { min: 0, name: "Egy a krillióból", pts: 100, color: "#ff5fa2", ico: "💎" }
  ];

const css = `
:root{--d:0;--fg:#eaf6ff;--muted:#8fb4cc;--card:rgba(6,30,52,.78);--line:#1f5278;--accent:#35c4ff;--ok:#3ddc97;--bad:#ff6b6b;color-scheme:dark}
*{box-sizing:border-box;margin:0}
html,body{min-height:100%}
body{color:var(--fg);font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(180deg,#2aa9e0 0%,#0b5d94 25%,#06304f 55%,#020d1c 100%);background-attachment:fixed;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}
.dim{position:fixed;inset:0;background:#000;opacity:calc(var(--d)*.55);pointer-events:none;transition:opacity .2s}
.bub{position:fixed;bottom:-20px;border-radius:50%;border:1px solid #ffffff55;animation:rise linear infinite;pointer-events:none}
@keyframes rise{to{transform:translateY(-110vh)}}
.gauge{position:fixed;right:14px;top:70px;bottom:24px;width:34px;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:2}
.gauge .track{flex:1;width:8px;border-radius:8px;background:#ffffff22;position:relative;overflow:hidden}
.gauge .fill{position:absolute;top:0;left:0;right:0;height:0;background:linear-gradient(#7fe3ff,#35c4ff);border-radius:8px;transition:height .15s}
.gauge small{font-size:.7rem;color:var(--muted);writing-mode:vertical-rl}
.wrap{position:relative;z-index:1;max-width:620px;margin:0 auto;padding:22px 64px 40px 18px}
header{text-align:center;margin-bottom:18px}
header h1{font-size:clamp(2rem,6vw,2.8rem);letter-spacing:-.03em}
header em{font-style:normal;color:var(--accent)}
header p{color:var(--muted);margin-top:4px;font-size:.92rem}
.card{background:var(--card);backdrop-filter:blur(8px);border:1px solid var(--line);border-radius:22px;padding:24px}
.card h2{font-size:1.45rem;line-height:1.3;margin:10px 0 18px}
.meta{display:flex;justify-content:space-between;color:var(--muted);font-size:.88rem}
.timer{height:6px;border-radius:6px;background:#ffffff1f;margin-top:8px;overflow:hidden}
.timer i{display:block;height:100%;width:100%;background:var(--accent)}
.timer i.low{background:var(--bad)}
.row{display:flex;gap:8px}
input{flex:1;min-width:0;font-size:1.05rem;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:#031425;color:var(--fg)}
input:focus{outline:2px solid var(--accent)}
.btn{background:var(--accent);color:#03233a;border:0;border-radius:12px;padding:12px 18px;font-weight:700;cursor:pointer;font-size:1rem}
.btn.ghost{background:#0c3556;color:var(--fg);font-weight:500}
.btn:hover{filter:brightness(1.1)}
.tiers{display:flex;flex-wrap:wrap;gap:6px;margin-top:18px}
.tier{font-size:.72rem;padding:3px 9px;border-radius:999px;background:#0c3556;color:var(--muted)}
.res{text-align:center;animation:pop .35s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
.res .big{font-size:2.6rem;font-weight:800;margin:6px 0}
.badge{display:inline-block;padding:5px 16px;border-radius:999px;font-weight:700}
.res p{color:var(--muted);margin:8px 0 18px}
table{width:100%;border-collapse:collapse;font-size:.88rem;margin:14px 0}
td,th{padding:7px 4px;border-bottom:1px solid #1f527855;text-align:left}
th{color:var(--muted);font-weight:500;font-size:.75rem}
.center{text-align:center}
.score{font-size:3rem;font-weight:800;color:var(--accent)}
.hint{color:var(--muted);font-size:.8rem;margin-top:10px}
.badmsg{min-height:1.4em;margin-top:10px;color:var(--bad);font-size:.92rem}
.shake{animation:shk .35s;border-color:var(--bad)}
@keyframes shk{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.score.big{font-size:4.8rem;line-height:1;font-weight:800;color:#fff}
.pts{color:var(--accent);margin:4px 0 6px;font-size:1rem;letter-spacing:.04em}
.perf{margin:16px 0;padding:14px;border:1px solid var(--line);border-radius:14px;background:#03142588}
.perf h3{font-size:1.05rem}
.pmsg{margin:4px 0 10px}
.cmp{display:grid;grid-template-columns:50px 1fr 80px;gap:8px;align-items:center;font-size:.88rem;margin:4px 0}
.ct{height:12px;background:#ffffff1c;border-radius:8px;overflow:hidden}
.ct i{display:block;height:100%;border-radius:8px}
.cmp b{text-align:right}
.perf svg{margin-top:10px}
.stage{position:relative;height:170px;border-radius:16px;overflow:hidden;margin-bottom:14px;background:linear-gradient(#0b5d9455,#02101f88);border:1px solid var(--line)}
.stage .lines{position:absolute;inset:0;background-image:linear-gradient(to bottom,transparent 59px,#ffffff2e 59px);background-size:100% 60px}
.stage .diver{position:absolute;left:50%;top:50%;margin:-24px 0 0 -42px;line-height:0;will-change:transform;filter:drop-shadow(0 4px 8px #0008)}
.stage .dcount{position:absolute;right:12px;top:8px;font-weight:800;font-size:1.3rem;text-shadow:0 2px 6px #000a}
.stage .bubs i{position:absolute;left:38%;top:50%;width:8px;height:8px;border:1px solid #fff9;border-radius:50%;animation:bubup 1.2s linear infinite}
.stage .bubs i:nth-child(2){animation-delay:.3s;left:34%}
.stage .bubs i:nth-child(3){animation-delay:.6s;left:36%}
.stage .bubs i:nth-child(4){animation-delay:.9s;left:32%}
@keyframes bubup{from{transform:translateY(0);opacity:.9}to{transform:translateY(-90px);opacity:0}}
@media(max-width:480px){.wrap{padding-right:56px}.card{padding:18px}}
@media(prefers-reduced-motion:reduce){.bub{display:none}}

.sink{animation:bob 1.4s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(-5px) rotate(6deg)}50%{transform:translateY(5px) rotate(14deg)}}
.nope{animation:wob .6s}
@keyframes wob{25%{transform:translateX(-8px) rotate(-8deg)}75%{transform:translateX(8px) rotate(8deg)}}
`;

const TIME = 25;
const MAXD = 7000;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const tierOf = (pct: number): Tier => {
  for (const t of TIERS) if (pct >= t.min) return t;
  return TIERS[TIERS.length - 1];
};

function lev(a: string, b: string): number {
  const m: number[][] = [];
  for (let i = 0; i <= a.length; i++) m[i] = [i];
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}

function findAnswer(q: Question, text: string): Answer | null {
  const n = norm(text);
  if (!n) return null;
  let best: Answer | null = null;
  for (const a of q.a) {
    const names = [a[0], ...(a[2] ? a[2].split("|") : [])];
    for (const nm of names) {
      const nn = norm(nm);
      if (nn === n) return a;
      if (!best && n.length >= 5 && nn.length >= 5 && lev(n, nn) <= 1) best = a;
    }
  }
  return best;
}

const rarest = (q: Question) => [...q.a].sort((x, y) => x[1] - y[1])[0][0];

const dayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickOrder(practice: boolean): number[] {
  const r = practice ? Math.random : rng(hash("melyviz-" + dayKey()));
  const idx = Q.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, 7);
}
type Saved = { depth: number; emoji: string };
function getSaved(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem("melyviz:" + dayKey()) || "null");
  } catch {
    return null;
  }
}
function putSaved(v: Saved) {
  try {
    localStorage.setItem("melyviz:" + dayKey(), JSON.stringify(v));
  } catch {
    /* nincs tárhely */
  }
}
function cdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/* ---------- Tengeralattjáró ---------- */
function Sub({ width = 84 }: { width?: number }) {
  return (
    <svg viewBox="0 0 84 48" width={width} height={(width * 48) / 84} aria-hidden="true">
      <rect x="44" y="0" width="3" height="7" fill="#c99a22" />
      <rect x="44" y="0" width="10" height="2.5" rx="1" fill="#c99a22" />
      <rect x="36" y="5" width="20" height="13" rx="4" fill="#e0b43a" />
      <ellipse cx="44" cy="29" rx="34" ry="15" fill="#f2c94c" />
      <ellipse cx="44" cy="36" rx="30" ry="7" fill="#d9a92f" opacity=".55" />
      <path d="M13 29 L3 19 L3 39 Z" fill="#c99a22" />
      <ellipse cx="5" cy="29" rx="2.5" ry="10" fill="#8a6a15" />
      {[30, 45, 60].map((cx) => (
        <circle key={cx} cx={cx} cy="28" r="4.5" fill="#7fe3ff" stroke="#9c7414" strokeWidth="2" />
      ))}
    </svg>
  );
}

/* ---------- Végeredmény: haranggörbe + merülési napló ---------- */
function Report({ rounds, total }: { rounds: RoundResult[]; total: number }) {
  let mean = 0;
  let vr = 0;
  rounds.forEach((r) => {
    let s = 0, s2 = 0, w = 0;
    r.q.a.forEach((x) => {
      const p = tierOf(x[1]).pts;
      s += x[1] * p;
      s2 += x[1] * p * p;
      w += x[1];
    });
    const m = s / w;
    mean += m;
    vr += s2 / w - m * m;
  });
  const sd = Math.sqrt(Math.max(1, vr));
  const pct = Math.round(cdf((total - mean) / sd) * 100);

  const W = 600, base = 150, top = 16, pl = 14, pr = 14;
  const X = (v: number) => pl + ((W - pl - pr) * v) / 700;
  const Y = (v: number) => base - (base - top) * Math.exp(-0.5 * Math.pow((v - mean) / sd, 2));
  const pts: string[] = [];
  for (let v = 0; v <= 700; v += 7) pts.push(`${X(v).toFixed(1)},${Y(v).toFixed(1)}`);
  const line = "M" + pts.join(" L");
  const area = `${line} L${X(700)},${base} L${X(0)},${base} Z`;
  const tv = Math.min(700, Math.max(0, total));
  const tx = X(tv);

  const n = rounds.length, LW = 600, LH = 280, ltop = 36, lbot = 236;
  const LY = (m: number) => ltop + ((lbot - ltop) * m) / 1000;
  const lx = (i: number) => 76 + (i * (LW - 106)) / Math.max(1, n - 1);
  let wave = `M0,${ltop} Q40,${ltop - 8} 80,${ltop}`;
  for (let k = 160; k <= 640; k += 80) wave += ` T${k},${ltop}`;

  return (
    <>
      <div className="perf">
        <h3>Hol állsz a többiekhez képest?</h3>
        <p className="pmsg"><b>Jobb vagy, mint a mai játékosok kb. {pct}%-a.</b></p>
        <svg viewBox="0 0 600 190" width="100%" role="img" aria-label="Pontszámod a többi játékoséhoz képest">
          <path d={area} fill="#35c4ff33" />
          <path d={line} fill="none" stroke="#35c4ff" strokeWidth="2.5" />
          <line x1={pl} x2={W - pr} y1={base} y2={base} stroke="#8fb4cc" />
          {[0, 100, 200, 300, 400, 500, 600, 700].map((t) => (
            <g key={t}>
              <line x1={X(t)} x2={X(t)} y1={base} y2={base + 5} stroke="#8fb4cc" />
              <text x={X(t)} y={base + 18} textAnchor="middle" fontSize="11" fill="#8fb4cc">{t}</text>
            </g>
          ))}
          <line x1={tx} x2={tx} y1={Y(tv)} y2={base} stroke="#ff5fa2" strokeWidth="2.5" />
          <circle cx={tx} cy={Y(tv)} r="6" fill="#ff5fa2" />
          <text x={tx} y={base + 36} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ff5fa2">TE · {total}</text>
        </svg>
        <div className="hint">A görbe a játék becsült gyakorisági adataiból számolt várható pontszám-eloszlás, nem valódi játékosoké.</div>
      </div>

      <div className="perf">
        <h3>Merülési napló</h3>
        <div className="hint" style={{ margin: "0 0 6px" }}>Minél mélyebb, annál ritkább volt a válaszod.</div>
        <svg viewBox={`0 0 ${LW} ${LH}`} width="100%" role="img" aria-label="Merülési napló kérdésenként">
          <rect x="0" y={ltop} width={LW} height={LH - ltop} fill="#02101f99" rx="10" />
          <path d={wave} fill="none" stroke="#7fe3ff" strokeWidth="2" />
          {[0, 250, 500, 750, 1000].map((m) => (
            <g key={m}>
              <line x1="46" x2={LW} y1={LY(m)} y2={LY(m)} stroke="#ffffff22" strokeDasharray="4 5" />
              <text x="40" y={LY(m) + 4} textAnchor="end" fontSize="10" fill="#8fb4cc">{m} m</text>
            </g>
          ))}
          {rounds.map((r, i) => {
            const y = LY(r.pts * 10);
            const c = r.tier ? r.tier.color : "#5d7388";
            return (
              <g key={i}>
                <line x1={lx(i)} x2={lx(i)} y1={ltop} y2={y} stroke={c} strokeWidth="2" opacity=".8" />
                <text x={lx(i)} y={y + 8} textAnchor="middle" fontSize="22">{r.pts >= 100 ? "💎" : r.hit ? "🐟" : "🫧"}</text>
                <text x={lx(i)} y={LH - 12} textAnchor="middle" fontSize="13" fill="#cfe6f5">{i + 1}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}

/* ---------- Alkalmazás ---------- */
export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [practice, setPractice] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [depth, setDepth] = useState(0);
  const [shown, setShown] = useState(0);
  const [left, setLeft] = useState(TIME * 10);
  const [input, setInput] = useState("");
  const [bad, setBad] = useState("");
  const [shake, setShake] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [copied, setCopied] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const bubbles = useMemo(
    () => Array.from({ length: 14 }, () => ({ s: 6 + Math.random() * 16, l: Math.random() * 100, d: 9 + Math.random() * 14, dl: Math.random() * 20 })),
    []
  );

  const q: Question | undefined = order.length ? Q[order[round]] : undefined;
  const total = rounds.reduce((s, r) => s + r.pts, 0);

  const goMenu = () => {
    setScreen("menu");
    setDepth(0);
    setShown(0);
  };

  const begin = (prac: boolean) => {
    setPractice(prac);
    setOrder(pickOrder(prac));
    setRound(0);
    setRounds([]);
    setDepth(0);
    setShown(0);
    setInput("");
    setBad("");
    setCopied("");
    setScreen("play");
  };

  const finish = (text: string) => {
    if (screen !== "play" || !q) return;
    const hit = findAnswer(q, text);
    const tier = hit ? tierOf(hit[1]) : null;
    setRounds([...rounds, { q, text: text.trim(), hit, tier, pts: tier ? tier.pts : 0 }]);
    setAnimDone(false);
    setScreen("reveal");
  };

  const submit = () => {
    if (!q) return;
    if (!input.trim()) {
      setBad("Írj be egy választ!");
      return;
    }
    if (!findAnswer(q, input)) {
      setBad(`„${input.trim()}” nem jó, vagy nincs a listámban. Próbálj egy másikat!`);
      setInput("");
      setShake((s) => s + 1);
      inputRef.current?.focus();
      return;
    }
    finish(input);
  };

  const next = () => {
    if (round >= order.length - 1) {
      if (!practice) putSaved({ depth, emoji: rounds.map((r) => r.tier?.ico ?? "🫧").join("") });
      setScreen("end");
    } else {
      setRound(round + 1);
      setInput("");
      setBad("");
      setScreen("play");
    }
  };

  // visszaszámláló
  useEffect(() => {
    if (screen !== "play") return;
    setLeft(TIME * 10);
    const id = setInterval(() => setLeft((l) => l - 1), 100);
    return () => clearInterval(id);
  }, [screen, round]);

  useEffect(() => {
    if (screen === "play" && left <= 0) finish(input);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (screen === "play") inputRef.current?.focus();
  }, [screen, round]);

  // merülés animáció
  useEffect(() => {
    if (screen !== "reveal") return;
    const res = rounds[rounds.length - 1];
    const from = depth;
    const to = from + res.pts * 10;
    const dur = res.pts ? 800 + res.pts * 22 : 600;
    const t0 = performance.now();
    let raf = 0;
    const f = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = -(Math.cos(Math.PI * k) - 1) / 2;
      setShown(Math.round(from + (to - from) * e));
      if (k < 1) raf = requestAnimationFrame(f);
      else {
        setDepth(to);
        setShown(to);
        setAnimDone(true);
      }
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (animDone) nextRef.current?.focus();
  }, [animDone]);

  const saved = screen === "menu" ? getSaved() : null;
  const res = rounds[rounds.length - 1];
  const last = round >= order.length - 1;
  const verdict =
    depth >= 5000 ? "Mélytengeri legenda! 🐙" : depth >= 3000 ? "Remek merülés, a sötétségig jutottál. 🔦" : depth >= 1500 ? "Szép munka, a kék zónát elérted. 🐠" : "Még a felszín közelében jársz, próbáld ritkább válaszokkal! 🌊";
  const share = `Rákillió 🌊 ${practice ? "gyakorlás" : dayKey()} · ${depth.toLocaleString("hu-HU")} m\n${rounds.map((r) => r.tier?.ico ?? "🫧").join("")}`;

  return (
    <div style={{ "--d": String(Math.min(1, shown / MAXD)) } as CSSProperties}>
      <style>{css}</style>
      <div className="dim" />
      {bubbles.map((b, i) => (
        <div key={i} className="bub" style={{ width: b.s, height: b.s, left: `${b.l}%`, animationDuration: `${b.d}s`, animationDelay: `-${b.dl}s` }} />
      ))}

      <div className="gauge">
        <small>{shown.toLocaleString("hu-HU")} m</small>
        <div className="track"><div className="fill" style={{ height: `${Math.min(100, (shown / MAXD) * 100)}%` }} /></div>
        <small>7000 m</small>
      </div>

      <div className="wrap">
        <header>
          <button className="btn ghost" style={{ float: "left", padding: "6px 12px", fontSize: ".85rem" }} onClick={goMenu}>☰ Menü</button>
          <h1>Rák<em>illió</em></h1>
          <p>Minél ritkább a helyes válaszod, annál mélyebbre jutsz.</p>
        </header>

        <div className="card">
          {screen === "menu" && (
            <>
              <h2>Merülj le a mélybe!</h2>
              <div className="meta"><span>Mai kérdéssor: {dayKey()}</span></div>
              <br />
              <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>
                7 kérdést kapsz, mindegyikre {TIME} másodperced van. Sok válasz helyes, de az a kérdés, mennyien gondoltak rá: minél ritkább a jó válaszod, annál több pontot (és métert) kapsz. A „gyakoriság” a játék saját, beépített becslése, nem valódi játékosok adata.
              </p>
              <div className="tiers">
                {TIERS.map((t) => <span className="tier" key={t.name}>{t.ico} {t.name} · {t.pts} pt</span>)}
              </div>
              <br />
              {saved ? (
                <p style={{ marginBottom: 12 }}>
                  A mai merülésed már megvan: <b>{saved.depth.toLocaleString("hu-HU")} m</b> {saved.emoji}
                  <br /><span className="hint">Holnap új kérdéssor jön.</span>
                </p>
              ) : (
                <><button className="btn" onClick={() => begin(false)}>Mai napi merülés</button>{" "}</>
              )}
              <button className="btn ghost" onClick={() => begin(true)}>Gyakorlás (véletlen kérdések)</button>
            </>
          )}

          {screen === "play" && q && (
            <>
              <div className="meta"><span>{round + 1} / {order.length}. kérdés</span><span>{Math.ceil(left / 10)} mp</span></div>
              <div className="timer"><i className={left < 80 ? "low" : ""} style={{ width: `${Math.max(0, (left / (TIME * 10)) * 100)}%` }} /></div>
              <h2>{q.p}</h2>
              <div className="row">
                <input
                  key={shake}
                  ref={inputRef}
                  className={shake ? "shake" : ""}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                  autoComplete="off"
                  autoCapitalize="off"
                  placeholder="Írd be a válaszod…"
                />
                <button className="btn" onClick={submit}>Küldés</button>
              </div>
              <div className="badmsg">{bad}</div>
              <div className="hint">
                <button className="btn ghost" style={{ padding: "6px 12px", fontSize: ".85rem" }} onClick={() => finish("")}>Kihagyás</button>
              </div>
            </>
          )}

          {screen === "reveal" && res && (
            <>
              <div className="stage">
                <div className="lines" style={{ backgroundPositionY: -shown * 0.6 }} />
                <div className="bubs"><i /><i /><i /><i /></div>
                <div className={`diver ${res.pts ? "sink" : "nope"}`}><Sub /></div>
                <div className="dcount">{shown.toLocaleString("hu-HU")} m</div>
              </div>
              <div className="res" style={{ visibility: animDone ? "visible" : "hidden" }}>
                {res.hit && res.tier ? (
                  <>
                    <span className="badge" style={{ background: res.tier.color, color: "#04141f" }}>{res.tier.ico} {res.tier.name}</span>
                    <div className="big">+{res.pts} pont</div>
                    <p>„{res.hit[0]}”: a játékosok kb. {String(res.hit[1]).replace(".", ",")}%-a írta ezt. Lejjebb süllyedtél {res.pts * 10} métert.</p>
                  </>
                ) : (
                  <>
                    <span className="badge" style={{ background: "#33475a" }}>🫧 Nem találtam</span>
                    <div className="big">+0 pont</div>
                    <p>
                      {res.text ? `A(z) „${res.text}” nincs a listámban, vagy nem illik a kérdéshez.` : "Nem érkezett válasz."} Egy nagyon ritka megoldás lett volna: {rarest(res.q)}.
                    </p>
                  </>
                )}
                <button ref={nextRef} className="btn" onClick={next}>{last ? "Eredmény" : "Következő"}</button>
              </div>
            </>
          )}

          {screen === "end" && (
            <>
              <div className="center">
                <div className="meta" style={{ justifyContent: "center" }}>{practice ? "Gyakorlás" : `Mai merülés · ${dayKey()}`} · vége</div>
                <div className="score big">{total}</div>
                <div className="pts">PONT · {depth.toLocaleString("hu-HU")} m mélység</div>
                <p style={{ color: "var(--muted)" }}>{verdict}</p>
              </div>
              <Report rounds={rounds} total={total} />
              <table>
                <thead>
                  <tr><th></th><th>Válaszod</th><th>Szint</th><th>Pont</th><th>Ritka példa</th></tr>
                </thead>
                <tbody>
                  {rounds.map((r, i) => (
                    <tr key={i}>
                      <td>{r.tier?.ico ?? "🫧"}</td>
                      <td>{r.hit ? r.hit[0] : r.text ? "—" : "kihagyva"}</td>
                      <td>{r.tier?.name ?? ""}</td>
                      <td>{r.pts}</td>
                      <td>{rarest(r.q)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="row">
                <button className="btn" onClick={goMenu}>Vissza a menübe</button>
                <button className="btn ghost" onClick={() => navigator.clipboard.writeText(share).then(() => setCopied("Kimásolva!"), () => setCopied(share))}>Eredmény másolása</button>
              </div>
              <div className="hint">{copied}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}