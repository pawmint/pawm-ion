var app = angular.module('pawm', ['ionic', 'login_Ubismart', 'communicator_Ubismart'])

.run(['$ionicPlatform', '$ionicPopup', 'SystemInfo', 'AuthenticationService', 'CommunicatorService', '$rootScope', function($ionicPlatform, $ionicPopup, SystemInfo, AuthenticationService, CommunicatorService, $rootScope) {
  $ionicPlatform.ready(function() {

    var register = function(){
      SystemInfo.registrationEnded = false;
      var push = new Ionic.Push({
        "debug": false,
        "onNotification": function(notification) {
          var payload = notification.payload;
          //$ionicPopup.alert({title: payload.text});
          if (payload.type == 'suggest') {
            // $apply is needed: in case of app in foreground
            $rootScope.$apply(function(){
              SystemInfo.status = 'suggest';
            });
          }
          if (payload.type == 'survey') {
            // $apply is needed: in case of app in foreground
            $rootScope.$apply(function(){
              SystemInfo.status = 'survey';
            });
          }
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

    $scope=$rootScope;

    $rootScope.loggingInOut = function() {
    if (!SystemInfo.isLoggedIn()) {
      $scope.showLogin();
    } else {
      $scope.performLogout();
    }
  };
  $rootScope.showLogin = function() {
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
  $rootScope.performLogout = function() {
    delete localStorage.removeItem('authToken');
    AuthenticationService.logout(SystemInfo.deviceToken);
  };

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
    isLoggedIn: function() {
      // User is considered to be logged if in possession of an authToken
      return !!localStorage.authToken;
    }
  };
  return SystemInfo;
})

// The basic controller

.controller("basicView", ['$scope', 'SystemInfo', 'AuthenticationService', 'CommunicatorService', '$ionicPopup', '$window', function($scope, SystemInfo, AuthenticationService, CommunicatorService, $ionicPopup, $window) {
  $scope.SystemInfo = SystemInfo;
  $scope.showToken = function() {alert(SystemInfo.deviceToken)}
  $scope.showAuthToken = function() {$ionicPopup.alert({title: "AuthToken", template: localStorage.authToken})}
  $scope.sendEvent = function(type) {
      CommunicatorService.event(type).then(function(res){
        $ionicPopup.alert({title: res.data.message});
      });
  };
  // Suggestions form (open on notification arriving)
  $scope.suggest = function() {SystemInfo.status='suggest'};

  // Show UbiSMART interface view of My Services
  $scope.startUbiSmartWeb = function() {
    // TODO: Verify the localStorage.authToken is VALID!
    $window.open('https://touch-sg.ubismart.org/service/appBroker?action=authByToken&authToken=' + encodeURIComponent(localStorage.authToken),'_system','location=no');
  };
  
}])
.controller("suggestController", ['$scope', 'SystemInfo', 'AuthenticationService', 'CommunicatorService', '$ionicPopup', function($scope, SystemInfo, AuthenticationService, CommunicatorService, $ionicPopup) {
  $scope.SystemInfo = SystemInfo;
  $scope.suggestions = [
    {text: "SAC?"},
    {text: "Go for a walk?"},
    {text: "Cook?"},
    {text: "Drink some water?"},
    {text: "Nothing"},
    ];
  }])
.controller("surveyController", ['$scope', 'SystemInfo', '$ionicPopup', function($scope, SystemInfo, $ionicPopup) {
  $scope.SystemInfo = SystemInfo;
  $scope.ask = function() {
    $ionicPopup.alert("Please, help us by answering some questions.");
  };
  $scope.back = function() {
    SystemInfo.status = undefined;
  };
  }])
;
