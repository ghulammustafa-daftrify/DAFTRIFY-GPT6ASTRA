import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const source = path.join(root, 'index.html');
const dist = path.join(root, 'dist');
const assets = path.join(root, 'assets');
const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(source)) throw new Error('index.html is missing');

const html = fs.readFileSync(source, 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim()).filter(Boolean);
for (const [index, code] of scripts.entries()) {
  try { new vm.Script(code, { filename: `index.html:inline-script-${index + 1}.js` }); }
  catch (error) { throw new Error(`Inline JavaScript syntax error in script ${index + 1}: ${error.message}`); }
}
if (!/<html\b/i.test(html) || !/<body\b/i.test(html)) throw new Error('index.html must contain html and body elements');

const legacyHeroPattern = /<script(?:\s[^>]*)?>(?=[\s\S]*requestAnimationFrame\(draw\))(?=[\s\S]*requestAnimationFrame\(update\))[\s\S]*?<\/script>/i;
const cleanHtml = html.replace(legacyHeroPattern, '<script>/* legacy hero animation removed from production build */</script>');
const heroCss = '<link rel="stylesheet" href="/assets/daftrify-webgl-hero-v2.css">';
const heroScript = '<script type="module" src="/assets/daftrify-webgl-hero-v2.js"></script>';
const builtHtml = cleanHtml.replace('</head>', `${heroCss}\n</head>`).replace('</body>', `${heroScript}\n</body>`);

if (!checkOnly) {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dist, 'index.html'), builtHtml);
  for (const file of ['daftrify-webgl-hero-v2.css', 'daftrify-webgl-hero-v2.js']) {
    fs.copyFileSync(path.join(assets, file), path.join(dist, 'assets', file));
  }
}

console.log(checkOnly ? 'DAFTRIFY check passed.' : 'DAFTRIFY static build complete: cinematic dossier v2');
