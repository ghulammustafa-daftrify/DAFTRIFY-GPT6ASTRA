import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const source = path.join(root, 'index.html');
const dist = path.join(root, 'dist');
const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(source)) {
  throw new Error('index.html is missing');
}

const html = fs.readFileSync(source, 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1].trim())
  .filter(Boolean);

for (const [index, code] of scripts.entries()) {
  try {
    new vm.Script(code, { filename: `index.html:inline-script-${index + 1}.js` });
  } catch (error) {
    throw new Error(`Inline JavaScript syntax error in script ${index + 1}: ${error.message}`);
  }
}

if (!/<html\b/i.test(html) || !/<body\b/i.test(html)) {
  throw new Error('index.html must contain html and body elements');
}

if (!checkOnly) {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
  fs.copyFileSync(source, path.join(dist, 'index.html'));
}

console.log(checkOnly ? 'DAFTRIFY check passed.' : 'DAFTRIFY static build complete: dist/index.html');
