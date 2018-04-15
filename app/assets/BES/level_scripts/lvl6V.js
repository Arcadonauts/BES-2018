console.log('Level 6V loaded');
/*
Coconuts should do damage
You turn red like the uniboar
faster Boats
more coconuts at end
more coconuts on second boat
slower uniboar/ faster cannon 

uniboar should change directions 
add on another coconut throwing tree
coconut should explode 3 seconds after it falls if not put in cannon
fewer water creatures
add sound effects!


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
	var charge = function(){
		if(this.x > this.width){			
			var f = new b2.Vec2(-5, 0)
			var s = this.body.GetPosition()
			this.body.ApplyImpulse(f, s)
		}else{
			view.wiggle(5, 10, 1)
		}
	}
	
	var jump = function(){
		var v = this.body.GetLinearVelocity()
		if(this.x > this.width){		
			if(v.Length() < .1){
				var f = new b2.Vec2(-80, -80)
				var s = this.body.GetPosition()
				this.body.ApplyImpulse(f, s)
			}
		}else{
			view.wiggle(5, 10, 1)
		}
	}
	
	var double_jump = function(){
		var v = this.body.GetLinearVelocity()
		if(this.x > this.width){		
			if(v.Length() < .1){
				var f = new b2.Vec2(-60, -60)
				var s = this.body.GetPosition()
				this.body.ApplyImpulse(f, s)
			}
		}else{
			view.wiggle(5, 10, 1)
		}
	}
	
	var wait = function(){
		
	}
	
	var retreat = function(){
		if(this.x < view.w - this.width){
			var f = new b2.Vec2(2, 0)
			var s = this.body.GetPosition()
			this.body.ApplyImpulse(f, s)
		}
	}
	
	var target = function(s0, sf, v){

		var g = world.GetGravity().y
		var x = sf.x - s0.x
		var y = sf.y - s0.y
		var d = v*v*v*v - g*(g*x*x + 2 *y*v*v)
		if(d < 0){return}
		return 180 - 180*Math.atan((v*v - Math.sqrt(d))/(g*x))/Math.PI
		
	}
	
	var rand = function(s0, sf, v0){
		return Math.random()*80 + 100
	}
	
	var aim = rand

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
				case 'cannon':
					body_def.type = b2.Body.b2_staticBody
					fix_def.isSensor = true
					fix_def.userData = ['switch', 'cannon']
					break
				case 'boar':
					body_def.fixedRotation = true
					break
				case 'tree':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.maskBits = 0
				case 'nut':
					fix_def.shape = new b2.CircleShape(10 / SCALE)
					break
				case 'eel':
					fix_def.filter.categoryBits = cat_fish
					fix_def.filter.maskBits = mask_fish
					fix_def.friction = .1
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'octo':
					fix_def.filter.categoryBits = cat_fish
					fix_def.filter.maskBits = mask_fish
					break
				case 'fish':
					fix_def.density = .3
					fix_def.filter.categoryBits = cat_fish
					fix_def.filter.maskBits = mask_fish
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
				case 'wall':
					view.ontick = function(){
						this.body.SetAwake(sensor.snap.touched)
					}
	
					break
				case 'cannon':
					view.body.loaded = 0
	
					view.ontick = function(){
						if(this.body.loaded === 1){
							this.body.loaded = 0
							var pos = this.body.GetPosition()
							var nut = projectiles.pronut.fire(pos.x - 2, pos.y - 2, 25, 145)
							nut.body.hot = true
						}else{
							this.body.loaded -= 1
						}
					}
	
					// Listener Mess
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
			
						var a = fix_a.GetBody().GetUserData()
						var b = fix_b.GetUserData()
			
						if(a && a.name == 'pronut' && b && b[1] == 'cannon'){
							var body_a = fix_a.GetBody()
							body_a.SetAwake(false)
							body_a.SetPosition(new b2.Vec2(-10, -10))
							
							var body_b = fix_b.GetBody()
							body_b.loaded = 20
							
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
				case 'boar':
					boar = view
					view.timer = 0
					view.wait = wait
					view.attack = double_jump
					view.retreat = retreat
					view.body.GetUserData()['name'] = 'boar'
					view.body.damage = 0
					
					view.ontick = function(){
						this.t = Math.floor(this.body.damage)
						if(this.t > 2){
							world.DestroyBody(this.body)
							stage.removeChild(this)
							
							/*
							text = new createjs.Text("You Win!", "bold 86px Arial");
							text.x = 320 - text.getBounds().width/2
							text.y = 100
							stage.addChild(text)
							*/
							stage.win()
						}
						if(sensor.snap.touched){
							this.timer += 1
							var phase = [100, 200, 350, 650]
								
							if(this.timer < phase[0]){
								this.wait()
							}else if(this.timer < phase[1]){
								this.attack()
							}else if(this.timer === phase[1]){
								var pos = this.body.GetPosition()
								projectiles.pronut.fire(pos.x + 12, pos.y - 15, 0, 0)
							}else if(this.timer < phase[2]){
								this.wait()
							}else if(this.timer < phase[3]){
								this.retreat()
							}else{
								this.timer = 0
								this.attack = [charge, jump, double_jump][Math.floor(Math.random()*3)]
							}
						}
					}
					
					// Listener Mess
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b, impulse){
			
						var a = fix_a.GetBody().GetUserData()
						var b = fix_b.GetBody().GetUserData()
			
						if(a && a.name == 'pronut'){
							var body_a = fix_a.GetBody()
							if(body_a.hot || (b && b.name == 'boar')){
								//
								body_a.SetPosition(new b2.Vec2(-10, 0))
							}
							if(body_a.hot && (b && b.name == 'boar')){
								var body_b = fix_b.GetBody()
								body_a.SetAwake(false)
								body_b.damage += 1 //body_a.hot ? .5 : 0
									
							}						
						}
					}
					
					listen.PostSolve = function(contact, impulse){
						var impulse = impulse.normalImpulses[0]
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b, impulse)
						helper(fix_b, fix_a, impulse)

					}
					
					world.AddContactListener(listen)
					
					
					
					break
				case 'tree':
					view.ontick = function(){
						var pos = this.body.GetPosition()
						var player_pos = player.body.GetPosition()
						if(player_pos.x < pos.x){
							if(this.frame_change && this.t === 5){
								projectiles.pronut.fire(pos.x, pos.y, 35, aim(pos, player_pos, 35))
							}
							this.frames = 6
						}else{
							this.t = 0
							this.frames = 1
						}		
					}
					break;
				case 'nut':
					view.body.SetAwake(false)
					view.ontick = function(){
						this.body.SetAwake(sensor[this.name].touched)
					}
					break
				case 'eel':
					view.body.SetLinearVelocity(new b2.Vec2(0, 0))
					view.do_once = true
					view.ontick = function(){
						if(sensor[this.name].touched && this.do_once){
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(new b2.Vec2(-7, 1))
							this.do_once = false
						}
					}
					break
				case 'octo':
					view.body.SetAwake(false)
					view.do_once = true
					view.ontick = function(){
						if(sensor[this.name].touched && this.do_once){
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(new b2.Vec2(0, -30))
							this.do_once = false
						}
					}
					break
				case 'fish':
					view.body.SetAwake(false)
					view.do_once = true
					view.ontick = function(){
						if(sensor[this.name].touched && this.do_once){
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(new b2.Vec2(-20, -30))
							this.do_once = false
						}
					}
					break;
				case 'boat':
					view.rangex = view.rangex || 5
					view.rangey = view.rangey || 2
					view.v = view.v || 1
					
					var body = view.body
					var pos = body.GetPosition()
					var x = pos.x
					var y = pos.y
					var dy = 18
				
					var fix_def = new b2.FixtureDef()
					fix_def.shape = new b2.CircleShape(1/SCALE)
				
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
					
					var sense_def = new b2.FixtureDef()
					sense_def.isSensor = true
					sense_def.shape = new b2.PolygonShape()
					sense_def.shape.SetAsBox(.5*width, .6*height)
					sense_def.userData = ['switch', 'boat' + view.name]
					
					//view.body.SetUserData(['moving', false])
					
					view.body.CreateFixture(sense_def)
					
					var listen = new b2.ContactListener()
					
					var helper = function(fix_a, fix_b){
						var a = fix_a.GetUserData()
						var b = fix_b.GetUserData()
						if(a && a[0] === 'switch' && a[1] === 'boat' + view.name 
							 && b && b[0] === 'player_foot'){
							var body = fix_a.GetBody()
							body.GetUserData()['moving'] = true
						}
					}
					
					listen.BeginContact = function(contact){
						var fix_a = contact.GetFixtureA()
						var fix_b = contact.GetFixtureB()
						helper(fix_a, fix_b)
						helper(fix_b, fix_a)

					}
					//*/
					
					world.AddContactListener(listen)
					
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
			console.log('I don\'t understand: ' + type)
		}
	
	}

	window.lvl_script = lvl_script


})(window)