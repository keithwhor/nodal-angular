module.exports = (function() {

  'use strict';

  const Nodal = require('nodal');

  class IndexController extends Nodal.Controller {

    get() {

      this.render(
        this.app.angularSPA({
          api_url: Nodal.my.Config.secrets.api_url
        })
      );

    }

  }

  return IndexController;

})();
