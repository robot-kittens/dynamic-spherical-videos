(function(window){ "use strict";
	var WebGLDeform = window.WebGLDeform = function(canvas,opts) {
		opts = opts || {};
		this.glOptions = opts.gl || {
			antialias: true,
			depth: false,
			preserveDrawingBuffer: true
		};

		this.srcPoints = [];

		this.controlPoints = [
		    { x: 0, y: 0 },
		    { x: 500, y: 0 },
		    { x: 0, y: 691 },
		    { x: 500, y: 691 }
		];
		this.canvas = canvas;
		this.viewportWidth = this.canvas.width;
		this.viewportHeight = this.canvas.height;
		this.gl = canvas.getContext('webgl', this.glOptions) ||canvas.getContext('experimental-webgl', this.glOptions);
		this.anisoExt = this.gl.getExtension('EXT_texture_filter_anisotropic') ||
	    this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
	    this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
	    this.linearFiltering = false;
	    this.mipMapping = true;
	    this.anisoExt = false;
	   
	    this.shaderProgram = false;
	    this.vertexBuffer = false;
	    this.vertAttrib = false;
	    this.transMatUniform = false;
	    this.samplerUniform = false;
	    this.screenTexture = false;
	    this.maskTexture = opts.mask || false;
	    this.onRenderMaskCallback = opts.onrendermask || false;
	    this.vertexDrawn = opts.vertexDrawn || false;
	    this.draw = true;
	    this.noClear = opts.noClear || true;

	    this.blurX = opts.blurX || 0;
	    this.blurY = opts.blurY || 0;

	    // Not needed.
	    // this.blurBuffer = this.createFramebuffer(canvas.width, canvas.height);

	    this.initialize();
	}

	WebGLDeform.prototype.initialize = function()
	{
		this.setupGlContext();
		this.draw = false;
		this.loadScreenTexture(document.querySelector("#testmask"));
		this.draw = true;
	}

	WebGLDeform.prototype.setupGlContext = function() {
		var gl = this.gl;
	    
	    // Vertex shader:
	    // Horizontal blur
	    var vertShaderSource = [
	        'attribute vec2 aVertCoord;',
	        'uniform mat4 uTransformMatrix;',
	        'varying vec2 vTextureCoord;',
	        'void main(void) {',
	        	'vTextureCoord = aVertCoord;',
	        	'gl_Position = uTransformMatrix * vec4(aVertCoord, 0.0, 1.0);',
	        '}'
	    ].join('\n');

	    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vertexShader, vertShaderSource);
	    gl.compileShader(vertexShader);

	    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	        console.log('Failed to compile vertex shader:' +
	              gl.getShaderInfoLog(vertexShader));
	    }

	    var fragShaderSource;
	    if(this.maskTexture) {
	    	// Notice, im assuming the source is a video with ycbcr colorspace.
	    	fragShaderSource = [
		        'precision mediump float;',
		        'varying vec2 vTextureCoord;',
		        'uniform sampler2D uSampler;',
		        'uniform sampler2D maskTexture;',
		        'void main(void)  {',
		        'float a = texture2D(maskTexture, vTextureCoord).r;',
		        '    gl_FragColor = texture2D(uSampler, vTextureCoord);',
		        '	 gl_FragColor.a = 1.0 - (a + 1.765 * (a - 0.5));', // This converts Y color to alpha. If the texture is rgba, you can grab the color directly e.g. a
		        '}'
		    ].join('\n');
	    } else {  
		    // Fragment shader:
		    /* Shader without modifications
		    fragShaderSource = [
		        'precision mediump float;',
		        'varying vec2 vTextureCoord;',
		        'uniform sampler2D uSampler;',
		        'varying vec2 v_blurTexCoords[14];',
		        'void main(void)  {',
		        '    gl_FragColor = texture2D(uSampler, vTextureCoord);',
		        '}'
		    ].join('\n');*/

		    // Implemented blur
		    fragShaderSource = [
		        'precision mediump float;',
		        'varying vec2 vTextureCoord;',
		        'uniform sampler2D uSampler;',
		        'uniform vec2 px;',
		        'float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}',
		        'void main(void)  {',
		        	'vec4 sum = vec4( 0. );',
					'vec2 inc = px;',

					'sum += texture2D( uSampler, ( vTextureCoord - inc * 4. ) ) * 0.051;',
					'sum += texture2D( uSampler, ( vTextureCoord - inc * 3. ) ) * 0.0918;',
					'sum += texture2D( uSampler, ( vTextureCoord - inc * 2. ) ) * 0.12245;',
					'sum += texture2D( uSampler, ( vTextureCoord - inc * 1. ) ) * 0.1531;',
					'sum += texture2D( uSampler, ( vTextureCoord + inc * 0. ) ) * 0.1633;',
					'sum += texture2D( uSampler, ( vTextureCoord + inc * 1. ) ) * 0.1531;',
					'sum += texture2D( uSampler, ( vTextureCoord + inc * 2. ) ) * 0.12245;',
					'sum += texture2D( uSampler, ( vTextureCoord + inc * 3. ) ) * 0.0918;',
					'sum += texture2D( uSampler, ( vTextureCoord + inc * 4. ) ) * 0.051;',

					'gl_FragColor = sum;',
					// 'vec4 color=vec4(0.0);',
					// 'float total=0.0;',
					// 'float offset=random(vec3(12.9898,78.233,151.7182),0.0);',
					// 'for(float t=-30.0;t<=30.0;t++){',
					// 	'float percent=(t+offset-0.5)/30.0;',
					// 	'float weight=1.0-abs(percent);',
					// 	'vec4 sample=texture2D(uSampler,vTextureCoord+px*percent);',
					// 	'sample.rgb*=sample.a;',
					// 	'color+=sample*weight;',
					// 	'total+=weight;',
					// '}',
					// 'gl_FragColor=color/total;',
					// 'gl_FragColor.rgb/=gl_FragColor.a+0.00001;',

		        // '    gl_FragColor = texture2D(uSampler, vTextureCoord);',
		        	// 'gl_FragColor = vec4(0);',
			        // 'for (int x = -4; x <= 4; x++) {',
			        // 	'for (int y = -4; y <= 4; y++) {',
			        // 		'gl_FragColor += texture2D(uSampler, vec2(float(x) + vTextureCoord.x * px.x, float(y) + vTextureCoord.y * px.y));',
			        // 	'}',
			        // '}',

		        // Gaussian blur stuff;
			        // 'gl_FragColor = vec4(0);',
			        // 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(-7.0*px.x, -7.0*px.y))*0.0044299121055113265;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(-6.0*px.x, -6.0*px.y))*0.00895781211794;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(-5.0*px.x, -5.0*px.y))*0.0215963866053;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(-4.0*px.x, -4.0*px.y))*0.0443683338718;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(-3.0*px.x, -3.0*px.y))*0.0776744219933;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(-2.0*px.x, -2.0*px.y))*0.115876621105;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(-1.0*px.x, -1.0*px.y))*0.147308056121;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord                             )*0.159576912161;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( 1.0*px.x,  1.0*px.y))*0.147308056121;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( 2.0*px.x,  2.0*px.y))*0.115876621105;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( 3.0*px.x,  3.0*px.y))*0.0776744219933;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( 4.0*px.x,  4.0*px.y))*0.0443683338718;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( 5.0*px.x,  5.0*px.y))*0.0215963866053;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( 6.0*px.x,  6.0*px.y))*0.00895781211794;',
					// 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( 7.0*px.x,  7.0*px.y))*0.0044299121055113265;',
		        '}'
		    ].join('\n');

		}

	    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fragmentShader, fragShaderSource);
	    gl.compileShader(fragmentShader);

	    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
	        console.log('Failed to compile fragment shader:' +
	              gl.getShaderInfoLog(fragmentShader));
	    }

	    
	    // Compile the program
	    this.shaderProgram = gl.createProgram();
	    gl.attachShader(this.shaderProgram, vertexShader);
	    gl.attachShader(this.shaderProgram, fragmentShader);
	    gl.linkProgram(this.shaderProgram);

	    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
	        console.log('Shader linking failed.');
	    }
	        
	    // Create a buffer to hold the vertices
	    this.vertexBuffer = gl.createBuffer();

	    // Find and set up the uniforms and attributes        
	    gl.useProgram(this.shaderProgram);
	    this.vertAttrib = gl.getAttribLocation(this.shaderProgram, 'aVertCoord');

	    gl.enableVertexAttribArray(this.vertAttrib);
    	gl.vertexAttribPointer(this.vertAttrib, 2, gl.FLOAT, false, 0, 0);
	        
	    this.transMatUniform = gl.getUniformLocation(this.shaderProgram, 'uTransformMatrix');
	    this.samplerUniform = gl.getUniformLocation(this.shaderProgram, 'uSampler');
	        
	    // Create a texture to use for the screen image
	    this.screenTexture = gl.createTexture();

	    // create a mask?
	    this.maskTexture = this.maskTexture ? this.createTexture(1, 'maskTexture', this.shaderProgram) : false;
	}

	WebGLDeform.prototype.createTexture = function(index, name, program) {
		var gl = this.gl;
		var texture = gl.createTexture();
		program = program || this.shaderProgram;
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.uniform1i(gl.getUniformLocation(program, name), index);
		
		return texture;
	};

	WebGLDeform.prototype.loadScreenTexture = function(imageElement) {
	    var gl = this.gl;
	    if(!gl) return;
	    
	    // var image = screenImgElement;
	    this.imageElement = imageElement;
	    var extent = { w: this.imageElement.naturalWidth, h: this.imageElement.naturalHeight };
	    
	    gl.bindTexture(gl.TEXTURE_2D, this.screenTexture);
	    
	    // Scale up the texture to the next highest power of two dimensions.
	    // @TODO we can do this without canvas...
	    var canvas = document.createElement("canvas");
	    canvas.width = this.nextHighestPowerOfTwo(extent.w);
	    canvas.height = this.nextHighestPowerOfTwo(extent.h);

	    var ctx = canvas.getContext("2d");
	    ctx.drawImage(this.imageElement, 0, 0, this.imageElement.width, this.imageElement.height);
	    
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
	    
	    
	    if(this.anisoExt) {
	        // turn the anisotropy knob all the way to 11 (or down to 1 if it is
	        // switched off).
	        var maxAniso = this.anisotropicFiltering ?
	            gl.getParameter(this.anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
	        gl.texParameterf(gl.TEXTURE_2D, this.anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
	    }
	    
	    if(this.mipMapping) {
	        // gl.generateMipmap(gl.TEXTURE_2D);
	    }

	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    
	    gl.bindTexture(gl.TEXTURE_2D, null);
	    
	    // Record normalised height and width.
	    var w = extent.w / canvas.width, h = extent.h / canvas.height;

	    console.log(w,h,extent.w,extent.h);

	    // console.log(w,h, extent.w, canvas.width);

	    this.srcPoints = [
	        { x: 0, y: 0 }, // top-left
	        { x: w, y: 0 }, // top-right
	        { x: 0, y: h }, // bottom-left
	        { x: w, y: h }  // bottom-right
	    ];
	        
	    // setup the vertex buffer with the source points
	    var vertices = [];
	    for(var i=0; i<this.srcPoints.length; i++) {
	        vertices.push(this.srcPoints[i].x);
	        vertices.push(this.srcPoints[i].y);
	    }
	    
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	    
	    // Redraw the image
	    this.update();
	}

	WebGLDeform.prototype.isPowerOfTwo = function(x) { return (x & (x - 1)) == 0; }
	 
	WebGLDeform.prototype.nextHighestPowerOfTwo = function(x) {
	    --x;
	    for (var i = 1; i < 32; i <<= 1) {
	        x = x | x >> i;
	    }
	    return x + 1;
	}

	WebGLDeform.prototype.update = function(controlPoints) {
		var gl = this.gl;
	    if(!gl || !this.srcPoints || !this.imageElement) { return; }
	    gl.useProgram(this.shaderProgram);

	    controlPoints = controlPoints || this.controlPoints;
	    
	    var vpW = this.imageElement.width;
	    var vpH = this.imageElement.height;

	    vpW = this.viewportWidth;
	    vpH = this.viewportHeight;
	    
	    // Find where the control points are in 'window coordinates'. I.e.
	    // where thecanvas covers [-1,1] x [-1,1]. Note that we have to flip
	    // the y-coord.
	    // controlPoints = this.controlPoints;
	    var dstPoints = [];
	    for(var i=0; i<controlPoints.length; i++) {
	        dstPoints.push({
	            x: (2 * controlPoints[i].x / vpW) - 1,
	            y: -(2 * controlPoints[i].y / vpH) + 1
	        });
	    }


	    
	    // Get the transform
	    var v = this.transformationFromQuadCorners(this.srcPoints, dstPoints);
	    // set background to full transparency

	    // draw the triangles
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

	    // if(!this.vertexDrawn) {
	    	// gl.enableVertexAttribArray(this.vertAttrib);
	    	// gl.vertexAttribPointer(this.vertAttrib, 2, gl.FLOAT, false, 0, 0);
	    // }

    	this.renderFrameGL(null,v,this.screenTexture);
	    

	    /* Deprecated, kept for future reference.
	    if( this.maskTexture ) {
		    gl.activeTexture(gl.TEXTURE1);
		    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
		    if(this.onRenderMaskCallback) this.onRenderMaskCallback(gl);   
		}
		*/
    	if(this.blurX || this.blurY) {
    		// Normalize.
    		var blurX = this.blurX / this.canvas.width,
    			blurY = this.blurY / this.canvas.height;
    		gl.uniform2f(gl.getUniformLocation(this.shaderProgram,'px'), blurX, blurY); // Set our box blur
    	}

	    if(this.draw) gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);    
	}

	WebGLDeform.prototype.renderFrameGL = function(buffer,v,texture)
	{
		var gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);

		if(!this.noClear) {
	    	gl.clearColor(0,0,0,0);
	    	gl.viewport(0, 0, vpW, vpH);
	    	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	    }

	    /*  If 'v' is the vector of transform coefficients, we want to use
	        the following matrix:
	    
	        [v[0], v[3],   0, v[6]],
	        [v[1], v[4],   0, v[7]],
	        [   0,    0,   1,    0],
	        [v[2], v[5],   0,    1]
	    
	        which must be unravelled and sent to uniformMatrix4fv() in *column-major*
	        order. Hence the mystical ordering of the array below.
	    */
	    gl.uniformMatrix4fv(
	        this.transMatUniform,
	        false, [
	            v[0], v[1],    0, v[2],
	            v[3], v[4],    0, v[5],
	               0,    0,    0,    0,
	            v[6], v[7],    0,    1
        ]);

        gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.uniform1i(this.samplerUniform, 0);

	}

	WebGLDeform.prototype.createFramebuffer = function(width, height)
	{
		var gl = this.gl;
		var fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		var renderbuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		return {fbo: fbo, texture: texture};
	}

	WebGLDeform.prototype.transformationFromQuadCorners = function(before, after)
	{
	    /*
	     Return the 8 elements of the transformation matrix which maps
	     the points in *before* to corresponding ones in *after*. The
	     points should be specified as
	     [{x:x1,y:y1}, {x:x2,y:y2}, {x:x3,y:y2}, {x:x4,y:y4}].
	     
	     Note: There are 8 elements because the bottom-right element is
	     assumed to be '1'.
	    */
	 
	    var b = numeric.transpose([[
	        after[0].x, after[0].y,
	        after[1].x, after[1].y,
	        after[2].x, after[2].y,
	        after[3].x, after[3].y ]]);
	    
	    var A = [];
	    for(var i=0; i<before.length; i++) {
	        A.push([
	            before[i].x, 0, -after[i].x*before[i].x,
	            before[i].y, 0, -after[i].x*before[i].y, 1, 0]);
	        A.push([
	            0, before[i].x, -after[i].y*before[i].x,
	            0, before[i].y, -after[i].y*before[i].y, 0, 1]);
	    }
	    
	    // Solve for T and return the elements as a single array
	    return numeric.transpose(numeric.dot(numeric.inv(A), b))[0];
	}
})(window);