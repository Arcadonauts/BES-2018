console.log('lvl7T.js loaded');

(function(window) {

	var scripts = {
		ontick: function(){
			if(player.body.GetPosition().x > 232){
				stage.win()
			}
		},
		lvl_init: function(){},
		update: function(that, body_def, fix_def){
				var cat_player = 1,
					cat_car = 2,
					cat_wall = 4
					cat_ground = 8
					cat_alien = 16
				
				var mask_car = cat_player | cat_ground | cat_alien,
					mask_wall = cat_player	
					mask_ground = cat_player | cat_car
					mask_alien = cat_player | cat_car
			switch(that.view.update){
				case 'launch':
					fix_def.isSensor = true
					fix_def.userData = {sensor:true, type:'launch'}
					body_def.type = b2.Body.b2_staticBody
					break
				case 'wall':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.categoryBits = cat_wall
					fix_def.filter.maskBits = mask_wall
					break
				case 'ground':
					body_def.type = b2.Body.b2_staticBody
					fix_def.filter.categoryBits = cat_ground
					fix_def.filter.maskBits = mask_ground
					break
				case 'wheel':
					fix_def.shape = new b2.CircleShape(that.view.hit_width/2/SCALE)
					fix_def.filter.categoryBits = cat_car
					fix_def.filter.maskBits = mask_car
					break
				case 'worm':
					break
				case 'ufo':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'car':
					fix_def.friction = 2
					fix_def.filter.categoryBits = cat_car
					fix_def.filter.maskBits = mask_car
					break
				case 'alien':
					fix_def.filter.categoryBits = cat_alien
					fix_def.filter.maskBits = mask_alien
					break
				
				default:
					console.log("Unknown update: " + that.view.update)
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'launch':
				
					view.ontick = function(){
						if(this.body.launch && !this.fired){
							this.fired = true
							var pos = this.body.GetPosition()
							projectiles.meteor.fire(pos.x + 25, pos.y - 15, 23, 180)
							console.log('FIRE')
						}
					}
				
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetUserData()
						var b = fix_b.GetUserData()
						if(a && a.sensor && a.type == 'launch' && b && b[0] === 'player_foot'){
							var body = fix_a.GetBody()
							body.launch = true
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
				case 'wheel':
					break
				case 'worm':
					view.body.SetLinearVelocity(vec(0, -100))
					view.body.SetAwake(false)
					view.ontick = function(){
						if(!this.body.IsAwake()){
							var ppos = player.body.GetPosition()
							var wpos = this.body.GetPosition().Copy()
							if(wpos.x - ppos.x < 2){
								this.body.SetLinearVelocity(vec(0, -40))
								this.body.SetAwake(true)
							}
						}
					}
					break
				case 'ufo':
					view.timer = 0
					view.Tx = view.Tx || 3.1
					view.Ty = view.Ty || 2
					view.rangex = view.rangex || 50
					view.rangey = view.rangey || 16
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
				case 'car':
					view.wheels = undefined
					car = view
					view.ontick = function(){
						if(!this.wheels){
							this.wheels = []
							this.anchors = [[-.35*width, .9*height],[.27*width, .8*height]]
							for(var i = 0; i < 2; i++){
								for(var j = 0; j < stage.children.length; j++){
									if(stage.children[j].name === 'wheel' + (i+1)){
										this.wheels[i] = stage.children[j]
										break
									}
								}
								var joint_def = new b2.RevoluteJointDef()
								joint_def.bodyA = this.body
								joint_def.bodyB = this.wheels[i].body
								joint_def.collideConnected = false
								
								joint_def.localAnchorA.Set(this.anchors[i][0], this.anchors[i][1])
								joint_def.localAnchorB.Set(0,0)
								joint_def.enableMotor = true
								joint_def.maxMotorTorque = 40
								joint_def.motorSpeed = 0
								
								world.CreateJoint(joint_def)
								
							
							}
						}else{
							if(!this.body.start){
								if(sensor.car.touched){
									this.body.start = true
								}
							}
							else if(this.body.start && !this.body.driving){
								this.body.driving = true
								var joint = this.body.GetJointList()
								while(joint){
									joint.joint.SetMotorSpeed(10)
									joint = joint.next
								}
							}
						}
						
					}
					break
				case 'alien1':
					break
				case 'alien2':
					break
				default:
					1+1
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