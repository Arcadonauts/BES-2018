(function(){
	
	/*
		To Do:
			Bugs:
 
			Marquee
			Down card damage instead of insta-death
			SFX
			Music
			
			
	
	*/
	
	function make_mute(){
		var mute = game.add.sprite(0,0,'audio')
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
			jump: ['UP', 'SPACEBAR', 'W']
		},
		down: function(code){
			var rv = false 
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
			var a = game.add.audio(key)
			a.play()
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
			var nv = 4 * Math.exp(-0.5)/Math.sqrt(2.0)
			while (true){
				var u1 = this.random()
				var u2 = 1 - this.random()
				var z = nv*(u1 - .5)/u2
				var zz = z*z/4 
				if(zz <= -Math.log(u2)){
					break 
				}
				
			}
			return mu + z*sigma 
		}
	}
	
	preload = {
		preload : function(){
			var path = '/static/GAMES/ld42/'
			game.load.image('loading', path + 'loading.png')
			
			var path = '/static/GAMES/ld42/'
			game.load.image('loading', path + 'loading.png')
		},
		create: function(){
			game.state.start('load')
			game.scale.pageAlignHorizontally = true;
			game.scale.pageAlignVertically = true;
			game.scale.refresh();
			
			var load = game.add.sprite(game.width/2, game.height/2,'loading')
			load.anchor.set(.5)
		}
		
	}
	
	load = {
		preload: function(){
			
			var path = '/static/GAMES/ld42/'
			game.load.image('loading', path + 'loading.png')
			
			var path = '/static/GAMES/ld42/'
			var sprites = [
				['guy', 48, 48],
				['fire', 48, 48],
				['icons', 24, 24],
				['parts', 16, 16],
				['laser', 32, 32],
				['spike', 32, 32],
				['audio', 36, 36],
				'pillar',
				'how to',
				'menu',
				'progress',
				'parts2',
				'wall',
				'fg', 
				['cards', 80, 80]
			]
			var w, h 
			
			for(var i = 0; i < sprites.length; i++){
				var s = sprites[i]
				if(typeof s == 'string'){
					w = h = undefined
				}else{
					w = s[1]
					h = s[2]
					s = s[0]
				}
				game.load.spritesheet(s, path + s + '.png', w, h)
				
				game.load.image('bg', path + 'bg.jpg')
			}
			
			
			var sfx = [
				'bump',
				'explode',
				'explode2',
				'explode3',
				'run3',
				'jump',
				'flame',
				'heart',
				'laser',
				'skull'
			]
			
			sfx.forEach(s => game.load.audio(s, path + s + '.wav'))
			sfx.forEach(s => audio.register(s))
			
		},
		create: function(){
			game.state.start('menu')
		}
	}
	
	menu = {
		create: function(){
			game.add.sprite(0,0,'menu')
			make_mute()
		},
		update: function(){
			if(key.down('jump')){
				game.state.start('how to')
			}
		}
	}
	
	howto = {
		create: function(){
			game.add.sprite(0,0,'how to')
			make_mute()
		},
		update: function(){
			if(key.down('jump')){
				game.state.start('play')
			}
		}
	}
	
	
	
	window.addEventListener('load', function(){
		
		window.game = new Phaser.Game(800,600, Phaser.CANVAS)
		
		game.state.add('preload', preload)
		game.state.add('menu', menu)
		game.state.add('how to', howto)
		game.state.add('load', load)
		game.state.add('play', play)
		
		game.state.start('preload')
		
		
	})
	
	
})()