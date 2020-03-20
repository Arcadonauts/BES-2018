(function(){
	/* To Do:
		Timeline
			
			Improved wiggling on people
			
		Personel:
			Accuse
		Map
		Tutorial
		
			

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
	

	const path = '/static/GAMES/shift/'
	
	let config = {
		type: Phaser.WEBGL,
		width: 1920/2,
		height: 1080/2,
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
		game.scene.add('tut', tut)
		game.scene.add('title', title)
		game.scene.add('accuse', accuseScene)
		//game.scene.add('menu', menu)
		//game.scene.add('audio', audio)
		//game.scene.add('tut', tut)

		game.scene.add('play', play)
		//game.scene.add('battle', battle)
		//game.scene.add('world', world)
		
		
		let seed = '' + Math.floor(1000*Math.random())
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
			
			let sheets = [
				{
					name: 'agent',
					width: 405,
					height: 1020,
					ext: 'png'
				},	
				{
					name: 'dot',
					width: 2,
					height: 2,
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
				//'bip', 'blap', 'blip', 'bup', 'plip', 'boop'
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
			window.state = {
				unlocked: 0,
				set: function(x){
					if(x > this.unlocked){
						this.unlocked = x
						localStorage.shiftUnlocked = x 
					}
					
				},
				clear: function(){
					delete localStorage.shiftUnlocked
				}
			}
			
			if(localStorage.shiftUnlocked){
				state.unlocked = +localStorage.shiftUnlocked 
			}
	
			let shaderText = this.cache.text.entries.entries['shader']
			
			this.customPipeline = game.renderer.addPipeline('Custom', new CustomPipeline2(game, shaderText));
			this.customPipeline.setFloat2('resolution', game.config.width, game.config.height);
			this.customPipeline.setFloat2('mouse', 0.5, 0.5);
			
			window.shader = this.customPipeline 
		
			this.scene.start('audio', {
				
			})
			
			this.scene.launch('title', {
				unlocked: 0
			})
		}
	}
	
	
	
	
	init()
})()