console.log('Level two script loaded');
/*
Coconuts should do damage
You turn red like the uniboar
faster Boats
more coconuts at end
more coconuts on second boat
space bar to jump
slower uniboar/ faster cannon 

uniboar should change directions 
add on another coconut throwing tree
coconut should explode 3 seconds after it falls if not put in cannon
less water creatures
add sound affects!


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

	window.bounce = vec(8, -48)
	
	function y_sort(lvl){
		// In Place!
		lvl.sort(function(a, b){
			var by = parseInt(b.y) || 1
			var ay = parseInt(a.y) || 1
			
			if(a.z < 0){
				return -1
			}
			if(b.z < 0){
				return 1
			}
			
			return ay - by
		})
	}
	
	function make_kid(kid){
		kid.src_x = 64*4*Math.floor(Math.random()*3)
		kid.src_y = 64*3*Math.floor(Math.random()*5)
		
		kid.body.SetFixedRotation(true)
		kid.body.kid = true
		kid.body.fed = 0
		
		//kid.body.m_type = b2.Body.b2_kinematicBody
		kid.body.SetLinearVelocity(vec(8*(2*Math.random() - 1),0))
		var fix = kid.body.GetFixtureList()
		fix.SetRestitution(1.2)
		
		
		kid.ontick = function(){
			if(this.body.fed){
				this.body.SetLinearVelocity(vec(0, -8))
				if(this.body.GetPosition().y < -192/SCALE){
					this.kill()
				}
			}else{
				if(this.body.GetLinearVelocity().y > window.bounce.x){
					this.body.ApplyImpulse(vec(0, window.bounce.y), this.body.GetPosition())
				}
			}
			this.t = this.body.fed
		}
		
		y_sort(stage.children)
		
	}
	
	function make_food(food){
		food.src_x = 64*Math.floor(Math.random()*16)
		food.src_y += 64*Math.floor(Math.random()*2)
		food.body.food = true
		
		food.ontick = function(){
			if(this.body.GetPosition().y < -1 || this.body.dead){
				stage.missed += 1
				this.kill()
			}
		}
		
		food.body.m_type = b2.Body.b2_kinematicBody
		food.body.SetAngularVelocity(5*(2*Math.random() - 1))
		
		food.z = 5
		y_sort(stage.children)
	}
	
	var scripts = {
		ontick: function(){
			stage.timer += 1
			if(!stage.over && stage.timer % 120 === 0){
				var kid = projectiles.kid.fire(Math.random()*canvas.width/SCALE, -192/SCALE, 0, 0)
				make_kid(kid)
				
			}
			
		},
		lvl_init: function(checkpoint){
			stage.timer = 0
			stage.fed = stage.missed = 0
			keydown.space = false
			
			stage.game_over = function(){
				var text = [['Game Over', 86, 100],
							['Kids Fed: ' + stage.fed, 48, 190],
							['Food Wasted: ' + stage.missed, 48, 240]]
				for(var i = 0; i < text.length; i++){
					t = new createjs.Text(text[i][0], "bold " + text[i][1] + "px Arial");
					t.x = 320 - t.getBounds().width/2
					t.y = text[i][2]
					//t.color = 'white'
					stage.addChild(t)
				}
			
				
				stage.over = true
				
				stage.game_over = function(){
					if(keydown.space){
						console.log('restart')
						init()
					}
				}
			}
			
			var begin_helper = function(fix_a, fix_b){
				var a = fix_a.GetBody()
				var b = fix_b.GetBody()
				if(a.kid && b.food){
					a.fed = true
					stage.fed += 1
					b.dead = true
				}else if(a.kid && b.player){
					stage.game_over()
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
			
		},
		update: function(that, body_def, fix_def){
			switch(that.view.update){
				case 'bear':
					fix_def.friction = 2
					//body_def.type = b2.Body.b2_kinematicBody
					//fix_def.isSensor = true
					break
				default:
			}
			
		},
		init: function(view, width, height){
			switch(view.update){
				
				case 'bear':
					view.body.player = true
					view.body.IsSleepingAllowed(false)
					view.body.SetFixedRotation(true)
					bear = view
					view.v = 10
					view.down = false
					view.cooling = 0
					view.cool_down = 20
		
					view.ontick = function(){
						if(stage.over){
							return
						}
						var left = keydown.left || keydown.A
						var right = keydown.right || keydown.D
						var fire = keydown.up || keydown.W || keydown.space
						pos = this.body.GetPosition()
						if(left){
							this.body.ApplyImpulse(vec(-this.v, 0), pos)
						}
						if(right){
							this.body.ApplyImpulse(vec(this.v, 0), pos)
						}
						if(fire && !this.down && this.cooling <= 0){
							var food = projectiles.food.fire(pos.x, pos.y - 3, 15, 90)
							make_food(food)
							
							this.cooling = this.cool_down
						}
						if(this.cooling > 0){
							this.cooling -= 1
						}
						this.down = fire
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