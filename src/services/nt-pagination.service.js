
function paginationService(){

	this.loaded = false;
	this.template = '<div data-tool="tablePagination">'+
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

	this.setTemplate = function(tmpl){
		this.template = tmpl;
	};

	this.setTemplateUrl = function(url){
		this.templateUrl = url;
	};

	$get.$inject = ['$q', '$http'];
	function $get($q, $http){
		var self = this;
		return {
			getTemplate: function(){
				var def = $q.defer();

				if (angular.isUndefined(self.templateUrl) || self.loaded){
					def.resolve(self.template);
				} else {
					$http.get(url).then(function(content){
						self.loaded = true;
						self.template = content;
						def.resolve(self.template);
					}, function(){
						throw 'Error al cargar el template: ' + attrs.templateUrl;
					});	
				}

				return def.promise;
			}
		};
	}

	this.$get = $get;
}

app.provider('paginationService', paginationService);