const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../app');
const TRANSLATION_FILE = path.join(
  __dirname,
  '../app/i18n/en/translation.json',
);
const TRANSLATION_REGEX = /translate\(\s*(['"])(.*?)\1/g;
const WHITELIST_KEY_PATTERNS = [/^common\./, /^info\./];
const BLACKLIST_KEY_PATTERNS = [
  /^common.pinCodeSet$/,
  /^common.settings$/,
  /^common.unknownIssuer$/,
  /^error.incompatibleKeyStorageType$/,
  /^info.settings.security.rse.pinCodeSet.title$/,
  /^info.invitation.process.bleAdapterUnavailable.title$/,
  /^info.invitation.process.blePermissionMissing.title$/,
  /^info.invitation.process.bleAdapterDisabled.title$/,
  /^info.invitation.process.internetDisabled.title$/,
  /^info.invitation.process.internetUnreachable.title$/,
];

let usedKeys = new Set();
let allTranslationKeys = new Set();

function extractTranslationsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.matchAll(TRANSLATION_REGEX);
  for (const match of matches) {
    usedKeys.add(match[2]);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (
      ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(entry.name))
    ) {
      extractTranslationsFromFile(fullPath);
    }
  }
}

function flattenJson(obj, prefix = '') {
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      flattenJson(value, fullKey);
    } else {
      allTranslationKeys.add(fullKey);
    }
  }
}

function isBlackListed(key) {
  return BLACKLIST_KEY_PATTERNS.some((regex) => regex.test(key));
}

function isWhitelisted(key) {
  return WHITELIST_KEY_PATTERNS.some((regex) => regex.test(key));
}

walkDir(SRC_DIR);

const translationJson = JSON.parse(fs.readFileSync(TRANSLATION_FILE, 'utf-8'));

flattenJson(translationJson);

const unusedKeys = [...allTranslationKeys]
  .filter(isWhitelisted)
  .filter((key) => !isBlackListed(key))
  .filter((key) => !usedKeys.has(key));

if (unusedKeys.length) {
  console.log('⚠️ Unused translation keys');
  unusedKeys.forEach((key) => console.log(key));
  console.log(`\nTotal unused: ${unusedKeys.length}`);
  process.exit(1);
} else {
  console.log('✅ No unused translation keys\n');
  process.exit(0);
}
