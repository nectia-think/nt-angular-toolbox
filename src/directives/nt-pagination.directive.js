
ntPagination.$inject = ['$compile', '$timeout', 'paginationService'];
function ntPagination ($compile, $timeout, paginationService) {

	function linker (scope, element, attrs){
		paginationService.getTemplate().then(function(template){
			element.html(template);
       		$compile(element.contents())(scope);	
		});

		scope.changePagination = function(nroRows) {
			if (scope.nroRows !== nroRows) {
				$timeout(function(){
					scope.nroRows = nroRows;
					scope.$apply();
					scope.load();				
				});
			}
		};

		scope.nextPage = function() {
			if (scope.actualPage < scope.totalPages) {
				$timeout(function(){
					scope.actualPage++;
					scope.$apply();
					scope.load();
				});
			}
		};

		scope.previousPage = function() {
			if (scope.actualPage > 1) {
				$timeout(function(){
					scope.actualPage--;
					scope.$apply();
					scope.load();
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
		link: linker
	};
}

app.directive('ntPagination', ntPagination);