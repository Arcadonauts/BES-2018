(function(){
	const ZOOM = 3
	let layers = ['ground', 'walls', 'exterior', 'roof', 'highlight', 'occupied']
	
	const IN_DECK 	= 'in deck',
		  DRAWN		= 'drawn',
		  READY		= 'ready',
		  HIDDEN 	= 'hidden',
		  ACTIVE	= 'active',
		  INACTIVE  = 'inactive',
		  DISCARDED = 'discarded',
		  SELECTED	= 'selected',
		  PICK_A_CARD = 'pick a card',
		  EFFECT_1 	= 'effect 1',
		  EFFECT_2	= 'effect 2',
		  ENEMY_ACT = 'enemy action'

	function search(dict, func){
		for(let key in dict){
			if(dict.hasOwnProperty(key)){
				if(func(dict[key])){
					return dict[key]
				}
			}
		}
		
		return undefined
	}
	
	function roll(die){
		if(typeof die === 'number'){
			return die
		}else if(typeof die === 'string'){
			let v = die.match(/^D(\d+)$/)
			if(v){
				let r = Math.ceil(Math.random()*v[1])
				console.log('rolled ' + v + ', got ' + r)
				
				return r 
			}
		}
	}
	
	function get(grid, row, col){
		if(row >= 0 && row < grid.length && col >= 0 && col < grid[row].length){
			return grid[row][col]
		}else{
			return undefined
		}
	}	
	
	function neighbors(cell){
		return [
			get(cell.grid, cell.row, 	cell.col - 1),
			get(cell.grid, cell.row, 	cell.col + 1),
			get(cell.grid, cell.row - 1,cell.col),
			get(cell.grid, cell.row + 1,cell.col)
		].filter(x => x)
	}
	
	function find_shortest_path(cell, target){
				let que = [cell]
				let paths = []
				for(let i = 0; i < cell.grid.length; i++){
					paths[i] = [] 
					for(let j = 0; j < cell.grid[i].length; j++){
						paths[i][j] = undefined 
					}
				}
				paths[cell.row][cell.col] = [cell]
				//console.log(target.row, target.col)
				while(que.length){
					//console.log(que.map(c => c.row + ' ' + c.col))
					let current = que.shift()
					let neighs = neighbors(current)
					let cur_path = paths[current.row][current.col]
					for(let i = 0; i < neighs.length; i++){
						c = neighs[i]
						if(!c.occupied){
							//console.log(target.row - c.row, target.col - c.col)
							if(c.row === target.row && c.col === target.col){
								//console.log('found:',cur_path.concat(c))
								return cur_path.concat(c)
							}else if(!paths[c.row][c.col]){
							
								paths[c.row][c.col] = cur_path.concat(c)
								que.push(c)
							}
						}
					}
				}
				return false 
				
			}
	
	function copy(dict){
		let op = {}
		for(let key in dict){
			if(dict.hasOwnProperty(key)){
				op[key] = dict[key]
			}
		}
		return op 
	}
	
	function pretty_condition(text){
		if(!text){
			return ''
		}
		
		let props = {
			ATK: 'Attack',
			DEF: 'Defence',
			HP: 'HP',
			MAG: 'Magic',
			DEX: 'Dexterity',
			INT: 'Intellegence',
			DAD: 'Daddiness'
		}
		
		for(let p in props){
			if(props.hasOwnProperty(p)){
				text = text.replace(p, props[p])
			}
		}
		
		text = text.replace('>', ' > ')
		text = text.replace('<', ' < ')
		
		text = text[0].toUpperCase().concat(text.slice(1))
		
		return text
	}
	
	function pretty_description(description, effect1, effect2){
		if(description){
			return description
		}else if(effect2){
			return effect1 + '\n' + effect2
		}else if(effect1){
			return effect1 
		}else{
			return '???'
		}	
		
	}
	
	function anim(scene, key, frames, sheet, fr){
		fr = fr || 10
		let fs = []
		frames.forEach(i => fs.push({key: sheet, frame: i}))
		scene.anims.create({
			key: key,
			frames: fs,
			frameRate: fr,
			repeat: -1
		})
	}
	
	function create_walking_animations(scene, name, f0){
		['down', 'right', 'left', 'up'].forEach((dir, i) => {
			state.anim(scene, 
					   name+'-walk-'+dir, 
					   [f0 + 3*i, f0 + 3*i + 1, f0 + 3*i + 2], 
					   'characters'
			);
			
			state.anim(scene, 
					   name+'-stand-'+dir, 
					   [f0 + 3*i], 
					   'characters'
			);
        })  
	}

	function animate(who, what, where){
		let dr = where.row - who.cell.row 
		let dc = where.col - who.cell.col
		let dir
		if(dr > 0){
			dir = 'down'
		}else if(dr < 0){
			dir = 'up'
		}else if(dc > 0){
			dir = 'right'
		}else if(dc < 0){
			dir = 'left'
		}
		if(dir){
			who.anims.play(who.data.NAME+'-'+what+'-'+dir)
		}
	}

	function act(args){
		
		if(args.card.data.COST > args.player.data.STA){
			console.log('Too Expensive')
			return 
		}else{
			args.player.data.STA -= args.card.data.COST
			args.player.refresh()
		}
		
		args.player.deselect()
		args.card.discard(args)
		
		manager.begin(args)
		
	}
	
	let roof = {
		init: function (scene){
			this.scene = scene 
			let roof = scene.roof 
			roof.setDepth(1)
			let side = {}
			roof.layer.properties.forEach(p => side[p.name] = p.value.split(' ').map(x => +x))
			let c = 1
			function color(tile, c){
				if(tile.color === undefined){
				
					tile.color = c 
					let roof_neighs = [
						scene.grid.get_rel_tiles(tile,  0,-1).roof,
						scene.grid.get_rel_tiles(tile,  0, 1).roof
					]
					
					let index = tile.index - 1 
					if(side.left.indexOf(index) === -1){
						roof_neighs.push(scene.grid.get_rel_tiles(tile, -1, 0).roof)
						
					}
					if(side.right.indexOf(index) === -1){
						roof_neighs.push(scene.grid.get_rel_tiles(tile,  1, 0).roof)
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
			
			let roof = this.scene.grid.get_tiles_from_tile(tile).roof 
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
	
	let turn = {
		init: function(scene){
			this.player = true 
			this.scene = scene
		},
		end: function(){
			//console.log('End turn', this.player)
			this.player = !this.player 
			this.begin()
		},
		begin: function(){
			if(this.player){
				this.scene.players.forEach(b => b.rest())
				state.phase = PICK_A_CARD
				this.scene.cardtainers.forEach(c => {
					if(!c.card){
						c.draw()
					}
				})
				this.scene.buttons.end_turn.enable()
			}else{
				this.scene.baddies.forEach(b => b.rest())
				state.phase = ENEMY_ACT
				ai.take_turn()
			}
			
		},
		next: function(){
			if(this.player){
				state.phase = PICK_A_CARD
				//console.log('waiting...')
			}else{
				ai.take_turn()
			}
		}
	}
	
	let manager = {
		begin: function(args){
			this.args = args 
			this.effects = [args.card.effect1, args.card.effect2].filter(x => x)
			state.phase = EFFECT_1
			
			//console.log("let the games begin")
			//console.log(args)
			this.next()
		},
		
		next: function(){
			
			function execute(target){
				manager.execute(target)
			}
			this.args.player.cell.for_grid(c => c.action = undefined)
			if(this.effects.length === 0){
				turn.next()
				return 
			}
			
			this.eff = this.effects.shift() 
			this.is_legal_effect(this.eff)
			let cells = this.eff.highlight(this.args.player.cell)
			if(!cells || cells.length === 0){
				return this.next()
			}
			cells.forEach(c => {
				c.set(this.eff.color)
				c.action = execute 
			})
			
			this.args.strat(this.args, cells, this.eff.flavor)
		},
		execute: function(target){
			this.eff.action(target, this.args)
		},
		
		is_legal_effect: function(eff){
			['highlight', 'color', 'flavor', 'action'].forEach(key => {
				if(eff[key] === undefined){
					console.warn(eff, 'missing ' + key)
				}
			})
		}
	}
	
	let dice = {
		forEach: function(f){
			this.dice.forEach(f)
		},
		get: function(id){
			return this.dice[id]
		},
		init: function(){
			let r = ()=>[1,2,3,4,5,6]
			let func = function(who){return Phaser.Math.RND.pick(this.vals)}
			
			this.dice.forEach((die, id) => {
				if(!die.vals){
					die.vals = r()
				}
				if(!die.func){
					die.func = func 
				}
				die.id = id 
			})
		},
		dice: [
			{
				name: 'Vanilla Die',
				desc: "Just a six-sided die",
				icon: 0,
			},{
				name: 'One Four All',
				vals: [4, 4, 4, 4, 4, 4],
				desc: "Alway roll a four",
				icon: 13,
			},{
				name: 'Plus One',
				vals: [2, 3, 4, 5, 6, 7],
				desc: "Roll a Vanilla Die, and then add 1",
				icon: 12,
			},{
				name: 'All or Nothing',
				vals: [1, 1, 1, 6, 6, 6],
				desc: '50% chance of rolling a 6, 50% chance of rolling a 1',
				icon: 8,
			},{
				name: 'Collatz Die',
				func: function(who){
					let val = Phaser.Math.RND.pick(this.vals)
					this.vals = this.vals.map(x => x%2 ? 3*x+1 : x/2)
					return val 
				},
				desc: "A Die cursed by a wizard named Collatz. Each time it's rolled, its values change. It looses power over time.",
				icon: 10,
			},{
				name: 'With Advantage',
				func: function(who){
					let val1 = Phaser.Math.RND.pick(this.vals)
					let val2 = Phaser.Math.RND.pick(this.vals)
					return Math.max(val1, val2)
				},
				desc: "Roll two dice and take the higher value",
				icon: 11
			},{
				name: 'Even Stevens',
				vals: [2, 2, 4, 4, 6, 6],
				desc: "Always roll an even number",
				icon: 16,
			},{
				name: "Devil's Die",
				vals: ['.', '.', '.', '.', '.', '!'],
				desc: "5/6 chance of doing 1HP of self damage, 1/6 chance of rolling a 50",
				icon: 9,
			},{
				name: "Lucky Number 1",
				desc: "+1 Stamina each time you roll a 1",
				icon: 1,
			},{
				name: "Lucky Number 2",
				desc: "+2 Attack each time you roll a 2",
				icon: 2,
			},{
				name: "Lucky Number 3",
				desc: "+3 HP each time you roll a 3",
				icon: 3,
			},{
				name: "Lucky Number 4",
				desc: "+4 Defense each time you roll a 4",
				icon: 4,
			},{
				name: "Lucky Number 5",
				desc: "+5 XP each time you roll a 5",
				icon: 5,
			},{
				name: "Lucky Number 6",
				desc: "+6 Gold each time you roll a 6",
				icon: 6,
				
			},{
				name: "Lucky Number Everything",
				desc: "All the lucky dice fused into one very lucky die",
				icon: 7,
			}
			
		]
	}
	
	let actions = {
		parse: function(string){
			let re = {
				move : /^MOV:(\d+)$/,
				//melee: /^MEL\+(.*)$/,
				//range: /^RNG\+(.*)$/,
				attack: /^(RNG|MEL)\+(.*)$/,
				self: /^SELF:(.*)$/
			}
			if(!string){
				return undefined
			}else if(string[0] === '&'){
				let func = this.specials[string.slice(1)]
				if(func){
					return func 
				}else{
					console.warn('Unknown Special: ' + string)
					return 
				}
			}else if(string.match(re.attack)){
				let atk = string.match(re.attack)
				let atks = atk[2].split('+').map(x=>isNaN(+x)?x:+x)
				let func = atk[1] === 'RNG' ? this.range : this.melee 
				return func(atks)
			
			}else if(string.match(re.move)){
				let move = string.match(re.move)
				let amnt = +move[1]
				return this.move(amnt)
			}else if(string.match(re.self)){
				let self = string.match(re.self)
				let what = self[1]
				return this.self(what)
			
			
			}else{
				
				console.warn('Unknown Action: ' + string)
				return 
			}
		},
		specials: {
			toxic_cloud: function(){
				state.phase = PICK_A_CARD
			},
			entangle: function(){
				state.phase = PICK_A_CARD
			},
			stone_cold: function(){
				state.phase = PICK_A_CARD
			},
			nunchucks: function(){
				state.phase = PICK_A_CARD
			},
			song_of_healing: function(){
				state.phase = PICK_A_CARD
			},
			bolderdash: function(){
				state.phase = PICK_A_CARD
			},
			invisibility: function(){
				state.phase = PICK_A_CARD
			},
			confuse: function(){
				state.phase = PICK_A_CARD
			},
			kiss_the_cook: function(){
				state.phase = PICK_A_CARD
			},
			van: function(){
				state.phase = PICK_A_CARD
			},
			ghost_dad: function(){
				state.phase = PICK_A_CARD
			},
			alarm_clock: function(){
				state.phase = PICK_A_CARD
			}
		},
		move: function(amnt){
			
			return {
				color: 'blue',
				flavor: 'move',
				
				highlight: function(cell){
					let cells = [cell]
					for(let i = 0; i < cell.grid.length; i++){
						for(let j = 0; j < cell.grid[i].length; j++){
							let dr = cell.grid[i][j].row - cell.row 
							let dc = cell.grid[i][j].col - cell.col
							if(Math.abs(dr) + Math.abs(dc) <= amnt){
								//console.log('find path')
								let path = find_shortest_path(cell, cell.grid[i][j])
								//console.log(path)
								if(path && path.length <= amnt+1){
									cells.push(cell.grid[i][j])
								}
								
							}
						
						}
					}
					return cells 
				},
				action: function(target, args){
					//console.log('move your body', target, args)
					target.refresh_grid('clean')
					function move_player(player, path){
						if(path.length){
							let to = path.shift()
							animate(player, 'walk', to)
							args.scene.tweens.add({
								targets: player.container,
								duration: 300,
								x: to.sprite.x,
								y: to.sprite.y,
								//ease: 'Sine.easeInOut',
								onComplete: ()=> {
									animate(player, 'stand', to)
									to.occupy(player)
									to.refresh_grid('clean')
									move_player(player, path)
								}
							})
						}else{
							manager.next()
						}
					}
					
					let path = find_shortest_path(args.player.cell, target)
					move_player(args.player, path)
				}
				
			}
			
		},
		melee: function(atks){
			function attack(player, cell){
				if(cell.occupied){
					cell.occupied.hit(player, atks.map(roll))
				}else{
					console.log('miss')
				}
			}
			
			return {
				color: 'red',
				flavor: 'melee',
				highlight: function(cell){
					//console.log('melee attack: highlight')
					return neighbors(cell)
				},
				action: function(target, args){
					let dr = args.player.cell.row - target.row 
					let dc = args.player.cell.col - target.col 
					//console.log(dr, dc)
					let f = 200
					if(dc > 0){
						f += 2
					}else if(dc < 0){
						
					}else if(dr > 0){
						f += 1 
					}else if(dr < 0){
						f += 3
					}
					let s = args.scene.add.sprite(args.player.container.x, args.player.container.y, 'characters', f)
					target.refresh_grid('clean')
					animate(args.player, 'stand', target)
					args.scene.tweens.add({
						targets: s,
						duration: 150,
						x: target.sprite.x,
						y: target.sprite.y,
						yoyo: true,
						
						//ease: 'Sine.easeInOut',
						onComplete: ()=> {
							args.scene.tweens.add({
								targets: s,
								duration: 50,
								alpha: 0,
								onComplete: () => {
									s.destroy()
									attack(args.player, target)
									manager.next()
								}
							})
						}
					})
				}
			}
		},
		range: function(atks){
			return {
				color: 'red',
				flavor: 'range',
				highlight: function(){
					console.log('range attack: highlight')
					return [] 
				},
				action: function(){
					
				}
			}
		},
		self: function(what){
			return function(){
				console.log('Go ' + what + ' yourself.')
				state.phase = PICK_A_CARD
			}
		}
	}

	let butt_manager = {
		init: function(){
			this.butts = []
		},
		register: function(butt){
			this.butts.push(butt)
			butt.manager = this 
		}
	}

	let make = {
		button: function(scene, x, y, f, callback){
			let sprite = scene.add.sprite(x, y, 'buttons', f)
			//butt_manager.register(sprite)
			sprite.parent = {
				on_over: function(){
					sprite.setFrame(f+1)
				},
				on_out: function(){
					if(this.enabled) sprite.setFrame(f)
				},
				on_up: function(args){
					sprite.setFrame(f)
					callback(args)
				},
				on_down: function(){
					sprite.setFrame(f+2)
				},
				disable: function(){
					sprite.disableInteractive()
					sprite.setFrame(f+3)
					this.enabled = false 
				},
				enable: function(){
					sprite.setInteractive()
					sprite.setFrame(f)
					this.enabled = true 
				},
				enabled: true,
				sprite: sprite 
			}
			sprite.setInteractive({
				useHandCursor: true,
			})
			
			return sprite.parent
		},
		cardtainer: function(scene, x, y){
			const w = 64*ZOOM
			const h = 90*ZOOM
			
			if(y){
				
			}else{
				const n = x 
				const i = Math.floor(n / 2)
				const j = n % 2
				
				x = Math.floor(scene.game.canvas.width / 2 - 1.1*i*w - .25*w)
				y = Math.floor(0.65*h + 1.1*h*j)
			}
			
			let card = {
				//n: n,
				sprite: scene.add.sprite(x, y, 'cards', 4),
				draw: function(deck){
					deck = this.deck || deck
					this.deck = deck 
					if(deck.length){
						deck.filter(c => c.status === IN_DECK)[0].draw(this)
					}
				},
				deselect: function(){
					if(this.card){
						this.card.deselect()
					}
				}
			}
			
			return card 
		},
		card: function(name, who, scene){
			
			let data = search(state.data.cards, c => c.NAME === name)
			//console.log(cards)
			if(!data){
				throw('Unknown Card: ' + name + ' (' + who.name + ')')
				//console.warn('Unknown Card: ' + name + ' (' + who.name + ')')
			}
			
			function create_container(data, scene, color){	
				let font = {
					fontSize: (7*ZOOM)+'px',
					fontFamily: '"Times New Roman", Tahoma, serif',
					color: 'black',
					fontStyle: 'bold'
				}
				
				let container = scene.add.container(-150, scene.game.canvas.height/2)
				let bg = scene.add.sprite(0, 0, 'cards', 8)
				let sprite = scene.add.sprite(0, 0, 'cards', color)
				let img = scene.add.sprite(0, -22*ZOOM, 'card_art', data.ART)
				let title = scene.add.text(-25*ZOOM, -42*ZOOM, data.NAME, font)
				title.setOrigin(0,0)
				
				let cost = scene.add.text(18*ZOOM, -9*ZOOM, data.COST, {
					fontSize: (12*ZOOM)+'px',
					fontFamily: '"Times New Roman", Tahoma, serif',
					color: 'black',
					fontStyle: 'bold'
				})
				let cond = scene.add.text(-27*ZOOM, -7*ZOOM, pretty_condition(data.COND), font)
				let w = 26*ZOOM
				let desc = scene.add.text(-w, 4*ZOOM, pretty_description(data.DESC, data.EFF1, data.EFF2), {
					fontSize: (6*ZOOM)+'px',
					fixedWidth: 2*w,
					fixedHeight: 40*ZOOM,
					//maxLines: 5,
					wordWrap: {width: 2*w + 2},
					color: 'black'
				})	
			
				container.add(bg)
				container.add(img)
				container.add(sprite)
				container.add(title)
				container.add(cost)
				container.add(cond)
				container.add(desc)
				
				container.setSize(sprite.width, sprite.height)
				container.setInteractive({
					useHandCursor: true,
				})
				
				return container
			}
			
			
			return {
				//container: container,
				who: who.name,
				data: data,
				status: IN_DECK,
				effect1: actions.parse(data.EFF1),
				effect2: actions.parse(data.EFF2),
				scene: scene,
				draw: function(loc){
					this.container = create_container(data, scene, who.data.IMG)
					this.container.parent = this 
					this.status = DRAWN 
					this.cardtainer = loc 
					loc.card = this 
					scene.tweens.add({
						targets: this.container,
						duration: 1000,
						x: loc.sprite.x,
						y: loc.sprite.y,
						delay: Math.random() * 200,
						ease: 'Sine.easeInOut',
						onComplete: ()=> this.status = READY
					})
				},
				on_up: function(args){
					if(state.phase !== PICK_A_CARD){
						return 
					}
					
					if(this.status === SELECTED){
						this.deselect(args)
					}else if(this.status === READY){
						this.deselect(args)
						let ct = this.cardtainer.sprite
						this.status = SELECTED
						ct.setFrame(5)
						ct.setScale(1.1, 1.1)
						this.container.setScale(1.05)
						
						let player = search(args.players, p => p.selected)
						if(player){
							player.act(this, args)
						}else{
							this.scene.buttons.discard.enable()
						}
					}
				},
				deselect: function(args){
					this.scene.buttons.discard.disable()
					args.hand.filter(c => c).forEach(c => {
						c.status = READY
						let ct = c.cardtainer.sprite
						ct.setFrame(4)
						ct.setScale(1, 1)
						c.container.setScale(1, 1)
					})
				},
				discard: function(args){
					if(this.container){
						this.cardtainer.card = undefined
						this.container.destroy()
						this.status = DISCARDED
						this.deselect(args)
					}
					
				},
				hide: function(){
					this.status = HIDDEN 
					this.container.alpha = 0
					this.cardtainer.card = undefined
				},
				unhide: function(){
					this.status = READY 
					this.container.alpha = 1
					this.cardtainer.card = this 
				}
			}
		},
		grid: function(scene){
			
			let grid = {
				scene: scene,
				limit: 12,
				init: function(where){
					this.create(where)
					roof.init(scene)
					//this.add_layer('highlight')
					//this.add_layer('occupied')
					/* This is going to be a problem down the line. Everytime a new grid is 
						created (As opposed to generated by get_area), highlight and occupied
						are added to layers (the global array at the top of this file.)
					*/
				},
				check: function(){
					layers.concat(['map', 'tileset', 'grid']).forEach(key => {
						if(!scene[key]){
							throw 'Scene needs ' + key + ' to use grid'
						}
					})
				},
				create: function(where){
					scene.map = scene.make.tilemap({
						key: where,
					})
					scene.map.setBaseTileSize(scene.map.tileWidth*ZOOM, scene.map.tileHeight*ZOOM);
					
					scene.tileset = scene.map.addTilesetImage('pix_squares', 'squares', scene.map.tileWidth, scene.map.tileHeight)
		
					layers.forEach(layer => {
						scene[layer] = scene.map.createDynamicLayer(layer, scene.tileset, 0, 0)
						scene[layer].forEachTile(t => {
							t.width *= ZOOM,
							t.height *= ZOOM 
						})
						//console.log(scene[layer])
					})
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
				get_tiles_at: function(x, y){
					return this.get_tiles(layer => layer.getTileAt(x, y))
				},
				get_rel_tiles: function(tile, dx, dy){
					return this.get_tiles(layer => layer.getTileAt(tile.x + dx, tile.y + dy))
				},
				get_tiles_from_tile: function(tile){
					return this.get_tiles(layer => layer.getTileAt(tile.x, tile.y))
				},
				get_tiles_at_world: function(x, y){
					return this.get_tiles(layer => {
						return layer.getTileAtWorldXY(x, y)
					})
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
						
					
				},
				get_area: function(trigger, old_scene){
					//console.log(this.get_tiles_at_world(trigger.x, trigger.y))
					let new_scene = this.scene
					
					let tl = old_scene.grid.get_tiles_at_world(trigger.x, trigger.y).ground 
					let w = trigger.width/tl.width
					let h = w 
					let cw = new_scene.game.canvas.width
					let ch = new_scene.game.canvas.height 
					let r = 0.045
					
					new_scene.map = new_scene.make.tilemap()
					new_scene.map.setBaseTileSize(tl.width, tl.height)
					new_scene.tileset = new_scene.map.addTilesetImage('pix_squares', 'squares', tl.width, tl.height)
					layers.forEach(layer => {
						
						let tiles = old_scene[layer].getTilesWithin(tl.x, tl.y, w, h)
						
						new_scene[layer] = new_scene.map.createBlankDynamicLayer(
							layer, 
							new_scene.tileset, 
							Math.floor(cw - w*tl.width - r*cw),
							Math.floor(r*cw),
							w, 
							h, 
							tl.width, 
							tl.height
						)
						
						tiles.forEach(tile => {
							new_scene[layer].putTileAt(
								tile.index - 1, 
								tile.x - trigger.x/tile.width, 
								tile.y - trigger.y/tile.height
							)
						})
						
						
					})
					 
				},
				get_tiles_from(direction){
					let w = scene.map.layers[0].width 
					let h = scene.map.layers[0].height
					if(w !== h){
						throw "Width and height don't match! " + w + ', ' + h 
					}
					
					let center = Math.floor(w/2)
					
					let dirs = {
						E: {dx:1, dy: 0, x0:w-1, 	y0:center},
						W: {dx:-1,dy: 0, x0:0,   	y0:center},
						N: {dx:0, dy:-1, x0:center,	y0:0},
						S: {dx:0, dy: 1, x0:center,	y0:w-1}
					}
					console.log(direction)
					let dir = dirs[direction]
					
					let ss = {
						x: 1 - Math.abs(dir.dx),
						y: 1 - Math.abs(dir.dy)
					}
					let bs = {
						x: -dir.dx,
						y: -dir.dy
					}
					
					let start = this.get_tiles_at(dir.x0, dir.y0).ground
					//console.log(start)
					
					let tiles = []
					for(b = 0; b < w; b++){
						tiles.push(this.get_rel_tiles(start, b*bs.x, b*bs.y))
						for(s = 1; s <= center; s++){
							tiles.push(this.get_rel_tiles(start, b*bs.x + s*ss.x, b*bs.y + s*ss.y))
							tiles.push(this.get_rel_tiles(start, b*bs.x - s*ss.x, b*bs.y - s*ss.y))
						}
					}
					
					return tiles 
				},
				add_layer: function(name){
					this.check()
					
					scene[name] = this.scene.map.createBlankDynamicLayer(
						name, 
						this.scene.tileset, 
						this.scene.ground.x,
						this.scene.ground.y,
						this.scene.ground.layer.data.length, 
						this.scene.ground.layer.data[0].length, 
					)
					
					if(layers.indexOf(name) === -1){
						layers.push(name)
					}
					
					console.log(scene[name])
				},

				create_thing_family: function(string, func){
					this[string + '_at'] = this.thing_at(func)
					this[string + '_tile'] = this.thing_tile(string)
					this[string + '_at_world'] = this.thing_at_world(string)
				},
				thing_at: function(func){
					return function(x, y, arg){
						//console.log('thing at', x, y)
						func(x, y, arg)
					}
				},
				thing_tile: function(string){
					return function(tile, arg){
						//console.log('thing at tile', tile)
						this[string + '_at'](tile.x, tile.y, arg)
					}
				},
				thing_at_world(string){
					return function(x, y, arg){
						//console.log('thing at world', x, y)
						let tile = this.get_tiles_at_world(x, y).ground 
						this[string + '_tile'](tile, arg)
					}
				}
			}
			
			grid.create_thing_family('occupy', function(x, y){
				//console.log('occupy', x, y)
				scene.occupied.putTileAt(9, x, y)
			})
			
			grid.create_thing_family('vacate', function(x, y){
				scene.occupied.removeTileAt(x, y)
			})
			
			grid.create_thing_family('highlight', function(x, y, color){
				let colors = {
					white: 10,
					blue: 11,
					red: 12
				}
				
				if(color){
					scene.highlight.putTileAt(colors[color], x, y)
				}else{
					scene.occupied.removeTileAt(x, y)
				}
			})
			
			
			return grid 
			
			
			//return path 
		}
	}
	
	window.state = {
		make: make,
		turn: turn,
		search: search,
		act: act,
		phase: PICK_A_CARD,
		anim: anim,
		copy: copy,
		ZOOM: ZOOM,
		dice: dice, 
		layers: layers,
		create_walking_animations: create_walking_animations,
		players: [ // Don't Change The Order So Help Me God!
			'Henry',
			'Darryl',
			'Glenn',
			'Ron',
			
			//'Payton'
		],
		
		init: function(scene){
			this.data = scene.cache.json.get('data')
			dice.init()
	
		},
		init_interactives: function(scene){
			if(!scene.cardtainers){
				scene.cardtainers = []
			}
			;['up', 'over', 'out', 'down', 'drag'].forEach( x => {
				scene.input.on('gameobject'+x, (pointer, obj) => {
					if(obj.parent['on_'+x]){
						obj.parent['on_'+x]({
							hand: scene.cardtainers.map(x => x.card),
							players: scene.players,
							baddies: scene.baddies,
							grid: scene.grid,
							scene: scene
						})
					}
				})
			})
		}
	}

})()