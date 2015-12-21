module.exports = (function() {

  'use strict';

  const Nodal = require('nodal');
  
  const fs = require('fs-extra');
  const sass = require('node-sass');

  class AngularSPAInitializer {

    exec(app, callback) {

      let paths = {
        script: 'compiled/app.js',
        css: 'compiled/style.css',
        vendor: 'compiled/vendor'
      };

      // Compile JavaScript, with minify flag
      let script = this.compileJavaScript(Nodal.my.Config.env === 'production');
      fs.outputFileSync(`static/${paths.script}`, script);

      // Compile css
      let css = this.compileCSS();
      fs.outputFileSync(`static/${paths.css}`, css);

      // Copy all vendor references
      fs.copySync('angular/vendor', `static/${paths.vendor}`);

      // Compile templates
      let html = this.compileHTML(paths.script);

      // Set SPA function
      app.angularSPA = (globals) => {
        globals = globals && typeof globals === 'object' ? globals : {};
        return `<script>window.globals=${JSON.stringify(globals)};</script>${html}`;
      };

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

  return AngularSPAInitializer;

})();
