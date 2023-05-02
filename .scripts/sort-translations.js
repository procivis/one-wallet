const shell = require('shelljs');
const translationDirs = [`${__dirname}/../app/i18n/de`, `${__dirname}/../app/i18n/en`];
const translationsToSort = shell.find(translationDirs).filter(function (file) {
  return file.endsWith('.json');
});
for (const translationFile of translationsToSort) {
  shell.exec(`${__dirname}/../node_modules/.bin/sort-json --indent-size=2 ${translationFile}`);
}
