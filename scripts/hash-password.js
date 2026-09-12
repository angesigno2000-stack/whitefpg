#!/usr/bin/env node
/**
 * Genera l'hash bcrypt di una password da usare come ADMIN_PASSWORD_HASH.
 * Uso: node scripts/hash-password.js "la-tua-password"
 */
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.js "la-tua-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nAggiungi questa riga a .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
