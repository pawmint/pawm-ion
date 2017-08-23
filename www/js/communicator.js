var login = angular.module('communicator_Ubismart', [])
.factory('CommunicatorService', ['$http', function($http){
  var AS = {
    event: function(type) {
      // Send credentials in order to bound them to the device token
      var form = new FormData();
      form.append('action', 'event');
      form.append('eventType', type);
      form.append('authToken', localStorage.authToken);

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

