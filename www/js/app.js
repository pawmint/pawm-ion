// Ionic PAWM App

var app = angular.module('pawm', ['ionic'])

.run(['$ionicPlatform', '$ionicPopup', 'SystemInfo', '$rootScope', function($ionicPlatform, $ionicPopup, SystemInfo, $rootScope) {
  $ionicPlatform.ready(function() {

    var register = function(){
      SystemInfo.registrationEnded = false;
      var push = new Ionic.Push({
        "debug": false
        });

      // Undocumented feature?
      push.errorCallback = function(e) {
        // If the push registration fails, show a popup that exits the app
        SystemInfo.registrationEnded = true;
        if (e.message == "SERVICE_NOT_AVAILABLE") {
          var errorPopup = $ionicPopup.show({
            title: "Warning",
            template: "Internet connection not available",
            buttons: [
              {
                text: "Try later",
                type: 'button-positive',
                onTap: function(e) {
                  ionic.Platform.exitApp();
                }
              }
            ]
          });
          errorPopup.then(function(res){
            ionic.Platform.exitApp();
          });
          return;
        }
        // In other cases just show a classical error message
        alert(e.message);
      };
      push.register(function(token){
        SystemInfo.registrationEnded = true;
        SystemInfo.deviceToken = token.token;
        $rootScope.$apply(); // seem to be needed
      });
    };
    register();

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