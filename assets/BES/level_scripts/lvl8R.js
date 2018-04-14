console.log('Level 8R loaded');

(function(window) {

	function globalize(view){
		stage[view.piece] = view
	}
	
	var scripts = {
		ontick: function(){
			
			switch(stage.checkpoint){
				case 'winter':
					view.snap(0, 0, 792*4, 612)
					break
				case 'clock':
					view.snap(0, -612, 792*5, 612)
					break
				case 'lava':
					view.snap(0, -612*2, 792*3, 612)
					break
				case 'ghost':
					view.snap(0, -612*3, 792*8, 612)
					break
				case 'water':
					view.snap(0, -612*4, 792*3, 612)
					break
				default:
					
				
			}
			
			var points = ['winter', 'clock', 'lava', 'ghost', 'water']
			for(var i = 0; i < points.length; i++){
				if(sensor[points[i]]){
					if(sensor[points[i]].touching){
						init(points[i])
					}
				}else{
					console.log(points[i])
				}
			}
			
			stage.timer += 1
			if(stage.checkpoint === 'lava'){
				if(stage.timer % 30 === 0 && player.body.GetPosition().x < 28){
					var proj = projectiles.lava.fire(24*Math.random(), 45, 0, 0)
					proj.body.lava = true
					proj.ontick = function(){
						if(this.body.dead){
							this.kill()
						}
					}
				}
			}
			
			if(!stage.won && sensor.win.touched){
				stage.win()
			}
			
		},
		lvl_init: function(checkpoint){
			stage.checkpoint = checkpoint || 'winter'
			stage.timer = 0
			switch(stage.checkpoint){
				case 'winter':
				
					break
				case 'clock':
					player.body.SetPosition(vec(3, 35))
					//player.body.SetPosition(vec(30, 40))
					break
				case 'lava':
					player.body.SetPosition(vec(3, 55))
					break
				case 'ghost':
					player.body.SetPosition(vec(3, 75))
					break
				case 'water':
					player.body.SetPosition(vec(5, 90))
					break
				default:
					break
			}
			
			var begin_helper = function(fix_a, fix_b){
				var a = fix_a.GetBody()
				var b = fix_b.GetBody()
				if(a.lava && a.GetPosition().y > 52){
					a.dead = true
					if(b.player){
						b.dead = true
					}
				}
				if(a.fire && b.player){
					b.dead = true
				}
			}
			
			var listen = new b2.ContactListener()
			listen.BeginContact = function(contact){
				var fix_a = contact.GetFixtureA()
				var fix_b = contact.GetFixtureB()
				begin_helper(fix_a, fix_b)
				begin_helper(fix_b, fix_a)

			}
			
			world.AddContactListener(listen)
			
			
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_boat = 2,
				cat_fish = 4
				
			var mask_boat = cat_player,
				mask_fish = cat_player
				
				
			switch(that.view.update){
				case 'fish':
				case 'spike':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'narwhal':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'skel':
					//body_def.type = b2.Body.b2_kinematicBody
					break
				case 'reaper':
					break
				case 'fire':
					fix_def.isSensor = true
					break
				case 'top_hat':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'clock':
					if(that.view.piece == 'body' || that.view.piece == 'block'){
						//view.body.SetFixedRotation(true)
						body_def.type = b2.Body.b2_staticBody
					}
					break
				case 'elf':
					//body_def.type = b2.Body.b2_kinematicBody
					break
				case 'snowman':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				default:
				
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'crab':
					view.body.SetAwake(false)
					view.body.SetLinearVelocity(vec(0,-30))
					
					view.ontick = function(){
						if(stage.checkpoint === 'water'){
							
							var x1 = this.body.GetPosition().x
							var x2 = player.body.GetPosition().x
							
							if(Math.abs(x1 - x2) < 2){
								this.body.SetAwake(true)
							}							
						}
					}
					break
				case 'fish':
				
					view.timer = 0
					view.ontick = function(){
						this.timer += 1
						if(stage.checkpoint === 'water'){
							var vy = -1*Math.sin(this.timer/25)
							var vx = 2*Math.sin(this.timer/100)
							this.body.SetLinearVelocity(vec(vx,vy))
							this.flip = vx < 0
						}
						
					}
					break
				case 'spike':
					view.body.fire = true
					break
				case 'narwhal':
					view.timer = 0
					view.ontick = function(){
						this.timer += 1
						if(this.do_once){
							if(stage.checkpoint === 'water'){
								var vy = -1*Math.sin(this.timer/100)
								this.body.SetLinearVelocity(vec(3,vy))
							}
						
						}else{
							for(var i = 0; i < 2; i++){
								var fix_def = new b2.FixtureDef()
								fix_def.density = 1
								fix_def.friction = 0
								fix_def.restitution = 0
								fix_def.shape = new b2.PolygonShape()
								fix_def.shape.SetAsOrientedBox(4 / SCALE, 
															   100 / SCALE, 
															   vec((1-2*i)*width/2, -100 / SCALE), 
															   0)
								
								this.body.CreateFixture(fix_def)	
							}
							this.do_once = true
						}
					
					}
					break
				case 'tripskel':
					view.impulse = vec(0, -80)
				
				case 'skel':
					view.impulse = view.impulse || vec(-20, -5)
					
				case 'reaper':
					view.impulse = view.impulse || vec(-30, -80)
					
					view.body.fire = true
					view.body.SetFixedRotation(true)
					view.body.IsSleepingAllowed(false)
					view.ontick = function(){
						var vel = this.body.GetLinearVelocity()
						var pos = this.body.GetPosition()
						if(stage.checkpoint === 'ghost'){
							if(vel.Length() < .02){
								this.body.ApplyImpulse(this.impulse, pos)
							}
							if(pos.x < 2){
								var fix = this.body.GetFixtureList()
								fix.SetSensor(true)
							}
						}
						if(stage.checkpoint === 'water'){
							this.kill()
						}
					}
					break
				case 'fire':
					console.log(view.body.GetPosition().y)
					view.timer = Math.floor(Math.random()*60)
					view.body.SetAwake(false)
					view.body.fire = true
					view.ontick = function(){
						this.timer += 1
						if(this.timer > 60){
							this.body.SetAwake(true)
						}
						var pos = this.body.GetPosition()
						if(pos.y > 62){
							this.body.SetLinearVelocity(vec(0, -40), pos)
						}
						this.t = this.body.GetLinearVelocity().y > 0
					}
					break
				case 'top_hat':
					view.x0 = view.body.GetPosition().x
					console.log(view.x0)
					view.ontick = function(){
						if(stage.checkpoint === 'clock'){							
							var pos = this.body.GetPosition()
							var ppos = player.body.GetPosition()
							//console.log(this.x0)
							if(ppos.x < pos.x && ppos.x > pos.x - 6 && pos.x >= this.x0){
								this.charge = true
							}
							if(pos.x < 60){
								this.charge = false
							}
							if(this.charge){
								console.log(pos.x)
								this.body.SetAwake(true)
								this.body.SetLinearVelocity(vec(-15, 0))
							}else if(pos.x < this.x0){
								this.body.SetLinearVelocity(vec(2, 0))
							}else{
								this.body.SetLinearVelocity(vec(0, 0))
							}
							
						}
					}
					break
				case 'clock':
					if(view.piece === 'upper_r'){
						//view.body.SetFixedRotation(true)
					}
					globalize(view)
			
					view.ontick = function(){
				
						if(this.do_once){
							if(this.piece === 'lower_l'){
								//this.body.SetFixedRotation(true)
								var pos = this.body.GetPosition()
								if(pos.y > 39.5){

									this.raise = true
									//console.log(pos.y)
									//this.body.ApplyImpulse(vec(1, 3), pos)
								}else if(pos.y < 38.5){
									this.raise = false
								}
								if(this.raise){
									this.body.ApplyImpulse(vec(-3, -20), pos)
					
								}
							}
						
						}else{
							var joints = {'body': [['upper_l', -1.8, -2, 2.5, 0], ['upper_r', 1.6, -1.4, -2, 0]],
										  'upper_l': [['lower_l', -2.5, 0, 3, 0]],
										  'upper_r': [['lower_r', 1.5, 0, -1.5, 0]],
										  'lower_l': [],
										  'lower_r': [['block', 1.5, 0, 0, -2]],
										  'block': []}
						
							for(var i = 0; i < joints[this.piece].length; i++){
								var info = joints[this.piece][i]
								var other = stage[info[0]]
								var a_off_x = info[1]
								var a_off_y = info[2]
								var b_off_x = info[3]
								var b_off_y = info[4]
								
								if(other.piece == 'block'){
									var joint_def = new b2.DistanceJointDef()
									/*
									joint_def.Initialize(view.body, hanger, 
														  new b2.Vec2(x + dx, y), 
														  new b2.Vec2(x, y - dy))
									//*/
									joint_def.frequencyHz = 2
									joint_def.dampingRatio = .1
								}else{		
									var joint_def = new b2.RevoluteJointDef()
								}
								joint_def.bodyA = this.body
								joint_def.bodyB = other.body
								joint_def.collideConnected = false
								
								joint_def.localAnchorA.Set(a_off_x, a_off_y)
								joint_def.localAnchorB.Set(b_off_x, b_off_y)
								joint_def.enableMotor = false
								joint_def.maxMotorTorque = 40
								joint_def.motorSpeed = 0
								
								if(other.piece == 'lower_l'){
								  joint_def.enableLimit = true;
								  joint_def.lowerAngle = -90 * Math.PI/180;
								  joint_def.upperAngle =  45 * Math.PI/180;
								}
								
								world.CreateJoint(joint_def)
							}
							this.do_once = true
						}
					}
					break
				
				case 'deer':
					view.body.SetFixedRotation(true)
					view.play = false
					view.ontick = function(){
						var pos = this.body.GetPosition()
						var ppos = player.body.GetPosition()
						
						if(ppos.x > pos.x -  5){
							if(this.body.IsAwake()){
							
							}else{
								this.body.ApplyImpulse(vec(-30, -30), pos)
								this.body.SetAwake(true)
								if(pos.y < -2){
									this.kill()
								}
							}
						}else{
							this.body.SetAwake(false)
						}
						this.t = this.body.GetLinearVelocity().Length() > .5
					}
					break
				case 'elf':
					view.body.SetFixedRotation(true)
					view.play = false
					view.ontick = function(){
						var pos = this.body.GetPosition()
						//console.log(pos)
						var ppos = player.body.GetPosition()
						
						if(ppos.x > pos.x -  5){
							this.t = 1
							this.body.SetLinearVelocity(vec(0, -4))
							this.body.SetAwake(true)
							if(pos.y < -2){
								this.kill()
							}
						}else{
							this.t = 0
							if(pos.y < 17.2){
								this.body.SetAwake(true)
								this.body.m_type = b2.Body.b2_dynamicBody
							}else{
								this.body.SetAwake(false)
							}
						}
					}
					break
				case 'snowman':
					view.timer = 0
					view.ontick = function(){
						if(stage.checkpoint === 'winter'){
							this.timer += 1
							if(this.timer % (2*FPS) === 0){
								var loc = this.body.GetPosition()
								projectiles.snowball.fire(loc.x, loc.y, 20, 135)
							}
						}
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