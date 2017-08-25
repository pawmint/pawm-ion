var app = angular.module('pawm', ['ionic', 'login_Ubismart', 'communicator_Ubismart'])

.run(['$ionicPlatform', '$ionicPopup', 'SystemInfo', 'AuthenticationService', 'CommunicatorService', '$rootScope', '$window', function($ionicPlatform, $ionicPopup, SystemInfo, AuthenticationService, CommunicatorService, $rootScope, $window) {
  $ionicPlatform.ready(function() {

    var register = function(){
      SystemInfo.registrationEnded = false;
      var push = new Ionic.Push({
        "debug": false,
        "onNotification": function(notification) {
          var payload = notification.payload;
          //$ionicPopup.alert({title: payload.text});
          if (payload.type == 'ask') {
            // $apply is needed: in case of app in foreground
            $rootScope.$apply(function(){
              SystemInfo.status = 'ask';
            });
          }
          else if (payload.type == 'suggest') {
            // $apply is needed: in case of app in foreground
            $rootScope.$apply(function(){
              SystemInfo.suggestions = payload.suggestions;
              SystemInfo.status = 'suggest';
            });
          }
          if (payload.type == 'survey') {
            $rootScope.startSurvey();
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

  // Show Resident survey
  $rootScope.startSurvey = function() {
    $window.open('https://qlite.az1.qualtrics.com/SE?Q_DL=9Hy17v81x8JpDtb_56dB4S6sMAy1wCF_MLRP_3WZVhDt5V8s9nRb&Q_CHL=gl','_system','location=no');
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
  // Ask options form (open on notification arriving)
  $scope.ask = function() {SystemInfo.status='ask'};
  $scope.suggest = function() {SystemInfo.status='suggest'};

  // Show UbiSMART interface view of My Services
  $scope.startUbiSmartWeb = function() {
    // TODO: Verify the localStorage.authToken is VALID!
    $window.open('https://icost.ubismart.org/service/appBroker?action=authByToken&authToken=' + encodeURIComponent(localStorage.authToken),'_system','location=no');
  };
}])
.controller("askController", ['$scope', 'SystemInfo', 'AuthenticationService', 'CommunicatorService', '$ionicPopup', '$timeout', '$rootScope', function($scope, SystemInfo, AuthenticationService, CommunicatorService, $ionicPopup, $timeout, $rootScope) {
  $scope.SystemInfo = SystemInfo;
  $scope.options = [
    {text: "Going to work", value: "work"},
    {text: "Get some leisure", value: "leisure"},
    {text: "Go for a walk", value: "walk"},
    {text: "None of your business", value: "none"}
    ];
  $scope.feedback = function(option) {
  var infoDialog = $ionicPopup.alert({title:"Selected: '" + option.value + "'", buttons: []});
  $timeout(function() {
    infoDialog.close(); //close the popup after a short while
  }, 1000);
  CommunicatorService.event(option.value)
  .then(function(res){
    // $apply is needed: in case of app in foreground
    console.log("res", res)
    SystemInfo.suggestions = function(data) {
      var result = {};
      // Add sleep data
      result.sleep = data.sleep;
      result.sleep.sleptWell = ('true' == data.sleep.sleptWell[0]);
      console.log("sleptWell:", result.sleep.sleptWell);

      // Transform weather: [{weather: 'text'}, {weather: 'text2}] to ['text', 'text2']
      result.weather = [];
      angular.forEach(data.weather, function(item, key) {
        result.weather.push(item.weather);
      });

      // Transform Uris into words
      result.mobility = [];
      angular.forEach(data.mobility, function(item, key) {
        result.mobility.push(item.mobilityUri.split(':')[1].replace(/[A-Z][a-z]/g, ' $&').replace(/^ /,''));
      });

      console.log("RESULT", result);
      return result;
      
    }(res.data);
      SystemInfo.status = 'suggest';
  });
  //$ionicPopup.alert({title:"Something went wrong", template: JSON.stringify(response.err)});
  //else {

  //}
  };
  }])
.controller("suggestController", ['$scope', 'SystemInfo', 'AuthenticationService', 'CommunicatorService', '$ionicPopup', '$timeout', function($scope, SystemInfo, AuthenticationService, CommunicatorService, $ionicPopup, $timeout) {
  $scope.SystemInfo = SystemInfo;
  $scope.suggestions = function() { return SystemInfo.suggestions };

  $scope.feedback = function(option) {
  var infoDialog = $ionicPopup.alert({title:"Selected: '" + option.value + "'", buttons: []});
  CommunicatorService.event(option.value);
  $timeout(function() {
    infoDialog.close(); //close the popup after a short while
  }, 1000);

  };
  }])
;
