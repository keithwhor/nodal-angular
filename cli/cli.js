#!/usr/bin/env node

(function() {

  'use strict';

  const colors = require('colors/safe');
  const fs = require('fs-extra');
  const inflect = require('i')();
  const dot = require('dot');
  dot.templateSettings.strip = false;

  let command = process.argv.slice(2, 3).pop();

  command = command ? command : '_';
  command = {name: command.split(':')[0], value: command.split(':')[1] || '_'};

  let args = [];
  let flags = {};

  process.argv.slice(3).forEach(function(v) {
    let values = v.split(':');
    if (v.substr(0, 2) === '--') {
      values[0] = values[0].substr(2);
      flags[values[0]] = values[1];
    } else {
      args.push(values);
    }
  });

  let fnError = function(str) {
    console.error(colors.red.bold('Error: ') + str);
    process.exit(1);
  };
  if (!fs.existsSync(process.cwd() + '/.nodal')) {

    fnError('Cannot use nodal-ng: No Nodal project in this directory.');

  }

  let commands = {
    init: {
      _: (args, flags) => {

        if (fs.existsSync(process.cwd() + '/angular')) {
          fnError('Cannot initialize angular project --- seems you already have an angular directory present!');
        }

        fs.copySync(__dirname + '/../src/angular', process.cwd() + '/angular');
        fs.copySync(__dirname + '/../src/app/router.js', process.cwd() + '/app/router.js', {clobber: true});
        fs.copySync(__dirname + '/../src/app/controllers/index_controller.js', process.cwd() + '/app/controllers/index_controller.js', {clobber: true});

        console.log(colors.green.bold('Complete: ') + 'Angular SPA initialized successfully! Please make sure to include the angular initializer in app.js.');

      }
    },
    g: {
      page: (args, flags) => {

        let fArg = args[0] && args[0][0] || '';

        if (!fArg) {
          fnError('Must supply a page path.');
        }

        let path = ['angular', 'app', 'pages'].concat(fArg.split('/'))
          .map(v => inflect.underscore(v))
          .map(v => inflect.dasherize(v));

        let pagePath = process.cwd() + '/' + path.join('/');

        if (fs.existsSync(pagePath)) {
          fnError('This page already exists.');
        }

        for (let i = 0; i < path.length; i++) {
          let dirPath = process.cwd() + '/' + path.slice(0, i + 1).join('/');
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
          }
        }

        let data = {};
        data.controllerName = fArg.split('/')
          .map(v => inflect.underscore(v))
          .map(v => inflect.camelize(v))
          .join('') + 'Controller';

        [
          'controller.js',
          'style.scss',
          'template.html'
        ].forEach(f => {

          let template = dot.template(fs.readFileSync(__dirname + `/templates/page/${f}.template`).toString());
          fs.writeFileSync([pagePath, f].join('/'), template(data));

          console.log(colors.green.bold('Create: ') + [pagePath, f].join('/'));

        });

      },
      component: (args, flags) => {

        let fArg = args[0] && args[0][0] || '';

        if (!fArg) {
          fnError('Must supply a component path.');
        }

        if (fArg.indexOf('/') !== -1) {
          fnError('Components can not be nested within other component directories');
        }

        let data = {};
        data.componentName = inflect.camelize(inflect.underscore(fArg));
        data.componentNameDash = inflect.dasherize(inflect.underscore(fArg));

        let path = ['angular', 'app', 'components', data.componentNameDash];
        let componentPath = process.cwd() + '/' + path.join('/');

        if (fs.existsSync(componentPath)) {
          fnError('This component already exists.');
        }

        for (let i = 0; i < path.length; i++) {
          let dirPath = process.cwd() + '/' + path.slice(0, i + 1).join('/');
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
          }
        }

        [
          'directive.js',
          'style.scss',
          'template.html'
        ].forEach(f => {

          let template = dot.template(fs.readFileSync(__dirname + `/templates/component/${f}.template`).toString());
          fs.writeFileSync([componentPath, f].join('/'), template(data));

          console.log(colors.green.bold('Create: ') + [componentPath, f].join('/'));

        });

      }
    }
  };

  let execFn = commands[command.name] &&
    commands[command.name][command.value] ||
    () => { fnError('Invalid command'); };

  execFn(args, flags);

  process.exit(0);

})();
