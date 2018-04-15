console.log('Level 6B script loaded');

(function(window) {
	

	var scripts = {
		ontick: function(){
			if(player.body.GetPosition().y < 0 && !stage.won){
				stage.win()
				
				stage.won = true
			}
			
		},
		lvl_init: function(arg){
			if(arg === 'checkpoint'){
				player.body.SetPosition(vec(115,30))

			}
			
		},
		update: function(that, body_def, fix_def){
			switch(that.view.update){
				case 'waffle':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.filter.maskBits = 0
					break
				case 'ladder':
					fix_def.filter.maskBits = 1
					break
				case 'copter':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'car':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.friction = .01
					break
				case 'cameraman':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				case 'crowd':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				case 'checkpoint':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				default:
			
			}
		},
		init: function(view, width, height){
			switch(view.update){
				case 'waffle':
					waffle = view
					view.timer = 0
					view.ontick = function(){
						this.timer += 1
						var vx = 0 //10*Math.sin(this.timer/20)
						var vy = 0
						if(player.body.GetPosition().y < 16){
							vy = 1
							this.body.SetAwake(true)
						}
						
						this.body.SetLinearVelocity(vec(vx, vy))
						if(!player.body.IsFixedRotation()){
							
							if(this.timer % 180 === 0 && !stage.won){
								var pos = this.body.GetPosition()
								var p_pos = player.body.GetPosition()
								var theta = Math.atan2(pos.y - p_pos.y, pos.x - p_pos.x)
								var lightning = projectiles.lightning.fire(pos.x, pos.y, 8,
														180-theta*180/Math.PI)
								
								lightning.body.SetType(1)
								lightning.body.lightning = true
								
								var fix = lightning.body.GetFixtureList()
								fix.m_filter.maskBits = 1
								fix.m_filter.categoryBits = 2
							}
						}
						
						/*
						
						//*/
					}
					
					var listen = new b2.ContactListener()
		
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.lightning){
							if(!stage.won){
								a.dead = true
							}

						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						begin_helper(fix_a, fix_b)
						begin_helper(fix_b, fix_a)

					}
					world.AddContactListener(listen)
					break
				case 'ladder':
					view.body.ladder = true
					view.ontick = function(){
						if(this.body.onboard && !this.player){
							this.player = player
							
							player.body.SetFixedRotation(false)
							stage.view.free()
	
							var joint_def = new b2.WeldJointDef()
							joint_def.bodyA = this.body
							joint_def.bodyB = this.player.body
							joint_def.collideConnected = false
							
							joint_def.localAnchorA.Set(0,5)
							joint_def.localAnchorB.Set(0,0)
							
							this.weld = world.CreateJoint(joint_def)
						}
						if(this.player){
							if(this.player.body.dead){
								world.DestroyJoint(this.weld)
							}
						}else{
							stage.view.snap(0,-512,645*7,512)
						}
					}
					var listen = new b2.ContactListener()
		
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.ladder){
							b.onboard = true
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						begin_helper(fix_a, fix_b)
						begin_helper(fix_b, fix_a)

					}
					
					world.AddContactListener(listen)
					break
				case 'copter':
					view.active = false
					view.timer = 0
					view.ontick = function(){
						this.timer += 1
						var pos = this.body.GetPosition()
						if(!this.ladder){
							for(var i = 0; i < stage.children.length; i++){
								if(stage.children[i].update === 'ladder'){
									this.ladder = stage.children[i]
									break									
								}
							}
							var joint_def = new b2.RevoluteJointDef()
							joint_def.bodyA = this.body
							joint_def.bodyB = this.ladder.body
							joint_def.collideConnected = false
							
							joint_def.localAnchorA.Set(0,0)
							joint_def.localAnchorB.Set(0,-5)
							joint_def.enableMotor = true
							joint_def.maxMotorTorque = 40
							joint_def.motorSpeed = 0
							
							world.CreateJoint(joint_def)
						}else if(this.ladder.player){
							
							var vx = 0//-.5
							var vy = -1
				
							
							this.body.SetLinearVelocity(vec(vx,vy))
						}else{
							this.body.SetLinearVelocity(vec(0,
								.2*Math.sin(this.timer/50)))
						}
					}
					break
				case 'car':
					view.ontick = function(){
						if(sensor.checkpoint.touched){
							this.body.SetLinearVelocity(vec(-10,0))
							this.body.SetAwake(true)
						}
					}
					break
				case 'runner':
					view.body.SetFixedRotation(true)
					view.ontick = function(){
						var p_pos = player.body.GetPosition()
						var b_pos = this.body.GetPosition()
						if(Math.abs(p_pos.x - b_pos.x) < 20){
							var v = this.body.GetLinearVelocity()
							if(v.Length() < .1){
								console.log('jump')
								var m = this.body.m_mass
								var f = new b2.Vec2(-8*m, -15*m)
								var s = this.body.GetPosition()
								this.body.ApplyImpulse(f, s)
							}
						}
					}
					break
				case 'cameraman':
					view.t = Math.floor(Math.random()*4)
					view.count = Math.floor(Math.random()*FPS)
					break
				case 'crowd':
					view.timer = Math.floor(Math.random()*100)
					view.pos = view.body.GetWorldCenter().Copy()
					view.ontick = function(){
						this.timer += 1
						if(player.body.GetWorldCenter().x < this.pos.x){
							if(this.timer % 100 === 0){
								
								var trash = projectiles.trash.fire(this.pos.x, this.pos.y, 30, 90 + 45*Math.random())
								trash.t = Math.floor(Math.random()*3)
							}
							var wiggle = .03
							this.body.SetPosition(vec(this.pos.x + wiggle*(Math.random()*2-1),
													  this.pos.y + wiggle*(Math.random()*2-1)))
						}
					}
					break
				case 'checkpoint':
					view.ontick = function(){
						if(sensor.checkpoint.touched){
							this.t = 1
							stage.checkpoint = 'checkpoint'
						}else{
							this.t = 0
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