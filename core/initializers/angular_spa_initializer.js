module.exports = (function() {

  'use strict';

  const fs = require('fs-extra');
  const sass = require('node-sass');

  class AngularSPAInitializer {

    exec(callback) {

      // Compile JavaScript, with minify flag
      let script = this.compileJavaScript(process.env.NODE_ENV === 'production');
      fs.outputFileSync(`static/${this.constructor.PATHS.script}`, script);

      // Compile css
      let css = this.compileCSS();
      fs.outputFileSync(`static/${this.constructor.PATHS.css}`, css);

      // Copy all vendor references
      fs.copySync('angular/vendor', `static/${this.constructor.PATHS.vendor}`);

      callback(null);

    }

    compileJavaScript(minify) {

      let files = [
        fs.readFileSync('angular/application.js').toString(),
        fs.readFileSync('angular/router.js').toString()
      ];

      this.readDir(
        'angular/app/factories',
        /^.*\.js$/,
        (path, filename) => files.push(fs.readFileSync(path).toString())
      );

      this.readDir(
        'angular/app/pages',
        /^.*\.js$/,
        (path, filename) => files.push(fs.readFileSync(path).toString())
      );

      this.readDir(
        'angular/app/components',
        /^.*\.js$/,
        (path, filename) => files.push(fs.readFileSync(path).toString())
      );

      return files.join('');

    }

    compileCSS() {

      let css = [];

      this.readDir(
        'angular/app/pages',
        /^.*\.scss$/,
        (path, filename) => css.push(fs.readFileSync(path).toString())
      );

      this.readDir(
        'angular/app/components',
        /^.*\.scss$/,
        (path, filename) => css.push(fs.readFileSync(path).toString())
      );

      let result = sass.renderSync({
        data: `@import 'import'; ${css.join('')}`,
        outputStyle: 'compressed',
        includePaths: ['angular/app/style']
      });

      return result.css.toString();

    };

    compileHTML(scriptPath) {

      let templates = [
        fs.readFileSync('angular/index.html').toString()
      ];

      this.readDir(
        'angular/app/pages',
        /^.*\.html$/,
        (path, filename) => {
          templates.push(
            `<script type="text/ng-template" id="${path.replace('angular/app/', '')}">`,
              fs.readFileSync(path).toString(),
            '</script>'
          );
        }
      );

      this.readDir(
        'angular/app/components',
        /^.*\.html$/,
        (path, filename) => {
          templates.push(
            `<script type="text/ng-template" id="${path.replace('angular/app/', '')}">`,
              fs.readFileSync(path).toString(),
            '</script>'
          );
        }
      );

      templates.push(`<script src="/static/${scriptPath}"></script>`);

      return templates.join('');

    }

    readDir(dirname, match, fnMatch) {

      let cwd = process.cwd();

      let files = fs.readdirSync([cwd, dirname].join('/'));

      files.forEach(filename => {

        let relPath = [dirname, filename].join('/');
        let fullPath = [cwd, relPath].join('/');

        let stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          this.readDir(relPath, match, fnMatch);
          return;
        }

        if (filename.match(match)) {

          fnMatch(relPath, filename, fullPath);

        }

      });

    }

  }

  AngularSPAInitializer.PATHS = {
    script: 'compiled/app.js',
    css: 'compiled/style.css',
    vendor: 'compiled/vendor'
  };

  return AngularSPAInitializer;

})();
