
(function(window) {
	/*
	this.body = new Box(this.dest_x + this.hitoff_x,
						this.dest_y + this.hitoff_y,
						this.hit_width,
						this.hit_height,
						this.tile_id)
	*/
	function Background(img){
		this.view = new createjs.Bitmap(img.src)
		this.view.regX = this.view.regY = 0
		this.view.on('tick', bg_tick)
		this.view.image.onload = function(){
			view.bg_width = this.width
			view.bg_height = this.height
			view.free()
		}

		
	}
	function Link(data, sheet){
		this.view = new createjs.Bitmap(sheet.src)
		this.view.regX = data.hitoff_x + data.hit_width/2
		this.view.regY = data.hitoff_y + data.hit_height/2
		for(var i in data){
			if(data.hasOwnProperty(i) && i !== 'visible'){
				this.view[i] = data[i]
			}
		}
		this.view.is_visible = player_vis
		
		this.view.on('tick', tick)
		this.view.init = link_init
		this.view.ontick = function(){}
		this.view.count = 0
	}
	
	var link_init = function(){
		//this.is_visible = function(){return false}
		for(var i = 0; i < stage.children.length; i++){
			if(stage.children[i].update !== 'link' && stage.children[i].name === this.linkto){
				var anchor = stage.children[i]
				this.body = anchor.body
				this.regX = anchor.hitoff_x + anchor.hit_width/2
				this.regY = anchor.hitoff_y + anchor.hit_height/2
				this.count = anchor.count
				this.frame_rate = anchor.frame_rate
				return
			}
		}
		console.log('No Player!')
	}
	
	var player_vis = function(){	
		var resting = this.body.GetUserData()['standing']
		var direction = this.body.GetUserData()['direction']
		if(player.dead){
			return this.visif === 'rest-left'
		}
		switch(this.visif){
			case 'run-left':
				return (keydown.left || keydown.A) && (resting && direction === 'left') 
				break
			case 'run-right':
				return (keydown.right || keydown.D) && (resting && direction === 'right')
				break
			case 'rest-left':
				return (!(keydown.left || keydown.A || keydown.right || keydown.D) 
						&& resting
						&& direction === 'left'
						)
				break
			case 'rest-right':
				return (!(keydown.left || keydown.A || keydown.right || keydown.D) 
						&& resting
						&& direction === 'right'
						)
				break
			case 'jump-left':
				return !(resting) && direction === 'left'
				break
			case 'jump-right':
				return !(resting) && direction === 'right'
				break
			case 'fall-left':
				return false
				break
			case 'fall-right':
				return false
				break
			case undefined:
				return false
				break
			case 'true':
				return true
				break
			case 'false':
				return false
				break;
			default:
				console.log('unknown visif')
				return true
		}
	
	}
	
	var kill = function(){
		//console.log('BLAM! I\'m dead.')
		world.DestroyBody(this.body)
		stage.removeChild(this)
		//this.body.ontick = function(){}
	}
	
	function Sensor(data){
		var w = data.width/2
		var h = data.height/2
		var x = data.x
		var y = data.y
		
		this.view = {}
		this.view.name = data.name
		
		var body_def = new b2.BodyDef()
		body_def.type = b2.Body.b2_staticBody
		body_def.linearDamping = 0.01
		body_def.position.x = (x + w) / SCALE
		body_def.position.y = (y + h)/ SCALE
		body_def.type = b2.Body.b2_staticBody
		
		var sense_def = new b2.FixtureDef()
		sense_def.isSensor = true
		sense_def.shape = new b2.PolygonShape()
		sense_def.shape.SetAsBox(w / SCALE, h/SCALE)
		sense_def.userData = {sensor: true,
							  name: this.view.name,
							 }
							  
		this.view.body = world.CreateBody(body_def)
		this.view.body.CreateFixture(sense_def)	
		
		sensor[this.view.name] = {x:x/SCALE, y:y/SCALE, w:w/SCALE, h:h/SCALE}

		sensor[this.view.name].touching = sensor[this.view.name].touched = false

		var listen = new b2.ContactListener()
		
		var begin_helper = function(fix_a, fix_b){
			var a = fix_a.GetUserData()
			var b = fix_b.GetUserData()
			if(a && a.sensor && a.name && b && b[0] === 'player_foot'){
				sensor[a.name].touching = true
				sensor[a.name].touched = true
			}
		}
		
		var end_helper = function(fix_a, fix_b){
			var a = fix_a.GetUserData()
			var b = fix_b.GetUserData()
			if(a && a.sensor && a.name && b && b[0] === 'player_foot'){
				sensor[a.name].touching = false
			}
		}
		
		listen.BeginContact = function(contact){
			var fix_a = contact.GetFixtureA()
			var fix_b = contact.GetFixtureB()
			begin_helper(fix_a, fix_b)
			begin_helper(fix_b, fix_a)

		}
		
		listen.EndContact = function(contact){
			var fix_a = contact.GetFixtureA()
			var fix_b = contact.GetFixtureB()
			end_helper(fix_a, fix_b)
			end_helper(fix_b, fix_a)

		}
		
		world.AddContactListener(listen)
	
	}
	
	function Projectile(data, sheet){
		this.r = data.hit_width/2
		this.regX = data.hitoff_x + data.hit_width/2
		this.regY = data.hitoff_y + data.hit_height/2
		this.src_x = data.src_x
		this.src_y = data.src_y
		this.play = data.play
		this.count = this.t = 0
		this.frames = data.frames
		this.frame_rate = data.frame_rate
		this.width = data.width
		this.height = data.height
		this.name = data.name
		this.src = sheet.src
		this.z = data.z
		
	}
	
	Projectile.prototype.fire = function(x, y, v, t){
		if(isNaN(x) || isNaN(y) || isNaN(v) || isNaN(t)){
			console.log('Inappropriate projectile values: ' + [x, y, v, t])
			return 
		}
		//console.log([x, y, v, t])
		var fire = new createjs.Bitmap(this.src)

		fire.x = x*SCALE //+ fire.x
		fire.y = y*SCALE //+ fire.y

		var copy = ['regX', 'regY', 'src_x', 'src_y', 'play', 'count', 'frames',
					'width', 'height', 'name', 'src', 'frame_rate']
		for(var i = 0; i < copy.length; i++){
			fire[copy[i]] = this[copy[i]]
		}
		
		fire.sourceRect = new createjs.Rectangle(this.src_x, this.src_y, 64, 64)
		fire.scaleX = 1
		fire.scaleY = 1
		fire.t = 0
		fire.is_visible = function(){return true}
		
		var fix_def = new b2.FixtureDef()
		fix_def.density = 1
		fix_def.friction = .5
		fix_def.restitution = .1
		fix_def.shape = new b2.CircleShape(this.r/SCALE)
		//fix_def.SetUserData({name: fire.name})

		var body_def = new b2.BodyDef()
		body_def.type = b2.Body.b2_dynamicBody
		body_def.linearDamping = 0.01
		body_def.position.x = x
		body_def.position.y = y
		
		
		
		fire.ontick = function(){
			if(!this.body.IsAwake()){// || this.y > view.ymax + 2*view.h){
				this.kill()
			}
		}
		
		fire.kill = kill
		
		
		fire.body = world.CreateBody(body_def)
		fire.body.CreateFixture(fix_def)		
		fire.on('tick', tick)
		fire.body.SetUserData({name: fire.name})
		fire.body.SetLinearVelocity(new b2.Vec2(v*Math.cos(-t*Math.PI/180), v*Math.sin(-t*Math.PI/180)))
		
		stage.addChild(fire)
		z_sort(stage.children)
		
		return fire
	}
	
	function Tile(data, sheet){
		var w = data.hit_width/2,
			h = data.hit_height/2,
			x = data.dest_x + data.hitoff_x,
			y = data.dest_y + data.hitoff_y
			

		this.view = new createjs.Bitmap(sheet.src)
		for(var i in data){
			if(data.hasOwnProperty(i) && i !== 'visible'){
				this.view[i] = data[i]
			}
		}
		this.view.count = 0
		this.view.regX = data.hitoff_x + w
		this.view.regY = data.hitoff_y + h
		this.view.sourceRect = new createjs.Rectangle(data.src_x, data.src_y, 64, 64)
		this.view.scaleX = 1//2*w/64
		this.view.scaleY = 1//2*h/64
		this.view.is_visible = function(){return true}
		this.view.flip = false
		
		
		var fix_def = new b2.FixtureDef()
		fix_def.density = 1
		fix_def.friction = .5
		fix_def.restitution = .1
		if(data.update === 'ball'){
			fix_def.shape = new b2.CircleShape(w/SCALE)
		}else{
			fix_def.shape = new b2.PolygonShape()
			fix_def.shape.SetAsBox(w / SCALE, h / SCALE)
		}
		
		var body_def = new b2.BodyDef()
		body_def.type = b2.Body.b2_dynamicBody
		body_def.linearDamping = 0.01
		body_def.position.x = (x + w) / SCALE //Math.random()*width / SCALE
		body_def.position.y = (y + h)/ SCALE //0 / SCALE
		
		this.view.ontick = function(){}
		this.view.kill = kill
		
		switch(data.update){
			case 'block':
				body_def.type = b2.Body.b2_staticBody
				break;
			case 'ghost':
				body_def.type = b2.Body.b2_staticBody
				fix_def.filter.maskBits = 0
				break
			case 'player':
				body_def.fixedRotation = true
				fix_def.density = SCALE*SCALE*1/(4*w*h)
				this.view.is_visible = function(){return false}
				
				
				//body_def.allowSleep = false
				this.view.ontick = function(){
					var s = this.body.GetWorldCenter()
					var vmax = this.vmax === undefined ? 10 : this.vmax
					//console.log(vmax)
					
					var imp = 2
					var jump = -20
					//console.log(this.body.GetUserData()['standing'])
					var f = new b2.Vec2(0,0)
					user_data = this.body.GetUserData()
					
					
					var move_left = keydown.A || keydown.left
					var move_right = keydown.D || keydown.right
					var move_jump = keydown.W || keydown.up || keydown.space
					
					var theta = this.body.GetAngle() + Math.PI/2
					var vx = this.body.GetLinearVelocity().Length()*Math.cos(theta - Math.PI/2)
					
					if(move_left){
						user_data['direction'] = 'left'
						//f.Add(new b2.Vec2( vx > -vmax ? -imp : 0, 0))
						if(Math.abs(vx) < vmax){
							var left_vec = vec(-imp*Math.sin(theta), imp*Math.cos(theta))
							f.Add(left_vec)
						}
					}
					if(move_right){
						user_data['direction'] = 'right'
						//f.Add(new b2.Vec2( vx < vmax ? imp : 0, 0))
						if(Math.abs(vx) < vmax){
							var right_vec = vec(imp*Math.sin(theta), -imp*Math.cos(theta))
							f.Add(right_vec)
						}
					}
					//*
					if(!(move_left || move_right)){
						var v = this.body.GetLinearVelocity()
						/*
						var t = theta - Math.PI/2
						var v_x = this.body.GetLinearVelocity().Length()*Math.cos(t)
						var v_y = this.body.GetLinearVelocity().Length()*Math.sin(t)
						v_x *= .9
						var v = vec(v_x*Math.cos(theta) + v_y*Math.sin(theta),
									v_x*Math.sin(theta) - v_y*Math.cos(theta))
						this.body.SetLinearVelocity(v)
						//*/
						this.body.SetLinearVelocity(new b2.Vec2(.9*v.x, v.y))
					}
					//*/
					if(move_jump){
						if(user_data['standing'] && user_data['jumping'] <= 1){
							
							var jump_vec = vec(Math.cos(theta), Math.sin(theta))
							jump_vec.Multiply(jump)
							//f.Add(new b2.Vec2(0, jump))
							f.Add(jump_vec)
							user_data['jumping'] = 10
						}else{
							user_data['jumping'] -= 1
						}
					}else{
						user_data['jumping'] = 0
					}
		
					if(this.stun <= 0){
						this.body.ApplyImpulse(f, s)
					}else{
						this.stun -= 1
					}
					//*
					var x = this.x
					var y = this.y
					if(x > scrollzone.x2 ){ //right
						//console.log('right')
						view.x -= (x - scrollzone.x2)
					}
					if(x < scrollzone.x1){ //left
						//console.log('left')
						view.x -= (x - scrollzone.x1)
					}
					if(y > scrollzone.y2){ //up
						view.y -= y - scrollzone.y2
					}
					if(y < scrollzone.y1){ //down
						view.y -= y - scrollzone.y1
					}
					view.x = constrain(view.x, view.xmin, view.xmax)
					view.y = constrain(view.y, view.ymin, view.ymax)
					
					
					if(this.body.dead){
						this.body.SetFixedRotation(false)
						this.timer = 0
						this.body.SetAngularVelocity(-.1)
						this.body.player = false
						this.ontick = function(){
							this.timer += 1
							if(this.timer > 2*FPS){
								sensor.refresh = {touched:true}
							}
						}
					}
				}
				window.player = this.view
				
				break;
			case 'rest':
				fix_def.restitution = .5
				fix_def.density = .5
				break;
			default:
				lvl_script('update', this, body_def, fix_def)
				
				break;
		}
		
		
		this.view.body = world.CreateBody(body_def)
		this.view.body.CreateFixture(fix_def)		
		this.view.on('tick', tick)
		this.view.body.SetUserData({})
		
		lvl_script('init', this.view, 2*w / SCALE, 2*h / SCALE)
		
		
		
		if(data.update ==='player'){
			this.view.body.player = true
			this.view.body.GetUserData()['standing'] = false
			this.view.body.GetUserData()['direction'] = 'left'
			this.view.stun = 0
			
			
			var fix_def = new b2.FixtureDef()
			fix_def.shape = new b2.PolygonShape()
			fix_def.shape.SetAsBox(1.1*w / SCALE, .95*h / SCALE)
			fix_def.friction = 0
			
			this.view.body.CreateFixture(fix_def)
			
			var sense_def = new b2.FixtureDef()
			sense_def.isSensor = true
			sense_def.shape = new b2.PolygonShape()
			sense_def.shape.SetAsOrientedBox(.9*w / SCALE, .5*w / SCALE, new b2.Vec2(0, ( h)/SCALE), 0)
			sense_def.userData = ['player_foot', 0]
			
			this.view.body.CreateFixture(sense_def)
			this.view.body.GetUserData()['direction'] = 'right'
			
			var listen = new b2.ContactListener()
			var helper = function(fixture_a, fixture_b, add){
				var a = fixture_a.GetUserData()
				var b = fixture_b.GetUserData()
				if(a && a[0] === 'player_foot' && !(b && (b[0] === 'switch' || b.sensor))){
					a[1] += add
					var body = fixture_a.GetBody()
					body.GetUserData()['standing'] = a[1] > 0
				}
			}
			
			listen.BeginContact = function(contact){
				var fix_a = contact.GetFixtureA()
				var fix_b = contact.GetFixtureB()
				helper(fix_a, fix_b, 1)
				helper(fix_b, fix_a, 1)

			}
			listen.EndContact = function(contact){
				var fix_a = contact.GetFixtureA()
				var fix_b = contact.GetFixtureB()
				helper(fix_a, fix_b, -1)
				helper(fix_b, fix_a, -1)
			}
			
			world.AddContactListener(listen)
		}
		
	}
	
	
	
	
	function make_ccw(point_list){
		var a = 0;
		var n = point_list.length
		var points = point_list.slice()
		for(var i = 0; i < 3; i++){
			a += points[i][0]*points[(i+1)%n][1] - points[(i+1)%n][0]*points[i][1]
		}
		if(a > 0.01){
			return points
		}else if(a < -0.01){
			return points.reverse()
		}else{
				console.log('Zero Area Triangle')
		}
	}
	
	function Triangle(data){
		this.view = {}
		this.corners = make_ccw(data)
		if(!this.corners){
			return
		}
		this.view.is_visible = function(){return false}
		
		var fix_def = new b2.FixtureDef()
		fix_def.density = 1
		fix_def.friction = .5
		fix_def.restitution = .1
		fix_def.shape = new b2.PolygonShape()
		var vertices = []
		for(var i = 0 ; i < this.corners.length ; i++){
			vertices[i] = new b2.Vec2(this.corners[i][0]/SCALE, this.corners[i][1]/SCALE)
		}
		fix_def.shape.SetAsVector(vertices, 3)
		var body_def = new b2.BodyDef()
		body_def.type = b2.Body.b2_staticBody

		this.view.body = world.CreateBody(body_def)
		this.view.body.CreateFixture(fix_def)	
		
	}

	window.Tile = Tile
	window.Link = Link
	window.Background = Background
	window.Triangle = Triangle
	window.Sensor = Sensor
	window.Projectile = Projectile
	
	function tick(){

		this.visible = this.is_visible()
		var pos = this.body.GetPosition()
		this.x = pos.x*SCALE + view.x
		this.y = pos.y*SCALE + view.y
		this.rotation = this.body.GetAngle() * (180/Math.PI)
		this.scaleX = this.flip ? -1 : 1
		this.sourceRect = new createjs.Rectangle(this.src_x + this.t*this.width, 
												 this.src_y,
												 this.width,
												 this.height)
		this.count += 1
		if(this.play === 'Loop' && !(this.count % Math.floor(FPS/this.frame_rate))){
			this.t = (this.t + 1)%this.frames
			this.frame_change = true
		}else{
			this.frame_change = false
		}
		this.ontick()
	
	}
	
	function bg_tick(){
		this.x = view.x// * SCALE
		this.y = view.y// * SCALE
	}
	
})(window);
