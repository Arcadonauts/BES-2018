console.log('Level 0Hw Script loaded');

var width, height

var loader = {	sheet: undefined,
				background: undefined,
				foreground: undefined,
				loaded: false,
				count: 0,
				max: 3,
				//text: new createjs.Text("Loading...", "bold 86px Arial"),
				inc: function(){
					this.count += 1
				},
				load: function load(){
					if(this.loaded){
						return
					}
					console.log('Loading Images...')
					var loader = this
					this.sheet = new Image()
					this.sheet.onload = function(){loader.inc()}
					this.background = new Image()
					this.background.onload = function(){loader.inc()}
					this.foreground = new Image()
					this.foreground.onload = function(){loader.inc()}

					try{ // Did the data file load properly?
						this.sheet.src = "/static/BES/imgs/" + sheetname
					}catch(e){
						window.location = '/'
					}

					if(backgroundname){
						try{
							var bg_name = backgroundname.split('.')[0]
							this.background.src = '/static/BES/imgs/' + bg_name + '.jpg'
						}catch(e){
							this.background.src = backgroundname
						}
					}else{
						this.count += 1
					}

					if(foregroundname){
						this.foreground.src = '/static/BES/imgs/' + foregroundname
					}else{
						this.count += 1
					}

					this.loaded = true
				}
			}

var bg = {wiggle_amount: 0,
		  wiggle_time: 0,
		  scene: 0,
		  dx: 0,
		  dy: 0,
		  draw: function(){
				var canvas = document.getElementById('canvas')
				var context = canvas.getContext('2d')
				var wig_x = (this.wiggle_time > 0 ? this.wiggle_amount*(2*Math.random()-1) : 0)
				var wig_y = (this.wiggle_time > 0 ? this.wiggle_amount*(2*Math.random()-1) : 0)

				var sx = 0 + this.dx + wig_x
				var sy = 0 + this.dy + this.scene*loader.background.height + wig_y
				var sw = width
				var sh = height
				var dx = 0
				var dy = 0
				var dw = width
				var dh = height
				//console.log(loader.background, sx, sy, sw, sh, dx, dy, dw, dh)
				context.drawImage(loader.background, sx, sy, sw, sh, dx, dy, dw, dh)

			},
			update: function(){
				var bg_width = loader.background.width
				var bg_height = loader.background.height/7
				var bd_x = bg_width - width
				var bd_y = bg_height - height

				/*
				this.dx = game.ball.x*bd_x/width
				this.dy = game.ball.y*bd_y/height
				*/
				//this.dx = bd_x/2
				//this.dy = bd_y/2

				this.wiggle_time -= 1
			},
			wiggle: function(amount, time){
				this.wiggle_amount = amount
				this.wiggle_time = time
			}
		  }


var tile_draw = function(){
	var canvas = document.getElementById('canvas')
	var context = canvas.getContext('2d')
	var sx = 64*(this.i%10)
	var sy = 64*Math.floor(this.i/10)
	var sw = 64
	var sh = 64
	var dx = this.x //+ 128
	var dy = this.y
	var dw = this.width
	var dh = this.height
	//console.log(i)
	//console.log(loader.sheet, sx, sy, sw, sh, dx, dy, dw, dh)
	if(!this.broken){
		context.fillStyle = 'rgba(255, 100, 100, .5)'
		context.fillRect(dx, dy, dw, dh)
		context.strokeRect(dx, dy, dw, dh)
	}
	context.drawImage(loader.sheet, sx, sy, sw, sh, dx, dy, dw, dh)
}

function Tile(i, x, y){
	this.i = i || Math.floor(Math.random()*game.tile_count)
	this.y = y || 0
	this.x = x || 0

	this.width = this.height = TW
	this.broken = false
	this.alive = true
}

Tile.prototype.draw = tile_draw

Tile.prototype.update = function(x, y){
	this.x = x
	this.y = y

	var w = this.width
	var h = this.height

	var px = game.player.x
	var py = game.player.y
	var pw = game.player.width
	var ph = game.player.height

	if(x < px + pw && x + w > px){
		if(y < py + ph && y + h > py){
			game.player.update = game.player.explode
		}
	}

}

function Player(){
	this.x = 64*2
	this.y = 64*4
	this.width = this.height = 32

	this.vy = 0
	this.ay = .4
	this.vmax = 8
	this.fr = .95

	this.alive = true
}

Player.prototype.draw = function(){
	//console.log('player')
	var canvas = document.getElementById('canvas')
	var context = canvas.getContext('2d')

	context.lineWidth = 3

	context.fillStyle = 'rgba(100, 255, 100, 1)'
	context.strokeStyle = 'rgba(0, 0, 0, .8)'

	context.beginPath()
	context.moveTo(this.x, this.y)
	context.lineTo(this.x + this.width, this.y)
	context.lineTo(this.x + this.width, this.y + this.height)
	context.lineTo(this.x, this.y + this.height)
	context.fill()
	context.stroke()
}

Player.prototype.update = function(){
	var up = keydown.W || keydown.up
	var down = keydown.S || keydown.down

	if(up){
		this.vy -= this.ay
	}
	if(down){
		this.vy += this.ay
	}
	this.vy *= this.fr
	this.vy = constrain(this.vy, -this.vmax, this.vmax)

	this.y += this.vy

}

Player.prototype.explode = function(){
	this.x -= game.v
	game.game_over = true
}


game = {start: function(){
			tick()
			this.start = function(){}
		},
		setup: function(){
			this.score = 0
			this.game_over = false
			this.timer = 0
			this.pieces = []
			this.tile_count = 40
			this.cols = 11
			this.rows = 8
			for(var i = 0; i < this.cols; i++){
				this.pieces[i] = []
				for(var j = 0; j < this.rows; j++){
					if(j === 0 || j === this.rows - 1){
						this.pieces[i][j] = new Tile()
					}else{
						this.pieces[i][j] = undefined
					}
				}
			}

			this.player = new Player()

			this.paused = {now:false, down:false, text_visible:false, subtext_visible:false}

			this.new_col = this.open

			this.dx = 0
			this.v = 2
			this.diff = .1
			this.tw = 64
			this.cave_height = 0
		},
		draw: function(){
			bg.draw()
			this.player.draw()
			for(var i = 0; i < this.pieces.length; i++){
				for(var j = 0; j < this.pieces[i].length; j++){
					if(this.pieces[i][j]){
						this.pieces[i][j].draw()
					}
				}
			}
			this.draw_pause()
			this.draw_game_over()

		},
		update: function(){
			this.timer += 1
			this.diff = constrain(this.diff + .0001, 0 , 1)
			this.v += .001
			bg.update()
			this.player.update()
			this.dx -= this.v
			if(this.dx < -this.tw){
				this.dx += this.tw
				this.pieces.shift()
				this.pieces.push(this.new_col(this.diff))
			}


			for(var i = 0; i < this.cols; i++){
				for(var j = 0; j < this.rows; j++){
					if(this.pieces[i][j]){
						this.pieces[i][j].update(this.tw*i + this.dx, this.tw*j)
					}
				}
			}

			if(this.timer % 500 < 100){
				this.new_col = this.open
			}else if(this.timer % 500 === 100){
				//console.log('Changing it up')
				var modes = [this.rand, this.cave]
				var i = Math.floor(modes.length*Math.random())
				this.new_col = modes[i]
			}

			if(keydown.space && this.game_over){
				init()
			}
		},
		open: function(){
			var col = []
			for(var j = 0; j < this.rows; j++){
				if(j === 0 || j === this.rows - 1){
					col[j] = new Tile()
				}else{
					col[j] = undefined
				}
			}

			return col
		},
		cave: function(diff){

			var gap = Math.floor((6-3*diff))
			var dy
			if(this.cave_height <= 0){
				dy = 1
			}else if(this.cave_height + gap >= this.rows - 1){
			    dy = -1
			}else{
				dy = Math.floor(3*Math.random() - 1)
			}
			this.cave_height += dy

			var col = []
			for(var j = 0; j < this.rows; j++){
				if(j <= this.cave_height || j >= this.cave_height + gap){
					col[j] = new Tile()
				}else{
					col[j] = undefined
				}
			}

			return col

		},
		rand: function(count){
			//console.log('rand')
			var col = []
			for(var j = 0; j < this.rows; j++){
				if(j === 0 || j === this.rows - 1){
					col[j] = new Tile()
				}else{
					col[j] = undefined
				}
			}
			if(Math.random() < count){
				var j = Math.floor(col.length*Math.random())
				col[j] = new Tile()
			}
			return col
		},
		draw_pause: function(){
			if(this.paused.text_visible && !this.game_over){
				var canvas = document.getElementById('canvas')
				var context = canvas.getContext('2d')

				context.textBaseline = 'top'
				context.textBaseline = 'top'
				context.fillStyle = 'black'
				context.strokeStyle = 'white'
				context.textAlign = 'center'
				context.font = "bold 86px Arial"
				context.strokeText('PAUSED', 320, 100)
				context.fillText('PAUSED', 320, 100)

				context.font = "bold 42px Arial"
				context.strokeText("Press P to resume play.", 320, 180)
				context.fillText("Press P to resume play.", 320, 180)

			}
		},
		draw_game_over: function(){
			if(this.game_over){
				this.score = this.score || this.timer
				var canvas = document.getElementById('canvas')
				var context = canvas.getContext('2d')

				context.textBaseline = 'top'
				context.textBaseline = 'top'
				context.fillStyle = 'black'
				context.strokeStyle = 'white'
				context.textAlign = 'center'
				context.font = "bold 86px Arial"
				context.strokeText('GAME OVER', 320, 100)
				context.fillText('GAME OVER', 320, 100)

				context.font = "bold 42px Arial"
				context.strokeText("Score: " + this.score, 320, 190)
				context.fillText("Score: " + this.score, 320, 190)

				context.font = "bold 36px Arial"
				context.strokeText("Press SPACE to retry", 320, 240)
				context.fillText("Press SPACE to retry", 320, 240)

			}
		}
	}



function init(){
	setup_globals()
	setup_canvas()
	loader.load()
	window.disp.setup()
	game.setup()
	game.start()
}



function setup_canvas(){
	console.log('Setup Canvas')
	var canvas = document.getElementById('canvas')
	if(canvas){
		return
	}else{
		canvas = document.createElement('canvas')
		canvas.id = 'canvas'
		canvas.width = width
		canvas.height = height

		document.body.appendChild(canvas)
	}
}

function setup_globals(){
	// Yuck.
	width = 64*10
	height = 64*8
	TW = 64
	var name = document.location.pathname.match(/\w+$/)
	sheetname = name + '.png'
	backgroundname = name + '_bg'
	foregroundname = ''
}

function tick(){
	game.draw()
	if(loader.count < loader.max){
		var canvas = document.getElementById('canvas')
		var context = canvas.getContext('2d')

		context.textBaseline = 'top'
		context.textBaseline = 'top'
		context.fillStyle = 'black'
		context.strokeStyle = 'white'
		context.textAlign = 'center'
		context.font = "bold 86px Arial"
		context.strokeText('Loading...', 320, 100)
		context.fillText('Loading...', 320, 100)
	}else{
		if(game.paused.now){
			if(!game.paused.text_visible){
				game.paused.text_visible = true
				game.paused.subtext_visible = true

			}
		}else{
			game.paused.text_visible = false
			game.paused.subtext_visible = false
			game.update()
		}
		if(keydown.P && ! game.paused.down){
			game.paused.now = ! game.paused.now
		}
		game.paused.down = keydown.P


	}
	window.requestAnimationFrame(tick)
}