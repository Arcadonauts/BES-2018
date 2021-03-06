(function(){
	/* To Do:
		Map Move 11:05
		Shop
			Upgrades 8:43
		Tutorial 25-11:30
		Tool tips 26-1:58
		Menu 26-12:45
		Game Over 
		SFX
		Random:
			1. Meteor
				If HP == 1:
					HP = 0
				elif 1 < HP <= 10:
					HP = 1 
				else:
					HP -= 10
			2. Battle
			3. Nothing
			4. Store
			5. Luck
			6. Gift
		Push Your Luck 26-7:00
		Shader
		Boss

	*/
	
	let CustomPipeline2 = new Phaser.Class({

		Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

		initialize:

		function CustomPipeline2 (game, text)
		{
			Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
				game: game,
				renderer: game.renderer,
				fragShader: text
			});
		} 

	});
	

	const path = '/static/GAMES/luck/'
	
	let config = {
		type: Phaser.WEBGL,
		width: 960,
		height: 540,
		backgroundColor: 'black',
		pixelArt: false,
		zoom: 1,
		physics: {
			default: 'arcade',
			arcade: {
				debug: false,
			}
		}
	};
	

	

	function init(){
		window.game = new Phaser.Game(config)
		game.scene.add('setup', setup)
		//game.scene.add('menu', menu)

		//game.scene.add('audio', audio)

		game.scene.add('luck', luck)
		game.scene.add('tut', tut)
		game.scene.add('title', title)
		game.scene.add('jump', jump)
		game.scene.add('battle', battle)
		game.scene.add('store', store)
		game.scene.add('play', play)
		game.scene.add('dieEdit', dieEdit)
		game.scene.add('lose', lose)

		
		
		let seed = 'seed'//'' + Math.floor(1000*Math.random())
		window.random = new Phaser.Math.RandomDataGenerator()
		random.init(seed)
		
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
			
			
			let v = Math.random()
			
			this.load.text('firsts', path+'firsts.txt?v='+v)
			this.load.text('lasts', path+'lasts.txt?v='+v)
			this.load.text('shader', path+'shader.txt?v='+v)
			
			//this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true)
			
			let sheets = [
				{
					name: 'particles',
					width: 48,
					height: 48,
					ext: 'png'
				},
				{
					name: 'transitions',
					width: 240*2,
					height: 135*2,
					ext: 'png'
				},	
				{
					name: 'enemy',
					width: 240,
					height: 135,
					ext: 'png'
				},	
				{
					name: 'swipe',
					width: 85,
					height: 540,
					ext: 'png'
				},	
				{
					name: 'roll',
					width: 675/5,
					height: 675/5,
					ext: 'png'
				},	
				{
					name: 'icons',
					width: 96,
					height: 96,
					ext: 'png'
				},	
				{
					name: 'die',
					width: 240/2*2,
					height: 135*2,
					ext: 'png'
				},	
				{
					name: 'explode',
					width: 240,
					height: 135*2,
					ext: 'png'
				},	
				{
					name: 'left',
					width: 960,
					height: 540,
					ext: 'png'
				},	
				{
					name: 'right',
					width: 960,
					height: 540,
					ext: 'png'
				},
				{
					name: 'front',
					width: 960,
					height: 540,
					ext: 'png'
				},
			
			]
		
			sheets.forEach(s => {
				
				this.load.spritesheet(
					s.name, 
					path+'images/'+s.name+'.'+(s.ext || '.png')+'?v='+v, 
					{ 
						frameWidth: s.width, 
						frameHeight: s.height 
					}
				)
			})
			
			//this.load.json('data', path+'data.json?v='+v)
			
			let sounds = [
				'boom', 'bump', 'crash', 'drop', 'explode', 'good', 'hum', 'laser', 'powerup', 'holderDrop', 'money'
			]
			
			for(let i = 0; i < sounds.length; i++){
				let s = sounds[i]
				//console.log('load:', s+'.wav')
				this.load.audio(s, path + 'sfx/' + s + '.wav')
				
			}
			
			this.sound.volume = 0.3
			
			let maps = []
			maps.forEach(m => {
				this.load.tilemapTiledJSON(m, path + 'maps/' + m + '.json?v='+v)
				console.log(m, path + 'maps/' + m + '.json?v='+v)
			})
		
		},
		create:	function create(){
			
			this.anims.create({
				key: 'roll',
				frames: this.anims.generateFrameNumbers('roll', { start: 0, end: 20 }),
				frameRate: 48,
				repeat: -1
			})
			
			this.anims.create({
				key: 'reveal',
				frames: this.anims.generateFrameNumbers('roll', { start: 20, end: 24 }),
				frameRate: 48,

			})
			
			this.anims.create({
				key: 'oroll',
				frames: this.anims.generateFrameNumbers('roll', { start: 25, end: 45 }),
				frameRate: 48,
				repeat: -1
			})
			
			this.anims.create({
				key: 'oreveal',
				frames: this.anims.generateFrameNumbers('roll', { start: 45, end: 49 }),
				frameRate: 48,

			})
			
			/*
			window.state = {
				unlocked: 0,
				set: function(x){
					
					
					if(x > this.unlocked){
						this.unlocked = x
						try {
							localStorage.shiftUnlocked = x 
						}
						catch(error) {
						  console.error(error);
						  // expected output: ReferenceError: nonExistentFunction is not defined
						  // Note - error messages will vary depending on browser
						}
						
					}
					
				},
				clear: function(){
					try {
						delete localStorage.shiftUnlocked
					}
					catch(error) {
					  console.error(error);
					  // expected output: ReferenceError: nonExistentFunction is not defined
					  // Note - error messages will vary depending on browser
					}
					
				}
			}
			
			if(localStorage.shiftUnlocked){
				try {
					state.unlocked = +localStorage.shiftUnlocked 
				}
				catch(error) {
				  console.error(error);
				  // expected output: ReferenceError: nonExistentFunction is not defined
				  // Note - error messages will vary depending on browser
				}
				
			}
			*/
			/*
			let shaderText = this.cache.text.entries.entries['shader']
			
			this.customPipeline = game.renderer.addPipeline('Custom', new CustomPipeline2(game, shaderText));
			this.customPipeline.setFloat2('resolution', game.config.width, game.config.height);
			this.customPipeline.setFloat2('mouse', 0.5, 0.5);
			
			window.shader = this.customPipeline 
		
			this.scene.start('audio', {
				
			})
			*/
			this.scene.start('play')
		}
	}
	
	
	
	
	init()
})()