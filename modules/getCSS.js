const fs = require('fs');
const sass = require('node-sass');
const less = require('less');
const finder = require('./finder');

module.exports = function(port) {
  return function(path, cb) {
    finder(path, (err, { files }) => {
      if (err) return console.log(err);

      let rendered = 0;
      const compiler = /\.scss$/.test(files[0]) ? "sass" : /\.less/.test(files[0]) ? "less" : null;
      const styles = [];
      const addStyle = (css, fileName) => {
        rendered++;
        if (css) styles.push({ css, fileName });

        if (rendered === files.length) return cb(styles);
      };

      try {
        files.forEach(file => {
          const fileName_parts = file.split(/\/|\\/);
          const fileName = fileName_parts && fileName_parts[fileName_parts.length - 1];
          const filePath = file.replace(path + '\\', '').replace(/\\/g, '/');

          if (compiler === "sass") {
            sass.render({ file, outputStyle: 'compressed', includePaths: [path], sourceMapEmbed: true, sourceMapContents: true }, (error, output) => {
              if (error) return console.log(`\x1b[91mError occured in SASS preprocessor\x1b[0m`, error.message);
              addStyle(output.css.toString(), fileName);
            });
          } else if (compiler === "less") {
            less.render(fs.readFileSync(file, 'utf8'), { filename: filePath, sourceMap: { sourceMapFileInline: true, outputSourceFiles: true } }, (error, output) => {
              if (error) return console.log(`\x1b[91mError occured in LESS preprocessor\x1b[0m`, error.message);
              addStyle(output.css, fileName);
            });
          } else {
            addStyle(fs.readFileSync(file, 'utf8') + `\n/*# sourceURL=http://localhost:${port}/${filePath} */\n`, fileName);
          }
        });
      } catch (error) {
        console.log({ error });
        console.log({ message: error.message });
      }
    });
  }
}