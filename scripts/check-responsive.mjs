// Диагностика адаптивности: открывает сайт в headless-браузере
// с размерами экрана телефона и находит элементы, вылезающие за границы.
// Запуск: node check-responsive.mjs [url]
import puppeteer from "puppeteer-core";

const url = process.argv[2] || "http://127.0.0.1:5180/";
const EXECUTABLE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Типичные размеры экранов телефонов
const VIEWPORTS = [
  { name: "iPhone SE / маленький (320px)", width: 320, height: 568 },
  { name: "iPhone обычный (375px)", width: 375, height: 667 },
  { name: "Android средний (390px)", width: 390, height: 844 },
  { name: "Планшет (768px)", width: 768, height: 1024 },
];

const browser = await puppeteer.launch({
  executablePath: EXECUTABLE,
  headless: "new",
});

try {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: "networkidle0", timeoutG: 60000 }).catch(async () => {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    });
    // Даём анимациям и шрифтам время
    await new Promise((r) => setTimeout(r, 2500));

    const report = await page.evaluate(() => {
      const vw = window.innerWidth;
      const doc = document.documentElement;
      const horizontalScroll = doc.scrollWidth - vw;

      // Ищем элементы, правый или левый край которых выходит за экран.
      // Пропускаем декоративные слои и всё, что обрезается предком
      // с overflow hidden (бегущие строки, панели) — это по дизайну.
      const isClipped = (el) => {
        if (el.closest(".science-bg, .grain-overlay")) return true;
        for (let node = el.parentElement; node; node = node.parentElement) {
          if (node.nodeType !== 1) continue;
          const ov = getComputedStyle(node).overflowX;
          if (ov === "hidden" || ov === "clip") return true;
          if (node === document.body) break;
        }
        return false;
      };
      const offenders = [];
      const all = document.querySelectorAll("*");
      for (const el of all) {
        if (isClipped(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        const overRight = rect.right - vw;
        const overLeft = -rect.left;
        const over = Math.max(overRight, overLeft);
        if (over > 2) {
          // Поднимаемся к видимому родителю без overflow-hidden, чтобы понять,
          // кто реально создаёт прокрутку; но просто фиксируем элемент
          const cls = String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className);
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: cls.slice(0, 110),
            text: (el.textContent || "").trim().slice(0, 40),
            rect: {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            },
            over: Math.round(over),
          });
        }
        if (offenders.length >= 40) break;
      }

      return {
        vw,
        scrollWidth: doc.scrollWidth,
        horizontalScroll,
        bodyScrollWidth: document.body ? document.body.scrollWidth : null,
        offenders,
      };
    });

    console.log(`\n=== ${vp.name} (${vp.width}x${vp.height}) ===`);
    console.log(`Ширина документа: ${report.scrollWidth}px при экране ${report.vw}px`);
    if (report.horizontalScroll > 1) {
      console.log(`❌ ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА: +${report.horizontalScroll}px`);
    } else {
      console.log(`✅ горизонтальной прокрутки нет`);
    }
    if (report.offenders.length > 0) {
      console.log(`Элементы за границами экрана (${report.offenders.length}):`);
      for (const o of report.offenders) {
        console.log(`  • <${o.tag}> over=+${o.over}px [${o.cls}] "${o.text}" rect=${JSON.stringify(o.rect)}`);
      }
    } else {
      console.log(`Элементов за границами экрана: нет`);
    }

    // Скриншот верха страницы для визуальной проверки
    await page.screenshot({
      path: `responsive-${vp.width}-top.png`,
      clip: { x: 0, y: 0, width: vp.width, height: vp.height },
    });
    await page.close();
  }
  console.log("\nСкриншоты сохранены: responsive-320-top.png, responsive-375-top.png, responsive-390-top.png");
} finally {
  await browser.close();
}
