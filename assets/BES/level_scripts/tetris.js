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
	var dx = this.x + 128
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
	this.i = i
	this.y = y
	this.x = x

	this.vy = -4
	this.g = .2
	this.width = this.height = TW
	this.broken = false
	this.alive = true
}

Tile.prototype.draw = tile_draw

function Piece(){
	this.shape = this.shapes[Math.floor(Math.random()*this.shapes.length)]
	this.color = Math.floor(1 + 20*Math.random())
	this.tiles = []
	this.x = 5
	this.y = 0
	this.dx = this.dy = 0
	this.vy = game.vy
	this.vx = 0
	this.leftdown = this.rightdown = false
	this.cooldown = 10
	for(var i = 0; i < this.shape.length; i++){
		var tile = new Tile(this.color, 0, 0)
		tile.x = (this.shape[i][0] + this.x)*tile.width
		tile.y = (this.shape[i][1] + this.y)*tile.height
		this.tiles.push(tile)
	}
}

Piece.prototype.rotate = function(ccw){
	var direction = ccw ? 1 : -1
	for(var i = 0; i < this.shape.length; i++){
		var x = this.shape[i][0]
		this.shape[i][0] = -direction*this.shape[i][1]
		this.shape[i][1] = direction*x
	}
	if(!this.get_legal(0,0)){
		if(this.get_legal(0, -1)){
			this.y -= 1
		}else if(this.get_legal(1, 0)){
			this.x += 1
		}else if(this.get_legal(-1,0)){
			this.x -= 1
		}else{
			for(var i = 0; i < this.shape.length; i++){
				var x = this.shape[i][0]
				this.shape[i][0] = direction*this.shape[i][1]
				this.shape[i][1] = -direction*x
			}
		}
	}
}

Piece.prototype.draw = function(){
	for(var i = 0; i < this.tiles.length; i++){
		this.tiles[i].draw()
	}
}

Piece.prototype.input = function(v){
	if((keydown.A || keydown.left) && ! this.leftdown && this.get_legal(-1, 1)){
		this.vx = -v
	}
	if((keydown.D || keydown.right) && ! this.rightdown && this.get_legal(1,1)){
		this.vx = v
	}
	if((keydown.S || keydown.down) && ! this.downdown){
		this.rotate(false)
	}
	if((keydown.W || keydown.up) && ! this.updown){
		this.rotate(true)
	}
	this.downdown = (keydown.S || keydown.down)
	this.updown = (keydown.W || keydown.up)
	
	
	
	if(this.leftdown > 0){
		this.leftdown -= 1
	}else{
		this.leftdown = keydown.left || keydown.A ? this.cooldown : 0
	}
	
	if(this.rightdown > 0){
		this.rightdown -= 1
	}else{
		this.rightdown = keydown.right || keydown.D ? this.cooldown : 0
	}
}

Piece.prototype.get_legal = function(dx, dy){
	for(var i = 0; i < this.shape.length; i++){
		var x = this.shape[i][0] + this.x
		var y = this.shape[i][1] + this.y
		if( !game.grid[x+dx] || game.grid[x+dx][y+dy] !== -1){
			return false
		}
	}
	return true
}

Piece.prototype.update = function(){
	this.dy += this.vy
	this.dx += this.vx
	
	if(this.dy >= 1){
		this.dy = 0
		this.y += 1
		if(! this.get_legal(this.dx, 1)){
			this.placed = true
		}
	}
	
	this.input(.2)
	

	if(this.dx > 1){
		this.dx = 0
		this.vx = 0
		this.x += 1
	}
	if(this.dx < -1){
		this.dx = 0
		this.vx = 0
		this.x -= 1
	}

	for(var i = 0; i < this.tiles.length; i++){
		tile = this.tiles[i]
		tile.x = (this.shape[i][0] + this.x + this.dx)*tile.width
		tile.y = (this.shape[i][1] + this.y + this.dy)*tile.height
	}
}

Piece.prototype.shapes = [[[-1, -1], [0, -1], [1, -1], [2, -1]], [[-1, -1], [0, -1], [1, -1], [1, 0]], [[-1, -1], [0, -1], [1, -1], [-1, 0]], [[-1, -1], [-1, 0], [0, -1], [0, 0]], [[-1, -1], [0, -1], [0, 0], [1, -1]], [[-1, -1], [-1, 0], [0, 0], [0, 1]], [[-1, -1], [0, -1], [0, 0], [1, 0]]]


game = {start: function(){
			tick()
			this.start = function(){}
		},
		setup: function(){
			this.i = 0
			this.pieces = []
			this.vy = .1
			this.cooldown = -1
			this.paused = {now:false, down:false, text_visible:false, subtext_visible:false}
			this.grid = []
			var gw = 12
			var gh = 16
			for(var i = 0 ; i < gw; i ++){
				this.grid[i] = []
				for(var j = 0; j < gh; j ++){
					if(i == 0 || i == gw-1 || j == gh-1){
						this.grid[i][j] = 0
					}else{
						this.grid[i][j] = -1
					}
				}
			}
			this.pieces.push(new Piece())
		},
		draw: function(){
			bg.draw()
			for(var i = 0; i < this.pieces.length; i++){
				this.pieces[i].draw()
			}
			this.grid_draw()
			this.draw_pause()
			
		},
		grid_draw: function(){
			for(var i = 0; i < this.grid.length; i++){
				for(var j = 0; j < this.grid[0].length; j++){
					if(this.grid[i][j] >= 0){
						var t = {i: this.grid[i][j], 
								 x: i*TW,
								 y: j*TW,
								 width: TW,
								 height: TW}
						tile_draw.apply(t)
					}
				}
			}
		},
		update: function(){
			bg.update()
			var keepers = []
			for(var i = 0; i < this.pieces.length; i++){
				this.pieces[i].update()
				if(this.pieces[i].placed){
					this.pieces[i].vy = 0
					if(this.cooldown == -1){
						this.cooldown = 15
						keepers.push(this.pieces[i])
					}else if(this.cooldown <= 1){
						this.place(this.pieces[i])
						keepers.push(new Piece())
						this.cooldown = -1
					}else{
						this.cooldown -= 1
						keepers.push(this.pieces[i])
						if(this.pieces[i].get_legal(0, 1)){
							this.pieces[i].placed = false
							this.cooldown = -1
							this.pieces[i].vy = this.vy
						}
					}
					
				}else{
					keepers.push(this.pieces[i])
				}
			}
			this.pieces = keepers
			
		},
		draw_pause: function(){
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
		place: function(piece){
			for(var i = 0; i < piece.shape.length; i++){
				var x = piece.shape[i][0] + piece.x
				var y = piece.shape[i][1] + piece.y
				this.grid[x][y] = piece.color
			}
			this.row()
		},
		row: function(){
			for(var j = 0; j < this.grid[0].length; j++){
				var row = true
				for(var i = 1; i < this.grid.length - 1; i++){
					if(this.grid[i][j] <= 0){
						row = false
						break
					}
				}
				if(row){
					for(var i = 1; i < this.grid.length - 1; i++){
						this.grid[i][j] = -1
					}
					for(var jj = j; jj > 0; jj--){
						for(var i = 1; i < this.grid.length - 1; i++){
							this.grid[i][jj] = this.grid[i][jj - 1]
						}
					}
				}
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
	TW = 32
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