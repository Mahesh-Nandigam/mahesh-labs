import { scryptSync, randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import readline from "node:readline/promises";
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
const password = await terminal.question("New admin password: ");
terminal.close();
if (!password.trim()) throw new Error("Password cannot be empty.");
const salt = randomBytes(16).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
let env = await readFile(".env.local", "utf8").catch(() => "");
const line = `ADMIN_PASSWORD_HASH='${hash}'`;
env = /^ADMIN_PASSWORD_HASH=.*$/m.test(env)
  ? env.replace(/^ADMIN_PASSWORD_HASH=.*$/m, line)
  : env.trimEnd() + "\n" + line + "\n";
await writeFile(".env.local", env, { mode: 0o600 });
console.log("Admin password hash saved. Restart the app to apply it.");
