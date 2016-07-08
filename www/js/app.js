// Ionic PAWM App

var app = angular.module('pawm', ['ionic'])

.run(['$ionicPlatform', 'SystemInfo', '$rootScope', function($ionicPlatform, SystemInfo, $rootScope) {
  $ionicPlatform.ready(function() {
    var push = new Ionic.Push({
      "debug": true
      });

    push.register(function(token) {
      console.log("Device token:",token.token);
    });


    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}]);
