console.log('Level 5Ha Script loaded');

(function(window) {
	
	var hang = function(view, width, height){
		console.log('hanging')
		view.rangex = view.rangex || 0
		view.rangey = view.rangey || 0
		view.v = view.v || 1
		
		var body = view.body
		var pos = body.GetPosition()
		var x = pos.x
		var y = pos.y
		var dy = 12
		
		body.SetLinearVelocity(new b2.Vec2(0,0))
		body.SetFixedRotation(false)
	
		var fix_def = new b2.FixtureDef()
		fix_def.shape = new b2.CircleShape(1/SCALE)
		fix_def.filter.maskBits = 0
	
		var body_def = new b2.BodyDef()
		body_def.type = b2.Body.b2_kinematicBody
		body_def.position.x = x
		body_def.position.y = y - dy
		
		var hanger = world.CreateBody(body_def)
		hanger.CreateFixture(fix_def)
		
		

		
		for(var i = 0; i < 2; i++){
			var dx = width*(i*2 - 1)/4
			var joint_def = new b2.DistanceJointDef()
			
			joint_def.Initialize(view.body, hanger, 
								  new b2.Vec2(x + dx, y), 
								  new b2.Vec2(x, y - dy))
			
			joint_def.frequencyHz = 2
			joint_def.dampingRatio = .1
			
			var joint = world.CreateJoint(joint_def)
		}
		
		view.hanger = hanger
		var v = parseFloat(view.v)
		var t = Math.atan2(parseFloat(view.rangey),parseFloat(view.rangex))
		
		view.pos_v = new b2.Vec2(v*Math.cos(t), v*Math.sin(t))
		view.neg_v = new b2.Vec2(-v*Math.cos(t), -v*Math.sin(t))

		view.hanger.SetLinearVelocity(new b2.Vec2(2,.33))
	
		view.x0 = x
		view.y0 = y
		view.xf = x + parseFloat(view.rangex)
		view.yf = y + parseFloat(view.rangey)
	
	}
	
	
	var scripts = {
		lvl_init: function(arg){
			stage.checkpoint = arg || stage.checkpoint
			console.log(stage.checkpoint)
			if(stage.checkpoint === 'zeus dead'){
				stage.boat.body.SetAwake(true)
				stage.checkpoint = 'zeus dead'
			}
			if(stage.checkpoint === 'pose dead'){
				player.body.SetPosition(new b2.Vec2(57.5, 53))
				stage.boat.body.sailing = true
				stage.boat.kill()
				stage.checkpoint = 'pose dead'
			}
		},
		ontick: function(){
			if(sensor.drown.touched){
				init(stage.checkpoint)
			}
			
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_boat = 2,
				cat_fish = 4
				
			var mask_boat = cat_player,
				mask_fish = cat_player
				
			switch(that.view.update){
				case 'dragon':
					fix_def.filter.maskBits = 0
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'kronos':
					//body_def.type = b2.Body.b2_kinematicBody
					fix_def.filter.categoryBits = cat_boat
					fix_def.filter.maskBits = mask_boat
					break
				case 'wall':
					body_def.type = b2.Body.b2_staticBody
					fix_def.userData = {sensor:true}
					break
				case 'hades':
					body_def.type = b2.Body.b2_kineticBody
					break	
				case 'medusa':
					
					break
				case 'poseidon':
					body_def.type = b2.Body.b2_kineticBody
					fix_def.filter.maskBits = 0
					break
				case 'fish':
					fix_def.filter.categoryBits = cat_fish
					fix_def.filter.maskBits = mask_fish
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'poof':
					body_def.type = b2.Body.b2_staticBody
					break
				case 'boat':
					fix_def.filter.categoryBits = cat_boat
					fix_def.filter.maskBits = mask_boat
					break
				case 'zeus':
					body_def.type = b2.Body.b2_kineticBody
					break
				case 'angry cloud':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.categoryBits = cat_fish
					fix_def.filter.maskBits = mask_fish
					break
				case 'happy cloud':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.categoryBits = cat_fish
					fix_def.filter.maskBits = mask_fish
					break
				case 'bird':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.filter.maskBits = 0
					break
				default:
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'dragon':
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.y0 = pos.y
					view.rangex = view.rangex || 400
					view.rangey = view.rangey || 20
					view.Tx = 8 || view.Tx
					view.Ty = 1.5 || view.Ty
					view.omegax = 2*Math.PI/(view.Tx*FPS)
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.timer = 0
					view.body.mit = true
					view.ontick = function(){
						this.timer += 1
						var vx = - this.rangex * this.omegax * Math.sin(this.omegax * this.timer)
						var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
						this.flip = vx > 0
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
					}
					break
				case 'kronos':
					view.y0 = view.body.GetPosition().y
					view.charge = 0
					view.focus = 0
					view.defeated = false
					view.body.SetFixedRotation(true)
					view.body.kronos = true
					stage.kronos = view
					
					view.ontick = function(){
						var p_pos = player.body.GetPosition()
						var k_pos = this.body.GetPosition()
						if(p_pos.x < 36 && p_pos.y > 100){
							if(this.defeated){
								stage.win()
								//this.body.m_type = b2.Body.b2_dynamicBody
								this.body.SetFixedRotation(false)
								this.body.SetLinearVelocity(new b2.Vec2(0, 0))
								this.body.SetAngularVelocity(2)
								//this.body.SetPosition(new b2.Vec2(23, 117))
								this.ontick = function(){}
							}else{
					
								this.body.SetAwake(true)
								var vx = 0
								var vy = 0
								if(this.charging){
									this.charge +=1
									vx = 4*(Math.random()*2 - 1)
								}else if(k_pos.x > p_pos.x){
									vx = -10
								}else{
									vx = 10
								}
								if(Math.abs(k_pos.x - p_pos.x) < .1 && k_pos.y >= this.y0){
									if(this.focus > 10){
										this.charging = true
										this.focus = 0
									}else{
										this.focus += 1
									}
								}
								
								
								if(this.charge > 60){
									this.charging = false
									this.charge = 0
									this.jump = 7
								}
								if(this.jump > 0){
									vy = -75
									
									this.jump -= 1
								}else if(k_pos.y < this.y0){
									vy = 8
									vx = 0
								}
								
								this.body.ApplyImpulse(new b2.Vec2(vx,vy), k_pos)													
							
								if(k_pos.x > 22 && k_pos.x < 25 && k_pos.y < 110){
									this.defeated = true
								}
								
							}
							
						}else{
							this.body.SetLinearVelocity(new b2.Vec2(0,0))
						}
					}
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.kronos){
							//a.ApplyImpulse(new b2.Vec2(15, 0), a.GetPosition())
							b.ApplyImpulse(new b2.Vec2(0, -400), b.GetPosition())
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b)
						helper(fix_b, fix_a)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'wall':
					view.ontick = function(){
						var fix = this.body.GetFixtureList()
						this.body.GetUserData().sensor = (stage.hades.body.defeated > 0)
						fix.SetSensor(stage.hades.body.defeated > 0)
					}
					break
				case 'hades':
					view.timer = 0
					view.Ty = 2
					view.rangey = 16
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.body.hades = true
					view.body.defeated = 0
					stage.hades = view
					
					view.ontick = function(){
						if(this.body.defeated){
							this.body.defeated += 1
							this.body.SetAngularVelocity(2)
							stage.boat.body.SetAwake(true)
							stage.view.snap(0, -3100, 2368, 512)
							if(this.body.defeated > 30){
								this.kill()
							}
						}else{
							if(player.body.GetPosition().y > 115){
								stage.view.snap(-1736, -3100)
							}
							this.timer += 1
							var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
							this.body.SetLinearVelocity(new b2.Vec2(0, vy))
							if(player.body.GetPosition().y > 100){
							
								if(this.timer % (3*FPS) === 0){
									var z_pos = this.body.GetPosition()
									var p_pos = player.body.GetPosition()
									var theta = -180*Math.atan2(z_pos.y - p_pos.y, z_pos.x - p_pos.x)/Math.PI
									var x = z_pos.x + 2*(z_pos.x < p_pos.x ? 1 : -1)
									var y = z_pos.y
									var skull = projectiles.skull.fire(x, y, -15, theta)
									skull.flip = skull.body.GetLinearVelocity().x > 0
									skull.body.skull = true
								}else if(this.timer % (3*FPS) === 120){
									var x = Math.random()*20 + 58
									var y = Math.random()*Math.min(10, this.timer/50) + 105
									this.body.SetPosition(new b2.Vec2(x, y))
								}
							}
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.hades){
							b.defeated = 1
						}else if(a.player && b.skull){
							a.dead = true
						}else if(b.skull){
							b.SetAwake(false)
							b.SetPosition(new b2.Vec2(-10, -10))
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b)
						helper(fix_b, fix_a)

					}
					
					world.AddContactListener(listen)
					
					
					break
				case 'medusa':
					view.ontick = function(){
						if(this.body.GetPosition().y > 75){
							this.kill()
						}
					}
					break
				case 'poseidon':
					stage.poseidon = view
					view.timer = 0
					view.ontick = function(){
					
						var pos = this.body.GetPosition()
						if(stage.boat.hanger && stage.boat.hanger.GetPosition().x > 45){
							this.body.SetLinearVelocity(new b2.Vec2(0, -2))
							this.body.SetAwake(true)
							stage.view.pan(-900, -1300)
						}
						
						if(this.retreating){
							this.body.SetLinearVelocity(new b2.Vec2(0, 2))
							if(pos.y > 60){
								stage.checkpoint = 'pose dead'
								console.log(stage.checkpoint)
								stage.view.free()
								this.sunk = true
								this.kill()
							}
						}else if(pos.y  < 52){
							stage.view.pan(-900, -1300)
							this.attacking = true
							this.timer += 1
							if(this.timer % (2*FPS) === 1){
								var wave = projectiles.wave.fire(pos.x, pos.y + 2, 30, 35)
								wave.body.SetFixedRotation(true)
							}
							
							this.body.SetLinearVelocity(new b2.Vec2(0, 0))
						}
					}
					break
				case 'fish':
					view.timer = 0
					view.Ty = 2
					view.rangey = 16
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.body.SetFixedRotation(true)
					
					view.ontick = function(){
						if(stage.boat.hanger && stage.boat.hanger.GetPosition().x > 45){
							this.body.SetLinearVelocity(new b2.Vec2(0, 3))
							if(this.body.GetPosition().y > 70){
								this.kill()
							}
						}else{
							this.timer += 1
							var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
							this.body.SetLinearVelocity(new b2.Vec2(0, vy))
						}
					}
					break
				case 'poof':
					view.ontick = function(){
						if(stage.boat.body.sailing){
							this.kill()
						}
					}
					break
				case 'boat':
					view.body.SetLinearVelocity(new b2.Vec2(0,0))
					view.body.SetAwake(false)
					view.body.boat = true
					view.body.sailing = false
					view.body.SetFixedRotation(true)
					
					stage.boat = view
					
		
					view.ontick = function(){
						if(this.body.GetPosition().y > 75){
							this.kill()
						}
						if(this.body.GetPosition().y > 53.5	&& !this.hanger){
							hang(this, width, height)
						}
						if(!this.hanger){
							return
						}
						if(this.hanger.GetPosition().x > 64){
							world.DestroyBody(this.hanger)
						}else if(stage.poseidon.sunk){
							this.hanger.SetLinearVelocity(new b2.Vec2(3,1))
						}else if(this.hanger.GetPosition().x > 45){
							this.hanger.SetLinearVelocity(new b2.Vec2(0,0))
						}
						else
						if(this.hanger.GetPosition().x > 32){
							this.hanger.SetLinearVelocity(new b2.Vec2(1,-.48))
						}
						else if(this.hanger.GetPosition().x > 20){
							this.hanger.SetLinearVelocity(new b2.Vec2(3,0/*-.3*/))
						}else{

						}						
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.boat){
							b.sailing = true
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b)
						helper(fix_b, fix_a)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'zeus':
					view.timer = 0
					view.Ty = 2
					view.rangey = 16
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.body.zeus = true
					view.body.defeated = false
					
					view.ontick = function(){
						if(this.body.defeated){
							this.body.SetAngularVelocity(2)
							stage.boat.body.SetAwake(true)
							stage.checkpoint = stage.checkpoint || 'zeus dead'
						}else{
							this.timer += 1
							var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
							this.body.SetLinearVelocity(new b2.Vec2(0, vy))
							if(this.timer % (2*FPS) === 0 && player.body.GetPosition().y < 15){
								var z_pos = this.body.GetPosition()
								var p_pos = player.body.GetPosition()
								var theta = -30-180*Math.atan2(z_pos.y - p_pos.y, z_pos.x - p_pos.x)/Math.PI
								var x = z_pos.x + 2*(z_pos.x < p_pos.x ? 1 : -1)
								var y = z_pos.y
								projectiles.lightning.fire(x, y, -25, theta)
							}
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.zeus){
							b.defeated = true
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b)
						helper(fix_b, fix_a)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'angry cloud':
					var fix_def = new b2.FixtureDef()
					fix_def.density = 1
					fix_def.friction = 0
					fix_def.restitution = .1
					fix_def.shape = new b2.PolygonShape()
					fix_def.shape.SetAsOrientedBox(width/8, 2*height, new b2.Vec2(0, 2.2*height),0)
					fix_def.userData = {sensor:true}
					
					fix_def.filter.categoryBits = 4
					fix_def.filter.maskBits = 1
					
					view.body.CreateFixture(fix_def)	
					
					view.ontick = function(){
						var fix = this.body.GetFixtureList()
						this.body.GetUserData().sensor = this.t === 0
						while(fix){
							if(fix.GetUserData() && fix.GetUserData().sensor){
								fix.SetSensor(this.t === 0)
							}
							fix = fix.GetNext()
						}
					}

					
					break
					
				case 'happy cloud':
					break
				case 'bird':
					view.alert = true
					view.carrying = false
					view.s0 = view.body.GetPosition().Copy()
					view.body.SetLinearVelocity(new b2.Vec2(2, 0))
					view.timer = 0
					view.ontick = function(){
						if(stage.boat.body.sailing){
							this.alert = false
						}
						if(this.alert){
							var b = this.body.GetPosition()
							var p = player.body.GetPosition()
							this.flip = this.body.GetLinearVelocity().x < 0
							if(this.carrying){
								player.body.SetPosition(b)
								var v = this.s0.Copy()
								v.Subtract(b)
								if(v.Length() < .2){
									this.carrying = false
									this.body.SetPosition(this.s0)
									this.body.SetLinearVelocity(new b2.Vec2(0, 0))
									player.body.SetLinearVelocity(new b2.Vec2(0, 0))
								}else{
									v.Normalize()
									v.Multiply(15)
									this.body.SetLinearVelocity(v)
									this.body.SetAwake(true)
									
								}
							}else{
								if(p.y > 15){
									var v = b.Copy()
									v.Subtract(p)
									
									if(v.Length() < 1){
										this.carrying = true
									}else{
										v.Normalize()
										v.Multiply(-(player.body.GetLinearVelocity().Length()+1)*1.5)
										
										this.body.SetLinearVelocity(v)
										this.body.SetAwake(true)
									}
								}else{
									var vx = Math.max(Math.abs(p.x - b.x) - 1, 0)
									vx *= (p.x > b.x ? 1 : -1);
									this.body.SetLinearVelocity(new b2.Vec2(vx, 0))
									this.body.SetAwake(true)
								}
							}
						}else{ // !this.alert
							var pose_pos = stage.poseidon.body.GetPosition()
							var bird_pos = this.body.GetPosition()
							if(stage.poseidon.attacking){
								var v = bird_pos.Copy()
								v.Subtract(pose_pos)
								if(v.Length() > .1){
									if(v.Length() > 20){
										var p = pose_pos.Copy()
										p.Subtract(new b2.Vec2(0, 19))
										this.body.SetPosition(p)
									}
									v.Normalize()
									v.Multiply(-5)
									this.body.SetLinearVelocity(v)
									this.body.SetAwake(true)
								}else{
									stage.poseidon.retreating = true
									stage.poseidon.attacking = false
								}
							}else if(stage.poseidon.retreating){
								this.timer +=1 
								var a = 1
								var k = 6
								var t = this.timer/30
								var x = pose_pos.x + a*Math.cos(k*t)*Math.cos(t)
								var y = pose_pos.y + a*Math.cos(k*t)*Math.sin(t)
								this.body.SetPosition(new b2.Vec2(x, y))
							}
						}
					}
					break
				default:
					break
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
			console.log('lvl_script doesn\'t know what to do with ' + type)
		}
	
	}

	window.lvl_script = lvl_script


})(window)