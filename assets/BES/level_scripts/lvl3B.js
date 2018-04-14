console.log('Level two script loaded');
/*
Coconuts should do damage
You turn red like the uniboar
faster Boats
more coconuts at end
more coconuts on second boat
space bar to jump
slower uniboar/ faster cannon 

uniboar should change directions 
add on another coconut throwing tree
coconut should explode 3 seconds after it falls if not put in cannon
less water creatures
add sound affects!


*/

/*
boat1:
	update: boat
	rangex: 44
	rangey: -2
	v: 2
	z: -1
	
boat2:
	update: boat
	rangex: 30
	rangey: 5
	z: 3


//*/
(function(window) {
	
	var scripts = {
		ontick: function(){
			for(var goal in stage.checkpoint){
				if(stage.checkpoint.hasOwnProperty(goal)){
					if(!stage.checkpoint[goal]){
						return
					}
				}
			}
			stage.win()
			
		},
		lvl_init: function(checkpoint){
			stage.checkpoint = checkpoint || {carrots: false,
											  pineapple: false,
											  fuzzies: false,
											  kisses: false,
											  astropanda: false}
			console.log(stage.checkpoint)
			
		},
		update: function(that, body_def, fix_def){
			var cat_pinball = 1,
				cat_paddle = 8,
				cat_pin = 4
				
				
			var mask_pinball = cat_paddle,
				mask_paddle = cat_pinball | cat_pin,
				mask_pin = cat_paddle
				
			switch(that.view.update){
				case 'wall':
					body_def.type = b2.Body.b2_staticBody
					break
				case 'goal':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				case 'carrot':
					fix_def.shape = new b2.CircleShape(2)
					break
				case 'teleport':
					fix_def.isSensor = true
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'octo':
					fix_def.isSensor = true
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'kiss':
					body_def.type = b2.Body.b2_staticBody
					break
				case 'accelerate':
					fix_def.isSensor = true
					body_def.type = b2.Body.b2_staticBody
					break
				case 'worm':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'paddle':
					body_def.allowSleep = false
					fix_def.filter.categoryBits = cat_paddle
					fix_def.filter.maskBits = mask_paddle
					fix_def.restitution = .2
					break
				case 'pin':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.categoryBits = cat_pin
					fix_def.filter.maskBits = mask_pin
					break
				case 'pinball':
					fix_def.friction = .2
					fix_def.density = .1
					fix_def.restitution = .4
					fix_def.shape = new b2.CircleShape(.5)
					fix_def.filter.categoryBits = cat_pinball
					fix_def.userData = ['player_foot', 0]
					body_def.bullet = true
					//fix_def.filter.maskBits = mask_pinball
					break
				default:
			}
			
		},
		init: function(view, width, height){
			switch(view.update){
				case 'goal':
					view.ontick = function(){
						this.t = stage.checkpoint[this.point]
					}
					break
				case 'teleport':
					view.body.teleport = true
					view.grabbed = false
					view.left = false
					view.ontick = function(){
						if(this.body.grab && !this.body.dropped){
							console.log('zap')
							if(this.left){
								var p = vec(17.75, 32)
								this.left = false
							}else{
								var p = vec(19, 10)
								this.left = true
							}
							this.body.SetPosition(p)
							ball.body.SetPosition(p)
							ball.body.SetLinearVelocity(vec(0,0))
							this.body.grab = false
						}
						
						
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.teleport){
							b.grab = true
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b, contact)
						helper(fix_b, fix_a, contact)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'astropanda':
					view.body.SetAwake(false)
					view.ontick = function(){
						if(stage.checkpoint.astropanda){
							this.kill()
							return
						}
						if(this.body.IsAwake()){
							var fix = this.body.GetFixtureList()
							fix.SetSensor(true)
							if(this.body.GetPosition().y > 40){
								stage.checkpoint.astropanda = true
							}
						}
					}
					break
				case 'fuzzy':
					view.body.SetAwake(false)
					view.knocked = false
					if(stage.fuzzies){
						stage.fuzzies.push(view)
					}else{
						stage.fuzzies = [view]
					}
					view.ontick = function(){
						if(stage.checkpoint.fuzzies){
							this.kill()
						}else if(this.body.IsAwake()){
							var fix = this.body.GetFixtureList()
							fix.SetSensor(true)
							this.knocked = true
							for(var i = 0; i < stage.fuzzies.length; i++){
								if(!(stage.fuzzies[i].knocked && stage.fuzzies[i].body.GetPosition().y > 40)){
									return
								}
							}
							stage.checkpoint.fuzzies = true
						}
					}
					break
				case 'kiss':
					view.body.kiss = true
					view.body.count = 0
					
					if(stage.kisses){
						stage.kisses.push(view)
					}else{
						stage.kisses = [view]
					}
					view.ontick = function(){
						if(stage.checkpoint.kisses){
							this.kill()
						}else{
							this.t = this.body.count
							if(this.t > 2){
								this.knocked = true
								this.is_visible = function(){return false}
								this.body.SetActive(false)
							}
							/*
							var fix = this.body.GetFixtureList()
							fix.SetSensor(true)
							//*/
							for(var i = 0; i < stage.kisses.length; i++){
								if(!stage.kisses[i].knocked){
									return
								}
							}
							stage.checkpoint.kisses = true
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.kiss){
							b.count += 1
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b, contact)
						helper(fix_b, fix_a, contact)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'octo':
					view.body.octo = true
					view.body.grab = 0
					view.grabbed = false
					view.ontick = function(){
						if(this.body.grab > 0){
							this.body.grab -= 1
							ball.body.SetPosition(this.body.GetPosition())
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(vec(0, -20))
							this.grabbed = true
						}else{
							if(this.grabbed){
								if(this.tossed){
									if(this.body.GetPosition().y < 0){
										this.kill()
									}
								}else{
									ball.body.SetLinearVelocity(vec(14,-15))
									this.tossed = true
								}
								
							}
						}
						
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.octo){
							b.grab = 30
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b, contact)
						helper(fix_b, fix_a, contact)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'accelerate':
					view.is_visible = function(){return false}
					
					view.body.vel = vec(parseFloat(view.vx), parseFloat(view.vy))
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.vel){
							a.SetLinearVelocity(b.vel)
							//console.log(b.vel)
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b, contact)
						helper(fix_b, fix_a, contact)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'carrot':
					view.body.SetAwake(false)
					view.knocked = false
					if(stage.carrots){
						stage.carrots.push(view)
					}else{
						stage.carrots = [view]
					}
					view.ontick = function(){
						if(stage.checkpoint.carrots){
							this.kill()
						}else if(this.body.IsAwake()){
							var fix = this.body.GetFixtureList()
							fix.SetSensor(true)
							this.knocked = true
							for(var i = 0; i < stage.carrots.length; i++){
								if(!(stage.carrots[i].knocked && stage.carrots[i].body.GetPosition().y > 40)){
									return
								}
							}
							stage.checkpoint.carrots = true
						}
					}
					
					break	
				case 'pineapple':
					view.body.SetAwake(false)
					view.ontick = function(){
						if(stage.checkpoint.pineapple){
							this.kill()
							return
						}
						//DEBUG = 1
						//console.log(this.body.GetPosition().x)
						if(this.body.IsAwake()){
							var fix = this.body.GetFixtureList()
							fix.SetSensor(true)
							if(this.body.GetPosition().y > 40){
								stage.checkpoint.pineapple = true
							}
						}
					}
					break	
				case 'worm':
					worm = view
					view.body.worm = true
					view.v = view.v0 = 45
					view.vmax = 75
					view.pulled = false
					view.s0 = view.body.GetPosition().Copy()
					view.ontick = function(){
						var key = keydown.S || keydown.down
						if(this.body.dead){
							//this.ontick = function(){}
							this.body.SetLinearVelocity(vec(0,0))
						}else if(this.pulled){
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(vec(0, -this.v))
						}else{
							if(key){
								this.v = constrain(this.v + 1, this.v0, this.vmax)
								this.body.SetPosition(vec(this.s0.x, this.s0.y + (this.v - this.v0)/SCALE))
								this.pulling = true
							}else if(this.pulling){
								this.pulled = true
							}
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.worm){
							if(b.dead){
							
							}else{
								b.dead = true
								contact.SetEnabled(false)
								var v = b.GetLinearVelocity().Copy()
								a.SetLinearVelocity(v)
							}
						}
					}
					
					listen.PreSolve = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b, contact)
						helper(fix_b, fix_a, contact)

					}
					
					world.AddContactListener(listen)
					break
					
					break
				case 'wall':
					view.body.wall = true
					view.body.SetAngle(Math.PI/3)
					view.is_visible = function(){return sensor.out.touched}
					
					view.ontick = function(){
						if(this.is_visible()){
							this.body.SetType(b2.Body.b2_staticBody)
							this.ontick = function(){}
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.wall){
							contact.SetEnabled(sensor.out.touched)
						}
					}
					
					listen.PreSolve = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b, contact)
						helper(fix_b, fix_a, contact)

					}
					
					world.AddContactListener(listen)
					break
				case 'pin':
					view.is_visible = function(){return false}
					break
				case 'paddle':
					
					var body = view.body
					var pos = body.GetPosition()
					var x = pos.x
					var y = pos.y
					var dir = view.name === 'right' ? 1 : -1 
					var dx = dir*width/3
					
					if(view.angle){
						view.body.SetAngle(parseFloat(view.angle)*Math.PI/180)
					}
				
					var fix_def = new b2.FixtureDef()
					fix_def.shape = new b2.CircleShape(1/SCALE)
				
					var body_def = new b2.BodyDef()
					body_def.type = b2.Body.b2_kinematicBody
					body_def.position.x = x + dx
					body_def.position.y = y 
					
					var hanger = world.CreateBody(body_def)
					hanger.CreateFixture(fix_def)
					
					var joint_def = new b2.RevoluteJointDef()
					joint_def.bodyA = view.body
					joint_def.bodyB = hanger
					joint_def.collideConnected = false
					
					joint_def.localAnchorA.Set(dx, 0)
					joint_def.localAnchorB.Set(0,0)
					joint_def.enableMotor = true
					joint_def.maxMotorTorque = 0
					joint_def.motorSpeed = -dir*20
					
					view.joint = world.CreateJoint(joint_def)
					
					view.ontick = function(){
						var key
						if(view.name === 'right'){
							key = keydown.D || keydown.right
						}else{
							key = keydown.A || keydown.left
						}
						if(key){
	
							this.joint.m_maxMotorTorque = 10000
							//console.log(this.joint)
						}else{
							this.joint.m_maxMotorTorque = 0
						}
					}
					break
				case 'pinball':
					ball = view
					view.body.player = true
					//view.body.SetLinearVelocity(vec(0, -30*Math.random() - 45))
					view.body.SetAwake(false)
					view.ontick = function(){
						
						var x = this.x
						var y = this.y
		
						if(y > scrollzone.y2){ //up
							stage.view.y -= y - scrollzone.y2
						}
						if(y < scrollzone.y1){ //down
							stage.view.y -= y - scrollzone.y1
						}
						stage.view.x = constrain(stage.view.x, stage.view.xmin, stage.view.xmax)
						stage.view.y = constrain(stage.view.y, stage.view.ymin, stage.view.ymax)
					}
					break
				default:
			}	
		}
	}


	var lvl_script = function(){
		var type = arguments[0]
		if(scripts[type]){
			var args = []
			for(var i = 1; i < arguments.length; i++){
				args.push(arguments[i])
			}
			return scripts[type].apply(this, args)
		}else{
			console.log('I don\'t understand: ' + type)
		}
	
	}

	window.lvl_script = lvl_script


})(window)