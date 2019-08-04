(function(){
	
	window.get_index = function(x, y){
		return 15*Math.floor(y/TH) + Math.floor(x/TW)
	}
	
	function blank_level(){
		return [{},{},{},{}]
	}

	function save(name){
		let levels = JSON.parse(localStorage.levels)
		levels[name] = []
		for(let i = 0; i < grid.length; i++){
			levels[name][i] = {}
			for(let s in grid[i]){
				//grid[s].setDepth(grid[s].layer)
				levels[name][i][s] = grid[i][s].id
			}
		}
		localStorage.levels = JSON.stringify(levels)
	}
	
	function load(data){
		if(localStorage.levels === undefined){
			localStorage.levels = JSON.stringify(blank_level())
		}
		let levels = JSON.parse(localStorage.levels)
		this.name = data.name  
		if(levels[data.name]){
			this.old_level = levels[data.name]
		}else{
			this.old_level = blank_level()
		} 
	}

	const TW = 24
	const TH = 12
	
	let grid = []
	let phase = 0

	window.breditor = {
		init: function(data){
			this.name = data.name 
			load.call(this, data)
		},
		create: function(){
			console.log('Level:', this.name)
			
			for(let i = 0; i < this.old_level.length; i++){
				grid[i] = {}
				for(let s in this.old_level[i]){
					let xy = s.split(',')
					if(+this.old_level[i][s] === 23){
						continue
					}
					grid[i][s] = this.add.sprite(TW*(+xy[0]), TH*(+xy[1])+TH/2, 'breakout', +this.old_level[i][s]) 
					grid[i][s].id = +this.old_level[i][s] 
					grid[i][s].alpha = +(i === phase)
				}
			}
			save(this.name)
			
			
			
			let bg = this.add.sprite(0, 0, 'bg_game')
			bg.setOrigin(0)
			bg.setDepth(-10)
			let fg = this.add.sprite(0, 0, 'fg_bad')
			fg.setOrigin(0)
			bg.setDepth(-9)
			
			this.phasors = []
			let phasors = this.phasors 
			for(let i = 0; i < 4; i++){
				let p = this.add.sprite(0, (i+1)*TH, 'breakout', phase === i ? 91 : 90)
				p.setOrigin(.25, 0)
				
				p.phase = i 
				p.setInteractive()
				p.on('pointerup', function(){
					phasors.forEach(p => p.setFrame(90))
					this.setFrame(91)
					phase = this.phase 
					for(let i = 0; i < 4; i++){
						for(let s in grid[i]){
							grid[i][s].alpha = +(i === phase && grid[i][s].frame != 23)
						}
					}
				})
				
				this.phasors.push(p)
			}
			
			let x0 = 324
			let dx = 0 
			let y0 = 12 
			let dy = 0 
			for(let i = 0; i < 24; i++){
				let butt = this.add.sprite(x0 + dx, y0 + dy, 'breakout', i)
		
				butt.index = i 
				butt.setInteractive()
				butt.on('pointerup', function(){
					mouse.index = butt.index 
					mouse.setFrame(butt.index)
				})
				
				
				
				dx += 24
				if(x0+dx > 360){
					dx = 0 
					dy += 12 
				}
			}
		
			let name = this.name 
			mouse = this.add.sprite(0, 0, 'breakout', 0)
			mouse.setOrigin(0)
			mouse.index = 0 
			mouse.add = this.add 
			mouse.add_tile = function(game){
				let x = Math.floor((mouse.x + TH)/TW)
				let y = Math.floor(mouse.y/TH)
				if(x < 1 || y < 1 || x > 12) return 
				let id = x + ',' + y
				//console.log(id)
				
				if(mouse.index === 23){
					if(grid[phase] && grid[phase][id]){
						grid[phase][id].setFrame(mouse.index)
						grid[phase][id].id = mouse.index 
						grid[phase][id].alpha = 0
					}
				}else if(grid[phase][id]){
					grid[phase][id].setFrame(mouse.index)
					grid[phase][id].id = mouse.index 
					grid[phase][id].alpha = 1 
				}else{
					grid[phase][id] = this.add.sprite(TW*x, TH*y + TH/2, 'breakout', mouse.index)
					grid[phase][id].id = mouse.index 
				}
				//console.log(grid)
				save(name)
			}
			
			this.input.on('pointerdown', function(pointer){
				//if(!cam_main.visible) return 
				mouse.down = true 
								
			})
			
			
			this.input.on('pointerup', function(pointer){
				//if(!cam_main.visible) return 
				mouse.down = false 
								
			})
			
			this.input.on('pointermove', function(pointer){
				mouse.x = pointer.worldX
				mouse.y = pointer.worldY
	
			})
		}, 
		update: function(){
			if(mouse.down){
				mouse.add_tile(this)
			}
		}
	}


})()