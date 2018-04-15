console.log('Level 4C loaded');

(function(window) {
	

	var scripts = {
		ontick: function(){
			if(sensor.dragon.touching){
				player.body.SetPosition(vec(70,1))
				view.snap(-2000, 0, 512*2.9, 512)
				
			}
			if(sensor.win.touched && !sensor.win.once){
					sensor.win.once = true
					
					stage.win()
				}
		},
		lvl_init: function(){},
		update: function(that, body_def, fix_def){
			switch(that.view.update){
				case 'dragon':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'bat':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'cyclops':

					break
				case 'nyan':
					body_def.type = b2.Body.b2_kinematicBody
					break
				case 'octo':
					body_def.type = b2.Body.b2_kinematicBody
					break
				default:
			
			}
		},
		init: function(view, width, height){
			switch(view.update){
				case 'dragon':
					view.ontick = function(){
						if(sensor[this.name].touched){
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(vec(-15, 0))
						}
					}
					break
				case 'bat':
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.y0 = pos.y
					view.rangex = view.rangex || 200
					view.rangey = view.rangey || 50
					view.Tx = 5
					view.Ty = 1
					view.omegax = 2*Math.PI/(view.Tx*FPS)
					view.omegay = 2*Math.PI/(view.Ty*FPS)
					view.timer = Math.floor(view.Tx*FPS*Math.random())
					view.body.jelly = true
					view.ontick = function(){
						this.timer += 1
						var vx = - this.rangex * this.omegax * Math.sin(this.omegax * this.timer)
						var vy = - this.rangey * this.omegay * Math.sin(this.omegay * this.timer)
						this.body.SetLinearVelocity(new b2.Vec2(vx, vy))
					}
					break
				case 'cyclops':
					var m = new b2.MassData()
					m.mass = 5
					m.I = 1
					view.body.SetMassData(m)
					view.body.SetFixedRotation(true)
					
					view.timer = Math.floor(Math.random()*100)
					view.ontick = function(){
						this.timer += 1
						if(this.timer == 100){
							this.timer = 0
							// Jump
							//console.log(this.body.GetMass())
							this.body.ApplyImpulse(vec(0, -100), this.body.GetWorldCenter())
						}
					}
					
					break
				case 'nyan':
					view.body.SetLinearVelocity(vec(-10, 0))
					break
				case 'octo':
					var pos = view.body.GetPosition()
					view.x0 = pos.x
					view.y0 = pos.y
					view.rangex = view.rangex || 0
					view.rangey = view.rangey || 100
					view.T = 5 || view.T
					view.omega = 2*Math.PI/(view.T*FPS)
					view.timer = Math.floor(view.T*FPS*Math.random())
					view.body.jelly = true
					view.ontick = function(){
						this.timer += 1
						var vx = - this.rangex * this.omega * Math.sin(this.omega * this.timer)
						var vy = - this.rangey * this.omega * Math.sin(this.omega * this.timer)
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
			console.log('I don\'t understand: ' + type)
		}
	
	}

	window.lvl_script = lvl_script


})(window)