console.log('Level 7R script loaded');
/*


//*/

(function(window) {
	var scripts = {
		ontick: function(){
			var colors = ['red', 'yellow', 'blue']
			for(var i = 0; i < colors.length; i++){
				var c = colors[i]
				if(sensor[c] && sensor[c].touched){
					stage.checkpoint[c] = true
					keydown.right = false
					init(stage.checkpoint)
				}
			}
			if(sensor.refresh && sensor.refresh.touched){
				init(stage.checkpoint)
			}
			var py = player.body.GetPosition().y
			if(py > 40 && py < 51){
				//keydown.left = keydown.right = keydown.A = keydown.D = false
				/*if(player.vmax !== 0){
					player.body.m_linearVelocity = vec(0,0)
					keydown.right = keydown.left = keydown.D = keydown.A = false	
				}//*/
				player.vmax = 0
			}
		},
		lvl_init: function(checkpoint){
			stage.checkpoint = checkpoint || {red:false, blue:false, yellow:false}
			if(stage.checkpoint.red && stage.checkpoint.blue && stage.checkpoint.yellow){
				stage.win()
			}
			var re = /.+link.+/
			for(var i = 0; i < stage.children.length; i++){
				var child = stage.children[i]
				if(child.name && child.name.match(re)){
					child.ontick = function(){
						if(this.is_visible()){
		
							var py = this.body.GetPosition().y
							if(py > 50){
								this.src_y = 1*64
							}else if(py > 30){
								this.src_y = 2*64
							}else{
								this.src_y = 0*64
							}
						}
					}
				}
			}
		},
		update: function(that, body_def, fix_def){
			var cat_player = 1,
				cat_jump = 2
				cat_sphinx = 4
				
			var mask_boat = cat_player,
				mask_jump = cat_player
				mask_sphinx = cat_player
				
			switch(that.view.update){
				case 'snake':
					fix_def.friction = .02
					body_def.type = b2.Body.b2_staticBody
					break
				case 'mummy':
					fix_def.friction = .02
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'sphinx':
					body_def.type = b2.Body.b2_kinematicBody
					fix_def.filter.categoryBits = cat_sphinx
					fix_def.filter.maskBits = mask_sphinx
					break
				case 'jump':
					//fix_def.friction = .02
					fix_def.filter.categoryBits = cat_jump
					fix_def.filter.maskBits = mask_jump
					break
				case 'monster':
					fix_def.friction = .02
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'trap':
					//body_def.type = b2.Body.b2_staticBody
					break
				case 'catform':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'portal':
					body_def.type = b2.Body.b2_kinematicBody
					break
				default:
			
			}
		},
		init: function(view, width, height){
			//console.log(view.update)
			switch(view.update){
				case 'mummy':
					view.body.SetLinearVelocity(vec(-2, 0))
					view.flip = true
					break
				case 'sphinx':
					view.ontick = function(){
						var pos = player.body.GetPosition()
						
						if(pos.y > 40 && pos.y < 51){
							if(pos.x > this.body.GetPosition().x - width/2){
								this.body.GetLinearVelocity().x = player.body.GetLinearVelocity().x = 4
								keydown.right = true
							}else{
								player.body.SetLinearVelocity(vec(0, 1))
								
								keydown.right = false
							}
						}
					}
					break
				case 'monster':
					view.timer = 0
					view.body.monster = true
					view.ontick = function(){
						this.timer += 1
						
						if(this.body.dead){
							this.alpha -= .02
							if(this.alpha <= 0){
								this.kill()
							}
						}else if(this.timer % (2*FPS) == 1){
							var pos = this.body.GetPosition()
							projectiles.ice.fire(pos.x - 1, pos.y, -30, -15)
						}
					}
					
					var listen = new b2.ContactListener()
					
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.monster && b.player){
							a.dead = true
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
				case 'jump':
					view.body.SetFixedRotation(true)
					view.body.SetAwake(false)
					view.ontick = function(){
						if(!this.body.IsAwake()){
							var ppos = player.body.GetPosition()
							var wpos = this.body.GetPosition().Copy()
							if(wpos.x - ppos.x < 10){
								this.body.SetLinearVelocity(vec(0, -20))
								this.body.SetAwake(true)
							}
						}
					}
					break
				case 'trap':
					var body = view.body
					var pos = body.GetPosition()
					var x = pos.x
					var y = pos.y
					var dx = width/2
				
					var fix_def = new b2.FixtureDef()
					fix_def.shape = new b2.CircleShape(1/SCALE)
				
					var body_def = new b2.BodyDef()
					body_def.type = b2.Body.b2_kinematicBody
					body_def.position.x = x + dx
					body_def.position.y = y 
					
					var hanger = world.CreateBody(body_def)
					hanger.CreateFixture(fix_def)
					
					var joint_def = new b2.RevoluteJointDef()
					joint_def.bodyA = view.body
					joint_def.bodyB = hanger
					joint_def.collideConnected = false
					
					joint_def.localAnchorA.Set(dx, 0)
					joint_def.localAnchorB.Set(0,0)
					joint_def.enableMotor = true
					joint_def.maxMotorTorque = 1000
					joint_def.motorSpeed = 0
					
					view.joint = world.CreateJoint(joint_def)
					console.log(view.joint)
					
					view.ontick = function(){
						if(sensor.trap.touched){
							this.joint.m_maxMotorTorque = 0
							this.body.SetAwake(true)
						}
					}

					break
				case 'catform':
					view.play = false
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.rangex = view.rangex || 300
					view.Tx = 6 || view.Tx
					view.omegax = 2*Math.PI/(view.Tx*FPS)
					view.timer = parseFloat(view.t0) || 0
					view.body.catform = true
					view.ontick = function(){
						this.timer += 1
						var vy = 0 
						var vx = - this.rangex * this.omegax * Math.cos(this.omegax * this.timer)
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
						this.flip = this.body.GetLinearVelocity().x < 0
					}
					break
				case 'portal':
					view.body.portal = true
					view.teleport = {red: [vec(1,55), [0, -1536, 640*3+64, 512]],
									yellow: [vec(3.2,45), [0, -1536+512, 640*3.5+64, 512]],
									blue: [vec(1,25), [0, -1536+512*2, 640*4+64, 512]]}
					view.ontick = function(){
						if(stage.checkpoint[this.color]){
							this.kill()
						}
						if(this.body.entered){
							var tele = this.teleport[this.color]
							player.body.SetPosition(tele[0])
							player.body.m_linearVelocity = vec(0,0)
							keydown.right = keydown.left = keydown.D = keydown.A = false
							stage.view.snap.apply(stage.view, tele[1])
							this.kill()
						}
					}
					
					var listen = new b2.ContactListener()
					
					var begin_helper = function(fix_a, fix_b){
						var a = fix_a.GetBody()
						var b = fix_b.GetBody()
						if(a.portal && b.player){
							a.entered = true
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