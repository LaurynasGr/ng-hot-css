const fs = require('fs');
const path = require('path');

module.exports = function(initialPath, cb) {
  const checkedDirs = [];
  const include = /\.component\.css|\.component\.scss|\.component\.less/;
  const exclude = /node_modules|\.git/;
  const scrPath = path.resolve(initialPath, 'src');
  const indexStyle = fs.readdirSync(scrPath).filter(fileName => ["styles.css", "styles.less", "styles.scss"].includes(fileName))[0];

  if (!indexStyle) return cb(`\x1b[91mUnsupported stylesheet type detected!\nOnly the following filetypes are supported:\n  .less (using LESS preprocessor)\n  .scss (using SASS preprocessor)\n  .css (using no preprocessor)\x1b[0m`);

  const files = [path.resolve(scrPath, indexStyle)];

  let totalFilesChecked = 0;
  let totalDirsChecked = 0;

  (function gatherFiles(dir) {
    const dirPath = path.resolve(dir);

    if (dirPath.match(exclude) || /^\./.test(dirPath)) return;

    totalDirsChecked++;
    if (!checkedDirs.includes(dirPath)) checkedDirs.push(dirPath);

    fs.readdirSync(dirPath).forEach(file => {
      const fullPath = path.resolve(dirPath, file);

      if (fullPath.match(exclude) || /^\./.test(fullPath)) return;
      if (fs.lstatSync(fullPath).isDirectory()) return gatherFiles(fullPath);

      totalFilesChecked++;

      if (fullPath.match(include)) files.push(fullPath);
    });
  })(initialPath + '/src/app/');

  cb(null, { files, checkedDirs, totalDirsChecked, totalFilesChecked });
}