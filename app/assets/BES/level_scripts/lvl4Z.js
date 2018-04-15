
(function(window) {

	function globalize(view){
		stage[view.piece] = view
	}
	
	var scripts = {
		ontick: function(){
			if(stage.checkpoint === 'moon'){
				view.snap(-4992, 0, 928, 1360)
				
				
			}else{
				if(sensor.lava.touched || sensor.drown.touched){
					init(stage.checkpoint)
				}else if(sensor.luigi.touching){
					stage.checkpoint = 'luigi'
				}else if(sensor.yoshi.touching){
					stage.checkpoint = 'yoshi'
				}
				
				
				if(sensor.pipe_down.touched && !sensor.pipe_up.touched){
					view.pan(-2771, -700, 5) 
				}else{
					view.snap(0, 0, 4990, 792)
				}
				
				if(sensor.pipe_up.touching){
					player.body.SetPosition(vec(109, 24))
					player.body.SetLinearVelocity(vec(0, -45))
				}
				if(sensor.to_moon.touching){
					player.body.SetLinearVelocity(vec(0, -60))
				}
				if(player.body.GetPosition().y < 0){
					init('moon')
				}
			}
			
		},
		lvl_init: function(checkpoint){
			stage.checkpoint = checkpoint || stage.checkpoint // || 'moon'
			if(stage.checkpoint === 'moon'){
				var g = world.GetGravity()
				g.Multiply(0)
				player.body.SetPosition(vec(186, 44))
				player.body.SetLinearVelocity(vec(0, -50))
			}else if(stage.checkpoint === 'luigi'){
				player.body.SetPosition(vec(64.5, 19))
			}else if(stage.checkpoint === 'yoshi'){
				//sensor.pipe_down.touched = true
				player.body.SetPosition(vec(112, 36))
			}
			
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_boat = 2,
				cat_fish = 4
				
			var mask_boat = cat_player,
				mask_fish = cat_player
				
				
			switch(that.view.update){
				case 'luigi':
				case 'yoshi':
				case 'pipe_man':
					body_def.type = b2.Body.b2_staticBody
					fix_def.isSensor = true
					break
				case 'moon_crab':
				case 'lakitu':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'crab':
					fix_def.isSensor = true
					break
				case 'moon':
					body_def.type = b2.Body.b2_staticBody
					break
				case 'pipe_wall':
					body_def.type = b2.Body.b2_staticBody
					break
				default:
				
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'moon_crab':
					view.theta = 0
					view.r1 = view.r = 230/SCALE
					view.dr = .08
					view.dt = .02
					view.r0 = 110/SCALE
					view.mode = 'wait'
					
					var fix_def = new b2.FixtureDef()
					fix_def.shape = new b2.PolygonShape()
					fix_def.shape.SetAsBox(.45*width, .65*height)
					//fix_def.shape.SetAsOrientedBox(.125*width, .25*height, vec((i ? -1 : 1)*width/2, .2*height), 0)
					view.fix = view.body.CreateFixture(fix_def)
					view.fix.crab_head = true
					view.body.moon_crab = true
					
					moon_crab = view
					
					view.ontick = function(){
						this.body.SetAngle(view.theta + Math.PI/2)
						var m = moon.body.GetPosition()
						this.body.SetPosition(vec(m.x + this.r*Math.cos(this.theta), 
												  m.y + this.r*Math.sin(this.theta)))
												  
						if(this.body.dead){
							this.mode = 'dead'
						}
							
						switch(this.mode){
					
							case 'wait':
								if(stage.checkpoint === 'moon'){
									this.mode = 'hide'
								}else{
									//console.log(stage.checkpoint)
								}
								break
							case 'hide':
								if(this.r > this.r0){
									this.r -= this.dr
								}else{
									this.theta = moon.body.GetAngle()//Math.random()*2*Math.PI
									this.mode = 'show'
								}
								break
							case 'show':
								if(this.r < this.r1){
									this.r += this.dr
								}else{
									this.mode = 'charge'
									this.run = 90
								}
								break
							case 'charge':
								this.run -= 1
								if(this.run > 0){
									this.theta += this.dt
								}else{
									this.mode = 'hide'
								}
								break
							case 'dead':
								if(this.r > this.r0){
									this.r -= this.dr
								}else{
									stage.win()
									stage.view.pan(-5203, 0)
								}
								break
							default:
						}
						
					}
					
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.moon_crab && b.player){
							if(fix_a.crab_head){
								a.dead = true
							}else{
								b.dead = true
							}
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
					
					break
				case 'pipe_man':
					view.timer = 0
					view.ontick = function(){
						this.timer += 1
						if(this.timer % 45 === 0){
							var pos = this.body.GetPosition()
							var spider = projectiles.spider.fire(pos.x, pos.y, 30, 5)
							spider.body.crab = true
						}
					}
					break
				case 'lakitu':
					view.dx = 9
					view.dy = 3
					view.timer = 0
					view.v = .01
					view.ontick = function(){
						view.timer += 1
						this.body.SetLinearVelocity(vec(this.dx * Math.cos(this.v * this.timer),
														this.dy * Math.cos(2*this.v * this.timer)))
					
					}
					break
				case 'crab':
					view.do_once = true
					view.body.SetAwake(false)
					view.body.crab = true
					view.ontick = function(){
						if(this.do_once && player.body.GetPosition().x > this.body.GetPosition().x){
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(vec(5, -15))
							this.do_once = false
						}
					}
					
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.crab && b.player){
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
					
					break
				case 'moon':
					var fix_def = new b2.FixtureDef()
					fix_def.shape = new b2.CircleShape(220/SCALE)
					//fix_def.shape.SetAsBox(width*1.1, height*.9)
					var fix = view.body.CreateFixture(fix_def)
					view.do_once = true
					view.theta = 0 //3*Math.PI/2
					view.omega = 0
					view.omega_max = .02
					moon = view
		
					view.ontick = function(){
						if(stage.checkpoint === 'moon'){
							if(this.do_once){
								var joint_def = new b2.PrismaticJointDef()
		
								joint_def.bodyA = this.body
								joint_def.bodyB = player.body
								joint_def.referenceAngle = Math.PI
								joint_def.localAxisA = vec(0, 1)
								joint_def.localAnchorA = vec(0,0)
								joint_def.localAnchorB = vec(0,0)
								joint_def.collideConnected = true
								
								this.joint = world.CreateJoint(joint_def)
								
								this.do_once = false
								player.body.SetFixedRotation(false)
							}else{
							
								if(player.body.dead){
									world.DestroyJoint(this.joint)
								}else{
									
									var m = 400
									var g = this.body.GetPosition().Copy()
									g.Subtract(player.body.GetPosition())
									g.Multiply(m/g.LengthSquared())
									
									world.ClearForces()
									player.body.ApplyForce(g, player.body.GetPosition())
									
									/*
									var theta = Math.atan2(g.y, g.x)
									player.body.SetAngle(theta - Math.PI/2)
									*/
									
									var right = keydown.right || keydown.D
									var left = keydown.left || keydown.A
									if(right){
										this.omega += .001
									}else if(left){
										this.omega -= .001
									}else{
										var v = player.body.GetLinearVelocity()
										v.x /= .9
										player.body.SetLinearVelocity(v)
									}
									this.omega *= .95
									this.omega = constrain(this.omega, -this.omega_max, this.omega_max)
									this.theta += this.omega
									
									this.body.SetAngle(this.theta)
								}
								
							}
						}
					}
					
					break
				case 'pipe_wall':
					view.is_visible = function(){return false}
					view.body.SetActive(false)
					view.ontick = function(){
						if(sensor.pipe_up.touched && player.body.GetPosition().y < 15){
							this.body.SetActive(true)
							this.ontick = function(){}
						}
					}
					break
				case 'goomba':
					view.body.SetFixedRotation(true)
					view.body.vx = -2
					view.body.goomba = true
					
					for(var i = 0; i < 2; i++){
						var fix_def = new b2.FixtureDef()
						fix_def.shape = new b2.PolygonShape()
						//fix_def.shape.SetAsBox(width*1.1, height*.9)
						fix_def.shape.SetAsOrientedBox(.125*width, .25*height, vec((i ? -1 : 1)*width/2, .2*height), 0)
			
						var fix = view.body.CreateFixture(fix_def)
						fix.direction = i ? 'right' : 'left'
					}
					
					view.ontick = function(){
						//this.body.ApplyImpulse(vec(this.body.vx, 0), this.body.GetPosition())
						
						if(this.body.dead){
							var fix = this.body.GetFixtureList()
							while(fix){
								fix.SetSensor(true)
								fix = fix.GetNext()
							}
						}else{
							this.body.SetLinearVelocity(vec(this.body.vx, 0))
							this.flip = this.body.vx > 0
						}
					}
					
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.goomba && !a.dead){
							if(fix_a.direction === 'left'){
								a.vx = -Math.abs(a.vx)
								b.dead = b.player
							}else if(fix_a.direction === 'right'){
								a.vx = Math.abs(a.vx)
								b.dead = b.player
							}else{
								if(b.player){
									a.dead = true
									b.ApplyImpulse(vec(0, -40), b.GetPosition())
								}
							}
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