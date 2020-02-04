(function(){
	const ZOOM = state.ZOOM,
		  RED = 0xd95763,
		  BLUE = 0x5b6ee1,
		  ORANGE = 0xdf7126,
		  BROWN = 0x8f563b,
		  GREEN = 0x37946e,
		  MAX_CARDS = 12,
		  WIDTH = 16*24*ZOOM,
		  HEIGHT = 9*24*ZOOM
		  
		  
	
	function move_cam(scene, x, y){
		let config = {
			targets: scene.cameras.main,
			duration: 300,
			ease: 'Sine.easeInOut',
		}
		
		if(x !== undefined){
			config.scrollX = x 
		}
		if(y !== undefined){
			config.scrollY = y 
		}
		
		return ()=>{
			scene.bg.set()
			scene.tweens.add(config)
		}
	}
	
	function make_bg(scene){
		function buttonatize(s, i){
			s.setInteractive({
				useHandCursor: true,
			})
			
			s.parent = {
				sprite: s,
				bg: scene.add.sprite(s.x, s.y, 'headshots', i),
				on_over: function(){
					this.bg.alpha = 1
				},
				on_out: function(){
					this.bg.alpha = 0
				},
				on_up: function(){
					scene.tweens.add({
						targets: scene.cameras.main,
						duration: 300,
						scrollX: -WIDTH,
											
						ease: 'Sine.easeInOut',
						onComplete: ()=> {
						}
					})
				}
			}
			
			s.parent.bg.alpha = 0 
			s.depth = 1 
		}
		
		let bg = scene.add.graphics()
		let x = 40*ZOOM
		let y = 150 - HEIGHT 
		let headshot = scene.add.sprite(x - 12*ZOOM, y, 'headshots', 4)
		let title = scene.add.sprite(x+42*ZOOM, y+2, 'headshots', 4+4)
		let descriptions = [
			"Nature Burkenstock Granolla Dad",
			"Stay at Home Sports Dad",
			"Dad Rock Cover Band Dad",
			"Emotionally Restrained Step Father"
		]
		
		let cls = [
			"Druid",
			"Barbarian",
			"Bard",
			"Rouge"
		]
		
		let desc = scene.add.text(x-24*ZOOM, y + 24*ZOOM, "Hello", {
			fontSize: (7*ZOOM)+'px',
			fontFamily: '"Times New Roman", Tahoma, serif',
			color: 'black',
			fontStyle: 'bold',

		})
		
		let cx = 10*ZOOM 
		let initiative = scene.add.sprite(x+cx, y+60*ZOOM, 'headshots', 12)
		buttonatize(initiative, 17)
		
		let dietainer = scene.add.sprite(x+cx, y+95*ZOOM, 'headshots', 16)
		buttonatize(dietainer, 18)
		let die = scene.add.sprite(x+cx, y+95*ZOOM, 'characters', 220)
		die.depth = 1
		
		let indicators = []
		let stats = ['ATK', 'DEF', 'MAG', 'DAD']
		stats.forEach((key, i) => {
			
			indicators.push(make_indicator(scene, key, WIDTH/2, -0.65*HEIGHT + .125*i*HEIGHT))
		})
		
		bg.set = function(index){
			//console.log('set', index)
			if(index !== undefined){
				this.index = index 
			}else{
				index = this.index 
			}
			
			this.clear()
			this.draw(index, 0)
			this.draw(index, -HEIGHT)
			headshot.setFrame(4 + index)
			title.setFrame(8 + index)
			desc.text = descriptions[index] + '\n' + cls[index]
			
			let player = scene.players[index]
			if(player){
				initiative.setFrame(12+player.data.STA)
				die.setFrame(220 + state.dice.get(player.data.DIE).icon)
			}
			
			indicators.forEach(x => x.set(player))
		}
		
		bg.draw = function(index, y){
			let x0 = 0
			let dy = 24*ZOOM
			let y0 = dy + y 
			let w = 48*ZOOM 
			
			let colors = [BLUE, RED, ORANGE, BROWN]
			
			this.fillStyle(colors[index], 1.0)
			this.fillRect(x0, y0, WIDTH, HEIGHT-dy)
			
			this.lineStyle(2*ZOOM, 0, 1)
			this.beginPath()
			this.moveTo(x0+index*w, y0)
			this.lineTo(x0, y0)
			this.lineTo(x0, y0+HEIGHT-dy)
			this.lineTo(WIDTH, y0+HEIGHT-dy)
			this.lineTo(WIDTH, y0)
			this.lineTo(x0+(index+1)*w, y0)
			this.stroke()
			
		}
		
		return bg 
	}
	
	function make_indicator(scene, stat, x, y){
		function make_counter(){
			const tot = 5 
			let counters = []
			let x0 = x + 8*ZOOM
			let dw = 17*ZOOM 
			for(let i = 0; i < tot; i++){
				
				let s = scene.add.sprite(x0, y, 'characters', 240)
				x0 += dw
				counters.push(s)
			}
			
			return {
				sprites: counters,
				set: function(val){
					this.sprites.forEach((s, i) => {
						s.setFrame(240)
						s.alpha = i<val ? 1 : 0
					})
					let i = 0 
					while(val > 5){
						this.sprites[i%tot].setFrame(240 + Math.ceil((i+1)/tot))
						i += 1 
						val -= 1
					}
				}
			}
		}
		
		let dict = {
			ATK: 'Attack',
			DEF: 'Defense',
			MAG: 'Magic',
			DAD: 'Daddiness'
		}
		
		let text = scene.add.text(x, y, stat, {
			fontSize: (12*ZOOM)+'px',
			fontFamily: '"Times New Roman", Tahoma, serif',
			color: 'black',
			fontStyle: 'bold',
		})
		text.setOrigin(1, .5)
		
		text.stat = stat 
		
		text.set = function(who){
			text.text = dict[stat] + ':'
			//console.log(who.data[stat])
			text.counter.set(who.data[stat])
		}
		
		text.counter = make_counter()
		
		
		return text 
	}
	
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
	
	let dice_manager = {
		init: function(scene){
			this.dice = []
			this.scene = scene 
			state.dice.forEach((d, i) => this.make_die(d, i))
			this.players = []
			
		},
		make: function(player, x, y){
			let scene = this.scene 
			let p = {
				player: player,
				sprite: this.scene.add.sprite(x, y, 'headshots', 16),
				vanilla: this.scene.add.sprite(x, y, 'characters', 220),
				x: x,
				y: y,
				place: function(die){
					if(this.die && this.die !== die){
						dice_manager.revert(this.die)
					}
					this.player.data.DIE = die.data.id
					if(die.icon === 0){ // vanilla 
						die.sprite.x = die.x0 
						die.sprite.y = die.y0 
						die.sprite.alpha = 0 
						
						die.sprite.depth = 0 
						this.die = undefined
						
						scene.tweens.add({
							targets: die.sprite,
							alpha: 1,
							duration: 300,		
							ease: 'Sine.easeInOut',
						})
						
					}else{
						die.sprite.x = this.x
						die.sprite.y = this.y 
						die.sprite.depth = 0 
						this.die = die 
						die.player = this 
					}
				}
			}
			
			this.players.push(p)
		},
		revert: function(die){
			if(die.player){
				die.player.player.data.DIE = 0
				die.player.die = undefined
				die.player = undefined
			}
			this.scene.tweens.add({
				targets: die.sprite,
				x: die.x0,
				y: die.y0,
				duration: 100,		
				ease: 'Sine.easeInOut',
				onComplete: ()=>{
					die.sprite.depth = 0 
					
					
				}
			})
		},
		drop: function(die){
			for(let i = 0; i < this.players.length; i++){
				let dx = die.sprite.x - this.players[i].x 
				let dy = die.sprite.y - this.players[i].y
				if(Math.abs(dx) < die.sprite.width/2 && Math.abs(dy) < die.sprite.height/2){
					this.players[i].place(die)
					return 
				}
			}
			this.revert(die)
		},
		make_die: function(d, i){
			let dx = WIDTH/8
			let x, y 
			if(i < 7){
				x = -WIDTH + (i+1)*dx 
				y = -HEIGHT/4 
			}else{
				x = -WIDTH + (i-6.5)*dx 
				y = -HEIGHT/4 + .12*HEIGHT 
			}
			
			let f = !d.got ? 220 + d.icon : 239
			
			let dicetainer = this.scene.add.sprite(x, y, 'characters', 239)
			let s = this.scene.add.sprite(x, y, 'characters', f)
			s.setInteractive({
				useHandCursor: true,
				draggable: true
			})
			
			s.on('drag', (pointer, x, y)=>{
				s.x = x 
				s.y = y 
				s.depth = 1
			})
			
			s.on('dragend', (pointer, x, y)=>{
				this.drop(s.parent)
			})
			
			let parent = {
				x0: x,
				y0: y,
				sprite: s,
				bg: dicetainer,
				icon: d.icon,
				data: d
			}
			//console.log(d)
			s.parent = parent 
			
			this.dice.push(parent)
		}
	}
	
	let init_manager = {
		init: function(scene){
			this.objs = [] 
			this.scene = scene 
		},
		drop: function(init){
			for(let i = 0; i < this.objs.length; i++){
				let dx = this.objs[i].x0 - init.sprite.x 
				let dy = this.objs[i].y0 - init.sprite.y
				if(Math.abs(dx) < init.sprite.width/2 && Math.abs(dy) < init.sprite.height/2){
					this.swap(init, this.objs[i])
					return 
				}
			}
			this.revert(init)
		},
		revert: function(init){
			init.initainer.alpha = 1 
			this.scene.tweens.add({
				targets: init.sprite,
				duration: 100,
				x: init.x0,
				y: init.y0,					
				ease: 'Sine.easeInOut',
				onComplete: ()=> {
					init.player.data.STA = init.val 
					let data = state.search(state.data.characters, x=>x.NAME===init.player.name)
					data.STA = init.val 
					init.initainer.alpha = 0 
					init.initainer.x = init.x0 
					init.initainer.y = init.y0
					init.sprite.depth = 0 
					//console.log(init.player.name, init.val)
				}
			})
		},
		swap: function(a, b){
			
			function override(x, y){
				['player', 'x0', 'y0'].forEach(k => x[k] = y[k])
			}

			let c = {}				
			override(c, a)
			override(a, b)
			override(b, c)
			
			this.revert(a)
			this.revert(b)
			
			
		},
		make: function(scene, player, x, y){
			let val = player.data.STA
			
			let initainer = scene.add.sprite(x, y, 'headshots', 19)
			initainer.alpha = 0 
			let initiative = scene.add.sprite(x, y, 'headshots', 12+val)
			initiative.setInteractive({
				useHandCursor: true,
				draggable: true,
				//dropZone: true
			})
			
			initiative.on('drag', (pointer, dragX, dragY)=>{
				initiative.x = dragX
				initiative.y = dragY 
				initainer.alpha = 1
				initiative.depth = 1 
			})
			
			initiative.on('dragend', (pointer, dragX, dragY)=>{
				this.drop(initiative.parent)
			})
			
			initiative.parent = {
				x0: x,
				y0: y,
				val: val,
				sprite: initiative,
				initainer: initainer,
				player: player,
				on_drag: function(){
					console.log('drag')
				}
			}
			
			this.objs.push(initiative.parent)
			
			//this.refresh()
			
			return initiative.parent 
		},
		refresh: function(){
			this.objs.forEach(o => {
				o.sprite.setFrame(12 + this.val)
			})
		}
	}
	
	function make_player(name, scene){
		//let data = state.copy(state.search(state.data.characters, c => c.NAME === name))
		let data = state.search(state.data.characters, c => c.NAME === name)
		
		let player = {
			name: name,
			data: data,
		}
		
		// Cards
		
		let deck = []
		let cards = state.search(state.data.decks, d => d.NAME === name)
		if(!cards){
			throw "Can't find deck for " + name 
		}
		for(let i = 1; i <= MAX_CARDS; i++){
			if(cards['C'+i]){
				deck.push(cards['C'+i])
			}
		}
		
		// Dice and Iniative 
		
		let index = ['Henry', 'Darryl', 'Glenn', 'Ron'].indexOf(name)
		let dx = WIDTH/5
		let cx = -WIDTH/2
		let y = -0.65*HEIGHT
		let x = (index-1.5)*dx + cx 
		let dy = 60*ZOOM
		let w = dx/2
		let s = 5*ZOOM 
		
		let bg = scene.add.graphics()
		bg.beginPath()
		bg.fillStyle([BLUE, RED, ORANGE, BROWN][index], 1)
		bg.lineStyle(2*ZOOM, 0, 1)
		bg.moveTo(x - w, y - dy + s)
		bg.lineTo(x - w, y + dy + s)
		bg.lineTo(x + w, y + dy + s)
		bg.lineTo(x + w, y - dy + s)
		bg.lineTo(x - w, y - dy + s)
		bg.stroke()
		bg.fill()
		bg.depth = -1 
		
		let pic = scene.add.sprite(x, y, 'headshots', 4 + index)
				
		let initiative = init_manager.make(scene, player, x, y - 35*ZOOM)
		let die = dice_manager.make(player, x, y + 40*ZOOM)
		player.deck = deck.map(x => state.make.card(x, player, scene))
		
		return player 
	}
	
	function make_tab(scene, player, i, y0){
		const w = 48 
		let tab = state.make.button(scene, (i+.5)*w*ZOOM, y0 + 12*ZOOM, 25 + 5*i, ()=>{
			scene.bg.set(i)
			player.deck.forEach((c, j) => {
				let loc = scene.cardtainers[j]
				if(loc.card){
					loc.card.hide()
				}
				if(c.status === 'hidden'){
					c.unhide()
				}else{
					c.draw(loc)
				}
			})
		})
		
		return tab 
	}

	window.menu = {
		
		create: function(){
			this.bg = make_bg(this)
			//this.bg.set(0)
			init_manager.init(this)
			dice_manager.init(this)
			
			this.cardtainers = []
			const n = MAX_CARDS/2
			for(let i = 0; i < 2*n; i++){
				
				const w = 64*ZOOM
				const h = 90*ZOOM
				const dw = WIDTH/n
				const m = (dw - w)/2
				let j = i % 2 ? n+(i-1)/2 : i/2 
				let x = (j%n)*dw + w/2 + m
				let y = HEIGHT - Math.floor(j/n)*(h+m) - h/2 - m/2
				
				this.cardtainers.push(state.make.cardtainer(this, x, y))
			}
			
			let players = state.players.map(x => make_player(x, this))
			this.active = 0
			
			
			this.tabs = []
			players.forEach((p, i) => {
				
				this.tabs.push(make_tab(this, p, i, 0))
				this.tabs.push(make_tab(this, p, i, -HEIGHT))
				
			})
			this.players = players 
			
			this.tabs[0].on_up()
			
			state.make.button(
				this, 
				WIDTH - 48*ZOOM, 
				12*ZOOM, 
				45, 
				move_cam(this, 0, -HEIGHT)
			)
		
			state.make.button( // Deck 
				this, 
				49*ZOOM, 
				180*ZOOM - HEIGHT, 
				50, 
				move_cam(this, 0, 0)
			)
			
			state.make.button( // Back
				this,
				-20*ZOOM,
				10*ZOOM - HEIGHT,
				55,
				move_cam(this, 0, -HEIGHT)
			)
			
			
			this.cameras.main.scrollY = -HEIGHT
			//this.cameras.main.scrollX = -WIDTH
			//this.cameras.main.zoom = .5 
			
			
			state.init_interactives(this)
			
		}
	}

})()