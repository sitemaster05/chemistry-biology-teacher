// Проверка боевого сайта после деплоя
import https from "node:https";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      })
      .on("error", reject);
  });
}

const html = await fetchText("https://uchitel05.ru/");

const title = html.match(/<title>(.*?)<\/title>/);
console.log("Title:", title ? title[1] : "?");

const checks = [
  "географии и экологии",
  "Северный Кавказ",
  "репетитор географии Каспийск",
  "540dbefa70714a11",
  "Xh1-T6eMDXiRFB-t3WjtaHvUb_fVjN_3lXqYmtMMP28",
  "ld+json",
  "areaServed",
];

for (const s of checks) {
  console.log(html.includes(s) ? "  OK: " + s : "  НЕТ: " + s);
}

// API: материалы все на месте?
const api = await fetchText("https://uchitel05.ru/api/site-data");
const data = JSON.parse(api);
console.log("Материалов в API:", data.materials.length);
console.log("Направлений в API:", data.services.length);
console.log("Направления:", data.services.map((s) => s.title).join(" | "));
