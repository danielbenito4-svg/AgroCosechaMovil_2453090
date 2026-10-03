import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('capturas', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 375, height: 900 },
  serviceWorkers: 'allow'
});
const page = await context.newPage();

await page.goto('http://127.0.0.1:5090', { waitUntil: 'networkidle' });
await page.locator('.tarjeta').first().waitFor();

// 01 — catálogo móvil a 375 px con búsqueda visible.
await page.screenshot({
  path: 'capturas/01_movil_catalogo.png',
  fullPage: true
});

// 02 — cotización válida con subtotal Q1,290, 5 % de descuento y total Q1,225.50.
await page.locator('#cantidad-3').fill('4');
await page.locator('button[data-id="3"]').click();
await page.locator('#cantidad-6').fill('2');
await page.locator('button[data-id="6"]').click();

await page.locator('#cliente').fill('Don Pedro Xicay');
await page.locator('#telefono').fill('55123456');
await page.locator('#formCotizacion button[type="submit"]').click();
await page.getByText('Cotización #1 creada').waitFor();

await page.screenshot({
  path: 'capturas/02_movil_cotizacion.png',
  fullPage: true
});

// 03 — escritorio a 1100 px para evidenciar las tres columnas.
await page.setViewportSize({ width: 1100, height: 900 });
await page.goto('http://127.0.0.1:5090', { waitUntil: 'networkidle' });
await page.locator('.tarjeta').first().waitFor();
await page.screenshot({
  path: 'capturas/03_escritorio.png',
  fullPage: true
});

// 05 — evidencia real del historial Git del repositorio.
const log = execSync('git log --oneline -n 14', { encoding: 'utf8' });
const escapeHtml = s => s
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

writeFileSync('capturas/git-log.html', `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>git log --oneline</title>
<style>
body { margin:0; background:#111827; color:#e5e7eb; font:18px/1.6 Consolas,Monaco,monospace; }
.terminal { max-width:1050px; margin:40px auto; background:#0b1020; border:1px solid #334155; border-radius:14px; box-shadow:0 20px 50px #0006; overflow:hidden; }
.top { background:#1f2937; padding:12px 18px; color:#cbd5e1; }
.body { padding:22px 26px 30px; white-space:pre-wrap; }
.prompt { color:#86efac; }
</style>
</head>
<body>
<div class="terminal">
<div class="top">Terminal — AgroCosechaMovil_2453090</div>
<div class="body"><span class="prompt">$ git log --oneline</span>
${escapeHtml(log)}</div>
</div>
</body>
</html>`);

const logPage = await context.newPage();
await logPage.setViewportSize({ width: 1200, height: 820 });
await logPage.goto('file://' + process.cwd() + '/capturas/git-log.html');
await logPage.screenshot({
  path: 'capturas/05_git_log.png',
  fullPage: true
});

await browser.close();
