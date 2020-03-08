//(function(){

	function make_voter(x, y, str){
		function select(pointer){
			if(pointer.isDown && c.selectable){
				c.select(true)
			}
		}
		
		let party = {
			_:0,
			o:1,
			x:2,
			'?':3
		}
		
		let c = this.add.container(x, y)
		c.str = str 
		c.district = undefined
		c.selectable = true 
		c.selected = false 
		this.cameras.main.ignore(c)
		
		c.select = function(bool){
		
			if(!bool){
				if(this.lean){
					this.card.setFrame(2*party[this.lean] + this.card.id)
					this.selected = false 
					this.card.alpha = 0
				}else{
					this.card.setFrame(2*party['_'] + this.card.id)
					this.selected = false 
				}
				
			}else{
				this.card.setFrame(2*party['?'] + this.card.id)
				this.selected = true 
			}
		}
		
		c.set_lean = function(s){
			//console.log(s, 2*party[s] + this.card.id)
			this.card.setFrame(2*party[s] + this.card.id)
			this.selectable = false 
			this.lean = s 
			
			this.border()
		}
		
		c.border = function(){
			let xy = (x, y) => {return {x:x, y:y}}
			let leanings = {
				x:24,
				o:12,
				_:0
			}
			let lean = leanings[this.lean] 
			
			let corners = ['tl', 'tr', 'bl', 'br']
			
			corners.forEach(cor => this[cor].alpha = 1)
			
			let dir = {
				cor: {
					tl: xy(0, 0),
					tr: xy(2, 0),
					bl: xy(0, 2),
					br: xy(2, 2)
				},
				hor: {
					tl: xy(0, 1),
					tr: xy(2, 1),
					bl: xy(0, 1),
					br: xy(2, 1)
				},
				ver: {
					tl: xy(1, 0),
					tr: xy(1, 0),
					bl: xy(1, 2),
					br: xy(1, 2)
				}
			}
			
			let ind = [0, 2, 1, 1, 3, 3, 2, 2]
			
			let tile = {
				tl: [0, 4, 7, 1],
				tr: [2, 6, 3, 1],
				bl: [8, 4, 5, 9],
				br: [10, 6, 11, 9]
			}
			
			let ij = grid.get_ij(this)
			let i0 = ij.i 
			let j0 = ij.j 
			corners.forEach(id => {
		
				let neighs = 0
				let dir_ids = ['cor', 'ver', 'hor']
				dir_ids.forEach((d, i) => {
					let nx = i0 + dir[d][id].x - 1
					let ny = j0 + dir[d][id].y - 1
					let n =  grid.get(ny, nx)
					if(n && n.selected){
						neighs += Math.pow(2, i)
					}else{
						
					}
			
				})
	
				
				if(ind[neighs] == -1){
					this[id].alpha = 0
				}else{
					this[id].setFrame(lean + tile[id][ind[neighs]])
				}
				
			})
			
			
			
		}
		
		let corners = []
		
		c.tl = this.add.sprite(0, 0, 'borders')
		c.tl.setOrigin(1, 1)
		corners.push(c.tl)
		
		c.tr = this.add.sprite(0, 0, 'borders')
		c.tr.setOrigin(0, 1)
		corners.push(c.tr)
		
		c.bl = this.add.sprite(0, 0, 'borders')
		c.bl.setOrigin(1, 0)
		corners.push(c.bl)
		
		c.br = this.add.sprite(0, 0, 'borders')
		c.br.setOrigin(0, 0)
		corners.push(c.br)
		
		corners.forEach(corner => {
			c.add(corner)
			corner.alpha = 0
		})
		
		//*
		c.card = this.add.sprite(0, 0, 'cards')
		//c.card.alpha = .01 
		c.card.id = Math.floor(2*Math.random())
		//c.card.setFrame(c.card.id)
		c.add(c.card)
		
		c.card.setInteractive()
		this.input.setDraggable(c.card)
		c.card.on('pointerover', select)
		c.card.on('pointerdown', select)
		//*/
		
		let w = 100*(str.length - 1)
		let x0 = -w/2
		for(let i = 0; i < str.length; i++){
			
			c.voter = this.add.sprite(x0 + i*w, 0, 'voters')
			c.voter.id = Math.floor(12*Math.random())
			
			c.voter.party = 12*party[str[i]]

			c.voter.setFrame(c.voter.party + c.voter.id)
			c.add(c.voter)
		}
		
		return c 
	}

	let levels = {
		lvls: {},
		titles: [],
		load: function(scene){
			this.string = scene.cache.text.entries.entries['levels']
		},
		process: function(){
			const re = {
				title: /^\@title\((.+)\)$/,
				size: /^\@size\((\d+)\)$/,
				end: /@end/
			}
			const WAIT = 'wait';
			const GO = 'go'
			let lines = this.string.split('\n').map(x => x.trim())
			let mode = WAIT
			let lvl
			lines.forEach(line => {
				if(mode === WAIT){
					if(line === '@start'){
						mode = GO 
						lvl = {rows:[]}
					}
				}else if(mode === GO){
					if(line.match(re.end)){
						this.lvls[lvl.title] = lvl 
						this.titles.push(lvl.title)
						lvl = undefined
						mode = WAIT
					}else if(line.match(re.title)){
						let match = line.match(re.title)
						lvl['title'] = match[1]
					}else if(line.match(re.size)){
						let match = line.match(re.size)
						lvl['size'] = +match[1]
					}else if(line.length > 0){
						lvl.rows.push(line.split(/\s/).filter(x => x.length))
					}
				}
			})
			console.log(this.lvls)
		},
		check: function(){
			this.titles.forEach(title => {
				let lvl = this.lvls[title]
				
				if(lvl.rows.length === 0){
					throw(title + " has no rows")
				}
				let cols = undefined
				lvl.rows.forEach(row => {
					if(cols === undefined){
						cols = row.length 
					}else{
						if(cols !== row.length){
							throw(title + ' rows are different lengths')
						}
					}
				})
				if(cols === 0){
					throw(title + " has a row with zero entries")
				}
				if(!lvl.size){
					throw(title + ' size undefined')
				}
				if(!lvl.title){
					throw(title + ' title undefined')
				}
				
				
			})
		},
		populate: function(){
			this.titles.forEach(title => {
				let lvl = this.lvls[title]
				lvl.pop = 0 
				lvl.rows.forEach(row => {
					row.forEach(str => {
						lvl.pop += str.length
					})
				})
				lvl.count = Math.floor(lvl.pop/lvl.size)
				if(lvl.count * lvl.size !== lvl.pop){
					throw(title + ' population is not a multiple of its size')
				}
			})
		},
		init: function(scene){
			this.load(scene)
			this.process()
			this.check()
			this.populate()
			this.init = ()=>{
				this.current = undefined
			}
		},
		create: function(scene){
			grid.init()
			districts.init()
			let lvl = this.lvls[scene.data.title]
			this.current = lvl 
			if(!lvl){
				throw(scene.data.title + ' not found')
			}
			let dx = 280 
			let dy = 350 
			let width = dx*(lvl.rows[0].length-1)
			let height = dy*(lvl.rows.length-1)
			
			let x0 = scene.cameras.main.centerX - 0.33*width
			let y0 = scene.cameras.main.centerY - height/2
			
			lvl.rows.forEach((row, y) => {
				row.forEach((str, x) => {
					let voter = make_voter.call(scene, x0 + dx*x, y0 + dy*y, str)
					grid.add(x, y, voter)
				})
			})
			
			return {
				width: width + dx,
				height: height + dy
			}
		}
		
	}
	
	let districts = {
		init: function(){
			this.districts = []
		},
		add: function(voters){
			let votes = {
				x:0,
				o:0,
				_:0
			}
			voters.forEach(voter => {
				voter.district = this.districts.length
				for(let i = 0; i < voter.str.length; i++){
					let c = voter.str[i]
					if(votes[c] !== undefined){
						votes[c] += 1
					}else{
						votes._ += 1 
					}
				}
			})
			//console.log(votes)
			this.districts.push(voters)
			let winner = '_'
			if(votes.x > votes.o){
				winner = 'x'
			}else if(votes.x < votes.o){
				winner = 'o'
			}
			
			voters.forEach(voter => {
				voter.set_lean(winner)
			})
		}
	}
	
	let grid = {
		init: function(){
			this.rows = []
		},
		add: function(row, col, voter){
			if(!this.rows[row]){
				this.rows[row] = []
			}
			this.rows[row][col] = voter 
			
		},
		for_each: function(func){
			this.rows.forEach((row, i) => {
				row.forEach((voter, j) => {
					func(voter, i, j)
				})
			})
		},
		get: function(x, y){
			return this.rows[y] && this.rows[y][x]
		},
		get_selected: function(){
			let selected = []
			this.for_each(voter => {
				if(voter.selected){
					
					selected.push(voter)
				}
			})
			return selected
		},
		get_ij: function(voter){
			let op = {}
			this.for_each((v, i, j) => {
				if(voter === v){
					op = {i:i, j:j}
				}
			})
			return op 
		},
		get_neighborhood: function(voter){
			let neighs = []
			let v0 = this.get_ij(voter)
			this.for_each((v, i, j) => {
				if(Math.abs(i-v0.i) + Math.abs(j-v0.j) === 1){
					neighs.push(v)
				}
			})
			return neighs 
		},
		is_legal_district: function(selected){
			
			
			if(selected.reduce((acc, cur) => acc + cur.str.length, 0) !== levels.current.size){
				return false 
			}
			
			let fill = [selected[0]]
			let fill_length = 0 
			while(fill.length !== fill_length){
				fill_length = fill.length 
				
				fill.forEach(v => {
					let neighs = this.get_neighborhood(v).filter(x => x.selected)
					neighs.forEach(neigh => {
						if(fill.indexOf(neigh) === -1){
							fill.push(neigh)
						}
					})
				})
				
			}
			
			return fill.length == selected.length  
			
		},
		add_district: function(){
			let selected = this.get_selected()
			
			let legal = this.is_legal_district(selected)
			if(legal){
				
				districts.add(selected)
			}
			
			selected.forEach(voter => voter.select(false))
		}
	}
	
	window.play = {
		init: function(data){
			this.data = data
		},
		create: function(){
			//console.log(this)
			this.voter_cam = this.cameras.add()
			
			let bg = this.add.image(0, 0, 'paper')
			bg.setOrigin(0, 0)
			this.voter_cam.ignore(bg)
			
			
			levels.init(this)
			let size = levels.create(this)
			let w_max = 4*this.cameras.main.centerX/3
			let h_max = 2*this.cameras.main.centerY
			
			let zoom_w = w_max/size.width 
			let zoom_h = h_max/size.height 
			this.voter_cam.zoom = Math.min(zoom_w, zoom_h)
			
			this.input.on('pointerup', function(){
				grid.add_district()
			})
			
			this.input.on('pointerupoutside', function(){
				grid.add_district()
			})
		}
	}
//})()