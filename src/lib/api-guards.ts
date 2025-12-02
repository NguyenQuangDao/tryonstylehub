import { checkDatabaseConnection } from './db-check';

let lastCheck = 0;
let lastConnected = false;
const TTL_MS = 2_000;

export async function isDatabaseConnectedCached(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheck < TTL_MS) return lastConnected;
  lastConnected = await checkDatabaseConnection();
  lastCheck = now;
  return lastConnected;
}

const DB_REQUIRED_PATTERNS = [
  /^\/api\/products(\/.*)?$/, // products
  /^\/api\/recommend$/, // recommend outfit
  /^\/api\/seller(\/.*)?$/, // seller area
  /^\/api\/admin(\/.*)?$/, // admin area
  /^\/api\/user(\/.*)?$/, // user gallery
  /^\/api\/tokens(\/.*)?$/, // tokens & cost tracking
  /^\/api\/cost-stats$/, // cost stats
  /^\/api\/virtual-models$/, // virtual models stored in DB
  /^\/api\/body-parts(\/.*)?$/, // body parts compositions
  /^\/api\/auth\/login$/,
  /^\/api\/auth\/register$/,
];

const DB_FREE_WHITELIST = [
  /^\/api\/health(\/.*)?$/, // health
  /^\/api\/generate-prompt$/, // prompt generation
  /^\/api\/generate-image$/, // image generation (external services)
  /^\/api\/upload$/, // S3 upload
  /^\/api\/avatar(\/.*)?$/, // avatar handling may use S3
];

export function isDbRequiredPath(pathname: string): boolean {
  if (DB_FREE_WHITELIST.some((re) => re.test(pathname))) return false;
  return DB_REQUIRED_PATTERNS.some((re) => re.test(pathname));
}
