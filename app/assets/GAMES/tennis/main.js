(function(){
	
	const SCALE = 1
	const START = 'menu'
	
	let p8 = {
		black: "#000000",
		dark_blue: "#1D2B53",
		dark_purple: "#7E2553",
		dark_green: "#008751",
		brown: "#AB5236",
		dark_gray: "#5F574F",
		light_gray: "#C2C3C7",
		white: "#FFF1E8",
		red: "#FF004D",
		orange: "#FFA300",
		yellow: "#FFEC27",
		green: "#00E436",
		blue: "#29ADFF",
		indigo: "#83769C",
		pink: "#FF77A8",
		peach: "#FFCCAA"
	}
	
	const path = '/static/GAMES/tennis/'
	const font = "press_start"
	
	function make_mute(){
		let mute = game.add.sprite(0,0,'audio')
		mute.inputEnabled = true 
		mute.input.useHandCursor = true 
		mute.events.onInputDown.add(function(){
			audio.mute = !audio.mute 
		})
		
		
		mute.update = function(){
			this.frame = audio.mute ? 1 : 0 
		}
	}
	
	window.key = {
		map:{
			left : ['LEFT', 'A'],
			right: ['RIGHT', 'D'],
			hit: ['UP', 'SPACEBAR', 'W'],
			
			p1_left: ['A'],
			p1_right: ['D'],
			p1_hit: ['W'],
			
			p2_left: ['LEFT'],
			p2_right: ['RIGHT'],
			p2_hit: ['UP']
			
		},
		down: function(code){
			let rv = false 
			this.map[code].forEach(function(k){
				if(game.input.keyboard.isDown(Phaser.Keyboard[k])){
					rv = true 
				}
			})
			return rv 
		}
		
	}
	
	window.audio = {
		make_mute: make_mute,
		keys: [],
		mute: false,
		register: function(key){
			this.keys.push(key)
		},
		play: function(key){
			if(this.mute) return 
			let a = game.add.audio(key, .1)
		
			a.play()
		},
		load: function(){
			var sfx = [
				'begin',
				'blip',
				'hit',
				'woosh5',
				'serve',
				'beep',
				'bomp'
			]
			let p = path + 'sfx/'
			sfx.forEach(s => game.load.audio(s, p + s + '.wav'))
			sfx.forEach(s => this.register(s))
		}
	}
	
	window.random = {
		choice: function(list){
			return list[this.randrange(0, list.length)]
		},
		randrange: function(min, max){
			
			if(max === undefined){
				max = min 
				min = 0
			}
			return Math.floor(this.random()*(max - min) + min)
		},
		random: function(){
			return Math.random()
		},
		normal: function(mu, sigma){
			let nv = 4 * Math.exp(-0.5)/Math.sqrt(2.0)
			while (true){
				let u1 = this.random()
				let u2 = 1 - this.random()
				let z = nv*(u1 - .5)/u2
				let zz = z*z/4 
				if(zz <= -Math.log(u2)){
					break 
				}
				
			}
			return mu + z*sigma 
		}
	}
	
	let preload = {
		preload : function(){
			game.load.image('loading', path + 'loading.png')
		},
		create: function(){
			game.state.start('load')
			game.scale.pageAlignHorizontally = true;
			game.scale.pageAlignVertically = true;
			game.scale.refresh();
			
			game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
			
			let load = game.add.sprite(game.width/2, game.height/2,'loading')
			load.anchor.set(.5)
		}
		
	}
	
	let load = {
		preload: function(){
			game.load.image('loading', path + 'loading.png')
			
			let sprites = [
				['avatars', 256, 256],
				'ball',
				'marquee',
				'net',
				'vs',
				'wall',
				'win',
				['one_player', 220, 32],
				['two_player', 220, 32],
				['key', 50, 50],
				'tut_bg',
				['choose', 286*2, 32],
				['audio', 36, 36],
				['menu_butt', 120, 32],
				['start', 150, 32],
				'marker',
				'frame',
				'bar_bg',
				'bar_fg',
				['frame_bg', 256, 256],
				'menu',
				'select',
				['next', 32, 32],
				['players', 64, 64],
				['racket', 64, 64],
				['go', 80, 32],
				'bg'
			]
			let w, h 
			
			for(let i = 0; i < sprites.length; i++){
				let s = sprites[i]
				if(typeof s == 'string'){
					w = h = undefined
				}else{
					w = s[1]/SCALE
					h = s[2]/SCALE
					s = s[0]
				}
				game.load.spritesheet(s, path + 'imgs/'+ s + '.png', w, h)
				
			}
			
			
			audio.load()
			
		},
		create: function(){
			this.game.add.text(0, 0, "hack", {font:"1px press_start", fill:"#FFFFFF"});
			game.state.start(START)
		}
	}
	
	let menu = {
		create: function(){
			game.add.sprite(0,0,'menu')
			make_mute()
			
			/*
			game.add.button(game.width/2, 400, 'start', function(){
				audio.play('begin')
	
				game.state.start('select')
			}, this, 1,0,2).anchor.set(.5)
			*/
			
			game.add.button(game.width/2, 375, 'one_player', function(){
				audio.play('begin')
	
				game.state.start('select', true, false, false)
			}, this, 1,0,2).anchor.set(.5)
			
			game.add.button(game.width/2, 425, 'two_player', function(){
				audio.play('begin')
	
				game.state.start('select', true, false, true)
			}, this, 1,0,2).anchor.set(.5)
		},
		update: function(){
			if(key.down('hit')){
				game.state.start('select')
			}
		}
	}
	
	function text_button(x, y, label, callback){
		var butt = game.add.button(x, y)
		if(callback){
			butt.onInputDown.add(callback, butt)
			butt.onInputDown.add(()=>audio.play('beep'), butt)
		}
		
		butt.onInputOver.add(function(){
			if(this.selected){
				this.text.fill = p8.blue 
			}else{
				this.text.fill = p8.light_gray
			}
	
		}, butt)
		
		
		
		butt.refresh = function(){
			if(this.selected){
				this.text.fill = p8.blue 
			}else{
				this.text.fill = p8.indigo
			}
		}
		
		butt.onInputOut.add(butt.refresh, butt)
		
		
		butt.text = game.add.text(0,0,label, {
			font: "24px press_start", 
			fill: p8.indigo
		})
		
		butt.addChild(butt.text)
		
		return butt 
	}
	
	function make_options(x, y, options, init){
		let label = game.add.text(x, y, options[0], {
			font: "24px press_start"
		})
		
		function f(id){
			return function(){
				for(let i = 0; i < label.children.length; i++){
					label.children[i].selected = i === id  
					label.children[i].refresh()
				}
				
			}
		}
		
		let x0 = 0 
		for(let i = 1; i < options.length; i++){
			let b = text_button(x0, 32, options[i], f(i-1))
			x0 += b.text.width + 16
			label.addChild(b)
		}
		
		init = init || 0 
		label.children[init].selected = true 
		label.children[init].refresh()
		
		label.get = function(){
			for(let i = 0; i < this.children.length; i++){
				if(this.children[i].selected){
					return this.children[i].text.text 
				}
			}
		}
		
		return label 
	}
	
	function make_bar(value, min, max){
		let m = 1/(max - min)
		let b = -m*min 
		let r = m*value + b
		//let bar = game.add.text(0, 0, r)
		let bar = game.add.sprite(0,0,'bar_bg')
		
		let fg = game.add.sprite(4,4,'bar_fg')
		fg.scale.x = r 
		bar.addChild(fg)
		
		return bar 
	}
	
	function make_profile(player){
		return {
			clear: function(){
				if(this.avatar){
					this.avatar.kill()
				}
			},
			get: function(){
				return this.id 
			},
			add: function(id){
				this.clear()
				//let SCALE =1 
				this.id = id 
				let data = play.data[id]
				let x 
				let r = .3
				if(player === 1){
					x = r*game.width
				}else{
					x = (1-r)*game.width 
				}
				
				this.avatar = game.add.sprite(x, 125)
				this.avatar.scale.set(SCALE)
				this.avatar.anchor.set(.5, 0)
				
				
				let prev = game.add.button(-128, -40, 'next', function(){
					audio.play('blip')
					this.add(id === 0 ? 7 : id -1)
				}, this,1,0, 2)
				this.avatar.addChild(prev)
				
				let next = game.add.button(128, -40, 'next', function(){
					audio.play('blip')
					this.add(id === 7 ? 0 : id + 1)
				}, this,1,0, 2)
				next.scale.x = -1
				this.avatar.addChild(next)
				
				let bg = game.add.sprite(0, 0, 'frame_bg')
				this.avatar.addChild(bg)
				bg.frame = player === 1 ? 0 : 1
				bg.anchor.set(.5,0)
				
				let pic = game.add.sprite(0,0, 'avatars')
				this.avatar.addChild(pic)
				pic.frame = id 
				pic.anchor.set(.5, 0)
				
				let frame = game.add.sprite(0,0,'frame')
				this.avatar.addChild(frame)
				frame.anchor.set(.5,0)
				
				let text_color = p8.white 
				
				let name = game.add.text(0,5,data.name, {
					fill: text_color,
					font: "22px " + font,
					wordWrap: true,
					align: 'center',
					boundsAlignH: 'center'
				})
				name.setTextBounds(-128, -40, 256, 32)
				this.avatar.addChild(name)
				
				let quote = game.add.text(-128,260, data.quote, {
					fill: text_color,
					font: "16px " + font,
					wordWrap: true,
					align: 'center',
					wordWrapWidth: 256,
					boundsAlignH: 'center'
				})
				quote.lineSpacing = -3
				quote.setTextBounds(0, 0, 256, 64)
				this.avatar.addChild(quote)
				
				let stats = {
					v : ['Speed', 100, 300],
					fr: ['Traction', 1, .6],
					power: ['Strength', 500, 700],
					reach: ['Reach', 50, 100]
				}
				
				
				let y = 320
				let dy = 32
				let x0 = -20
				for(let s in stats){
					if(stats.hasOwnProperty(s)){
						let stat = game.add.text(x0, y, stats[s][0], {
							align: 'right',
							wordWrapWidth: 200,
							wordWrap: true,
							font: '16px ' + font,
							fill: p8.light_gray
						})
						this.avatar.addChild(stat)
						stat.anchor.set(1,0)
						
						//let d = game.add.text(10, y, data[s])
						let d = make_bar(data[s], stats[s][1], stats[s][2])
						d.x = x0 + 10
						d.y = y - 7
						this.avatar.addChild(d)
						
						y += dy 
						
						
						
					}
				}
				
			}
		}
	}
	
	let select = {
		init: function(two){
			this.two = two 
		},
		create: function(){
			game.add.sprite(0,0,'select')
			make_mute()
			
			/*
			let base_choose = game.add.sprite(game.width/2, 30, 'choose')
			base_choose.anchor.set(.5,0)
			base_choose.frame = 1
			*/
			
			let choose = game.add.sprite(game.width/2,30, 'choose')
			//base_choose.addChild(choose)
			choose.anchor.set(.5, 0)
			choose.animations.add('flash', (function(){
				let op = []
				for(let i = 0; i <= 21; i++){
					op.unshift(0)
					op.unshift(0)
					op.unshift(0)
					op.push(i)
				}
				return op
			})(), 24, true)
			choose.animations.play('flash')
			
			
			/*
			let rect = new Phaser.Rectangle(0,0,32,32)
			choose.crop(rect)
			choose.update = function(){
				let v = 5
				this.x += v
				rect.x += v
				if(this.x > game.width){
					rect.x = 0
				}
				
				this.updateCrop()
			}
			*/
			//choose.animations.play('flash')
			
			
			let left = make_profile(1)
			left.add(0)
			
			let right = make_profile(2)
			right.add(1)
			
			let vs = game.add.sprite(game.width/2+5, 250, 'vs')
			vs.anchor.set(.5) 
			vs.update = function(){this.bringToTop()}
			
			let go = game.add.button(game.width-4, game.height-4, 'go', function(){
				audio.play('begin')
				game.state.start('settings', true, false, left.get(), right.get(), this.two)
				
			}, this, 1, 0, 2)
			go.anchor.set(1,1)
			go.scale.set(SCALE)
			
		},
		update: function(){
			if(key.down('hit')){
				//game.state.start('play')
			}
		}
	}
	
	function make_tuts(){
		let mover = game.add.sprite(450, 50, 'tut_bg')
		mover.update = function(){
			this.children.forEach(c => c.update())
		}
		let s = game.add.sprite(60, 180, 'players')
		s.t = 0 
		mover.addChild(s)
		s.anchor.set(.5,1)
		s.animations.add('run', [0,1,0,2], 12, true)
		s.animations.add('stand', [0])
		s.update = function(){
			this.t += 1
			
			let v = 3 
			let run = 60
			let wait = 30
			
			if(this.t < run){
				this.x += v 
				this.animations.play('run')
				this.right_key.frame = 1 
			}else if(this.t < run + wait){
				this.animations.play('stand')
				this.right_key.frame = 0 
			}else if(this.t < 2*run + wait){
				this.animations.play('run')
				this.left_key.frame = 1
				this.x -= v 
			}else if(this.t < 2*run + 2*wait){
				this.animations.play('stand')
				this.left_key.frame = 0 
			}else{
				this.t = 0 
				this.x = 60
			}
		}
		
		let r = game.add.sprite(-25,-60,'racket')
		s.addChild(r)
		
		let left = game.add.sprite(75, 50, 'key')
		left.anchor.set(.5)
		mover.addChild(left)
		s.left_key = left 
		left.angle = -90
		
		let right = game.add.sprite(225, 50, 'key')
		right.anchor.set(.5)
		mover.addChild(right)
		s.right_key = right 
		right.angle = 90
		
		let swinger = game.add.sprite(450, 300, 'tut_bg')
		swinger.update = function(){
			this.children.forEach(c => c.update())
		}
		
		ss = game.add.sprite(75,180, 'players')
		ss.anchor.set(.5,1)
		swinger.addChild(ss)
		ss.t = 0
		
		let up = game.add.sprite(75, 50, 'key')
		up.anchor.set(.5)
		swinger.addChild(up)
		ss.up_key = up 
		
		ss.update = function(){
			this.t += 1 
			this.ball.x += this.ball.vx 
			this.ball.vy += this.ball.g 
			this.ball.y += this.ball.vy 
			
			if(this.t === 40){
				this.racket.animations.play('swing')
				this.up_key.frame = 1 
			}
			
			if(this.t === 45){
				this.ball.vx *= -1 
				this.ball.vy *= -1 
			}
			
			if(this.t === 50){
				this.up_key.frame = 0 
			}
			
			if(this.t === 90){
				this.ball.vx *= -1 
				this.ball.vy *= -1 
				this.ball.x = this.ball.x0 
				this.ball.y = this.ball.y0 
				this.t = 0
			}
		}
		
		ss.racket = game.add.sprite(-25, -60, 'racket')
		ss.addChild(ss.racket)
		ss.racket.animations.add('swing', [0, 1, 2, 0], 12)
		
		ss.ball = game.add.sprite(240, -150, 'ball')
		ss.ball.anchor.set(.5)
		ss.addChild(ss.ball)
		ss.ball.x0 = ss.ball.x 
		ss.ball.y0 = ss.ball.y 
		ss.ball.vx = -5
		ss.ball.vy = 0 
		ss.ball.g = .1 
		
	}
	
	let settings = {
		init: function(player, ai, two){
			this.data = {
				left: player,
				right: ai,
				two: two
			}
			console.log(this.data)
		},
		create: function(){
			game.add.sprite(0,0,'select')
			make_mute()
				
			let x = 20
			
			if(this.data.two){
				first = make_options(x, 100, ['First Serve:', 'Player 1', 'Player 2'])
			}else{
				first = make_options(x, 100, ['First Serve:', 'Player', 'Computer'])
			}
			let games = make_options(x, 200, ['Sets:', 1, 2, 3, 4, 5, 6, 7, 8], 2)
			let by2 = make_options(x, 300, ['Win By Two:', 'On', 'Off'])
			// Classic Tennis vs. Roo Tennis 
			
			
			
			make_tuts()
			
			game.add.sprite(game.width-50, -450, 'select')
			
			let go = game.add.button(game.width-4, game.height-4, 'go', function(){
				audio.play('begin')
				
				game.state.start('play', true, false, {
					left: this.data.left, 
					right: this.data.right,
					two: this.data.two,
					first: first.get(),
					games: games.get(),
					by2: by2.get()
				})
			}, this, 1, 0, 2)
			go.anchor.set(1,1)
			go.scale.set(SCALE)
			
			
			
			
			
		}
	}
	
	let win = {
		init: function(winner, loser){
			this.winner = winner === undefined ? 5 : winner
			this.loser = loser === undefined ? 2 : loser 
		},
		create: function(){
			game.add.sprite(0,0,'win')
			game.add.button(game.width - 8, game.height - 40, 'menu_butt', function(){
				game.state.start('menu')
			}, this, 1,0,2).anchor.set(1)
			
			let w = game.add.sprite(125, 213*2, 'players')
			w.frame = 3*this.winner 
			w.anchor.set(1)
			
			let l = game.add.sprite(200, 243*2, 'players')
			l.frame = 3*this.loser 
			l.anchor.set(1)
			
			let jump = function(){
		
				if(this.t > 100){
					this.t = 50 
				}else{
					this.t += 1
				}
				
				if(this.t === 90){
					this.y -= 5
				}
				if(this.t === 95){
					this.y += 5 
				}
			}
			
			let x = 300
			let dx = 50
			for(var i = 0; i < 8; i++){
				if(i !== this.loser && i !== this.winner){
					let s = game.add.sprite(x, 505, 'players')
					s.frame = 3*i 
					s.scale.x = -1 
					s.update = jump 
					s.t = Math.floor(80 * Math.random())
					x += dx + Math.floor(20*Math.random())
				
				}
			}
			
			game.add.text(game.width/2, game.height/3, play.data[this.winner].name + ' Wins!', {
				font: "48px press_start", 
				fill: p8.black
			}).anchor.set(.5)
		}
	}
	
	window.addEventListener('load', function(){
		
		window.game = new Phaser.Game(800,600, Phaser.CANVAS, 'game', false, false)
		
		//game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
		
		game.state.add('preload', preload)
		game.state.add('menu', menu)
		game.state.add('select', select)
		game.state.add('load', load)
		game.state.add('play', play)
		game.state.add('settings', settings)
		game.state.add('win', win)
		
		game.state.start('preload')
		
		
	})
	
	
})()