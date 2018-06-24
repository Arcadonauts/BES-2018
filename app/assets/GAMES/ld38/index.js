window.index = (function(){

	var menu = {
		create: function(){

			game.add.sprite(0,0,'menu_bg')
			var but = game.add.button(80, 200, 'play_button', function(){
				game.state.start('play')
			}, this, 1, 0, 2)

			but.setDownSound(game.add.sound('select'))
			but.setOverSound(game.add.sound('over'))

			var but = game.add.button(80, 240, 'about_button', function(){
				game.state.start('about')
			}, this, 1, 0, 2)

			but.setDownSound(game.add.sound('select'))
			but.setOverSound(game.add.sound('over'))

			var world = game.add.sprite(450, 300, 'world')
			world.width = world.height = 128
			world.anchor.set(.5)
			world.update = function(){
				this.angle += .2 
			}

		}
	}

	var about = {
		create: function(){
			game.add.sprite(0,0,'about_bg')
			var but = game.add.button(game.width, game.height, 'menu_button', function(){
				game.state.start('menu')
			}, this, 1, 0, 2)

			but.anchor.set(1)
			but.setDownSound(game.add.sound('select'))
			but.setOverSound(game.add.sound('over'))
		}
	}

	function piece_float(){
		var v = .5
		var t = 180*this.theta/Math.PI + Math.random()
		var vx = v*Math.cos(t)
		var vy = v*Math.sin(t)

		this.x += vx 
		this.y += vy 

		this.angle += this.dt 

	}

	var game_over = {
		init(level){
			this.level = level 
		},
		create: function(){
			game.add.sprite(0, 0, 'game_over_bg')
			var but = game.add.button(game.width, game.height, 'menu_button', function(){
				game.state.start('menu')
			}, this, 1, 0, 2)

			but.anchor.set(1)
			but.setDownSound(game.add.sound('select'))
			but.setOverSound(game.add.sound('over'))


			for(var i = 0; i < 4; i++){
				var sprite = game.add.sprite(game.height/2, game.height/2, 'piece' + i)
				sprite.anchor.set(.5)
				sprite.theta = 90*i 
				sprite.update = piece_float  
				sprite.dt = Math.random()
			}
		}


	}

	function init(){
		window.game = new Phaser.Game(640, 448, Phaser.CANVAS, 'game')

		game.state.add('loader', loader)
		game.state.add('play', window.play)
		game.state.add('menu', menu)
		game.state.add('upgrades', window.upgrades)
		game.state.add('level_complete', window.level_complete)
		game.state.add('about', about)
		game.state.add('game_over', game_over)
		game.state.add('preloader', preloader)

		game.state.start('preloader')
	}

	var preloader = {
		preload: function(){
			game.load.spritesheet('loading', '/static/GAMES/ld38/' + 'loading.png', 10*16, 32)
		},
		create: function(){
			game.state.start('loader')
		}
	}

	var loader = {
		preload: function(){
			var preloader = game.add.sprite(game.width/2, game.height/2, 'loading')
			preloader.anchor.set(.5)
			preloader.play(10, true)
			var dir = '/static/GAMES/ld38/'

			var bgs = ['upgrade', 'play', 'side_bar', 'level_complete', 'menu', 'about', 'game_over']
			for(var i = 0; i < bgs.length; i++){
				game.load.spritesheet(bgs[i] + '_bg', dir + bgs[i] +'_bg.jpg')
			}
			
			for(var i = 0; i < 4; i++){
				game.load.spritesheet('piece'+i, 'piece' + i +'.png')
			}

			game.load.spritesheet('world_hud', dir+'world_hud.png')
			game.load.spritesheet('upgrade_fg', dir+'upgrade_fg.png')
			game.load.spritesheet('check', dir+'check.png')
			game.load.spritesheet('tardis', dir+'tardis.png')
			game.load.spritesheet('world', dir+'world.png', 512, 512)
			game.load.spritesheet('empty', dir+'empty.png')
			game.load.spritesheet('launcher', dir+'launcher.png', 256, 256)
			game.load.spritesheet('ufo', dir+'red_ufo.png', 384, 256)
			game.load.spritesheet('missile', dir+'missile.png', 384, 128)
			game.load.spritesheet('laser', dir+'laser.png', 128, 128)
			game.load.spritesheet('shield', dir+'shield.png', 840/8, 446)
			game.load.spritesheet('dots', dir+'dots.png', 16, 16)
			game.load.spritesheet('clock', dir+'clock.png', 16, 16)
			game.load.spritesheet('health', dir+'health.png', 16, 16)
			game.load.spritesheet('upgrade_button', dir+'upgrade_button2.png', 170, 100)
			game.load.spritesheet('skip_button', dir+'skip_button.png', 64, 32)
			game.load.spritesheet('play_button', dir+'play_button.png', 16*5, 32)
			game.load.spritesheet('menu_button', dir+'menu_button.png', 16*6, 32)
			game.load.spritesheet('mute_button', dir+'mute_button.png', 16*6, 32)
			game.load.spritesheet('about_button', dir+'about_button.png', 16*7, 32)
			game.load.spritesheet('steady_button', dir+'steady_button.png', 16*8, 32)

			var directions = ['north', 'south', 'east', 'west']
			for(var i = 0; i < directions.length; i++){
				game.load.spritesheet('button_' + directions[i], dir + directions[i] + '_button.png', 192, 192)
			}

			var bars = ['red', 'blue', 'green', 'outline']
			for(var i = 0; i < bars.length; i++){
				game.load.spritesheet('bar_' + bars[i], dir+'bar_' + bars[i] + '.png')
			}

			var sounds = ['level_up', 'over', 'select', 'coin', 'big_explosion', 'explosion', 'low_laser', 'med_explosion', 'med_laser', 'shield_down', 'shield_up']
			for(var i = 0; i < sounds.length; i++){
				game.load.audio(sounds[i], dir + sounds[i] + '.wav')
			}

			/*
			var music = ['action', 'waiting']
			for(var i = 0; i < music.length; i++){
				game.load.audio(music[i], 'music/' + music[i] + '.wav')
			}
			*/
			
		
		},
		create: function(){
			/*
			game.action_music = game.add.audio('action')
			game.action_music.loop = true 
			game.waiting_music = game.add.audio('waiting')
			game.waiting_music.loop = true 
			game.waiting_music.play('', 0, 1, true)
			*/
			game.state.start('menu')
		}
	}

	window.onload = init 

	return {

	}
})()