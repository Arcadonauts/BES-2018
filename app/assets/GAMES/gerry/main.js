(function(){

	let zoom = 2 

	const path = '/static/GAMES/gerry/'
	
	let config = {
		width: 1920/zoom,
		height: 1080/zoom,
		backgroundColor: '#45283c',
		pixelArt: false,
		zoom: 0.5*zoom,
		physics: {
			default: 'arcade',
			arcade: {
				debug: false,
			}
		}
	};
	

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
		//game.scene.add('menu', menu)
		game.scene.add('main menu', main_menu)
		game.scene.add('menu', menu)
		game.scene.add('audio', audio)
		game.scene.add('tut', tut)
		game.scene.add('play', play)
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
			
			
			let v = 5//Math.random()
			
			this.load.text('levels', path+'levels.txt?v='+v)
			
			let sheets = [
				{
					name: 'cards',
					width: 250,
					height: 1270/4,
					ext: 'jpg'
				},
					{
					name: 'split',
					width: 173,
					height: 33,
					ext: 'png'
				},
				{
					name: 'gerry top',
					width: 1203,
					height: 327,
					ext: 'png'
				},
				{
					name: 'paper',
					width: 1920,
					height: 1080,
					ext: 'jpg'
				},
				{
					name: 'voters',
					width: 150,
					height: 300,
					ext: 'png'
				},
				{
					name: 'borders',
					width: 140,
					height: 175,
					ext: 'png'
				},
				{
					name: 'reset',
					width: 704,
					height: 254,
					ext: 'png'
				},
				{
					name: 'pie',
					width: 250,
					height: 290,
					ext: 'png'
				},
				{
					name: 'decorations',
					width: 450,
					height: 450,
					ext: 'png'
				},
				{
					name: 'pointer',
					width: 250,
					height: 250,
					ext: 'png'
				},
				{
					name: 'banner',
					width: 1479,
					height: 762,
					ext: 'png'
				},
				{
					name: 'horn',
					width: 884,
					height: 509,
					ext: 'png'
				},
				{
					name: 'dots',
					width: 24,
					height: 24,
					ext: 'png'
				},
				{
					name: 'frames',
					width: 360,
					height: 480,
					ext: 'png'
				},
				{
					name: 'continue',
					width: 912,
					height: 324,
					ext: 'png'
				}
			]
		
			sheets.forEach(s => {
				
				this.load.spritesheet(
					s.name, 
					path+'images/'+s.name+'.'+(s.ext || '.png')+'?v='+v, 
					{ 
						frameWidth: s.width/zoom, 
						frameHeight: s.height/zoom 
					}
				)
			})
			
			//this.load.json('data', path+'data.json?v='+v)
			
			let sounds = [
				'Haydn',
				'click',
				'whistle',
				'tick'
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
		
		},
		create:	function create(){
			levels.init(this)
			this.scene.launch('audio', {
				
			})
			
			this.scene.start('main menu', {
				title: "Nevada's 28th"
				//title: 'suppress'
			})
		}
	}
	
	
	init()
})()