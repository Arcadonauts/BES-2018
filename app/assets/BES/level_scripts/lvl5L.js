console.log('Level 7L script loaded');
/*


//*/

(function(window) {
	var bubble_tick = function(){
		/*
		var f = world.GetGravity().Copy()
		f.Multiply(-1.3*this.body.m_mass)
		this.body.m_force = f
		*/
		//this.body.ApplyImpulse(new b2.Vec2(0, -3), this.body.GetWorldCenter())
		//this.body.SetLinearVelocity(new b2.Vec2(0, -2))
		if(this.t >= 3){
			this.kill()
		}

	}
	var scripts = {
		ontick: function(){},
		lvl_init: function(){
			//player.body.SetPosition(vec(135, 33))
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_wall = 2
				cat_camel = 4
				
			var mask_boat = cat_player,
				mask_wall = cat_player
				mask_camel = cat_player
				
			switch(that.view.update){
				case 'pharoh':
					//body_def.type = b2.Body.b2_kinematicBody
					fix_def.userData = {sensor: true,
							  marker: true,
							 }
					fix_def.isSensor = true
					break
					break
				case 'marker':
					fix_def.filter.categoryBits = cat_wall
					fix_def.filter.maskBits = mask_wall
					body_def.type = b2.Body.b2_staticBody
					fix_def.userData = {sensor: true,
							  marker: true,
							 }
					fix_def.isSensor = true
					break
				case 'camel':
					fix_def.filter.categoryBits = cat_camel
					fix_def.filter.maskBits = mask_camel
					break
				case 'tomb':
					fix_def.density = .1
					break
				case 'hover':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'stag':
					break
				case 'spider':
					body_def.type = b2.Body.b2_kinematicBody
					break
				default:
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'pharoh':
					view.body.pharoh = true
					view.body.SetAwake(false)
					view.ontick = function(){
						this.flip = player.body.GetPosition().x > this.body.GetPosition().x
						if(sensor.wake.touching){
							if(!this.body.IsAwake() && !this.on_guard){
							
								this.body.SetAwake(true)
								this.body.ApplyImpulse(vec(-120, -400), this.body.GetPosition())
							}
						}
						if(this.body.GetPosition().x < 141.1 && !this.on_guard){
							//this.body.SetActive(false)
							this.body.SetAwake(false)
							this.on_guard = true
						}
						if(this.body.GetPosition().y > 50){
							stage.win()
							this.kill()
							console.log("I'm dead now.")
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.pharoh && b.camel){
							a.SetAwake(true)
							a.SetLinearVelocity(b.GetLinearVelocity())
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
				case 'marker':
					view.ontick = function(){
						this.flip = player.body.GetPosition().x > this.body.GetPosition().x
						fix = this.body.GetFixtureList()
						if(sensor.wake.touching && !this.do_once){
							this.do_once = true
							fix.SetSensor(false)
						}else if(stage.camel.body.IsAwake()){
							fix.SetSensor(true)
						}
					}
					
					break
				case 'spoon':
					view.body.SetAwake(false)
					
					view.ontick = function(){
						if(this.body.IsAwake()){
							stage.camel.body.SetAwake(true)
						}
					}
					break
				case 'camel':
					view.body.SetAwake(false)
					view.body.SetFixedRotation(true)
					stage.camel = view
					view.body.camel = true
					break
				case 'tomb':
					break
				case 'hover':
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.y0 = pos.y
					view.rangex = view.rangex || 400
					view.rangey = view.rangey || 0
					view.T = 8 || view.T
					view.omega = 2*Math.PI/(view.T*FPS)
					view.timer = 0
					view.body.ghost = true
					view.ontick = function(){
						this.timer += 1
						var vx = - this.rangex * this.omega * Math.sin(this.omega * this.timer)
						var vy = - this.rangey * this.omega * Math.sin(this.omega * this.timer)
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
						this.flip = vx < 0
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.ghost){
							a.dead = true
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
				case 'stag':
					view.body.SetAwake(false)
					view.ontick = function(){
						p_pos = player.body.GetPosition()
						s_pos = this.body.GetPosition()
						if(Math.abs(p_pos.x - s_pos.x) < 1){
							this.body.SetAwake(true)
						}
					}
					break
				case 'spider':
					view.play = false
					var pos = view.body.GetPosition()
					view.y0 = pos.y
					view.rangey = view.rangey || 200
					view.Ty = 6 || view.Ty
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.timer = parseFloat(view.t0) || 0
					view.body.spider = true
					view.ontick = function(){
						this.timer += 1
						var vx = 0 
						var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
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
			console.log('What?')
		}
	
	}

	window.lvl_script = lvl_script


})(window)