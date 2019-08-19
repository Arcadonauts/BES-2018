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
				val: 0,
				get: function(){return this.val},
				set: function(v){this.val = v},
				pos: ()=>{},
				inc: function(a){this.val += a}
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
		//	console.log(index)
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
			let max = inventory.gem_max 
			
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
			this.next = data.next || 'Lvl 2'
		},
		create: function(){
	
			this.t = 500
			
			if(this.score === 'win'){
				let s = this.add.sprite(0, 0, 'mission_pass')
				s.setOrigin(0)
			}else if(this.score === 'lose'){
				let s = this.add.sprite(0, 0, 'mission_fail')
				s.setOrigin(0)
			}else{
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
			}
		},
		update: function(){
			this.t -= 1 
			if(this.t <= 0){
				//this.scene.stop('high_scores')
				this.scene.start('world', {name:this.next, win: this.score})
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
			//d: (x, y) => (x===8 || x === 9) && (y===3 || y === 4) ? 31+x+15*y : false,
			d: (x, y) => x+12*y,
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
				this.score.inc(1)
				if(this.score.get() > inventory.gem_max){
					this.score.set(0)
				}
				inventory.add('gems')
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
			let ball = this.physics.add.sprite(this.paddle.body.center.x, this.paddle.y - 6, 'breakout', 66)
			ball.anims.play(this.creator.anim)
			ball.setCollideWorldBounds(true)
			ball.v = 150 
			let rot = -Math.PI/4
			ball.body.velocity.x = ball.v * Math.cos(rot)
			ball.body.velocity.y = ball.v * Math.sin(rot)
			ball.body.allowDrag = false 
			ball.body.bounce.x = 1.01
			ball.body.bounce.y = 1.01
			ball.setSize(8, 8)//.setOffset(4, 4)
			ball.max_y = 0 
			//ball.body.setCircle(4)
			ball.allowGravity = false 
			//ball.body.setMaxVelocity(ball.v * 2)
			
			this.physics.add.collider(this.paddle, ball, (paddle, ball) => {
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
				
				if(this.creator && this.creator.shake){
					this.creator.shake.call(this)
				}
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
				}else if(this.creator.block_init && this.creator.block_init['*']){
					this.creator.block_init['*'](block)
				}
			}
			
			return blocks 
		},
		collide: function(ball, blocks){
			this.physics.add.collider(ball, blocks, null, (ball, block) => {
				block.hit()
				return !(block.that &&  block.that.control && block.that.control.acidic)
			})
		},
		init: function(cursors){
			let xc = this.game.canvas.width/2
			let yc = this.game.canvas.height/2
			
			this.game_over = false 
			
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
			
			this.balls = []
			
			create.collide.call(this, this.balls, this.blocks)
			
			if(this.control && this.control.post_init){
				this.control.post_init(this)
			}
			
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
		error: {
			init: function(that){
				that.control = this
				this.icon = that.add.sprite(332, 153, 'icons', 54)
				this.icon.setDepth(11)
				this.t = 0 
			},
			act: function(){
				
			},
			register: function(){
				
			},
			update: function(){
				this.t += 1 
				let fr = 4 
				this.icon.setFrame(
					65 + Math.floor(this.t/fr)%4
				)
			}
		},
		acid: {
			init: function(that){
				that.control = this
				this.icon = that.add.sprite(332, 153, 'icons', 54)
				//this.icon.anims.play('timer')
				this.icon.setDepth(11)
				
				
				this.max_cool_off = 1000
				this.cool_off = this.max_cool_off - 1 
				this.acid = 0
				this.max_acid = 200
				this.acidic = false 
			},
			post_init: function(that){
				this.that = that
			},
			register: function(block){
				block.setFrame(12)
			},
			act: function(){
				if(this.cool_off >= this.max_cool_off){
					this.acidic = true 
					this.that.balls.forEach(ball => ball.anims && ball.anims.play('ball-acid'))
				}
				
			},
			update: function(){
				if(this.cool_off < this.max_cool_off){
					this.cool_off += 1 
				}
				if(this.acidic){
	
					this.acid += 1
					if(this.acid >= this.max_acid){
						this.acid = 0
						this.acidic = false 
						this.cool_off = 0
						this.that.balls.forEach(ball => ball.anims && ball.anims.play('ball-real'))
					}
					let fr = 32
					this.icon.setFrame(
						41 + Math.floor(4*(this.acid%fr)/fr)
					)
				}else{
					this.icon.setFrame(
						54 + Math.floor(8*this.cool_off/(this.max_cool_off))
					)
				}
			},
			shutdown: function(){
				
			}
		},
		grav: {
			out: true,
			grav: 200000,
			blocks: [],
			init: function(that){
				that.control = this 
				this.icon = that.add.sprite(332, 153, 'icons', 50)
				this.icon.anims.play('agrav')
				this.icon.setDepth(11)
				this.out = true 
			},
			register: function(block){
				
				//*
				let sun = block.that.add.container(block.x, block.y)
				let top = block.that.add.sprite(0, 0, 'breakout')
				let bot = block.that.add.sprite(0, 0, 'breakout')
				top.setOrigin(.5, 1)
				bot.setOrigin(.5, 0)
				top.anims.play('sun-top')
				bot.anims.play('sun-bot')
				
				sun.add(top)
				sun.add(bot)
				sun.setDepth(5)
				
				//block.that.physics.world.enable(sun)
				//sun.body.setCircle(12).setOffset(-12)
				//block.that.blocks.push(sun)
				
				block.alpha = 0 
				//*/
				block.body.checkCollision.none = true 
				block.setOrigin(.5)
				block.grav = this.grav 
				block.out = this.out 
				
				block.ignore = true 
				let r = 6
				//block.body.setCircle(2*r)
				//block.body
				//block.sun = sun 
				this.blocks.push(block)
				
				
				block.update = function(){
					this.that.balls.forEach(ball => {
						
						if(!ball.body || !this.body) return 
						let acc = this.body.center.clone()
						acc.subtract(ball.body.center)
						
						let r2 = acc.lengthSq()
						
						acc.normalize()
						
						acc.scale(this.grav/r2)
						if(this.out){
							acc.scale(-1)
						}
						
						ball.body.acceleration.add(acc)
						//ball.body.setAcceleration(acc.x, acc.y) 
						//console.log(Math.floor(acc.x), Math.floor(acc.y))
						//ball.body.reset(this.body.center.x, this.body.center.y)
					})
				}
				
				
			},
			post_init: function(that){
				
			},
			act: function(){
				this.out = !this.out 
				this.icon.anims.play(this.out ? 'agrav' : 'grav')
				this.blocks.forEach(b => b.out = this.out)
			},
			shutdown: function(){
				
			}
			
		},
		slide: {
			left: true,
			
			init: function(that){
				that.control = this 
				this.icon = that.add.sprite(332, 153, 'icons', 50)
				this.icon.anims.play('slide')
				this.icon.setDepth(11)
				this.blocks = [] 
				this.left = true 
				this.dir = -1 
				
				console.log('take control')
			},
			register: function(block){
				this.blocks.push(block)
				block.v = 60 
				block.body.velocity.x = -block.v  
				block.body.setCollideWorldBounds(true)
				block.ignore = true 

			}, 
			post_init: function(that){
			
				that.physics.add.collider(this.blocks, that.blocks, function(b1, b2){
					b1.body.reset(TW*Math.round(b1.x/TW), b1.y)
				})
			},
			act: function(block){
				this.left = !this.left 
				this.icon.scaleX *= -1 
				this.dir = -this.icon.scaleX
				this.blocks = this.blocks.filter(b => !b.dead)
				this.blocks.forEach(b => {
					//b.x += v/60 
					b.dir = this.dir
					b.body.velocity.x = this.dir*b.v
				})
				
			},
			shutdown: function(){
			}
		},
		toggle: {
			red: true,
			icons: {
				red: 63, 
				blue: 64
			},		
			init: function(that){
				that.control = this 
				this.icon = that.add.sprite(332, 153, 'icons', this.icons.red)
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
			},
			shutdown: function(){
				
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
				[77, -TW, TW/4],
				[78,  0, TW/4]
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
				[75, -TW, TW/4],
				[76,  0, TW/4]
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
				this.creator.game_over.call(this)
				//this.blocks.forEach(b => b.hit())
				//this.creator.next_level.call(this)
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
			explode: function(){
				if(this.countdown === undefined){
					this.balls.forEach(ball => {
						ball.body.reset(ball.x, ball.y)
						ball.anims.play('ball-explode')
					})
					
					this.countdown = 200 
					let fps = this.game.loop.actualFps
					this.cameras.main.shake(1000*this.countdown/fps, .01, true)
				}else if(this.countdown > 0){
					this.countdown -= 1 
					
				}else{
					this.cameras.main.flash()
					this.cameras.main.shake(0, 0, true)
					this.countdown = undefined
					
					if(this.control){
						this.control.shutdown()
						this.control = undefined
					}
					this.blocks.forEach(b => {b.destroy(); b.dead = true})
					this.balls.forEach(ball => ball.dead = true) 
					this.lvl += 1 
					//console.log(this.lvl)
					
					
					if(this.lvl > 3){
						this.creator.game_over.call(this, true)
						return 
					}
					this.level.set(this.lvl)
					
					this.blocks = create.blocks.call(this, this.lvl, this.name)
					if(this.control && this.control.post_init){
						this.control.post_init(this)
					}
				}
				
			},
			next_level: function(){
				this.creator.explode.call(this)
				
			},
			q_press: function(){

				if(this.control){
					this.control.act()
				}else{
					//this.blocks.forEach(b => {b.destroy(); b.dead = true})
					//this.creator.next_level.call(this)
				}
			},
			game_over: function(win){
				console.log('game over')
				this.scene.start('high_scores', {
					next: this.next, 
					score: win ? 'win' : 'lose'
				})
			},
			animate: function(block){
				if(animations.blocks[block.index]){
					block.anims.play('block-'+block.index)
				}
			},
			shake: function(){
				this.cameras.main.shake(50, .005)
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
						control.toggle.init(block.that)
					}
					block.that.control.register(block)
					
				},
				21: function(block){
					if(!block.that.control){
						control.toggle.init(block.that)
					}
					block.that.control.register(block)
				},
				16: function(block){
					if(!block.that.control){
						control.slide.init(block.that)
					}
					block.that.control.register(block)
				},
				17: function(block){
					if(!block.that.control){
						control.slide.init(block.that)
					}
					block.that.control.register(block)
				},
				18: function(block){
					if(!block.that.control){
						control.slide.init(block.that)
					}
					block.that.control.register(block)
				},
				19: function(block){
					if(!block.that.control){
						control.slide.init(block.that)
					}
					block.that.control.register(block)
				},
				24: function(block){
					if(!block.that.control){
						control.grav.init(block.that)
					}
					block.that.control.register(block)
				},
				25: function(block){
					if(!block.that.control){
						control.acid.init(block.that)
					}
					block.that.control.register(block)
				},
				26: function(block){
					if(!block.that.control){
						control.error.init(block.that)
					}
					block.that.control.register(block)
					
					block.update = function(){
						if(this.that.balls && this.that.balls.length){
							let ball = this.that.balls[0]
							if(ball){
								ball.v += .1
								this.x = ball.x 
							}
						}else{
							this.x = this.that.paddle.x
						}
						this.x = Math.max(this.x, 24)
						this.x = Math.min(this.x, 300-12)
					}
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
				let is_yellow = x => 15 < x && x < 20 
				
				let shake = () => this.that.cameras.main.shake(50, .005)
				
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
						shake()
						return 
					}
				}
				
				if(is_yellow(this.index)){
					shake()
					return 
				}
				
				if(is_brown(this.index)){
					let browns = {2:12, 6:10, 7:11 }
					this.setFrame(browns[this.index])
					this.index = browns[this.index]
					shake()
					return 
				}
				
				if(is_toggle(this.index) && this.on){
					shake()
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
				
				if(this.index === 24){ //gravity ball 
					return 
				}
				
				if(this.index === 26){ // paddle 
					shake()
					return 
				}
				
				if(is_blue(this.index)){
					for(let i = 0; i < 3; i++){
						create.power_drop.call(this.that, this.x, this.y)
					}
				}
				
				if(is_red(this.index)){
					create.fire.call(this.that, this.x, this.y)
				}
				
				shake()
				let s = this.that.add.sprite(this.x, this.y, 'breakout', 215)
				s.anims.play('block-explode')
				s.on('animationcomplete', function(anim, frame){
					s.destroy()
				})
			
				this.destroy()
				this.dead = true 
				
				//this.that.score.inc(100)
			}
		},
		dream: {
			bg: 'bg_bad',
			fg: 'fg_dream',
			anim: 'ball-dream',
			//paddle_left: 77,
			//paddle_right: 78,
			paddle_parts: [
				[145, -TW, TW/4],
				[146,  0, TW/4]
			],
			blocks: create.blocks,
			score: function(){
				return numbers.make_empty()
			},
			level: function(){
				return numbers.make_empty()
			},
			lives: function(){
				let n = numbers.make_empty()
				n.set(0)
				return n 
			},
			lasers: () => numbers.make_empty(),
			next_level: function(){
				this.game_over = true 
				this.add.sprite(this.game.canvas.width/2, this.game.canvas.height/2, 'yw_bad')
			},
			q_press: function(){
				//this.scene.stop('breakout')
				//this.scene.resume('world')
				
			},
			game_over: function(){
				this.game_over = true 
				//console.log(this)
				this.cameras.main.fade(1000, 0, 0, 0, false, function(cam, r){
					if(r === 1){
						cam.scene.scene.start('world', {
							name: 'Lvl 6'
						})
					}
				})
			
			},
			
			block_init: {
				counter: {
					value: 1,
					max: 0
				},
				'*': function(block){
					let n = block.index 
					let i = n % 2 
					let j = Math.floor(n/12) % 2
					
					let k = (n - (i%2) - (12*(j%2)))/2
					k -= Math.floor(k/12)*6
					
					//= (n - (i%2) - (12*(j%2))) / (2*(Math.floor(j/2)+1))
					let f = [88, 84, 86, 82, 112, 114, 116, 118][(k*11)%8] 
					// 160 161, 175, 176
					block.counter = this.counter 
					block.alt = 160 + i + 15*j 
					block.prime = f + i + 15*j
					block.setFrame(block.prime)
	
					block.counter.max += .25 
					block.value = ((k+15)*13)%24
					block.alpha = 0 
					//block.setFrame(f + i + 15*j)
					
					//console.log(block.index)
					block.update = function(){
						if(this.counter.value > this.value){
							this.alpha = 1 
							//this.setFrame(this.prime)
						}else{
							//this.setFrame(this.alt)
							this.alpha = 0 
						}
						this.body.checkCollision.none = this.counter.value <= this.value
						let ball = this.that.balls[0]
						if(!ball) return 
						
						
						if(this.counter.value === this.value && this.v && ball.v !== this.v && ball.y > 200){
							this.counter.value += 1 
						}
						
						this.v = ball.v 
					}
				}
			},
			block_hit: function(){
				this.value = this.counter.max 
				this.counter.max += 1 

				this.that.balls.forEach(b => b.v += 10)
				this.that.creator.shake.call(this.that)
			},
			shake: function(){
				this.cameras.main.shake(50, .005)
			},
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
			21: [214, 229, 244],
			
			// yellow 
			16: [257, 272, 287],
			17: [258, 273, 288],
			18: [259, 274, 289],
			19: [260, 275, 290],
			
		},
		init: function(){
			let a = animations
			this.anims.create(a.anim('ball-game', 66))
			this.anims.create(a.anim('ball-bad', 65))
			this.anims.create(a.anim('ball-dream', 147))
			this.anims.create(a.anim('ball-real', 67, 68, 69, 68))
			this.anims.create(a.anim('ball-acid', 70, 71, 72, 71))
			this.anims.create(a.anim('ball-explode', 73, 74))
			this.anims.create(a.fast('block-explode', 215, 216, 217, 218))
			
			this.anims.create(a.anim('laser', 110, 111))
			this.anims.create(a.anim('fire', 105, 120, 135, 150, 135, 120))
			
			this.anims.create(a.once('blue-off', 196, 211, 226, 271))
			this.anims.create(a.once('red-off', 256, 241, 226, 271))
			
			this.anims.create(a.once('blue-on', 271, 226, 211, 196))
			this.anims.create(a.once('red-on', 271, 228, 241, 256))
			
			this.anims.create(a.icon('slide', 50, 51, 52, 53))
			this.anims.create(a.icon('grav', 36, 37, 38, 39, 40, 45, 46, 47, 48))
			this.anims.create(a.icon('agrav', 48, 47, 46, 45, 40, 39, 38, 37, 36 ))
			//this.anims.create(a.icon_once('timer', 54, 54, 56, 57, 58, 59, 60, 61, 62 ))
			
			this.anims.create(a.anim('sun-top', 124, 125, 126, 125))
			this.anims.create(a.anim('sun-bot', 139, 140, 141, 140))

			
			
			for(let k in animations.blocks){
				let flick = animations.blocks[k]
				flick.unshift(k)
				flick.unshift('block-'+k)
				this.anims.create(a.anim.apply(a, flick))
			}
			
			this.anims.create(a.anim('power-drop', 79, 80, 81, 80))
		},
		_frame: function(f, sheet){
			sheet = sheet || 'breakout'
			return {key: sheet, frame: f}
		},
		icon: function(){
			let frames = []
			for(let i = 1; i < arguments.length; i++){
				frames.push(this._frame(arguments[i], 'icons'))
			}
			let op =  {
				key: arguments[0],
				frames: frames,
				repeat: -1,
				frameRate: 12,
			}	
			
			return op 
		},
		icon_once: function(){
			let frames = []
			for(let i = 1; i < arguments.length; i++){
				frames.push(this._frame(arguments[i], 'icons'))
			}
			let op =  {
				key: arguments[0],
				frames: frames,
				repeat: 1,
				frameRate: 12,
			}	
			
			return op 
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
		},
		fast: function(){
			let frames = []
			for(let i = 1; i < arguments.length; i++){
				frames.push(this._frame(arguments[i]))
			}
			let op =  {
				key: arguments[0],
				frames: frames,
				repeat: 0,
				frameRate: 24,
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
			this.next = data.next 
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
			
			//console.log(this)
		},
		update: function(){
			//console.log(this.game_over)
			if(this.game_over){
				return 
			}
			
			if(this.control && this.control.update){
				this.control.update()
			}
			
			//console.log('update')
			
			
			this.paddle.update()
			this.blocks.forEach(b => b.update && b.update(this.blocks))
			this.blocks = this.blocks.filter(b => !b.dead)
			
			let min_blocks = this.data.bomb || 0 
			if(this.blocks.filter(b => !b.ignore).length <= min_blocks){
				//this.blocks.forEach(b => {b.destroy(); b.dead = true})
				this.creator.next_level.call(this)
			}
			
			this.balls.forEach(ball => {
				//ball.body.setAcceleration(0, 0)
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
			
			//*
			
			
			this.balls = this.balls.filter(b => !b.dead)
			
			if(this.lives.get() < 0){
				this.game_over = true 
				this.creator.game_over.call(this, false)
			}
			//*/
			
		},
		high_scores: high_scores
	}
})()