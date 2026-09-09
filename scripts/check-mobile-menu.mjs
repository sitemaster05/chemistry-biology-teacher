// Проверка мобильного меню: открывает бургер на телефоне и убеждается,
// что меню полностью помещается и ссылки в нём доступны.
import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://127.0.0.1:5180/";
const EXECUTABLE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browser = await puppeteer.launch({
  executablePath: EXECUTABLE,
  headless: "new",
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Кликаем бургер
  await page.click('button[aria-label="Открыть меню"]');
  await new Promise((r) => setTimeout(r, 900));

  const menuReport = await page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Само меню — панель справа
    const panel = document.querySelector(".fixed.inset-0.z-\\[60\\]");
    const panelRect = panel ? panel.getBoundingClientRect() : null;
    // Ссылки внутри меню
    const links = [...document.querySelectorAll("a[href^='#']")];
    const linkRects = links.map((a) => ({
      text: a.textContent.trim().slice(0, 24),
      right: Math.round(a.getBoundingClientRect().right),
      bottom: Math.round(a.getBoundingClientRect().bottom),
    }));
    return {
      vw,
      vh,
      panelRect: panelRect
        ? {
            left: Math.round(panelRect.left),
            right: Math.round(panelRect.right),
          }
        : null,
      linkRects,
    };
  });

  console.log("Мобильное меню открыто на 375px:");
  console.log(`Панель: left=${menuReport.panelRect?.left}, right=${menuReport.panelRect?.right} (экран ${menuReport.vw}px)`);
  const fits = menuReport.linkRects.every((l) => l.right <= menuReport.vw);
  console.log(`Ссылки в меню (${menuReport.linkRects.length}):`);
  for (const l of menuReport.linkRects) console.log(`  • "${l.text}" right=${l.right}`);
  console.log(fits ? "✅ всё помещается" : "❌ есть выход за экран!");

  // Проверка: клик по «Контакты» в меню закрывает его и прокручивает к форме
  await page.evaluate(() => {
    const links = [...document.querySelectorAll("a[href='#contacts']")];
    links[links.length - 1]?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const scrolled = await page.evaluate(() => window.scrollY > 200);
  console.log(scrolled ? "✅ переход к «Контакты» работает" : "⚠️ прокрутка не сработала (проверьте вручную)");

  await page.screenshot({ path: "menu-375.png" });
  console.log("Скриншот: menu-375.png");
} finally {
  await browser.close();
}
