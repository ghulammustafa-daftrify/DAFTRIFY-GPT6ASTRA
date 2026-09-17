import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const source = path.join(root, 'index.html');
const dist = path.join(root, 'dist');
const assets = path.join(root, 'assets');
const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(source)) throw new Error('index.html is missing');
if (!fs.existsSync(path.join(assets, 'daftrify-site.js'))) throw new Error('assets/daftrify-site.js is missing');

const html = fs.readFileSync(source, 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim()).filter(Boolean);
for (const [index, code] of scripts.entries()) {
  try { new vm.Script(code, { filename: `index.html:inline-script-${index + 1}.js` }); }
  catch (error) { throw new Error(`Inline JavaScript syntax error in script ${index + 1}: ${error.message}`); }
}
if (!/<html\b/i.test(html) || !/<body\b/i.test(html)) throw new Error('index.html must contain html and body elements');

const cleanHtml = html.replace(/<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi, '');
const siteScript = '<script src="/assets/daftrify-site.js"></script>';
const builtHtml = cleanHtml.replace('</body>', `${siteScript}\n</body>`);

if (!checkOnly) {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dist, 'index.html'), builtHtml);
  fs.copyFileSync(path.join(assets, 'daftrify-site.js'), path.join(dist, 'assets', 'daftrify-site.js'));
}

console.log(checkOnly ? 'DAFTRIFY check passed.' : 'DAFTRIFY static build complete: full-site editorial rebuild');