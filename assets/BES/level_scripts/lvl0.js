console.log('Level 0 Script loaded');

var width, height

var loader = {	sheet: undefined,
				background: undefined,
				foreground: undefined,
				loaded: false,
				count: 0,
				max: 4,
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
					this.you_win = new Image()
					this.you_win.onload = function(){loader.inc()}

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

					this.you_win.src = '/static/BES/imgs/you_win.png'

					this.loaded = true
				}
			}

var bg = {wiggle_amount: 0,
		  wiggle_time: 0,
		  scene: 0,
		  draw: function(){
				var canvas = document.getElementById('canvas')
				var context = canvas.getContext('2d')
				var wig_x = (this.wiggle_time > 0 ? this.wiggle_amount*(2*Math.random()-1) : 0)
				var wig_y = (this.wiggle_time > 0 ? this.wiggle_amount*(2*Math.random()-1) : 0)

				var sx = 0 + this.dx + wig_x
				var sy = 0 + this.dy + this.scene*loader.background.height/this.count + wig_y
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
				var bg_height = loader.background.height/this.count
				var bd_x = bg_width - width
				var bd_y = bg_height - height

				/*
				this.dx = game.ball.x*bd_x/width
				this.dy = game.ball.y*bd_y/height
				*/
				this.dx = bd_x/2
				this.dy = bd_y/2

				this.wiggle_time -= 1
			},
			wiggle: function(amount, time){
				this.wiggle_amount = amount
				this.wiggle_time = time
			}
		  }


function Tile(i, x, y){
	this.i = i
	this.y = -128 + -2048*Math.random()
	this.x = x
	this.y0 = y
	this.vx = 4*(Math.random()*2-1)
	this.vy = -4
	this.g = .2
	this.width = this.height = 64
	this.broken = false
	this.alive = true
}

Tile.prototype.draw = function(){
	var canvas = document.getElementById('canvas')
	var context = canvas.getContext('2d')
	var sx = 128*(this.i%5)
	var sy = 128*Math.floor(this.i/5)
	var sw = 128
	var sh = 128
	var dx = this.x
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

Tile.prototype.hit = function(ball){
	var dx = Math.abs(ball.x - this.x - this.width/2)
	var dy = Math.abs(ball.y - this.y - this.height/2)

	if(dx > (this.width/2 + ball.r)){
		return false
	}
	if(dy > (this.height/2 + ball.r)){
		return false
	}

	if(dx <= this.width/2){
		return true
	}

	if(dy <= this.height/2){
		return true
	}

	var d2 = (dx - this.width/2)*(dx - this.width/2) + (dy - this.height/2)*(dy - this.height/2)

	return d2 <= ball.r*ball.r

}

Tile.prototype.tween = function(x, x0){
	if(Math.abs(x0 - x) < .01){
		return x0 - x
	}
	return (x0 - x) * .1
}

Tile.prototype.update = function(){
	if(this.broken){
		this.vy += this.g

		this.x += this.vx
		this.y += this.vy

		if(this.y > height){
			this.alive = false
		}
		if(this.width < 256){
			this.width += 1
			this.height += 1
		}
	}else{

		this.y += this.tween(this.y, this.y0)



		if(this.hit(game.ball)){
			/********
			  \  b  /
			   \ _ /
			 c  |_|  a
			   /   \
			  /  d  \
			**********/
			var ad = this._ad(game.ball)
			var cd = this._cd(game.ball)
			this.vx = 3*game.ball.vx
			this.vy = game.ball.vy > 0 ? 9 : -6

			game.background.wiggle(3, 10)

			if(ad){
				if(cd){ // d
					game.ball.vy *= -1
				}else{ //a
					game.ball.vx *= -1
				}
			}else{
				if(cd){ // c
					game.ball.vx *= -1
				}else{ // b
					game.ball.vy *= -1
				}
			}
			this.broken = true
		}
	}
}

Tile.prototype._cd = function(ball){
	return ball.y > (this.height/this.width)*(ball.x - this.x) + this.y
}

Tile.prototype._ad = function(ball){
	return ball.y > (-this.height/this.width)*(ball.x - this.x) + this.y + this.width
}

function Ball(){
	this.x = width/2
	this.y = height/2
	this.r = 16
	this.vx = 2
	this.vy = 2
	this.trail = []
	this.t = 0
}

Ball.prototype.draw = function(){
	var canvas = document.getElementById('canvas')
	var context = canvas.getContext('2d')

	context.lineWidth = 3

	/*
	for(var i = 0; i < this.trail.length; i += 10){
		context.fillStyle = 'rgba(100, 255, 100,' + i/100 + ')'
		context.strokeStyle = 'rgba(0, 0, 0, ' + i/100 + ')'

		context.beginPath()
		context.arc(this.trail[i][0], this.trail[i][1], this.r, 0, Math.PI * 2, false)
		context.fill()
		context.stroke()
	}
	//*/
	context.fillStyle = 'rgba(100, 255, 100, .8)'
	context.strokeStyle = 'rgba(0, 0, 0, .8)'

	context.beginPath()
	context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
	context.fill()
	context.stroke()



}

Ball.prototype.update = function(){
	this.t += 1
	if(this.x + this.r > width){
		game.background.wiggle(3, 10)
		this.vx *= -1
		this.x = width - this.r
	}
	if(this.x - this.r < 0){
		game.background.wiggle(3, 10)
		this.vx *= -1
		this.x = this.r
	}

	if(this.y  - 2*this.r > height){
		game.background.wiggle(3, 30)
		this.x = width/2
		this.y = height/2
		this.r = 16
		this.vx = 2
		this.vy = 2
		game.make_block()
		game.background.scene = (game.background.scene + 1)%game.background.count
	}

	if(this.y - this.r < 0){
		game.background.wiggle(3, 10)
		this.vy *= -1
		this.y = this.r
	}

	this.x += this.vx
	this.y += this.vy

	if(this.t % 1 == 0){
		this.trail.push([this.x, this.y])
		if(this.trail.length > 100){
			this.trail.splice(0,1)
		}
	}


}

var paddle = {setup: function(){
				  this.width = this.w0 = width/6
				  this.height = this.h0 = .03*height
				  this.x = width/2 - this.width/2
				  this.y = .9*height
				  this.vx = 0
				  this.ax = 0
				  this.fr = .8
			  },
			  draw: function(){
					var canvas = document.getElementById('canvas')
					var context = canvas.getContext('2d')
					/*
					var sx = 128*(this.i%5)
					var sy = 128*Math.floor(this.i/5)
					var sw = 128
					var sh = 128
					*/
					var dx = this.x + this.w0/2 - this.width/2
					var dy = this.y + this.h0/2 - this.height/2
					var dw = this.width
					var dh = this.height

					context.fillStyle = 'rgba(100, 100, 255, .8)'
					context.fillRect(dx, dy, dw, dh)
					context.strokeRect(dx, dy, dw, dh)

			  },
			  update: function(){
					var a = 3
					if(keydown.A || keydown.left){
						this.ax = -a
					}else if(keydown.D || keydown.right){
						this.ax = a
					}else{
						this.ax = 0
					}

					this.vx += this.ax
					this.vx *= this.fr
					this.x += this.vx
					this.x = constrain(this.x, 0, width - this.width)



					if(this.hit(game.ball)){
						/********
						  \  b  /
						   \ _ /
						 c  |_|  a
						   /   \
						  /  d  \
						**********/
						var ad = this._ad(game.ball)
						var cd = this._cd(game.ball)


						game.background.wiggle(3, 10)

						if(ad){
							if(cd){ // d
								game.ball.vy = Math.abs(game.ball.vy)
							}else{ //a
								game.ball.vx = Math.abs(game.ball.vx)
							}
						}else{
							if(cd){ // c
								game.ball.vx = -Math.abs(game.ball.vx)
							}else{ // b
								/* Too Slow
								game.ball.vy = -1.1*Math.abs(game.ball.vy)
								var scale = this.x + this.width/2 - game.ball.x
								game.ball.vx = -12*scale/this.width
								//*/
								var center = this.x + this.width/2
								var scale = 2*(this.x - game.ball.x)/this.width
								var theta = Math.PI*scale/2

								var v = Math.sqrt(game.ball.vx*game.ball.vx + game.ball.vy*game.ball.vy)
								console.log(v)
								v = .9*v + .1*10

								game.ball.vx = -v*Math.cos(theta)
								game.ball.vy = v*Math.sin(theta)

							}
						}
					}



			  },
			  hit: Tile.prototype.hit,
			  _ad: Tile.prototype._ad,
			  _cd: Tile.prototype._cd

			}

var game = {i: 0,
			paused: {now:false, down:false, text_visible:false, subtext_visible:false},
			setup: function(){
					this.background = bg
					this.background.count = level === '0Hw' ? 7 : level ==='0Ho' ? 4 : 5
					this.tiles = []
					for(var i = 0; i < 15; i++){
						this.make_block()
					}
					this.ball = new Ball()
					this.paddle = paddle
					this.paddle.setup()
				},
			draw: function(){
					this.background.draw()
					this.ball.draw()
					this.paddle.draw()

					for(var i = 0; i < this.tiles.length; i++){
						this.tiles[i].draw()
					}

					if(this.tiles.length <= 0){
						var canvas = document.getElementById('canvas')
						var context = canvas.getContext('2d')

						context.drawImage(loader.you_win, 0, 0)

						/*
						context.textBaseline = 'top'
						context.textBaseline = 'top'
						context.fillStyle = 'black'
						context.strokeStyle = 'white'
						context.textAlign = 'center'
						context.font = "bold 86px Arial"
						context.strokeText('You Win!', 320, 100)
						context.fillText('You Win!', 320, 100)
						*/

					}
					if(this.paused.text_visible){
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
			update: function(){
					this.background.update()
					if(this.tiles.length > 0){

						for(var i = 0; i < this.tiles.length; i++){
							this.tiles[i].update()
						}
						this.ball.update()
						this.paddle.update()
						var alive = []
						for(var i = 0; i < this.tiles.length; i++){
							if(this.tiles[i].alive){
								alive.push(this.tiles[i])
							}
						}
						this.tiles = alive
						this.tiles.sort(function(a,b){
							if(a.broken == b.broken){
								return 0
							}else if(a.broken){
								return 1
							}else{
								return -1
							}
						})
					}

				},
			make_block: function(){
				switch(level){
					case '0Hw':
						if(this.i < 6*7-1){
							this.tiles.push(new Tile(this.i%15,
													 64*1.5 + 64*(this.i%7),
													 64*.5 + 64*Math.floor(this.i/7)))
							this.i += 1
						}
						break
					case '0Ho':
						if(this.i < 6*5-1){
							var x = (Math.floor(this.i/5) % 2 ? 64 : 0) + 128*(this.i%5)
							var y = 0*64*.5 + 64*Math.floor(this.i/5)
							this.tiles.push(new Tile(this.i%12, x, y))
							this.i += 1
						}
						break
					case '0T':
						if(this.i < 6*5-1){
							var x = 64*(this.i % 10)
							var y = 0*64*.5 + 64*Math.floor(this.i/5)
							this.tiles.push(new Tile(this.i%14, x, y))
							this.i += 1
						}
						break
					case '0W':
						if(this.i < 6*5-1){
							var x = 128*(this.i % 5)
							var y = 0*64*.5 + 64*Math.floor(this.i/5)
							this.tiles.push(new Tile(this.i%13, x, y))
							this.i += 1
						}
						break

					default:
				}
			}
		}


function init(){
	setup_globals()
	setup_canvas()
	loader.load()
	window.disp.setup()
	game.setup()
	window.requestAnimationFrame(tick)
}



function setup_canvas(){
	console.log('Setup Canvas')
	var canvas = document.createElement('canvas')
	canvas.id = 'canvas'
	canvas.width = width
	canvas.height = height

	document.body.appendChild(canvas)
}

function setup_globals(){
	// Yuck.
	width = 64*10
	height = 64*8

	level = window.location.pathname.match(/\w+$/)[0]
	sheetname = level + '.png'
	backgroundname = level + '_bg'
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