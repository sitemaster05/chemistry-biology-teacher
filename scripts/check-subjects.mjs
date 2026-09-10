// Визуальная проверка новых элементов: бейджи предметов, фильтр, глобус
import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://127.0.0.1:5180/";

const browser = await puppeteer.launch({
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: "new",
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0", timeoutSec: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  // 1. Герой с новыми бейджами
  await page.screenshot({ path: "check-hero.png" });

  // 2. Проверяем наличие бейджей в DOM
  const heroBadges = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      chemistry: text.includes("Химия"),
      biology: text.includes("Биология"),
      geography: text.includes("География"),
      ecology: text.includes("Экология"),
    };
  });
  console.log("Бейджи в герое:", JSON.stringify(heroBadges));

  // 3. Скролл к материалам — проверяем фильтр
  await page.evaluate(() => {
    document.querySelector("#materials")?.scrollIntoView({ behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: "check-materials.png" });

  const filterInfo = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")]
      .map((b) => b.textContent.trim())
      .filter((t) => /^(Все|Химия|Биология|География|Экология)/.test(t));
    return buttons;
  });
  console.log("Табы фильтра:", JSON.stringify(filterInfo));

  // 4. Клик по табу "Химия" — проверить фильтрацию
  const chemTab = await page.evaluateHandle(() => {
    return [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim().startsWith("Химия")
    );
  });
  if (chemTab) {
    await chemTab.asElement().click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: "check-filter-chem.png" });
    const cards = await page.evaluate(() => {
      return [...document.querySelectorAll("#materials .premium-card h3")].map(
        (h) => h.textContent.trim()
      );
    });
    console.log("Карточек при фильтре Химия:", cards.length);
  }

  // 5. Проверка глобуса-водяного знака в DOM
  const hasGlobe = await page.evaluate(() => {
    return Boolean(document.querySelector(".bg-watermark-globe"));
  });
  console.log("Глобус-водяной знак:", hasGlobe ? "есть" : "НЕТ");
} finally {
  await browser.close();
}
