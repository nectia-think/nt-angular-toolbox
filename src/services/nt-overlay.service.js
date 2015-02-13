
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