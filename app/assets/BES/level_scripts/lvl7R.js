console.log('Level 7R script loaded');
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
		lvl_init: function(){},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_boat = 2,
				cat_fish = 4
				
			var mask_boat = cat_player,
				mask_fish = cat_player
				
				
			switch(that.view.update){
				case 'elevator':
				case 'sub':
				case 'hat':
				case 'octo':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'fish':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'mit':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'dragon':
					body_def.type = b2.Body.b2_staticBody
					break
				case 'global':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				case 'source':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				case 'jelly':
					//body_def.type = b2.Body.b2_kineaticBody
					break
				case 'surprise':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'bird':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'copter':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.friction = .2
					break
				case 'boat':
					fix_def.filter.categoryBits = cat_boat
					fix_def.filter.maskBits = mask_boat
					break
				default:
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'elevator':
					view.ontick = function(){
						if(this.body.GetPosition().y > 60){
							this.body.SetLinearVelocity(new b2.Vec2(1.5, -4))
						}else if(this.body.GetPosition().y < 45){
							this.body.SetLinearVelocity(new b2.Vec2(-1.5, 4))
						}
					}
					break
				case 'sub':
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.y0 = pos.y
					view.rangex = view.rangex || .1
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
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
					}
					break
				case 'octo':
					view.play = false
					view.ontick = function(){
						if(sensor.octo.touching){
							this.body.SetLinearVelocity(new b2.Vec2(0, -2))
							this.t = 1
						}else{
							
							if(this.body.GetPosition().y < 80){
								this.body.SetLinearVelocity(new b2.Vec2(0, 2))
							}else{
								this.body.SetLinearVelocity(new b2.Vec2(0, 0))
								this.t = 0
							}
						}
					}
					break
				case 'hat':
				
				case 'fish':
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
				case 'mit':
					view.play = false
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.y0 = pos.y
					view.rangex = view.rangex || 400
					view.rangey = view.rangey || 50
					view.Tx = 4 || view.Tx
					view.Ty = 1.5 || view.Ty
					view.omegax = 2*Math.PI/(view.Tx*FPS)
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.timer = 0
					view.body.mit = true
					view.ontick = function(){
						this.timer += 1
						var vx = - this.rangex * this.omegax * Math.sin(this.omegax * this.timer)
						var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
						this.flip = vx < 0
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
						if(this.body.play === true){
							this.t = 1
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.mit){
							b.play = true
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
				case 'dragon':
					view.body.dragon = true
					view.body.dam = 0
					view.y0 = view.body.GetPosition().y
					view.dy = 1
					view.ontick = function(){
						var pos = this.body.GetPosition()
						if(pos.y < this.y0 + this.dy*this.body.dam){
							this.body.SetPosition(new b2.Vec2(pos.x ,pos.y + .1))
						}
						
						if(this.body.dam > 3 && pos.y >= this.y0 + this.dy*this.body.dam){
							world.DestroyBody(this.body)
							stage.removeChild(this)
							
							stage.win()
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.dragon){
							if(a.GetLinearVelocity().y > 25){
								b.dam += 1
								stage.view.wiggle(4, 20, 1)
							}
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
				case 'global':
					view.ontick = function(){
						if(sensor.volcano.touching){
							console.log('Hot')
							player.body.SetPosition(new b2.Vec2(7.8, -1))
							stage.view.snap(0,0, 3960/5, 2448/4)
							/*
							stage.view.xmin = -3960/5 + stage.view.w
							stage.view.ymin = -2448/4 + stage.view.h**/
						}
					}
					break
				case 'jelly':
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.y0 = pos.y
					view.rangex = view.rangex || 0
					view.rangey = view.rangey || 0
					view.T = 2 || view.T
					view.T = 2 || view.T
					view.omega = 2*Math.PI/(view.T*FPS)
					view.timer = 0
					view.body.jelly = true
					view.ontick = function(){
						this.timer += 1
						var vx = - this.rangex * this.omega * Math.sin(this.omega * this.timer)
						var vy = - this.rangey * this.omega * Math.sin(this.omega * this.timer)
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.jelly){
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
				case 'source':
					view.timer = Math.floor(Math.random()*2*FPS)
					view.ontick = function(){
						view.timer += 1
						if(this.timer % (2*FPS) === 0){
							var pos = this.body.GetPosition()
							var bubble = projectiles.bubble.fire(pos.x, pos.y, 10, 90)
							bubble.ontick = bubble_tick
							bubble.body.SetType(b2.Body.b2_kinematicBody)
							bubble.body.SetLinearVelocity(new b2.Vec2(0, -4.5))
							
							
						}
					}
					break
				case 'surprise':
					view.x0 = view.body.GetPosition().x
					view.ontick = function(){
						if(!sensor[this.name]){
							return
						}
						if(sensor[this.name].touching && this.body.GetPosition().x > sensor[this.name].x){
							this.body.SetLinearVelocity(new b2.Vec2(-20, 0))
							this.body.SetAwake(true)
						}else if(!sensor[this.name].touching && this.body.GetPosition().x < this.x0){
							this.body.SetLinearVelocity(new b2.Vec2(4, 0))
							this.body.SetAwake(true)
						}else{
							this.body.SetLinearVelocity(new b2.Vec2(0,0))
						}
						//console.log(this.body.GetLinearVelocity())
					}
					break
				case 'bird':
					
					var sense_def = new b2.FixtureDef()
					sense_def.isSensor = true
					sense_def.shape = new b2.PolygonShape()
					sense_def.shape.SetAsBox(.5*width, .6*height)
					sense_def.userData = ['switch', 'bird' + view.name]
					
					//view.body.SetUserData(['moving', false])
					
					view.body.CreateFixture(sense_def)
					view.body.t = 0
					
					var listen = new b2.ContactListener()
					
					var bhelper = function(fix_a, fix_b){
						var a = fix_a.GetUserData()
						var b = fix_b.GetUserData()
						if(a && a[0] === 'switch' && a[1] === 'bird' + view.name 
							 && b && b[0] === 'player_foot'){
							var body = fix_a.GetBody()
							body.GetUserData()['moving'] = true
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						bhelper(fix_a, fix_b)
						bhelper(fix_b, fix_a)

					}
					
					var ehelper = function(fix_a, fix_b){
						var a = fix_a.GetUserData()
						var b = fix_b.GetUserData()
						if(a && a[0] === 'switch' && a[1] === 'bird' + view.name 
							 && b && b[0] === 'player_foot'){
							var body = fix_a.GetBody()
							body.GetUserData()['moving'] = false
						}
					}
					
					listen.EndContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						ehelper(fix_a, fix_b)
						ehelper(fix_b, fix_a)

					}
					//*/
					
					world.AddContactListener(listen)	
					
					view.ontick = function(){
						this.body.t += 1
						if(this.body.GetUserData()['moving']){
							this.body.SetLinearVelocity(new b2.Vec2(0, 3))
							this.body.t = 0
						}else{
							this.body.SetLinearVelocity(new b2.Vec2(0,
									1*Math.cos(4*this.body.t/FPS)
								))
						}
				
						/*
						var g = world.m_gravity.Copy()
						g.Multiply(-this.body.m_mass)
				
						this.body.m_force = g
						//*/
					}
					break
				case 'copter':
					view.ontick = function(){
						if(sensor[view.name] && sensor[view.name].touching){
							this.body.SetLinearVelocity(new b2.Vec2(-15, 0))
							this.body.SetAwake(true)
							
						}
					}
					
					break;
				
				case 'boat':
					view.rangex = view.rangex || 0
					view.rangey = view.rangey || 0
					view.v = view.v || 1
					
					var body = view.body
					var pos = body.GetPosition()
					var x = pos.x
					var y = pos.y
					var dy = 18
				
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

					view.hanger.SetLinearVelocity(new b2.Vec2(0,0))
				
					view.x0 = x
					view.y0 = y
					view.xf = x + parseFloat(view.rangex)
					view.yf = y + parseFloat(view.rangey)
				
					view.ontick = function(){//*
						if(body.GetUserData()['moving']){
							if(this.hanger.GetPosition().x <= this.x0){
								//console.log('turn around')
								this.hanger.SetLinearVelocity(this.pos_v)
							}else if(this.hanger.GetPosition().x >= this.xf){
								//console.log('bright eyes')
								this.hanger.SetLinearVelocity(this.neg_v)
							}
						}else{
							//console.log("I'm lonely...")
						}
					//*/
					}
						
				
					
					
					
					
					//DEBUG = true
					
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
			console.log('What?')
		}
	
	}

	window.lvl_script = lvl_script


})(window)