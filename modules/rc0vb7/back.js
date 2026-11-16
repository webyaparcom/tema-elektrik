/* kart-bento — Bento kart ızgarası (15 Kas 2026, G4 · mcp:webmaker/20261115-202337-k60m · D17–D18).
   Yer tutucular: kbnsinif kbnust kbnbaslik kbnmetin kbnkartlar.
   data: [{ ikon?, baslik, metin?, img?, url?, etiket? }] — metinler dil sözlüğü. İlk kart (vurgu açıkken) 2×2 «öne çıkan» karo; görseli varsa zemin olur.
   Karo boyutları sayıya göre dağılır (boş hücre bırakmaz). Veri yoksa blok basılmaz; başlık bölümü yalnız doluysa. */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `/img/${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];

const kartlar = veri
  .map((o) => ({ ikon: ikonAd(o && o.ikon), baslik: pick(o && o.baslik).trim(), metin: pick(o && o.metin).trim(), img: medyaUrl(o && o.img), url: href(o && o.url), etiket: pick(o && o.etiket).trim() }))
  .filter((o) => o.baslik);
const vurgu = dogru(des.vurgu, true) && kartlar.length >= 3;
const numara = dogru(des.numara, true);
/* düzen (4 kolon): vurgu 2×2'nin yanı 4 hücre; sonraki satırlar 4'lü. Eksik son satır kartları genişler (boş hücre yok). */
const n = kartlar.length;
const genis = new Set();
const tam = new Set();
const bas = vurgu ? 1 : 0;
const yanda = vurgu ? Math.min(4, n - 1) : 0;
if (vurgu && yanda < 4) { for (let i = 1; i <= 4 - yanda && i < n; i++) genis.add(i); }
const sonra = n - bas - (vurgu ? yanda : 0);
const kalan = sonra % 4;
if (kalan === 1) tam.add(n - 1);
else if (kalan > 1) { for (let i = n - 1; i > n - 1 - (4 - kalan); i--) genis.add(i); }

const kbnKartlar = kartlar.map((k, i) => {
  const sinif = ["modulex-kbn-kart", i === 0 && vurgu ? "modulex-kbn-kart--vurgu" : "", genis.has(i) ? "modulex-kbn-kart--genis" : "", tam.has(i) ? "modulex-kbn-kart--tam" : "", k.img ? "modulex-kbn-kart--gorsel" : ""].filter(Boolean).join(" ");
  const ic = (k.img ? `<img class="modulex-kbn-gorsel" src="${esc(k.img)}" alt="" width="800" height="800" loading="lazy" decoding="async" />` : "")
    + '<div class="modulex-kbn-kart-ic">'
    + '<div class="modulex-kbn-kart-ust">'
    + (k.ikon ? `<span class="modulex-kbn-ikon material-symbols-outlined" aria-hidden="true">${k.ikon}</span>` : "")
    + (numara ? `<span class="modulex-kbn-no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>` : "")
    + "</div>"
    + (k.etiket ? `<p class="modulex-kbn-etiket">${esc(k.etiket)}</p>` : "")
    + `<h3 class="modulex-kbn-kart-baslik">${esc(k.baslik)}</h3>`
    + (k.metin ? `<p class="modulex-kbn-kart-metin">${satirlar(k.metin)}</p>` : "")
    + (k.url ? '<span class="modulex-kbn-ok material-symbols-outlined mx-flip" aria-hidden="true">arrow_outward</span>' : "")
    + "</div>";
  return k.url ? `<a class="${sinif}" href="${esc(k.url)}">${ic}</a>` : `<div class="${sinif}">${ic}</div>`;
}).join("");

const ust = pick(des.ust).trim();
const baslik = pick(des.baslik).trim();
const metin = pick(des.metin).trim();
const kbnBas = ust || baslik || metin;

html = html
  .replaceAll("{{kbnsinif}}", () => (kbnBas ? "" : " modulex-kbn--bassiz") + (vurgu ? " modulex-kbn--vurgulu" : ""))
  .replaceAll("{{kbnust}}", () => (ust ? `<p class="modulex-kbn-ust">${esc(ust)}</p>` : ""))
  .replaceAll("{{kbnbaslik}}", () => (baslik ? `<h2 class="modulex-kbn-baslik" id="kbn-{{id}}-baslik">${esc(baslik)}</h2>` : ""))
  .replaceAll("{{kbnmetin}}", () => (metin ? `<p class="modulex-kbn-metin">${satirlar(metin)}</p>` : ""))
  .replaceAll("{{kbnetiket}}", () => (baslik ? 'aria-labelledby="kbn-{{id}}-baslik"' : ""))
  .replaceAll("{{kbnkartlar}}", () => kbnKartlar);
if (!kartlar.length) html = "";
