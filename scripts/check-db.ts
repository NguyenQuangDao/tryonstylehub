import { readFileSync } from 'fs';
import { resolve } from 'path';
import { checkDatabaseConnection } from '../src/lib/db-check';

function loadEnv() {
  try {
    const p = resolve(process.cwd(), '.env');
    const content = readFileSync(p, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim();
        if (!(key in process.env)) process.env[key] = val;
      }
    });
  } catch {}
}

async function main() {
  loadEnv();
  console.log('DATABASE_URL', process.env.DATABASE_URL);
  const ok = await checkDatabaseConnection();
  console.log(JSON.stringify({ ok }));
}

main().catch(e => {
  console.error('error', e);
  process.exit(1);
});
