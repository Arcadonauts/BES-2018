window.main = (function(){
	const DIR = "/static/GAMES/gates/"


	var preloader = {
		create: function(){
			game.state.start('loader')
		}
	}
	
	var loader = {
		preload: function(){
			var dir = DIR + 'imgs/'
			var imgs = ['dark_tab', 'light_tab']
			imgs.forEach(function(s){
				game.load.image(s, dir + s + '.png')
			})
			
			var sprites = [
				['tab', 64, 21]
			]
			sprites.forEach(function(s){
				game.load.spritesheet(s[0], dir + s[0] + '.png', s[1], s[2])
			})
			
		},
		create: function(){
			game.state.start('gate')
		}
		
	}
	
	var gate = {
		create: function(){
			tools.make_tab(tools.make_part())
			tools.make_tab(tools.make_gate())
			tools.make_tab(tools.make_board())
			
			tools.tab_manager.select(2)
		}
	}
	

	function init(){
		tools.tab_manager.init()
		
		window.game = new Phaser.Game(800, 600, Phaser.CANVAS);
		
		game.state.add('preloader', preloader)
		game.state.add('loader', loader)
		game.state.add('gate', gate)
		
		game.state.start('preloader')
		
	}
	
	window.addEventListener('load', init)
	

})()

