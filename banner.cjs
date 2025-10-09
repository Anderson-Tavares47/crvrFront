// banner.cjs
const figlet = require('figlet');
const pkg = require('./package.json');

(async () => {
  // Carrega gradient dinamicamente
  let gradient;
  try {
    gradient = (await import('gradient-string')).default;
  } catch {
    gradient = null;
  }

  const title = (pkg.displayName || pkg.name || 'APP').toUpperCase();
  const mode = process.env.NODE_ENV || 'development';
  const node = process.version;
  const nextVersion = (pkg.dependencies && pkg.dependencies.next) || 'N/A';
  const version = pkg.version || '0.0.0';
  const now = new Date().toLocaleString();

  function stripAnsi(s) {
    return s.replace(/\x1B\[[0-9;]*m/g, '');
  }

  function center(text, width) {
    const lines = text.split('\n');
    return lines
      .map(l => {
        const len = stripAnsi(l).length;
        const pad = Math.max(0, Math.floor((width - len) / 2));
        return ' '.repeat(pad) + l;
      })
      .join('\n');
  }

  const columns = process.stdout.columns || 80;

  // ASCII do nome
  const ascii = figlet.textSync(title, { font: 'Slant', horizontalLayout: 'fitted' });
  const asciiCentered = center(ascii, columns);
  const asciiColored = gradient ? gradient.fruit.multiline(asciiCentered) : asciiCentered;

  const info =
    ` ${title}  •  v${version}\n` +
    ` Next: ${nextVersion}  •  Node: ${node}\n` +
    ` Mode: ${mode}  •  ${now}`;

  const output = `${asciiColored}\n\n${center(info, columns)}`;

  console.clear();
  console.log(output + '\n');
})();
