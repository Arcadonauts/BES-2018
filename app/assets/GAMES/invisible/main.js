(function(){

	/*
	To Do:
		Intro
		Outro
		SFX 
		Flowers 
		Shader



	*/
	const path = '/static/GAMES/invisible/'
	
	let config = {
		width: 783,
		height: 556,
		backgroundColor: '#000000',
		pixelArt: false,
		zoom: 1.0,
		physics: {
			default: 'matter',
			matter: {
				debug: !true,
				//gravity: { y: 500 }
			}
		}
	};
	
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

	

	function init(){
		window.game = new Phaser.Game(config)
		game.scene.add('setup', setup)
		game.scene.add('play', play)
		game.scene.add('text', text)
		game.scene.add('title', title)
	
		
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
		
			
			let sheets = [
				{
					name: 'bg',
					width: 6268,
					height: 4452,
					ext: 'jpg'
				},
				{
					name: 'fg',
					width: 6268,
					height: 4452,
					ext: 'png'
				},
				{
					name: 'bird',
					width: 150,
					height: 150,
					ext: 'png'
				},
				{
					name: 'pointer',
					width: 100,
					height: 100,
					ext: 'png'
				},
				{
					name: 'flowers',
					width: 100,
					height: 150,
					ext: 'png'
				},
				{
					name: 'star',
					width: 100,
					height: 113,
					ext: 'png'
				},
				{
					name: 'small',
					width: 783,
					height: 559,
					ext: 'jpg'
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
			
			this.load.tilemapTiledJSON('map', path+'map.json?v='+v);
	
			
			let sounds = [
				'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'b1', 'b2', 'b3', 'b4', 'b5', 'boom', 'ding', 'grab'
			]
			
			for(let i = 0; i < sounds.length; i++){
				let s = sounds[i]
				//console.log('load:', s+'.wav')
				this.load.audio(s, path + 'sfx/' + s + '.wav')
				
			}
			
			this.sound.volume = 0.5
			
			let maps = []
			maps.forEach(m => {
				this.load.tilemapTiledJSON(m, path + 'maps/' + m + '.json?v='+v)
				console.log(m, path + 'maps/' + m + '.json?v='+v)
			})
			
			this.load.text('shader', path+'shader.txt?v='+v)
			
			this.load.json('bg', path + 'bg.json?v='+v)
		
		},
		create:	function create(){

			this.scene.start('audio', {
				
			})
			
			this.scene.launch('text', {})
			
			let shaderText = this.cache.text.entries.entries['shader']
			this.customPipeline = game.renderer.addPipeline('Custom', new CustomPipeline2(game, shaderText));
			window.shader = this.customPipeline 
			
			this.scene.launch('title')
		}
	}
	
	
	init()
})()