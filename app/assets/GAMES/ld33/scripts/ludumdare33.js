//(function(){
	window.dare = {
		onload: function(){
			var dir = "/static/GAMES/ld33/"
			
			this.canvas = document.getElementById('canvas')
			this.context = canvas.getContext('2d')
			this.width = this.canvas.width = 1600
			this.height = this.canvas.height = 900
			this.tw = 64
			
			this.loaded = 0
			this.load_max = 0
			
			this.img = document.createElement('img')
			this.img.src = dir + "/img/ludumdare33.png"
			this.img.onload = this.loader()
			
			this.bg1_img = document.createElement('img')
			this.bg1_img.src = dir + "/img/ludumdare33bg.png"
			this.bg1_img.onload = this.loader()
			
			this.bg2_img = document.createElement('img')
			this.bg2_img.src = dir + "/img/ludumdare33bg2.jpg"
			this.bg2_img.onload = this.loader()
			
			this.high_score = 0
			
			this.audio = make_audio()
			
			this.init()
			tick()
		},
		loader: function(){
			this.load_max += 1
			var dare = this
			return function(){
				dare.loaded += 1
			}
		},
		init: function(){
			this.updateables = [this.audio]
			this.drawables = []
			this.type = undefined
			
			this.villager = undefined 
			this.speed = 2
			this.gap = 0
			this.t = 0
			this.villager_count = 15
			this.p_down = false 
			
			for(var i = 0; i < this.villager_count; i++){
				make_villager()
			}
			this.update = this.loading
			
			this.player = make_player()
			var grass = make_grass(256, this.height)
			grass.make_child = function(){}
			var grass = make_grass(grass.x + grass.width, this.height)
	
			make_block(dare.width*.75, dare.height*.25)
	
			this.bg1 = make_bg(this.bg1_img, .6)
			this.bg2 = make_bg(this.bg2_img, .3)
			
		},
		score: {deaths: 0,
				fired: 0,
				holed: 0,
				fell: 0,
				sharked: 0,
				add: function(villager){
					this.deaths += 1
					if(villager.scorched){
						this.fired += 1
					}
					if(villager.hole){
						this.holed += 1
					}
					if(villager.sharked){
						this.sharked += 1
					}
				},
				reset: function(){
					this.deaths = this.fired = this.sharked = this.holed = this.fell = 0
				}
		},
		diff: function(t){
			t = t || this.t 
			
			this.speed = 3 + .001*t
			this.gap = .02*t
			this.block_prob = Math.min(.000001*t, .01) 
			
		},
		draw: function(){
			this.canvas.width = this.canvas.width
			this.bg2.draw()
			this.bg1.draw()
			
			if(this.update === this.game_over){
				return 
			}
			var keepers = []
			for(var i = this.drawables.length - 1; i >= 0; i--){
				this.drawables[i].draw()
				if(!this.drawables[i].dead){
					keepers.unshift(this.drawables[i])
				}
			}
			this.drawables = keepers
			
			if(this.update === this.pause){
				this.context.font = 'bold italic 90pt serif';
				this.context.textBaseline = 'bottom';
				this.context.textAlign = "center";
				this.context.fillStyle = 'white'
				this.context.fillText('~Pause~', this.width/2, this.height/3)
			}
			
			this.audio.draw()
		},
		menu: function(){
			if(keydown.E && !this.e_down){
				this.update = this.cutscene
				dare.audio.play('blip')
			}
			var h = 48
			this.context.fillStyle = 'white'
			this.context.font = 'bold italic ' + h + 'pt serif';
			this.context.textBaseline = 'bottom';
			this.context.textAlign = "left";
			var text = 'WASD to move. S to dismount unicycle. E to begin'.split('.')
			for(var i = 0; i < text.length; i++){
				
			this.context.fillText(text[i] + '.', 
							       this.width/16, this.height/6 + h*i*1.5)
			}
			this.e_down = keydown.E
		},
		loading: function(){
			if(this.loaded >= this.load_max){
				this.update = this.menu
			}else{
				this.context.fillStyle = 'black'
				this.context.fillRect(0,0,dare.width,dare.height)
				
				this.context.fillStyle = 'white'
				this.context.font = 'bold italic 90pt serif';
				this.context.textBaseline = 'bottom';
				this.context.textAlign = "center";
				this.context.fillText('Loading...', this.width/2, this.height/2)
				
				var w = this.width*.75
				var h = .1*this.height
				var x = this.width/2 - w/2
				var y = this.height/2 + h/2
				this.context.strokeStyle = 'white'
				this.context.strokeRect(x, y, w, h)
				this.context.fillRect(x, y, w*this.loaded/this.load_max, h)
			
			}
		},
		pause: function(){
			this.audio.music.pause()
			if(keydown.P && ! this.p_down){
				this.update = this.play
			}
			
			this.p_down = keydown.P
		},
		cutscene: function(){
			if(!this.villager){
				this.villager = make_villager()
				this.villager.x = -this.villager.width/2
				this.villager.y = this.height/2 - this.villager.height/2
				this.villager.move = villager_cutscene
			}
			this.villager.update()
			
		},
		game_over: function(){
			this.audio.music.pause()
			this.audio.music.currentTime = 0;
			if(!this.type){
				var scores = [['Villagers Eluded:', this.score.deaths, 1],
							  ["Villagers Lost to Dimensional Rift:", this.score.holed, 2],
							  ["Villagers Consumed by Sea Beast:", this.score.sharked, 4],
							  ["Villagers Scorched:", this.score.fired, 8]
							  ]
				var strings = []

							   
				var strings = []
				var tot = 0
				for(var i = 0; i < scores.length; i++){
					strings.push([scores[i][0],
								  '    ',
								  scores[i][1],
								  ' x ',
								  scores[i][2],
								  ' = ',
								  scores[i][1]*scores[i][2],
								 ])
					tot += scores[i][1]*scores[i][2]
				}
				
				
				strings.push(['',        '', '', '', '', '', ''])
				strings.push(['Total: ', '', '', '', '', '', tot])
				strings.push(['',        '', '', '', '', '', ''])
				
				if(tot > this.high_score){
					this.high_score = tot 
					strings.push(['New High Score!', '', '', '', '', '', ''])
				}else{
					strings.push(['High Score: ', '', '', '', '', '', this.high_score])
				}
				strings.push(['',        '', '', '', '', '', ''])
				strings.push(['Press E to try again', '', '', '', '', '', ''])
				this.score.reset()
				this.type = make_type(strings)
			}
			
			this.type.draw()
			
	
			
			if(keydown.E && ! this.e_down){
				dare.audio.play('blip')
				if(this.type.done){
					this.init()
				}else{
					this.type.get_to_the_point()
				}
			}
			this.e_down = keydown.E
			
		},
		play: function(){
			this.audio.music.play()
			this.t += 1
			this.diff()
			
			if(this.block_prob > Math.random()){
				make_block()
			}
			
			var keepers = []
			for(var i = 0; i < this.updateables.length; i++){
				this.updateables[i].update()
				if(!this.updateables[i].dead){
					keepers.push(this.updateables[i])
				}
			}
			this.updateables = keepers
			
			if(keydown.P && !this.p_down){
				this.update = this.pause
			}
			this.p_down = keydown.P
		},
	}
	
	function draw(){
		var tw = dare.tw
		var wigglex = (this.wigglex || 0)*(2*Math.random() - 1)
		var flip = this.player && this.flip ? 4 : 0
		var t = isNaN(this.t) ? 0 : this.t 
		var frames = this.frames || 1
		
		dare.context.drawImage(dare.img, 
								(this.src_x + this.src_w*t + flip)*tw, 
								this.src_y*tw, 
								this.src_w*tw, 
								this.src_h*tw, 
								this.x - this.src_w/2*tw + wigglex, 
								this.y - tw*this.src_h/2, 
								this.src_w*tw, 
								this.src_h*tw
								)
		if(!isNaN(this.t)){
			this.t += 1
			//if(frames > 1) console.log(t, this.t)
			this.t %= this.frames
		}
		/*						
		dare.context.strokeRect(this.x - this.width/2, this.y - this.height/2, 
							   this.width, this.height)
		//*/
	}
	
	function hit_test(smaller, larger){
		return (Math.abs(larger.x - smaller.x) < (larger.width + smaller.width)/2
		     && Math.abs(larger.y - smaller.y) < (larger.height + smaller.height)/2)
	}
	
	function choice(list){
		return list[Math.floor(Math.random()*list.length)]
	}
	
	function pad(string, what, how_much, right){
		for(var i = 0; i < how_much - string.length; i++){
			if(right){
				string = string + what
			}else{
				string = what + string
			}
		}
		return string 
	}
	
	// @z
	
	function make_z(){
		var obj = {draw: z_draw,
					update: z_update,
					src_x: 27,
					src_y: 0,
					src_w: 1,
					src_h: 1,
					t: 0,
					t_max: 240
					}
					
		return obj 
	}
	
	function z_draw(body){
		this.update()
		
		var z_count = 3
		var dt = this.t_max/z_count
		
		for(var i = 0; i < z_count; i++){
			var t = (this.t + i*dt) % this.t_max
			var scale = t/this.t_max
			var size = (2*scale)
			var pos = (.5+2*scale)
			var alpha = Math.sqrt(1 - scale*scale)
		
			var tw = dare.tw
			dare.context.globalAlpha = alpha
			dare.context.drawImage( dare.img, 
									this.src_x*tw,
									this.src_y*tw,
									this.src_w*tw,
									this.src_h*tw,
									body.x + body.width*pos, 
									body.y - body.height*pos + body.height/2, 
									this.src_w*tw*size, 
									this.src_h*tw*size)
			dare.context.globalAlpha = 1
		}
	}
	
	function z_update(){
		this.t += 1
		this.t %= this.t_max
	}
	
	// @audio
	function make_audio(){
		var dir = "/static/GAMES/ld33/audio/"
		var sounds = ['blip', 'grumble', 'bite', 'bump', 'powerup','scorch', 'thump']
		var obj = {play: play_audio,
				   sounds: {},
				   draw: draw_audio,
				   update: update_audio,
				   effect_mute: false,
				   music_mute: false,
				   state: 0,
				   }
		
		obj.music = document.createElement('audio')
		obj.music.src = dir + 'runforit.mp3'
		obj.music.volume = .4
		obj.music.loop = true
		
		for(var i = 0; i < sounds.length; i++){
			var el = document.createElement('audio')
			el.src = dir + sounds[i] + '.mp3'
		
			//el.onload = dare.loader()
			el.volume = sounds[i] === 'bump' ? .6 : .4 
			
			obj.sounds[sounds[i]] = el
			
		}
		
		return obj 
	}
	
	function play_audio(sound){
		if(this.effect_mute){
			return
		}
		if(this.sounds[sound]){
			this.sounds[sound].play()
		}
	}
	
	function draw_audio(){
		var h = 32
		dare.context.fillStyle = 'rgba(255, 255, 255, .5)'
		dare.context.font = "bold italic " + h + "pt serif";
		dare.context.textBaseline = 'bottom';
		dare.context.textAlign = "left";
		var op = "Press M to " + (this.music_mute ? "un" : "") + "mute music"
		dare.context.fillText(op, 10, dare.height-10 - 1.5*h)
		
		var op = "Press N to " + (this.effect_mute ? "un" : "") + "mute sound effects"
		dare.context.fillText(op, 10, dare.height-10)
	}
	
	function update_audio(){
		if(this.music_mute){
			this.music.pause()
		}
		this.music.muted = this.music_mute
		
		
		if(keydown.M && !this.m_down){
			this.music_mute = !this.music_mute
		}
		if(keydown.N && !this.n_down){
			this.effect_mute = !this.effect_mute
		}
		
		this.m_down = keydown.M
		this.n_down = keydown.N
	}
	
	// @type
	function make_type(strings){
		// strings should be a list of lists of strings 
		var font_size = 48
		dare.context.font = 'bold italic ' + font_size + 'pt serif';
		
		var tot = 0
		
		var col_widths = []
		for(var i = 0; i < strings[0].length; i++){
			col_widths[i] = 0
			for(var j = 0; j < strings.length; j++){
				strings[j][i] += ''
				col_widths[i] = Math.max(col_widths[i], dare.context.measureText(strings[j][i]).width)
				tot += strings[j][i].length
			}
		}
		
		var lefts = [dare.width*.1]
		
		for(var i = 0; i < col_widths.length; i++){
			lefts.push(lefts[i] + col_widths[i])
		}
		
		var obj = {	font: dare.context.font,
					lefts: lefts,
					strings: strings,
					draw: type_draw,
					t: 0,
					dy: font_size*1.5,
					y0: dare.height*.2,
					get_to_the_point: function(){this.t = Infinity},
					tot: tot
					}
		return obj 
	}
	
	function type_draw(){
		this.t += 1
		var count = 0
		dare.context.font = this.font 
		dare.context.textBaseline = 'bottom';
		dare.context.fillStyle = 'white'
		dare.context.textAlign = "left";
		
		for(var i = 0; i < this.strings.length; i++){
			for(var j = 0; j < this.strings[i].length; j++){
				var string = this.strings[i][j]
				var x = this.lefts[j+1] - dare.context.measureText(string).width
				var y = this.y0 + this.dy*i
				if(count + string.length > this.t){
					dare.context.fillText(string.slice(0, this.t - count), x, y)
					dare.audio.play('thump')
					return 
				}else{
					dare.context.fillText(string, x, y)
					count += string.length
				}
			}
		}
		if(this.t > this.tot){
			this.done = true
		}else{
			
		}
		
	}
	
	// @bubble
	function make_bubble(){
		var obj = {text: exclaim(),
				   src_x: 0,
				   src_y: 15,
				   src_w: 25,
				   src_h: 5,
				   x: dare.width/2,
				   y: 160,
				   draw: bubble_draw,
				   width:25*64,
				   height:5*64,
				}
		
		dare.drawables.push(obj)
		return obj
	}
	
	function bubble_draw(){
		draw.call(this);
		dare.context.font = 'bold italic 84pt serif';
		dare.context.textBaseline = 'bottom';
		dare.context.textAlign = "center";
		dare.context.fillText(this.text, this.x, this.y)
	}

	
	// @villager
	function exclaim(){
		var verb = ['Kill', 'Get', 'Destroy', 'Vanquish', 'Conquer']
		var article = ['the', 'that']
		var adjective = ['smelly', 'nasty', 'sleeping', 'adorable', 'horrid', 'beastly',
						 'awful', 'evil', 'terrible']
		var noun = ['monster', 'beast', 'thing', 'creature']
		
		var op = ''
		op += choice(verb)
		op += ' '
		op += choice(article)
		op += ' '
		op += choice(adjective)
		op += ' '
		op += choice(noun)
		op += '!'
		return op 
		
	}
	
	function make_villager(){
		var obj = {	src_x: 22 + Math.floor(Math.random()*2),
					src_y: 10 + Math.floor(Math.random()*2),
					src_w: 1,
					src_h: 1,
					width: 32,
				    height: 64,
					update: villager_update,
					draw: draw,
					x: 0 - 32 - Math.random()*128,
					y: 0 + Math.random()*256,
					g: 2,
					jump_x: 5 + Math.random(),
					jump_y: -20 - Math.random()*6,
					vx: 0,
					vy: 0,
					fr: .9,
					max_dist: Math.random()*dare.width*.8,
					falling: false,
					move: villager_move,
					villager: true,
					kill: kill_villager
					}

		dare.updateables.push(obj)
		dare.drawables.unshift(obj)
		return obj
	}
	
	function kill_villager(){
		if(this.dead){
			return
		}
		this.dead = true
		make_villager()
		dare.score.add(this)
	}
	
	function villager_cutscene(){
		if(this.x < 0){
			
			this.vx = 5
			this.vy = -24
		}else if(this.falling){
			
			this.vy += this.g
		}else if(!this.bubble){
			dare.audio.play('powerup')
			this.vx = this.vy = 0
			this.bubble = make_bubble()
			this.spoke = 1
		}else if(this.spoke < 5){
		
			this.spoke += 1
		}else if(keydown.E){
			dare.audio.play('blip')
			this.bubble.dead = true
			this.move = villager_move
			dare.player.wake_up()
			dare.update = dare.play
		}
		
		this.x += this.vx
		this.y += this.vy 
	}
	
	function villager_move(){
		if(this.y > dare.height){
			this.kill()
		}
		
		
		if(this.falling){
			this.vy += this.g
		}else{
			this.vy = this.jump_y
			this.vx = this.jump_x*constrain(1 - this.x/this.max_dist, 0, 1)
		}
		
		this.x += this.vx //- (this.falling ? 0 : dare.speed)
		this.y += this.vy 
		
		//this.x -= dare.speed
	}
	
	function villager_update(){

						
		this.falling = true
		for(var i = 0; i < dare.updateables.length; i++){
			var other = dare.updateables[i]
			if(this.villager && other.power_up && hit_test(this, other)){
				if(other.shark){
					other.chomp(this)
				}else{
					other.touched = this
				}
			}
			if(other.ground && hit_test(this, other)){
				other.touched = this
				var last = point(this.x - this.vx, this.y - this.vy)
				if(above(other, last)){
					
					this.falling = false 
					this.y = other.y - other.height/2 - this.height/2
					this.jump = this.jump_default 
				}else if(below(other, last)){
					this.vy *= -this.fr
					this.y = other.y + other.height/2 + .6*this.height	
				}else if(right_of(other, last)){
					this.vx *= -this.fr
					this.x = other.x + other.width/2 + this.width/2
					
				}else if(left_of(other, last)){
					this.vx *= -this.fr
					this.x = other.x - other.width/2 - this.width
				
				}else{
					//console.log(other, last)
				}
			}
		}
		
		this.move()
	}
	
	// @ground
	function make_ground(){
		var rand = Math.random()
		if(rand < .4){
			make_grass()
		}else if(rand < .8){
			make_sand()
		}else{
			make_gap()
		}
	}
	
	// @block
	function make_block(x,y){
		var power_ups = [make_sheep, make_shark, make_fire, make_black_hole]
		var obj = {x: x | dare.width + 128,
				   y: y | dare.height/4,
				   width: 128,
				   height: 128,
				   src_x: 22,
				   src_y: 6,
				   src_w: 2,
				   src_h: 2,
				   ground: true,
				   draw: draw_block,
				   make_child: function(){},
				   update: update_block,
				}
		obj.power_up = choice(power_ups)(obj),
		
		dare.drawables.push(obj)
		dare.updateables.push(obj)
		
		return obj
	}
	
	function draw_block(){
		draw.call(this.power_up)
		draw.call(this)
	}
	
	function update_block(){
		grass_update.call(this)
		if(this.touched){
			dare.audio.play('bump')
			this.power_up.activate()
			this.dead = true 
		}
		this.power_up.update()
	}
   // @sheep
	function make_sheep(block){
		var obj = {block: block,
				   x: block.x,
				   y: block.y,
				   src_x: 27,
				   src_y: 8,
				   src_w: 1,
				   src_h: 1,
				   frames: 1,
				   draw: draw,
				   update: sheep_update,
				   active: false,
				   activate: activate,
				   width: 128,
				   height: 72,
				   g: 2,
				   vy:0,
				   t: 0,
				   a_sheep: true,
				   riding: false,
				   move: sheep_move,
				   id: Math.random(),
				   ride: function(a){this.riding = a}
				}
		sheep = obj

		return obj
	}
	
	function sheep_move(){
		if(this.falling){
			this.vy += this.g
			this.y += this.vy
		}else{
			this.vy = 0 
		}
	}
	
	function sheep_update(){
		if(this.active){
			this.src_x = 25
			this.src_y = 15
			this.src_w = 2
			this.src_h = 2
		

			if(this.riding){
				this.x = dare.player.x
				this.y = dare.player.y
				//console.log(dare.player.vx)
				this.frames = Math.abs(dare.player.vx) > 3 ? 3 : 1
			}else{
				this.frames = 1
				villager_update.call(this)
			}
		}
		this.x -= dare.speed
		if(this.y > dare.height*2){
			this.dead = true 
		}
	}
	
	// @black_hole
	function make_black_hole(block){
		var obj = {block: block,
			   x: block.x,
			   y: block.y,
			   src_x: 26,
			   src_y: 6,
			   src_w: 2,
			   src_h: 2,
			   draw: draw,
			   update: black_hole_update,
			   active: false,
			   activate: activate,
			   //move: black_hole_move,
			   width: dare.width,
			   height: dare.height,
			   power_up: true,
			}
		
		return obj 
	}
	
	function black_hole_update(){
		if(this.active){
			if(this.src_x !== 28){
				dare.audio.play('powerup')
				this.src_x = 28
			}
			if(this.touched){
				this.touched.villager = false
				this.touched.hole = this
				this.touched.update = suck
			}
			if(this.x < -this.src_w*dare.tw){
	
				this.dead = true
			}
		}else{
			
		}
		this.x -= dare.speed
	}
	
	function suck(){
		villager_update.call(this)
		var G = 200000
		var dx = this.hole.x - this.x 
		var dy = this.hole.y - this.y
		
		var r2 = dx*dx + dy*dy
		if(r2 < 62*64){
			dare.audio.play('thump')
			this.kill()
		}
		
		var f = Math.min(G/r2, 10)
		var t = Math.atan2(dy, dx)
		
		this.vx += f*Math.cos(t)
		this.vy += f*Math.sin(t)

	}
	
	// @shark
	function make_shark(block){
		var obj = {block: block,
				   x : block.x,
				   y: block.y,
				   src_x: 28,
				   src_y: 11,
				   src_w: 2,
				   src_h: 1,
				   g: 2,
				   vy: 0,
				   draw: draw,
				   update: fire_update,
				   active: false,
				   activate: sharctivate,
				   move: shark_move,
				   width: 5.5*64,
				   height: 64,
				   power_up: true,
				   shark: true,
				   chomp: chomp
				}
		return obj

	}
	
	function sharctivate(){
		this.active = true 
		dare.updateables.push(this)
		dare.drawables.unshift(this)
	}
	
	function chomp(villager){
		dare.audio.play('bite')
		villager.sharked = true
		villager.kill()
	}
	
	function shark_move(){
		if(this.falling){
			this.vy += this.g
			this.y += this.vy 
		}else{
			this.vy = -12
			if(this.src_x !== 0){
				this.src_x = 0
				this.src_y = 11
				this.src_w = 7
				this.src_h = 3
				dare.audio.play('powerup')
			}
			
			
		}
		this.x -= dare.speed 
	}
	
	// @fire
	function make_fire(block){
		var obj = {block: block,
			   x: block.x,
			   y: block.y,
			   frames: 4,
			   src_x: 22,
			   src_y: 8,
			   src_w: 1,
			   src_h: 2,
			   t: 0,
			   g: 2,
			   vy: 0,
			   draw: draw,
			   update: fire_update,
			   active: false,
			   activate: activate,
			   move: fire_move,
			   width: 64,
			   height: 120,
			   power_up: true,
			}
		
		return obj 
	}
	
	function activate(){
		this.active = true 
		dare.updateables.push(this)
		dare.drawables.push(this)
	}
	
	function flaming_villager(){
		this.scorched = this.scorched || 0
		this.scorched += 1
		if(this.scorched < 60){
			villager_update.call(this)
		}else{
			this.falling = true
			this.move()
		}
	}
	
	function fire_move(){
		if(this.falling && !this.lit){
			this.vy += this.g
			this.y += this.vy
		}else{
			if(this.src_y !== 12){
				
				this.src_w = 2
				this.src_x = 22
				this.src_y = 12
				dare.audio.play('powerup')
			}
			this.vy = 0
			if(this.touched){
				dare.audio.play('scorch')
				this.touched.src_x = 22
				this.touched.src_y = 8,
				this.touched.srx_w = 1,
				this.touched.src_h = 2,
				this.touched.t = 0
				this.touched.frames = 4
				this.touched.update = flaming_villager
			
				
				this.touched = false
			}
		}
		this.x -= dare.speed
	}
	
	function fire_update(){
		if(this.active){
			villager_update.call(this)
		}else{
			this.x = this.block.x
			this.y = this.block.y
		}
	}
	
	// @bricks
	function make_brick(x, y){
		var obj = make_grass()
		obj.src_x = 22
		obj.src_y = 0
		obj.src_w = 2
		obj.src_h = 2
		
		obj.width = obj.src_w*dare.tw
		obj.height = obj.src_h*dare.tw
		
		obj.x = x || dare.width + obj.width/2
		obj.y = y || dare.height*Math.random()/2
		
		obj.make_child = function(){}
		
		return obj
	}
	
	
	
	// @sand
	function make_sand(x, y){
		var obj = make_grass()
		obj.src_x = 0
		obj.src_y = 0
		obj.src_w = 6
		obj.src_h = 11
		obj.width = obj.src_w*dare.tw
		obj.height = obj.src_h*dare.tw
		obj.x = dare.width + obj.width/2
		obj.update = sand_update
		obj.touched = false 
		return obj 
	}
	
	function sand_update(){
		grass_update.call(this)
		if(this.touched){
			dare.audio.play('grumble')
			this.y += 2
			this.wigglex = 4
			if(this.y > dare.height + this.height*.6){
				this.dead = true
			}
		}
	}
	
	// @gap
	function make_gap(){
		var obj = {update: gap_update,
				   width: 256,
				   height: 0,
				   x: dare.width + 128,
				   make_child: make_ground,
				   y: 0}
		dare.updateables.push(obj)
		
		return obj
	}
	
	function gap_update(){
		this.x -= dare.speed
		if(this.x + this.width/2 < dare.width - dare.gap && !this.made_child){
			this.make_child()
			this.made_child = true 
		}
		if(this.x < -this.width/2){
			this.dead = true
		}
	}
	
	// @grass
	function make_grass(x, y){
		var tw = dare.tw
		var obj = {	src_w: 14,
					src_h: 14,
					src_x: 8,
					src_y: 0,
					draw: draw,
					update: grass_update,
					made_child: false,
					ground: true,
					make_child: make_ground,
					}
		obj.width = obj.src_w*tw
		obj.height = obj.src_h*tw
		obj.x = x || dare.width + obj.width/2
		obj.y = y || Math.random()*dare.height/2 + 3*dare.height/4
		
		dare.drawables.push(obj)
		dare.updateables.push(obj)
		
		return obj
	}
	
	function grass_update(){
		this.x -= dare.speed
		if(this.x + this.width/2 < dare.width - dare.gap && !this.made_child){
			this.make_child()
			this.made_child = true 
		}
		if(this.x < -this.width/2){
			this.dead = true
		}
	}
	
	function point(x, y){
		return {x:x, y:y}
	}
	
	// @player
	function make_player(){
		var obj = {x: dare.width/2,
				   y: dare.height/2 - 50,
				   sleeping: true,
				   dead: false,
				   vx: 10,
				   jump: 0,
				   update: player_update,
				   draw: player_draw,
				   src_x: 24,
				   src_y: 2,
				   src_w: 2,
				   src_h: 2,
				   width: 64*2 - 64,
				   height: 64*2 - 32,
				   player: true,
				   falling: false,
				   g: 2,
				   vy: 0,
				   vx: 0,
				   jump: -35,
				   ax: 4,
				   fr: .92,
				   vmax: 20,
				   jump_default: -12,
				   wake_up: function(){
						this.src_x = 22
						this.vy = -30
						this.vx = 20
						this.jump = 0
						this.awake = true
						this.flip = true
				   },
				   z: make_z(),
				   }
		dare.updateables.push(obj)
		dare.drawables.push(obj)
		return obj 
	}
	
	function player_draw(){
		if(this.sheep){
			var tw = dare.tw
			var flip = this.player && this.flip ? 4 : 0
			var t = isNaN(this.t) ? 0 : this.t 
			var frames = this.frames || 1
			dare.context.drawImage(dare.img, 
									(this.src_x + this.src_w*t + flip)*tw, 
									this.src_y*tw, 
									this.src_w*tw, 
									this.src_h*tw, 
									this.x - this.src_w/2*tw, 
									this.y - tw*this.src_h - this.sheep.height/2, 
									this.src_w*tw, 
									this.src_h*tw
									)
			if(!isNaN(this.t)){
				this.t += 1
				this.t %= this.frames
			}
		}else{
			draw.apply(this)
		}
		if(!this.awake){
			this.z.draw(this)
		}
	}
	
	function above(obj, point){
		return obj.y - obj.height/2 >= point.y
	}
	
	function left_of(obj, point){
		return obj.x - obj.width/2 >= point.x
	}
	
	function right_of(obj, point){
		return obj.x + obj.width/2 <= point.x
	}
	
	function below(obj, point){
		return obj.y + obj.height/2 <= point.y
	}
	
	function player_update(){

		if(this.y > dare.height + this.height){
			dare.update = dare.game_over
		}
						
		this.falling = true
		for(var i = 0; i < dare.updateables.length; i++){
			var other = dare.updateables[i]
			
			if(other.a_sheep && !other.ridden && !this.sheep && hit_test(this, other)){
				this.sheep = other
				this.sheep.ride(this) 
			}
			
			if(other.ground && hit_test(this, other)){
				other.touched = true
				var last = point(this.x - this.vx, this.y - this.vy)
				if(above(other, last)){
					
					this.falling = false 
					this.y = other.y - other.height/2 - this.height/2
					this.jump = this.jump_default 
				}else if(below(other, last)){
					this.vy *= -this.fr
					this.y = other.y + other.height/2 + .6*this.height	
				}else if(right_of(other, last)){
					this.vx *= -this.fr
					this.x = other.x + other.width/2 + this.width/2
					
				}else if(left_of(other, last)){
					this.vx *= -this.fr
					this.x = other.x - other.width/2 - this.width
				
				}else{
					this.falling = false 
					this.y = other.y - other.height/2 - this.height/2
					this.jump = this.jump_default 
				}
			}
		}
		
		if(keydown.D){
			this.flip = false
			if(this.vx < this.vmax){
				this.vx += this.ax 
			}
		}else if(keydown.A){
			this.flip = true
			if(-this.vmax < this.vx){
				this.vx -= this.ax
			}
		}else{
			this.vx *= this.fr
		}
		
		if(this.falling){
			this.vy += this.g
		}else{
			if(this.vy > 4){
				dare.audio.play('bump')
			}
			this.vy = 0
		}
		
		if(keydown.W){
			this.vy += this.jump
			this.jump *= .75
		}
		
		if(keydown.S){
			if(this.sheep){
				this.vy = -48
				dare.audio.play('powerup')
				this.sheep.ride(false)
				//this.sheep.vy = 24
				this.sheep = undefined
			//*/
			}
		}
		
		
		this.x += this.vx //- (this.falling ? 0 : dare.speed)
		this.y += this.vy 
		
		this.x -= dare.speed
	}
	
	
	// @background
	function make_bg(img, v){
		var obj = {img: img,
				   update: bg_update,
				   draw: bg_draw,
				   x: 0,
				   y: 0,
				   v: v}
		
	
		dare.updateables.push(obj)
		return obj
	}
	
	function bg_draw(){
		dare.context.drawImage(this.img, this.x, this.y)
		dare.context.drawImage(this.img, this.x + this.img.width, this.y)
	}
	
	function bg_update(){
		this.x -= dare.speed*this.v
		if(this.x < -this.img.width){
			this.x += this.img.width
		}
	}
	
	
	
	
	function tick(){
		dare.draw()
		dare.update()
		
		
		window.requestAnimationFrame(tick)
	}
	
//})()