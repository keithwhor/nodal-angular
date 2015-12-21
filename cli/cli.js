#!/usr/bin/env node

(function() {

  'use strict';

  const colors = require('colors/safe');
  const fs = require('fs-extra');
  const inflect = require('i')();

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
    }
  };

  let execFn = commands[command.name] &&
    commands[command.name][command.value] ||
    () => { fnError('Invalid command'); };

  execFn(args, flags);

  process.exit(0);

})();
