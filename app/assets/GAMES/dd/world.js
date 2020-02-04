(function(){
	const ZOOM = state.ZOOM
	const layers = state.layers
	
	function make_player(scene, who, following){
		let data = state.copy(state.search(state.data.characters, c => c.NAME === who))
		let f0 = 20*data.IMG
		
		let sprite = scene.add.sprite(following.sprite.x + 90, following.sprite.y, 'characters', f0)
	
		state.create_walking_animations(scene, who, f0)
		
		let op = {
			name: who,
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
						scene.grid.get_tiles_at_world(
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
				let at = scene.grid.get_tiles_at_world(
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
			let tiles = scene.grid.get_tiles_at_world(a.worldX, a.worldY)
			if(tiles.ground === this.target){
				return 
			}
			
			if(tiles.walls){
				op.sprite.setFrame(12)
			}else{
				let p = scene.grid.get_path(
					tiles.ground, 
					scene.grid.get_tiles_at_world(
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
			let tiles = scene.grid.get_tiles_at_world(a.worldX, a.worldY)
			
			let p = scene.grid.get_path(
				tiles.ground, 
				scene.grid.get_tiles_at_world(
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
		init: function(scene, objects){
			this.scene = scene 
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
				this.activate[obj.name].call(this, tile, obj, to)
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
						let top = this.scene.grid.get_tiles_at_world(obj.x + w/2, obj.y + w/2).ground 
						let bot = this.scene.grid.get_tiles_at_world(obj.x + w/2, obj.y + h - w/2).ground 
						
						if(tile === top){
							this.scene.grid.drop(bot)
						}else if(tile === bot){
							this.scene.grid.drop(top)
						}else{
							console.warn("Door is wrong.")
						}
						
					}
				}, {})
			},
			battle: function(tile, obj){
				this.scene.scene.sleep()
				this.scene.scene.launch('battle', {
					trigger: obj, 
					scene: this.scene
				})
			}
		}
	}

	window.world = {
		init: function(where){
			console.log(where)
			this.where = where 
			
			
		},
		create: function(){
			
			//path.init(this)
			this.grid = state.make.grid(this)
			this.grid.init(this.where)
			this.grid.check()
			message.init(this)
			
			
			
			//roof.init(this)
			
			
			
			this.triggers = triggers.init(this, this.map.getObjectLayer('triggers').objects)
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
			
			this.grid.drop(this.grid.get_tiles_at_world(x0, y0).ground)
			
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