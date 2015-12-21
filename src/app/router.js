module.exports = (function() {

  "use strict";

  const Nodal = require('nodal');
  const router = new Nodal.Router();

  const IndexController = Nodal.require('app/controllers/index_controller.js');
  const StaticController = Nodal.require('app/controllers/static_controller.js');

  /* generator: begin imports */

  /* generator: end imports */

  /* generator: begin routes */

  /* generator: end routes */

  router.route(/^\/static\/(.*)/, StaticController);
  router.route(/^.*$/, IndexController);

  return router;

})();
