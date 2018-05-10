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
		
		game.load.image('loading', '/static/BES-2018/img/loading.png')
		
	},
	create: function(){
		var loading = game.add.sprite(game.width/2, game.height/2, 'loading')
		loading.anchor.set(.5)
	}
}

function count(obj){
	var op = 0
	for(var key in obj){
		if(obj.hasOwnProperty(key)){
			op += 1
		}
	}
	return op 
}

var loader = {
	preload: function(){
		console.log('loading...')
		var loading = game.add.sprite(game.width/2, game.height/2, 'loading')
		loading.anchor.set(.5, 1)
		
		
		var buff = 3
		var g = game.add.graphics(0, 0)
		g.lineStyle(buff, 0xFFFFFF, 1)
		var w = .75*game.width
		var h = w/8
		var x0 = game.width/2 - w/2
		var y0 = game.height/2 + h/4
		g.drawRect(x0, y0, w, h)
		
		
		var bar = game.add.graphics(x0 + 2*buff, y0+ 2*buff)
		bar.beginFill(0xFFFFFF, 1)
		bar.drawRect(0, 0, w - 2*2*buff, h-2*2*buff)
		bar.endFill()
		bar.width = 0
		
		
		var winning = ['win.jpg', 'replay', 'select', 'next']
		
		var c = 0 
		var fp = document.getElementById('img_dir').innerHTML
		var s 
		var tot = game.data.sprites.length + count(game.data.audio) + winning.length 
		
		for(var i = 0; i < winning.length; i++){
			c += 1
			bar.scale.x = c/tot 
			
			s = winning[i]
			var ext = '/static/BES-2018/img/'
			var link = ext + s 
			if(!link.endsWith('.jpg')){
				link += '.png'
			}
			game.load.spritesheet(s, link)
		}
		
		for(var i = 0; i < game.data.sprites.length; i++){
			c += 1 
			bar.scale.x = c/tot 
			
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
					c += 1 
					bar.scale.x = c/tot 
					console.log('\t', fp + game.data.audio[s])
					game.load.audio(s, fp + game.data.audio[s])
				}
				
			}
		}
		//console.log([c, tot])
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
	game.state.add('win', play.win)
	
	game.state.start('preloader')
})

return op  
})()