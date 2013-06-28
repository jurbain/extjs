		//==== canvas				
		
		//======================================================================

		Ext.define('CanvasPanelClass', {
		    extend: 'Ext.Panel',
		    
		    gridColor: '',
		    ctx: null,		// is set when rendered
		    canvas: null,	// is set when rendered		    
		    
			bodyStyle: { background: '#000'	},
			frame: false,
			margin: '2 2 2 2',
			
			listeners: {
				afterrender: {
					//scope: this,
					fn: function(){
						
						this.canvas = this.items.items[0].el.dom;							
						this.ctx = this.canvas.getContext("2d");						
						
						this.clear();
						this.renderGrid(25, this.gridColor);
						
						//this.loadImageToFit('church.jpg');
						//this.loadImageScaled('church.jpg', 0, 0, 350, 350);
					}
				}		
			},			
			
			constructor: function(config) {
				console.log("new CanvasPanelClass created!");
				
				//alert(config.width);
				//define this here because we can set width and height
				this.items = {
					xtype: 'box',
					autoEl:{
						tag: 'canvas',
						height: config.height,
						width: config.width
					}
				};
				
				this.tempCanvas = document.createElement("canvas");
				
				CanvasPanelClass.superclass.constructor.call(this, config);
			},
			
			clear: function() {
			
				// Store the current transformation matrix
				this.ctx.save();

				// Use the identity matrix while clearing the canvas
				this.ctx.setTransform(1, 0, 0, 1, 0, 0);
				this.ctx.clearRect ( 0, 0, this.getWidth(), this.getHeight() );

				// Restore the transform
				this.ctx.restore();																	
			},
			
			//clear all of the canvas EXCEPT the rect given
			clearRest: function(x, y, width, height) {
				this.ctx.clearRect ( x+width, y, this.getWidth()-width-x, this.getHeight()-y );
				this.ctx.clearRect ( x, y+height, this.getWidth()-x, this.getHeight()-height-y );
				this.ctx.clearRect ( 0, 0, this.getWidth(), y );
				this.ctx.clearRect ( 0, y, x, this.getHeight()-y );
			},	
			
			clearRect: function(x, y, width, height) {
				this.ctx.clearRect ( x, y, width, height );
			},
			
			renderGrid: function renderGrid(gridPixelSize, color) {				
					this.ctx.save();
					this.ctx.lineWidth = 0.5;
					this.ctx.strokeStyle = color;

					// horizontal grid lines
					for(var i = 0; i <= this.height; i = i + gridPixelSize) {
						this.ctx.beginPath();
						this.ctx.moveTo(0, i);
						this.ctx.lineTo(this.width, i);
						this.ctx.closePath();
						this.ctx.stroke();
					}

					// vertical grid lines
					for(var j = 0; j <= this.width; j = j + gridPixelSize) {
						this.ctx.beginPath();
						this.ctx.moveTo(j, 0);
						this.ctx.lineTo(j, this.height);
						this.ctx.closePath();
						this.ctx.stroke();
					}

					this.ctx.restore();
			},
			
			drawRect: function( x, y, width, height, lineWidth, color ) {
				this.ctx.strokeStyle = color;
				this.ctx.lineWidth = lineWidth;
				this.ctx.strokeRect(x,y,width,height);				
			},
			
			fillRect: function( x, y, width, height, color ) {
				this.ctx.fillStyle = color;
				this.ctx.fillRect(x,y,width,height);				
			},		
			
			drawCircle : function( x, y, radius, color ) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = color;
				this.ctx.fillStyle = color;
				this.ctx.arc( x, y, radius, 0, Math.PI*2, true ); 
				this.ctx.closePath();
				this.ctx.fill();		
			},			
			
			putPixel: function( x, y, size, color ) {
				this.ctx.fillStyle = color;
				this.ctx.fillRect(x,y,size,size);			
			},
			
			loadImage: function(path) {
				var context = this.ctx;
				
				var img = new Image();   // Create new img element

				img.onload = function() {
					context.drawImage(img, 0, 0 );							
				}

				img.src = path; // Set source path		

				return img;
			},

			loadImageScaled: function(path,x,y,width,height) {
				var context = this.ctx;
				
				var img = new Image();   // Create new img element

				img.onload = function() {
					context.drawImage(img, x, y, width, height );							
				}

				img.src = path; // Set source path	

				return img;
			},					
			
			loadImageToFit: function(path) {
				var canvasWidth = this.getWidth();
				var canvasHeight = this.getHeight();
				var context = this.ctx;

				var img = new Image();   // Create new img element

				img.onload = function() {

					var xscale = (canvasWidth / img.width);
					var yscale = (canvasHeight / img.height);

					var scale = xscale;
					if (yscale < xscale) scale = yscale;	

					var newwidth = img.width*scale;
					var newheight = img.height*scale;

					context.drawImage( img, 0, 0, newwidth, newheight );							
				}

				img.src = path; // Set source path	

				return img;
			},
			
			toTempCanvas: function() {				
				var	tempCtx = this.tempCanvas.getContext("2d");

				this.tempCanvas.width = this.getWidth();
				this.tempCanvas.height = this.getHeight();
				// put our data onto the temp canvas
				tempCtx.drawImage( this.canvas, 0, 0, this.getWidth(), this.getHeight() );				
			},
			
			fromTempCanvas: function() {
				this.ctx.drawImage( this.tempCanvas, 0, 0, this.getWidth(), this.getHeight() );			
			},
			
			rotateContext: function(angle) {
				// Use the identity matrix 
				this.ctx.setTransform(1, 0, 0, 1, 0, 0);						

				//Set the origin to the center of the image
				this.ctx.translate(this.getWidth() / 2, this.getHeight() / 2);

				this.ctx.rotate(angle);					

				this.ctx.translate(-this.getWidth() / 2, -this.getHeight() / 2);				
			},
			
			rotate: function(angle) {
				// use a temp canvas to store our data (because we need to clear the other box after rotation.
				var	tempCtx = this.tempCanvas.getContext("2d");
				
				//don't know why - but these lines are not necessary
				/*
				// put our data onto the temp canvas
				tempCtx.drawImage( this.canvas, 0, 0, this.getWidth(), this.getHeight() );
				*/

				// Now rotate.
				this.rotateContext(angle);

				// Finally draw the image data from the temp canvas.
				this.fromTempCanvas();	
			},
			
			invert: function() {
				var imgd = this.ctx.getImageData(0,0,this.getWidth(),this.getHeight());
				var pix = imgd.data;

				// Loop over each pixel and invert the color.
				for (var i = 0, n = pix.length; i < n; i += 4) {
				  pix[i  ] = 255 - pix[i  ]; // red
				  pix[i+1] = 255 - pix[i+1]; // green
				  pix[i+2] = 255 - pix[i+2]; // blue
				  // i+3 is alpha (the fourth element)
				}						

				this.ctx.putImageData(imgd, 0, 0);				
			},
			
			getFullImage: function() {
				return this.ctx.getImageData(0,0,this.getWidth(),this.getHeight());
			},
			
			getImage: function(x,y,width,height) {
				return this.ctx.getImageData(x,y,width,height);
			},
			
			putImage: function(imgd, x,y) {
				this.ctx.putImageData(imgd, x, y);
			}

		}); // define CanvasPanelClass