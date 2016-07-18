// Ionic PAWM App

var app = angular.module('pawm', ['ionic', 'login_Ubismart'])

.run(['$ionicPlatform', '$ionicPopup', 'SystemInfo', '$rootScope', function($ionicPlatform, $ionicPopup, SystemInfo, $rootScope) {
  $ionicPlatform.ready(function() {

    var register = function(){
      SystemInfo.registrationEnded = false;
      var push = new Ionic.Push({
        "debug": false,
        "onNotification": function(notification) {
          var payload = notification.payload;
          $ionicPopup.alert({title: payload.text});
        },
        "pluginConfig": {
          "android": {
            "iconColor": "#59E0E0"
          }
        }
        // Following command shows an alert "Hello" if the app is in foreground:
        // curl -X POST -H "Authorization: Bearer <ionic-app-id>" -H "Content-Type: application/json" -d '{"tokens": ["<device-id>"],"profile": "testing","notification": {"message": "Please, open the app.", "payload":{"text":"Hello"}} }' "https://api.ionic.io/push/notifications"

      });

      // Undocumented feature?
      push.errorCallback = function(e) {
        // If the push registration fails, show a popup that exits the app
        SystemInfo.registrationEnded = true;
        if (e.message == "SERVICE_NOT_AVAILABLE") {
          var errorPopup = $ionicPopup.alert({
            title: "Warning",
            template: "Internet connection not available.",
            okText: "Try later",
            okType: 'button-assertive',
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
}])

// Service providing system informations
.factory('SystemInfo', function() {
  var SystemInfo = {
    deviceToken: '',
  };
  return SystemInfo;
})

// The basic controller
.controller("basicView", ['$scope', 'SystemInfo', 'AuthenticationService', '$ionicPopup', function($scope, SystemInfo, AuthenticationService, $ionicPopup) {
  $scope.SystemInfo = SystemInfo;
  $scope.showToken = function() {alert(SystemInfo.deviceToken)}
  $scope.showAuthToken = function() {$ionicPopup.alert({title: "AuthToken", template: localStorage.authToken})}
  $scope.showLogin = function() {
    var login = {username: 'username', password: 'password'}
    $scope.login = login;
    $ionicPopup.confirm({
      title: 'Authenticate',
      templateUrl: 'templates/login_form.html',
      scope: $scope,
      cancelText: 'Exit',
      cancelType: 'button-assertive'
    }).then(function(confirmation){
      if (confirmation) {
        AuthenticationService.login($scope.login.username, $scope.login.password, SystemInfo.deviceToken)
        .then(function(res){
          // Save the token for further requests
          localStorage.authToken = res.data.authToken;
          console.log(res);
          $ionicPopup.alert({title: res.data.message});
        });
      } else {
          ionic.Platform.exitApp();
      };
    });
  };
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