(function(){
	const ZOOM = 3
	
	const IN_DECK 	= 'in deck',
		  DRAWN		= 'drawn',
		  READY		= 'ready',
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

	let make = {
		button: function(scene, x, y, f, callback){
			let butt = scene.add.sprite(x, y, 'buttons', f)
			butt.parent = {
				on_over: function(){
					butt.setFrame(f+1)
				},
				on_out: function(){
					butt.setFrame(f)
				},
				on_up: function(args){
					butt.setFrame(f)
					callback(args)
				},
				on_down: function(){
					butt.setFrame(f+2)
				}
			}
			butt.setInteractive({
				useHandCursor: true,
			})
		},
		cardtainer: function(scene, n){
			const w = 64*ZOOM
			const h = 90*ZOOM
			const i = Math.floor(n / 2)
			const j = n % 2
			
			const x = Math.floor(scene.game.canvas.width / 2 - 1.1*i*w - .25*w)
			const y = Math.floor(0.65*h + 1.1*h*j)
			
			let card = {
				n: n,
				sprite: scene.add.sprite(x, y, 'cards', 4),
				draw: function(deck){
					deck = this.deck || deck
					this.deck = deck 
					if(deck.length){
						deck.filter(c => c.status === IN_DECK)[0].draw(this)
					}
				},
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
				
				let container = scene.add.container(-150, -150)
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
						}
					}
				},
				deselect: function(args){
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
					
				}
			}
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
		
		init: function(scene){
			this.data = scene.cache.json.get('data')
	
		}
	}

})()