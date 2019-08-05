(function(){
	// https://lospec.com/palette-list/dawnbringer-32
	const TW = 24 
	const path = '/static/GAMES/break/'
	
	let config = {
		width: 15*TW,
		height: 10*TW,
		backgroundColor: '#2d2d2d',
		pixelArt: true,
		zoom: 2,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: {x:0, y:0},
				debug: !true
			}
		}
	};

	function init(){
		window.game = new Phaser.Game(config)
		game.scene.add('setup', setup)
		game.scene.add('editor', editor)
		game.scene.add('breditor', breditor)
		game.scene.add('world', world)
		game.scene.add('breakout', breakout)
		game.scene.add('high_scores', breakout.high_scores)
		game.scene.add('level_select', level_select)
		
		game.scene.start('setup') // Don't change this!
	}
	
	let setup = {
		preload: function(){
			let v = Math.random()
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
							'bg_real'
							]
		
			sheets.forEach(s => 
			this.load.spritesheet(s.name, path+s.name+'.png?v='+v, 
				{ frameWidth: s.width || 24, frameHeight: s.height || 24 }
			))
			
			grounds.forEach(s =>
				this.load.image(s, path+s+'.png?v='+v)
			)
			
			this.load.text('dialog', path+'dialog.txt?v='+v)
		
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
			
			//*
			let name = 'london'
			if(!true){
				this.scene.start('breditor', {name: name}) // Change this
			}else{
				this.scene.start('breakout', {
					style: 'real',
					lvl: 0,
					name: name,
					bomb: 4,
					length: 3,
				})// Change this
			}				
			//*/
			
			/*
			this.scene.start('breakout', {
				style: 'tv',
				lvl: 0,
			})// Change this
			//*/
		},
		update: function update(){
		}
	}
	
	
	init()
})()