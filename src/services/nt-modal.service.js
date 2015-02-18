
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