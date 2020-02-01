(function(){
	const ZOOM = state.ZOOM
	const layers = ['ground', 'walls', 'exterior', 'roof']
	
	let roof = {
		init: function (scene){
			this.scene = scene 
			let roof = scene.roof 
			roof.setDepth(1)
			let side = {}
			roof.layer.properties.forEach(p => side[p.name] = p.value.split(' ').map(x => +x))
			console.log(side)
			let c = 1
			function color(tile, c){
				if(tile.color === undefined){
				
					tile.color = c 
					let roof_neighs = [
						path.get_rel_tiles(tile,  0,-1).roof,
						path.get_rel_tiles(tile,  0, 1).roof
					]
					
					let index = tile.index - 1 
					if(side.left.indexOf(index) === -1){
						roof_neighs.push(path.get_rel_tiles(tile, -1, 0).roof)
						
					}
					if(side.right.indexOf(index) === -1){
						roof_neighs.push(path.get_rel_tiles(tile,  1, 0).roof)
					}
					
					roof_neighs.filter(t=>t).forEach(t => color(t, c))
					return c+1
				}else{
					//console.log('Already Colored')
					return c 
				}
									
			}
			let count = 0 
			roof.forEachTile(tile => {
				if(tile.index > -1){
					count += 1
					c = color(tile, c)
				}
			})
			console.log(c, count)
		},
		refresh: function(tile){
			let dt = 300 
			
			this.scene.roof.forEachTile(t => {
				if(t.alpha === 0){
					this.scene.tweens.add({
						targets: t,
						duration: dt,
						alpha: 1
					})
				}
			})
			
			let roof = path.get_tiles_from_tile(tile).roof 
			if(!roof) return 
			
			this.scene.roof.forEachTile(t => {
				if(t.color === roof.color && t.alpha === 1){
					this.scene.tweens.add({
						targets: t,
						duration: dt,
						alpha: 0
					})
					
				}
			})
			
		}
	}
	
	let path = {
		init: function(scene){
			this.scene = scene 
			//this.layers = ['ground', 'walls']
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
			//*
			let lefts = (state.search(this.scene.exterior.layer.properties, x=>x.name==='left')
				.value 
				.split(' ')
				.map(x => +x)
			)
						
			let rights = (state.search(this.scene.exterior.layer.properties, x=>x.name==='right')
				.value 
				.split(' ')
				.map(x => +x)
			)

			
			//console.log(lefts, rights)
			//*/
			let tiles = []
			dirs.forEach(dir => {
				let t = this.get_rel_tiles(tile, dir.dx, dir.dy)
				if(t.ground && !t.walls){
					if(t.exterior){
						let id = t.exterior.index - 1 //What?!?!
						if(dir.dir === 'W'){
							//console.log(t.ground)
							if(rights.indexOf(id) === -1){
								tiles.push(t.ground)
							}
						}else if(dir.dir === 'E'){
							if(lefts.indexOf(id) === -1){
								tiles.push(t.ground)
							}
						}else{
							tiles.push(t.ground)
						}
						
					}else{
						tiles.push(t.ground)
					}
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
			//let layers = this.layers
			let tiles = {}
			layers.forEach(lay => {
				tiles[lay] = func(this.scene[lay])
			})
			
			return tiles 
		},
		drop: function(tile){
			let neighs = this.get_neighbors(tile)
			let left = this.get_rel_tiles(tile, -1, 0).ground 
			let right = this.get_rel_tiles(tile, 1, 0).ground 
			
			neighs.unshift(tile)
			neighs = neighs.concat(this.get_neighbors(left))
			neighs = neighs.concat(this.get_neighbors(right))
		
			neighs = neighs.filter((x,i)=>neighs.indexOf(x)===i)
			//console.log(neighs)
			this.scene.players.forEach((p,i)=>{
				//p.go(tile, 0)
				p.sprite.x = tile.pixelX + tile.width/2 
				p.sprite.y = tile.pixelY + tile.height/2
				p.go(neighs[i], undefined, true)
				roof.refresh(neighs[i])
			})
				
			
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
			go: function(to, time, ignore_follow){ 
				if(time === undefined){
					time = 300 
				}
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
					duration: time,
					x: xf,
					y: yf,
					onComplete: ()=>{
						this.sprite.anims.play(who + '-stand-' + dir)
						this.tween = undefined
						//roof.refresh(to)
						if(!ignore_follow){
							this.following.go()
						}
					}
				})
				if(!ignore_follow && this.follower){
					this.follower.go(
						path.get_tiles_at_world(
							this.sprite.x,
							this.sprite.y
						).ground
					)
				}
			}
		}
//		console.log(following)
		following.follower = op 
		
		return op 
	}
	
	function make_pointer(scene, x0, y0){
		
		let op = {
			sprite: scene.add.sprite(x0, y0, 'squares', 11),
			path: undefined,
			go: function(){
				if(this.paused) return 
				let at = path.get_tiles_at_world(
					this.follower.sprite.x,
					this.follower.sprite.y
				).ground
				
				
				
				
				if(this.path && this.path.length){
					let to = this.path.pop()
					triggers.collide(at, to)
					
					this.follower.go(to)
					
				}else{
					triggers.collide(at)
					
					return
				}
			},
			pause: function(){
				this.paused = true 
				this.sprite.alpha = 0 
			},
			unpause: function(){
				this.paused = false 
				this.sprite.alpha = 1 
			}
		}
		
		op.sprite.setOrigin(0)
		op.sprite.setDepth(9)
		
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
			if(op.paused){
				//console.log('nope')
				return 
			}
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
			
			//console.log(tiles)
			
			op.path = p.slice(0, p.length-1)
			op.go()
		})
		
		return op 
	}
	
	let message = {
		init: function(scene){
			this.scene = scene 
		},
		make: function(tile, label, yes, no){
			let box = this.scene.add.container(tile.pixelX, tile.pixelY) 
			box.setDepth(10)
			
			let bg = this.scene.add.sprite(0, 0, 'headshots', 23)
			box.add(bg)
			
			let left = state.make.button(this.scene, box.width/2, box.height, 12*5, this.wrap(yes.callback))
			left.sprite.setOrigin(1,0)
			box.add(left.sprite)
			
			let right = state.make.button(this.scene, box.width/2, box.height, 13*5, this.wrap(no.callback))
			right.sprite.setOrigin(0, 0)
			box.add(right.sprite)
			
			
			let text = this.scene.add.text(0, 0, label, {
				fontSize: (9*ZOOM)+'px',
				fontFamily: '"Times New Roman", Tahoma, serif',
				color: 'black',
				fontStyle: 'bold'
			})
			text.setOrigin(.5, 1.2)
			box.add(text)
			
			
			this.box = box 
			this.scene.pointer.pause()
		},
		wrap: function(func){
			return function(args){
				if(func){
					func(args)
				}
				message.close()
			}
		},
		close: function(){
			this.scene.tweens.add({
				targets: this.box,
				duration: 1,
				alpha: 0,
				onComplete: ()=>{
					this.box.destroy()
			this.scene.pointer.unpause()
				}
			})
			
		}
	}

	let triggers = {
		flavors: ['door', 'battle'],
		init: function(objects){
			this.flavors.forEach(flav => {
				this[flav] = [] 
			})
			this.objects = []
			this.start = undefined
			
			let scale = ['x', 'y', 'width', 'height']
			objects.forEach(obj => {
				scale.forEach(prop => obj[prop] *= ZOOM)
				if(obj.type === 'start'){
					if(this.start){
						console.warn('More than one starting point!')
					}
					this.start = obj 
				}else if(this.flavors.indexOf(obj.type) > -1){
					this[obj.type].push(obj)
				}else{
					console.warn('Unknown trigger: ' + obj.type + ' ' + obj.name)
					console.log(obj)
				}
				this.objects.push(obj)
			})
			return this 
		},
		collide: function(at, to){
			let tile = at 
			let tx = tile.pixelX + tile.width/2 
			let ty = tile.pixelY + tile.height/2 
			let hits = [] 
			this.objects.forEach(obj => {
				if(obj.x < tx && tx < obj.x + obj.width && obj.y < ty && ty < obj.y + obj.height){
					hits.push(obj)
				}
			})
			
			hits.forEach(obj => {
				this.activate[obj.name](tile, obj, to)
			})
			
		},
		activate: {
			door: function(tile, obj, to){
				if(to) return 

				message.make(tile, 'Open Door?', {
					callback: ()=>{
						let w = obj.width 
						let h = obj.height 
						if(w !== tile.width || h !== 3*tile.width){
							console.warn("Door trigger is the wrong size!")
							console.log(tile, obj)
						}
						let top = path.get_tiles_at_world(obj.x + w/2, obj.y + w/2).ground 
						let bot = path.get_tiles_at_world(obj.x + w/2, obj.y + h - w/2).ground 
						
						if(tile === top){
							path.drop(bot)
						}else if(tile === bot){
							path.drop(top)
						}else{
							console.warn("Door is wrong.")
						}
						
					}
				}, {})
			},
			battle: function(tile, obj){
				console.log('battle start!')
			}
		}
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
			message.init(this)
			
			layers.forEach(layer => {
				this[layer] = this.map.createDynamicLayer(layer, this.tileset, 0, 0)
				this[layer].forEachTile(t => {
					t.width *= ZOOM,
					t.height *= ZOOM 
				})
			})
			
			roof.init(this)
			
			
			
			this.triggers = triggers.init(this.map.getObjectLayer('triggers').objects)
			let start = this.triggers.start //state.search(this.triggers, x => x.name === 'start')
			let x0 = start.x//*ZOOM 
			let y0 = start.y//*ZOOM 
			
			//console.log(this.exterior.layer.properties)
			
			this.pointer = make_pointer(this, x0, y0)
			let players = [this.pointer]
			state.players.forEach(p => {
				players.push(make_player(this, p, players[players.length-1]))
			})
			this.players = players.slice(1)
			
			path.drop(path.get_tiles_at_world(x0, y0).ground)
			
			let cam = this.cameras.main 
			cam.setBounds(0, 0, this.ground.width, this.ground.height)
			cam.scrollX = x0 - cam.displayWidth/2 
			cam.scrollY = y0 - cam.displayHeight/2
			
			cam.startFollow(this.players[0].sprite)
			cam.setLerp(0.1, 0.1)
	
			state.init_interactives(this)
			
			
	
		},
	
	}

})()