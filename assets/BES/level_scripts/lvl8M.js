console.log('Level 8M loaded');

(function(window) {
	
	var scripts = {
		ontick: function(){
			if(sensor.win.touched){
				stage.win()
			}
			if(sensor.platform.touching){
				init('platform')
			}else if(sensor.squir.touching){
				init('squir')
			}else if(sensor.taco.touching){
				init('taco')
			}
			switch(stage.checkpoint){
				case 'water':
					view.snap(0, 0, 852, 2784)
					break
				case 'platform':
					view.snap(-852, 0, 640, 2175)
					break
				case 'squir':
					view.snap(-1712, 0, 2503-1712, 1175)
					break
				case 'taco':
					view.snap(-1920, -1406, 2560-1920, 2048-1406)
					break
				case 'squatch':
					view.snap(-2560, 0, 3200-2560, 2173)
					break
				default:
					
				
			}
		},
		lvl_init: function(checkpoint){
			stage.checkpoint = checkpoint || 'water'
			switch(stage.checkpoint){
				case 'water':
				
					break
				case 'platform':
					player.body.SetPosition(vec(42, 17))
					break
				case 'squir':
					player.body.SetPosition(vec(69, 35))
					break
				case 'taco':
					player.body.SetPosition(vec(67,67))
					break
				case 'squatch':
					player.body.SetPosition(vec(2900/SCALE, 1900/SCALE))
					break
				default:
					break
			}
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_boat = 2,
				cat_fish = 4
				
			var mask_boat = cat_player,
				mask_fish = cat_player
				
				
			switch(that.view.update){
				case 'floater':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'peg':
					fix_def.shape = new b2.CircleShape(24/SCALE)
					fix_def.friction = .9
					body_def.type = b2.Body.b2_staticBody
					break
				case 'topping':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'squirrel':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'unoplat':
					body_def.type = b2.Body.b2_staticBody
					break
				case 'platbear':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'bubble':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'fish':
					body_def.type = b2.Body.b2_kinematicBody
					break
				default:
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'topping':
					view.body.topping = true
					if(stage.tacos){
						stage.tacos += 1
					}else{
						stage.tacos = 1
					}
					view.ontick = function(){
						if(this.body.got){
							this.kill()
							stage.tacos -= 1
							if(stage.tacos <= 0){
								init('squatch')
							}
						}
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.topping){
							b.got = true
							contact.SetEnabled(false)
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
				case 'floater':
					
					view.v = parseFloat(view.v)
					var y0 = view.body.GetPosition().y
					var y1 = y0 - parseFloat(view.dy)/SCALE
					view.y0 = Math.max(y0, y1)
					view.y1 = Math.min(y0, y1)
					view.body.SetLinearVelocity(vec(0, -view.v))
					view.v = Math.abs(view.v)
					
					platform = view
					
					view.ontick = function(){
						var pos = this.body.GetPosition()
						if(pos.y < this.y1){
							this.body.SetLinearVelocity(vec(0, this.v))

						}else if(pos.y > this.y0){
							this.body.SetLinearVelocity(vec(0, -this.v))
				
						}
					}
					break
				case 'squirrel':
					view.timer = Math.floor(Math.random()*FPS)
					view.body.squirrel = true
					view.ontick = function(){
						if((this.projectile === 'acorn' && stage.checkpoint !== 'squir') ||
						    (this.projectile === 'cube' && stage.checkpoint !== 'squatch')){
							return
						}
						//console.log('squirrel')
						
						view.timer += 1
						if(this.body.got){
							this.body.SetType(2)
						}else if(this.timer % FPS == 0){
							
							var pos = this.body.GetPosition()
							var d = pos.x < player.body.GetPosition().x ? 1 : -1
							var acorn = projectiles[this.projectile].fire(pos.x + d*2, pos.y, -d*21, 180)
							var fix = acorn.body.GetFixtureList()
							fix.m_filter.maskBits = 1
							fix.m_filter.categoryBits = 2
						}					
					}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.squirrel){
							b.got = true
							
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
				case 'peg':
					view.is_visible = function(){return false}
					break
				case 'unoplat':
					view.body.unoplat = true
					view.is_visible = function(){return false}
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, contact){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.player && b.unoplat){
							
							/*
							var aabb_a = fix_a.GetAABB()
							var aabb_b = fix_b.GetAABB()
							var h1 = aabb_a.upperBound.y - aabb_a.lowerBound.y
							var h2 = aabb_b.upperBound.y - aabb_b.lowerBound.y
							//*/
							contact.SetEnabled(
								//a.GetPosition().y + (h1)/2 < b.GetPosition().y &&
								a.GetLinearVelocity().y > 0
							) 
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
				case 'platbear':
					view.timer = 0
					view.body.SetLinearVelocity(vec(5,0))
					view.play = false
					view.ontick = function(){
						this.timer += 1
						var T = 75
						if(this.timer % (2*T) === 0){
							view.body.SetLinearVelocity(vec(5,0))
							this.t = 1
						}else if(this.timer % T === 0) {
							view.body.SetLinearVelocity(vec(-5,0))
							this.t = 0
						}
					}
					break
				case 'bubble':
					view.body.SetLinearVelocity(vec(0, -(Math.random()*2 + 1)))
					view.ontick = function(){
						var pos = this.body.GetPosition()
						if(pos.y < 0){
							this.body.SetPosition(vec(Math.random()*800/SCALE, 3000/SCALE))
						}
					}
					break
				case 'fish':
					view.body.SetLinearVelocity(vec(3,0))
					view.ontick = function(){
						var pos = this.body.GetPosition()
						if(pos.x < 50/SCALE){
							this.body.SetLinearVelocity(vec(3,0))
							this.flip = false
						}else if(pos.x > 800/SCALE){
							this.body.SetLinearVelocity(vec(-3,0))
							this.flip = true
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