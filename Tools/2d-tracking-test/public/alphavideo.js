(function(window){ "use strict";

	var alphavideo = window.alphavideo = function( output, mask, opts ) {
		opts = opts || {};

		this.canvasOutput = output.canvas;
		this.canvasMask = mask.canvas;

		this.output = output;
		this.output.noDraw = true;
		this.output.loop = false;
		this.output.autoplay = false;

		this.mask = mask;
		this.mask.noDraw = true;
		this.mask.loop = false;
		this.mask.autoplay = false;

		this.loading = 2;

		this.maskProgram = false;
		this.maskYTexture = false;	
		this.maskCrTexture = false;	
		this.maskCbTexture = false;
		this.maskAlphaTexture = false;

		this.output.externalLoadCallback = this.onLoaded.bind(this);
		this.output.externalOnNextFrame = this.onUpdate.bind(this);
		this.output.externalFinishedCallback = this.onFinished.bind(this);
		
		this.mask.externalFinishedCallback = this.onFinished.bind(this);
		this.mask.externalLoadCallback = this.onLoaded.bind(this);

		this.onBeforeUpdateCallback = opts.onbeforeupdate || false;
		this.onAfterUpdateCallback = opts.onafterupdate || false;
		this.onLoadedCallback = opts.onloaded || false;
		this.onFinishedCallback = opts.onfinished || false;
	};

	alphavideo.prototype.init = function()
	{
		if(this.output.gl) {
			this.initWebGL();
		}

		if(this.onLoadedCallback) this.onLoadedCallback();
	}
	
	alphavideo.prototype.initWebGL = function()
	{
		var gl = this.output.gl;
		// gl.enable(gl.BLEND);
		// gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_SUBTRACT);
		// gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
		// gl.blendFunc(gl.ONE, gl.SRC_ALPHA);
 		// gl.blendEquation(gl.FUNC_SUBTRACT);

		// Setup shader program for masking.
		this.initMaskProgram();
	}

	alphavideo.prototype.getFrame = function()
	{
		return this.output.currentFrameNum;
	}

	alphavideo.prototype.initMaskProgram = function()
	{
		var gl = this.output.gl,
			SHADER_FRAG_COLOR = [
				'precision mediump float;',
				'uniform sampler2D YTexture;',
				'uniform sampler2D CBTexture;',
				'uniform sampler2D CRTexture;',
				'uniform sampler2D AlphaTexture;',
				'varying vec2 texCoord;',
			
				'void main() {',
					'float y = texture2D(YTexture, texCoord).r;',
					'float cr = texture2D(CBTexture, texCoord).r - 0.5;',
					'float cb = texture2D(CRTexture, texCoord).r - 0.5;',
					'float a = texture2D(AlphaTexture, texCoord).r;',
					'float r = y + 1.4 * cr;',
					'float g = y + -0.343 * cb - 0.711 * cr;',
					'float b = y + 1.765 * cb;',

					'float alpha = y + 1.4 * a;', // 0.9 to compensate
					
					'gl_FragColor = vec4(',
						'r,',
						'g,',
						'b,',
						'alpha',
					');',
				'}'
			].join('\n'),
			SHADER_IDENTITY = [
				'attribute vec2 vertex;',
				'varying vec2 texCoord;',
				
				'void main() {',
					'texCoord = vertex;',
					'gl_Position = vec4((vertex * 2.0 - 1.0) * vec2(1, -1), 0.0, 1.0);',
				'}'
			].join('\n');

		// Added masking shader.
		this.maskProgram = gl.createProgram();
		gl.attachShader(this.maskProgram, this.output.compileShader(gl.VERTEX_SHADER, SHADER_IDENTITY));
		gl.attachShader(this.maskProgram, this.output.compileShader(gl.FRAGMENT_SHADER, SHADER_FRAG_COLOR));
		gl.linkProgram(this.maskProgram);
		gl.useProgram(this.maskProgram);

		var vertexAttr = gl.getAttribLocation(this.maskProgram, 'vertex');
		gl.enableVertexAttribArray(vertexAttr);
		gl.vertexAttribPointer(vertexAttr, 2, gl.FLOAT, false, 0, 0);

		// Register textures
		this.maskYTexture = this.output.createTexture(0, 'YTexture',this.maskProgram);
		this.maskCbTexture = this.output.createTexture(1, 'CBTexture',this.maskProgram);
		this.maskCrTexture = this.output.createTexture(2, 'CRTexture',this.maskProgram);
		this.maskAlphaTexture = this.output.createTexture(3, 'AlphaTexture',this.maskProgram);
	}

	alphavideo.prototype.renderMask = function( mask )
	{
		var gl = this.output.gl;

		gl.useProgram(this.maskProgram);
		
		var uint8Y = new Uint8Array(this.output.currentY.buffer),
			uint8Cr = new Uint8Array(this.output.currentCr.buffer),
			uint8Cb = new Uint8Array(this.output.currentCb.buffer),
			uint8YMask = new Uint8Array(mask.currentY.buffer);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.maskYTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.output.codedWidth, this.output.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uint8Y);
		
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.maskCbTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.output.halfWidth, this.output.height/2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uint8Cr);
		
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.maskCrTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.output.halfWidth, this.output.height/2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uint8Cb);

		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.maskAlphaTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.output.codedWidth, this.output.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uint8YMask);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.useProgram(this.output.program);
	}

	alphavideo.prototype.onUpdate = function()
	{
		if(this.onBeforeUpdateCallback) this.onBeforeUpdateCallback();
		( this.output.gl ) ? this.onUpdate3D() : this.onUpdate2D();
		if(this.onAfterUpdateCallback) this.onAfterUpdateCallback();
	}

	alphavideo.prototype.onUpdate3D = function()
	{
		if(this.loading) return;

		if( this.mask.currentFrameNum > 1 ) this.mask.nextFrame();
		this.renderMask( this.mask );
	}

	alphavideo.prototype.onUpdate2D = function()
	{
		if(this.loading) return;
		if( this.mask.currentFrameNum > 1 ) this.mask.nextFrame();

		// Using Uint32 to shift bytes increases overall 
		// performance as opposed to directly manipulating the values
		var maskCtx = this.canvasMask.getContext('2d'),
			outputCtx = this.canvasOutput.getContext('2d'),
			canvasHeight = outputCtx.canvas.height,
			canvasWidth = outputCtx.canvas.width,
			maskData = this.mask.currentRGBA,
			maskData32 = new Uint32Array(maskData.data.buffer),
			outputData = this.output.currentRGBA,
			outputData32 = new Uint32Array(outputData.data.buffer),
			r = 0,
			g = 0,
			b = 0,
			a = 0;

			for( var y=0; y < canvasHeight; y++) {
				for( var x=0; x < canvasWidth; x++) {
					b = (outputData32[y*canvasWidth+x] >> 16) & 0xff; // Extract blue channel value
					g = (outputData32[y*canvasWidth+x] >> 8) & 0xff; // Extract green channel value
					r = (outputData32[y*canvasWidth+x] >> 0) & 0xff; // Extract red channel value

					a = (maskData32[y*canvasWidth+x] >> 16) & 0xff; // Extract blue channel value

					outputData32[y*canvasWidth+x] =
						(a << 24)		| // Alpha
						(b << 16) 		| // Blue
						(g << 8) 		| // Green
						r 				  // Red
				}
			}

			outputData.data.set(outputData32.buffer);
			outputCtx.putImageData(outputData,0,0,0,0,canvasWidth,canvasHeight);
	}

	alphavideo.prototype.onFinished = function( jsmpegInstance )
	{
		jsmpegInstance.currentFrameNum = 1;
	}

	alphavideo.prototype.onLoaded = function()
	{
		this.loading--;
		if(this.loading) return;
		this.init();
	}

	



})(window);