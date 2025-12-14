const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../app');
const TRANSLATIONS_DIR = path.join(
  __dirname,
  '../app/i18n/',
)
const LANGUAGES = ['en', 'de', 'fi'];
const TRANSLATION_REGEX = /translate\(\s*(['"])(.*?)\1/g;

// additional translation keys present in source but not automatically picked up
const ADDITIONAL_SOURCE_KEY_PATTERNS = [
  /^common\.pinCodeSet$/,
  /^error\.incompatibleKeyStorageType$/,
  /^historyAction\./,
  /^historyEntityType\./,
  /^info\.settings\.security\.rse\.pinCodeSet\.title$/,
  /^info\.invitation\.process\.bleAdapterUnavailable\.title$/,
  /^info\.invitation\.process\.blePermissionMissing\.title$/,
  /^info\.invitation\.process\.internetDisabled\.title$/,
  /^info\.invitation\.process\.internetUnreachable\.title$/,
  /^licenceDetailsScreen\.licence(s)?$/,
  /^licenceDetailsScreenLibraryLink.(documentation|vcs|website)$/,
  /^passwordStrength\.(level|tip)\./,
  /^(rseChangePin|rsePinSetup)\.(checkCurrentPin|confirmPin|setPin)\.(instruction|title)$/,
  /^securityBiometricsSetTitle\.(dis|en)abled$/,
  /^shareDisclaimer\.(noUrls|ppOnly|tosAndPp|tosOnly)$/,
  // LoaderViewState translations
  /^(createBackupProcessing|credentialDeleteTitle|credentialOfferTitle|credentialUpdateTitle|deleteWalletProcessTitle|invitationProcessTitle|proofRequestProcessTitle|restoreBackupProcessing)\.(error|inProgress|success|warning)$/,
  // PIN change stage translations
  /^(onboardingPinCodeScreen|onboardingPinCodeScreenChange)\.(check|confirm|initial)\.(title|subtitle)$/,
];

function extractTranslationsFromFile(filePath, usedKeys) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.matchAll(TRANSLATION_REGEX);
  for (const match of matches) {
    usedKeys.add(match[2]);
  }
}

function walkDir(dir, usedKeys) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, usedKeys);
    } else if (
      ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(entry.name))
    ) {
      extractTranslationsFromFile(fullPath, usedKeys);
    }
  }
}

function loadTranslation(lang) {
  const fn = path.join(
    TRANSLATIONS_DIR,
    lang,
    'translation.json',
  );
  const translationJson = JSON.parse(fs.readFileSync(fn, 'utf-8'));
  let translationKeys = new Set();
  flattenJson(translationKeys, translationJson);
  return translationKeys;
}

function flattenJson(translationKeys, obj, prefix = '') {
  for (const key in obj) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      flattenJson(translationKeys, value, fullKey);
    } else {
      translationKeys.add(fullKey);
    }
  }
}


// traverse source directory and find all used translation keys
let usedKeysInSource = new Set();
walkDir(SRC_DIR, usedKeysInSource);

// check each language for problems
let hasProblems = false;
LANGUAGES.forEach(lang => {
  console.log(`🔍 Checking ${lang}`);

  let langTranslationKeys = loadTranslation(lang);

  // check for unused keys
  const unusedKeys = [...langTranslationKeys]
    .filter((key) => !usedKeysInSource.has(key))
    .filter((key) => !ADDITIONAL_SOURCE_KEY_PATTERNS.some((regex) => regex.test(key)));

  if (unusedKeys.length) {
    console.log(`❌ Unused translation keys (total ${unusedKeys.length})`);
    unusedKeys.forEach((key) => console.log(key));
    hasProblems = true;
  } else {
    console.log('✨ No unused translation keys');
  }

  // check for missing keys
  const missingKeys = [...usedKeysInSource]
    .filter(key => !langTranslationKeys.has(key));

  if (missingKeys.length) {
    console.log(`⚠️ Missing translation keys (total ${missingKeys.length})`);
    missingKeys.forEach(key => console.log(key));
  } else {
    console.log('✨ No missing translation keys');
  }
  console.log();
});

if (hasProblems) {
  process.exit(1);
}
process.exit(0);
