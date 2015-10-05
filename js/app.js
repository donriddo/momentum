angular.module('myApp', ['ngRoute'])
.provider('Weather', function() { var apiKey = "";
this.setApiKey = function(key) {
  if (key) this.apiKey = key;
};
var apiKey = "";
// ...
this.getUrl = function(type, ext) {
  return "http://api.wunderground.com/api/" + this.apiKey + "/" + type + "/q/" + ext + '.json';
};
this.$get = function($q, $http) {
  var self = this;
  return {
    getWeatherForecast: function(city) {
      var d = $q.defer();
      $http({
        method: 'GET',
        url: self.getUrl("forecast", city),
        cache: true
      })
      .success(function(data) {
    // The wunderground API returns the
    // object that nests the forecasts inside // the forecast.simpleforecast key
    d.resolve(data.forecast.simpleforecast);
    }).error(function(err) { d.reject(err);
    });
    return d.promise;
  }
}
};
})
.config(function($routeProvider, WeatherProvider) {
  WeatherProvider.setApiKey('876385ebdb3d6520');
    $routeProvider
    .when('/', {
      templateUrl: 'templates/home.html',
      controller: 'MainController'
    })
    .when('/settings', {
      templateUrl: 'templates/settings.html',
      controller: 'SettingsController'
    })
    .otherwise({redirectTo: '/'});
})
.factory('UserService', function ($location) {
  var defaults = {
    location: 'autoip',
    name: "Don Riddo"
  };
var service = { user: {},
save: function() {
      sessionStorage.momentum = angular.toJson(service.user);
      $location.path('/');
},
restore: function() {
      // Pull from sessionStorage
      service.user =
        angular.fromJson(sessionStorage.momentum) || defaults
        return service.user; }
};
// Immediately call restore from the session storage // so we have our user data available immediately
service.restore();
return service;
})
.controller('MainController', function($scope, $timeout, Weather, UserService) {
  // Build the date object
  $scope.date = {};

  $scope.user = UserService.user;
  var greeting = function () {
    var dater = new Date();
    if (dater.getHours() < 12) {
      return "Good Morning " + $scope.user.name;
    } else if (dater.getHours() >= 12 && dater.getHours() <= 16) {
      return "Good Afternoon " + $scope.user.name;
    } else {
      return "Good Evening " + $scope.user.name;
    }
  };
var updateTime = function() {
  $scope.date.raw = new Date();
  $scope.date.greeting = greeting();
  $timeout(updateTime, 1000);
}
  // Kick off the update function
  updateTime();

  $scope.weather = {}
$scope.user = UserService.user;
Weather.getWeatherForecast($scope.user.location)
.then(function(data) {
  $scope.user.city = data.forecastday[0].date.tz_long.split('/')[1];
  $scope.weather.forecast = data;
});
})
.controller('SettingsController', function ($scope, UserService) {
   $scope.user = UserService.user;
   $scope.save = function() {
     UserService.save();
   };
});
