const fs = require('fs-extra');
const path = require('path');

(async () => {
  await fs.remove(path.join(__dirname, 'lib'));
  await fs.remove(path.join(__dirname, 'README.md'));
  await fs.remove(path.join(__dirname,'bin', 'run'));
  await fs.copy(path.join(__dirname, 'README_template.md'), path.join(__dirname, 'README.md'));
})();
