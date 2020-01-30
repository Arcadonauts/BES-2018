(function(){
	const ZOOM = state.ZOOM

	let path = {
		init: function(scene){
			this.scene = scene 
			this.layers = ['ground', 'walls']
			this.limit = 12 
		},
		get_path: function(t0, tf){
			//console.log(t0)
			//console.log(tf)
			let que = [t0]
			let paths = {
				paths: [],
				limit: this.limit,
				push: function(x, y, tile){
					if(!this.paths[x]){
						this.paths[x] = []
					}
					if(!this.paths[x][y]){
						this.paths[x][y] = []
					}
					if(this.paths[x][y] !== 'TOO LONG'){
						this.paths[x][y].push(tile)
					}
					if(this.paths[x][y].length > this.limit){
						this.paths[x][y] = 'TOO LONG'
					}
				},
				get: function(x, y){
					if(this.paths[x] && this.paths[x][y]){
						if(this.paths[x][y] === 'TOO LONG'){
							return 'TOO LONG'
						}else{
							return this.paths[x][y].slice()
						}
					}else{
						return undefined 
					}
				},
				set: function(x, y, list){
					if(!this.paths[x]){
						this.paths[x] = []
					}
					this.paths[x][y] = list 
				},
				log: function(){
					let op = {too_long: 0, length: 0}
					this.paths.forEach( (row, x) => {
						if(row){
							row.forEach( (t, y) => {
								if(t === 'TOO LONG'){
									op.too_long += 1 
								}else{
									op[x + ', ' + y] = t
									op.length += 1
								}
							})
						}
					})
					//console.log(op)
				}
			}
			paths.push(t0.x, t0.y, t0)
			paths.log()
			while(que.length){
				let current = que.shift()
				let neighs = this.get_neighbors(current)
				//let cur_path = paths.get(current.x, current.y)
				for(let i = 0; i < neighs.length; i++){
					neigh = neighs[i]
					//console.log(neigh.x, tf.x, neigh.y, tf.y)
					if(neigh.x === tf.x && neigh.y === tf.y){
						paths.push(current.x, current.y, neigh)
						if(paths.get(current.x, current.y) !== 'TOO LONG'){
							return paths.get(current.x, current.y)
						}
					}else if(!paths.get(neigh.x, neigh.y)){
						paths.set(neigh.x, neigh.y, paths.get(current.x, current.y))
						paths.push(neigh.x, neigh.y, neigh)
						que.push(neigh)
					}
				}
			}
			paths.log()
			return false 
		},
		get_neighbors: function(tile){
			let neighbors = []
			let dirs = [
				{dir: 'W', dx: -1, dy:  0},
				{dir: 'E', dx:  1, dy:  0},
				{dir: 'N', dx:  0, dy: -1},
				{dir: 'S', dx:  0, dy:  1}
			]
			let tiles = []
			dirs.forEach(dir => {
				let t = this.get_rel_tiles(tile, dir.dx, dir.dy)
				if(t.ground && !t.walls){
					tiles.push(t.ground)
				}
			})
			return tiles 
		},
		get_rel_tiles: function(tile, dx, dy){
			return this.get_tiles(layer => layer.getTileAt(tile.x + dx, tile.y + dy))
		},
		get_tiles_from_tile: function(tile){
			return this.get_tiles(layer => layer.getTileAt(tile.x, tile.y))
		},
		get_tiles_at_world: function(x, y){
			return this.get_tiles(layer => layer.getTileAtWorldXY(x, y))
		},
		get_tiles: function(func){
			let layers = this.layers
			let tiles = {}
			layers.forEach(lay => {
				tiles[lay] = func(this.scene[lay])
			})
			
			return tiles 
		}
	}

	function make_player(scene, who, following){
		let data = state.copy(state.search(state.data.characters, c => c.NAME === who))
		let f0 = 20*data.IMG
		
		let sprite = scene.add.sprite(following.sprite.x + 90, following.sprite.y, 'characters', f0)
		
		state.create_walking_animations(scene, who, f0)
		
		let op = {
			sprite: sprite,
			following: following,
			go: function(to){
				if(!to) return 
				if(this.tween){
					this.tween.stop()
				}
				let xf = to.pixelX + to.width/2
				let yf = to.pixelY + to.height/2
				let dx = xf - this.sprite.x
				let dy = yf - this.sprite.y
				let dir 
				if(dx > 1){
					dir = 'right'
				}else if(dx < -1){
					dir = 'left' 
				}else if(dy < -1){
					dir = 'up'
				}else{
					dir = 'down'
				}
				
				this.sprite.anims.play(who + '-walk-' + dir)
				
				this.tween = scene.tweens.add({
					targets: this.sprite,
					duration: 300,
					x: xf,
					y: yf,
					onComplete: ()=>{
						this.sprite.anims.play(who + '-stand-' + dir)
						this.tween = undefined
						this.following.go()
					}
				})
				if(this.follower){
					this.follower.go(
						path.get_tiles_at_world(
							this.sprite.x,
							this.sprite.y
						).ground
					)
				}
			}
		}
		console.log(following)
		following.follower = op 
		
		return op 
	}
	
	function make_pointer(scene, x0, y0){
		
		let op = {
			sprite: scene.add.sprite(x0, y0, 'squares', 11),
			path: undefined,
			go: function(){
				//console.log('GO!')
				if(this.path && this.path.length){
					let to = this.path.pop()
					this.follower.go(to)
					
				}else{
					return
				}
			}
		}
		
		op.sprite.setOrigin(0)
		
		scene.input.on('pointermove', (a, b, c) => {
			let tiles = path.get_tiles_at_world(a.worldX, a.worldY)
			if(tiles.ground === this.target){
				return 
			}
			
			if(tiles.walls){
				op.sprite.setFrame(12)
			}else{
				let p = path.get_path(
					tiles.ground, 
					path.get_tiles_at_world(
						scene.players[0].sprite.x, 
						scene.players[0].sprite.y
					).ground
				)
				if(p){
					op.sprite.setFrame(11)
				}else{
					op.sprite.setFrame(12)
				}
			}
			
			op.sprite.x = tiles.ground.pixelX 
			op.sprite.y = tiles.ground.pixelY
			
			this.target = tiles.ground 
			//console.log(this.target.x, this.target.y)
		})
		
		scene.input.on('pointerdown', (a) => {
			let tiles = path.get_tiles_at_world(a.worldX, a.worldY)
			
			let p = path.get_path(
				tiles.ground, 
				path.get_tiles_at_world(
					op.follower.sprite.x, 
					op.follower.sprite.y
				).ground
			)
			
			if(tiles.walls || !p){
				return 
			}
			
			op.path = p.slice(0, p.length-1)
			op.go()
		})
		
		return op 
	}

	window.world = {
		init: function(where){
			console.log(where)
			this.map = this.make.tilemap({
				key: where,
			})
			this.map.setBaseTileSize(this.map.tileWidth*ZOOM, this.map.tileHeight*ZOOM);
			
			this.tileset = this.map.addTilesetImage('pix_squares', 'squares', this.map.tileWidth, this.map.tileHeight)
			
			
			
		},
		create: function(){
			
			path.init(this)
			
			this.ground = this.map.createDynamicLayer('ground', this.tileset, 0, 0)
			this.walls = this.map.createDynamicLayer('walls', this.tileset, 0, 0)
			
			this.triggers = this.map.getObjectLayer('triggers').objects
			let start = state.search(this.triggers, x => x.name === 'start')
			let x0 = start.x*ZOOM 
			let y0 = start.y*ZOOM 
			
			this.ground.forEachTile(t => {
				t.width *= ZOOM,
				t.height *= ZOOM 
			})
			
			this.walls.forEachTile(t => {
				t.width *= ZOOM,
				t.height *= ZOOM 
			})
			
			this.pointer = make_pointer(this, x0, y0)
			let players = [this.pointer]
			state.players.forEach(p => {
				players.push(make_player(this, p, players[players.length-1]))
			})
			this.players = players.slice(1)
			let cam = this.cameras.main 
			cam.setBounds(0, 0, this.ground.width, this.ground.height)
			cam.scrollX = x0 - cam.displayWidth/2 
			cam.scrollY = y0 - cam.displayHeight/2
			
			cam.startFollow(this.players[0].sprite)
	
	
		},
		update: function(){
			let cam = this.cameras.main 
			let v = 10
			
			var key = this.input.keyboard.createCursorKeys();
			if(key.up.isDown){
				cam.scrollY -= v
			}
			if(key.down.isDown){
				cam.scrollY += v 
			}
			if(key.left.isDown){
				cam.scrollX -= v 
			}
			if(key.right.isDown){
				cam.scrollX += v
			}
			
			//console.log(cam.scrollX, cam.scrollY)
		}
	}

})()