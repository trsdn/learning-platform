#!/usr/bin/env node

/**
 * Website Password Hash Generator
 * 
 * Generates SHA-256 password hashes for website authentication.
 * Run: node scripts/generate-website-password-hash.js
 */

const crypto = require('crypto');
const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`
${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
  ${colors.bright}🔒 Website Passwort-Hash Generator${colors.reset}
${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);

// Hide password input
function hiddenQuestion(query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');

    process.stdout.write(query);

    let password = '';

    stdin.on('data', (char) => {
      char = char.toString('utf8');

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl-C
          process.stdout.write('\n');
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(query + '*'.repeat(password.length));
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function main() {
  const password = await hiddenQuestion('Passwort eingeben: ');
  const confirmPassword = await hiddenQuestion('Passwort bestätigen: ');

  if (password !== confirmPassword) {
    console.log(`\n${colors.yellow}❌ Die Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut.${colors.reset}\n`);
    rl.close();
    process.exit(1);
  }

  if (!password || password.length === 0) {
    console.log(`\n${colors.yellow}❌ Passwort darf nicht leer sein.${colors.reset}\n`);
    rl.close();
    process.exit(1);
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  console.log(`
${colors.green}✅ Hash erfolgreich generiert!${colors.reset}

${colors.bright}Ihr Passwort-Hash:${colors.reset}
${colors.cyan}${hash}${colors.reset}

${colors.bright}Verwendung in .env.local:${colors.reset}
${colors.blue}VITE_APP_PASSWORD_HASH=${hash}${colors.reset}

${colors.yellow}⚠️ Wichtig:${colors.reset}
- Speichern Sie den Hash in ${colors.bright}.env.local${colors.reset}
- Commiten Sie ${colors.bright}.env.local NICHT${colors.reset} in Git
- Teilen Sie das ${colors.bright}Passwort${colors.reset} (nicht den Hash) mit den Benutzern

${colors.green}🔒 Sicherheitshinweis:${colors.reset}
Diese Authentifizierung ist nur für Klassenzimmer/Familien geeignet.
Nicht für sensible Daten verwenden!
`);

  rl.close();
}

main();
