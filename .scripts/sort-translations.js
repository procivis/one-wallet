const shell = require('shelljs');
const translationDirs = [
  `${__dirname}/../app/i18n/de`,
  `${__dirname}/../app/i18n/en`,
];
const translationsToSort = shell.find(translationDirs).filter(function (file) {
  return file.endsWith('.json');
});

// also check that translations are nested fully, with no (partially) inlined keys
const checkKeysDontContainSeparators = (obj, path, filename) => {
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      if (key.includes('.')) {
        throw new Error(`Invalid key in ${filename} at path: ${fullPath}`);
      }
      checkKeysDontContainSeparators(obj[key], fullPath, filename);
    }
  }
};
for (const translationFile of translationsToSort) {
  checkKeysDontContainSeparators(require(translationFile), '', translationFile);
}

for (const translationFile of translationsToSort) {
  shell.exec(
    `${__dirname}/../node_modules/.bin/sort-json --indent-size=2 ${translationFile}`,
  );
}
