(function(){
	const ROWS = 5;
	const COLS = 5;
	const MAX_CARDS = 12;
	
	
	
	function make_player(name){
		
		let data = state.copy(state.search(state.data.characters, c => c.NAME === name))
		let f0 = 20*data.IMG
		let font = {
			color: 'white',
			stroke: 'black',
			strokeThickness: 2,
			fontStyle: 'bold',
			fontSize: (7*state.ZOOM)+'px'
		}
		
		let dx = 15*state.ZOOM
		let dy = dx 
		let sprite = this.add.sprite(0, 0, 'characters', f0)
		let hp = this.add.text(-dx, -dy, data.HP, font)
		hp.setColor('#d77bba')
		let sta = this.add.text(dx, -dy, data.STA, font)
		sta.setColor('#5fcde4')
		hp.setOrigin(0)
		sta.setOrigin(1,0)
		
		let container = this.add.container(0, 0)
		container.add(sprite)
		container.add(hp)
		container.add(sta)
		container.sprite = sprite
		container.hp = hp 
		container.sta = sta 
		
		;['down', 'right', 'left', 'up'].forEach((dir, i) => {
			state.anim(this, 
					   name+'-walk-'+dir, 
					   [f0 + 3*i, f0 + 3*i + 1, f0 + 3*i + 2], 
					   'characters'
			);
			
			state.anim(this, 
					   name+'-stand-'+dir, 
					   [f0 + 3*i], 
					   'characters'
			);
        })       
		
		let player = {
			data: data,
			name: data.NAME,
			selected: false,
			cooldown: 0,
			container: container,  
			anims: sprite.anims,
			init: function(cell, decks, evil, initiative){
				//console.log(decks)
				if(initiative !== undefined){
					this.data.STA = Math.max(this.data.STA - initiative, 0)
				}
				this.cell = cell 
				this.evil = evil  
				this.container.x = cell.sprite.x
				this.container.y = cell.sprite.y 
				this.deck = []
				let cards = state.search(decks, d => d.NAME === this.name)
				for(let i = 1; i <= MAX_CARDS; i++){
					if(cards['C'+i]){
						this.deck.push(cards['C'+i])
					}
				}
				this.refresh()
				
			},
			rest: function(){
				this.data.STA += 1 
				this.refresh()
			},
			on_over: function(){
				return this.data.NAME + '\nHP ' + this.data.HP 
			},
			on_up: function(args){
				 
				if(state.phase !== 'pick a card'){
					return 
				}
				let selected = this.selected 
				args.players.concat(args.baddies).forEach(c => c.deselect())
				this.selected = !selected
				this.cell.set(this.selected ? 'selected' : 'clean')
				
				let card = state.search(args.hand, c => c && c.status === 'selected')
				if(card && this.selected){
					if(!this.evil){
						this.act(card, args)
					}else{
						console.log("Don't give our cards to our enemies!")
					}
				}
			},
			deselect: function(args){
				
				this.cell.set('clean')
				this.selected = false 
				//this.cell.indicator.alpha = 0 
			
			},
			act: function(card, args){
				args.card = card 
				args.player = this 
				args.strat = () => {console.log('waiting for player...')}
				state.act(args)
			},
			refresh: function(){
				this.container.hp.text = this.data.HP
				this.container.sta.text = this.data.STA
			},
			hit: function(player, atks){
				let atk = atks.reduce((x,y)=>x+y) + player.data.ATK
				let def = this.data.DEF 
				if(atk > def){
					console.log('Hit!', atk, def)
					this.data.HP -= atk - def 
				}else{
					console.log('Miss!', atk, def)
				}
				if(this.data.HP <= 0){
					this.die()
				}
				this.refresh()
				
			},
			die: function(){
				let scene = this.container.scene 
				console.log("I'm dead. You've killed me.")
				console.log(this)
				scene.deck.forEach(c => {
					if(c.who === this.name){
						if(c.status === 'drawn'){
							c.discard()
						}
						c.staus = 'discarded'
					}
				})
				
				//this.container.destroy()
				this.dead = true 
				scene.players = scene.players.filter(x => x !== this)
				scene.baddies = scene.baddies.filter(x => x !== this)
				scene.tweens.add({
					targets: this.container,
					duration: 10,
					alpha: 0,
										
					//ease: 'Sine.easeInOut',
					onComplete: ()=> {
						this.container.destroy()
						scene.grid[0][0].refresh_grid()
						// add corpse
					}
				})
				//scene.grid[0][0].refresh_grid()
			}
		}
		
		container.parent = player 
		
		return player 
	}
	

	
	function make_cell(scene, i, j, grid){
		const w = 30*state.ZOOM 
		//console.log(scene.game)
		const y0 = (scene.game.canvas.height - ROWS*w + w)/2 - 0.5*w
		const x0 = scene.game.canvas.width - w*(COLS-1) - y0
		
		let sprite = scene.add.sprite(x0 + i*w, y0 + j*w, 'squares')
		sprite.setInteractive({
			useHandCursor: true,
		})
		sprite.disableInteractive()
		
		let cell = {
			sprite: sprite,
			indicator: scene.add.sprite(x0 + i*w, y0 + j*w, 'squares', 10),
			grid: grid,
			row: j,
			col: i,
			status: 'clean',
			color: false,
			occupied: false,
			occupy: function(who){
				if(who){
					this.sprite.setInteractive()
					this.occupied = who 
					who.cell = this 
					this.sprite.setFrame(3)
				}else{
					//this.sprite.disableInteractive()
					this.occupied = false 
					this.sprite.setFrame(0)
				}
			},
			set: function(val){
				if(val === 'clean'){
					this.indicator.alpha = 0
					this.status = 'clean'
					//this.sprite.disableInteractive()
				}else if(val === 'selected'){
					this.indicator.alpha = 1
					this.indicator.setFrame(10)
					//this.sprite.disableInteractive()
					this.status = 'selected'
					this.color = false 
				}else if(val === 'blue'){
					this.indicator.alpha = 1
					this.indicator.setFrame(11)
					this.sprite.setInteractive()
					this.status = 'highlighted'
					this.color = 'blue'
				}else if(val === 'red'){
					this.indicator.alpha = 1
					this.indicator.setFrame(12)
					this.sprite.setInteractive()
					this.status = 'highlighted'
					this.color = 'red'
				}else{
					throw "Unknown cell status: " + val 
				}
			}, 
			on_up: function(args){
				if(this.action){
					this.action(this)
				}else if(this.occupied){
					this.occupied.on_up(args)
				}else{
					console.warn('What am I supposed to do?')
				}
			},
			refresh_grid: function(status){
				for(let row = 0; row < this.grid.length; row++){
					for(let col = 0; col < this.grid[row].length; col++){
						let cell = this.grid[row][col]
						cell.occupy(false) 
						if(status){
							cell.set(status)
						}
					}
				}
				
				scene.players.concat(scene.baddies).forEach(p => {
					p.cell.occupy(p) 
				})
			},
			for_grid: function(func){
				for(let row = 0; row < this.grid.length; row++){
					for(let col = 0; col < this.grid[row].length; col++){
						let cell = this.grid[row][col]
						func(cell)
					}
				}
			},
			hover: function(){
				if(this.occupied && this.occupied.hover){
					console.log(this.occupied.hover())
				}
			}
		}
		
		sprite.parent = cell 
		cell.indicator.alpha = 0 
		
		grid[j][i] = cell  
		
		return cell 
		
	}

	window.battle = {
		init: function(battle){
			
			if(battle && battle.players){
				
			}else{
				this.battle = {
					players : [
						'Henry',
						'Glenn',
						'Ron',
						'Daryll',
						//'Payton'
					],
					match : 'test'
				}
			}
		},
		create: function(){
			this.grid = []
			for(let j = 0; j < ROWS; j++){
				this.grid[j] = []
				for(let i = 0; i < COLS; i++){
					//this.grid[i][j] = make_cell(this, j, i, this.grid)
					make_cell(this, i, j, this.grid)
				}
			}
			
			this.cardtainers = []
			for(let i = 0; i < this.battle.players.length; i++){
				this.cardtainers.push(
					state.make.cardtainer(this, i)
				)
			}
	
			this.deck = []
			this.players = this.battle.players.map(make_player, this)
			let order = Math.ceil(4*Math.random())
			this.players.forEach((p, i) => p.init(
				this.grid[ROWS-1][order*i % 5], 
				state.data.decks, // Change this	
				false
			))
			
			this.players.forEach(player => {
				for(let i = 0; i < player.deck.length; i++){
					let card_name = player.deck[i]
					this.deck.push(state.make.card(
						card_name, 
						player, 
						this
					))
				}
			})
			
			Phaser.Math.RND.shuffle(this.deck)
			this.cardtainers.forEach(c => c.draw(this.deck))
			
			
			let match = state.search(state.data.match, x => x.NAME === this.battle.match)
			let baddie_names = []
			
			for(let i = 1; i <= COLS; i++){
				if(match['B'+i]){
					baddie_names.push(match['B'+i])
				}
			}
			
			this.baddies = baddie_names.map(make_player, this)
			order = Math.ceil(4*Math.random())
			this.baddies.forEach((b, i) => b.init(
				this.grid[0][order*i % 5], 
				state.data.decks, // Change this	
				true,
				i
			))
			
			this.grid[0][0].refresh_grid()
			
			state.make.button(this, 240*state.ZOOM, 182*state.ZOOM, 0, function(){
				if(state.turn.player){
					state.turn.end()
				}
			})
			
			state.turn.init(this)
			ai.init(this)
			
			;['up', 'over', 'out', 'down'].forEach( x => {
				this.input.on('gameobject'+x, (pointer, obj) => {
					if(obj.parent['on_'+x]){
						obj.parent['on_'+x]({
							hand: this.cardtainers.map(x => x.card),
							players: this.players,
							baddies: this.baddies,
							grid: this.grid,
							scene: this
						})
					}
				})
			})
			
		}
	}
})()