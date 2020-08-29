//*

let play = (function(){
	const TW = 16
	const random = new Phaser.Math.RandomDataGenerator([(Date.now() * Math.random()).toString()])
	let guys  
	let scene
	
	const modes = [
		'',
		'none',
		'bomb',
		'bullet',
		'dash',
		'laser',
		'shield',
		'flame',
		'nuke',
		
		'gem',
		'?'
	]
	
	const tints = {
		// https://coolors.co/cfc6b8-f4b41b-ed7e25-e6482e-bf7958-38d973-3cacd7-472d3c-7a444a-777da7
		white: 0xcfc6b8,
		brown: 0xbf7958,
		green: 0x38d973,
		blue:  0x3cacd7,
		red:   0xe6482e,
		black: 0x472d3c,
		purple:0x7a444a,
		yellow:0xf4b41b,
		
		pink:  0xF08E7F,
		violet:0x777da7,
		orange:0xED7E25,
		dash:  0xf4b41b // yellow 
	}

	const key = (function(){
		
		let key = {
			apple: 897,
			pear: 898,
			player: 25,
			block: 867,
			tc: 115,
			bc: 19,
			cr: 68,
			cl: 66,
			tl: 162,
			tr: 163,
			bl: 210,
			br: 211,
			bomb: 477,
			explosion: 606,
			heart: 519,
			destructable: 624,
			bullet: 1035,
			cardHolder: 787,
			sad: 710,
			boom: 555,
			rubble: 2,
			fallout: 1,
			gem: 215,
			laser: 252,
			door: 759,
			locked: 528,
			stairs: 291,
			key: 560,
			cardBack: 759,
			scorpian: 264,
			spider: 270,
			rook: 1003,
			bishop: 1004,
			queen: 1005,
			king: 1006,
			knight: 1007,
			dash: 557,
			shield: 563,
			nuke: 1048,
			flame: 495,
			
			'?': 661,
			'!': 659,
			' ': 0,
			'$': 803
			
		}
		
		guys = 0
		for(let i = 24; i < 32; i++){
			for(let j = 0; j < 224; j += 48){
				
				key['guy' + guys] = i + j 
				guys += 1 
			}
		}

		for(let i = 1; i <= 13; i++){
			let suits = ['H', 'D', 'C', 'S']
			suits.forEach((s, j)=>{
				let v = i 
				if(v === 1){
					v = 'A'
				}else if(v === 11){
					v = 'J'
				}else if (v === 12){
					v = 'Q'
				}else if (v === 13){
					v = 'K'
				}
				key[v + s] = 787 + i + 48*j 
			})
		}
		
		for(let i = 0; i < 26; i++){
			let chr = String.fromCharCode(65 + i)
			let frame 
			if(i < 13){
				frame = 899 + i 
			}else{
				frame = 947 + i - 13 
			}
			key[chr] = frame 
		}
		
		for(let i = 0; i < 10; i++){
			key[''+i] = 851 + i
		}
		
		
		return key 
	})()
	
	const helpers = {
		diagonals: [
			{x: -1, y: -1},
			{x:  1, y: -1},
			{x: -1, y:  1},
			{x:  1, y:  1}
		],
		orthogonals: [
			{x:  0, y: -1},
			{x:  0, y:  1},
			{x: -1, y:  0},
			{x:  1, y:  0}
		],
		knight: [
			{x: -2, y: -1},
			{x: -2, y:  1},
			{x:  2, y: -1},
			{x:  2, y:  1},
			
			{x: -1, y: -2},
			{x: -1, y:  2},
			{x:  1, y: -2},
			{x:  1, y:  2}
			
		],
		isLegit: function(vec){
			let x = vec.x
			let y = vec.y 
			
			return x >= TW && x <= TW*TW &&  y >= TW && y <= TW*TW 
		},
		chooseSquare: function(start, dirs, limit){
			let x = TW*Math.round(start.x/TW)
			let y = TW*Math.round(start.y/TW)
			
			let squares = []
			dirs.forEach(d => {
				let sq = {x: x + d.x*TW, y: y + d.y*TW}
				let i = 0 
				while(i < limit && this.isLegit(sq)){
					i += 1
					squares.push(sq)
					sq = {x: sq.x + d.x*TW, y: sq.y + d.y*TW} 
				}
			})
			
			if(squares.length > 0){
				
				return random.pick(squares)
			}else{
				return {x: x, y: y}
			}
		},
		makeChess: function(dirs, limit, knight){
			return {
				init: function(player){
					this.chargeTime = 300
					this.timer = -random.between(0, this.chargeTime)
					this.v = 100
					this.x0 = this.x 
					this.y0 = this.y 
				},
				move: function(dt){
					this.timer += 1 
					let t = Math.max(0, this.timer)
					if(t < this.chargeTime){
						let wobble = Math.floor(3*t/this.chargeTime)
						this.x = this.x0 + random.between(-wobble, wobble)
						this.y = this.y0 + random.between(-wobble, wobble)
					}else{
						this.x = this.x0 
						this.y = this.y0 
						this.timer = -Infinity
						let to = helpers.chooseSquare(this, dirs, limit)
						let dist = Phaser.Math.Distance.Between(this.x, this.y, to.x, to.y)
						this.body.setEnable(!knight)
						scene.tweens.add({
							targets: this, 
							x: to.x,
							y: to.y,
							duration: dist*this.v/TW,
							ease: 'Expo.easeOut',
							onComplete: ()=>{
								this.timer = 0 
								this.x0 = this.x 
								this.y0 = this.y 
								if(this.body){
									this.body.setEnable(true)
								}
							}
						})
					}
					
				},
				hitDestructable: function(block){
					block.explode()
					return true 
				}
			}
		}
	}
	
	const baddies = {
		create: function(empties, player){
			let diff = player.difficulty 
			
			let lineUp = this.levels(diff)
			
			this.list = []
			
			lineUp.forEach(name => {
				let baddie = this.basic(empties.shift(), name)
				let data = this.roster[name]
				for(let k in data){
					if(data.hasOwnProperty(k)){
						baddie[k] = data[k]
					}
				}
				baddie.init(player)
				
				this.list.push(baddie)
			})
			
			
			return this.list 
		}, 
		levels: function(diff){
			let lvls = [
				[],
				[], 
				['scorpian'],
				['spider'], 
				 
				['scorpian', 'spider'],
				['rook'],
				['rook', 'bishop'],
				['queen'],
				['rook', 'knight'],
				['knight', 'knight', 'knight'],
				['king', 'king', 'king', 'king', 'king'],
				['bishop', 'rook', 'knight', 'queen', 'king'],
				
			]
			if(typeof(diff) === "string"){
				return [diff]
			}else if(diff < lvls.length){
				return lvls[diff]
			}else if(diff < 2*lvls.length){
				return lvls[lvls.length-1].concat(lvls[diff - lvls.length])
			}else{
				return lvls[lvls.length-1].concat(lvls[lvls.length-1])
			}
		},
		basic: function(tile, key){
			let s = sprite(tile.pixelX, tile.pixelY, key, 'red')
			s.health = 1 
			s.hitPlayer = function(player){
				if(player.dashTime > 0 || player.flaming){
					this.hitProjectile()
				}else{
					player.hurt()
				}
				
			}
			s.hitWall = (wall)=>{return true}
			s.hitDestructable = (block)=>{return true}
			s.hitProjectile = function(proj){
				this.hurt()
			}
			s.hurt = function(){
				this.health -= 1 
				if(this.health <= 0){
					this.die()
				}
			}
			s.die = function(){
				boom({pixelX: this.x, pixelY: this.y})
				this.destroy()
			}
			s.init = function(){}
			s.preUpdate = function(dt){
				
				if(this.move){
					this.move(dt)
				}
			}
			
			s.body.setCircle(6, true)
			s.body.setOffset(2, 2)
		
			return s 
		},
		roster: {
			bishop: helpers.makeChess(helpers.diagonals, 8),
			rook: helpers.makeChess(helpers.orthogonals, 8),
			queen: helpers.makeChess(helpers.diagonals.concat(helpers.orthogonals), 8),
			king: helpers.makeChess(helpers.diagonals.concat(helpers.orthogonals), 1),
			knight: helpers.makeChess(helpers.knight, 1, true),
			spider: {
				init: function(player){
					this.player = player 
					this.v = 30
				},
				move: function(){
					if(this.player.body){
						let vel = this.body.position.clone()
						vel.subtract(this.player.body.position)
						vel.normalize()
						vel.scale(-this.v)
						
						this.body.velocity = vel 
					}
				}
			},
			scorpian: {
				init: function(){
					this.v = 30
					this.dir = random.between(0, 3)
					let dx = [-1, 0, 1, 0][this.dir]
					let dy = [0, -1, 0, 1][this.dir]
					this.body.setVelocity(dx*this.v, dy*this.v)
				},
				move: function(dt){
					let len = this.body.velocity.length()
					if(len < 10){
						this.dir = random.between(0, 3)
						let dx = [-1, 0, 1, 0][this.dir]
						let dy = [0, -1, 0, 1][this.dir]
						this.body.setVelocity(dx*this.v, dy*this.v)
					}else if(Math.abs(len - this.v) > 0.1){
						let dx = [-1, 0, 1, 0][this.dir]
						let dy = [0, -1, 0, 1][this.dir]
						this.body.setVelocity(dx*this.v, dy*this.v)
					}
				}
			}
		}
	}

	function text(x, y, string, tint, centered){
		let tw = 10 
		
		let obj = {
			clear: function(){
				if(this.chrs){
					this.chrs.forEach(c => {
						c.destroy()
					})
				}
				this.chrs = []
			},
			destroy: function(){
				this.clear()
				
			},
			text: function(string, tint, centered){
				this.write(this.x, this.y, string, tint || this.tint, centered || this.centered)
			},
			
			setTint: function(tint){
				this.write(this.x, this.y, this.string, tint, this.centered)
			},
			write: function(x, y, string, tint, centered){
				
				if(tint === undefined){
					tint = tints.white
				}else if(typeof(tint) === 'string'){
					tint = tints[tint]
				}
				
				if(!centered){
					centered = {
						vertical: 0,
						horizantal: 0 
					}
				}else if(centered === true){
					centered = {
						vertical: 0.5,
						horizantal: 0.5 
					}
				}else if(centered === 'right'){
					centered = {
						vertical: 0,
						horizantal: 1
					}
				}
				
				string = string.toUpperCase()
				
				this.clear()
				
				this.x = x 
				this.y = y 
				this.string = string 
				this.tint = tint
				this.centered = centered 
				
				let w = tw*string.length
				let dx = -w*centered.horizantal
				let dy = -TW*centered.vertical 
			
				this.chrs = []
				for(let i = 0; i < string.length; i++){
					let chr = string[i]
					if(key[chr] === undefined){
						chr = 'sad'
					}
					
					let s = scene.add.sprite(x + tw*i + dx, y + dy, 'main', key[chr])
					s.tint = tint
					
					s.setOrigin(0, 0)
					
					this.chrs.push(s)
				}
			}
		}
	
		obj.write(x, y, string, tint, centered)	
		
		return obj 
	}

	let deck = {
		shuffle: function(){
			this._cards = []
			for(let i = 1; i <= 13; i++){
				let suits = ['H', 'D', 'C', 'S']
				suits.forEach((s, j)=>{
					let v = i 
					if(v === 1){
						v = 'A'
					}else if(v === 11){
						v = 'J'
					}else if (v === 12){
						v = 'Q'
					}else if (v === 13){
						v = 'K'
					}
					this._cards.push(v + s)
				})
			}
			random.shuffle(this._cards)
		},
		draw: function(val){
			
			if(val === undefined){
				return this._cards.shift()
			}else{
				this._cards = this._cards.filter(x => x !== val)
				return val 
			}
		},
		generated: {
			
		},
		three: function(x){
			return this._abstractHand(x, 'three', ()=>{
				let p1, p2, p3 
				while(!(p1 && p2 && p3)){
					p1 = random.pick(this._cards)
					p2 = this._cards.find(c => c !== p1 && this.value(c) == this.value(p1))
					p3 = this._cards.find(c => c !== p1 && c !== p2 && this.value(c) == this.value(p1))
				}
				
				return [p1, p2, p3]
			})
		},
		pair: function(x){
			return this._abstractHand(x, 'pair', ()=>{
				let p1, p2 
				
				while(!p1 || !p2){
					p1 = random.pick(this._cards)
					p2 = this._cards.find(c => c !== p1 && this.value(c) == this.value(p1))
				}
				
				return [p1, p2]
			})
		},
		_abstractHand: function(x, name, genFunc){
			if(!this.generated[name]){
				this.generated[name] = genFunc().map(p => (x => this.create(x, p)))
			}
			let rv = this.generated[name].pop()
			if(this.generated[name].length === 0){
				this.generated[name] = undefined
			}
			return rv(x)
		},
		create: function(tile, val){
			c = this.draw(val)
		
			
			let suit = c[c.length - 1]
			let color
			if(suit == 'H' || suit == 'D'){
				color = 'pink'
			}else if(suit == 'S' || suit == 'C'){
				color = 'blue'
			}else{
				color = 'white'
			}
			
			let s = sprite(tile.pixelX, tile.pixelY, c, color)

			s.cardValue = c  
			return s 
		},
		value: function(c){
			return c.slice(0, c.length - 1)
		},
		suit: function(c){
			return c.slice(c.length - 1)
		},
		handName: function(evaluation){
			return ([
				'', 
				'',
				'Pair', 
				'Two Pair', 
				'3 of a Kind', 
				'Straight',
				'Flush',
				'Full House',
				'4 of a Kind',
				'Straight Flush',
				'Royal Flush'
			])[evaluation]
		},
		evaluate: function(hand){
			let vals = {}
			let suits = {}
			hand.forEach(c => {
				let v = this.value(c)
				let s = this.suit(c)
				if(vals[v]){
					vals[v] += 1
				}else{
					vals[v] = 1
				}
				if(suits[s]){
					suits[s] += 1
				}else{
					suits[s] = 1
				}
			})
			let pairs = 0
			let threes = 0
			let fours = 0
			let flush = false
			let straight = 0 
			let royal = false 
			let ordered = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
			
			
			
			for(v in vals){
				if(vals.hasOwnProperty(v)){
					if(vals[v] === 2){
						pairs += 1
					}else if(vals[v] === 3){
						threes += 1
					}else if(vals[v] === 4){
						fours += 1 
					}
				}
				
			}
			
			for(let i = 0; i < ordered.length - hand.length; i++){
				let s = true
				for(let j = 0; j < hand.length; j++){
					if(!vals[ordered[i+j]]){
						s = false 
						break 
					}
				}
				if(s){
					straight = true 
					break 
				}
			}
				
			for(s in suits){
				if(suits.hasOwnProperty(s)){
					if(suits[s] === hand.length){
						flush = true 
					}
				}
			}
			
			
			
			royal = vals[10] && vals.J && vals.Q && vals.K && vals.A
			
			if(flush){
				if(royal){
					return 10
				}else if(straight){
					return 9
				}else if(!fours && !(threes && pairs)){
					return 6
				}
			}else if(fours){
				return 8
			}else if(threes && pairs){
				return 7
			}else if(straight || royal){
				return 5 
			}else if(threes){
				return 4 
			}else if(pairs === 2){
				return 3 
			}else if(pairs === 1){
				return 2 
			}else{
				return 1 
			}
		}
	}
	
	const storeInventory = {
		inventories: [
			[
				50,
				x => deck.three(x),
				x => deck.three(x),
				x => deck.three(x)
			],
			[
				20, 
				x => deck.pair(x), 
				x => deck.pair(x)
			],
			[
				15,
				createKey 
			],
		],
		get: function(door){
			let inv = random.pick(this.inventories)
			let placement = ([
				[4, 0],
				[4,-1, 4, 1],
				[4, 0, 4,-1, 4, 1],
				[4,-1, 4, 1, 3,-1, 3, 1],
				[4,-1, 4, 1, 3,-1, 3, 1, 4, 0],
				[4,-1, 4, 1, 3,-1, 3, 1, 4, 0, 3, 0],
			])[inv.length - 2] 
			let dir = door.left ? -1 : 1 
			
			door.value = inv[0]
			let collectables = []
			inv.slice(1).forEach((f, i) => {
				collectables.push(f({
					pixelX: door.tile.pixelX + dir*placement[2*i]*TW,
					pixelY: door.tile.pixelY + placement[2*i+1]*TW
				}))
			})
			return collectables 
		}
	}
	
	function sprite(x, y, id, tint){
		if(tint === undefined){
			tint = 'white'
		}
		let s = scene.physics.add.sprite(x, y, 'main', key[id])
		s.tint = tints[tint]
		
		s.setOrigin(0, 0)
		return s 
	}
	
	function createPlayer(tile, data){
		let player = sprite(tile.pixelX, tile.pixelY, 'guy' + random.between(0, guys - 1))
		player.setBounce(0.1);
		player.setCollideWorldBounds(true)
		player.body.setCircle(6, true)
		player.body.setOffset(2, 2)
		
		player.difficulty = data.difficulty || 0 
		player.storeOdds = data.storeOdds || 0 
		player.fireMode = 'gem'
		player.player = true 
		player.fr = 0.9
		player.speed = 2500
		player.dashTime = 0
		player.dashMax = 15
		player.dashSpeed = 700
		player.shootRate = 45
		player.shootTime = 0 
		player.shootAngle = 0 
		player.shootSpeed = 300
		player.hand = []
		player.cardHolders = []
		player.handText = text((18 + (30-18)/2)*TW, 4*TW, '', 'yellow', true)
		player.bombTime = 0,
		player.bombMax = 90
		player.laserTime = 0
		player.laserMax = 15
		player.flaming = false 
		
		player.coinHolder = sprite(TW, 18*TW, 'gem', 'green')
		player.coinHolder.setScale(2.0)
		player.coinCount = data.coinCount || 0  
		player.coinText = text(
			player.coinHolder.x + 2*TW, 
			player.coinHolder.y + 1*TW,
			'xxx',
			'green',
			{vertical: 0.5, horizantal: 0}
		)
		
		player.keyHolder = sprite(7*TW, 18*TW, 'key', 'yellow')
		player.keyHolder.setScale(2.0)
		player.keyCount = data.keyCount || 0  
		player.keyText = text(
			player.keyHolder.x + 2*TW, 
			player.keyHolder.y + 1*TW,
			'xxx',
			'yellow',
			{vertical: 0.5, horizantal: 0}
		)

		
		player.modeText = {}
		for(let i = 2; i < modes.length; i++){
			let x0 = 20*TW 
			player.modeText['h' + i] = text(x0, (1+1.5*i)*TW, deck.handName(i), 'purple')
			//player.modeText['m' + i] = text(x0, (0+2.5*i)*TW, ' ' + modes[i], 'purple')
			player.modeText['m' + i] = scene.add.sprite(x0 - 1.5*TW, (1+1.5*i)*TW, 'main', key[modes[i]])
			player.modeText['m' + i].setOrigin(0)
			player.modeText['m' + i].tint = tints.purple
		}
		
		
		for(let i = 0; i < 5; i++){
			let ch = sprite((19+2*i)*TW, 1*TW, 'cardHolder', 'purple')
			//ch.setOrigin(0.5)
			ch.setScale(2.0)
			player.cardHolders.push(ch)
		}
		
		player.hurt = function(){
			this.kill()
		}
		
		player.kill = function(){
			boom({pixelX: this.x, pixelY: this.y})
			
			this.destroy()
			
		}
		
		player.flameOn = function(){
			this.flaming = this.fireMode === 'flame'
		}
		
		player.changeMode = function(key){
			this.flaming = false 
			if(key > 1 && key < modes.length){
				if(modes[key] === 'flame'){
					this.fireMode = 'none'
					this.flaming = true 
				}else{
					this.fireMode = modes[key]
				}
			}else if(key === 1){
				this.fireMode = 'none'
			}
			for(let k in this.modeText){
				if(this.modeText.hasOwnProperty(k)){
					this.modeText[k].setTint(tints.purple)
				}
			}
			if(this.modeText['h'+key] && this.modeText['m'+key]){
				this.modeText['h'+key].setTint(tints.white)
				this.modeText['m'+key].setTint(tints.yellow)
			}
		}
		
		player.updateText = function(){
			let text = '' + this.coinCount 
			let pad = ''
			while(text.length < 3){
				text = '0' + text 
			}
			this.coinText.text(text)
			
			this.keyText.text(''+this.keyCount)
		}
		
		player.collectThing = function(thing, count, holder){
			this[count] += 1 
			this.updateText()
			
			scene.tweens.add({
				targets: thing, 
				x: this[holder].x,
				y: this[holder].y,
				ease: 'Bounce',
				duration: 300,
				scale: 2.0,
				onComplete: ()=>{
					thing.destroy()
				}
			})
		}
		
		player.collectKey = function(key){
			this.collectThing(key, 'keyCount', 'keyHolder')
		}
		
		player.collectCoin = function(coin){
			this.collectThing(coin, 'coinCount', 'coinHolder')
		}
		
		player.prepopulateHand = function(old){
			if(!old) return 
			
			old.forEach((val, i) => {
				let card = deck.create({}, val) 
				let holder = this.cardHolders[i]
				
				card.setScale(2)
				card.x = holder.x 
				card.y = holder.y 
				holder.alpha = 0 
				
				card.body.setEnable(false)
				
				this.hand.push(card)
			})
			
			this.evaluateHand()
		}
		
		player.evaluateHand = function(){
			if(this.hand.length === this.cardHolders.length){
				let evaluation = deck.evaluate(this.hand.map(c => c.cardValue))
				//this.handText.text(deck.handName(evaluation))
				this.changeMode(evaluation)
			}
		}
		
		player.collect = function(card){
			if(card.collected) return 
			card.collected = true 
			
			if(card.isCoin){
				return this.collectCoin(card)
			}else if(card.isKey){
				return this.collectKey(card)
			}
			
			card.body.setEnable(false)
			
			
			this.hand.unshift(card)
			while(this.hand.length > this.cardHolders.length){
				this.discard()
			}
			
			this.hand.forEach((c,i) => {
				scene.tweens.add({
					targets: c,
					x: this.cardHolders[i].x,
					y: this.cardHolders[i].y,
					ease: 'Bounce',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
					duration: 300,
					scale: 2.0,
					onComplete: ()=>{
						this.cardHolders[i].alpha = 0 
					}
					
				});

			})
			
			this.evaluateHand()
			
		}
		
		player.discard = function(){
			let c = this.hand.pop()
			scene.tweens.add({
				targets: c,
				alpha: 0,
				ease: 'Linear',
				duration: 900,
				onComplete: ()=>{
					c.destroy()
				}
			})
			c.body.setEnable(true)
			c.body.setGravityY(900) 
			c.body.setVelocity(300, -300)
		}
	
		player.aim = function(vec){
			if(this.fireMode !== 'dash' || this.dashTime <= 0){
				this.shootAngle = this.roundAngle(vec.angle())
			}
		}
		
		player.fire = function(){
			if(this.fireMode == 'dash'){
				this.dash()
			}else if(this.fireMode == 'shoot' || this.fireMode == 'bullet'){
				this.shoot()
			}else if(this.fireMode === 'bomb'){
				this.bomb()
			}else if(this.fireMode === 'none'){
				
			}else if(this.fireMode === 'laser'){
				this.laser()
			}else if(this.fireMode === 'shield'){
				this.shield()
			}else if(this.fireMode === 'nuke'){
				this.nuke()
			}else if(this.fireMode === 'flame'){
			
			}else if(this.fireMode === 'gem'){
				this.gem()
			}else{
				console.warn('Unknown fireMode: ' + this.fireMode)
			}
				
		}
		
		player.heart = function(){
			
		}
		
		player.laser = function(){
			if(this.laserTime > 0){
				return 
			}
			this.laserTime = this.laserMax
			
			let tol = 0.1 
			let h = Math.cos(this.shootAngle)
			let v = Math.sin(this.shootAngle)
			let dx = 0 
			let dy = 0 
			if(Math.abs(h) > tol){
				dx = h > 0 ? 1 : -1
			}else{
				dy = v > 0 ? 1 : -1
			}
			
			fireLaser({x:this.x + TW/2, y:this.y + TW/2}, dx, dy)
		}
		
		player.bomb = function(){
			if(this.bombTime > 0){
				return 
			}
			this.bombTime = this.bombMax
			
			let s = sprite(this.x, this.y, 'bomb', 'dash')
			s.body.setImmovable()
			s.countdown = this.bombMax
			s.preUpdate = function(){
				this.countdown -= 1 
				/*
				if(this.countdown % 10 === 0 ){
					this.yellow = !this.yellow 
				}
				this.tint = this.yellow ? tints.yellow : tints.red 
				*/
				this.tint = tints.flicker 
				
				if(this.countdown <= 0){
					createExplosion({pixelX: this.x, pixelY: this.y})
					this.destroy()
				}
			}
			
		
			
		}
		
		player.gem = function(){
			if(this.gemTime > 0) return 
			this.gemTime = this.gemMax 
			let s = scene.add.sprite(this.x, this.y, 'main', key.gem)
			s.tint = tints.green 
			s.setOrigin(0)
			
			this.collectCoin(s)
		}
		
		player.nuke = function(){
			let nukes = []
			for(let i = 0; i < TW; i++){
				let s = fireNuke(TW*(i+1), TW*1)
			}
			return nukes 
		}
		
		player.shield = function(){
			let count = 8
			
			let f = (s, theta) => {
				return {
					targets: s,
					x: s.x + r*Math.cos(theta),
					y: s.y + r*Math.sin(theta),
					duration: 300,
					ease: 'Expo.easeOut',
					onComplete: ()=>{
						s.destroy()
						boom({pixelX: s.x, pixelY: s.y})
					}
				}
			}
			if(this.shieldTime > 0) return 
			this.shieldTime = this.shieldMax
			let shields = []
			
			let r = 2*TW 
			
			for(let i = 0; i < count; i++){
	
				let s = sprite(this.x, this.y, 'shield', 'dash')
				scene.tweens.add(f(s, i*2*Math.PI/count))
				registerCollidable(s)
				shields.push(s)
			}
			
			console.log(shields.length)
			
			return shields 
		}
		
		player.shoot = function(){
			if(this.shootTime > 0) return 
			this.shootTime = this.shootRate
			let s = sprite(this.x, this.y, 'bullet', 'dash')
			s.body.setVelocity(
				this.shootSpeed*Math.cos(this.shootAngle),
				this.shootSpeed*Math.sin(this.shootAngle)
			)
			s.body.setCircle(4, true)
			s.body.setOffset(4, 4)
			
			s.explode = function(){
				this.destroy()
			}
			
			registerCollidable(s)
			
			return s 
		}
	
		player.move = {
			left: false,
			right: false,
			up: false,
			down: false
		}
		
		player.down = function(x, y){
			if(x < 0){
				this.move.left = true 
			}
			if(x > 0){
				this.move.right = true 
			}
			if(y > 0){
				this.move.down = true 
			}
			if(y < 0){
				this.move.up = true
			}
		}
		
		player.up = function(x, y){
			if(x < 0){
				this.move.left = false 
			}
			if(x > 0){
				this.move.right = false 
			}
			if(y > 0){
				this.move.down = false 
			}
			if(y < 0){
				this.move.up = false
			}
		}
		
		player.dash = function(){
			if(this.dashTime <= 0){
				this.dashTime = this.dashMax
			}
		}
		
		player.roundAngle = function(theta){
			return Math.PI*Math.floor(4*theta/Math.PI)/4
		}
		
		player.goDownStairs = function(stairs){
			this.disableMovement = true 
			this.disableBody()
			
			let shape = scene.make.graphics();
			shape.fillRect(stairs.x - 3, stairs.y - 3, TW, TW)
			let mask = shape.createGeometryMask();
			
			let keySprite = scene.add.sprite(this.keyHolder.x, this.keyHolder.y, 'main', key.key)
			keySprite.tint = tints.yellow 
			keySprite.setScale(2)
			
			stairs.shaking = true 
			
			scene.tweens.add({
				targets: keySprite,
				x: stairs.x + TW/2,
				y: stairs.y + TW/2,
				scale: 1,
				duration: 300,
				ease: 'Linear',
				onComplete: ()=>{
					keySprite.destroy()
					stairs.tint = tints.purple
					stairs.setFrame(key.stairs)
					stairs.shaking = false 
					scene.tweens.add({
						targets: this,
						x: stairs.x - 2,
						y: stairs.y - 2,
						delay: 150,
						duration: 150,
						ease: 'Linear',
						onComplete: ()=>{
							this.setMask(mask)
							scene.tweens.add({
								targets: this,
								delay: 300,
								x: stairs.x + TW,
								y: stairs.y + TW,
								duration: 600,
								ease: 'Linear',
								onComplete: ()=> {
									nextLevel(this)
								}
							})
						}
					})
				}
			})
				
			
		}
		
		player.preUpdate = function(dt){
			if(this.disableMovement) return 
			//console.log(this.move.left, this.move.right, this.move.up, this.move.down)
			this.body.setAcceleration(0, 0)
			this.body.velocity.scale(this.fr)
			
			if(this.move.left && this.move.right){
				
			}else if(this.move.left){
				this.body.acceleration.x = -1
			}else if(this.move.right){
				this.body.acceleration.x = 1 
			}else{
				
			}
			
			if(this.move.up && this.move.down){
				
			}else if(this.move.up){
				this.body.acceleration.y = -1
			}else if(this.move.down){
				this.body.acceleration.y = 1 
			}else{
				
			}
			
			this.body.acceleration.normalize()
			if(this.body.acceleration.length() > 0.5){
				this.aim(this.body.acceleration)
			}
			
			if(this.dashTime > 0){
				this.tint = tints.dash 
				this.dashTime -= 1
				
				this.body.velocity.set(
					this.dashSpeed*Math.cos(this.shootAngle),
					this.dashSpeed*Math.sin(this.shootAngle)
				)
			}else{
				this.body.acceleration.scale(this.speed)
				this.tint = this.flaming ? tints.flicker : tints.white
			}
			
			if(this.shootTime > 0){
				this.shootTime -= 1 
			}
			if(this.bombTime > 0){
				this.bombTime -= 1 
			}
			if(this.laserTime > 0){
				this.laserTime -= 1 
			}
			
		}
		
		player.updateText()
		player.prepopulateHand(data.hand)
		player.flameOn()
		
		return player 
	}
	
	function createWall(tile, key){
		let s = sprite(tile.pixelX, tile.pixelY, key)
		s.body.setImmovable()
		
		return s 
	}
	
	function boom(tile){
		let s = scene.add.sprite(tile.pixelX, tile.pixelY, 'main', key.boom)
		s.tint = tints.yellow
		s.setOrigin(0)
		scene.tweens.add({
			targets: s,
			alpha: 1,
			duration: 100,
			onComplete: ()=>{
				s.setFrame(key.rubble)
				s.tint = tints.purple 
				s.depth = -1 
			}
		})
	}
	
	function createExplosion(tile){
		let s = sprite(tile.pixelX, tile.pixelY, 'boom', 'yellow')
		s.setOrigin(0.25)
		s.setScale(3)
		registerCollidable(s)
		
		scene.time.delayedCall(100, ()=>{
			s.setFrame(key.rubble)
			s.tint = tints.purple 
			s.depth = -1 
			s.body.destroy()
		}); 
		
		return s 
	}
	
	function createBlock(tile){
		let s = sprite(tile.pixelX, tile.pixelY, 'block')
		s.body.setImmovable()
		s.explode = function(){
			this.destroy()
		}
		
		s.preUpdate = function(){
			if(this.sliding){
				this.tint = 0xff0000 
				if(this.body.velocity.length() < 0.1){
					this.sliding = false 
				}
			}else{
				this.tint = 0xffffff
				//this.body.setImmovable()
			}
		}
		
		return s 
	}
	
	function createDestructable(tile){
		
		let s = sprite(tile.pixelX, tile.pixelY, 'destructable', 'brown')
		s.health = 30 
		s.x0 = s.x 
		s.y0 = s.y 
		s.body.setImmovable()
		s.explode = function(){
			this.destroy()
			boom(tile)
		}
		s.hurt = function(){
			
			this.health -= 1
			if(this.health <= 0){
				this.explode()
			}
			
			this.x += random.between(-1, 1)
			this.y += random.between(-1, 1)
			scene.tweens.add({
				targets: this,
				x: this.x0,
				y: this.y0,
				duration: 30,
				ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
			})
			
		}
		return s 
	}
	
	function createCoin(tile){
		let s = sprite(tile.pixelX, tile.pixelY, 'gem', 'green')
		s.isCoin = true 
		return s 
	}
	
	function createDoor(tile, left){
		let tx, ta 
		if(left){
			tx = tile.pixelX - TW/2 
			ta = 'right'
		}else{
			tx = tile.pixelX + 1.5*TW 
		}
		
		let door = {
			value: 30,
			left: left,
			tile: tile,
			doors: [
				sprite(tile.pixelX, tile.pixelY, 'door', 'green'),
				sprite(tile.pixelX, tile.pixelY - TW, 'door', 'green'),
				sprite(tile.pixelX, tile.pixelY + TW, 'door', 'green')
			],
			text: text(tx, tile.pixelY, 'Text', 'green', ta),
			spend: function(player){
				if(player.coinCount - this.value < 0) return 
				
				player.coinCount -= 1
				this.value -= 1 
				this.updateText()
				player.updateText()
				
				if(this.value <= 0){
					this.doors.forEach(d => {
						d.destroy()
					})
					this.text.destroy()
				}
			},
			updateText: function(){
				this.text.text(''+this.value)
			}
		}
		
		door.doors.forEach(d => {
			d.setImmovable(true)
			d.spend = (x)=>{door.spend(x)}
		})
		
		door.collectables = storeInventory.get(door)
		door.updateText()
		
		return door 
	}
	
	function createHatch(tile){
		let s = sprite(tile.pixelX, tile.pixelY, 'locked', 'yellow')
		s.body.setImmovable(true)
		s.depth = -0.5 
		s.locked = true 
		s.x0 = s.x
		s.y0 = s.y
		s.unlock = function(player){
			if(this.locked && player.keyCount > 0){
				this.locked = false 
				player.keyCount -= 1 
				player.updateText()
				this.disableBody()
				player.goDownStairs(this)
			}
		}
		
		s.preUpdate = function(){
			if(this.shaking){
				let amnt = 1 
				this.x = this.x0 + random.between(-amnt, amnt)
				this.y = this.y0 + random.between(-amnt, amnt)
			}else{
				this.x = this.x0 
				this.y = this.y0 
			}
		}
		
		return s 
	}
	
	function createKey(tile){
		let s = sprite(tile.pixelX, tile.pixelY, 'key', 'yellow')
		s.isKey = true 
		return s 
		
	}
	
	function fireNuke(x, y){
		if(!helpers.isLegit({x:x, y:y})) return 
		
		let s = sprite(x, y, 'boom', 'yellow')
		let t1 = random.between(15, 25)
		let t2 = random.between(25, 40)
		scene.time.delayedCall(t1, ()=>{
			fireNuke(s.x, s.y + TW)
		}); 
		
		scene.time.delayedCall(t1+t2, ()=>{
			s.destroy()
			let f = scene.add.sprite(x+TW/2, y+TW/2, 'main', key.fallout)
			//f.setOrigin(0)
			f.tint = tints.purple
			f.depth = -2
			f.angle = 90*random.between(0, 3)
		}); 
		registerCollidable(s)
		
		return s 
	}
	
	function fireLaser(origin, dx, dy, lifespan){
		//console.log(dx, dy, lifespan)
		
		if(lifespan === undefined){
			lifespan = 16
		}else if(lifespan === 0){
			return 
		}
		let s = sprite(origin.x + dx*TW, origin.y + dy*TW, 'laser', 'yellow')
		s.setOrigin(0.5)
		
		if(dx !== 0){
			s.angle = 90
			s.body.setSize(TW, TW/2)
		}else{
			s.body.setSize(TW/2, TW)
		}
		
		s.stop = s.x < TW || s.x > TW*TW +TW || s.y < TW || s.y > TW*TW + TW 
		
		s.explode = function(block){
			if(!block){
				s.stop = true 
			}
		}
		scene.time.delayedCall(1, ()=>{
			if(!s.stop){
				fireLaser(s, dx, dy, lifespan - 1)
			}
		}); 
		
		scene.time.delayedCall(150, ()=>{
			s.destroy()
		}); 

		/*
		scene.tweens.add({
			targets: s,
			duration: 2,
			alpha: 1,
			onComplete: ()=>{
				if(!s.stop){
					fireLaser({x: s.x + TW*dx, y: s.y + TW*dy}, dx, dy)
				}
			}
		})
		*/
		
		registerCollidable(s)
		
		return s 
		
	}
	
	function loadTileSheet(){
		let map = this.make.tilemap({ key: 'lvl1' });
		let tileset = map.addTilesetImage('colored_packed', 'main')
		this.ground = map.createStaticLayer('ground', tileset, 0, 0);
		this.walls = map.createStaticLayer('walls', tileset, 0, 0);
		this.spawns = map.createDynamicLayer('spawns', tileset, 0, 0);
		
		let spawnPoints = []
		
		this.spawns.layer.data.forEach(row => {
			row.forEach(tile => {
				if(tile.index > 0){
					spawnPoints.push(tile)
				}
			})
		})
		
		random.shuffle(spawnPoints)
		
		let player = createPlayer(spawnPoints[0])
		
		this.walls.setCollisionByExclusion(-1, true);
		this.physics.add.collider(player, this.walls)
		player.setBounce(0.1);
		player.setCollideWorldBounds(true)
		
		let blockPoints = []
		this.walls.layer.data.forEach(row => {
			row.forEach(tile => {
				if(tile.index == -1){
					blockPoints.push(tile)
				}
			})
		})
		
		let blocks = []
		let cards = []
		random.shuffle(blockPoints)
		for(let i = 0; i < 10; i++){
			blocks.push(
				createBlock(blockPoints.shift())
			)
		}
		
		for(let i = 0; i < 10; i++){
			cards.push(
				deck.create(blockPoints.shift())
			)
		}
		
		this.physics.add.overlap(player, cards, function(a, b){
			let player, card 
			if(a.player && b.cardValue){
				player = a 
				card = b
			}else if(b.player && a.cardValue){
				player = b 
				card = a 
			}
			
			card.destroy()
		})
		
		this.physics.add.collider(player, blocks, function(a, b){
			let dasher, slider
			if(a.dashTime > 0){
				dasher = a 
				slider = b 
			}else if(b.dashTime > 0){
				dasher = b 
				slider = a 
			}else{
				return true 
			}
			
			if(slider.sliding){
				
			}
			
			slider.setImmovable(false)
			slider.sliding = true 
			
		})
		this.physics.add.collider(this.walls, blocks, function(a, b){

			if(b.explode){
				b.explode()
			}
			if(a.explode){
				a.explode()
			}
		})
		this.physics.add.collider(blocks, blocks, function(a, b){
			
		})
	}
	
	function makeBorderWalls(){
		let sz = TW+1
		let walls = []
		for(let i = 1; i < sz; i+=1){
			walls = walls.concat([
				createWall({pixelX: 0,     pixelY:i*TW}, 'cr'),
				createWall({pixelX: sz*TW, pixelY:i*TW}, 'cl'),
				createWall({pixelX: i*TW, pixelY:0    }, 'tc'),
				createWall({pixelX: i*TW, pixelY:sz*TW}, 'bc')
			])
		}
		walls.concat([
			createWall({pixelX: 0, 		pixelY: 0}, 	'tl'),
			createWall({pixelX: sz*TW, 	pixelY: 0}, 	'tr'),
			createWall({pixelX: 0, 		pixelY: sz*TW}, 'bl'),
			createWall({pixelX: sz*TW, 	pixelY: sz*TW}, 'br')
		])
		
		return walls 
	}
	
	function nextLevel(player){
		player.storeOdds += 0.125
		player.difficulty += 1 
		scene.scene.start('play', player)
	}
	
	function removeNeighbors(o, tiles, distance){
		let tossers = []
		let i = 0
		while(i < tiles.length){
			let t = tiles[i]
			if(Math.abs(t.pixelX - o.x) + Math.abs(t.pixelY - o.y) <= TW*distance){
				tossers = tossers.concat(tiles.splice(i, 1))
			}else{
				i += 1
			}
		}
		return tossers 
	}
	
	function makeStore(key, data){
		//let walls = makeBorderWalls()
		let map = this.make.tilemap({ key: 'store' });
		let tileset = map.addTilesetImage('colored_packed', 'main')
		let walls = map.createDynamicLayer('walls', tileset, 0, 0);
		walls.setCollisionByExclusion(-1, true);	
		
	
		walls.forEachTile(t => {
			t.tint = 0xb8c6cf
		})
		
		let player = createPlayer({pixelX: TW*9, pixelY: TW*15}, data)
		player.storeOdds = -0.25
		
		this.physics.add.collider(player, walls)
		
		let doors = [
			createDoor({pixelX: 7*TW, pixelY: 5*TW}, true),
			createDoor({pixelX: 11*TW, pixelY: 5*TW}, false),
			createDoor({pixelX: 7*TW, pixelY: 12*TW}, true),
			createDoor({pixelX: 11*TW, pixelY: 12*TW}, false),
		]
		
		doors.forEach(d => {
			this.physics.add.collider(player, d.doors, function(player, door){
				if(player.coinCount > 0){
					door.spend(player)
				}
			})
			
			this.physics.add.collider(player, d.collectables, function(player, card){
				player.collect(card)
			})
		})
		
		let hatch = createHatch({pixelX: TW*9, pixelY: TW*2})
		let hatchKey = createKey({pixelX: TW*9, pixelY: TW*3})
		
		this.physics.add.collider(player, hatch, function(player, hatch){
			hatch.unlock(player)
		})
		
		this.physics.add.collider(player, hatchKey, function(player, card){
			player.collect(card)
		})
		
		return {
			player: player,
			terrain: walls
		}
	}
	
	function makeTut(key, data){
		let map = this.make.tilemap({ key: 'tut' });
		let tileset = map.addTilesetImage('colored_packed', 'main')
		let walls = map.createDynamicLayer('walls', tileset, 0, 0);
		walls.setCollisionByExclusion(-1, true);	
		
		
	
		walls.forEachTile(t => {
			t.tint = 0xb8c6cf
		})
		
		let player = createPlayer({pixelX: TW*2, pixelY: TW*7}, data)
		
		let destructables = []
		let blocks = [4, 7, 4, 8, 7, 1, 7, 2, 7, 3, 13, 14, 13, 15, 13, 16, 
					  5, 14, 5, 15, 5, 16, 6, 14, 6, 15, 6, 16]
		for(let i = 0; i < blocks.length; i += 2){
			destructables.push(
				createDestructable({
					pixelX: TW*blocks[i], 
					pixelY: TW*blocks[i + 1]
				})
			)
		}
		
		let collectables = []
		for(let j = 0; j < 2; j ++){
			for(let i = 5; i < 10; i++){
				collectables.push(
					createCoin({
						pixelX: TW*i,
						pixelY: TW*(7+j) 
					})
				)
			}
		}
		
		let cards = ['AH', 'QH', '2S', '5C', '4D', '2C']
		cards.forEach((c, i) => {
			collectables.push(deck.create({
				pixelX: 16*TW,
				pixelY: (6+i)*TW
			}, 	c))
		
		})
		
		collectables.push(
			createKey({
				pixelX: TW*2,
				pixelY: TW*12 
			})
		)
		
		let hatch = createHatch({
			pixelX: TW*9,
			pixelY: TW*12 
		})
		
		this.physics.add.collider(player, hatch, function(player, hatch){
			hatch.unlock(player)
		})
		
		
		let bads = baddies.create([{pixelX: TW*12, pixelY: TW*7}], {difficulty: 'scorpian'})
		
		this.physics.add.collider(player, walls)
		
		this.physics.add.collider(player, destructables, function(player, block){
			if(player.dashTime > 0 && block.explode){
				block.explode()
				//player.dashTime = 0 
			}else if(player.dashTime <= 0 && block.hurt){
				block.hurt()
			}
		})
		
		this.physics.add.collider(bads, walls, undefined, function(baddie, wall){
			return baddie.hitWall(wall)
		})
		
		this.physics.add.collider(player,collectables, function(player, card){
			player.collect(card)
		})
		
		return {
			player: player,
			terrain: walls,
			other: destructables
		}
	}
		
	function makeMap(key, data){
		let walls = makeBorderWalls()
		
		let empties = []
		let destructables = []
		for(let i = 0; i < TW; i++){
			for(let j = 0; j < TW; j++){
				let c = this.textures.getPixel(i, j, 'main', key)
				let tile = {pixelX: TW*(i+1), pixelY: TW*(j+1)}
				if(c.a > 128){
					destructables.push(
						createDestructable(tile)
					)
				}else{
					empties.push(tile)
				}
			}
		}
		
		random.shuffle(empties)
		
		
		let player = createPlayer(empties.shift(), data)
		removeNeighbors(player, empties, 2)

		let hatch = createHatch(empties.shift())
		let hatchNeighbors = removeNeighbors(hatch, empties, 1)

		let cards = []
		for(let i = 0; i < 10 - hatchNeighbors.length; i++){
			cards.push(
				deck.create(empties.shift())
			)
		}
		while(hatchNeighbors.length){
			cards.push(
				deck.create(hatchNeighbors.shift())
			)
		}
		
		let coins = []
		for(let i = 0; i < 10; i++){
			coins.push(
				createCoin(empties.shift())
			)
		}
		
		let bads = baddies.create(empties, player)
		
		let hatchKey = createKey(empties.shift())
		
		this.physics.add.collider(player, walls)
		this.physics.add.collider(bads, bads)
		
		this.physics.add.collider(player, destructables, undefined, function(player, block){
			if((player.flaming || player.dashTime > 0) && block.explode){
				block.explode()
				return false 
			}else if(player.dashTime <= 0 && block.hurt){
				block.hurt()
				return true 
			}else{
				return true 
			}
		})
		
		this.physics.add.collider(player, hatch, function(player, hatch){
			hatch.unlock(player)
		})
		
		this.physics.add.collider(player, cards.concat(coins).concat(hatchKey), function(player, card){
			player.collect(card)
		})
		
		this.physics.add.collider(player, bads, function(player, baddie){
			baddie.hitPlayer(player)
		})
		
		this.physics.add.collider(bads, walls.concat(hatch), undefined, function(baddie, wall){
			return baddie.hitWall(wall)
		})
		
		this.physics.add.collider(bads, destructables, undefined, function(baddie, dest){
			return baddie.hitDestructable(dest)
		})
		
		return {
			player: player,
			terrain: walls.concat(destructables)
		}
	}
	
	function registerCollidable(obj){
		scene.physics.add.overlap(obj, scene.map.terrain, function(a, b){
			let temp = !!a.explode
			if(a.explode){
				a.explode(!!b.explode)
			}
			if(b.explode){
				b.explode(temp)
			}
		})
		
		if(scene.map.other){ // stupid hack to make tutorial level work 
			scene.physics.add.overlap(obj, scene.map.other, function(a, b){
				let temp = !!a.explode
				if(a.explode){
					a.explode(!!b.explode)
				}
				if(b.explode){
					b.explode(temp)
				}
			})
		}
		
		scene.physics.add.overlap(obj, baddies.list, function(a, b){
			let temp = !!a.explode
			if(a.explode){
				a.explode(!!b.hitProjectile)
			}
			if(b.hitProjectile){
				b.hitProjectile(temp)
			}
		})
	}
	
	let input = {
		initialized: false,
		init: function(scene, player){
			this.player = player 
			if(this.initialized) return 
			this.initialized = true 
			scene.input.keyboard.addKey('SPACE').on('down', () => {
				this.player.fire()
			})
			
			let keyBindings = [
				['W',  0, -1],
				['S',  0,  1],
				['A', -1,  0],
				['D',  1,  0],
			]
			
			keyBindings.forEach(b => {
				scene.input.keyboard.addKey(b[0]).on('down', () => {

					this.player.down(b[1], b[2])
				})
				
				scene.input.keyboard.addKey(b[0]).on('up', () => {
					this.player.up(b[1], b[2])
				})
			})
		}
	}
	
	return {
		init: function(obj){
			if(obj.player){
				this.data = {
					difficulty: obj.difficulty,
					coinCount: obj.coinCount,
					keyCount: obj.keyCount,
					hand: obj.hand.map(c => c.cardValue),
					storeOdds: obj.storeOdds
				}
			}else{
				this.data = {
					storeOdds: -0.2,
					difficulty: 0,
					coinCount: 0,
					tut: !true 
				}
			}
			
	
		},
		create: function(){
			scene = this 
			
			deck.shuffle()
			
			
			let mapKey = random.between(1, 1055)
			let goToStore = random.frac()
			if(this.data.tut){
				this.map = makeTut.call(this, mapKey, this.data)
			}else if(goToStore < this.data.storeOdds){
				this.map = makeStore.call(this, mapKey, this.data)
			}else{
				this.map = makeMap.call(this, mapKey, this.data)
			}
			
			
			let player = this.map.player 
			
			input.init(this, player)
			
			this.timer = 0
			
		},
		update: function(){
			this.timer += 1 
			if(this.timer > 10){
				this.yellow = !this.yellow 
				this.timer = 0 
				tints.flicker = this.yellow ? tints.yellow : tints.red 
			}
		}
	}


})()
//*/