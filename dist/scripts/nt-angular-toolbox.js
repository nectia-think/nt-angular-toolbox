/*! nt-angular-toolbox - v0.4.2 - 2015-02-18
* Copyright (c) 2015 Williams Torres (wtorres@nectia.com); Licensed MIT */
(function(){

'use strict';

var app = angular.module('nt.angular.toolbox', []);

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

function modalService (){
	var self = this;

	var modals = [];
	
	this.configuration = {
		initiaIndex: 1000,
		template: '<div class="modal"></div>'
	};

	function configure(){
		var template = angular.element(self.configuration.template);
		template.attr('ng-transclude', '');
		self.configuration.template = template[0].outerHTML;
	}
	configure();

	this.setConfig = function(config){
		angular.extend(this.configuration, config);

		if (this.configuration.templateUrl){
			//TODO implementar obtención de archivo
		}else{
			configure();
		}
		
		this.zIndex = this.configuration.initiaIndex;
	};

	this.zIndex = this.configuration.initiaIndex;

	$get.$inject = ['$compile', '$q', '$window', '$timeout', '$controller', '$rootScope', 'ntOverlayService', '$injector', '$templateRequest'];
	function $get ($compile, $q, $window, $timeout, $controller, $rootScope, overlayService, $injector, $templateRequest){

		function destroyModal (instance){
			instance.scope.$destroy();
			instance.modal.remove();
			modals.splice(modals.indexOf(instance), 1);
			overlayService.hide();

			if (modals.length === 0){
				self.zIndex = self.configuration.initiaIndex;
			}
		}
		
		return {

			open: function(config){

				var modal = angular.element(document.createElement('nt-modal'));
				var scope = $rootScope.$new();

				var templatePromise = {};

				function compile(content){
					modal.append(content);
					$compile(modal)(scope);
				}


				if (config.templateUrl){
					templatePromise.template = $templateRequest(config.templateUrl, true).then(compile);
				}else{
					compile(config.template);
				}
				
				overlayService.show(self.zIndex + 1);
				self.zIndex = self.zIndex + 2;
				modal.css('z-index', self.zIndex);

			    var instance = new ModalInstance($q, $window, $timeout, scope, modal, destroyModal);
				modals.push(instance);

				var locals = angular.extend({}, config.resolve);
				
				angular.forEach(locals, function(value, key) {
	            	locals[key] = angular.isString(value) ? $injector.get(value) : $injector.invoke(value, null, null, key);
	            });

				$q.all(angular.extend({}, locals, templatePromise)).then(function(){
					$controller(config.controller, angular.extend({'$scope': scope,  'modalInstance': instance.service}, locals));
				    angular.element(document.body).append(modal);
				});

			    return instance.getPromise();
			},

			destroyModal: destroyModal,

			getConfiguration: function(){
				return self.configuration;
			}
		};
	}
	this.$get = $get;
}

app.provider('ntModalService', modalService);

function ModalInstance ($q, $window, $timeout, scope, modal, destroyModal){
	var self = this;
	var deferred = $q.defer();
	this.scope = scope;
	this.modal = modal;

	this.service = {
		resolve: function(data){
			destroyModal(self);
			deferred.resolve(data);
		},
		reject: function(data){
			destroyModal(self);
			deferred.reject(data);
		},
		updatePosition: function(){
			$timeout(function(){
				angular.element($window).triggerHandler('resize');
			});
		}
	};

	this.getPromise= function(){
		return deferred.promise;
	};
}

function overlayService (){
	var overlays = [];
	var overlayElement;

	function moveOverlay(){
		overlayElement.css('z-index', overlays[overlays.length - 1]);
	}

	this.show = function(zIndex){

		if (overlayElement === undefined){
			overlayElement = angular.element(document.createElement('div'));
			overlayElement.addClass('palette-overlay');
			angular.element(document.body).append(overlayElement);
		}

		overlays.push(zIndex);

		moveOverlay();
	};

	this.hide = function(){
		overlays.pop();

		if (overlays.length === 0){
			overlayElement.remove();
			overlayElement = undefined;
		}else{
			moveOverlay();	
		}
	};
}

app.service('ntOverlayService', overlayService);

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
})();