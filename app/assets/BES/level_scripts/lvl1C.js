
(function(window) {

	var choice = function(list){
		var i = Math.floor(list.length*Math.random())
		return list[i]
	}
	
	var opposite = {'left':'right', 'right': 'left', 'up': 'down', 'down': 'up'}
	
	var scripts = {
		ontick: function(){
			for(var i = 0; i < stage.dots.length; i++){
				if(!stage.dots[i].body.eaten){
					return
				}
			}
			stage.win()
		},
		lvl_init: function(checkpoint){
			var g = world.GetGravity()
			g.x = g.y = 0
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_boat = 2,
				cat_fish = 4
				
			var mask_boat = cat_player,
				mask_fish = cat_player
				
				
			switch(that.view.update){
				case 'dot':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.isSensor = true
					break
				case 'inky':
					//body_def.type = b2.Body.b2_kinematicBody
					fix_def.isSensor = true
					break
				case 'pac':
					//body_def.type = b2.Body.b2_kinematicBody
					fix_def.shape = new b2.CircleShape(.75)
					fix_def.friction = 0
					break
				default:
				
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'dot':
					view.body.dot = true
					view.body.SetAngularVelocity(2)
					if(stage.dots){
						stage.dots.push(view)
					}else{
						stage.dots = [view]
					}
					
					view.is_visible = function(){return !this.body.eaten}
					
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.dot && b.player){
							a.eaten = true
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
				case 'inky':
					view.body.IsSleepingAllowed(false)
					view.body.SetFixedRotation(true)
					view.body.inky = true
					view.t = Math.floor(Math.random()*parseInt(view.frames))
					view.play = false
					view.cooldown = 10
					var v = 4
					view.direction = view.body.GetPosition().x > 10 ? 'left' : 'right'
					view.v = {'left': vec(-v, 0),
							  'right': vec(v, 0),
							  'up': vec(0, -v),
							  'down': vec(0, v)}
					
					var dir = view.directions = ['left', 'right', 'up', 'down']
					var offset = [vec(-width, 0), vec(width, 0), vec(0, -height), vec(0, height)]
			
					view.body.blocked = {}
			
					for(var i = 0; i < 4; i++){
						var fix_def = new b2.FixtureDef()
						fix_def.shape = new b2.PolygonShape()
						var d = .75
						fix_def.shape.SetAsOrientedBox(d*width, d*height, offset[i], 0)
						fix_def.isSensor = true
						var fix = view.body.CreateFixture(fix_def)
						fix.direction = dir[i]
						view.body.blocked[dir[i]] = 0
					}
						//view.body.blocked['left'] = view.body.blocked['right'] = 0
						//view.body.blocked['up'] = view.body.blocked['down'] = 1
						
					
					
					view.ontick = function(){
						if(this.v[this.direction]){
							this.body.SetLinearVelocity(this.v[this.direction])
						}
						if(this.cooldown > 0){
							this.cooldown -= 1
							return
						}
						if(this.body.change){
							this.body.change = false
							var possibles = []
							for(var i = 0; i < this.directions.length; i++){
								var dir = this.directions[i]
								if(this.body.blocked[dir] === 0 && this.direction !== opposite[dir]){
									possibles.push(dir)
								}
							}
							this.direction = choice(possibles)
						}
						var pos = this.body.GetPosition().Copy()
						var teleport = false
						if(pos.x < -1.6){
							pos.x = 22.1
							teleport = true
							this.direction = 'left'
						}
						if(pos.x > 22.1){
							pos.x = -1.6
							teleport = true
							this.direction = 'right'
						}
						if(teleport){
							view.t = Math.floor(Math.random()*parseInt(view.frames))
							this.cooldown = 30
							this.body.SetPosition(pos)
						}
						
					}
					
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.inky && !(b.inky || b.dot)){
							if(!fix_a.direction && b.player){
								if(!stage.won){
									init()
								}
							}
							if(fix_a.direction && !b.player){
								a.blocked[fix_a.direction] += 1
							}
						}
						
					}
					var end_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.inky && !(b.inky || b.dot)){
							if(fix_a.direction && !b.player){
								a.blocked[fix_a.direction] -= 1
								if(a.blocked[fix_a.direction] === 0){
									a.change = true
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
					
					listen.EndContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						end_helper(fix_a, fix_b)
						end_helper(fix_b, fix_a)

					}
					
					world.AddContactListener(listen)
					
					break
				case 'pac':
					pac = view
				
					view.body.player = true
					view.body.IsSleepingAllowed(false)
					view.body.SetFixedRotation(true)
					view.v = 6
					view.ontick = function(){
						var left = keydown.left || keydown.A
						var right = keydown.right || keydown.D
						var up = keydown.up || keydown.W
						var down = keydown.down || keydown.S
						var vx = 0
						var vy = 0
						this.flip = false
						if(left){
							vx -= this.v
							this.body.SetAngle(-1*Math.PI/4)
							this.flip = true
						}else if(right){
							vx += this.v
							this.body.SetAngle(1*Math.PI/4)
						}else if(up){
							vy -= this.v
							this.body.SetAngle(-1*Math.PI/4)
						}else if(down){
							vy += this.v
							this.body.SetAngle(3*Math.PI/4)
						}
						
						this.body.SetAwake(true)
						this.body.SetLinearVelocity(vec(vx, vy))
						
						var pos = this.body.GetPosition().Copy()
						var teleport = false
						if(pos.x < -1.6){
							pos.x = 22.1
							teleport = true
						}
						if(pos.x > 22.1){
							pos.x = -1.6
							teleport = true
						}
						if(teleport){
							this.body.SetPosition(pos)
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