(function(){
	const TW = 24 
	
	let show_layer = {}
	let grid = {}
	
	window.monolog = {
		init: function(data){
			this.name = data.name 
			this.next = data.next 
		},
		create: function(){
			this.cursors = this.input.keyboard.addKeys({
				up:Phaser.Input.Keyboard.KeyCodes.W,
				down:Phaser.Input.Keyboard.KeyCodes.S,
				left:Phaser.Input.Keyboard.KeyCodes.A,
				right:Phaser.Input.Keyboard.KeyCodes.D
			});
			message.init(this.add)
			message.say('monolog ' + this.name)
			
			this.input.keyboard.on('keydown-E', ()=> {
				message.enter()
			})
			this.cameras.main.flash(6000, 0, 0, 0)
		},
		update: function(){
			message.update(this.cursors)
			if(!message.open){
				console.log(this.next)
				this.scene.start('world', {name:this.next})
			}
		}
	}
	
	window.finale = {
		create: function(){
			
			this.cursors = this.input.keyboard.addKeys({
				up:Phaser.Input.Keyboard.KeyCodes.W,
				down:Phaser.Input.Keyboard.KeyCodes.S,
				left:Phaser.Input.Keyboard.KeyCodes.A,
				right:Phaser.Input.Keyboard.KeyCodes.D
			});
			
			message.init(this.add)
			dialog.init(this.cache)
			
			
			function anim(anims, key, frames, sheet, fr){
				fr = fr || 10
				let fs = []
				frames.forEach(i => fs.push({key: sheet, frame: i}))
				anims.create({
					key: key,
					frames: fs,
					frameRate: fr,
					repeat: -1
				})
			}
			
			this.sprites = [] 
			for(let i = 0; i < 16; i++){
				for(let j = 0; j < 12; j++){
					let floor = 15*13+1
					let wall = 15*14+3
					let s 
					if(j > 3 && j < 6){
						s = floor 
					}else{
						s = Math.random() < .5 ? floor : wall 
					}
					this.sprites.push(
						this.add.sprite(TW*i, TW*j, 'tiles', s)
					)
				}
			}
			
			this.pj = this.add.sprite(0, TW*4.5, 'roxy')
			this.payne = this.add.sprite(0, TW*4.5, 'roxy')
			
			
			
			anim(this.anims, 'pj-push-right', [51, 52, 53], 'roxy')
			anim(this.anims, 'payne-push-right', [69, 70, 71], 'roxy')
			
			anim(this.anims, 'flame', [262, 263, 264, 265, 266, 267], 'breakout', 24)
			anim(this.anims, 'blast', [247, 248, 249, 250], 'breakout', 24)
			//anim(this.anims, 'payne-push-right', [69, 70, 71], 'roxy')
			
			this.payne.anims.play('payne-push-right')
			this.pj.anims.play('pj-push-right')
			
			this.cameras.main.shake(100000, .005, true)
			
			this.input.keyboard.on('keydown-E', ()=> {
				message.enter()
				this.sound.add('beep').play()
			})
			
			this.phase = -1
		},
		update: function(){
			//console.log('phase:', this.phase, 't:', this.t)
			if(this.phase === -1){
				message.update(this.cursors)
				this.phase = 0 
				
			}else if(this.phase === 0){
				this.payne.x += 1 
				//console.log(this.payne.x)
				if(Math.random() < .1) this.sound.add('bump1').play()
				this.pj.x = this.payne.x + 15
				if(this.payne.x > 16*TW){
					this.phase = 1 
				}
				
			}else if(this.phase === 1){
				this.sprites.forEach(s => s.alpha = 0)
				this.payne.destroy()
				this.pj.destroy()
				
				this.cameras.main.shake(0, .005, true)
				
				this.bg = this.add.sprite(0, 0, 'bg_stars')
				this.bg.setOrigin(0, 0)
				this.escape_pod = this.add.container(TW*0, TW*4)
				for(let i = 0; i < 4; i++){
					for(let j = 0; j < 2; j++){
						this.escape_pod.add(
							this.add.sprite(TW*i, TW*j, 'tiles', (17+j)*15 + i)
						)
					}
				}
				this.flame = this.add.sprite(-10, 3, 'breakout')
				this.flame.anims.play('flame')
				this.escape_pod.add(this.flame)
				
				this.phase = 2 
				
			}else if(this.phase === 2){
				this.escape_pod.x += .5 
				if(Math.random() < .3) this.sound.add('hum').play()
				
				if(this.escape_pod.x > 5*TW){
					this.blast = this.add.sprite(0, TW*4, 'breakout')
					this.blast.anims.play('blast')
					this.sound.add('laser').play()
					this.phase = 3
				}
			}else if(this.phase === 3){
				this.escape_pod.x += .5 
				this.blast.x += 2 
				
				if(Math.random() < .3) this.sound.add('hum').play()
				
				if(Math.abs(this.blast.x - this.escape_pod.x) < 12){
					this.sound.add('explode').play()
					this.blast.destroy()
					this.escape_pod.list[0].setFrame(17*15+4)
					this.cameras.main.flash()
					this.flame.destroy()
					
					this.phase = 4 
				}
			}else if(this.phase === 4){
				this.escape_pod.x += .5
				this.escape_pod.y += .75 
				if(Math.random() < .3) this.sound.add('hum').play() 
				
				if(this.escape_pod.y > TW*11){
					this.phase = 5
					message.say('finale')
				}
			}else if(this.phase === 5){
					message.update(this.cursors)
					this.phase = 6 
			
			}else if(this.phase === 6){
				message.update(this.cursors)
				if(!message.open){
					//console.log(this.next)
					this.phase = 7
					this.escape_pod.x = 6*TW 
					this.escape_pod.y = -100
					
					this.paddle = this.add.container(TW*32, TW*9)
					for(let i = 0; i < 4; i++){
						this.paddle.add(
							this.add.sprite(TW*i, 0, 'tiles', 16*15+i)
						)
					}
				}
			}else if(this.phase === 7){
				this.escape_pod.y += 1.5 
				this.paddle.x -= 3.4
				if(Math.random() < .3) this.sound.add('hum').play() 
				if(this.paddle.x < this.escape_pod.x - 8){
					this.sound.add('bump1').play() 
					this.phase = 8
					this.t = 30 
				}
			}else if(this.phase === 8){
				this.t -= 1
				if(this.t < 0){
					message.say('finale 100')
					this.phase = 9 
				}
			}else if(this.phase === 9){
				message.update(this.cursors)
				if(!message.open){
					this.phase = 10 
				}
			}else if(this.phase === 10){
				if(Math.random() < .3) this.sound.add('hum').play() 
				this.escape_pod.x += 3 
				this.paddle.x += 3 
				if(this.paddle.x > 16*TW){
					this.phase = 11
					this.sound.add('explode').play() 
				}
			}else if(this.phase === 11){
				this.sprites.forEach(s => s.alpha = 1)
				this.bg.alpha = 0 
				this.phase = 12 
				this.cameras.main.shake(100000, .005, true)
				this.alien = this.add.sprite(8*TW, 4.5*TW, 'roxy', 11)
				this.t = 0 
			}else if(this.phase === 12){
				this.t += 1
				if(this.t > 90){
					this.cameras.main.shake(1, .005, true)
					this.phase = 13
					message.say('finale 200')
					this.sound.add('explode').play()
				
				}
			}else if(this.phase === 13){
				message.update(this.cursors)
				if(!message.open){
					this.phase = 14
					this.cameras.main.flash()
					this.bg.alpha = 1
					this.alien.alpha = 0 
					let t = this.add.text(7.5*TW, 4.5*TW, 'The End')
					t.setOrigin(.5,.5)
					this.sound.add('explode').play()
				}
			}else if(this.phase = 14){
				
			}
		}
	}
	
	function aim(player, dx, dy, live){
		let bullet = this.scene.physics.add.sprite(this.x, this.y, 'roxy', live ? 33 : 35)
		if(live){
			this.scene.sound.add('laser').play()
			this.scene.sound.add('explode').play()
			bullet.setSize(12, 12)
			bullet.setDepth(10000000)
			let t = Math.atan2(player.y - this.y, player.x - this.x)
			bullet.body.velocity.x = 500 * Math.cos(t)
			bullet.body.velocity.y = 500 * Math.sin(t)
		}else{
			//let size = live ? 12 : 6 
			bullet.setSize(6, 6)
			bullet.setDepth(0)
			let v = live ? 600 : 1000 
			bullet.body.velocity.x = dx * v
			bullet.body.velocity.y = dy * v 
			
		}
		bullet.origin = this 
		this.cooldown = 0 
		
		if(!live){
			this.scene.physics.add.collider(bullet, player.walls, function(bullet, wall){
				bullet.destroy()
			})
			
			this.scene.physics.add.collider(bullet, interactable.sprites, undefined, function(bullet, wall){
				if(wall.name === 'paddle'){
					bullet.destroy()
				}else{
					return false
				}
			})
			
			this.scene.physics.add.overlap(bullet, player, (bullet, player)=>{
				//console.log('aim!')
				if(this.fired <= 0){
					aim.call(this, player, dx, dy, true)
					this.fired = 20 
				}
			})
		}else{
			this.scene.physics.add.overlap(bullet, player, (bullet, player)=>{
				player.kill()
			})
		}
		
		
	}
	
	let recurring = {
		alien_paddle: function(tag){
			//console.log(tag)
			return {
				name: 'paddle',
				move: function(){
					
				},
				init: function(){
					this.setImmovable(true)
					this.setSize(24, 24).setOffset(0, 0)
					this.tag = tag
					this.setFrame(68)
					this.update = ()=>{}
				}
			}
		},
		fire: function(tag){
			return {
				auto: true,
				on: 0,
				activate: function(player, sprite){
					if(this.on <= 0){
						
						let launcher
						interactable.sprites.forEach(s => {
							//console.log(s.interact_id, s.tag)
							if(s.tag === tag){
								
								launcher = s 
							}
						})
						if(launcher){
							launcher.fire(player, launcher)
						}else{
							console.log('Unfound tag:', tag)
						}
						sprite.scene.sound.add('boop').play()
						sprite.scene.sound.add('laser').play()
					}
					this.on = 3 
					sprite.setFrame(215)
				},
				update: function(player, sprite){
					sprite.setFrame(214)
					this.on -= 1 
				}
			}
		},
		launcher: function(tag){
			return {
				name: 'launch',
				tag: tag,
				auto: true,
				activate: function(player, sprite){
					console.log(this.tag)
				},
				fire: function(player, sprite){
					console.log('fire!')
					
					let ball = sprite.scene.physics.add.sprite(sprite.x, sprite.y, 'roxy', 33)
					ball.setDepth(10000)
					//let v = 100
					//ball.body.velocity.set(v, v)
					ball.body.setSize(12, 12)
					ball.body.bounce.x = 1 
					ball.body.bounce.y = 1
					ball.tag = tag 
					ball.alpha = 0 
					
					sprite.scene.physics.add.collider(ball, player.walls, function(b1, b2){
						return true 
					})
					
					sprite.scene.physics.add.collider(ball, interactable.sprites, undefined, function(b1, b2){
						//console.log(b1.t)
						if(b1.t > 20 && b2.type === 'launcher'){
							b1.body.reset()
							sprite.scene.sound.add('hum').play()
						}else if(b2.type === 'launcher'){
							
						}else if(b2.name === 'alien'){
							console.log(b2)
							b2.kill()
							sprite.scene.sound.add('explode').play()
						}else if(b2.name === 'paddle'){
							sprite.scene.sound.add('bump1').play()
							return true
						}
						return false 
					})
					
					return ball 
				},
				update: function(player, sprite){
					if(sprite.ball){
						sprite.ball.t += 1 
					}else{
						
						sprite.ball = this.fire(player, sprite)
						sprite.tag = tag 
						sprite.type = 'launcher'
						sprite.fire = function(player, sprite){
							this.ball.x = this.x 
							this.ball.y = this.y 
							this.ball.body.velocity.set(50, 50)
							this.ball.alpha = 1 
							this.ball.t = 0 
						}
						sprite.setSize(2, 2)
					}
				
				}
			}
		},
		paddle_control: function(tag, v){
			return {
				auto: true,
				activate: function(player, sprite){
					sprite.setFrame(215)
					sprite.scene.sound.add('hum').play()
					let paddle
					interactable.sprites.forEach(s => {
					//	console.log(s.tag)
						if(s.tag === tag){
							paddle = s 
						}
					})
					
					paddle.body.velocity.x = v 
					paddle.update = ()=>{}
					sprite.scene.physics.add.collider(paddle, player.walls, function(b1, b2){
						
						b1.body.reset(TW*Math.round(b1.x/TW), b1.y)
					})
					
				},
			
				update: function(player, sprite){
					sprite.setFrame(214)
					
				}
				
			}
		},
		stand_alien: {
			name: 'alien',
			move: function(player){
				this.dir = 'down'	
				
				if(this.v === undefined){
					this.v = 30
					this.cooldown = 5 
					this.fired = 0 
				}
				
				let dx = player.body.x - this.x
				let dy = player.body.y - this.y
				let dd = 5 
				this.fired -= 1
				//console.log('stand alien')
				if(this.cooldown >= 5){
					
					if(Math.abs(dx) < dd){
						aim.call(this, player, 0, dy/Math.abs(dy))
					}else if(Math.abs(dy) < dd){
						aim.call(this, player, dx/Math.abs(dx), 0)
					}
				}else{
					this.cooldown += 1 
				}
				
			},
		},
		right_alien: {
			name: 'alien',
			move: function(player){
				//console.log(this.body.velocity.x)
				if(this.v === undefined){
					this.v = 30
					this.cooldown = 5 
					this.fired = 0 
					this.y -= 2 
				}
				if(Math.abs(this.body.velocity.x) < .75*Math.abs(this.v)){
					this.v *= -1
				}
				this.body.velocity.x = this.v 
				this.body.velocity.y = 0 
				
				let dx = player.body.x - this.x
				let dy = player.body.y - this.y
				let dd = 5 
				this.fired -= 1
				if(this.cooldown >= 5){
					
					if(Math.abs(dx) < dd){
						aim.call(this, player, 0, dy/Math.abs(dy))
					}else if(Math.abs(dy) < dd){
						aim.call(this, player, dx/Math.abs(dx), 0)
					}
				}else{
					this.cooldown += 1 
				}
			}
		},
		up_alien: {
			name: 'alien',
			move: function(player){
				//console.log(this.body.velocity.x)
				if(this.v === undefined){
					this.v = 30
					this.cooldown = 5 
					this.fired = 0 
				}
				if(Math.abs(this.body.velocity.y) < .75*Math.abs(this.v)){
					this.v *= -1
				}
				this.body.velocity.y = this.v 
				this.body.velocity.x = 0 
				
				let dx = player.body.x - this.x
				let dy = player.body.y - this.y
				let dd = 5 
				this.fired -= 1
				if(this.cooldown >= 5){
					
					if(Math.abs(dx) < dd){
						aim.call(this, player, 0, dy/Math.abs(dy))
					}else if(Math.abs(dy) < dd){
						aim.call(this, player, dx/Math.abs(dx), 0)
					}
				}else{
					this.cooldown += 1 
				}
				
			},
		},
		agent: {
			name: 'agent',
			move: function(player){
				if(!this.first){
					this.setImmovable(true)
					this.y -= 7
					this.first = true 
				}
				
				let dx = player.x - this.x 
				let dy = player.y - this.y 
				
				if(dy < -48){
					this.anims.play('agent-stand-down')
				}else if(Math.abs(dy) > Math.abs(dx)){
					this.anims.play('agent-stand-up')
				}else if(dx < 0){
					this.anims.play('agent-stand-left')
				}else{
					this.anims.play('agent-stand-right')
				}
			}
		},
		paddle: {
			name: 'paddle',
			move: function(player){
				
				
				if(player.y < 72 && player.x > 220){
					//this.x = 260
					this.body.velocity.x = 4*(280 - this.x)
				}else{
					//this.x = 380
					this.body.velocity.x = 4*(380 - this.x)
				}
				
				if(this.x > 340){
					this.paddle.alpha = 0
				}else{
					this.paddle.alpha = 1 
				}
				
				this.paddle.x = this.x - 6
				
			},
			init: function(add){
				this.alpha = 0 
				
				this.setImmovable(true)
				this.paddle = add.container(this.x, this.y)
				this.paddle.add(add.sprite(0, 0, 'tiles', 166))
				this.paddle.add(add.sprite(TW, 0, 'tiles', 167))
				this.paddle.add(add.sprite(0, -TW, 'tiles', 151))
				this.paddle.add(add.sprite(TW, -TW, 'tiles', 152))
				this.paddle.setDepth(10000)
				this.y -= 14
				this.shadow.alpha = 0
				
				message.say('lock paddle')
			}
		},
		payne: {
			name: 'payne',
			move: function(){
				//console.log(this.body.velocity.x)
				if(this.v === undefined){
					this.v = 30
				}
				if(Math.abs(this.body.velocity.x) < .75*Math.abs(this.v)){
					this.v *= -1
				}
				this.body.velocity.x = this.v 
				this.body.velocity.y = 0 
			},
			init: function(){
				this.y -= 7
			}
		}
	}
	
	function next(lvl){
		let flow = [
				'Lvl 1', // Home 
				'Lvl 2', // Get Kidnapped 
				'Lvl 3', // Wake up 
				'new york', // multi ball and red green  blue 
				'Lvl 4', 
				'chicago', //toggle
				'Lvl 5',
				'dream',
				'Lvl 6',
				'zhengzhou', // slide 
				'Lvl 7',
				'london', // acid 
				'Lvl 8',
				'sydney', // lose 
				'Lvl 9',
				'Lvl 10', // Payne 
				'Lvl 11', // Ship 
		]
		for(let i = 0; i < flow.length; i++){
			if(flow[i] === lvl){
				return flow[i+1]
			}
		}
		return undefined 
	}
	
	function reorder(){
		for(let s in grid){
			//grid[s].setDepth(grid[s].layer + grid[s].y/100)
			let z = grid[s].layer
			
			let k = z % 3 
			z = (z - k)/3 
			
			let j = z % 3 
			z = (z - j)/3 
			
			let i = z % 3
			
			let y = grid[s].y 
			
			grid[s].setDepth(10000*i + 100*y + 10*j + k)
		}
	}
	
	let disappearing = {
		groups: [],
		merged: false,
		neighbors: function(x, y){
			return [
			{x: x+TW, 	y: y},
			{x: x-TW, 	y: y},
			{x: x, 		y: y+TW},
			{x: x, 		y: y-TW}
			]
			
		},
		register: function(sprite){
			for(let i = 0; i < this.groups.length; i++){
				if(this.check_residents(this.groups[i].residents, sprite.x, sprite.y)){
					this.groups[i].residents.push(sprite)
					sprite.dis_group = this.groups[i] 
					return 
				}
			}
			
			this.groups.push({
				touching: 0,
				alpha: 1,
				residents: [sprite] 
			})
			
			sprite.dis_group = this.groups[this.groups.length - 1] 
	
					
		},
		check_residents: function(residents, x, y){
			let n = this.neighbors(x, y)
			for(let i = 0; i < residents.length; i++){
				for(let j = 0; j < n.length; j++){
					if(Math.abs(residents[i].x - n[j].x) < 1 && 
					   Math.abs(residents[i].y - n[j].y) < 1){
						return true 
					}
				}
			}
			return false 
		},
		merge: function(){
			for(let i = 0; i < this.groups.length; i++){
				for(let j = 0; j < this.groups.length; j++){
					if(i !== j){
						let g1 = this.groups[i]
						let g2 = this.groups[j]
						let r1 = g1.residents
						let r2 = g2.residents
						if(g1.subset || g2.subset){
							continue
						}
						for(let k = 0; k < r2.length; k++){
							if(this.check_residents(r1, r2[k].x, r2[k].y)){
								g1.residents = r1.concat(r2)
								g2.subset = true 
								r1.forEach(r => r.dis_group = g1)
								continue
							}
						}
					}
				}
			}
			
			this.merged = true 
			
			let groups = []
			for(let i = this.groups.length - 1; i >=0; i--){
				if(this.groups[i].subset){
					this.merged = false 
				}else{
					groups.push(this.groups[i])
				}
			}
			this.groups = groups
			
		},
		update: function(){
			if(!this.merged) this.merge()
				
			for(let i = 0; i < this.groups.length; i++){
				let g = this.groups[i]
				g.residents.forEach(s => s.alpha = g.alpha)
				g.alpha += g.touching > 0 ? -.05 : .05
				g.alpha = Phaser.Math.Clamp(g.alpha, 0, 1)
				
				g.touching -= 1 
				
			}
			
		}
			
	}
	
	function gaming_kid(player){
		if(!this.first){
			this.first = true 
			this.setImmovable(true)
			this.y -= 6 
			this.anims.play(this.name+'-stand-up')
			if(Math.random() > .5){
				this.x += 6
			}else{
				this.x -= 6
			}
		}
		
		let dx = player.x - this.x 
		let dy = player.y - this.y 
		
		if(Math.abs(dx) < 6 && Math.abs(dy) < 24){
			this.anims.play(this.name+'-stand-down')
		}else{
			this.anims.play(this.name+'-stand-up')
		}

		
	}
	
	let message = {
		open: false,
		selected: 0,
		pressed: false,
		icons: {
			roxy: 0,
			sally: 1,
			kathrine: 2,
			wesley: 3,
			pj: 4,
			alien: 5,
			glenn: 6,
			dweeby: 7,
			agent: 8,
			payne: 10,
			mystery: 11, 
			heart: 12, 
			mom: 13,
			dark: 14, 
			//quarter: 18,
			bed: 18,
			mailbox: 19,
			paddle: 20,
			string: 21,
			gloves: 22,
			quarterstring: 23,
			notes: 24,
			tutorial: 26,
			tv: 27,
			couch: 28,
			arcade: 29,
			door: 30,
			quarter: 31,
			upgrade: 32,
			gem: 33,
			id: 34,
			artifact: 35,
			grav1: 37,
			grav2: 38,
			grav3: 39,
			grav4: 40,
			grav5: 45, 
			grav6: 46,
			grav7: 47,
			grav8: 48,
			grav9: 49,
			acid1: 41,
			acid2: 42,
			acid3: 43,
			acid4: 44,
			arrow1: 50,
			arrow2: 51,
			arrow3: 52,
			arrow4: 53,
			timer1: 54,
			timer2: 55,
			timer3: 56,
			timer4: 57,
			timer5: 58,
			timer6: 59,
			timer7: 60,
			timer8: 61,
			redblock: 63,
			blueblock: 64
			
		},
		chat: function(what){
			return function(player, sprite){
				message.say(what, player, sprite)
			}
		},
		init: function(add){
			let x0 = 1*TW 
			let y0 = 1*TW 
			
			let xf = 14*TW 
			let yf = 8*TW 
			
			let w = (xf - x0 - TW)/TW
			let h = (yf - y0 - TW)/TW 
			
			this.box = []
			this.box.push(add.sprite(x0, y0, 'tiles', 41))
			this.box.push(add.sprite(xf, y0, 'tiles', 41))
			this.box.push(add.sprite(xf, yf, 'tiles', 41))
			this.box.push(add.sprite(x0, yf, 'tiles', 41))
			this.box.forEach((s, i) => s.angle = 90*i)
			
			let top = add.sprite(TW*7.5, y0, 'tiles', 42)
			top.scaleX = w
			this.box.push(top)
			
			let bott = add.sprite(TW*7.5, yf, 'tiles', 42)
			bott.scaleX = w
			bott.scaleY = -1
			this.box.push(bott)
			
			let left = add.sprite(x0, 4.5*TW, 'tiles', 44)
			left.scaleY = h
			this.box.push(left)
			
			let right = add.sprite(xf, 4.5*TW, 'tiles', 44)
			right.scaleY = h
			right.scaleX = -1
			this.box.push(right)
			
			let center = add.sprite(TW*7.5, TW*4.5, 'tiles', 43)
			center.scaleX = w
			center.scaleY = h
			this.box.push(center)
			
			this.text = add.text(x0, y0 + 2.25*TW, 'hello world!', {
				fontSize: '14px',
				align: 'left',
				wordWrap: {
					width: (w+1)*TW
				}
			})
			this.box.push(this.text)
		
			this.title = add.text(x0 + 2.5*TW, y0 + .5*TW, 'Hello', {
				fontSize: '18px',
				fontStile: 'strong',
				align: 'left',
				fill: '#ffffff'
				
			})
			this.box.push(this.title)
			
			this.icon = add.sprite(x0 + TW, y0 + TW, 'icons')
			this.box.push(this.icon)
			
			this.pointer = add.sprite(x0 + .5*TW, 0, 'tiles', 6)
			this.box.push(this.pointer)
			
			this.options = [] 
			for(let i = 0; i < 4; i++){
				let o = add.text(x0 + TW, y0 + 2.25*TW, 'hello world!', {
					fontSize: '14px',
					align: 'left',
					wordWrap: {
						width: w*TW
					},
					fill: '#9badb7'
				})
				this.options.push(o)
				this.box.push(o)
			}
			
			this.hint = add.text(xf, yf, 'Press E to continue.', {
				fontSize: '12px',
				fontStile: 'strong',
				align: 'right',
				fill: '#595652'
				
			})
			this.box.push(this.hint)
			this.hint.setOrigin(1,1)
			
			
			this.box.forEach(s => s.setDepth(30000))
			this.box.forEach(s => s.setScrollFactor(0))
			
			this.text.setDepth(300001)
			this.hint.setDepth(300001)
			this.icon.setDepth(300001)
			this.title.setDepth(300001)
			this.pointer.setDepth(300001)
			this.options.forEach(o => o.setDepth(300001))
			
			
		},
		update: function(cursors){
			if(this.open){
				this.box.forEach(s => s.alpha = 1)
				
				
				this.options.forEach(s => s.setColor('#9badb7'))
				let s = this.options[this.selected]
				s.setColor('#5fcde4')
				this.pointer.y = s.getCenter().y
				
				if(!this.pressed){
					if(cursors.down.isDown &&
					this.selected + 1 < this.options.length &&
					this.options[this.selected + 1].text){
						this.selected += 1 
						
						//this.sound.add('boop').play()
						
					}
					
					if(cursors.up.isDown && this.selected > 0){
						this.selected -= 1
						
						//this.sound.add('boop').play()
					}
				}
				
				this.pressed = cursors.down.isDown || cursors.up.isDown
				
			}else{
				this.box.forEach(s => s.alpha = 0)
			}
			
			
		},
		say: function(block, player, speaker){
			
			let m = dialog.say(block)

			//console.log(block)
			this.player = player || this.player 
			this.speaker = speaker || this.speaker 
			
			//console.log('say:', block, 'text:', m.text)
			//console.log(m)
			if(m.act){
				if(interactable.actions['event'][m.act]){
					interactable.actions['event'][m.act](this.player, this.speaker)
				}else{
					console.log('Unknown action:', m.act)
				}
			}
			
			if(!m.text){
				this.open = false 
				return 
			}
			
			this.open = true 
			this.text.text = m.text 
			this.title.text = m.title
			this.icon.setFrame(this.icons[m.icon])
			
			
			
			if(m.options.length === 0){
				m.options.push({text: 'Ok', go:'nothing'})
			}
			
			this.selected = 0 
			
			let y = this.text.getBottomLeft().y + .5*TW
			this.options.forEach((o, i) => {
			//m.options.forEach((o, i) => {
				o.y = y 
				o.text = m.options[i] ? m.options[i].text : ''
				o.go = m.options[i] ? m.options[i].go : undefined
				y = o.getBottomLeft().y
			})
			
		},
		enter: function(){
			let go = (this.options[this.selected].go)
			
			if(go === 'nothing'){
				this.open = false 
				return
			}else{
				return this.say(go)
			}
		}
	}
		
	let interactable = {
		sprites: [],
		threshold: 24,
		active: false, 
		action_key: 'E',
		init: function(add){
		
			this.sprites = []
			npc.npcs = [] 
			this.active = add.sprite(0, 0, 'tiles', 22) 
			this.active.setDepth(20000)
			let text = add.text(0, 0, this.action_key, { 
				color: '#ffffff', 
				align: 'center',
				fontSize: 12
				})
			text.setDepth(20001)
			text.setOrigin(.5, .7)
			this.active.text = text 
			
			for(let i = 456; i <= 624; i+= 24){
				interactable.actions['Lvl 1'][i + ',96'] = function(player, sprite){
					message.say('arcade on', player, sprite)
					message.say('arcade play', player, sprite)
				}
				interactable.actions['Lvl 1'][i + ',48'] = function(player, sprite){
					message.say('arcade on', player, sprite)
					message.say('arcade play', player, sprite)
				}
			}
			
			console.log('sprites:' , this.sprites.length)
			
			window.active = this.active 
		},			
		register: function(sprite){
			if(!sprite.interact_id){
				sprite.interact_id = sprite.x + ',' + sprite.y 
			}
			this.sprites.push(sprite)
			//console.log(this.sprites.length)
		},

		actions: {
			'event': {
				'pickup quarter': function(player, sprite){
					inventory.add('quarter')
					
					sprite.dead = true 
					sprite.alpha = 0 
				},
				'add quarter': function(player, sprite){
					inventory.add('quarter')
				},
				'sit': function(player, sprite){
					player.x = sprite.x -6
					player.y = sprite.y
					player.sitting = true 
					player.body.velocity.x = 0
					player.body.velocity.y = 0
				}, 
				'string': function(player, sprite){
					inventory.add('string')
				},
				'check trick': function(player, sprite){
					if(inventory.has('quarter') && inventory.has('string')){
						message.say('glenn trick yes')
					}else{
						message.say('glenn trick no')
					}
				},
				'test has quarter': function(player, sprite){
					if(inventory.has('quarter')){
						message.say('has quarter')
					}else{
						message.say('lost quarter')
					}
					
					if(inventory.has('quarter_string')){
						message.say('has quarter string')
					}else{
						message.say('lost quarter string')
					}
					message.say('arcade play')
				},
				'get quarter string': function(player, sprite){
					inventory.del('quarter')
					inventory.del('string')
					inventory.add('quarter_string')
				},
				'play breakout': function(player, sprite){
					sprite.scene.scene.pause('world')
					sprite.scene.scene.launch('breakout', {
						style: 'tv',
						lvl: 0,
					})
				},
				'play arcade with quarter': function(player, sprite){
					//console.log('ding')
					inventory.del('quarter')
					interactable.actions['event']['play arcade'](player, sprite)
				},
				'play arcade': function(player, sprite){
					//sprite.scene.scene.pause('world')
					sprite.scene.scene.start('breakout', {
						style: 'arcade',
						lvl: 1,
					})
				},
				'sleep': function(player, sprite){
					player.bed = sprite 
				},
				'dream': function(player, sprite){
					player.bed = sprite 
					sprite.scene.cameras.main.fade(1000, 0, 0, 0, false, function(cam, r){
						if(r === 1){
							cam.scene.scene.start('breakout', {
								style: 'dream',
								lvl: 'd'
							})
						}
					})
				},
				'goto lvl 10': function(player, sprite){
					sprite.scene.scene.start('world', {
						name: 'Lvl 10'
					})
				},
				'get upgrade': function(player, sprite){
					inventory.add('upgrade')
				},
				'trade upgrade': function(player, sprite){
					inventory.add('upgrade')
					for(let i = 0; i < inventory.gem_max; i++){
						inventory.del('gems')
					}
				},
				'start mission': function(player, sprite){
					console.log(player.scene.name)
					let data = {
						style: 'real',
						lvl: 0,
						name: next(player.scene.name),
						next: next(next(player.scene.name))
						
					}
					
					let keys = ['lives', 'lasers', 'length', 'bomb']
					keys.forEach(k => {
						data[k] = upgrades.get(k)
					})
					sprite.scene.scene.start('breakout', data)
				},
				'upgrade paddle': function(player, sprite){
					upgrades.open = true 
				},
				'get kidnapped': function(player, sprite){
					//sprite.game.cameras.main.flash()
					sprite.scene.scene.start('monolog', {
						name: 'ouch',
						next: 'Lvl 3'
						
						})
				},
				'activate artifact': function(player, sprite){
					sprite.scene.scene.start('world', {
						name: 'Lvl 11'
					})
				},
				'finale': function(player, sprite){
					sprite.scene.scene.start('finale')
				}
			},
			'Lvl 11': {
				'paddle': {
					auto: true,
					activate: function(){}
				},
				'pj': message.chat('hello pj'), 
				'408,264': recurring.paddle_control('lower_paddle', 30),
				'456,192': recurring.paddle_control('middle_paddle', 30),
				'432,192': recurring.paddle_control('middle_paddle', -30),
				'576,216': recurring.paddle_control('right_paddle', -90),
				'600,216': recurring.paddle_control('right_paddle', 90),
				'576,192': recurring.fire('right'),
				'192,48': recurring.fire('left'),
				'240,48': recurring.launcher('left'),
				'648,144': recurring.launcher('right'),
				'504,24': recurring.launcher('a'),
				'528,24': recurring.launcher('b'),
				'552,24': recurring.launcher('c'),
				'576,24': recurring.launcher('d'),
				'600,24': recurring.launcher('e'),
				'624,24': recurring.launcher('f'),
				'648,24': recurring.launcher('g'),
				'672,24': recurring.launcher('h'),
				'456,48': recurring.launcher('catcher left'),
			},
			
			'Lvl 10': {
				'roxy': message.chat('roxy god speed'),
				'312,264': message.chat('artifact')
			},
			'Lvl 9': {
				'payne': message.chat('payne lost')
			},
			'Lvl 8': {
				'paddle':  message.chat('hello paddle'),
				'payne': message.chat('payne attack'),
			},
			'Lvl 7': {
				'paddle':  message.chat('hello paddle'),
				'payne': message.chat('payne acid'),
				'agent': message.chat('agent final'),
				'dweeby': function(player, sprite){
					if(inventory.count('gems') >= 10){
						message.say('dweeby with gems', player, sprite)
					}else{
						message.say('dweeby without gems', player, sprite)
					}
				},
				'24,48': message.chat('roxy bed'),
				'96,48': message.chat('kathrine bed'),
				'168,48': message.chat('sally bed'),
			},
			'Lvl 6': {
				'paddle':  message.chat('hello paddle'),
				'payne': message.chat('payne nightmare'),
				'agent': message.chat('agent nightmare'),
				'wesley': message.chat('wesley nightmare'),
				'336,192': message.chat('desk papers')
			},
			'Lvl 5': {
				'paddle':  message.chat('hello paddle'),
				'agent':  message.chat('agent sleep'),
				'dweeby': function(player, sprite){
					if(inventory.count('gems') >= 10){
						message.say('dweeby with gems', player, sprite)
					}else{
						message.say('dweeby without gems', player, sprite)
					}
				},
				'24,48': message.chat('roxy dream'),
				'336,192': message.chat('desk papers')
			},
			'Lvl 4': {
				'24,48': message.chat('roxy bed'),
				'96,48': message.chat('kathrine bed'),
				'168,48': message.chat('sally bed'),
				'sally':  message.chat('sally cant sleep'),
				'paddle':  message.chat('hello paddle'),
				'agent':  message.chat('agent hello again'),
				'payne':  message.chat('payne hello again'),
				'kathrine':  message.chat('kathrine chat'),
				'wesley':  message.chat('kathrine chat'),
				'dweeby': function(player, sprite){
					if(inventory.count('gems') >= 10){
						message.say('dweeby with gems', player, sprite)
					}else{
						message.say('dweeby without gems', player, sprite)
					}
				}
			},
			'Lvl 3': {
				'24,48': function(player, sprite){
					message.say('roxy bed', player, sprite)
				},
				'96,48': function(player, sprite){
					message.say('kathrine bed', player, sprite)
				},
				'168,48': function(player, sprite){
					message.say('sally bed', player, sprite)
				},
				'agent': function(player, sprite){
					message.say('agent hello again', player, sprite)
				},
				'paddle': function(player, sprite){
					message.say('hello paddle', player, sprite)
				},
				'payne': function(player, sprite){
					message.say('hello payne')
				},
				'kathrine': function(player, sprite){
					message.say('hello kathrine', player, sprite)
				},
				'wesley': function(player, sprite){
					message.say('hello wesley', player, sprite)
				},
				'dweeby': function(player, sprite){
					message.say('hello dweeby', player, sprite)
				},
				'sally': function(player, sprite){
					message.say('hello sally', player, sprite)
				}
			},
			'Lvl 2': {
				'agent': function(player, sprite){
					message.say('agent hello', player, sprite)
				}
			},
			'Lvl 1': {
				'480,192': function(player, quarter){
					message.say('street quarter', player, quarter)
					
				},
				'120,168': function(player, sprite){
					message.say('mailbox everyteen', player, sprite)
				},
				'336,168': function(player, sprite){
					message.say('mailbox close', player, sprite)
				},
				'120,72': function(player, sprite){
					
					message.say('couch', player, sprite)
				},
				'144,72': function(player, sprite){
					message.say('tv on', player, sprite)
				},
				'mom': function(player, sprite){
					message.say('hi mom', player, sprite)
				},
				'glenn': function(player, sprite){
					message.say('hello glenn', player, sprite)
				},
				

				
			}
		},
		closest: function(player){
			let op = this.sprites[0]
			let d = Phaser.Math.Distance.Squared(op.x, op.y, player.x, player.y)
			for(let i = 0; i < this.sprites.length; i++){
				let d2 = Phaser.Math.Distance.Squared(this.sprites[i].x, this.sprites[i].y, player.x, player.y)
				if(d2 < d && !this.sprites[i].dead){
					d = d2 
					op = this.sprites[i]
				}
			}
			return op 
		},
		update: function(player, lvl){
			if(this.actions[lvl]){
				this.sprites.forEach(s => {
					if(this.actions[lvl][s.interact_id] && this.actions[lvl][s.interact_id].auto && this.actions[lvl][s.interact_id].update){
						
						this.actions[lvl][s.interact_id].update(player, s) 
						
					}						
				})
			}
				
			let c = this.closest(player)
			
			let auto = this.actions[lvl] && this.actions[lvl][c.interact_id] && this.actions[lvl][c.interact_id].auto 
			//if(auto) return 
			
			if(!player.sitting && !player.bed && Phaser.Math.Distance.Between(player.x, player.y, c.x, c.y) < this.threshold){
				if(auto){
					let p = player.body 
					let dy = (p.y - c.y)
					if(-12 < dy && dy < 4){
						this.actions[lvl][c.interact_id].activate(player, c)
					}
				}else{
					this.active.alpha = 1 
					this.active.text.alpha = 1 
					this.active.x = c.x 
					this.active.y = c.y - TW
					this.active.text.x = this.active.x
					this.active.text.y = this.active.y
				}
			}else{
				this.active.alpha = 0 
				this.active.text.alpha = 0 
			}
		},
		activate: function(lvl, player){
			//console.log('activate:', player, lvl)
			let c = this.closest(player)
			if(this.active.alpha === 0){
				return 
			}
			
			if(this.actions[lvl][c.interact_id]){
				this.actions[lvl][c.interact_id](player, c)
			}else{
				console.log('Unknown Interactable: ', lvl, c.interact_id)
			}
		}
	}
	
	window.inventory = {
		items: [],
		selected: 0,
		gem_max: 10,
		things: {
			gloves:{
				name: 'Fingerless Gloves',
				description: "These gloves don't have fingers, and they're pretty damn cool.",
				icon: 'gloves'
			},
			quarter: {
				name: 'Quarter',
				description: "Worth 25 cents.",
				icon: 'quarter'
			},
			quarter_string: {
				name: 'Quarter on a String',
				description: 'Given to you by your neighbor.',
				icon: 'quarterstring'
			}, 
			string: {
				name: 'Sring',
				description: "A piece of string found in your mailbox. Why would someone leave string in your mailbox?",
				icon: 'string'
			},
			upgrade: {
				name: 'Upgrade',
				description: 'Use it to upgade your P.A.D.D.L.E',
				icon: 'upgrade'
			},
			gems: {
				name:  'Mysterious Blue Gems',
				description: 'These gems are dropped by the blue blocks. Trade them with Dweeby Kid for a P.A.D.D.L.E. upgrade.',
				icon: 'gem'
			},
			id: {
				name: 'Government Issued ID Card',
				description: 'This ID card allows you to access anything in the base.',
				icon: 'id'
			}
		},
		open: false,
		init: function(add){
			this.initialized = true 
			
			let x0 = 1*TW 
			let y0 = 1*TW 
			
			let xf = 14*TW 
			let yf = 8*TW 
			
			let w = (xf - x0 - TW)/TW
			let h = (yf - y0 - TW)/TW 
			
			this.box = []
			this.box.push(add.sprite(x0, y0, 'tiles', 41))
			this.box.push(add.sprite(xf, y0, 'tiles', 41))
			this.box.push(add.sprite(xf, yf, 'tiles', 41))
			this.box.push(add.sprite(x0, yf, 'tiles', 41))
			this.box.forEach((s, i) => s.angle = 90*i)
			
			let top = add.sprite(TW*7.5, y0, 'tiles', 42)
			top.scaleX = w
			this.box.push(top)
			
			let bott = add.sprite(TW*7.5, yf, 'tiles', 42)
			bott.scaleX = w
			bott.scaleY = -1
			this.box.push(bott)
			
			let left = add.sprite(x0, 4.5*TW, 'tiles', 44)
			left.scaleY = h
			this.box.push(left)
			
			let right = add.sprite(xf, 4.5*TW, 'tiles', 44)
			right.scaleY = h
			right.scaleX = -1
			this.box.push(right)
			
			let center = add.sprite(TW*7.5, TW*4.5, 'tiles', 43)
			center.scaleX = w
			center.scaleY = h
			this.box.push(center)
			
		
			
			this.pointer = add.sprite(x0 + .5*TW, 0, 'icons', 15)
			this.box.push(this.pointer)
			
			this.icons = [] 
			let cols = 6
			let rows = 1 
			let x1 = 1 * TW 
			let y1 = 1 * TW 
			let sx = 2.2 * TW 
			let sy = 2 * TW 
			
			for(let i = 0; i < cols*rows; i++){
				let x = i%cols
				let y = Math.floor(i/cols)
				let o = add.sprite(x0 + x1 + sx*x, y0 + y1 + sy*y, 'icons', 9)
				this.icons.push(o)
				this.box.push(o)
			}
			
			let y = this.icons[this.icons.length - 1].getBottomLeft().y 
			let dy = .125*TW 
	
			this.title = add.text(x0, y + dy, 'Title', {
				fontSize: '18px',
				fontStile: 'strong',
				align: 'left',
				fill: '#ffffff'
				
			})
			this.box.push(this.title)
			
			y = this.title.getBottomLeft().y 
			
			this.qnt = add.text(x0, y + dy, 'Quantity: 0', {
				fontSize: '14px',
				align: 'left',
				wordWrap: {
					width: w*TW
				}
			})
			this.box.push(this.qnt)
			
			y = this.qnt.getBottomLeft().y 
			
			this.text = add.text(x0, y + dy, 'description!', {
				fontSize: '14px',
				align: 'left',
				wordWrap: {
					width: w*TW
				}
			})
			this.box.push(this.text)
			
		
		
			
			
			
			this.box.forEach(s => s.setDepth(30000))
			this.box.forEach(s => s.setScrollFactor(0))
			
			this.text.setDepth(300001)
			//this.icon.setDepth(300001)
			this.title.setDepth(300001)
			this.pointer.setDepth(300002)
			this.icons.forEach(o => o.setDepth(300001))
			
			this.items.forEach((item, index) => {
				this.icons[index].setFrame(message.icons[item.icon])
			})
			
	
		},
		add: function(s){
			if(!this.initialized){
				return
			}
			let item = this.things[s]
			if(!item){
				console.log('Unknown item:', s)
				return 
			}
			
			let index = -1 
			this.items.forEach((x, i) => {
				if(index < 0 && x.name === item.name){
					index = i  
				}
			})
			if(index === -1){
				item.qnt = 1
				index = this.items.length 
				this.items.push(item)
				this.icons[index].setFrame(message.icons[item.icon])
				
			}else{
				this.items[index].qnt += 1 
			}
			this.selected = index 
		},
		del: function(s){
			let item = this.things[s]
			if(!item){
				console.log('Unknown item:', s)
				return 
			}
			
			for(let i = 0; i < this.items.length; i++){
				if(this.items[i].name === item.name){
					this.items[i].qnt -= 1 
				}
			}
			
			this.purge()
		},
		has: function(s){
			let item = this.things[s] 
			if(!item){
				console.log('Unknown item:', s)
				return 
			}
			for(let i = 0; i < this.items.length; i++){
				if(this.items[i].name === item.name){
					return true 
				}
			}
			return false 
		},
		count: function(s){
			let item = this.things[s] 
			if(!item){
				console.log('Unknown item:', s)
				return 
			}
			
			for(let i = 0; i < this.items.length; i++){
				if(this.items[i].name === item.name){
					return this.items[i].qnt
				}
			}
			return 0 
		},
		purge: function(){
			
			this.items = this.items.filter(item => item.qnt > 0) 
			this.icons.forEach((icon, i) => {
				if(!this.items[i]) icon.setFrame(9)
			})
		},
		update: function(cursors){
			if(this.open){
				this.box.forEach(s => s.alpha = 1)
				
				let item = this.items[this.selected]
				let icon = this.icons[this.selected]
				this.pointer.x = icon.x 
				this.pointer.y = icon.y 
				
				if(item){
					this.title.text = item.name
					this.qnt.text = 'Quantity: ' + item.qnt 
					this.text.text = item.description 
				}else{
					this.title.text = ''
					this.qnt.text = ''
					this.text.text = ''
				}
				
				if(!this.down && cursors.right.isDown && this.selected < this.icons.length-1){
					this.selected += 1 
				}
				if(!this.down && cursors.left.isDown && this.selected > 0 ){
					this.selected -= 1 
				}
				
				this.down = cursors.left.isDown || cursors.right.isDown
				
			
			}else{
				this.box.forEach(s => s.alpha = 0)
			}
		}
	}
	
	let upgrades = {
		upgrades: [
			{
				id: 'lives',
				name: 'Extra Orbs',
				value: 2,
				description: 'How many extra orbs you have. When you run out, you lose.',
				max: 4
			},{
				id: 'lasers',
				name: 'Lasers',
				value: 0,
				description: 'Fire lasers with the E key.',
				max: 6
			},{
				id: 'length',
				name: 'Length',
				value: 0,
				description: 'Upgrade to make your P.A.D.D.L.E longer.',
				max: 6
			},{
				id: 'bomb',
				name: 'Super Bomb',
				value: 0,
				description: 'Destroy the last few blocks in a powerful explosion. Upgrade to destroy more blocks.',
				max: 4
			}
		],
		index: 0,
		open: !true,
		down: false,
		get: function(id){
			for(let i = 0; i < this.upgrades.length; i++){
				let up = this.upgrades[i]
				if(up.id === id){
					return up.value 
				}
			}
			return undefined 
		},
		init: function(add){
			let x0 = 1*TW 
			let y0 = 1*TW 
			
			let xf = 14*TW 
			let yf = 8*TW 
			
			let w = (xf - x0 - TW)/TW
			let h = (yf - y0 - TW)/TW 
			
			this.box = []
			this.box.push(add.sprite(x0, y0, 'tiles', 41))
			this.box.push(add.sprite(xf, y0, 'tiles', 41))
			this.box.push(add.sprite(xf, yf, 'tiles', 41))
			this.box.push(add.sprite(x0, yf, 'tiles', 41))
			this.box.forEach((s, i) => s.angle = 90*i)
			
			let top = add.sprite(TW*7.5, y0, 'tiles', 42)
			top.scaleX = w
			this.box.push(top)
			
			let bott = add.sprite(TW*7.5, yf, 'tiles', 42)
			bott.scaleX = w
			bott.scaleY = -1
			this.box.push(bott)
			
			let left = add.sprite(x0, 4.5*TW, 'tiles', 44)
			left.scaleY = h
			this.box.push(left)
			
			let right = add.sprite(xf, 4.5*TW, 'tiles', 44)
			right.scaleY = h
			right.scaleX = -1
			this.box.push(right)
			
			let center = add.sprite(TW*7.5, TW*4.5, 'tiles', 43)
			center.scaleX = w
			center.scaleY = h
			this.box.push(center)
			
			
		
			
			this.pointer = add.sprite(x0 + .5*TW, 0, 'tiles', 6)
			this.pointer.setOrigin(1, .5)
			this.box.push(this.pointer)
			
			let cx = x0 + TW*w/2
			let y 
			
			this.upgrades.forEach((up, i) => {
				y = y0 + .75*i*TW + TW/2
				up.text = add.text(cx, y, up.name, {
					align: 'right'
				})
				up.text.setOrigin(1, .5)
				up.y = y 
				up.x = cx - up.text.getBounds().width 
				
				this.box.push(up.text)
				
				up.ticks = []
				for(let j = 0; j < up.max; j++){
					let tick = add.sprite(cx + 12 + j*16, y, 'breakout', 90)
					this.box.push(tick)
					up.ticks.push(tick)
				} 
			})
			
			
			this.description = add.text(x0 + TW, y + TW, 'Description', {
				fontSize: '14px',
				align: 'left',
				wordWrap: {
					width: w*TW
				}
			})
			//this.description.setOrigin(.5, 0)
			this.box.push(this.description)
			
			let info = add.text(x0+16, y0 + TW*h + 12, 'Press E to upgrade. Press Q to quit.', {
				fontSize: '14px',
				align: 'center',
				fill: '#595652',
				wordWrap: {
					width: (w+1)*TW
				}
			})
			this.box.push(info)
			
			let up = add.sprite(x0 + TW*w + 6, y0 + 12, 'breakout', 91)
			up.setOrigin(1, 1)
			this.box.push(up)
			
			
			this.count = add.text(up.x-4, up.y +2, 'x0')
			this.count.setOrigin(0, 1)
			this.box.push(this.count)
			
			this.box.forEach(s => s.setDepth(30000))
			this.box.forEach(s => s.setScrollFactor(0))
			
			//this.text.setDepth(300001)
			//this.icon.setDepth(300001)
			//this.title.setDepth(300001)
			this.pointer.setDepth(300002)
			//this.icons.forEach(o => o.setDepth(300001))
		},
		enter: function(player){
			if(inventory.has('upgrade')){
				let up = this.upgrades[this.index]
				if(up.value < up.max){
					up.value += 1 
					inventory.del('upgrade')
				}
			}
		},
		update: function(cursors){
			this.box.forEach(b => b.alpha = this.open ? 1 : 0)
			if(this.open){
				this.upgrades.forEach(up => {
					up.ticks.forEach((tick, i) => {
						tick.setFrame(i < up.value ? 91 : 90)
					})
				})
				
				let active = this.upgrades[this.index]
				this.pointer.x = active.x 
				this.pointer.y = active.y 
				this.description.text = active.description
				this.count.text = 'x' + inventory.count('upgrade')
				
				
				if(!this.down && cursors.down.isDown && this.index < this.upgrades.length - 1){
					this.index += 1
				}
				if(!this.down && cursors.up.isDown && this.index > 0){
					this.index -= 1
				}
				
				this.down = cursors.up.isDown || cursors.down.isDown
			}
		}
	}
	
	let npc = {
		data: {
			'Lvl 11': {
				'48,168': recurring.up_alien,
				'144,144': recurring.up_alien,
				'288,48': recurring.up_alien,
				'336,48': recurring.up_alien,
				'384,48': recurring.up_alien,
				'432,48': recurring.up_alien,
				'336,240': recurring.alien_paddle('lower_paddle'),
				'504,192': recurring.alien_paddle('middle_paddle'),
				'528,48': recurring.alien_paddle('right_paddle'),
				//'264,168': recurring.stand_alien,
				'288,168': recurring.right_alien,
				'552,120': recurring.right_alien,
				'480,288': {
					name: 'pj',
					move: function(){
						this.body.velocity.x = -1 
						this.x = this.x0 
					},
					init: function(){
						this.y -= 3
						this.x0 = this.x 
						this.body.setImmovable(true)
						
					}
				}
				
			},
			'Lvl 10': {
				'192,216': {
					name: 'roxy',
					move: ()=>{},
					init: function(){
						this.y -= 10
						this.x += 2
						this.body.setImmovable(true)
						this.dir = 'right'
				}
				}
			},
			'Lvl 9': {
				'216,216': {
					name: 'payne',
					move: ()=>{},
					init: function(){
						this.y -= 10
						this.x += 2
						this.body.setImmovable(true)
						this.dir = 'up'
					}
				}
			},
			'Lvl 8': {
				'288,48': recurring.paddle,
				'192,120': {
					name: 'agent',
					move: recurring.payne.move ,
					init: function(){
						this.v = -60
					}
				},
				'288,72': {
					name: 'payne',
					move: ()=>{},
					init: function(){
						this.y -= 10
						this.x += 2
						this.body.setImmovable(true)
						this.dir = 'left'
					}
				}
			},
			'Lvl 7': {
				'288,48': recurring.paddle,
				'288,168': recurring.payne,
				'72,168': {
					name: 'dweeby',
					move: gaming_kid
				},
				'216,216': recurring.agent,
			},
			'Lvl 6': {
				'384,48': recurring.paddle,
				'72,168': {
					name: 'wesley',
					move: gaming_kid
				},
				'192,216': {
					name: 'payne',
					move: ()=>{},
					init: function(){
						this.y -= 10
						this.x += 2
						this.body.setImmovable(true)
						this.dir = 'right'
					}
				},
				'216,216': {
					name: 'agent',
					move: ()=>{},
					init: function(){
						this.y -= 10
						this.x -= 0
						this.body.setImmovable(true)
						this.dir = 'left'
					}
				}
			},
			'Lvl 5': {
				'264,48': recurring.paddle,
				'72,168': {
					name: 'dweeby',
					move: gaming_kid
				},
				'216,216': recurring.agent 
			},
			'Lvl 4': {
				'264,48': recurring.paddle,
				'288,168': recurring.payne,
				'72,168': {
					name: 'dweeby',
					move: gaming_kid
				},
				'216,216': recurring.agent,
				'192,48': {
					name: 'sally',
					move: recurring.payne.move 
				},
				'72,216': {
					name: 'wesley',
					move: ()=>{},
					init: function(){
						this.y -= 10
						this.x += 5
						this.body.setImmovable(true)
						this.dir = 'right'
					}
				},
				'96,216': {
					name: 'kathrine',
					move: ()=>{},
					init: function(){
						this.y -= 10
						this.x -= 3
						this.body.setImmovable(true)
						this.dir = 'left'
					}
				}
			},
			'Lvl 3': {
				'384,48': recurring.paddle,
				'288,168': recurring.payne,
				'120,168': {
					name: 'kathrine',
					move: gaming_kid
				},
				'72,168': {
					name: 'dweeby',
					move: gaming_kid
				},
				'48,168': {
					name: 'sally',
					move: gaming_kid
				},
				'96,168': {
					name: 'wesley',
					move: gaming_kid
				},
				'216,216': recurring.agent 
			},
			'Lvl 2': {
				'576,120': {
					name: 'agent',
					move: function(player){
						if(!this.first){
							this.setImmovable(true)
							this.y -= 10
							this.first = true 
						}
						
						let dx = player.x - this.x 
						let dy = player.y - this.y 
						
						if(Math.abs(dy) > Math.abs(dx)){
							this.anims.play('agent-stand-up')
						}else if(dx < 0){
							this.anims.play('agent-stand-left')
						}else{
							this.anims.play('agent-stand-right')
						}
					}
				}
			},
			'Lvl 1': {
				'288,96' : {
					name: 'glenn',
					move: recurring.payne.move
				},
				'120,144': {
					name: 'mom',
					move: function(){
						this.body.setImmovable(true)
						if(this.v === undefined){
							this.v = 15
						}
						if(this.t){
							this.t += 1
						}else{
							this.t = 1
						}
						
						if(this.t >= 600){
							this.t = 0
							this.v *= -1 
						}
						
						this.body.velocity.x = this.v 
						this.body.velocity.y = 0 
						
					}
				}
			}
				
		},
		npcs: [],
		create: function(x, y, index, lvl){
			let who = npc.data[lvl] && npc.data[lvl][x+','+y]
			if(who){
				let chr = npc.create_character.call(this, x, y, who.name, index)
				chr.name = who.name
				chr.interact_id = who.name 
				chr.dir = 'down'
				interactable.register(chr)
				
				chr.move = who.move
				
				if(who.init){
					who.init.call(chr, this.add)
				}
				
				chr.update = function(player){
					//console.log(this.name, this.dir)
					//if(!this.body) return 
					
					if(Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y)){
						if(this.body.velocity.x > 0){
							this.dir = 'right'
						}else{
							this.dir = 'left'
						}
					}else if(Math.abs(this.body.velocity.x) < Math.abs(this.body.velocity.y)){
						if(this.body.velocity.y > 0){
							this.dir = 'down'
						}else{
							this.dir = 'up'
						}
					}
					
					//console.log(Math.abs(this.body.velocity.x), Math.abs(this.body.velocity.y))
					if(Math.abs(this.body.velocity.x) + Math.abs(this.body.velocity.y) > 0){
						this.anims.play(this.name+'-walk-'+this.dir, true)
						//console.log(this.name+'-walk-'+this.dir)
					}else{
						this.anims.play(this.name+'-stand-'+this.dir)
					}
					
					this.move(player)
				}
				npc.npcs.push(chr)
			}else{
				console.log('Unknown NPC:', x, y, index, lvl)
			}
			
		},
		create_character: function(x, y, who, mov){
			function anim(anims, key, frames){
				let fs = []
				frames.forEach(i => fs.push({key: 'roxy', frame: i}))
				anims.create({
					key: key,
					frames: fs,
					frameRate: 10,
					repeat: -1
				})
			}
			
			let chrs = {
				roxy: 0,
				payne: 3,
				agent: 6,
				alien: 9,
				pj: 12,
				paddle: 68,
				dweeby: 72,
				sally: 75,
				kathrine: 78,
				wesley: 81,
				glenn: 84,
				mom: 72*2
			}
		
			let ch = this.physics.add.sprite(x, y, 'roxy')
			ch.setCollideWorldBounds(true)
			ch.name = who 
			ch.shadow = this.add.sprite(x, y, 'roxy', 13)
			let f0 = chrs[who]
			anim(this.anims, who+'-walk-down', [f0+0,f0+1,f0+0,f0+2])
			anim(this.anims, who+'-walk-right', [f0+18,f0+19,f0+18,f0+20])
			anim(this.anims, who+'-walk-left', [f0+36,f0+37,f0+36,f0+38])
			anim(this.anims, who+'-walk-up', [f0+54,f0+55,f0+54,f0+56])
			
			anim(this.anims, who+'-stand-down', [f0+0])
			anim(this.anims, who+'-stand-right', [f0+18])
			anim(this.anims, who+'-stand-left', [f0+36])
			anim(this.anims, who+'-stand-up', [f0+54])
			
			ch.setSize(12, 9).setOffset(6, 16)
			
			ch.kill = function(){
				console.log('Ahh!')
				this.dead = true 
			}
			
			ch.anims.play(who+'-stand-down')
			return ch 
		}
	}
	
	function construct_map(){
			
		let walls = []
		let player = {}
		for(let id in this.level){
			let xyz = id.split(',')
			let x = xyz[0]
			let y = xyz[1]
			let z = xyz[2]
			let layer = z 
			let index = this.level[id]
			
			if(index === 0) continue  


			let k = z % 3 
			z = (z - k)/3 
			
			let j = z % 3 
			z = (z - j)/3 
			
			let i = z % 3
			
			if(i === 1 && j === 0 && k === 2){
				if(index === 107){
					player.x = TW*x 
					player.y = TW*y
				}else if(index === 22){
					player.x = TW*x 
					player.y = TW*y - 8
					player.payne = true 
				}else{
					npc.create.call(this, TW*x, TW*y, index, this.name)
				}
			}else{
			
				grid[id] = this.physics.add.sprite(TW*x, TW*y, 'tiles', index)
				grid[id].id = index 
				
				if(i === 1){
					walls.push(grid[id])
					grid[id].setImmovable(true)
					if(walls_data[index]){
						let d = walls_data[index]
						grid[id].setSize(d.width, d.height).setOffset(d.x, d.y)
					}
				}
				if(j === 2){
					disappearing.register(grid[id], x, y)
				}
				
				if(j === 1){
					interactable.register(grid[id])
				}
				
				grid[id].setDepth(10000*i + 100*y + 10*j + k)
				
				grid[id].layer = layer 
				grid[id].update = function(){
					this.alpha = show_layer[this.layer]
				}
			}
		}
		
		return {
			walls: walls,
			disappearing: disappearing,
			player: player 
		}
	}
	
	function create_player(data){
		
		
		let walls = data.walls 
		let disappearing = data.disappearing
		
		if(data.player.payne){
			inventory.add('id')
		}else{
		
			inventory.add('gloves')
		}
		
		let name = data.player.payne ? 'payne' : 'roxy'

		this.player = npc.create_character.call(this, data.player.x, data.player.y, name, 0)
		this.player.walls = data.walls 
		
		this.player.sitter = this.add.sprite(0, 0, 'roxy', 12)
		this.player.name = name 
		this.player.sitter.setDepth(20000-1)

		this.player.kill = ()=>{
			console.log(this.name)
			this.scene.start('world', {name:this.name})
		}
		
		if(data.player.x === 48 && data.player.y === 48){
			for(let i = 0; i < interactable.sprites.length; i++){
				let b = interactable.sprites[i]
				if(b.x === 24 && b.y === 48){
					this.player.bed = b 
					this.player.alpha = 0 
					break 
				}
			}
			//this.player.bed = 
			
		}
		
		this.player.v = 24*3 
		this.player.update = function(cursors){
			
			if(this.bed){
				this.alpha = 0
				this.bed.setFrame(8)
				if(cursors.down.isDown || cursors.up.isDown || cursors.left.isDown || cursors.right.isDown){
					this.bed.setFrame(9)
					this.bed = undefined
					this.alpha = 1
				}
			}else if(this.sitting){
				this.alpha = 0 
				this.sitter.alpha = 1 
				this.sitter.x = this.x 
				this.sitter.y = this.y - 16
				this.sitting = this.body.velocity.x === 0 && this.body.velocity.y === 0
			}else{
				this.sitter.alpha = 0
				this.alpha = 1 
			}
			
			let bump_tol = 20
			
			if(cursors.down.isDown){
				
				this.setVelocityY(this.v)
				if(this.body.velocity.x === 0)
					this.anims.play(this.name + '-walk-down', true)
			}else if(cursors.up.isDown){
				this.setVelocityY(-this.v)
				if(this.body.velocity.x === 0)
					this.anims.play(this.name + '-walk-up', true)
			}else{
				let dir = this.body.velocity.y
				if(dir < -bump_tol){
					this.anims.play(this.name + '-stand-up')
				}else if(dir > bump_tol){
					this.anims.play(this.name + '-stand-down')
				}
				this.setVelocityY(0)
				
			}
			
			if(cursors.left.isDown){
				this.setVelocityX(-this.v)
				this.anims.play(this.name + '-walk-left', true)
			}else if(cursors.right.isDown){
				this.setVelocityX(this.v)
				this.anims.play(this.name + '-walk-right', true)
			}else{
				let dir = this.body.velocity.x
				if(dir < -bump_tol){
					this.anims.play(this.name + '-stand-left')
				}else if(dir > bump_tol){
					this.anims.play(this.name + '-stand-right')
				}
				this.setVelocityX(0)
				
			}
		}
		
		
		for(let i = 0; i < disappearing.groups.length; i++){
			this.physics.add.overlap(this.player, disappearing.groups[i].residents, function(p, s){
				s.dis_group.touching = 5
			
			}, null, this)
		}
	}
	
	window.world = {
		init: function(data){
			/*
			if(localStorage.levels === undefined){
				localStorage.levels = JSON.stringify({})
			}
			let levels = JSON.parse(localStorage.levels)
			*/
			let levels = JSON.parse(levels_data_string)
			this.name = data.name  
			if(levels[data.name]){
				this.level = levels[data.name]
			}else{
				this.level = {}
			}
			
			
		},
		create: function(){
			
			console.log(this.name)
			this.cameras.main.flash(500, 0, 0, 0)
			
			this.cursors = this.input.keyboard.addKeys({
				up:Phaser.Input.Keyboard.KeyCodes.W,
				down:Phaser.Input.Keyboard.KeyCodes.S,
				left:Phaser.Input.Keyboard.KeyCodes.A,
				right:Phaser.Input.Keyboard.KeyCodes.D
			});

			interactable.init(this.add)
			message.init(this.add)
			dialog.init(this.cache)
			inventory.init(this.add)
			upgrades.init(this.add)

			let data = construct_map.call(this)
			create_player.call(this, data)
			
			this.physics.add.collider(this.player, data.walls)
			this.physics.add.collider(this.player, npc.npcs)
			this.physics.add.collider(npc.npcs, data.walls)
			
			
			this.cameras.main.startFollow(this.player)
			this.cameras.main.setDeadzone(this.game.canvas.width/4, this.game.canvas.height/2)
			
			let maxx = 0
			let maxy = 0 
			for(let key in this.level){
				let xyz = key.split(',')
				maxx = Math.max(maxx, +xyz[0])
				maxy = Math.max(maxy, +xyz[1])
				//console.log(key)
			}
			
			
			this.cameras.main.setBounds(0, 0, TW*(maxx), TW*(maxy+.5))
			//this.physics.world.setBounds(0, 0, this.game.canvas.width*2, this.game.canvas.height*2)
			this.physics.world.bounds = this.cameras.main.getBounds()
			
			this.input.keyboard.on('keydown-P', ()=> this.scene.start('editor', {
				//name: this.name 
			}))
			
			this.input.keyboard.on('keydown-E', ()=> {

				if(message.open){
					message.enter(this.player)
					this.sound.add('beep').play()
				}else if(upgrades.open){
					upgrades.enter(this.player)
				}else if(!inventory.open){
					interactable.activate(this.name, this.player)
					this.sound.add('boop').play()
				}
			})
			
			this.input.keyboard.on('keydown-Q', ()=> {
				if(upgrades.open){
					upgrades.open = false 
				}else if(!message.open){
					inventory.open = !inventory.open 
				}
			})
			
			if(this.name === 'Lvl 1'){
				message.say('tutorial', this.player, this.player)
			}
			
		},
		update: function(){
			disappearing.update()
			interactable.update(this.player, this.name)
			message.update(this.cursors)
			inventory.update(this.cursors)
			upgrades.update(this.cursors)
			
			if(message.open || inventory.open || upgrades.open){
				this.physics.pause()
			}else{
				this.physics.resume()
				this.player.update(this.cursors)
				npc.npcs.forEach(c => c.update(this.player))
			}
			
			
			this.player.setDepth(10000 + 100*(this.player.y/TW ) + 30)
			this.player.shadow.setDepth(10000 + 100*(this.player.y/TW ) + 29)
			this.player.shadow.x = this.player.x 
			this.player.shadow.y = this.player.y + 6
			this.player.shadow.alpha = this.player.alpha 
			
			
			
			npc.npcs.forEach(c => {
				c.setDepth(10000 + 100*(c.y/TW ) + 30)
				c.shadow.x = c.x 
				c.shadow.y = c.y + 6
				c.shadow.setDepth(10000 + 100*(c.y/TW ) + 29)
				c.shadow.alpha = c.alpha 
				
				if(c.dead){
					c.shadow.destroy()
					c.destroy()
				}
			})
			
			npc.npcs = npc.npcs.filter(x => !x.dead)
		}
	}
})()