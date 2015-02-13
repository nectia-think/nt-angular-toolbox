
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