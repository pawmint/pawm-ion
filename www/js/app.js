// Ionic PAWM App

var app = angular.module('pawm', ['ionic'])

.run(['$ionicPlatform', 'SystemInfo', '$rootScope', function($ionicPlatform, SystemInfo, $rootScope) {
  $ionicPlatform.ready(function() {

    // Registration loop
    var needToRegister = 0;
    var register = function(){
      SystemInfo.freshRegistration = false;
      var push = new Ionic.Push({
        "debug": false
        });
      
      push.register(function(token){
        SystemInfo.freshRegistration = true;
        console.log("Device token:",token.token);
        SystemInfo.deviceToken = token.token;
        $rootScope.$apply(); // seem to be needed
        // Stop trying to register
        window.clearInterval(needToRegister);
      });
    };
    register();
    var needToRegister = window.setInterval(function(){
        if (SystemInfo.freshRegistration == false) {
          alert("Please, make sure you are connected. ");
          register();
        }
      },
      10000);
    // End of registration loop

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

app.factory('SystemInfo', function() {
  var SystemInfo = {
    deviceToken: '',
  };
  return SystemInfo;
})
.controller("basicView", ['$scope', 'SystemInfo', function($scope, SystemInfo) {
  $scope.SystemInfo = SystemInfo;
  $scope.getDeviceToken = function() {return SystemInfo.deviceToken;}

  $scope.showToken = function() {alert(SystemInfo.deviceToken)}
}])
.directive('textarea', function() {
  return {
  restrict: 'E',
  link: function(scope, element, attr){
    var update = function(){
      element.css("height", "auto");
      var height = element[0].scrollHeight;
      element.css("height", element[0].scrollHeight + "px");
    };
    scope.$watch(attr.ngModel, function(){
      update();
    });
  }
  };
});