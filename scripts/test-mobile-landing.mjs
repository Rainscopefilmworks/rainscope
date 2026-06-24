import { chromium, devices } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const BASE = process.env.LANDING_URL || 'http://localhost:8081/';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  ...devices['iPhone 13'],
  reducedMotion: 'reduce',
});
const page = await context.newPage();

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.evaluate(() => sessionStorage.setItem('rs-landing-intro-seen', '1'));
await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForSelector('.split-container .panel', { timeout: 10000 });

const result = await page.evaluate(() => {
  const header = document.querySelector('.landing-header');
  const panels = [...document.querySelectorAll('.panel')];
  const headerStyle = header ? getComputedStyle(header) : null;

  const overlaps = [];
  const elements = [
    ...panels.map((el) => ({ name: el.id || 'panel', rect: el.getBoundingClientRect() })),
    ...(header
      ? [{ name: 'landing-header', rect: header.getBoundingClientRect() }]
      : []),
    ...panels.map((panel) => ({
      name: `${panel.id || 'panel'}-content`,
      rect: panel.querySelector('.panel-content')?.getBoundingClientRect(),
    })),
  ].filter((item) => item.rect && item.rect.height > 0);

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      const r1 = a.rect;
      const r2 = b.rect;
      const h = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
      const w = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
      if (h > 10 && w > 10) {
        overlaps.push({
          a: a.name,
          b: b.name,
          overlapPx: Math.round(h * w),
        });
      }
    }
  }

  const panelRects = panels.map((el) => el.getBoundingClientRect());
  const stackedGaps = panelRects.slice(1).map((rect, i) => {
    const prev = panelRects[i];
    return Math.round(rect.top - prev.bottom);
  });

  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    headerPosition: headerStyle?.position ?? null,
    panelCount: panels.length,
    stackedGaps,
    overlaps,
    scrollHeight: document.documentElement.scrollHeight,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
  };
});

console.log('Mobile landing test:', JSON.stringify(result, null, 2));

const badOverlaps = result.overlaps.filter(
  (o) =>
    !(
      (o.a.includes('content') && o.b.includes('panel') && !o.b.includes('content')) ||
      (o.b.includes('content') && o.a.includes('panel') && !o.a.includes('content'))
    ),
);

if (result.headerPosition !== 'relative' && result.headerPosition !== 'static') {
  console.error('FAIL: header is not in document flow on mobile');
  process.exitCode = 1;
}

if (badOverlaps.length > 0) {
  console.error('FAIL: unexpected overlaps', badOverlaps);
  process.exitCode = 1;
}

if (result.stackedGaps.some((gap) => gap < -1)) {
  console.error('FAIL: panels overlap vertically', result.stackedGaps);
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log('PASS: mobile landing layout looks good');
}

await page.screenshot({
  path: path.join(root, '_site/mobile-landing-test.png'),
  fullPage: true,
});

await browser.close();
