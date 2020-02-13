(function(){
	const ROWS = 5;
	const COLS = 5;
	const MAX_CARDS = 12;
	
	function init_buttons(){
		
			this.buttons = {
				end_turn: state.make.button(this, 240*state.ZOOM, 182*state.ZOOM, 0, ()=>{
					if(state.turn.player){
						this.buttons.end_turn.disable()
						//console.log(this.players, this.baddies, this.cardtainers)
						this.players.concat(this.baddies).forEach(c => c.deselect())
						this.cardtainers.forEach(c => {
							c.card && c.card.deselect({
								hand: this.cardtainers.map(x => x.card)
							})
						})
						this.grid.highlight_all(false)
						state.turn.end()
					}
				}),
				
				discard: state.make.button(this, 342*state.ZOOM, 182*state.ZOOM, 20, ()=>{
					(this.cardtainers.map(x => x.card)
									 .filter(c => c && c.status === 'selected')
									 .forEach(c => c.discard({
										hand: this.cardtainers.map(x => x.card)
									 })))
												   
				})
				
			}
			
			this.buttons.discard.disable()
	}
	
	function make_pointer(scene){
		let pointer = {
			select: function(tiles){
				this.action(tiles)
			},
			none: function(tiles){
				return 
			},
			pick: function(tiles){
				if(tiles.occupied){
					let occupant = undefined
					scene.players.concat(scene.baddies).forEach(p => {
						let ts = p.get_tiles()
						if(!occupant && ts.occupied === tiles.occupied){
							occupant = p 
						}
					})
					
					if(occupant){
						occupant.select()
					}
				}
			}
		}
		
		scene.input.on('pointerdown', (a) => {
			let tiles = scene.grid.get_tiles_at_world(a.worldX, a.worldY)
			
			if(tiles.highlight){
				pointer.select(tiles)
				return 
			}
		})
		
		pointer.action = pointer.pick 
		
		return pointer 
	}
	
	function make_player(name){
		
		let scene = this 
		
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

		state.create_walking_animations(this, name, f0)
		
		let player = {
			
			data: data,
			name: data.NAME,
			stamina: data.STA - 1,
			selected: false,
			cooldown: 0,
			container: container,  
			anims: sprite.anims,
			get_tiles: function(){
				return scene.grid.get_tiles_at_world(this.container.x, this.container.y)
			},
			get_ground: function(){
				return this.get_tiles().ground 
			},
			init: function(decks, start, evil){
				
				this.evil = evil  
				this.deck = []
				let cards = state.search(decks, d => d.NAME === this.name)
				for(let i = 1; i <= MAX_CARDS; i++){
					if(cards['C'+i]){
						this.deck.push(cards['C'+i])
					}
				}
				
				this.container.x = start.x0 
				this.container.y = start.y0 
				
				container.scene.tweens.add({
					targets: container,
					duration: 300,
					x: start.xf,
					y: start.yf,
					onComplete: (()=> {
						//scene.grid.occupy_at_world(start.xf, start.yf)
						scene.refresh(true)
						if(state.phase === 'set up'){
							state.turn.begin()
						}
					})
				})
				
				this.refresh()
				
				
				
			},
			take_turn: function(){
				this.rest()
				
			},
			rest: function(){
				this.stamina += 1 
				this.refresh()
			},
			act: function(card, args){
				args.card = card 
				args.player = this 
				args.pointer = scene.pointer 
				args.strat = () => {console.log('waiting for user...')}
				state.act(args)
			},
			select: function(){
				let card = undefined
				scene.cardtainers.forEach(cr => {
					if(cr.card && cr.card.status === 'selected'){
						card = cr.card 
					}
				})
				
				if(card){
					this.act(card, state.get_scene_args(scene))
				}else{
					scene.players.forEach(p => p.deselect())
					this.selected = true 
					scene.grid.highlight_at_world(this.container.x, this.container.y, 'white')
				}
				
				
			},
			deselect: function(){
				this.selected = false 
				scene.grid.highlight_at_world(this.container.x, this.container.y, 'yellow')
			},
			refresh: function(){
				this.container.hp.text = this.data.HP
				this.container.sta.text = this.stamina
			},
			attack: function(atks){
				//console.log('attack', atks)
				let dam = player.data.ATK 
				if(atks[0] === 'DAM'){
					atks.slice(1).forEach(a => {
						if(a[0] === 'D'){
							
						}else{
							dam += (+a)
						}
					})
				}
				
				return {
					damage : dam,
					toxic: false 
				}
			},
			hit: function(player, atks){
				
				let atk = player.attack(atks)
				let def = this.data.DEF 
				if(atk.damage > def){
					console.log('Hit!', this.name, atk, def)
					this.data.HP -= atk.damage - def 
				}else{
					console.log('Block!', this.name, atk, def)
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

	window.battle = {
		init: function(data){
			
			console.log(data)
			this.battle = {
				players: data.scene.players.map(x => x.name),
				where: data.scene.where,
			}
			
			this.data = data 
		},
		create: function(){
			this.grid = state.make.grid(this)
			this.grid.get_area(this.data.trigger, this.data.scene)
			this.grid.check()
			this.grid.highlight_all(false)
			
			
			
			
			this.cardtainers = []
			for(let i = 0; i < this.battle.players.length; i++){
				this.cardtainers.push(
					state.make.cardtainer(this, i)
				)
			}
			
			this.deck = []
			this.players = this.battle.players.map(make_player, this)
			
			let direction = undefined
			this.data.trigger.properties.forEach(p => {
				if(p.name === 'start'){
					direction = p.value 
				}
			})
			if(!direction){
				direction = 'E'
			}
			let starting_tiles = (this.grid.get_tiles_from(direction)
									.filter(t => !t.walls || t.walls.index < 0)
									.map(t => t.ground)
								)
			
			
			this.players.forEach((p, i) => {
				//console.log(p.name, this.data.scene.players[i].name)
				let x0 = this.data.scene.players[i].sprite.x - this.data.trigger.x + this.ground.x
				let y0 = this.data.scene.players[i].sprite.y - this.data.trigger.y + this.ground.y
				let xf = starting_tiles[i].pixelX + this.ground.x + starting_tiles[i].width/2
				let yf = starting_tiles[i].pixelY + this.ground.y + starting_tiles[i].height/2
				p.init(state.data.decks, {x0:x0, y0:y0, xf:xf, yf:yf}, false)
			})
			
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
			
			
			let baddie_names = this.npcs.map(npc => npc.name)
			
			this.baddies = baddie_names.map(make_player, this)
			
			this.baddies.forEach((b, i) => {
				let baddie = this.npcs[i]
				let tile = this.grid.get_tiles_at(0, 0).ground 
				let x0 = baddie.x - this.data.trigger.x + this.ground.x + tile.width/2 
				let y0 = baddie.y - this.data.trigger.y + this.ground.y - tile.height/2

				b.init(	state.data.decks, {x0: x0, y0: y0, xf: x0, yf: y0}, true)
			})
		
			init_buttons.call(this)
						
			state.turn.init(this)
			ai.init(this)
			
			state.init_interactives(this)
			
			this.pointer = make_pointer(this)
			
			this.refresh = function(player_turn){
				this.grid.vacate_all()
				this.players.concat(this.baddies).forEach(obj => {
					this.grid.occupy_at_world(obj.container.x, obj.container.y)
					
				})
				if(player_turn){
					this.players.forEach(p => {
						this.grid.highlight_at_world(p.container.x, p.container.y, 'yellow')
					})
					this.pointer.action = this.pointer.pick 
				}else{
					this.players.forEach(p => {
						this.grid.highlight_at_world(p.container.x, p.container.y, false)
					})
					this.pointer.action = this.pointer.none 
				}
				console.log("It is the player turn: ", player_turn)
			
				
			}
		},
	
	}
})()