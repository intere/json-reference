'use strict';

angular.module('angularUiApp')
  .controller('MainCtrl', function ($scope, $http) {


  	$http.get('http://localhost:8021/test.json').success(
  		function(results) {
  			$scope.error = undefined;
  			$scope.data = results;
	  	}).error(function(error) {
	  		$scope.data = undefined;
	  		$scope.error = ( error && error != "" ? $scope.error : 
	  			'Error getting url: ' + arguments[3].url);
	  	});

	$scope.showData = function() {
		if($scope.data) {
			return JSON.stringify($scope.data);
		} else if($scope.error) {
			return "ERROR: \n" + JSON.stringify($scope.error);
		}
	}

  });
