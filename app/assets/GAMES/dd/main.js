(function(){
	// https://lospec.com/palette-list/dawnbringer-32
	const ZOOM = state.ZOOM
	const TW = 24*ZOOM
	const path = '/static/GAMES/dd/'
	
	let config = {
		width: 16*TW,
		height: 9*TW,
		backgroundColor: '#45283c',
		pixelArt: true,
		zoom: 1,
		/*
		physics: {
			default: 'arcade',
			arcade: {
				gravity: {x:0, y:0},
				debug: !true
			}
		},
		*/
		//canvas = document.getElementById('canvas')
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
		game.scene.add('menu', menu)
		game.scene.add('main menu', main_menu)
		game.scene.add('battle', battle)
		game.scene.add('world', world)
		
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
					name: ZOOM+'x_squares',
					width: 30,
					height: 30
				},{
					name: ZOOM+'x_characters',
					width: 24,
					height: 24
				},{
					name: ZOOM+'x_cards',
					width: 64,
					height: 90
				},{
					name: ZOOM+'x_card_art',
					width: 56,
					height: 25
				}, {
					name: ZOOM+'x_buttons',
					width: 48,
					height: 24
				}, {
					name: ZOOM+'x_headshots',
					width: 64,
					height: 45
				}, {
					name: ZOOM+'x_hud',
					width: 24,
					height: 24
				}
			]
		
			sheets.forEach(s => {
				let name
				if(s.name.slice(0,3) === ZOOM+'x_'){
					name = s.name.slice(3)
				}else{
					name = s.name
				}
			
				this.load.spritesheet(
					name, 
					path+'images/'+s.name+'.png?v='+v, 
					{ 
						frameWidth: s.width*ZOOM, 
						frameHeight: s.height*ZOOM 
					}
				)
			})
			
			this.load.json('data', path+'data.json?v='+v)
			
			let sounds = [
				
			]
			
			for(let i = 0; i < sounds.length; i++){
				let s = sounds[i]
				//console.log('load:', s+'.wav')
				this.load.audio(s, path + s+'.wav')
				
			}
			
			this.sound.volume = 0.25
			
			let maps = ['phandalin']
			maps.forEach(m => {
				this.load.tilemapTiledJSON(m, path + 'maps/' + m + '.json?v='+v)
				console.log(m, path + 'maps/' + m + '.json?v='+v)
			})
		
		},
		create:	function create(){
			state.init(this)
			console.log('setup')
			this.scene.start('world', 'phandalin')
		},
		update: function update(){
		}
	}
	
	
	init()
})()