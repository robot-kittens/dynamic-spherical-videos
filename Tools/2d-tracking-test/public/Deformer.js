(function(window){ "use strict";
	var Deformer = window.Deformer = function(opts) {
		opts = opts || {};
		this.positionData = {};
		this.objectpool = [];
		this.objects = [];
		this.currentFrame = 0;
		this.gl = false;
		this.onPlaceObjectCallback = opts.onplaceobject || false;

		this.program = false;

	}

	Deformer.prototype.addFrame = function(frame, name, lt,rt,rb,lb) {
		var frameData = this.positionData[frame] || [];

		frameData[name] = {
			'lt': lt,
			'rt': rt,
			'rb': rb,
			'lb': lb
		};

		this.positionData[frame] = frameData;
	}

	Deformer.prototype.addObject = function(name, resource, target) {
		this.objects[name] = {
			'mc': resource,
			'target': target
		}

		this.objectpool[name] = {
			name: this.objects[name]
		}
	}

	Deformer.prototype.placeObject = function(name,lt,rt,rb,lb) {
		if(!this.onPlaceObjectCallback) return;
		var object = this.objects[name] || false;
		this.onPlaceObjectCallback(object.mc,lt,rt,rb,lb);
	}

	Deformer.prototype.updateFrame = function(frame) {
		if(this.currentFrame == frame) return;
		
		var frameObjects = this.positionData[frame],
			name;
		this.currentFrame = frame;
		for (name in frameObjects) {
			this.placeObject(name,frameObjects[name]['lt'],frameObjects[name]['rt'],frameObjects[name]['rb'],frameObjects[name]['lb']);
		}
		
	}
})(window);