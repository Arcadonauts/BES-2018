console.log('graphics2d.js loaded')
/*
To Do:
	Comments
	Uniboar



*/
var b2 = {
	Vec2: Box2D.Common.Math.b2Vec2,
	BodyDef: Box2D.Dynamics.b2BodyDef,
	Body: Box2D.Dynamics.b2Body,
	ContactListener: Box2D.Dynamics.b2ContactListener,
	FixtureDef: Box2D.Dynamics.b2FixtureDef,
	Fixture: Box2D.Dynamics.b2Fixture,
	World: Box2D.Dynamics.b2World,
	MassData: Box2D.Collision.Shapes.b2MassData,
	PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
	CircleShape: Box2D.Collision.Shapes.b2CircleShape,
	DebugDraw: Box2D.Dynamics.b2DebugDraw,
	DistanceJoint: Box2D.Dynamics.Joints.b2DistanceJoint,
	DistanceJointDef: Box2D.Dynamics.Joints.b2DistanceJointDef,
	RevoluteJoint: Box2D.Dynamics.Joints.b2RevoluteJoint,
	RevoluteJointDef: Box2D.Dynamics.Joints.b2RevoluteJointDef,
	WeldJoint: Box2D.Dynamics.Joints.b2WeldJoint,
	WeldJointDef: Box2D.Dynamics.Joints.b2WeldJointDef,
	PrismaticJointDef: Box2D.Dynamics.Joints.b2PrismaticJointDef,
}

//window.onblur = function(){stage.paused.now = true; tick()}

function vec(x, y){
	return new b2.Vec2(x,y)
}

var SCALE = 30
var DEBUG = false
var FLICKER = false
var FPS = 60
var width = 64*10
var height = 64*8

var stage, world
var lvl_script = window.lvl_script || function(){}



var loader = {	sheet: undefined,
				background: undefined,
				foreground: undefined,
				loaded: false,
				count: 0,
				max: 4,
				text: new createjs.Text("Loading...", "bold 86px Arial"),
				inc: function(){
					this.count += 1
				},
				load: function load(){
					if(this.loaded){
						return true
					}

					var loader = this
					//this.name = document.URL.match(/\w+$/)[0]
					this.name = document.location.pathname.match(/\w+$/)[0]
					console.log(this.name)

					//http://www.kryptonite-dove.com/blog/load-json-file-locally-using-pure-javascript
					var xobj = new XMLHttpRequest();
					xobj.overrideMimeType("application/json");
					xobj.open('GET', '/static/BES/levels/data' + this.name + '.json', true); // Replace 'my_data' with the path to your file
					xobj.onreadystatechange = function () {
						  if (xobj.readyState == 4 && xobj.status == "200") {
							// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
							loader.data = JSON.parse(xobj.responseText)
							loader.load_images()
							loader.setup_level()
						  }
					};
					xobj.send(null);

					this.loaded = true

					return false
				},
				setup_level: function(){

					view = stage.view = this.data.view
					scrollzone = this.data.scrollzone

					var sheet = this.sheet
					var background = this.background
					var foreground = this.foreground

					var lvl = this.data.lvl
					var triangles = this.data.triangles



					stage.win = function(){
						if(!stage.won){
							var win = new createjs.Bitmap(loader.you_win.src)
							win.z = 100
							stage.addChild(win)
							z_sort(stage.children)
							stage.won = true
						}

					}

					console.log('lvl has ' + lvl.length + ' tiles.')
					view.x = 0
					view.y = 0
					view.panning = false
					view.wiggle = function (amount, length, t){
						this.t = t || this.t
						this.wiggle_amount = amount || this.wiggle_amount
						this.wiggle_length = length || this.wiggle_length
						if(this.t < this.wiggle_length){
							this.t += 1
							stage.x = (2*Math.random() - 1)*this.wiggle_amount
							stage.y = (2*Math.random() - 1)*this.wiggle_amount
						}else{
							stage.x = stage.y = 0
						}
					}
					view.snap = function(x0, y0, w, h){
						// This is magic. Do not edit unless you're a wizard.
						//console.log('Oh, snap!')
						if(!isNaN(x0) || !isNaN(y0)){
							this.xmax = x0
							this.ymax = y0
							this.xmin = this.xmax + (this.w - w || 0)
							this.ymin = this.ymax + (this.h - h || 0)
						}else{
							this.xmax = this.xmin = this.x
							this.ymax = this.ymin = this.y
						}
					}
					view.free = function(){
						this.panning = false
						this.xmin = this.w - this.bg_width
						this.xmax = 0
						this.ymin = this.h - this.bg_height
						this.ymax = 0
					}
					view.pan = function(x0, y0, v){
						v = v || 1
						if(this.panning){
							if(this.x > x0 + v){
								this.x -= v
							}else if(this.x < x0 -v){
								this.x += v
							}else{
								this.x = x0
							}

							if(this.y > y0 + v){
								this.y -= v
							}else if(this.y < y0 -v){
								this.y += v
							}else{
								this.y = y0
							}
							this.snap()
						}else{
							this.snap()
							this.panning = true
						}
					}
					view.wiggle(0, 0, 0)


					stage.paused = {now: false,
									down: false}

					var text = new createjs.Text("PAUSED", "bold 86px Arial");
					text.x = 320 - text.getBounds().width/2
					text.y = 100
					text.z = 1000
					text.visible = false
					stage.addChild(text)
					stage.paused.text = text

					var text = new createjs.Text("Press P to resume play.", "bold 42px Arial");
					text.x = 320 - text.getBounds().width/2
					text.y = 180
					text.z = 1000
					text.visible = false
					stage.addChild(text)
					stage.paused.subtext = text

					projectiles = {}
					for(var i = 0; i < lvl.length; i++){
						switch(lvl[i].update){
							case 'projectile':
								var p = new Projectile(lvl[i], sheet)
								projectiles[p.name] = p
								break
							case 'link':
								var b = new Link(lvl[i], sheet)
								stage.addChild(b.view)
								break
							default:
								var b = new Tile(lvl[i], sheet)
								stage.addChild(b.view)
						}
					}

					sensor = {}
					if(this.data.sensors){
						for(var i = 0; i < this.data.sensors.length; i++){
							var s = new Sensor(this.data.sensors[i])
						}
					}


					var bg = new Background(background)
					bg.view.z = -10
					stage.addChild(bg.view)

					var fg = new Background(foreground)
					fg.view.z = 10
					stage.addChild(fg.view)



					try{
						triangles
					}catch(e){
						triagles = []
					}

					for(var i = 0; i < triangles.length; i++){
						var tri = new Triangle(triangles[i])
					}

					for(var i = 0; i < stage.children.length; i++){
						if(stage.children[i].init){
							stage.children[i].init()
						}
					}

					z_sort(stage.children)






				},
				load_images: function(){
					console.log('Loading Images...')

					this.sheet = new Image()
					this.sheet.onload = function(){loader.inc()}
					this.background = new Image()
					this.background.onload = function(){loader.inc()}
					this.foreground = new Image()
					this.foreground.onload = function(){loader.inc()}
					this.you_win = new Image()
					this.you_win.onload = function(){loader.inc()}

					try{ // Did the data file load properly?
						this.sheet.src = "/static/BES/imgs/" + loader.data.sheetname
					}catch(e){
						window.location = '/'
					}

					if(loader.data.backgroundname){
						try{
							var bg_name = loader.data.backgroundname.split('.')[0]
							this.background.src = '/static/BES/imgs/' + bg_name + '.jpg'
						}catch(e){
							this.background.src = loader.data.backgroundname
						}
					}else{
						this.count += 1
					}

					if(loader.data.foregroundname){
						this.foreground.src = '/static/BES/imgs/' + loader.data.foregroundname
					}else{
						this.count += 1
					}

					this.you_win.src = '/static/BES/imgs/you_win.png'

				}
			}

/*
var text = new createjs.Text("PAUSED", "bold 86px Arial");
	text.x = 320 - text.getBounds().width/2
	text.y = 100
	text.z = 1000
	text.visible = false
	stage.addChild(text)
	stage.paused.text = text
*/


function init(arg){

	var canvas = document.getElementById('canvas')
	if(!canvas){canvas = document.createElement('canvas')}
	canvas.width = width
	canvas.height = height
	canvas.id = 'canvas'
	document.body.appendChild(canvas)
	stage = new createjs.Stage(canvas)
	stage.links = []
	//stage.view = view

	loader.text.x = 320 - loader.text.getBounds().width/2
	loader.text.y = 100
	loader.text.z = 1000
	loader.text.visible = true
	stage.addChild(loader.text)

	setup_physics()
	setup_level()
	disp.setup()


	createjs.Ticker.addEventListener("tick", tick)
	createjs.Ticker.setFPS(FPS)
	createjs.Ticker.useRAF = true

	lvl_script('lvl_init', arg)

}

function setup_level(){
	var loaded = loader.load()
	if(loaded){
		loader.setup_level()
	}
}

function setup_physics(){
	world = new b2.World(new b2.Vec2(0, 50), true)

	world.listeners = []
	var listen = new b2.ContactListener()
	var helper = function(ListenProp){
		var f = function (a, b){
			for(var i = 0; i < world.listeners.length; i++){
				if(world.listeners[i][ListenProp]){
					world.listeners[i][ListenProp](a, b)
				}
			}
		}
		return f
	}

	var props = ['BeginContact', 'EndContact', 'PostSolve', 'PreSolve']
	for(var i = 0; i < props.length; i++){
		listen[props[i]] = helper(props[i])
	}

	world.AddContactListener = function(listen){
		world.listeners.push(listen)
	}
	world.SetContactListener(listen)

	world.ontick = function(){
		if(sensor.refresh && sensor.refresh.touched){
			init(stage.checkpoint)
		}
		if(sensor.snap && sensor.snap.touched){
			//*
			view.snap()
			this.ontick = function(){}
			//*/
		}
	}

	// setup debug draw
	debug_draw = new b2.DebugDraw()
	debug_draw.SetSprite(stage.canvas.getContext('2d'))
	debug_draw.SetDrawScale(SCALE)
	debug_draw.SetFlags(b2.DebugDraw.e_shapeBit | b2.DebugDraw.e_jointBit | b2.DebugDraw.e_centerOfMassBit)
	world.SetDebugDraw(debug_draw);

}

function tick(){
	if(loader.count < loader.max){
		loader.text.visible = true
		stage.update()
		return
	}else{
		loader.text.visible = false
		if(stage.paused.now){
			if(!stage.paused.text.visible){
				stage.paused.text.visible = true
				stage.paused.subtext.visible = true
				stage.update()
			}
		}else{
			stage.paused.text.visible = false
			stage.paused.subtext.visible = false
			stage.update()
			view.wiggle()
			world.ontick()
			lvl_script('ontick')
			if(DEBUG){
				var context = (stage.canvas.getContext('2d'))
				context.save()
				context.translate(view.x, view.y)
				world.DrawDebugData()
				context.restore()
			}
			DEBUG = FLICKER != DEBUG
			world.Step(1/FPS, 10, 10)
		}
		if(keydown.P && ! stage.paused.down){
			stage.paused.now = ! stage.paused.now
		}
		stage.paused.down = keydown.P
		}

}







