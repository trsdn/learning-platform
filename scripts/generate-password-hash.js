#!/usr/bin/env node

/**
 * Password Hash Generator for Learning Paths
 *
 * Interactive script for teachers to generate SHA-256 password hashes
 * for password-protected learning paths.
 *
 * Usage: node scripts/generate-password-hash.js
 */

const crypto = require('crypto');
const readline = require('readline');

// ANSI color codes for better UX
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printHeader() {
  console.log('');
  console.log(colors.bright + colors.blue + '━'.repeat(60) + colors.reset);
  console.log(colors.bright + '  🔒 Passwort-Hash Generator' + colors.reset);
  console.log(colors.blue + '━'.repeat(60) + colors.reset);
  console.log('');
  console.log('Dieses Tool erstellt einen SHA-256 Hash für Ihr Passwort,');
  console.log('den Sie in Ihrer Lernpfad-JSON-Datei verwenden können.');
  console.log('');
  console.log(colors.yellow + '⚠️  Hinweis:' + colors.reset);
  console.log('   Dies ist nur client-seitige Authentifizierung und');
  console.log('   bietet KEINEN Schutz gegen technisch versierte Angreifer.');
  console.log('   Geeignet für Klassenzimmer und Familien-Szenarien.');
  console.log('');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createHiddenInput(rl, query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const originalStdin = {
      isTTY: stdin.isTTY,
      setRawMode: stdin.setRawMode,
    };

    let input = '';
    let muted = false;

    const onData = (char) => {
      char = char.toString();

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          stdin.removeListener('data', onData);
          if (originalStdin.setRawMode) {
            stdin.setRawMode(false);
          }
          console.log('');
          muted = false;
          resolve(input);
          break;
        case '\u0003': // Ctrl-C
          console.log('^C');
          process.exit();
          break;
        case '\u007f': // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          input += char;
          if (muted) {
            process.stdout.write('*');
          }
          break;
      }
    };

    process.stdout.write(query);
    muted = true;

    if (stdin.isTTY && stdin.setRawMode) {
      stdin.setRawMode(true);
    }

    stdin.resume();
    stdin.on('data', onData);
  });
}

async function main() {
  printHeader();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Get password
    const password = await createHiddenInput(
      rl,
      colors.bright + 'Passwort eingeben: ' + colors.reset
    );

    if (!password) {
      console.log(colors.yellow + '\n⚠️  Passwort darf nicht leer sein.' + colors.reset);
      rl.close();
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await createHiddenInput(
      rl,
      colors.bright + 'Passwort bestätigen: ' + colors.reset
    );

    if (password !== confirmPassword) {
      console.log(colors.yellow + '\n❌ Passwörter stimmen nicht überein.' + colors.reset);
      rl.close();
      process.exit(1);
    }

    // Generate hash
    const hash = hashPassword(password);

    // Display result
    console.log('');
    console.log(colors.green + '✅ Hash erfolgreich generiert!' + colors.reset);
    console.log('');
    console.log(colors.bright + 'Ihr Passwort-Hash:' + colors.reset);
    console.log(colors.cyan + hash + colors.reset);
    console.log('');
    console.log(colors.bright + 'Verwendung in Ihrer JSON-Datei:' + colors.reset);
    console.log('');
    console.log('{');
    console.log('  "id": "ihr-lernpfad-id",');
    console.log('  "title": "Ihr Lernpfad Titel",');
    console.log(colors.green + '  "requiresPassword": true,' + colors.reset);
    console.log(colors.green + '  "passwordHash": "' + hash + '",' + colors.reset);
    console.log('  "tasks": [...]');
    console.log('}');
    console.log('');
    console.log(colors.yellow + '💡 Tipp:' + colors.reset);
    console.log('   Kopieren Sie den Hash und fügen Sie ihn in Ihre');
    console.log('   Lernpfad-JSON-Datei ein (siehe Beispiel oben).');
    console.log('');
    console.log(colors.blue + '━'.repeat(60) + colors.reset);
    console.log('');

    rl.close();
  } catch (error) {
    console.error(colors.yellow + '\n❌ Fehler:', error.message + colors.reset);
    rl.close();
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error('Unerwarteter Fehler:', error);
  process.exit(1);
});
