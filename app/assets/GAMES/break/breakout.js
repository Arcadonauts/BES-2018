(function(){
	/*
		Actions:
			Gravity wells/sources 
			Doors 
			
		Upgrades:
			Gun
			Extra Orbs
			Length
			Explodaball
		
		Power Ups:
			Fireball
			Shields
			
	*/
	const TW = 24 
	
	function load(name){
		let op = []
		let ld = JSON.parse(localStorage.levels)[name]
		ld.forEach((p, i) => {
			op[i] = {}
			for(let k in p){
				if(p[k] !== 23){
					op[i][k] = p[k]
				}
			}
		})
		
		return op 
	}
	
	let numbers = {
		make_empty: function(){
			return {
				get: ()=>{},
				set: ()=>{},
				pos: ()=>{},
				inc: ()=>{}
			}
		},
		make_score: function( val, add, rox, index, blink){
			let sprites = []
			let dx = 8
			let dc = 31 
			for(let i = 0; i < dc; i++){
				sprites.push(
					add.sprite(i*dx, 0, 'numbers2', 50)
				)
			}
			
			if(rox){
				sprites[4].setFrame(56)
				sprites[5].setFrame(40)
				sprites[6].setFrame(57)
			}else{
				sprites[4].setFrame(58)
				sprites[5].setFrame(59)
			}
			sprites[3].setFrame(52)
			console.log(index)
			if(index === 10){
				sprites[0].setFrame(41)
				sprites[1].setFrame(40)
			}else{
				sprites[0].setFrame(52 )
				sprites[1].setFrame(40 + index )
			}
			
			let v = ''+val 
			let j = 0 
			for(let i = dc - v.length; i < dc; i++){
				sprites[i].setFrame(40+(+v[j]))
				j += 1 
			}
			
	
			
			return {
				get: ()=> val,
				set: ()=>{},
				pos: function(x, y){
					sprites.forEach((s,i) => {s.x = x + i*dx; s.y = y}) 
				},
				inc: ()=>{}
			}
		},
		make_power: function(val, add){
			let max = 100 
			
			let bar = add.container(0, 0)
			
			let rect = add.sprite(-18, 0, 'breakout', 142)
			rect.setScale(.25, 1.25)
			rect.setOrigin(0, .5)
			bar.add(rect)
			
			let tl = add.sprite(0, 0, 'breakout', 143)
			tl.setOrigin(1,1)
			bar.add(tl)
			
			let tr = add.sprite(0, 0, 'breakout', 144)
			tr.setOrigin(0,1)
			bar.add(tr)
			
			let bl = add.sprite(0, 0, 'breakout', 158)
			bl.setOrigin(1,0)
			bar.add(bl)
			
			let br = add.sprite(0, 0, 'breakout', 159)
			br.setOrigin(0,0)
			bar.add(br)
			
			
			bar.setDepth(20)
			
			return {
				val: val,
				get: function(){return this.val},
				set: function(val){
					this.val = val 
					rect.scaleX = 1.5*val/max
				},
				inc: function(a){this.set(this.val + a)},
				pos: function(x, y){
					bar.x = x
					bar.y = y 
				}
			}				
		},
		make_tv_counter: function(val, add){
			let sprites = add.container(0, 0)
			sprites.add(add.sprite(-15, 0, 'breakout', 65))
			sprites.add(add.sprite(  0, 0, 'breakout', 65))
			sprites.add(add.sprite( 15, 0, 'breakout', 65))
			
			return {
				val : 3,
				get: function(){return this.val},
				set: function(val){
					this.val = val 
					sprites.list.forEach((c,i) => c.alpha = +(i < this.val))
				},
				inc: function(a){this.set(this.val + a)},
				pos: function(x, y){
					sprites.x = x
					sprites.y = y 
				}
			}
				
		},
		make_lives: function(val, add){
			let sprites = add.container(0, 0)
			
			sprites.add(add.sprite( 30, 23, 'breakout', 67))
			sprites.add(add.sprite( 15, 23, 'breakout', 67))
			sprites.add(add.sprite(  23, 9, 'breakout', 67))
			sprites.add(add.sprite(8, 9, 'breakout', 67))
			
			sprites.setDepth(20)
			
			return {
				val : val,
				get: function(){return this.val},
				set: function(val){
					this.val = val 
					sprites.list.forEach((c,i) => c.alpha = +(i < this.val))
				},
				inc: function(a){this.set(this.val + a)},
				pos: function(x, y){
					sprites.x = x
					sprites.y = y 
				}
			}
		},
		make_lasers: function(val, add){
			let sprites = add.container(0, 0)
			
			for(let i = 0; i < 6; i++){
				sprites.add(add.sprite( 11*(i%3), 18-18*Math.floor(i/3), 'breakout', 110))
			}
			
			
			sprites.setDepth(20)
			
			return {
				val : val,
				get: function(){return this.val},
				set: function(val){
					this.val = val 
					sprites.list.forEach((c,i) => c.alpha = +(i < this.val))
				},
				inc: function(a){this.set(this.val + a)},
				pos: function(x, y){
					sprites.x = x
					sprites.y = y 
				}
			}
		},
		make_real_level: function(val, add){
			let sprites = add.container(0, 0)
			
			sprites.add(add.sprite( 0, 0, 'breakout', 95))
			sprites.add(add.sprite( 9, 0, 'breakout', 95))
			sprites.add(add.sprite(18, 0, 'breakout', 95))
			sprites.add(add.sprite(27, 0, 'breakout', 95))
			
			sprites.setDepth(20)
			
			return {
				val : val,
				get: function(){return this.val},
				set: function(val){
					this.val = val 
					sprites.list.forEach((c,i) => c.setFrame(
						i <= this.val ? 95 : 96
					))
				},
				inc: function(a){this.set(this.val + a)},
				pos: function(x, y){
					sprites.x = x
					sprites.y = y 
				}
			}
		},
		make_big: function(val, add){
			let sprites = [
				add.sprite(0, 0, 'numbers2', 0),
				add.sprite(0, 0, 'numbers2', 0),
				add.sprite(0, 0, 'numbers2', 0),
				add.sprite(0, 0, 'numbers2', 0)
			]
			
			for(let i = 0; i < 4; i++){
				// x = 1, 0, 1, 0 
				// y = 1, 1, 0, 0 
				sprites[i].originX = 1 - i%2
				sprites[i].originY = i < 2 ? 1 : 0 
				sprites[i].setDepth(101)
			}
			
			
			let n = {
				val: val,
				sprites:  sprites,
				get: function(){
					return this.val 
				},
				set: function(val){
					this.val = val 
					for(let i = 0; i < 4; i++){
						n = 2*val + (i%2) + (i > 1 ? 10 : 0) + (val > 4 ? 10 : 0)
		
						this.sprites[i].setFrame(n)
					}
				},
				pos: function(x, y){
					this.sprites.forEach(s => {s.x = x; s.y = y})
				},
				inc: function(a){
					a = a || 1
					this.set(this.val + a)
				}
			}
			
			return n 
		},
		make_small: function(val, add){
			let n = {
				val: val,
				sprites : [],
				get: function(){
					return this.val 
				},
				set: function(val){
					this.val = val 
					
					let dx = 7 
					let str = '' + val 
					let w = str.length * dx
					
					while(this.sprites.length < str.length){
						let s = add.sprite(0, 0, 'numbers2', 0)
						s.setDepth(101)
						this.sprites.push(s)
					}
					
					for(let i = 0; i < this.sprites.length; i++){
						s = this.sprites[i]
						if(i < str.length){
							s.alpha = 1 
							s.setFrame(40+(+str[i]))
							s.x = this.x + i*dx - w/2
							s.y = this.y 
						}else{
							s.alpha = 0 
						}
					}
					
					
				},
				pos: function(x, y){
					if(x !== undefined){
						if(y === undefined){
							y = x
						}
						this.x = x 
						this.y = y 
						this.set(this.val)
					}
					
					
					return {x: this.x, y: this.y}
					
				},
				inc: function(a){
					a = a || 1 
					this.set(this.val + a)
				}
			}
			
			n.pos(0, 0)
			n.set(val)
			return n 
		}
	}
	
	let high_scores = {
		init: function(data){
			this.score = data.score 
		},
		create: function(){
			// 28200
			this.t = 500
			
			this.add.sprite(this.game.canvas.width/2, this.game.canvas.height/2, 'go_game')
			let scores = []
			let score = 30000
			for(let i = 0; i < 10; i+= 1){
				let sc, blink 
				if(this.score > score){
					sc = this.score 
					this.score = -1 
					blink = true 
				}else{
					sc = score 
					score -= 2000
					blink = false 
				}
				
				let s = numbers.make_score(sc, this.add, i > 0, i+1, blink)
				s.pos(60, 75 + 16*i)
				scores.push(s)
			}
		},
		update: function(){
			this.t -= 1 
			if(this.t <= 0){
				this.scene.stop('high_scores')
				this.scene.start('world', {name:'Lvl 2'})
			}
		}
	}
	
	let gen = {
		blocks: [],
		index: 0,
		init: function(lvl, name){
			let func 
			if(name){
				func = this.load(lvl, name)
			}else{
				func = this.funcs[lvl]
			}
			
			this.index = 0
			this.blocks = []
			for(let i = 0; i < 12*8; i++){
				let x = i % 12 
				let y = Math.floor(i/12)
				this.blocks.push(func(x, y))
			}
		},
		load: function(lvl, name){
			let bs = load(name)
			return function(x, y){
				let b = bs[lvl][(x+1)+','+(y+1)]
				if(b === undefined){
					return false 
				}else{
					return b 
				}
			}
		},
		funcs: {
			//0: (x, y) => x===8 && y===3 ? (x%2)+1 : false,
			0: (x, y) => 64,
			1: (x, y) => y%2 && y < 5? (x%2)+61 : false,
			2: (x, y) => (x%4 < 2) ^ (y%4 > 1) ? ((x+y)%2)*2 + 60 : false,
			3: (x, y) => (x+y)%2 ? (3*x+5*y)%4 + 60 : false,
			4: (x, y) => x%3 != 1 ? x%3 + 60: false,
			5: (x, y) => (19*x + 13*y) % 64 ? 61 : false,
			6: (x, y) => (x - y) % 5 ? Math.abs(2*x - y) % 4 + 60: false, 
			7: (x, y) => (x*x + y) % 3 ? (x*x + y) % 4 + 60: false,
			8: (x, y) => (x + 2*y)% 4 < 2 ? +(x%8 < 4) + 60: false,
			9: (x, y) => (x + y)%4 + 60
		},
		next: function(){
			return this.blocks[this.index++]
		}
	}
	
	let create = {
		power_drop: function(x, y){
			let drop = this.physics.add.sprite(x, y, 'breakout')
			drop.anims.play('power-drop')
			drop.v = 500
			let rot = Math.PI*2*Math.random()
			drop.body.velocity.x = drop.v * Math.cos(rot)
			drop.body.velocity.y = drop.y * Math.sin(rot)
			drop.body.allowDrag = true 
			drop.body.useDamping = true 
			drop.body.drag.x = .93 
			drop.body.drag.y = .93
			drop.body.gravity.y = 300
			drop.setDepth(5)
			drop.body.setSize(12, 12)
			
			this.physics.add.collider(this.paddle, drop, (paddle, drop) => {
				drop.destroy()
				this.score.inc(10)
				if(this.score.get() > 100){
					this.score.set(0)
				}
			})
			
			return drop 
		},
		fire: function(x, y){
			let fire = this.physics.add.sprite(x, y, 'fire')
			fire.anims.play('fire')
			fire.body.velocity.y = 200
			fire.setDepth(6)
			fire.body.setSize(18, 4)
			
			this.physics.add.collider(this.paddle, fire, (paddle, fire) => {
				fire.destroy()
				paddle.stun = 100
			})
		},
		laser: function(){
			let laser = this.physics.add.sprite(this.paddle.x, this.paddle.y, 'breakout', 110)
			laser.body.velocity.y = -300
			laser.anims.play('laser')
			laser.setSize(7,10)
			
			this.physics.add.collider(laser, this.blocks, function(laser, block){
				block.hit()
				laser.destroy()
			})
			
		},
		paddle: function(cursors){

			let paddle = this.add.container(100, 210)
			this.physics.world.enable(paddle)
			paddle.body.setImmovable(true)
			paddle.body.setCollideWorldBounds(true)
			
			let pl = TW*2
			if(this.creator.paddle_length){
				pl = this.creator.paddle_length(this.data.length)
			}
			paddle.body.setSize(pl, TW/2).setOffset(-TW, TW/4)
			
			//paddle.add(this.add.sprite(-TW/2, TW/2, 'breakout', this.creator.paddle_left))
			//paddle.add(this.add.sprite( TW/2, TW/2, 'breakout', this.creator.paddle_right))
			this.creator.paddle_parts.forEach(p => {
				let part = this.add.sprite(p[1], p[2], 'breakout', p[0])
				paddle.add(part)
				part.f0 = p[0]
				part.setOrigin(0,0)
				part.scaleX = p[3] === undefined ? 1 : p[3]
			})
		
		
			paddle.v = 240 
			paddle.stun = 0 
			paddle.body.useDamping = true 
			paddle.body.drag.x = .90
			paddle.update = function(){
				if(this.stun > 0){
					this.stun -= 1
					this.list.forEach(p => p.setFrame(
						this.stun % 16 < 8 ? p.f0+62 : p.f0+92
					))
				}else{
					this.list.forEach(p => p.setFrame(p.f0))
					if(cursors.left.isDown){
						this.body.velocity.x = -this.v
					}else if(cursors.right.isDown){
						this.body.velocity.x = this.v
					}else{
						
					}
				}
			}
			
			return paddle 
		},
		ball: function(){
			let ball = this.physics.add.sprite(this.paddle.x + this.paddle.body.width/2, this.paddle.y - 24, 'breakout', 66)
			ball.anims.play(this.creator.anim)
			ball.setCollideWorldBounds(true)
			ball.v = 120 
			let rot = -Math.PI/4
			ball.body.velocity.x = ball.v * Math.cos(rot)
			ball.body.velocity.y = ball.v * Math.sin(rot)
			ball.body.allowDrag = false 
			ball.body.bounce.x = 1.01
			ball.body.bounce.y = 1.01
			ball.setSize(8, 8)//.setOffset(4, 4)
			ball.max_y = 0 
			
			this.physics.add.collider(this.paddle, ball, function(paddle, ball){
				let px = paddle.body.x + paddle.body.width/2 
				let bx = ball.body.x + ball.body.width/2 
				
				let py = paddle.body.y + paddle.body.height/2 
				let by = ball.body.y + ball.body.height/2 
				
				let rot = -(0.3*Math.PI)*(px - bx)/(paddle.body.width/2) - Math.PI/2
				if(by > py){
					rot += Math.PI
				}
				ball.v += 1 
				let vx = ball.v * Math.cos(rot)
				let vy = ball.v * Math.sin(rot)
				ball.body.velocity.set(vx, vy)
			})
			
			return ball 
		},
		blocks: function(lvl, name){
			gen.init(lvl, name)
			let blocks = []
			let that = this 
			for(let i = 0; i < gen.blocks.length; i++){
				let j = gen.next()
				if(j === false){
					continue
				}
				let block = this.physics.add.sprite(
					(i%12)*TW + 24, 
					Math.floor(i/12)*12 + 18, 
					'breakout', 
					j
				)
				
				
				block.that = that 
				block.index = j 
				block.hit = this.creator.block_hit
				block.setImmovable(true)
				blocks.push(block)
				if(this.creator.animate){
					this.creator.animate(block)
				}
				if(this.creator.block_init && this.creator.block_init[j]){
					this.creator.block_init[j](block)
				}
			}
			
			return blocks 
		},
		collide: function(ball, blocks){
			this.physics.add.collider(ball, blocks, function(ball, block){
				block.hit()
			})
		},
		init: function(cursors){
			let xc = this.game.canvas.width/2
			let yc = this.game.canvas.height/2
			
			
			this.add.sprite(this.add.sprite(xc, yc, this.creator.bg).setDepth(0))
			this.add.sprite(this.add.sprite(xc, yc, this.creator.fg).setDepth(10))
			
			this.score = this.creator.score.call(this)
			this.level = this.creator.level.call(this)
			this.lives = this.creator.lives.call(this)
			this.lasers= this.creator.lasers.call(this)
			
			if(this.creator.create_paddle_parts){
				this.creator.create_paddle_parts(this.data.length)
			}
			
			this.paddle = create.paddle.call(this, this.cursors)
			
			this.blocks = this.creator.blocks.call(this, this.lvl, this.name)
			
			this.balls = [create.ball.call(this)]
			
			create.collide.call(this, this.balls, this.blocks)
			
			this.input.keyboard.on('keydown-E', ()=> {
	
				if(this.balls.length === 0){
					let ball = create.ball.call(this)
					create.collide.call(this, ball, this.blocks)
					this.balls.push(ball)
				}else{
					if(this.lasers.get() > 0){
						let laser = create.laser.call(this)
						this.lasers.inc(-1)
						
					}
				}
			})
			
			this.input.keyboard.on('keydown-Q', ()=> {
				this.creator.q_press.call(this)
			})
			
			
			
		}
	}
	
	let control = {
		toggle: {
			red: true,
			icons: {
				red: 63, 
				blue: 64
			},		
			init: function(that){
				this.icon = that.add.sprite(332, 152, 'icons', this.icons.red)
				this.icon.setDepth(11)
				this.blocks = [] 
			},
			register: function(block){
				this.blocks.push(block)
				block.color = block.index === 21 ? 'red' : 'blue'
				block.off = false 
				block.on('animationcomplete', function(anim, frame){
					if(anim.key === 'blue-on'){
						this.anims.play('block-20')
					}else if(anim.key === 'red-on'){
						this.anims.play('block-21')
					}
				})
				block.toggle = function(){
					this.off = !this.off 
					if(this.off){
						this.anims.play(this.color + '-off')
					}else{
						this.anims.play(this.color + '-on')
					}
					this.body.checkCollision.none = this.off  
				}
				block.t = 1 
				block.ignore = true 
			
				
				if(block.index === 20){
					block.toggle()
				}
				
			},
			act: function(){
				this.red = !this.red 
				this.blocks = this.blocks.filter(b => !b.dead)
				this.blocks.forEach(b => b.toggle())
				this.icon.setFrame(this.red ? this.icons.red : this.icons.blue)
			}
		}
	}
	
	let creator = {
		tv: {
			bg: 'bg_bad',
			fg: 'fg_bad',
			anim: 'ball-bad',
			//paddle_left: 77,
			//paddle_right: 78,
			paddle_parts: [
				[77, -TW/2, TW/2],
				[78,  TW/2, TW/2]
			],
			blocks: create.blocks,
			score: function(){
				return numbers.make_empty()
			},
			level: function(){
				return numbers.make_empty()
			},
			lives: function(){
				let counter =  numbers.make_tv_counter(3, this.add)
				counter.pos(336, 200)
				
				return counter
			},
			lasers: () => numbers.make_empty(),
			next_level: function(){
				this.game_over = true 
				this.add.sprite(this.game.canvas.width/2, this.game.canvas.height/2, 'yw_bad')
			},
			q_press: function(){
				this.scene.stop('breakout')
				this.scene.resume('world')
				
			},
			game_over: function(){
				this.game_over = true 
				this.add.sprite(this.game.canvas.width/2, this.game.canvas.height/2, 'go_bad')
			
			},
			block_hit: function(){
				this.destroy()
				this.dead = true 
				this.that.score.inc(100)
			}
			
		},
		arcade: {
			bg: 'bg_game',
			fg: 'fg_game',
			anim: 'ball-game',
			//paddle_left: 75,
			//paddle_right: 76,
			paddle_parts: [
				[75, -TW/2, TW/2],
				[76,  TW/2, TW/2]
			],
			blocks: create.blocks,
			score: function(){
				let score = numbers.make_small(0, this.add)
				score.pos(332, 175)
				return score
			},
			level: function(){
				let level = numbers.make_big(this.lvl, this.add)
				level.pos(330, 45)
				level.set(this.lvl)
				return level 
			},
			lives: function(){
				let lives = numbers.make_big(3, this.add)
				lives.pos(330, 113)
				lives.set(3)
				return lives 
			},
			lasers: () => numbers.make_empty(),
			next_level: function(){
				//this.creator.game_over.call(this)
				//return 
				this.ball.dead = true 
				this.lvl += 1 
				if(this.lvl > 9){
					this.creator.game_over.call(this)
				}
				this.level.set(this.lvl)
				this.blocks = create.blocks.call(this, this.lvl)
			},
			q_press: function(){
				//this.creator.game_over.call(this)
				this.blocks.forEach(b => b.hit())
				this.creator.next_level.call(this)
				//this.scene.stop('breakout')
				//this.scene.resume('world')
				
			},
			game_over: function(){
				console.log('game over')
				this.scene.start('high_scores', {score: this.score.get()})
			},
			block_hit: function(){
				this.destroy()
				this.dead = true 
				this.that.score.inc(100)
			}
		},
		real: {
			bg: 'bg_real',
			fg: 'fg_real',
			anim: 'ball-real',
			length_factor: .25,
			create_paddle_parts: function(len){
				let w = this.length_factor
				this.paddle_parts[1][3] = len*w
				this.paddle_parts[4][3] = len*w
				
				this.paddle_parts[2][1] = TW*len*w 
				this.paddle_parts[5][1] =  TW*len*w 
			},
			paddle_parts: [
				[92, -TW, TW/4],
				[93, 0, TW/4],
				[94,  TW/2, TW/4],
				[107,-TW, .75*TW],
				[108, 0, .75*TW],
				[109, TW/2, .75*TW],
				
			],
			//paddle_left: 92,
			//paddle_right: 94,
			blocks: create.blocks,
			paddle_length: function(len){
				let w = this.length_factor
				return TW*1.5 +  TW*len*w 
			},
			score: function(){
				let score = numbers.make_power(0, this.add)
				score.set(0)
				score.pos(332, 19)
				return score
			},
			level: function(){
				let level = numbers.make_real_level(this.lvl, this.add)
				level.pos(326, 193)
				level.set(this.lvl)
				return level 
			},
			lasers: function(){
				let lasers = numbers.make_lasers(0, this.add)
				lasers.pos(321, 94)
				lasers.set(this.data.lasers)
				return lasers 
			},
			lives: function(){
				let lives = numbers.make_lives(0, this.add)
				lives.pos(313, 40)
				lives.set(this.data.lives)
				return lives 
			},
			next_level: function(){
				
				this.balls.forEach(ball => ball.dead = true) 
				this.lvl += 1 
				if(this.lvl > 3){
					this.creator.game_over.call(this)
				}
				this.level.set(this.lvl)
				
				this.blocks = create.blocks.call(this, this.lvl, this.name)
			},
			q_press: function(){

				if(this.control){
					this.control.act()
				}else{
					this.blocks.forEach(b => {b.destroy(); b.dead = true})
					this.creator.next_level.call(this)
				}
			},
			game_over: function(){
				console.log('game over')
				this.scene.start('high_scores', {score: this.score.get()})
			},
			animate: function(block){
				if(animations.blocks[block.index]){
					block.anims.play('block-'+block.index)
				}
			},
			block_init: {
				13: function(block){
					block.update = function(blocks){
						let left, right 
						for(let i = 0; i < blocks.length; i++){
							let b = blocks[i]
							if(b.y === this.y){
								if(b.x === this.x + TW ){
									right = b.index
								}else if(b.x === this.x - TW){
									left = b.index 
								}
								if(left && right) break 
							}
							
						}
						if((left !== 13 && left !== 14) || (right !== 13 && right !== 15)){
							this.dying = 3
							this.update = function(){
								if(this.dying > 0){
									this.dying -= 1
								}else{								
									this.hit(true)
								}
							}
						}
					}
				},
				14: function(block){
					block.update = function(blocks){
						let  right 
						for(let i = 0; i < blocks.length; i++){
							let b = blocks[i]
							if(b.y === this.y){
								if(b.x === this.x + TW ){
									right = b.index
									break 
								}
							}
						}
						if(right !== 13){
							this.anims.play('block-3')
							this.update = undefined
						}
							
					}
				},
				15: function(block){
					block.update = function(blocks){
						let  left 
						for(let i = 0; i < blocks.length; i++){
							let b = blocks[i]
							if(b.y === this.y){
								if(b.x === this.x - TW ){
									left = b.index
									break 
								}
							}
						}
						if(left !== 13){
							this.anims.play('block-3')
							this.update = undefined
						}
							
					}
				},
				20: function(block){
					if(!block.that.control){
						block.that.control = control.toggle 
						block.that.control.init(block.that)
					}
					block.that.control.register(block)
					
				},
				21: function(block){
					if(!block.that.control){
						block.that.control = control.toggle 
						block.that.control.init(block.that)
					}
					block.that.control.register(block)
				}
			},
			block_hit: function(side){
				let blocks = this.that.blocks 
				
				let is_left  = x => x > 3 && x < 12 && !(x%2)
				let is_right = x => x > 3 && x < 12 && (x%2)
				let is_brown = x => x === 2 || x === 6 || x === 7
				let is_blue = x => x === 1 || x === 8 || x === 9
				let is_red = x => x === 0 || x === 4 || x === 5
				let is_green = x => 12 < x && x < 16
				let is_toggle = x => x === 21 || x === 20 
				
				
				
				if(!side && is_left(this.index)){
					blocks.forEach(b => {
						if(b.index === this.index + 1 && b.y === this.y && b.x === this.x + TW){
							b.hit(true) 
						}
					})
				}
				
				if(!side && is_right(this.index)){
					blocks.forEach(b => {
						if(b.index === this.index - 1 && b.y === this.y && b.x === this.x - TW){
							b.hit(true)
						}
					})
				}
				
				if(is_green(this.index)){
					if(this.index === 13 && !side){
						return 
					}
				}
				
				if(is_brown(this.index)){
					let browns = {2:12, 6:10, 7:11 }
					this.setFrame(browns[this.index])
					this.index = browns[this.index]
					return 
				}
				
				if(is_toggle(this.index) && this.on){
					return 
				}
				
				if(this.index === 22){ // extra ball 
					//console.log(this)
					let ball = create.ball.call(this.that)
					this.that.balls.push(ball)
					create.collide.call(this.that, ball, this.that.blocks)
					ball.x = this.x
					ball.y = this.y 
				}
				
				if(is_blue(this.index)){
					for(let i = 0; i < 3; i++){
						create.power_drop.call(this.that, this.x, this.y)
					}
				}
				
				if(is_red(this.index)){
					create.fire.call(this.that, this.x, this.y)
				}
				
				this.destroy()
				this.dead = true 
				
				//this.that.score.inc(100)
			}
		},
		dream: {
			
		}
	}
	
	let animations = {
		blocks: {
			// blues 
			1: [212], 
			8: [152],
			9: [153],
			
			// extra ball 
			22: [181, 166, 151, 136, 121, 106, 121, 136, 151, 166, 181] ,
			
			// reds
			0: [197],
			4: [122],
			5: [123],
			
			// greens 
			13: [165, 180, 195, 180, 165],
			14: [210, 225, 240, 225, 210],
			15: [255, 270, 285, 270, 255],
			3: [3],
			
			// toggle 
			20: [213, 228, 243],
			21: [214, 229, 244]
			
		},
		init: function(){
			let a = animations
			this.anims.create(a.anim('ball-game', 66))
			this.anims.create(a.anim('ball-bad', 65))
			this.anims.create(a.anim('ball-real', 67, 68, 69, 68))
			
			this.anims.create(a.anim('laser', 110, 111))
			this.anims.create(a.anim('fire', 105, 120, 135, 150, 135, 120))
			
			this.anims.create(a.once('blue-off', 196, 211, 226, 271))
			this.anims.create(a.once('red-off', 256, 241, 226, 271))
			
			this.anims.create(a.once('blue-on', 271, 226, 211, 196))
			this.anims.create(a.once('red-on', 271, 228, 241, 256))
			
			for(let k in animations.blocks){
				let flick = animations.blocks[k]
				flick.unshift(k)
				flick.unshift('block-'+k)
				this.anims.create(a.anim.apply(a, flick))
			}
			
			this.anims.create(a.anim('power-drop', 79, 80, 81, 80))
		},
		_frame: function(f){
			return {key: 'breakout', frame: f}
		},
		anim: function(){
			
			let frames = []
			for(let i = 1; i < arguments.length; i++){
				frames.push(this._frame(arguments[i]))
			}
			let op =  {
				key: arguments[0],
				frames: frames,
				repeat: -1,
				frameRate: 12,
			}	
			
			return op 
		},
		once: function(){
			let frames = []
			for(let i = 1; i < arguments.length; i++){
				frames.push(this._frame(arguments[i]))
			}
			let op =  {
				key: arguments[0],
				frames: frames,
				repeat: 0,
				frameRate: 12,
			}	
			
			return op 
		}
	}
	
	window.breakout = {
		init: function(data){
			this.style = data.style 
			this.lvl = data.lvl 
			this.name = data.name 
			this.data = data 
		},
		create: function(){
			console.log('Breakout:', this.data)
			this.physics.world.setBounds(12, 12, 288, 228+24)
			
			this.cursors = this.input.keyboard.addKeys({
				up:Phaser.Input.Keyboard.KeyCodes.W,
				down:Phaser.Input.Keyboard.KeyCodes.S,
				left:Phaser.Input.Keyboard.KeyCodes.A,
				right:Phaser.Input.Keyboard.KeyCodes.D
			});

			animations.init.call(this)
			
			this.creator = creator[this.style]
			create.init.call(this, this.cursors)
		},
		update: function(){
			if(this.game_over){
				return 
			}
			this.paddle.update()
			this.blocks.forEach(b => b.update && b.update(this.blocks))
			this.blocks = this.blocks.filter(b => !b.dead)
			
			let min_blocks = this.data.bomb || 0 
			if(this.blocks.filter(b => !b.ignore).length <= min_blocks){
				this.blocks.forEach(b => {b.destroy(); b.dead = true})
				this.creator.next_level.call(this)
			}
			
			//*
			this.balls.forEach(ball => {
				if(ball.y > 240){
					ball.dead = true 
					if(this.balls.length === 1){
						this.lives.inc(-1)
					}
				}
				if(ball.dead){
					ball.destroy()
				}else{
					ball.update()
				}
				
			})
			
			this.balls = this.balls.filter(b => !b.dead)
			
			if(this.lives.get() < 0){
				this.game_over = true 
				this.creator.game_over.call(this)
			}
			//*/
			
		},
		high_scores: high_scores
	}
})()