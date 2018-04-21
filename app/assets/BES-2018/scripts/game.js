window.game = (function(){
	
var WIDTH = 800
var HEIGHT = 600
var op = {} 



var preloader = {
	preload: function(){
		console.log('preloading...')
		// https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 && xhr.status === 200){
				//console.log(xhr.responseText)
				game.data = JSON.parse(xhr.responseText)
				game.state.start('loader')
			}
		}
		xhr.open('GET', '/json-handler/' + game.lvl, true);
		xhr.send();
		
		
	},
}

var loader = {
	preload: function(){
		console.log('loading...')
		var fp = document.getElementById('img_dir').innerHTML
		var s 
		for(var i = 0; i < game.data.sprites.length; i++){
			s = game.data.sprites[i]
			if(!s) continue
			
			var key = s.key 
			console.log('\t'+key)
			
			if(s.data.frames > 1){
				fw = s.data.img_width/s.data.scale/ s.data.frames
				fh = s.data.img_height/s.data.scale
				
				game.load.spritesheet(key, fp + key, fw, fh)
			}else{
				game.load.spritesheet(key, fp + key)
			}
		}
		
		console.log('\t'+game.data.bg)
		game.load.spritesheet('bg', fp + game.data.bg)
		
		//game.load.spritesheet('button', fp + 'button.png', 100, 38)
		
		
		fp = document.getElementById('audio_dir').innerHTML
		for(var s in game.data.audio){
			if(game.data.audio.hasOwnProperty(s)){
				if(game.data.audio[s] !== ""){
					console.log('\t', fp + game.data.audio[s])
					game.load.audio(s, fp + game.data.audio[s])
				}
				
			}
		}
	},
	create: function(){
		game.state.start('menu')
	}
}

var menu = {
	create: function(){
		game.state.start('play', true, false, game)
		
		
	}
}

var test = {
	preload: function(){
		var fp = document.getElementById('img_dir').innerText
		game.load.spritesheet('ball', fp+'ball.png')
	},
	create: function(){
		game.physics.startSystem(Phaser.Physics.P2JS);
		
		game.physics.p2.gravity.y = 500 
		
		var sprite = game.add.sprite(100, 100, 'ball')
		
		game.physics.p2.enable(sprite, true)
		sprite.body.setCircle(15)
		sprite.body.offset.set(8, 17) 
		
		//sprite.body.setCircle(15, -8, -17)
		
	}
}

window.addEventListener('load', function(){
	op.game = game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'game')
	game.lvl = document.getElementById('lvl').innerText
	
	game.state.add('loader', loader)
	game.state.add('menu', menu)
	game.state.add('preloader', preloader)
	game.state.add('play', play)
	game.state.add('test', test)
	
	game.state.start('preloader')
})

return op  
})()