(function(window){ "use strict";
	var DOMDeform = window.DOMDeform = function(target, opts) {

		this.target = target;
		this.corners = {
			tl: [0,0],
			tr: [300,100],
			bl: [0,300],
			br: [300,300]
		}
	}

	DOMDeform.prototype.adj = function(m) { // Compute the adjugate of m
	  return [
	    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
	    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
	    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
	  ];
	}

	DOMDeform.prototype.multmm = function(a, b) { // multiply two matrices
	  var c = Array(9);
	  for (var i = 0; i != 3; ++i) {
	    for (var j = 0; j != 3; ++j) {
	      var cij = 0;
	      for (var k = 0; k != 3; ++k) {
	        cij += a[3*i + k]*b[3*k + j];
	      }
	      c[3*i + j] = cij;
	    }
	  }
	  return c;
	}

	DOMDeform.prototype.multmv = function(m, v) { // multiply matrix and vector
	  return [
	    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
	    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
	    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
	  ];
	}

	DOMDeform.prototype.pdbg = function(m, v) {
	  var r = this.multmv(m, v);
	  return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
	}

	DOMDeform.prototype.basisToPoints = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	  var m = [
	    x1, x2, x3,
	    y1, y2, y3,
	     1,  1,  1
	  ];
	  var v = this.multmv(this.adj(m), [x4, y4, 1]);
	  return this.multmm(m, [
	    v[0], 0, 0,
	    0, v[1], 0,
	    0, 0, v[2]
	  ]);
	}

	DOMDeform.prototype.general2DProjection = function(
	  x1s, y1s, x1d, y1d,
	  x2s, y2s, x2d, y2d,
	  x3s, y3s, x3d, y3d,
	  x4s, y4s, x4d, y4d
	) {
	  var s = this.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
	  var d = this.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
	  return this.multmm(d, this.adj(s));
	}

	DOMDeform.prototype.project = function(m, x, y) {
	  var v = this.multmv(m, [x, y, 1]);
	  return [v[0]/v[2], v[1]/v[2]];
	}

	DOMDeform.prototype.transform2d = function(target, x1, y1, x2, y2, x3, y3, x4, y4) {
	  var w = target.offsetWidth, h = target.offsetHeight;
	  var t = this.general2DProjection
	    (0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
	  for(var i = 0; i != 9; ++i) t[i] = t[i]/t[8];
	  t = [t[0], t[3], 0, t[6],
	       t[1], t[4], 0, t[7],
	       0   , 0   , 1, 0   ,
	       t[2], t[5], 0, t[8]];
	  t = "matrix3d(" + t.join(", ") + ")";
	  target.style["-webkit-transform"] = t;
	  target.style["-moz-transform"] = t;
	  target.style["-o-transform"] = t;
	  target.style.transform = t;
	}

	DOMDeform.prototype.update = function(tl,tr,bl,br) {
		this.corners = {
			tl: tl,
			tr: tr,
			bl: bl,
			br: br
		};
		this.transform2d(this.target, 
			this.corners.tl[0], this.corners.tl[1], 
			this.corners.tr[0], this.corners.tr[1],
			this.corners.bl[0], this.corners.bl[1], 
			this.corners.br[0], this.corners.br[1]
		);
	}
})(window);