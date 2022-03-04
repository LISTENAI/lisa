const fs = require('fs-extra');
const path = require('path');
(async () => {
  await fs.rename(path.join(__dirname,'lib','run.js'), path.join(__dirname,  'bin','run'));
})();
