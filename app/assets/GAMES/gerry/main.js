(function(){
/* TO DO:
	UI:
		538:
			Population
			Districts
		Size
		Count
		RESET Button 
	SFX
	Level Select
	Tutorial

*/
	const path = '/static/GAMES/gerry/'
	
	let config = {
		width: 1920,
		height: 1080,
		backgroundColor: '#45283c',
		pixelArt: false,
		zoom: 0.5,

	};
	

	let main_menu = {
		create: function(){
			console.log('main menu')
			
		},
		update: function(){

		}
	}

	function init(){
		window.game = new Phaser.Game(config)
		game.scene.add('setup', setup)
		//game.scene.add('menu', menu)
		game.scene.add('main menu', main_menu)
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
			
			
			let v = Math.random()
			
			this.load.text('levels', path+'levels.txt?v='+v)
			
			let sheets = [
				{
					name: 'cards',
					width: 250,
					height: 1270/4,
					ext: 'jpg'
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
				
			]
			
			for(let i = 0; i < sounds.length; i++){
				let s = sounds[i]
				//console.log('load:', s+'.wav')
				this.load.audio(s, path + s+'.wav')
				
			}
			
			this.sound.volume = 0.25
			
			let maps = []
			maps.forEach(m => {
				this.load.tilemapTiledJSON(m, path + 'maps/' + m + '.json?v='+v)
				console.log(m, path + 'maps/' + m + '.json?v='+v)
			})
		
		},
		create:	function create(){
	
			this.scene.start('play', {
				title: 'Six By Three'
			})
		},
		update: function update(){
		}
	}
	
	
	init()
})()