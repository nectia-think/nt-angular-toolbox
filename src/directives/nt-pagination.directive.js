function ntPagination ($compile, $timeout, $templateRequest) {

		function getTemplate(){
			return '<div data-tool="tablePagination">'+
						'<ul class="tp-quantity-selector">'+
							'<li><a ng-class="{active: nroRows == 100}" ng-click="changePagination(100)" data-quantity="100">100</a></li>'+
							'<li><a ng-class="{active: nroRows == 50}" ng-click="changePagination(50)" data-quantity="50">50</a></li>'+
							'<li><a ng-class="{active: nroRows == 10}" ng-click="changePagination(10)" data-quantity="10">10</a></li>'+
						'</ul>'+
						'<ul class="tp-page-navigator">'+
							'<li><a ng-click="nextPage()" data-action="tablePageForward" data-icon="table-nav-right"></a></li>'+
							'<li><a ng-click="previousPage()" data-action="tablePageBackward" data-icon="table-nav-left"></a></li>'+
						'</ul>'+
						'<span class="tp-page-indicator"> {{actualPage}} / {{totalPages}} </span>'+
					'</div>';
		}

		function linker (scope, element, attrs){
			if (attrs.templateUrl){
				$templateRequest(attrs.templateUrl, true).then(function(response) {
					element.html(response);
					$compile(element.contents())(scope);
				}, function(){
					throw 'Error al cargar el template: ' + attrs.templateUrl;
				});
			} else {
				element.html(getTemplate());
        		$compile(element.contents())(scope);
			}
		}

		function controller ($scope){
			$scope.changePagination = function(nroRows) {
				if ($scope.nroRows !== nroRows) {
					$timeout(function(){
						$scope.nroRows = nroRows;
						$scope.$apply();
						$scope.load();				
					});
				}
			};

			$scope.nextPage = function() {
				if ($scope.actualPage < $scope.totalPages) {
					$timeout(function(){
						$scope.actualPage++;
						$scope.$apply();
						$scope.load();
					});
				}
			};

			$scope.previousPage = function() {
				if ($scope.actualPage > 1) {
					$timeout(function(){
						$scope.actualPage--;
						$scope.$apply();
						$scope.load();
					});
				}
			};
		}

		return {
			restrict : 'E',
			scope : {
				actualPage : '=',
				totalPages : '=',
				nroRows : '=',
				load : '&'
			},
			replace : true,
			link: linker,
			controller : controller
		};
	}

	ntPagination.$inject = ['$compile', '$timeout', '$templateRequest'];
	app.directive('ntPagination', ntPagination);