app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(true);

  $stateProvider

    .state(
      'root',
      {
        templateUrl: 'pages/root/template.html',
      }
    )

      .state(
        'root.index',
        {
          url: '/',
          templateUrl: 'pages/root/index/template.html'
        }
      )

  $urlRouterProvider.otherwise('/');

});
