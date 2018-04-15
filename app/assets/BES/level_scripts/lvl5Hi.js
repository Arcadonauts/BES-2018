console.log('Level 5Hi script loaded');
/*


//*/

(function(window) {
	
	var scripts = {
		ontick: function(){},
		lvl_init: function(arg){
			stage.checkpoint = arg || stage.checkpoint
			console.log(stage.checkpoint)
			stage.dead_snakes = 0
			if(stage.checkpoint === 'cp'){
				player.body.SetPosition(new b2.Vec2(110, 10))
			}
			if(stage.checkpoint === 'fin'){
				player.body.SetPosition(new b2.Vec2(175, 10))
			}
			if(stage.checkpoint === 'bee'){
				player.body.SetPosition(new b2.Vec2(230, 5))
			}
			
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_baddie = 2
				
			var mask_boat = cat_player,
				mask_baddie = cat_player
				
			switch(that.view.update){
				case 'acorn':
					fix_def.shape = new b2.CircleShape(.5)
					break
				case 'hillsgrove':
					body_def.type = b2.Body.b2_staticBody
					break
				case 'bee':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'snake':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'ivy':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.userData = {sensor: true,
							  ivy: true,
							 }
					fix_def.isSensor = true
					break
				case 'vivy':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.filter.maskBits = 0
					break
				case 'checkpoint':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				case 'fire':
					fix_def.filter.categoryBits = cat_baddie
					fix_def.filter.maskBits = mask_baddie
					body_def.type = b2.Body.b2_staticBody
					break
				case 'tree':
					fix_def.filter.categoryBits = cat_baddie
					fix_def.filter.maskBits = mask_baddie
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
					break
				case 'bat':
					fix_def.filter.categoryBits = cat_baddie
					fix_def.filter.maskBits = mask_baddie
					body_def.type = b2.Body.b2_kinematicBody
					break				
				case 'bear':
					fix_def.filter.categoryBits = cat_baddie
					fix_def.filter.maskBits = mask_baddie
					break
				default:
				
			}
		},
		init: function(view, width, height){
			switch(view.update){
				case 'acorn':
					view.body.acorn = true
					var listen = new b2.ContactListener()
		
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.hillsgrove && b.acorn){
							var pos = b.GetWorldCenter()
							pos.x -= .5
							pos.y -= 1
							b.ApplyImpulse(vec(-10,-30), pos)
						}else if(a.bee && b.acorn){
							a.damage += 2
								
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
				case 'hillsgrove':
					view.body.hillsgrove = true
					break
				case 'bee':
					view.timer = 0
					view.Tx = view.Tx || 5
					view.Ty = view.Ty || 2
					view.rangex = view.rangex || 500
					view.rangey = view.rangey || 100
					view.omegax = 2*Math.PI/(view.Tx*FPS)
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.body.SetFixedRotation(true)
					
					view.body.damage = 0
					view.body.bee = true
					
					view.ontick = function(){
						this.timer += 1
						
						if(this.body.damage < 7){
							this.t = this.body.damage
							var vx = - this.rangex * this.omegax * Math.cos(this.omegax * this.timer)
							var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
						}else{
							this.t = 7
							var vx = 3
							var vy = -3
							stage.win()
							this.ontick = function(){}
						}
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
						this.flip = vx < 0
					}
					break
				case 'snake':
					view.ontick = function(){
						if(this.body.GetPosition().y > 20){
							console.log("I'm dead")
							stage.dead_snakes += 1
							if(stage.dead_snakes >= 2){
								init('bee')
							}
							this.kill()
						}
					}
					view.body.SetFixedRotation(true)
					view.body.snake = true
					
					var listen = new b2.ContactListener()
		
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.snake){
							b.SetLinearVelocity(vec(0,2))
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
				case 'ivy':
					view.body.SetLinearVelocity(vec(3, 0))
					view.body.ivy = true
					view.timer = 0
					view.Ty = view.Ty || 2
					view.rangey = view.rangey || 30
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.body.SetFixedRotation(true)
					
					view.ontick = function(){
						this.timer += 1
						if(this.body.GetPosition().x < 110){
							var vx = 3.5
							var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
						}else{
							var vx = 0
							var vy = 2
						}
						
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
					}
					
					
					var listen = new b2.ContactListener()
		
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.ivy){
							a.dead = true
							var pos = a.GetPosition()
							a.ApplyImpulse(vec(5, -20), vec(pos.x + 3, pos.y))
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
				case 'vivy':
					view.body.SetLinearVelocity(vec(-1, 2))
					break
				case 'squirrel':
					view.timer = Math.floor(Math.random()*FPS)
					view.x0 = view.body.GetPosition().x
					view.body.SetFixedRotation(true)
					view.ontick = function(){
						//console.log('squirrel')
						var v = this.body.GetLinearVelocity()
						var pos = this.body.GetPosition()
						
						view.timer += 1
						if(view.timer % FPS == 0){
							var acorn = projectiles.acorn.fire(pos.x-2, pos.y, 21, 180)
							var fix = acorn.body.GetFixtureList()
							fix.m_filter.maskBits = 1
							fix.m_filter.categoryBits = 2
						}
						if(v.Length() < .1 && pos.y > 11){
							var m = this.body.m_mass
							var f = new b2.Vec2(0, -25*m)
							var s = this.body.GetPosition()
							this.body.ApplyImpulse(f, s)
						}
						if(Math.abs(pos.x - this.x0) > 10){
							this.kill()
						}						
					}
					break
				case 'checkpoint':
					view.ontick = function(){
						if(sensor[this.name].touching){
							stage.checkpoint = this.name
							stage.view.snap(0, 0, 6336, 600)
						}
					}
					break
				case 'fire':
					view.body.fire = true
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.fire){
							a.dead = true
							var pos = a.GetPosition()
							a.ApplyImpulse(vec(-4, -20), vec(pos.x + 3, pos.y))
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
				case 'tree':
					view.ontick = function(){
						var p_pos = player.body.GetPosition()
						var b_pos = this.body.GetPosition()
						if(Math.abs(p_pos.x - b_pos.x) < 5){
							this.t = 1
						}
					}
					break 
				case 'bat':
					view.timer = 0
					view.Tx = view.Tx || 3.1
					view.Ty = view.Ty || 2
					view.rangex = view.rangex || 300
					view.rangey = view.rangey || 100
					view.omegax = 2*Math.PI/(view.Tx*FPS)
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.body.SetFixedRotation(true)
					
					view.ontick = function(){
						this.timer += 1
						var vx = - this.rangex * this.omegax * Math.cos(this.omegax * this.timer)
						var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
					}
					break
				case 'bear':
					view.body.SetFixedRotation(true)
					view.ontick = function(){
						var p_pos = player.body.GetPosition()
						var b_pos = this.body.GetPosition()
						if(Math.abs(p_pos.x - b_pos.x) < 20){
							var v = this.body.GetLinearVelocity()
							if(v.Length() < .1){
								var m = this.body.m_mass
								var f = new b2.Vec2(-8*m, -25*m)
								var s = this.body.GetPosition()
								this.body.ApplyImpulse(f, s)
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
			console.log('What?')
		}
	
	}

	window.lvl_script = lvl_script


})(window)