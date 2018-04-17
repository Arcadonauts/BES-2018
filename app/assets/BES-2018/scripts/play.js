window.play = (function(){
	var DEBUG = true 
	var y_axis = p2.vec2.fromValues(0, 1)
	var x_axis = p2.vec2.fromValues(1, 0)
	
	var lvl = {
		init: function(){
			this.lvl = window.level_code
			if(this.lvl && typeof this.lvl.init === 'function'){
				this.lvl.init()
			}
		}, 
		none: function(){
			// This space intentionally left blank.
		},
		get: function(parent, func){
			if(this.lvl && this.lvl[parent] && this.lvl[parent][func] && typeof this.lvl[parent][func] === 'function'){
				return this.lvl[parent][func]
			}else{
				return this.none 
			}
		},
		contact:{
			begin: function(bodyA, bodyB, shapeA, shapeB, equation){
				lvl.contact.on('begin_contact', bodyA, bodyB, shapeA, shapeB, equation)
			},
			end: function(bodyA, bodyB, shapeA, shapeB, equation){
				lvl.contact.on('end_contact', bodyA, bodyB, shapeA, shapeB, equation)
			},
			on: function(flavor, ba, bb, sa, sb, equation){
				var sprite_a = ba && ba.parent && ba.parent.sprite
				var sprite_b = bb && bb.parent && bb.parent.sprite

				if(sprite_a && sprite_b){
					if(sprite_a.key === 'bg' || sprite_b.key === 'bg'){
						
					}else{
						var key_a = sprite_a.player ? 'player' : sprite_a.key 
						var key_b = sprite_b.player ? 'player' : sprite_b.key 
						
						lvl.get(key_a, flavor)(sprite_a, sprite_b, equation)
						lvl.get(key_b, flavor)(sprite_b, sprite_a, equation)
					}
				}
			},
			
		}
	}
	
	var no_copy = [
		'offsetY', 
		'centerX', 
		'offsetX', 
		'img_width', 
		'height', 
		'width',
		'img_height', 
		'scale', // scale (float) will overide sprite.scale (Point)
		'frame_rate', 
		'centerY', 
		'frames', 
		'r', 
		//'type'
	]
	
	function parse(string){
		var float_re = '([+-]?(?:[0-9]*[.])?[0-9]+)'
		var rand = new RegExp('^\\s*' + float_re + '\\s*:\\s*' + float_re + '\\s*$')
		if((typeof string) !== 'string'){
			//console.log(string)
			return string
		}else if(string.match(rand)){
			var match = string.match(rand)
			var min = parseFloat(match[1])
			var max = parseFloat(match[2])
			
			return Math.random()*(max - min) + min 
			
		}	 
		if(string.toLowerCase() === 'true'){
			return true 
		}
		if(string.toLowerCase() === 'false'){
			return false 
		}
		
		if(parseFloat(string) == string){
			return parseFloat(string)
		}
		
		return string 
	}

	function deep_update(old, _new, no_copy, parse){
		var obj, split
		for(k in _new){
			if(no_copy.indexOf(k) > -1){
				continue
			}  
			
			split = k.split('.')
			obj = old  
			for(var i = 0; i < split.length; i++){
				if(i === split.length - 1){
					obj[split[i]] = parse ? parse(_new[k]) : _new[k]
				}else{
					obj = obj[split[i]]
				}
			}
		}
	}
	
	var key = {
		binding: {
			jump: ['SPACEBAR', 'SHIFT', 'UP', 'W'],
			left: ['A', 'LEFT'],
			right: ['D', 'RIGHT']
		},
		down: function(code){
			for(var i = 0; i < this.binding[code].length; i++){
				if(play.game.input.keyboard.isDown(Phaser.Keyboard[this.binding[code][i]])){
					return true
				}
			}
			return false 
		}
	}
	
	function can(){
		return {
			init: function(sprite){
				sprite.can = this
				this.sprite = sprite 
				if(sprite.climb === undefined){
					sprite.climb = .7
				}
				this.updater = play.game.add.sprite(0, 0)
				var that = this 
				this.updater.update = function(){
					that.onground = that.grounded()
					if(that.onground){
						that.timer = that.max_time 
					}else{
						that.timer -= 1 
					}
				}
				this.onground = false 
				this.timer = 0 
				this.max_time = sprite.jump_timer || 12 
			},
			do_the_thing: function(axis, test, rv, ignore_dyn){
				for(var i = 0; i < play.game.physics.p2.world.narrowphase.contactEquations.length; i++){
					var c = play.game.physics.p2.world.narrowphase.contactEquations[i]
					if(c.bodyA === this.sprite.body.data || c.bodyB === this.sprite.body.data){
						var d = p2.vec2.dot(c.normalA, axis)
						var player, other 
						if(c.bodyA === this.sprite.body.data){
							player = c.bodyA 
							other = c.bodyB
							d *= -1
						}else{
							player = c.bodyB
							other = c.bodyA 
						}
						if(ignore_dyn && other.type === Phaser.Physics.P2.Body.DYNAMIC){
							continue 
						}
						//console.log(d)
						if(test(d)){
							return !rv 
						}
						
					}
				}
				return rv 
			},
			jump: function(){
				return this.onground || this.timer > 0 
			},
			grounded: function(){
				return this.do_the_thing(y_axis, d => d > .5, false, false)
			},
			left: function(ignore_dyn){
				return this.do_the_thing(x_axis, d => d < -this.sprite.climb, true, ignore_dyn)
			},
			right: function(ignore_dyn){
				return this.do_the_thing(x_axis, d => d > this.sprite.climb, true, ignore_dyn)
			},
		}
	}
	
	function add_physics(sprite, s, game){
		var w = sprite.width 
		var h = sprite.height 
		
		game.physics.p2.enable(sprite, play.debug || DEBUG)
		
		var x0 = sprite.left
		var y0 = sprite.top 
		var rect
		if(s.r){ // circle 
			var x =  s.centerX
			var y =  s.centerY
			sprite.anchor.set(x/w, y/h)
			
			sprite.body.setCircle(s.r)
		}else{ // rectangle
			var x = s.offsetX + s.width/2 
			var y = s.offsetY + s.height/2 
			sprite.anchor.set(x/w, y/h)
			
			sprite.body.setRectangle(s.width, s.height)
		}
		var x1 = sprite.left
		var y1 = sprite.top
		sprite.body.x -= x1 - x0 
		sprite.body.y -= y1 - y0
	}
	
	function scale_and_center(sprite, s){
		sprite.scale.set(s.scale)
		sprite.x += sprite.width/2
		sprite.y += sprite.height/2 
	}
	
	function add_animation(sprite, s){
		if(s.frames  > 1){
			var loop = sprite.animations.add('loop')
			sprite.animations.play('loop', s.frame_rate || 12, true)
		}
	}
	
	function add_lvl_code(sprite, key){
		
		var copy = ['preupdate', 'intraupdate', 'postupdate', 'init', 'ondeath']
		copy.forEach(s => sprite[s] = lvl.get(key, s))
		
		sprite.update = function(){
			this.preupdate()
			this.intraupdate()
			this.postupdate()
		}
		sprite.events.onKilled.add(()=>sprite.ondeath())
		/*
		sprite.body.onBeginContact.add(lvl.get(key, 'begin_contact'))
		sprite.body.onEndContact.add(lvl.get(key, 'end_contact'))
		*/
		
		
		
	}
	
	function face(dir){
		var sx = Math.abs(this.scale.x)
		var sy = this.scale.y 
		this.scale.set(dir * sx, sy)
	}
	
	var audio = {
		sounds: {},
		init: function(data){
			for(var k in data){
				if(data.hasOwnProperty(k) && data[k]){
					this.sounds[k] = play.game.add.audio(k)
					this.sounds[k].allowMultiple = false 
				}
			}
		},
		play: function(key){
			if(this.sounds[key]){
				if(!this.sounds[key].isPlaying){
					this.sounds[key].play()
				}
			}else{
				if(play.debug){
					console.warn('Unknown Sound Key: ' + key )
				}
			}
			
		}
	}
	
	var types = {
		dynamic: function(sprite, s){
			sprite.dynamic = true 
		},
		floating: function(sprite, s){
			sprite.body.kinematic = true 
			sprite.timer = 0 
			sprite.intraupdate = function(){
				var a_mul = 100
				
				var bx = Math.PI*2/this.period_x 
				var cx = -this.shift_x*bx 
				var ax = this.amplitude_x * bx * a_mul
				
				
				var by = Math.PI*2/this.period_y 
				var cy = -this.shift_y*by 
				var ay = this.amplitude_y * by * a_mul
				
				this.timer += 1 
				//console.log([ax, bx, cx, ay, by, cy])
				
				if(this.period_x !== 0){
					this.body.velocity.x = ax * Math.sin(bx * this.timer + cx)
				}
				if(this.period_y !== 0){
					this.body.velocity.y = ay * Math.sin(by * this.timer + cy)
				}
				
			}
		},
		ghost: function(sprite, s){
			sprite.body.kinematic = true 
			sprite.body.data.shapes.forEach(s => s.sensor = true) 
		},
		player: function(sprite, s, data){
			sprite.player = true 
			play.game.camera.follow(sprite)
			var xbuff = .4
			var ybuff = .4
			play.game.camera.deadzone = new Phaser.Rectangle(
				play.game.width*xbuff, 
				play.game.height*ybuff, 
				play.game.width*(1-2*xbuff), 
				play.game.height*(1-2*ybuff)
			)
			
			
			sprite.body.fixedRotation = true 
			sprite.standing = 0 
			sprite.climb = .7
			
			
			deep_update(sprite, data, [])
			
			play.er = sprite 
			sprite.face = face 
			
			can().init(sprite)
			
	
			sprite.lose = function(){
				if(this.update === this.lost) return 
				
				this.body.velocity.x = 0
				this.body.velocity.y = -this.jump 
				this.body.data.shapes.forEach(s => s.sensor = true) 
				//this.body.fixedRotation = false 
				this.update = this.lost 
				this.lost_timer = 100 
				
				audio.play('lose')
			}
			
			sprite.lost = function(){
				/*
				if(this.lost_timer > 0){
					this.lost_timer -= 1
				}else{
					this.game.state.start('play', true, false, this.game)
				}
				*/
				if(this.y > this.game.world.height + 150){
					this.game.state.start('play', true, false, this.game)
				}
			}
			
			sprite.intraupdate = function(){
				
				if(key.down('jump')){
					if(this.can.jump()){
						this.body.moveUp(this.jump)
						audio.play('jump')
					}
				}
				if(key.down('left') && key.down('right')){
					this.body.velocity.x *= this.friction
				}else if(key.down('left')){
					if(this.can.left(true)){
						this.body.moveLeft(this.speed)
						this.face(-1)
					}
				}else if(key.down('right')){
					if(this.can.right(true)){
						this.body.moveRight(this.speed)
						this.face(1)
						//this.scale.set(1, 1)
					}
				}else{
					this.body.velocity.x *= this.friction
				}
			}
			
			
			
			return sprite
		},
		walk: function(sprite, s){
			sprite.body.fixedRotation = true 
			can().init(sprite)
			sprite.face = face 
			sprite.jump_timer = 0 
			
			var dx, dy
			if(s.r){
				dx = s.r 
				dy = s.r 
			}else{
				dx = s.width/2 
				dy = s.height/2
			}
			var w = 10
			var h = 20
			sprite.left_foot = sprite.body.addRectangle(w, h, -dx, w/2+dy)
			sprite.right_foot = sprite.body.addRectangle(w, h, dx, w/2+dy)
			//console.log([sprite.body.data.shapes[0].width, sprite.body.height, sprite.width, sprite.height])
			sprite.left_foot.sensor = sprite.right_foot.sensor = true 
			sprite.left_foot.touching = sprite.right_foot.touching = 0 
			sprite.left_foot.foot = sprite.right_foot.foot = true 
			sprite.body.onBeginContact.add( function(b1, b2, s1, s2, contact){
				if(s1.foot){
					s1.touching += 1
				}
			})
			
			sprite.body.onEndContact.add( function(b1, b2, s1, s2, contact){
				if(s1.foot){
					s1.touching -= 1
				}
			})
			
			
			sprite.intraupdate = function(){
				this.jump_timer += 1 
				this.body.velocity.x = this.speed 
				//console.log([sprite.speed, sprite.can.right()])
				/*
				if(this.can.jump()){
					this.tint = 0xff0000
				}else{
					this.tint = 0x0000ff
				}*/
				if(this.jump === 0 && this.fall === false && this.can.jump()){
					if(this.speed > 0 && this.right_foot.touching === 0){
						this.speed = -this.speed 
						this.face(-1)
					}
					if(this.speed < 0 && this.left_foot.touching === 0){
						this.speed = -this.speed 
						this.face(1)
					}
				}
				if(this.speed > 0 && ! this.can.right(false)){
					this.speed = -this.speed 
					this.face(-1)
				}
				if(this.speed < 0 && ! this.can.left(false)){
					this.speed = -this.speed 
					this.face(1)
				}
				if(this.jump_timer > this.jump_interval && this.can.jump()){
					this.body.moveUp(this.jump)
					//console.log(this.key + ' jump!')
					this.jump_timer = 0 
				}
			}
		}
	}
	

	var play = {
		no_copy: no_copy,
		init: function(game, callback, debug){
			this.callback = callback // function 
			this.game = game // Phaser.Game object
			this.debug = debug || DEBUG // bool 
		},
		create: function(){
			
			lvl.init()
			
			if(this.debug && window.le && window.le.types){
				window.le.types.forEach(function(t){
					if(types[t.type.toLowerCase()] === undefined){
						console.warn('Unrecognized type: ' + t.type)
					}
				})
			}
			
			var game = this.game 
			this.create_bg(game)
			
			var sprites = game.data.sprites.filter(Boolean)
			sprites.sort( (x, y) => x.data.depth > y.data.depth ? 1 : -1 )
			var data, s, sprite 
			for(var i = 0; i < sprites.length; i++){
				data = sprites[i]
				sprite = game.add.sprite(data.x, data.y, data.key)
				s = data.data
								
				scale_and_center(sprite, s)
				add_physics(sprite, s, game)
				
				// copy data onto sprite 
				deep_update(sprite, s, no_copy, parse)
				
				if(types[s.type] === undefined){
					if(this.debug){
						throw('"' + s.type + '" is not a valid type.')
					}else{
						s.type = 'dynamic'
					}
				}
				
				add_lvl_code(sprite, s.type === 'player' ? 'player' : data.key)
				types[s.type](sprite, s, game.data.player)
				add_animation(sprite, s)
				
				sprite.init()
			}
			
			game.physics.p2.onBeginContact.add(lvl.contact.begin)
			game.physics.p2.onEndContact.add(lvl.contact.end)
			
			audio.init(game.data.audio)
			
			this.audio = audio 
			this.lvl = lvl 
			
			
			
			if(this.callback){
				this.callback()
			}
		},
		create_bg: function(game){
			var bg = game.add.sprite(0, 0, 'bg')
			
			game.world.setBounds(0, 0, bg.width, bg.height)
			
			game.physics.startSystem(Phaser.Physics.P2JS);
			
			game.physics.p2.enable(bg, this.debug)
			game.physics.p2.gravity.y = 1000 
			
			bg.body.clearShapes();
			bg.body.loadPolygon(null, game.data.terrain.filter(Boolean))
			bg.body.static = true 
			
			bg.body.x += bg.width/2
			bg.body.y += bg.height/2
		},
		render: function(){
			var game = this.game
			
			var zone = game.camera.deadzone;
			if(zone){
				//game.context.fillRect(zone.x, zone.y, zone.width, zone.height);
			}
			
		}
	}

	return play 
})()
