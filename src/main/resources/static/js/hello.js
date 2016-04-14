angular.module('hello', [])
.directive('tagManager', function() {
    return {
        restrict: 'E',
        scope: {
          tags: '=',
          autocomplete: '=autocomplete'
        },
        template:
            '<div class="tags">' +
      			'<div ng-repeat="(idx, tag) in tags" class="tag label label-success">{{tag}} <a class="close" href ng-click="remove(idx)">×</a></div>' +
            '</div>' +
            '<div class="input-group"><input type="text" class="form-control" placeholder="add a tag..." ng-model="newValue" /> ' +
            '<span class="input-group-btn"><a class="btn btn-default" ng-click="add()">Add</a></span></div>',
        link: function ( $scope, $element ) {
            
      		var input = angular.element($element).find('input');

      		// setup autocomplete
      		if ($scope.autocomplete) {
              $scope.autocompleteFocus = function(event, ui) {
                input.val(ui.item.value);
                return false;
              };
              $scope.autocompleteSelect = function(event, ui) {
                $scope.newValue = ui.item.value;
                $scope.$apply( $scope.add );
                
                return false;
              };
              $($element).find('input').autocomplete({
                    minLength: 0,
                    source: function(request, response) {
                      var item;
                      return response((function() {
                        var _i, _len, _ref, _results;
                        _ref = $scope.autocomplete;
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                          item = _ref[_i];
                          if (item.toLowerCase().indexOf(request.term.toLowerCase()) !== -1) {
                            _results.push(item);
                          }
                        }
                        return _results;
                      })());
                    },
                    focus: (function(_this) {
                      return function(event, ui) {
                        return $scope.autocompleteFocus(event, ui);
                      };
                    })(this),
                    select: (function(_this) {
                      return function(event, ui) {
                        return $scope.autocompleteSelect(event, ui);
                      };
                    })(this)
                  });
            }	
                  

             // adds the new tag to the array
            $scope.add = function() {
  				// if not dupe, add it
  				if ($scope.tags.indexOf($scope.newValue)==-1){
                	$scope.tags.push( $scope.newValue );
                }
                $scope.newValue = "";
            };
            
            // remove an item
            $scope.remove = function ( idx ) {
                $scope.tags.splice( idx, 1 );
            };
            
            // capture keypresses
            input.bind( 'keypress', function ( event ) {
                // enter was pressed
                if ( event.keyCode == 13 ) {
                    $scope.$apply( $scope.add );
                }
            });
        }
    };
})
.directive('upload', function (httpPostFactory) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attr) {

            element.bind('change', function () {
                var formData = new FormData();
                formData.append('file', element[0].files[0]);
                httpPostFactory('/resource/editphoto', formData, function (callback) {
                	
     
                	console.log(callback);
                });
            });

        }
    };
})
.factory('httpPostFactory', function ($http) {
    return function (file, data, callback) {
    	console.log("UPLOAD")
    	
        $http({
            url: file,
            method: "POST",
            data: data,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        }).success(function (response) {
        	
        	
        	console.log("Upload Successfull");
        	//load profile photo
        	window.location.reload();
        	
           // callback(response);
        });
    };
})
.controller('home',

function($scope, $http) {
	
	function _arrayBufferToBase64( buffer ) {
	    var binary = '';
	    var bytes = new Uint8Array( buffer );
	    var len = bytes.byteLength;
	    for (var i = 0; i < len; i++) {
	        binary += String.fromCharCode( bytes[ i ] );
	    }
	    return window.btoa( binary );
	}
	
	$scope.tags = [];
    $scope.allTags = [];
	
	 $scope.template = "pages/partials/dashboard.html";
	
	console.log('Loading')

	$http.get('user').success(function(data) {
		if (data.firstName) {
			$scope.authenticated = true;
			$scope.user = data;
			$http.get('/resource/').success(function(data) {
				$scope.greeting = data;
				
				//load profile photo
				$http.get('/resource/profilephoto', {responseType: "arraybuffer"}).
			    success(function(data2) {
			        $scope.profilePhoto = 'data:image/jpeg;base64,' + _arrayBufferToBase64(data2);
			    });
				
			})
		} else {
			$scope.authenticated = false;
		}
	}).error(function() {
		$scope.authenticated = false;
	});


	
	$scope.dashboard = function() {
        $scope.template = "pages/partials/dashboard.html";
    };
	
    
    $scope.editprofile = function() {
    
        $scope.template = "pages/partials/editprofile.html";
   
    };
    
    
    $scope.editresume = function() {
    	
    	
    	 
        $http.get('/resource/skills/allwithuser/')
        .success(function(data) {
        	
			$scope.tags = data.user;//[ 'bootstrap', 'list', 'angular' ];
			$scope.allTags = data.all;
			
			
			
        });
        $scope.template = "pages/partials/editresume.html";
       
       
    };
    
    $scope.saveChangesBasicProfile = function() {
    	console.log("Save changes")
    	
        $http({
            url: '/resource/editbasics',
            method: "POST",
            data: $scope.user,
            headers: {'Content-Type': 'application/json'},
        }).success(function (data) {
            //callback(response);
        
        	$scope.user = data;
        });
    };
    
    $scope.saveChangesUserSkills = function() {
    	console.log("Save changes")
    	
        $http({
            url: '/resource/skills/saveSkills',
            method: "POST",
            data: $scope.tags,
            headers: {'Content-Type': 'application/json'},
        }).success(function (data) {
            //callback(response);
        	//$scope.user = data;
        });
    };
	
});