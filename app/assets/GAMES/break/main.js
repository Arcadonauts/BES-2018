(function(){
	// https://lospec.com/palette-list/dawnbringer-32
	const TW = 24 
	const path = '/static/GAMES/break/'
	
	let config = {
		width: 15*TW,
		height: 10*TW,
		backgroundColor: '#323c39',
		pixelArt: true,
		zoom: 2,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: {x:0, y:0},
				debug: !true
			}
		},
		//canvas = document.getElementById('canvas')
	};
	
	let menu = {
		create: function(){
			let bg = this.add.sprite(0, 0, 'menu')
			bg.setOrigin(0, 0)
			this.blocks = [] 
			for(let i = 0; i < 12; i++){
				for(let j = 0; j < 2; j++){
					let s = this.add.sprite(48 + TW*i, 160 + TW*j/2, 'breakout', 15*2 + i + 15 * j)
					s.t = (17*i + 13*j) % 24
					this.blocks.push(s)
				}
			}
			this.t = 0 
			this.start = false 
			
			this.input.keyboard.on('keydown-E', ()=> {
				this.start = true 
			})
		},
		update: function(){
			if(this.start){
				let go = true 
				this.blocks.forEach(b => {
					b.t -= .25 
					b.alpha = 1 
					
					if(b.t > -5){
						go = false 
					}
					if(b.t < 0){
						
						let f = 214 - Math.max(Math.floor(b.t), -5)
						//console.log(f) 
						if(f === 218){
							let bump = this.sound.add('bump' + Math.ceil(3*Math.random()))
							//let bump = this.sound.add('bump1')
							bump.play()
						}
						b.setFrame(f)
					}
				})
				
				if(go){
					this.scene.start('world', {	name: 'Lvl 1'})
				}
			}else{
				this.t += 1
				let on = true 
				if(this.t > 60){
					on = false 
				}
				if(this.t > 75){
					this.t = 0 
				}
				//console.log(this.t, on) 
				
				this.blocks.forEach(b => b.alpha = on ? 1 : 0)
			}

		}
	}

	function init(){
		window.game = new Phaser.Game(config)
		game.scene.add('setup', setup)
		game.scene.add('editor', editor)
		game.scene.add('breditor', breditor)
		game.scene.add('world', world)
		game.scene.add('breakout', breakout)
		game.scene.add('high_scores', breakout.high_scores)
		game.scene.add('level_select', level_select)
		game.scene.add('monolog', monolog)
		game.scene.add('finale', finale)
		game.scene.add('menu', menu)
		
		game.scene.start('setup') // Don't change this!
	}
	
	let setup = {
		preload: function(){
			
			let text = this.add.text(config.width/2, config.height/2, 'Loading: 0%', {
				fill : 'white'
			})
			text.setOrigin(.5, .5)
			
			this.load.on('progress', function(v){
				
				text.text = 'Loading: ' + Math.floor(100*v) + '%'
			})
			
			this.load.on('complete', function(){
				//this.scene.start('menu')
			})
			
			
			let v = 1//Math.random()
			let sheets = [
				{
					name: 'numbers2',
					width: 6,
					height: 9
				},
				{
					name: 'roxy'
				}, 
				{
					name: 'tiles'
				},
				{
					name: 'breakout',
					width: 24, 
					height: 12
				}, 
				{
					name:'icons',
					width: 48,
					height: 48
				}
			]
			
			let grounds =  ['fg_real', 'fg_game', 'bg_game', 'bg_bad', 'fg_bad',
							'go_bad', 'yw_bad', 'go_game', 'pixc_boston', 
							'bg_real', 'mission_pass', 'mission_fail', 'fg_dream',
							'bg_stars', 'menu'
							]
		
			sheets.forEach(s => 
			this.load.spritesheet(s.name, path+s.name+'.png?v='+v, 
				{ frameWidth: s.width || 24, frameHeight: s.height || 24 }
			))
			
			grounds.forEach(s =>
				this.load.image(s, path+s+'.png?v='+v)
			)
			
			this.load.text('dialog', path+'dialog.txt?v='+v)
			
			let sounds = [
				'activate', 'beep', 'boop', 'bump1', 'bump2', 'bump3', 'explode', 
				'laser', 'stun', 'tink', 'hum'
			]
			
			for(let i = 0; i < sounds.length; i++){
				let s = sounds[i]
				//console.log('load:', s+'.wav')
				this.load.audio(s, path + s+'.wav')
				
			}
			
			this.sound.volume = 0.25
			//console.log(this.sound.volume)
		
		},
		create:	function create(){
			/*
				boston
				new york
				chicago 
				zhengzhou 
				berlin 
				london 
				sydney 
			*/
			
			/*
				lvls = JSON.parse(localStorage.levels)
				lvls['Lvl 11'] = {}//lvls['Lvl 10']
				localStorage.levels = JSON.stringify(lvls)
			//*/
		
			/*
			let name = 'zhengzhou'
			if(!true){
				this.scene.start('breditor', {name: name}) // Change this
			}else{
				this.scene.start('breakout', {
					style: 'real',
					lvl: 0,
					name: name,
					lives: 3,
					lasers: 6,
					bomb: 4,
					length: 3,
				})// Change this
			}				
			//*/
			
			//this.scene.start('menu')
			/*
			this.scene.start('world', {
				style: 'dream',
				lvl: 'd',
				name: 'Lvl 11'
			})// Change this
			//*/
			
			this.scene.start('menu')
		},
		update: function update(){
		}
	}
	
	
	init()
})()