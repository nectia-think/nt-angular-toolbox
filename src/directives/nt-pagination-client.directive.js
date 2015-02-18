
ntPaginationClient.$inject = ['$compile'];
function ntPaginationClient($compile){

	function linker(scope, element, attributes){

		scope.pagination = {
			actualPage: 1,
			totalPages: 1,
			nroRows: 10
		};

		scope.load = function(){
			if (scope.data.length === 0){
				scope.pagination.totalPages = 1;
			}else{
				scope.pagination.totalPages = Math.round(scope.data.length / scope.pagination.nroRows);	
			}

			var begin = (scope.pagination.actualPage - 1) * scope.pagination.nroRows;
			var end = scope.pagination.actualPage * scope.pagination.nroRows;

			scope.filteredData = scope.data.slice(begin, end);	
		};

		scope.$watch(scope.data, function(){
			if (scope.data){
				scope.load();
			}
		}, true);

		element.html('<nt-pagination actual-page="pagination.actualPage" total-pages="pagination.totalPages" nro-rows="pagination.nroRows" load="load()" ></nt-pagination>');
       	$compile(element.contents())(scope);	
	}

	return {
		restrict : 'E',
		scope : {
			data : '=',
			filteredData : '='
		},
		replace : true,
		//template: '<nt-pagination actual-page="pagination.actualPage" total-pages="pagination.totalPages" nro-rows="pagination.nroRows" load="load()" ></nt-pagination>',
		link: linker
	};
}


app.directive('ntPaginationClient', ntPaginationClient);