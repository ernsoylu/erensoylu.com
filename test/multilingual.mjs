// Run after npm run build: node test/multilingual.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const read = (url) => readFileSync(`_site${url}${url.endsWith('/') ? 'index.html' : ''}`, 'utf8');
const english = '/blog/reading-a-schematic/';
const turkish = '/tr/blog/sema-okumak/';
for (const [url, lang] of [[english, 'en'], [turkish, 'tr']]) {
  const html = read(url);
  assert.ok(html.includes(`<html lang="${lang}">`));
  assert.ok(html.includes(`rel="canonical" href="https://www.erensoylu.com${url}"`));
  for (const [alternate, language] of [[english, 'en'], [turkish, 'tr']]) {
    assert.ok(html.includes(`hreflang="${language}" href="https://www.erensoylu.com${alternate}"`));
    assert.ok(html.includes(`href="${alternate}" lang="${language}"`));
  }
}
assert.ok(read(turkish).includes('9 Haziran 2026'));
assert.ok(!read(turkish).includes('/blog/pwm-calibration/'));
assert.ok(!read('/blog/pwm-calibration/').includes('hreflang='));
for (const url of ['/', '/blog/', '/blog/page/2/', '/archive/', '/tags/hardware/', '/feed.xml']) {
  assert.ok(!read(url).includes('Elektrik mühendisi olmadan'), url);
}
for (const url of ['/tr/blog/', '/tr/archive/', '/tr/tags/hardware/', '/tr/feed.xml']) {
  const html = read(url);
  assert.ok(html.includes('Elektrik mühendisi olmadan'), url);
  assert.ok(!html.includes('/blog/pwm-calibration/'), url);
}
assert.equal((read('/feed.xml').match(/<entry>/g) || []).length, 3);
assert.equal((read('/tr/feed.xml').match(/<entry>/g) || []).length, 1);
assert.ok(read('/sitemap.xml').includes(`https://www.erensoylu.com${turkish}`));
for (const file of readdirSync('_site', { recursive: true }).filter(file => file.endsWith('.html'))) {
  for (const [, url] of readFileSync(path.join('_site', file), 'utf8').matchAll(/href="(\/[^"#?]*)"/g)) {
    assert.ok(existsSync(path.join('_site', url, url.endsWith('/') ? 'index.html' : '')), `${file}: broken link ${url}`);
  }
}
console.log('Multilingual output checks passed.');
