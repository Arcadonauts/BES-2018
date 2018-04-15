console.log('Level 1C Script loaded');
// Jumper

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
						this.sheet.src = "img/" + sheetname
					}catch(e){
						window.location = '/'
					}
					
					if(backgroundname){
						try{
							var bg_name = backgroundname.split('.')[0]
							this.background.src = 'img/' + bg_name + '.jpg'
						}catch(e){
							this.background.src = backgroundname
						}
					}else{
						this.count += 1
					}
					
					if(foregroundname){
						this.foreground.src = 'img/' + foregroundname
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
}

Tile.prototype.hit = function(x, y){
	return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height
}

/*
\   /  <- diag_2        
  X      
/   \ <- diag_1            
*/

Tile.prototype.above_diag1 = function(x, y){
	var dh = .1*this.height
	return y - this.y - dh < ((this.height - dh)/this.width)*(x - this.x)
	//return y - this.y < (this.height/this.width)*(x - this.x)
}

Tile.prototype.above_diag2 = function(x, y){
	var dh = .1*this.height
	return y - this.y - dh < ((this.height - dh)/-this.width)*(x - this.x - this.width)
	//return y - this.y < (this.height/-this.width)*(x - this.x - this.width)
}

Tile.prototype.hit_player = function(player){
	
	var w = this.width
	var h = this.height
	
	var px = player.x
	var py = player.y
	var pw = player.width
	var ph = player.height
	
	if(x < px + pw && x + w > px){
		if(y < py + ph && y + h > py){
			return true
		}
	}
	return false
	
}

function Player(){
	this.x = 64*5
	this.y = 64*1
	this.width = this.height = 32
	
	this.vy = this.vx = 0
	this.ax = 1
	this.vy = -1
	this.jump = -30
	this.vmax = 8
	this.fr = .95
	this.g = .8
	
	this.alive = true
	
	this.falling = true
}



Player.prototype.update = function(){

	var up = keydown.W || keydown.up || keydown.space
	var left = keydown.A || keydown.left
	var right = keydown.D || keydown.right
	
	var corners = [[this.x, this.y], [this.x + this.width, this.y],
					[this.x, this.y + this.height], [this.x + this.width, this.y + this.height]]
	
	if(left){
		this.vx -= this.ax
	}
	if(right){
		this.vx += this.ax
	}
	
	this.vx *= this.fr
	
	if(this.falling){
		this.vy += this.g
	}else{
		this.vy = 0
		
		if(up){
			this.vy = this.jump
			this.falling = true
		}
	}
	
	
	this.vy *= this.fr
	
	//this.vx = constrain(this.vx, -this.vmax, this.vmax)
	//this.vy = constrain(this.vy, -this.vmax, this.vmax)
	
	
					
	var actions = [function(tile, player, x, y){
						if(tile.above_diag1(x, y)){ //on right
							player.vx = .5*Math.abs(player.vx)
							player.x = tile.x + tile.width
						}else{ // under
							player.vy = .5*Math.abs(player.vy)
							player.y = tile.y + tile.height + player.vy
						}
					},
					function(tile, player, x, y){
						if(tile.above_diag2(x, y)){ //on left
							player.vx = -.5*Math.abs(player.vx)
							player.x = tile.x - player.width
						}else{ //under
							player.vy = .5*Math.abs(player.vy)
							player.y = tile.y + tile.height + player.vy
						}
					},
					function(tile, player, x, y){
						if(tile.above_diag2(x, y)){ //on top
							player.vy = 0
							player.falling = false
							player.y = tile.y - player.height
							return true
						}else{ //on right
							player.vx = .5*Math.abs(player.vx)
							player.x = tile.x + tile.width
						}
					},
					function(tile, player, x, y){
						if(tile.above_diag1(x, y)){ // on top
							player.vy = 0
							player.falling = false
							player.y = tile.y - player.height
							return true
						}else{ // on left
							player.vx = -.5*Math.abs(player.vx)
							player.x = tile.x - player.width
						}
					
					}
				]
	/*
	0-1
	| |
	2-3
	*/
	this.falling = true
	for(var i = 0; i < corners.length; i++){
		var tile = game.hit(corners[i][0], corners[i][1])
		if(tile){
			this.falling = !actions[i](tile, this, corners[i][0], corners[i][1])
		}
	}
	
	this.fr = this.falling ? .95 : .8
	
	this.x += this.vx 
	this.y += this.vy + game.v
	
	if(this.y > game.tw * game.rows){
		game.game_over = true
	}
	
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
			this.cols = 10
			this.rows = 10
			for(var i = 0; i < this.cols; i++){
				this.pieces[i] = []
				for(var j = 0; j < this.rows; j++){
					if(j == 2){
						this.pieces[i][j] = new Tile()
					}else{
						this.pieces[i][j] = undefined
					}
				}
			}
			this.pieces[3][0] = new Tile()
			this.pieces[4][0] = new Tile()
			this.pieces[5][0] = new Tile()
			
			this.player = new Player()
			
			this.paused = {now:false, down:false, text_visible:false, subtext_visible:false}
			
			this.new_col = this.open
			
			this.dy = -64
			this.v = 2
			this.diff = .1
			this.tw = 64
			this.last_rand = 3
			this.toggle = true
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
			this.dy += this.v
			if(this.dy > 0){//this.tw){
				this.dy -= this.tw
				var row = this.new_col(this.diff)
				for(var i = 0; i < this.cols; i++){
					this.pieces[i].pop()
					this.pieces[i].unshift(row[i])
				}
				//this.pieces.shift()
				//this.pieces.push(this.new_col(this.diff))
			}
			
			
			for(var i = 0; i < this.cols; i++){
				for(var j = 0; j < this.rows; j++){
					if(this.pieces[i][j]){
						this.pieces[i][j].update(this.tw*i, this.tw*j + this.dy)
					}
				}
			}
	
			
			if(keydown.space && this.game_over){
				init()
			}
		},
		open: function(diff){
			var col = []
			for(var j = 0; j < this.cols; j++){
				col[j] = undefined
			}
			
			
			
			if(!this.toggle){
				var start = this.rand()
				var count = Math.floor((1-diff)*3 + 1)
				
				//col[start] = new Tile()
				//*
				for(var i = 0; i < count; i++){
					col[start + i] = new Tile()
				}
				//*/
			}
			this.toggle = (this.toggle + 1) % 3
			
			return col
		},
		rand: function(count){
			//console.log('rand')
			do{
				var op = Math.floor(Math.random()*(this.rows - 2))
			
			}while(op == this.last_rand)
			
			this.last_rand = op
			return op
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
		},
		hit: function(x, y){
			for(var i = 0; i < this.cols; i++){
				for(var j = 0; j < this.rows; j++){
					if(this.pieces[i][j] && this.pieces[i][j].hit(x, y)){
						return this.pieces[i][j]
					}
				}
			}
			return false
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
	var name = document.location.pathname.match(/\w+/)
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