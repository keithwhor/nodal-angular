module.exports = (function() {

  return {
    Initializer: require('./initializers/angular_spa_initializer.js'),
    generate: require('./generate.js')
  };

})();
