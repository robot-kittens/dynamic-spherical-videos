var Deformer = window.deformer = function(width,height,canvas) {
	this.positionData = new Object();
	this.allobjects = new Array();
	this.objects = new Array();
	canvasses = new Array();
	this.width = width;
	this.height = height;
	this.canvas = canvas;
	this.lastFrame = 0;
	this.context = this.canvas.getContext('2d');
}

Deformer.prototype.addFrame = function (frame, objectname, lt,rt,rb,lb) {
			if (this.positionData[frame] == undefined) {
				this.positionData[frame] = new Array();
			}
			console.log(frame,objectname);
			this.positionData[frame][objectname] = new Array();
			this.positionData[frame][objectname]['lt'] = lt;
			this.positionData[frame][objectname]['rt'] = rt;
			this.positionData[frame][objectname]['rb'] = rb;
			this.positionData[frame][objectname]['lb'] = lb;
		//	console.log(this.positionData);
}

Deformer.prototype.addObject = function(name, m,target) {
			//trace('addobject',name,m,target);
			this.allobjects[name] = new Object();
			this.objects[name] = new Object();
			this.objects[name]['mc'] = m;
			this.objects[name]['target'] = target; 
			this.allobjects[name] = this.objects[name];
		//	canvasses[name] = newCanvas;
}

Deformer.prototype.placeObject = function(ob,point1,point2,point3,point4) {

	setPoints(point1,point2,point3,point4);
}

Deformer.prototype.updateFrame = function(frame) {

	if (this.lastFrame != frame) {
		
		var motionObjects = this.positionData[frame];
		this.lastFrame = frame;
		for (i in motionObjects) {
			//animateObject(i,frame);
		//	console.log(motionObjects[i]['lt']);
			this.placeObject(i,motionObjects[i]['lt'],motionObjects[i]['rt'],motionObjects[i]['rb'],motionObjects[i]['lb']);
		}
	}

}