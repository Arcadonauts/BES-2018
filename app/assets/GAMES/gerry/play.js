(function(){
	

	let taught = {
		unlocked: false,
		how_to: false,
		dense: false,
		nonvoter: false,
		suppress: false
	}
	
	function make_voter(x, y, str){
		function select(pointer){
			if(pointer.isDown && c.selectable){
				c.select(true)
			}
		}
		
		if(str === '_'){
			return 
		}
		
		let party = {
			_:0,
			o:1,
			x:2,
			'?':3
		}
		
		let c = this.add.container(this.voter_cam.centerX, this.voter_cam.centerY)
		this.add.tween({
			targets: c,
			x: x,
			y: y,
			duration: 300,
			ease: 'Sine.easeInOut',
			onComplete: function(){
				suppression.create()
			}
		})
		c.str = str 
		c.district = undefined
		c.selectable = true 
		c.selected = false 
		this.cameras.main.ignore(c)
		
		c.select = function(bool){
			scene.sound.play('click')
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
			this.setScale(1)
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
					if(n && (n.selected || (n.district !== undefined && n.district === this.district))){
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
		//this.input.setDraggable(c.card)
		c.card.on('pointerover', select)
		c.card.on('pointerover', function(){
			scene.sound.play('tick')
			c.setScale(1.1)
		})
		c.card.on('pointerout', function(){
			c.setScale(1)
		})
		c.card.on('pointerdown', select)
		//*/
		
		let w = 50*(str.length - 1)
		let x0 = -w/2
		c.voters = [] 
		for(let i = 0; i < str.length; i++){
			
			c.voter = this.physics.add.sprite(x0 + i*w, 0, 'voters')
			c.voter.id = Math.floor(12*Math.random())
			let s = str[i]
			
			c.voter.party = 12*party[s]
			demographics.register_voter(s)

			c.voter.setFrame(c.voter.party + c.voter.id)
			c.voter.suppress = function(){
				demographics.supress(s)
				this.party = 12*party['?']
				
				this.setFrame(this.party + this.id)
				let new_str = ''
				for(let i = 0; i < str.length; i++){
					new_str += '?'
				}
				c.str = new_str
				
				this.suppress = ()=>{}
			}
			
			c.add(c.voter)
			
			c.voters.push(c.voter)
		}
		
		return c 
	}
	
	let demographics = {
		init: function(){
			this.voters = {total:0}
		},
		register_voter: function(str){
			if(!this.voters[str]){
				this.voters[str] = 0 
			}
			this.voters[str] += 1
			this.voters.total += 1 
		},
		supress: function(str){
			this.voters[str] -= 1
			this.voters['?'] += 1
			this.voters.update()
		}
	}
	
	function pie(x, y, data, s, label){
		//let s = 1
		let container = this.add.container(x, y-16/2)
		this.voter_cam.ignore(container)
		container.setScale(s)
		let that = this 
		
		data.update = function(){
			container.update()
		}
		
		container.update = function(){
			container.clear()
			
			let bg = that.add.sprite(0, 0, 'pie')
			container.add(bg)
			
			let t = 0
			let groups = ['o', 'x']
			let slices = []
			groups.forEach((xo, i) => {
				t += 2*(Math.PI*data[xo]||0)/data.total
				
				let color = that.add.sprite(0, 0, 'pie')
				slices.unshift(color)
				color.setFrame(i+1)

				
				let shape = that.make.graphics()
				shape.fillStyle(0xffffff)
				shape.slice(x, y, 200, 0, t, false)
				shape.fillPath()

				var mask = shape.createGeometryMask();
				color.setMask(mask);
				
				//color.sendBack()
				
			})
			
			slices.forEach(slice => {
				container.add(slice)
			})
		}
		
		container.clear = function(){
			while(this.list.length){
				this.list[0].destroy()
			}
		}
		
		container.update()
		
		let text = this.add.text(x, y+120/2, label, {
			fill: 'black',
			fontFamily: 'LinLib',
			fontSize: '12pt',
			align: 'center'
		})
		this.voter_cam.ignore(text)
		text.setOrigin(0.5, 0.5)
		text.alpha = 0.75
		

		return container 
	}
	
	let solver = {
		solve: function(lvl){
			console.log(lvl)
			let divisions = this.divide(lvl.rows, lvl.size, lvl.pop)
			let scores = divisions.map(div => this.score(div))
			
			let max = Math.max.apply(null, scores)
			let index = scores.indexOf(max)
			
			this.table(divisions[index], 'dis')
			
			return max 
		},
		divide: function(rows, size, gens){
					
			let prev_gen = [this.get_base(rows)]
			for(let i = 1; i < gens; i++){
				let children = []
				prev_gen.forEach(parent => {
					children = children.concat(this.get_children(parent, size, i))
				})
				children = this.remove_dupes(children)
				console.log(i, children.length)
				/*
				if(i === 14){
					console.log('i is',i)
					children.forEach(child => {
						console.log(this.id(child))
						this.table(child, 'dis')
					})
				}
				//*/
				prev_gen = children
			}
			//base[0][0].dis = 0
			//console.log(prev_gen)
			//prev_gen.forEach(child => this.table(child, 'dis'))
			//this.table(prev_gen[0], 'str')
			
			return prev_gen
		},
		remove_dupes: function(divisions){
			let keepers = []
			let got = {}
			divisions.forEach(div => {
				let id = this.id(div)
				if(!got[id]){
					got[id] = true 
					keepers.push(div)
				}
			})
			
			return keepers 
		},
		get_children: function(base, size, gen){
			let children = [] 
			let dis = Math.floor(gen/size)
			let border = gen % size ? dis : (dis - 1)
			//let got = {}
			//console.table({size:size, gen:gen, dis:dis, border:border})
			
			base.forEach((row, i) => {
				row.forEach((voter, j) => {
					if(voter.dis === border){
						let neighs = this.get_neighborhood(base, i, j).filter(v => v.dis === -1)
						neighs.forEach(n => {
							let child = this.copy(base)
							child[n.i][n.j].dis = dis 
							//let child_id = this.id(child)
							//if(!got[child_id]){
								children.push(child)
							//	got[child_id] = true 
							//}
						})
					}
					
				})
			})
		
			return children 
		},
		id: function(rows){
			let op = ''
			rows.forEach((row, i) => {
				row.forEach((voter, j) => {
					op += voter.dis + '.'
				})
			})
			return op 
		},
		get_base: function(rows){
			let base = []
			let initialized = false 
			rows.forEach((row, i) => {
				base[i] = []
				row.forEach((str, j) => {
					let dis 
					if(!initialized && str.length > 0){
						initialized = true 
						dis = 0
					}else{
						dis = -1 
					}
					base[i][j] = {
						pop: str.replace('_', '').length,
						dis: dis,
						i:i,
						j:j,
						str:str
					}
				})
			})
			return base 
		},
		get_neighborhood: function(base, i0, j0){
			let neighs = []
			for(let di = -1; di < 2; di++){
				for(let dj = -1; dj < 2; dj++){
					if(Math.abs(di) + Math.abs(dj) === 1){
						if(base[i0+di] && base[i0+di][j0+dj] && base[i0+di][j0+dj].pop > 0){
							neighs.push(base[i0+di][j0+dj])
						}
					}
				}
			}
			return neighs 
		},
		copy: function(base){
			let cop = []
			base.forEach((row, i) => {
				cop[i] = []
				row.forEach((str, j) => {
					cop[i][j] = {}
					let voter = base[i][j]
					for(let key in voter){
						if(voter.hasOwnProperty(key)){
							cop[i][j][key] = voter[key]
						}
					}
				})
			})
			return cop 
		},
		score: function(division){
			let s = 0
			let districts = []
			division.forEach((row, i) => {
				row.forEach((voter, j) => {
					if(districts[voter.dis] === undefined){
						districts[voter.dis] = 0 
					}
					if(voter.str === 'o'){
						districts[voter.dis] += 1
					}else if(voter.str === 'x'){
						districts[voter.dis] -= 1
					}
					
				})
			})
			
			districts.forEach(dis => {
				if(dis > 0){
					s += 1
				}else if(dis < 0){
					s -= 1
				}
			})
			
			return s 
		},
		table: function(grid, key){
			if(!grid){
				console.log(grid)
				return 
			}
			let tab = []
			grid.forEach((row, i) => {
				tab[i] = []
				row.forEach((str, j) => {
					tab[i][j] = grid[i][j][key]
				})
			})
			
			console.table(tab)
		}
	}

	window.levels = {
		lvls: {},
		titles: [],
		load: function(scene){
			this.string = scene.cache.text.entries.entries['levels']
		},
		process: function(){
			const re = {
				title: /^\@title\((.+)\)$/,
				size: /^\@size\((\d+)\)$/,
				end: /@end/,
				suppress: /^\@suppress\((.+)\)$/
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
					}else if(line.match(re.suppress)){
						let match = line.match(re.suppress)
						if(!lvl['suppress']){
							lvl.suppress = {vertical: false, horizantal: false}
						}
						if(match[1] === 'v'){
							lvl.suppress.vertical = true 
						}else if(match[1] === 'h'){
							lvl.suppress.horizantal = true
						}
					}else if(line.length > 0){
						lvl.rows.push(line.split(/\s/).filter(x => x.length))
					}
				}
			})
			
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
			this.titles.forEach((title, i) => {
				let lvl = this.lvls[title]
				lvl.pop = 0 
				lvl.rows.forEach(row => {
					row.forEach(str => {
						let pop = str.replace('_', '').length
						lvl.pop += pop 
						if(pop > 1){
							lvl.dense = true 
						}
						if(str.indexOf('?') > -1){
							lvl.nonvoter = true 
						}
					})
				})
				lvl.count = Math.floor(lvl.pop/lvl.size)
				lvl.locked = !!i && !taught.unlocked
				lvl.index = i 
				

				if(lvl.count * lvl.size !== lvl.pop){
					throw(title + ' population is not a multiple of its size')
				}
			})
			
		},
		init: function(scene){
			console.log('init levels')
			this.load(scene)
			this.process()
			this.check()
			this.populate()
			this.init = ()=>{
				this.current = undefined
			}
			
		
		},
		thumb: function(scene, x, y, title, i){
			let container = scene.add.container(x, y)
			let lvl = this.lvls[title]
			
			if(lvl.locked){
				let bg = scene.add.sprite(0, 0, 'frames', 2)
				bg.setScale(0.75)
				bg.setOrigin(0.5)
				container.add(bg)
				
				return 
			}
			
			let bg = scene.add.sprite(0, 0, 'frames', i)
			bg.setScale(0.7)
			bg.setOrigin(0.5)
			container.add(bg)
			
			bg.setInteractive()
			
			bg.on('pointerover', function(){
			
				container.setScale(1.1)
				scene.sound.play('tick')
			})
			
			bg.on('pointerout', function(){
			
				container.setScale(1)
			})
			
			bg.on('pointerdown', function(){
				
				scene.sound.play('click')
				
				if(taught.unlocked){
					scene.scene.start('play', {
						title: title
					})
				}else if(!taught.how_to){
					taught.how_to = true 
					scene.scene.start('tut', {
						title: 'intro'
					})
				}else if(!taught.dense && lvl.dense){
					taught.dense = true 
					scene.scene.start('tut', {
						title: 'dense'
					})
				
				}else if(!taught.nonvoter && lvl.nonvoter){
					taught.nonvoter = true 
					scene.scene.start('tut', {
						title: 'nonvoter'
					})
				}else if(!taught.suppress && lvl.suppress){
					taught.suppress = true 
					scene.scene.start('tut', {
						title: 'suppress'
					})
				}else{
					
					scene.scene.start('play', {
						title: title
					})
				}
			})
				
			
			let title_text = scene.add.text(0, 85/2, title, {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '12pt',
				align: 'center',
				fixedWidth: 75,
				
				wordWrap: {
					width: 75
				}

			})
			title_text.setLineSpacing(-3)
			title_text.setOrigin(0.5)
			container.add(title_text)
			
			
			lvl.rows.forEach((row, i) => {
				
				row.forEach((str, j) => {
					let dx = 12
					let x0 = -dx*(row.length-1)/2
					let y0 = -dx*(lvl.rows.length-1)/2
					
					let f = 0
					if(str[0] === 'o'){
						f = 1
					}else if(str[0] === 'x'){
						f = 2
					}else if(str[0] === '_'){
						f = 3
					}
					let dot = scene.add.sprite(x0 + j*dx, y0 + i*dx, 'dots', f)
					container.add(dot)
				})
			})
		},
		create: function(scene){
			grid.init(scene)
			
			let lvl = this.lvls[scene.data.title]
			this.current = lvl 
			if(!lvl){
				throw(scene.data.title + ' not found')
			}
			let dx = 280/2 
			let dy = 350/2 
			let width = dx*(lvl.rows[0].length-1)
			let height = dy*(lvl.rows.length-1)
			
			let x0 = scene.cameras.main.centerX - 0.5*width
			let y0 = scene.cameras.main.centerY - height/2
			
			lvl.rows.forEach((row, y) => {
				row.forEach((str, x) => {
					let voter = make_voter.call(scene, x0 + dx*x, y0 + dy*y, str)
					grid.add(x, y, voter)
				})
			})
			
			return {
				width: width,
				height: height,
				x: x0,
				y: y0
			}
		}
		
	}
	

	
	let suppression = {
		init: function(scene, lvl){
			this.scene = scene 
			this.lvl = lvl
			this.created = false 
			this.used = false 
		},
		create: function(){
			if(this.created) return 
			this.created = true 
			let scene = this.scene 
			let lvl = this.lvl 
			
			
			let pointers = []
			let dt = 400
			if(lvl.suppress){
				if(lvl.suppress.horizantal){
					grid.rows[0].forEach((voter, i) => {
						//let voter = row[0]
						let offset = 2*(i%2)-1
						let pointer = scene.physics.add.sprite(voter.x - voter.card.width -5*offset, voter.y, 'pointer')
						
						pointer.dx = pointer.x + 10*offset
						pointer.delay = 0
						pointer.target_x = scene.cameras.main.centerY*5
						pointer.target_y = pointer.y 
						pointer.dy = pointer.y
						pointer.angle = -90
						pointers.push(pointer)
					})
				}
				if(lvl.suppress.vertical){
					grid.rows.forEach((row, i) => {
						
						let voter = row.filter(x=>x)[0]
						if(voter){
							let offset = 2*(i%2)-1
							let pointer = scene.physics.add.sprite(voter.x, voter.y - voter.card.width - 5*offset, 'pointer')
							
							pointer.dy = pointer.y + 10*offset
							pointer.delay = 0
							pointer.target_x = pointer.x
							pointer.target_y = scene.cameras.main.centerY*5
							pointer.dx = pointer.x
							pointer.angle = 0
							pointers.push(pointer)
						}
					})
				}
			}else{
				this.used = true 
			}
			
			pointers.forEach(pointer => {
				scene.cameras.main.ignore(pointer)
				let scale = 0.45
				pointer.setScale(scale)
				
				grid.for_each(voter => {
					voter.voters.forEach(v => {
						scene.physics.add.collider(v, pointer, function(v, p){
							v.suppress()
							return true 
						});
					})
					
					
				})
				
				pointer.tween = scene.tweens.add({
					targets: pointer,
					duration: dt,
					x: pointer.dx,
					y: pointer.dy,
					delay: pointer.delay,
					ease: 'Sine.easeInOut',
					loop: -1,
					yoyo: true
				})
				
				pointer.setInteractive()
				pointer.on('pointerover', function(){
					scene.sound.play('tick')
					this.setScale(0.55)
				})
				
				pointer.on('pointerout', function(){
					this.setScale(scale)
				})
				
				pointer.on('pointerdown', function(){
					scene.sound.play('click')
					scene.sound.play('whistle')
					pointers.forEach(p => {
						if(p === pointer){
							p.tween.stop()
							scene.tweens.add({
								targets: p,
								duration: 500,
								x: pointer.target_x,
								y: pointer.target_y,
								ease: 'Sine.easeIn',
								onComplete: function(){
									p.destroy()
									suppression.used = true 
									districts.recalculate()
									end.check()
								}
							})
						}else{
							p.destroy()
						}
					})
					
				})
			})
		},
	}
	
	let districts = {
		init: function(tot){
		    
			this.districts = []
			this.winners = {total:tot, o:0, x:0}
		},
		add: function(voters){
			let winner = this.find_winner(voters)
			
			voters.forEach(voter => {
				voter.set_lean(winner)
				voter.district = this.districts.length
				
			})
			this.districts.push(voters)
			//this.winners.total += 1
			if(!this.winners[winner]){
				this.winners[winner] = 0
			}
			this.winners[winner] += 1 
			
			this.winners.update()
			
			end.check()
		},
		recalculate: function(){
			for(let key in this.winners){
				if(this.winners.hasOwnProperty(key)){
					if(key !== 'update' && key !== 'total'){
						this.winners[key] = 0
					}
				}
			}
			
			this.districts.forEach(voters => {
				let winner = this.find_winner(voters)
				voters.forEach(voter => voter.set_lean(winner))
				if(!this.winners[winner]){
					this.winners[winner] = 0
				}
				this.winners[winner] += 1
			})
			
			this.winners.update()
			
			end.check()
		},
		find_winner: function(voters){
			let votes = {
				x:0,
				o:0,
				_:0
			}
			voters.forEach(voter => {
				//voter.district = this.districts.length
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
			
			let winner = '_'
			if(votes.x > votes.o){
				winner = 'x'
			}else if(votes.x < votes.o){
				winner = 'o'
			}
			
			return winner 
		}
	}
	
	let grid = {
		init: function(scene){
			this.rows = []
			this.scene = scene 
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
					if(voter){
						func(voter, i, j)
					}
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
			
			let size = selected.reduce((acc, cur) => acc + cur.str.length, 0)
			if(size !== levels.current.size){
				if(size > 1){
					let ins = this.scene.instructions
					this.scene.add.tween({
						targets: ins,
						duration: 100,
						scaleX: 1.25,
						scaleY: 1.25,
						yoyo: true,
						ease: 'Sine.easeInOut',
						onComplete: function(){
							ins.setScale(1)
						}
					})
				}
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
	
	function make_button(x, y, frame, callback){
		let butt = this.add.sprite(x, y, 'reset')
		butt.setFrame(frame)
		butt.setScale(.35)
		this.voter_cam.ignore(butt)
		
		butt.setInteractive()
		let scene = this 
		butt.on('pointerdown', function(){
			callback()
			scene.sound.play('click')
			butt.setScale(.35)
		})
		
		butt.on('pointerover', function(){
			scene.sound.play('tick')
			butt.setScale(.4)
		})
		
		butt.on('pointerout', function(){
			butt.setScale(.35)
		})
		
		return butt 
	}
	
	let end = {
		init: function(scene){
			this.scene = scene 
		},
		check: function(){
			if(districts.districts.length === levels.current.count){
				
				if(districts.winners.o > districts.winners.x){
					this.win()
				}else if(suppression.used){
					this.lose()
				}
			}
		},
		win: function(){
			levels.titles.forEach(title => {
				levels.lvls[title].locked = levels.lvls[title].index > levels.current.index + 1 
			})
			let duration = 450
			let scene = this.scene 
			let cx = scene.cameras.main.centerX
			let cy = scene.cameras.main.centerY
			let banner = scene.add.sprite(cx + 0.08*cx, -cy, 'banner')
			banner.setScrollFactor(0)
			scene.voter_cam.ignore(banner)
			
			//this.scene.cameras.main.zoom = 0.5
			let horns = []
			
			for(let i = 0; i < 3; i++){
				for(let j = -1; j < 2; j += 2){
					let horn = scene.add.sprite(cx - 1.5*j*cx, cy + i*0.5*cy, 'horn')
					horn.target_x = cx - j*0.85*cx + j*i*i*0.1*cy
					horn.target_y = cy + i*0.3*cy
					horn.delay = i*50
					
					horn.setScale(j, 1)
					horn.setScrollFactor(0)
					scene.voter_cam.ignore(horn)
					horns.push(horn)
				}
			}
			
			horns.forEach(horn => {
				scene.add.tween({
					targets: horn,
					x: horn.target_x,
					y: horn.target_y,
					delay: horn.delay,
					duration: duration,
					ease: 'Sine.easeInOut'
				})
			})
			
			scene.add.tween({
				targets: scene.cameras.main,
				scrollX: 2*scene.cameras.main.centerX,
				duration: duration,
				ease: 'Sine.easeInOut'
			})
			
			scene.add.tween({
				targets: scene.voter_cam,
				scrollX: -2*scene.cameras.main.centerX/scene.voter_cam.zoom,
				duration: duration,
				ease: 'Sine.easeInOut'
			})
			
			scene.add.tween({
				targets: banner,
				y: 0.75*scene.cameras.main.centerY,
				duration: duration,
				ease: 'Sine.easeInOut',
				onComplete: function(){
					let text = scene.add.text(cx, 0.55*cy, "You've ensured yet another successful election!", {
						fill: 'black',
						fontFamily: 'LinLib',
						fontSize: '15pt',
						align: 'center',
						fixedWidth: 0.55*cx,
						wordWrap: {
							width: 0.55*cx
						}
					})
					
					scene.voter_cam.ignore(text)
					text.setScrollFactor(0)
					text.setOrigin(0.5)
					
					let button = make_button.call(scene, cx, 0.85*cy, 1, function(){
						if(levels.titles.indexOf(levels.current.title) === levels.titles.length - 1){
							scene.scene.start('tut', {
								title: 'winner'
							})
						}else{
							scene.scene.start('menu')
						}
					})
					button.setScrollFactor(0)
					
				}
			})
			
		},
		lose: function(){
			let ins = this.scene.win_cond 
			this.scene.add.tween({
				targets: ins,
				duration: 100,
				scaleX: 1.25,
				scaleY: 1.25,
				yoyo: true,
				ease: 'Sine.easeInOut',
				onComplete: function(){
					ins.setScale(1)
				}
			})
		}
	}
	
	window.play = {
		init: function(data){
			this.data = data
		},
		update: function(){
			//this.voter_cam.scrollX += 1 
		},
		create: function(){
			//console.log(this)
			this.voter_cam = this.cameras.add()
			
			let bg = this.add.image(0, 0, 'paper')
			bg.setOrigin(0, 0)
			bg.setScrollFactor(0)
			this.voter_cam.ignore(bg)
			
			window.scene = this 
			
			
			levels.init(this)
			demographics.init()
			let size = levels.create(this)
			districts.init(levels.current.count)
			suppression.init(this, levels.current)
			end.init(this)
			
	
			let w_max = (1.55)*this.cameras.main.centerX
			let h_max = 1.95*this.cameras.main.centerY
			
			let zoom_w = w_max/size.width /1.5
			let zoom_h = h_max/size.height /1.5
			
			this.voter_cam.zoom = Math.min(zoom_w, zoom_h)
			
			let x_avg = 0 
			let corner_frame = 0
			for(let index = 0; index < 4; index++){
				let i = 2*Math.floor(index/2) - 1 
				let j = 2*(index%2) - 1
				
				let x = 2*this.cameras.main.centerX - w_max + (1-i)*w_max/2 
				x_avg += x/4
				
				let y = (1-j)*this.cameras.main.centerY
				
				let corner = this.add.sprite(x, y, 'decorations')
				
				corner.setFrame(corner_frame)
				let margin = 0.05
				corner.setOrigin(0+margin,1-margin)
				let scale = 0.75
				corner.setScale(scale*i, -scale*j)
				this.voter_cam.ignore(corner)
				corner.alpha = 0.75
	
				
			}
			
			this.voter_cam.scrollX = (this.cameras.main.centerX - x_avg)/this.voter_cam.zoom
			
			let hud_cx = (2*this.cameras.main.centerX - w_max)/2
			
		
			
			
			for(let i = -1; i < 2; i += 1){
				let spread = 400/2 
				
				let banner = this.add.sprite(hud_cx, this.cameras.main.centerY + i*spread, 'decorations')
				banner.setFrame(2)
				banner.setScale(0.8)
				this.voter_cam.ignore(banner)
				banner.alpha = 1
			}
	
			
			
			let reset = make_button.call(this, hud_cx, 60/2, 0, function(){
				scene.scene.start('play', this.scene.data)
			})
			this.reset = reset 
			
			let menu = make_button.call(this, hud_cx, 2*this.cameras.main.centerY - 60/2, 1, function(){
				scene.scene.start('menu')
			})
			
			this.input.on('pointerup', function(){
				grid.add_district()
				reset.setScale(.35)
				menu.setScale(.35)
			})
			
			this.input.on('pointerupoutside', function(){
				grid.add_district()
				reset.setScale(.35)
				menu.setScale(.35)
			})
			let dx = 100/2
			let s = 0.75
			let y = 725/2
			this.voter_graph = pie.call(this, hud_cx - dx, y, demographics.voters, s, 'Population')
			this.district_graph = pie.call(this, hud_cx + dx, y, districts.winners, s, 'Election\nResults')
			
			let title = this.add.text(hud_cx, 200/2, levels.current.title, {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '20pt',
				align: 'center',
				fixedWidth: 1.75*hud_cx,
				wordWrap: {
					width: 1.75*hud_cx
				}
			})
			
			title.setOrigin(0.5, 0)
			this.voter_cam.ignore(title)
			
			
			let sp = this.add.sprite(hud_cx, 264/2, 'split')
			this.voter_cam.ignore(sp)
			
			
			let text = this.add.text(hud_cx, 275/2, "Make " + levels.current.count + " districts with " + levels.current.size + " voters each.", {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '15pt',
				align: 'center',
				fixedWidth: 1.75*hud_cx,
				wordWrap: {
					width: 1.75*hud_cx
				}
			})
			
			this.instructions = text 
			text.setOrigin(0.5, 0)
			this.voter_cam.ignore(text)
			
			
			sp = this.add.sprite(hud_cx, 368/2, 'split')
			this.voter_cam.ignore(sp)
			
			
			this.win_cond = this.add.text(hud_cx, 375/2, "The red districts must outnumber the blue.", {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '15pt',
				align: 'center',
				fixedWidth: 1.75*hud_cx,
				wordWrap: {
					width: 1.75*hud_cx
				}
			})
			
			this.win_cond.setOrigin(0.5, 0)
			this.voter_cam.ignore(this.win_cond)
			
		
			
			//end.win()
			
			/*
			let voter_arrow = this.add.sprite(hud_cx + 1.6*dx, 375, 'decorations', 3)
			voter_arrow.setScale(0.5)
			voter_arrow.alpha = 0.75
			this.voter_cam.ignore(voter_arrow)
			*/
			//console.log(solver.solve(levels.current))
			
			
			
			
		}
	}
})()