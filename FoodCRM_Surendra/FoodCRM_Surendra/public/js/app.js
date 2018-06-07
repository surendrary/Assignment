var app = angular.module('FoodCRMAPP', ['ui.bootstrap']);

//Main Contoller for the webpage
app.controller('FoodController', ['$scope','$http', function($scope,$http){
    /*
        Get request to get the contact information.
     */
    $http({
        method:"GET",
        url:"/read"
    }).success(function (data) {

            var data = data.food;
            if(data.length >0) {
                $scope.food = JSON.parse(data);
            }
            else{
                $scope.data = [];
            }
    })

    /*
        Status for the dropdown on screen.
     */
    $scope.statuses = [{
          "color":"red"
        }, {
          "color":"yellow"
        }, {
          "color":"green"
        
        }];
    //default sort by name.
	$scope.sortKey = 'name';

	//function to sort on click of column headers.
	$scope.sort = function(keyname){
        $scope.sortKey = keyname;  
    }
	
	$scope.openSorting = function(column) {
		$scope.sortKey = column;	
		$scope.reverse = !$scope.reverse;
		
	};

	// function on update of status for any contact.
	$scope.update = function(color){
		var data = $scope.food;
		
		for (var key in data) {
		  
			var obj = data[key];
			if(obj.name == color.user.name && obj.email == color.user.email)
				data[key].color = color.user.color;
		  
		}
		
		/*
		    Call to backend to persist the changes to contact informations.
		 */
        var req = {
            method: 'POST',
            url: '/update',

            data: $scope.food
        }

        $http(req).then(console.log("done"));
	};
}]);
