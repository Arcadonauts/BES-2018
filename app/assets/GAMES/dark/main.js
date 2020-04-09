(function(){



	const path = '/static/GAMES/dark/'
	
	let config = {
		width: 540,
		height: 360,
		backgroundColor: '#000000',
		pixelArt: false,
		zoom: 1.0,
		physics: {
			default: 'arcade',
			arcade: {
				debug: !true,
				gravity: { y: 500 }
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

	let main_menu = {
		create: function(){
			let bg = this.add.sprite(0, 0, 'paper')
			bg.setOrigin(0)
			
			let title = this.add.text(this.cameras.main.centerX, 0.67*this.cameras.main.centerY, 'Gerry and Me', {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '60pt',
				
			})
			
			let text = this.add.text(this.cameras.main.centerX, 1.2*this.cameras.main.centerY, "Click to begin.", {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '30pt',
			})
			
			title.setOrigin(0.5)
			text.setOrigin(0.5)
			
			
			let scene = this 
			this.input.on('pointerdown', function(){
				scene.scene.start('menu')
			})
			
			let tl = this.add.sprite(0, 0, 'decorations')
			tl.setScale(1, -1)
			tl.setOrigin(0, 1)
			
			let tr = this.add.sprite(2*this.cameras.main.centerX, 0, 'decorations')
			tr.setScale(-1, -1)
			tr.setOrigin(0, 1)
			
			let br = this.add.sprite(2*this.cameras.main.centerX, 2*this.cameras.main.centerY, 'decorations')
			br.setScale(-1, 1)
			br.setOrigin(0, 1)
			
			let bl = this.add.sprite(0, 2*this.cameras.main.centerY, 'decorations')
			bl.setScale(1, 1)
			bl.setOrigin(0, 1)
			
			
			
			
		},
		update: function(){

		}
	}

	function init(){
		window.game = new Phaser.Game(config)
		game.scene.add('setup', setup)
		game.scene.add('play', play)
		//game.scene.add('menu', menu)

		//game.scene.add('battle', battle)
		//game.scene.add('world', world)
		
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
					name: 'sprites',
					width: 32,
					height: 32,
					ext: 'png'
				}
			]
		
			sheets.forEach(s => {
				
				this.load.spritesheet(
					s.name, 
					path+'imgs/'+s.name+'.'+(s.ext || '.png')+'?v='+v, 
					{ 
						frameWidth: s.width, 
						frameHeight: s.height 
					}
				)
			})
			
			//this.load.json('data', path+'data.json?v='+v)
			
			this.load.tilemapTiledJSON('map', path+'map.json?v='+v);
	
			
			let sounds = [

			]
			
			for(let i = 0; i < sounds.length; i++){
				let s = sounds[i]
				//console.log('load:', s+'.wav')
				this.load.audio(s, path + 'audio/' + s + '.mp3')
				
			}
			
			this.sound.volume = 1
			
			let maps = []
			maps.forEach(m => {
				this.load.tilemapTiledJSON(m, path + 'maps/' + m + '.json?v='+v)
				console.log(m, path + 'maps/' + m + '.json?v='+v)
			})
			
			this.load.text('shader', path+'shader.txt?v='+v)
		
		},
		create:	function create(){

			this.scene.launch('audio', {
				
			})
			
			let shaderText = this.cache.text.entries.entries['shader']
			this.customPipeline = game.renderer.addPipeline('Custom', new CustomPipeline2(game, shaderText));
			window.shader = this.customPipeline 
			
			this.scene.start('play', {
				title: "Nevada's 28th"
				//title: 'suppress'
			})
		}
	}
	
	
	init()
})()