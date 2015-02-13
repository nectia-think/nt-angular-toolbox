
function modalDirective(modalService){

	return {
		restrict: 'E',
		transclude: true,
		template: modalService.getConfiguration().template,
		replace : true
	};
}

modalDirective.$inject = ['ntModalService'];
app.directive('ntModal', modalDirective);

function modalTemplateDirective($compile){

	function linker (scope, element, attrs){
		element.html(scope.template);
        $compile(element.contents())(scope.controller);
	}

	return {
		restrict: 'A',
		replace : true,
		scope: {
			template: '@ntModalTemplate',
			controller: '@'
		},
		link: linker
	};
}

modalTemplateDirective.$inject = ['$compile'];
app.directive('ntModalTemplate', modalTemplateDirective);