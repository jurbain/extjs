Ext.application({
    name: 'HelloExt',
    
    requires: [
    	'Ext.container.Viewport'
    ],
    
    launch: function() {
    
    	var	STARTSPEED	= 10;
    	var	SPEED		= STARTSPEED;
    	var	STARTZOOM	= 50;
    	var ZOOM		= STARTZOOM;
    	var GRAVITY		= 10000;
    	
    	var	MAXPOS		= 1000000000;
    	var	MOONPOS		= MAXPOS/20
    	var MAXSPEED	= 400000;
    	var	MOONSPEED	= 40000;
    	var	MINDISTANCE	= 100000;		// TODO
    	var	SHOWPLANETS	= true;
    	var	SHOWSTARS	= true;
    	var	SHOWMOONS	= true;  
    	
    	var NUMBER_OF_STARS		= 1;
    	var	NUMBER_OF_PLANETS	= 10;
    	var NUMBER_OF_MOONS		= 10;
    	var MAXOBJECTS			= NUMBER_OF_STARS+NUMBER_OF_PLANETS+NUMBER_OF_MOONS;
    	
    	var GRIDCOLOR 	= "rgb(60,0,0)";
    	
    	var CANVASSIZE	= 600;    	
    	
    	var objects = [];
    	
    	var centerObject = null;
    	
    	var imgd = null;
    	
		function isEven(someNumber) {
			return (someNumber%2 == 0) ? true : false;
		}
    	
		function getRandom(min, max) {
			 if(min > max) {
			  return -1;
			 }

			 if(min == max) {
			  return min;
			 }

			 var r;

			 do {
			  r = Math.random();
			 }
			 while(r == 1.0);

			 return min + parseInt(r * (max-min+1));
		}    	
		
		function scale(posval) {			
			var p = (posval/MAXPOS)*CANVASSIZE;			
			return 50*p/ZOOM + CANVASSIZE/2;
		}
		
		function scaleOut(xy) {
			var temp = xy - CANVASSIZE/2;
			temp = temp*ZOOM/50;
			
			return MAXPOS*temp/CANVASSIZE;
		}
		
		function distance(o1,o2) {
			return Math.sqrt( Math.pow(o1.pos.x-o2.pos.x,2) + Math.pow(o1.pos.y-o2.pos.y,2));
		}		
		
		function findClosestObject(x,y) {
			var closestDistance = MAXPOS;
			var closestIndex = -1;
			
			var o = { pos : { x:0, y:0 } };
			o.pos.x = scaleOut(x);
			o.pos.y = scaleOut(y);
			
			for (var i = 0; i<MAXOBJECTS; i++) {
				var d = distance(o,objects[i]);
				
				if (d<closestDistance) {
					closestDistance = d;
					closestIndex = i;
				}
			}
			return objects[closestIndex];
		}
		
		function centerOnObject(o) {
		
			var dx = o.pos.x;
			var dy = o.pos.y;
			
			for (var i = 0; i<MAXOBJECTS; i++) {
				
				objects[i].pos.x -= dx;
				objects[i].pos.y -= dy;
			}			
		}

		// TODO: check distances
		// TODO: background image
		
		//========================================================
		function planetaryObject( i, type, parentBody ) {			
			this.nr = i;			
			this.speed = { dx : 0, dy : 0 };		
			this.type = type;
			this.mass = 0;		
			
			radiusIncrement = MAXPOS/NUMBER_OF_PLANETS;
			
			switch (type) {
				case "Star":
					this.mass = 10000000;
					this.pos = { x : 0, y : MAXPOS/2-getRandom(0,MAXPOS) };
					if (i>0) {
						this.speed = { dx : MAXSPEED + getRandom(0,100000), dy : 0 };
					}
					break;
					
				case "Planet":
					if (getRandom(0,1) == 0) {
						this.mass = 150000; //TODO factor 5 to light??
					} else {
						this.mass = 150000;
					}
					if (isEven(i)) {
						this.pos = { x : 0, y : getRandom(0,radiusIncrement)*i };
					} else {
						this.pos = { x : 0, y : -getRandom(0,radiusIncrement)*i };
					}
					//planets should not go retrograde
					if (this.pos.y > 0) {
						this.speed = { dx : MAXSPEED/1.2 /*+ getRandom(0,10000)*/, dy : 0 };
					} else {
						this.speed = { dx : -MAXSPEED/1.2 /*+ getRandom(0,10000)*/, dy : 0 };
					}
					
					break;
					
				case "Moon": 					
					this.mass = 3000;
					this.pos = { x : 0, y : parentBody.pos.y+MOONPOS/2-getRandom(0,MOONPOS) };
					this.speed = { dx : parentBody.speed.dx+MOONSPEED/*+getRandom(0,MOONSPEED)*/, dy : parentBody.speed.dy };
					break;
					
				default:
					this.mass = 3000;				
			}
		};
		
		planetaryObject.prototype.getColor = function() {
			
			switch (this.type) {
				case "Star": return "white";
					break;
					
				case "Planet":
					return "red"; break;
					
				case "Moon": return "green";
					break;	
					
				default: return "blue";
			}
		}

		planetaryObject.prototype.getType = function() {
			return this.type;
		}

		planetaryObject.prototype.getMass = function() {
			return this.mass;
		}

		planetaryObject.prototype.getRadius = function() {
			if (this.getType() == "Star") {
				return 5+200/ZOOM;
			} else {
				return 200/ZOOM;
			}
		}

		planetaryObject.prototype.move = function() {
			this.pos.x += this.speed.dx;
			this.pos.y += this.speed.dy;
			//TODO mirror at boundary
		}

		planetaryObject.prototype.draw = function() {
			var type = this.getType();

			if ((type == "Star") && (SHOWSTARS == false)) return;
			if ((type == "Moon") && (SHOWMOONS == false)) return;
			if ((type == "Planet") && (SHOWPLANETS == false)) return;    					

			if (type == "Star") {
				//canvasPanel[0].clearRect(scale(this.pos.x)-this.getRadius()/2, scale(this.pos.y)-this.getRadius()/2, this.getRadius(), this.getRadius());
				canvasPanel[0].loadImageScaled('sun.jpg',scale(this.pos.x)-this.getRadius()/2, scale(this.pos.y)-this.getRadius()/2, this.getRadius(), this.getRadius());
			} else {


				if (ZOOM < 6) {    	
					//canvasPanel[0].clearRect(scale(this.pos.x)-this.getRadius()/2, scale(this.pos.y)-this.getRadius()/2, this.getRadius(), this.getRadius());

					if (this.getMass() > 300000) {
						canvasPanel[0].loadImageScaled('saturn.jpg',scale(this.pos.x)-this.getRadius()/2, scale(this.pos.y)-this.getRadius()/2, this.getRadius(), this.getRadius());    							
					} else if (this.getMass() > 200000) {
						canvasPanel[0].loadImageScaled('gasgiant1.jpg',scale(this.pos.x)-this.getRadius()/2, scale(this.pos.y)-this.getRadius()/2, this.getRadius(), this.getRadius());
					} else if (this.getMass() > 100000) {
						canvasPanel[0].loadImageScaled('gasgiant2.jpg',scale(this.pos.x)-this.getRadius()/2, scale(this.pos.y)-this.getRadius()/2, this.getRadius(), this.getRadius());
					} else {
						canvasPanel[0].loadImageScaled('iceplanet.jpg',scale(this.pos.x)-this.getRadius()/2, scale(this.pos.y)-this.getRadius()/2, this.getRadius()/2, this.getRadius()/2);    							
					}

				}
				canvasPanel[0].putPixel( scale(this.pos.x), scale(this.pos.y), 1, this.getColor() );
			}
		}

		planetaryObject.prototype.gravity = function() {
			for (var j = 0; j<MAXOBJECTS; j++) {
				//only calc gravity with other objects
				if (objects[j].nr != this.nr) {
					//g = m*M/r^2
					//F = m*a
					//eigene Masse ist rausgekürzt
					var gravity = GRAVITY*(objects[j].getMass())/Math.pow(distance(this,objects[j]),2);
					//console.log("gravity="+gravity);

					//get diff vector
					var diffy = this.pos.y - objects[j].pos.y;
					var diffx = this.pos.x - objects[j].pos.x;

					this.speed.dx -= (diffx*gravity);
					this.speed.dy -= (diffy*gravity);
				}
			}
		}		
		
		//========================================================		
    	
    	function initializeObjects() {
    	
    		//var objectCount = 0;
    		
    		console.log('Initializing '+NUMBER_OF_STARS+' stars...');
    		for (var i = 0; i<NUMBER_OF_STARS; i++) {
				objects[i] = new planetaryObject(i, "Star", null);
    		} // for i    

			console.log('Initializing '+NUMBER_OF_PLANETS+' planets...');
    		for (var i = NUMBER_OF_STARS; i<NUMBER_OF_STARS+NUMBER_OF_PLANETS; i++) {
				objects[i] = new planetaryObject(i, "Planet", null);
    		} // for i    
    		
    		console.log('Initializing '+NUMBER_OF_MOONS+' moons...');
    		for (var i = NUMBER_OF_STARS+NUMBER_OF_PLANETS; i<NUMBER_OF_STARS+NUMBER_OF_PLANETS+NUMBER_OF_MOONS; i++) {
    		
    			var parentObjectIndex = getRandom(NUMBER_OF_STARS,NUMBER_OF_STARS+NUMBER_OF_PLANETS-1);
    		
				objects[i] = new planetaryObject(i, "Moon", objects[parentObjectIndex]);
    		} // for i      		
    		
    		
    		//center the sun //TODO this goes wrong when object zero is no star 
    		objects[0].pos.x = 0; 
    		objects[0].pos.y = 0;       		

    		centerObject = objects[0];   	
    	}
    	
		function updateGraphics() {

			//canvasPanel[0].putImage(imgd,0,0);

			//imgd = canvasPanel[0].getFullImage();				
			
			for (var i = 0; i<MAXOBJECTS; i++) {
				objects[i].gravity();
				objects[i].move();	
				objects[i].draw();
			}
			centerOnObject(centerObject);
			for (var i = 0; i<MAXOBJECTS; i++) {	
				objects[i].draw();
			}			

		}
    	
    	var cycles = 0;
    	
		// Start a simple clock task that updates a div once per second
		var task = {
			run: function(){
				for (var i=0; i<SPEED; i++) {
				
					cycles ++;
					/*
					if (cycles > 1000) {
						setZoom(ZOOM);
						cycles = 0;
					}
					*/
					updateGraphics();																					
				}

			},
			interval: 1 //ms - not sure how small this can be 
		}   								
		
		//===============================================================	
		
		function restartSimulation() {
			Ext.TaskManager.stop(task);
			
			setZoom(STARTZOOM);
			zoomslider.setValue(STARTZOOM);
			mytext.setValue(STARTZOOM);
			setSpeed(STARTSPEED);
			speedslider.setValue(STARTSPEED);
			
			//delete all objects
			for (var i=0; i<MAXOBJECTS; i++) {
				delete objects[i];
				objects[i] = null;
			}		
			
			NUMBER_OF_STARS = parseInt( starNumberEdit.getValue() );
			NUMBER_OF_MOONS = parseInt( moonNumberEdit.getValue() );
			NUMBER_OF_PLANETS = parseInt( planetNumberEdit.getValue() );
			
			MAXOBJECTS = NUMBER_OF_STARS+NUMBER_OF_PLANETS+NUMBER_OF_MOONS;
			
			initializeObjects();
			
			Ext.TaskManager.start(task);
		}
		
		function setZoom(newValue) {
			canvasPanel[0].clear();
			ZOOM = newValue;
			if (ZOOM <= 150) {
				canvasPanel[0].renderGrid(25*50/ZOOM,GRIDCOLOR);
			}					
		}
		
		function setSpeed(newValue) {
			SPEED = newValue;		
		}		
		
		var starsButton = Ext.create('Ext.Button', {
			text: 'Stars',
			width: 100,
			tooltip: 'Show star-like objects',
			handler: function() { 
				if (SHOWSTARS == true) canvasPanel[0].clear();
				SHOWSTARS = !SHOWSTARS; 
				canvasPanel[0].renderGrid(25*50/ZOOM,GRIDCOLOR);				
			}
		});
		
		var planetsButton = Ext.create('Ext.Button', {
			text: 'Planets',
			width: 100,
			tooltip: 'Show planet-like objects',
			handler: function() { 
				if (SHOWPLANETS == true) canvasPanel[0].clear();
				SHOWPLANETS = !SHOWPLANETS; 				
				canvasPanel[0].renderGrid(25*50/ZOOM,GRIDCOLOR);							
			}	
		});
		
		var moonsButton = Ext.create('Ext.Button', {
			text: 'Moons',
			width: 100,
			tooltip: 'Show moon-like objects',
			handler: function() { 
				if (SHOWMOONS == true) canvasPanel[0].clear();
				SHOWMOONS = !SHOWMOONS;
				canvasPanel[0].renderGrid(25*50/ZOOM,GRIDCOLOR);				
			}	
		});		
		
		var mytext = Ext.create('Ext.form.TextField', {
			value: ZOOM,
			width: 50
		});		
		mytext.on({
			blur: function() {
				setZoom(mytext.getValue());
			}
		});
		
		var zoomslider = Ext.create('Ext.slider.Single', {
			width: 200,
			value: ZOOM,
			increment: 1,
			minValue: 1,
			maxValue: 200,
			tooltip: 'zoom',
			listeners : {
				change : {
					scope: this,
					fn:function(slider, newValue, thumb, eOpts) {	
						mytext.setValue(newValue);	
						setZoom(newValue);
					}
				}
			}
		});	
		
		var speedslider = Ext.create('Ext.slider.Single', {
			width: 100,
			value: SPEED,
			increment: 1,
			minValue: 1,
			maxValue: 50,
			tooltip: 'speed',
			listeners : {
				change : {
					scope: this,
					fn:function(slider, newValue, thumb, eOpts) {	
						mytext.setValue(newValue);	
						setSpeed(newValue);
					}
				}
			}
		});			
		
		var canvasPanel = [];
			
		var tablePanel = Ext.create('Ext.panel.Panel', {
			width: '100%',
			layout: {
				type: 'table',
				columns: 2
			}	
		});		
		
		var formPanel = Ext.create('Ext.form.Panel', {
			layout: 'anchor',
			defaults: {
				anchor: '100%'
			},
			defaultType: 'textfield'		
		});		
		
		var planetNumberEdit = Ext.create('Ext.form.TextField', {
			fieldLabel: 'Number of planets',
			value: NUMBER_OF_PLANETS
		});
		
		var moonNumberEdit = Ext.create('Ext.form.TextField', {
			fieldLabel: 'Number of moons',
			value: NUMBER_OF_MOONS
		});
		
		var starNumberEdit = Ext.create('Ext.form.TextField', {
			fieldLabel: 'Number of stars',
			value: NUMBER_OF_STARS
		});		
		
		
		var restartButton = Ext.create('Ext.Button', {
			text: 'Restart',
			width: 100,
			tooltip: 'restart simulation',
			handler: function() { restartSimulation(); }
		});				
		
		formPanel.add( planetNumberEdit );
		formPanel.add( moonNumberEdit );
		formPanel.add( starNumberEdit );
		formPanel.add( restartButton );
		
		
		for (var i=0; i<1; i++) {
			canvasPanel[i] = new CanvasPanelClass({
				height: CANVASSIZE,
				width: CANVASSIZE,
				gridColor: GRIDCOLOR
			});			
			
			
			canvasPanel[i].on({
				mousedown: function(DOMevent) {
				
							var canvasPanelX = this.getPosition()[0];
							var canvasPanelY = this.getPosition()[1];						
							
							//this.invert();
							var point = DOMevent.getPoint();
							
							var eventX = point.x-canvasPanelX;
							var eventY = point.y-canvasPanelY;							
							
							//alert("Point: "+eventX+","+eventY);
							
							var o = findClosestObject(eventX,eventY);
							
							//alert( "Object: "+ o.nr+", Mass: "+o.getMass());
							
							centerOnObject(o);
							centerObject = o;
							canvasPanel[0].clear();
							canvasPanel[0].renderGrid(25*50/ZOOM,GRIDCOLOR);
						},
				element: 'body',										
				scope: canvasPanel[i] // Important. Ensure "this" is correct during handler execution
			});

			tablePanel.add(canvasPanel[i]);		
									
		} // for

		tablePanel.add(formPanel);

        var viewport = Ext.create('Ext.container.Viewport', {
            layout: 'vbox',            
            items: [
            	{
            	    width: '100%',
                    title: 'ExtJS HTML5',
                    html : '<br> &nbsp ExtJS HTML5 Stellar System Simulation<br><br>'                    
                },                
                {
                	xtype : 'toolbar',
                	width: '100%',              	
                	items : [
                		'Zoom:', mytext, '-', zoomslider, '-', 'Speed: ', speedslider, '-', starsButton, '-', planetsButton, '-', moonsButton
                	]
                },
                tablePanel
            ]
        });						
	
	//===========================
	
	initializeObjects();
	
	Ext.TaskManager.start(task);
	
	//===========================

    } // launch
});