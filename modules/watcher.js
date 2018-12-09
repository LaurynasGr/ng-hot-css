const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

module.exports = function(rootPath, { included = /./, ignored } = {}, cb) {
  const cache = {};
  const watcher = chokidar.watch(path.resolve(rootPath, 'src'), { ignored, persistent: true });
  let performingActions = false;

  watcher.on('change', fileName => {
    if (performingActions) return;

    const filePath = path.resolve(rootPath, fileName);
    if (!filePath.match(included)) return;

    performingActions = true;

    setTimeout(() => {
      fs.readFile(filePath, 'utf8', (err, content) => {
        performingActions = false;
        if (err) return; // console.log(`\x1b[91mError has occured in the watcher. ${err.message}\x1b[0m`);
        if (cache[fileName] === content) return;

        cache[fileName] = content;

        cb(filePath, content, content.length);
      });
    }, 50);
  });
};