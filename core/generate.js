module.exports = (() => {

  const AngularSPAInitializer = require('./initializers/angular_spa_initializer.js');
  const html = AngularSPAInitializer.prototype.compileHTML(AngularSPAInitializer.PATHS.script);

  return (globals) => {
    globals = globals && typeof globals === 'object' ? globals : {};
    return `<script>window.globals=${JSON.stringify(globals)};</script>${html}`;
  };

})();
