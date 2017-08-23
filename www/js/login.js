var login = angular.module('login_Ubismart', [])
.run(function(){
  console.log(":: login_Ubismart module loaded");
})
.factory('AuthenticationService', ['$http', function($http){
  var AS = {
    login: function(username, password, device) {
      // Send credentials in order to bound them to the device token
      var form = new FormData();
      form.append('action', 'login');
      form.append('username', username);
      form.append('password', password);
      form.append('regId', device);

      var res = $http.post('https://icost.ubismart.org/service/appBroker', form, {
        headers: {
          'Content-Type': undefined
        } // undefined => Content-Type will be set automatically to 'multipart/form-data' and will fill correctly the boundary parameter
      })
      .success(function(res){
        console.log(res);
      })
      .error(function(err){
        console.log(err);
      });
      return res;
    },
    logout: function(device) {
      // Send info in order to unbound them from the device token
      var form = new FormData();
      form.append('action', 'logout');
      form.append('regId', device);

      var res = $http.post('https://icost.ubismart.org/service/appBroker', form, {
        headers: {
          'Content-Type': undefined
        } // undefined => Content-Type will be set automatically to 'multipart/form-data' and will fill correctly the boundary parameter
      })
      .success(function(res){
        console.log(res);
      })
      .error(function(err){
        console.log(err);
      });
      return res;

    }
  };
  return AS;
}])

