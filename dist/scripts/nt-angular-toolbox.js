/*! nt-angular-toolbox - v0.4.0 - 2015-02-13
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

	$get.$inject = ['$compile', '$q', '$controller', '$rootScope', 'ntOverlayService'];
	function $get ($compile, $q, $controller, $rootScope, overlayService){

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
				modal.append(config.template);
				overlayService.show(self.zIndex + 1);
				self.zIndex = self.zIndex + 2;
				modal.css('z-index', self.zIndex);

				var scope = $rootScope.$new();
			    $compile(modal)(scope);

			    var instance = new ModalInstance($q, scope, modal, destroyModal);
				modals.push(instance);

	      		$controller(config.controller, {$scope: scope,  modalInstance: instance.service});

			    angular.element(document.body).append(modal);
			    
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

function ModalInstance ($q, scope, modal, destroyModal){
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
})();