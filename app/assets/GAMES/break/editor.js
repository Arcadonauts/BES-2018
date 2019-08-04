(function(){
	/*

	*/
	const TW = 24 
	let index = 0 
	//let butts, grid, mouse 
	
	let layers = [0, 1, 3, 6, 9, 10, 11, 12, 15, 24]
	let layer_names
	let show_layer

	window.level_select = {
		preload: function(){
			
		},
		create: function(){
			if(localStorage.levels === undefined){
				localStorage.levels = JSON.stringify({})
			}
			let levels = JSON.parse(localStorage.levels)
			let i = 0
			for(let lvl in levels){
				let text = this.add.text(20, 30*i, lvl)
				text.setInteractive()
				text.on('pointerover', ()=> text.setStyle({fill: 'aqua'}))
				text.on('pointerout', ()=> text.setStyle({fill: 'white'}))
				text.on('pointerup', ()=> this.scene.start('editor', {
					name: lvl
				}))
				
				i+=1
			}
			let text = this.add.text(20, 30*i, 'new')
			text.setInteractive()
			text.on('pointerover', ()=> text.setStyle({fill: 'aqua'}))
			text.on('pointerout', ()=> text.setStyle({fill: 'white'}))
			text.on('pointerup', ()=> this.scene.start('editor', {
				name: prompt('Level Name?')
			}))
			this.add.sprite(200, 200, 'tiles')
		}
	}
	
	function reorder(){
		for(let s in grid){
			grid[s].setDepth(grid[s].layer)
		}
		mouse.setDepth(10000)
		mouse.hud.setDepth(10001)
	}
	
	function save(name){
		let levels = JSON.parse(localStorage.levels)
		levels[name] = {}
		for(let s in grid){
			//grid[s].setDepth(grid[s].layer)
			levels[name][s] = grid[s].id
		}
		localStorage.levels = JSON.stringify(levels)
	}
	
	window.editor = {
		
		preload: function(){
			console.log('editor')
		},
		init: function(lvl){

			if(localStorage.levels === undefined){
				localStorage.levels = JSON.stringify({})
			}
			let levels = JSON.parse(localStorage.levels)
			this.name = lvl.name  
			if(levels[lvl.name]){
				this.old_level = levels[lvl.name]
			}else{
				this.old_level = {}
			}
			
		},
		
		create: function(){
			this.cameras.main.setBounds(0, 0, this.game.canvas.width * 2, this.game.canvas.height * 2);
			
			let cam_pal = this.cameras.add().setName('pal')
			let cam_lay = this.cameras.add().setName('lay')
			let cam_main = this.cameras.main 
			cam_pal.setVisible(false)
			cam_lay.setVisible(false)
			cam_main.setVisible(true)
			
	
			
			let sprite_count = 2*360*240/TW/TW  
			layer_names = [] 
			show_layer = {}
			
			for(let i = 0; i < 3; i++){
				for(let j = 0; j < 3; j++){
					for(let k = 0; k < 3; k++){
						let id = 9*i + 3*j + k 
						//console.log(id)
						if(layers.indexOf(id) >= 0){
							let name = ''
							if(id === 11){
								name = 'character'
							}else{
															
								if(i === 0) name += "floor"
								else if(i === 1) name += "wall"
								else if (i === 2) name += "ceil"
								
								if(j === 1) name = 'interactive ' + name
								else if(j === 2) name = 'disappearing ' + name
								
								if(k === 1) name += ' B'
								else if(k === 2) name += ' C'
							}
							
							layer_names.push(name)
							
							show_layer[id] = true 
							
						}
					}
				}
			}
			
			butts = [] 
			grid = {}
			
			
			for(let i = 0; i < sprite_count; i++){
				let x = TW/2 + i*TW % this.game.canvas.width 
				let y = TW/2 + Math.floor(i*TW/this.game.canvas.width)*TW 
		
				let butt = this.add.sprite(x,y, 'tiles', i)
				butt.index = i 
				butt.setInteractive()
				butt.on('pointerup', function(){
					//if(!cam_pal.visible) return 

					index = butt.index 
					cam_pal.setVisible(false)
					cam_lay.setVisible(false)
				
					cam_main.setVisible(true)
					
				})
				
				
				this.cameras.main.ignore(butt)
				cam_lay.ignore(butt)
				
				butts.push(butt)
				
			}
	
			
			let name = this.name 
			mouse = this.add.sprite(0, 0, 'tiles', 0)
			mouse.add = this.add 
			mouse.layer = layers[0]
			mouse.add_tile = function(game){
				let x = Math.floor(mouse.x/TW) 
				let y = Math.floor(mouse.y/TW) 
				let z = mouse.layer 
				
				let id = x + ',' + y + ',' + z 
				//console.log(id)
				
				if(grid[id]){
					grid[id].setFrame(index)
					grid[id].id = index 
				}else{
					grid[id] = this.add.sprite(TW*x, TW*y, 'tiles', index)
					grid[id].id = index 
					grid[id].layer = z 
					cam_pal.ignore(grid[id])
					cam_lay.ignore(grid[id])
					grid[id].update = function(){
						this.alpha = show_layer[this.layer]
					}
				}
				reorder()
				save(name)
			}
		
			let hud_text = mouse.hud = this.add.text(10, 10, 'hud')
			hud_text.setScrollFactor(0)
			cam_lay.ignore(hud_text)
			cam_pal.ignore(hud_text)
		
			for(let id in this.old_level){
				let xyz = id.split(',')
				let x = xyz[0]
				let y = xyz[1]
				let z = xyz[2]
				let index = this.old_level[id]
				if(index === 0) continue  
				
				grid[id] = this.add.sprite(TW*x, TW*y, 'tiles', index)
				grid[id].id = index 
				grid[id].layer = z 
				cam_pal.ignore(grid[id])
				cam_lay.ignore(grid[id])
				grid[id].update = function(){
					this.alpha = show_layer[this.layer]
				}
			}
		
			for(let i = 0; i < layers.length; i++){
				let id = layers[i]
				let text = this.add.text(60, 200 - 20*i, id + '.' + layer_names[i])
				text.id = id 
				text.reset_color = function(){
					if(this.id === index){
						this.setStyle({fill: 'yellow'})
					}else{
						this.setStyle({fill: 'white'})
					}
				}
				text.set_layer = function(){
					mouse.layer = this.id 
					cam_pal.setVisible(false)
					cam_lay.setVisible(false)
					cam_main.setVisible(true)
				}
				text.reset_color()
				text.setInteractive()
				text.on('pointerover', ()=> text.setStyle({fill: 'aqua'}))
				text.on('pointerout', ()=> text.reset_color())
				text.on('pointerup', ()=> text.set_layer())
				
				cam_main.ignore(text)
				cam_pal.ignore(text)
				
				
				let show = this.add.text(10, 200 - 20*i, 'show')
				show.id = id 
				show.show_layer = function(){
					let s = !show_layer[show.id]
					show_layer[show.id] = s
					show.setStyle({fill: s ? 'white' : 'grey'})
					show.text = s ? 'show' : 'hide'
				}
				
				show.reset_color = function(){
					if(show_layer[show.id]){
						this.setStyle({fill: 'white'})
					}else{
						this.setStyle({fill: 'grey'})
					}
				}
				
				
				show.setInteractive()
				show.on('pointerup', ()=> show.show_layer())
				show.on('pointerover', ()=> show.setStyle({fill: 'aqua'}))
				show.on('pointerout', ()=> show.reset_color())
				
				cam_main.ignore(show)
				cam_pal.ignore(show)
			}
			
			reorder()
			
			this.input.on('pointerdown', function(pointer){
				if(!cam_main.visible) return 
				mouse.add_tile(this)
								
			})
			
			
			this.input.on('pointermove', function(pointer){
				mouse.x = pointer.worldX + TW/2 
				mouse.y = pointer.worldY + TW/2 
	
			})
			
			this.input.keyboard.on('keydown-E', function(){
				let p = cam_pal.visibile 
				
				cam_main.setVisible(p)
				cam_lay.setVisible(false)
				cam_pal.setVisible(!p)
			})
			
			this.input.keyboard.on('keydown-Q', function(){
				let p = cam_pal.visibile 
				
				cam_main.setVisible(p)
				cam_lay.setVisible(!p)
				cam_pal.setVisible(false)
			})	
		
			let v = 6
		
			this.input.keyboard.on('keydown-W', function(){
				if(cam_main.visible){
					cam_main.scrollY -= v
				}else{
					cam_pal.scrollY -= v 
				}
			})
			
			this.input.keyboard.on('keydown-S', function(){
				if(cam_main.visible){
					cam_main.scrollY += v
				}else{
					cam_pal.scrollY += v 
				}
			})
			
			this.input.keyboard.on('keydown-A', function(){
				cam_main.scrollX -= v
			})
			
			this.input.keyboard.on('keydown-D', function(){
				cam_main.scrollX += v
			})
			
			this.input.keyboard.on('keydown-P', ()=> this.scene.start('world', {
				name: this.name 
			}))
			
		},
		update: function(){
			butts.forEach(butt => butt.update())
			for(let k in grid){
				grid[k].update()
			}
			mouse.setFrame(index)
			mouse.hud.text = layer_names[layers.indexOf(mouse.layer)]
			//this.hud.bringToTop()
		
		},
		
	}
	
})()