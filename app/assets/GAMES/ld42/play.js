window.play = (function(){
	
	function make_physical(s){
		game.physics.enable(s, Phaser.Physics.ARCADE)
		s.body.immovable = true
		
	}
	
	function make_guy(){
		var guy = game.add.sprite(game.width/2, game.height/2, 'guy')
		make_physical(guy)
		guy.body.immovable = false 
		guy.anchor.set(.5)
		
		guy.body.collideWorldBounds = true 
		
		guy.body.gravity.y = 2000
		guy.body.setSize(23,30,13,18)
		guy.speed = 400
		guy.jump = -800
		guy.on_fire = 0 
		
		guy.animations.add('stand', [0])
		guy.animations.add('run', [1,2])
		guy.animations.add('jump', [3])
		
		guy.animations.add('fire-stand', [4,8,9])
		guy.animations.add('fire-run', [5,6])
		guy.animations.add('fire-jump', [7])
		
		guy.spike = game.add.sprite(0,0,'spike')
		guy.addChild(guy.spike)
		guy.spike.alpha = 0 
		
		guy.kill = function(){
			var emitter = game.add.emitter(this.x, this.y, 100)
			emitter.minParticleSpeed.set(-500)
			emitter.maxParticleSpeed.set(500)
			emitter.makeParticles('parts2')
			emitter.forEachAlive( p => p.frame = 1)
			var life = 1000
			emitter.start(true, life, null, 10)
			game.over = 120 
			
			audio.play('explode')
			
			this.destroy()
	
		}

		
		guy.damage = function(enemey){
			if(enemey === undefined){
				this.on_fire = 120 
			} else if (enemey.spike){
				var r = .8
				this.spike.x = r*(enemey.x - this.x)
				this.spike.y = r*(enemey.y - this.y)
				this.spike.alpha = 2
			}else{
				this.on_fire = 120
			}
			heart_manager.sub()
			
		}
		
		
		guy.update = function(){
			if((this.frame % 4 === 1 || this.frame % 4 == 1) && this.body.touching.down){
				audio.play('run3')
			}
			
			if(this.spike.alpha > .01){
				this.spike.alpha -= .01
			}else{
				this.spike.alpha = 0 
			}
			
			var anim = 'stand'
			
			if(key.down('left')){
				this.body.velocity.x = -this.speed 
				this.scale.x = 1
				anim = 'run'
			}else if(key.down('right')){
				this.body.velocity.x = this.speed 
				this.scale.x = -1
				anim = 'run'
			}else{
				this.body.velocity.x = 0 
			}
			if(key.down('jump')){
				if(this.body.touching.down){
					this.body.velocity.y = this.jump 
					audio.play('jump')
				}
			}else{
				if(this.body.velocity.y < 0 && !this.body.touching.down){
					this.body.velocity.y *= .8 
				}
			}
			if(!this.body.touching.down){
				this.anim = 'jump'
			}
			
			if(this.bottom > 401){
				this.kill()
			}
			if(this.body && game.p2.x - game.p1.x < 60){
				this.kill()
			}
			
			
			if(this.on_fire > 0){
				this.on_fire -= 1
				anim = 'fire-' + anim 
			}
			
			this.animations.play(anim, 15, true)
			
		}
		
		return guy
	}
	
	function make_wall(i){
		var w = game.width/2 
		var x = w + 1.4*(i-1)*w
		var s = game.add.sprite(x, game.height/4, 'wall')
		make_physical(s)
		s.body.setSize(375,545,5,3)
		s.anchor.set(.5)
		
		s.bump = -6
		
		var speed = 4
		s.body.velocity.x = speed * (1-i)
		
		s.update = function(){
			if(!game.guy.alive){
				this.body.velocity.x = 0 
			}
		}
		
		return s
	}
	
	function make_pillar(i){
		var x = i > 0 ? 0 : game.width 
		var s = game.add.sprite(x, 402, 'pillar')
		make_physical(s)
		s.body.setSize(400,352+100,12,-100)
		s.anchor.set(.5,1)
		
		s.bump = -6
		s.scale.x = -i 
		
		var speed = 4
		s.body.velocity.x = speed * i 
		
		s.update = function(){
			if(!game.guy.alive){
				this.body.velocity.x = 0
			}
		}
		
		return s 
	}
	
	function make_floor(){
			var floor = game.add.sprite(0,400,'fg')
			make_physical(floor)
			floor.bump = 0 
			return floor 
	}
	
	function make_card(i){
		var x = 150 + 125*i
		var s = game.add.sprite(x, -100,'cards')
		make_physical(s)
		s.anchor.set(.5)
		
		s.active = false 
		s.heartfelt = false 
		s.timer = -1
		
		
		s.tween = game.add.tween(s.position).to({
			x :  x,
			y : 200 
		}, 2400, Phaser.Easing.Exponential.Out, true)
	
		s.update = function(){
			if(s.active && s.bottom < 0){
				s.kill()
			}
		
		}
		
		s.bump = function(){
			audio.play('bump')
			this.go()
		}
		
		s.kill = function(){
			if(this.bottom > 0){
				var emitter = game.add.emitter(this.x, this.y, 100)
				emitter.minParticleSpeed.set(-500)
				emitter.maxParticleSpeed.set(500)
				emitter.makeParticles('parts')
				var life = 1000
				emitter.start(true, life, null, 10)
				
				audio.play('explode3')
				
				if(this.heartfelt){
				
					
					
					var heart = heart_manager.add()
					
					
					var midlife = .5
					var go_time = game.time.now + midlife*life 
					
					emitter.forEachAlive( function(p){
					
						p.update = function(){
							if(game.time.now > go_time){
								p.tween = game.add.tween(p.position).to(heart.position, life*(1-midlife), Phaser.Easing.Exponential.Out, true)
								p.update = function(){}
								p.tween.onComplete.add(()=>heart.alpha = 1)
							}
						}
					})
				}
				
			}

			
			s.destroy()
		}
	
		game.hand.push(s)
	
		
		return s 
		
	}
	
	function make_arrow_card(i){
		var s = make_card(i)
		
		s.speed = 300 
		s.go = function(){
			this.body.velocity.x = this.dir_x * this.speed 
			this.body.velocity.y = this.dir_y * this.speed 
			this.active = true 
			s.tween.stop()
			
		}
		
		return s 
	}
	
	function make_left(i){
		s = make_arrow_card(i)
		s.frame = 1 
		s.dir_x = -1
		s.dir_y = 0 
	}
	
	function make_right(i){
		var s = make_arrow_card(i)
		s.frame = 0 
		s.dir_x = 1
		s.dir_y = 0 
	}
	
	function make_up(i){
		s = make_arrow_card(i)
		s.frame = 2
		s.dir_x = 0
		s.dir_y = -1
	}
	
	function make_down(i){
		var s = make_arrow_card(i)
		s.frame = 3 
		s.dir_x = 0 
		s.dir_y = 1
	}
	
	function make_heart(i){
		var s = make_card(i)
		s.frame = 4
		s.rate = 750
		s.flip = game.time.now + s.rate 
		
		s.update = function(){
			if(game.time.now > this.flip){
				if(this.frame === 4){
					this.frame = 5
				}else{
					this.frame = 4
				}
				this.heartfelt = this.frame === 4
				this.flip = game.time.now + this.rate 
			}
		}
		
		s.go = function(){
			console.log(this.frame)
			if(this.frame === 4){
				game.guy.heal()
			}else{
				game.guy.damage()
			}
			this.kill()
		}
	}
	
	function make_hand(count){
		var cards = [
			make_left, 
			make_right, 
			make_up, 
			//make_down, 
			make_heart
		]
		//var cards = [make_heart]
		for(var i = 0; i < count; i++){
			var c = random.choice(cards)
			c(i)
		}
	}
	
	
	function make_spike(){
		var s = game.add.sprite(game.width/2, -100, 'spike')
		s.spike = true 
		make_physical(s)
		s.body.immovable = false
		
		s.body.setCircle(12,4,4)
		
		s.speed = 100
		s.body.velocity.set(s.speed, s.speed)
		s.body.bounce.set(1)
		s.update = function(){
			if(s.top > 0){
				s.body.collideWorldBounds = true 
			}
		}
		
		s.kill = function(){
			make_spike()
			s.destroy()
		}
		
		game.enemies.push(s)
		return s 
	}
	
	function make_fire(){
		var s = game.add.sprite(random.normal(game.width/2, 100), -100, 'fire')
		s.animations.add('loop', [0,1,2,3])
		s.animations.add('splat', [4,5,6,7,8,9,10])
		s.animations.play('loop', 15, true)
		
		make_physical(s)
		s.body.velocity.y = 80 
		s.body.setCircle(15, 9, 15)
		
		s.update = function(){
			if(this.bottom >= 400){
				this.body.velocity.y = 0 
				this.bottom = 400
				this.animations.play('splat', 30, false)
				this.update = function(){
					if(this.frame >= 9){
						this.kill()
					}
				}
			}
			
		}
		
		game.enemies.push(s)
		
		return s
	}
	
	function make_laser(){
		var laser = game.add.sprite(0, 360, 'laser')
		laser.width = game.width 
		laser.frame = 3 
		laser.timer = 0 
		laser.dangerous = true 
		laser.update = function(){
			
			this.timer += 1
			
			var p1 = 45 
			var p2 = 2 
			var p3 = 10
			var p4 = 3
			
			
			
			if(this.timer < p1){
				this.frame = 3 
			}else if(this.timer < p1 + p2){
				this.frame = 2
			}else if(this.timer < p1 + 2*p2){
				this.frame = 1 
			}else if(this.timer < p1 + 2*p2 + p3){
				this.frame = 0 
			}else if(this.timer < p1 + 3*p2 + p3){
				this.frame = 1
			}else if(this.timer < p1 + 4*p2 + p3){
				this.frame = 2
			}else if(this.timer < p1 + 5*p2 + p3){
				this.frame = 3
			}else{
				this.kill()
			}
			
			if(this.timer === p1 + p2){
				audio.play('laser')
			}
			var killer = this.frame < 2
			
			if(killer && game.guy.y > this.top && this.dangerous){
				this.dangerous = false 
				game.guy.damage()
			}
			
		}
		
		return laser 
	}
	
	var heart_manager = {
		hearts: [],
		reset: function(){
			this.hearts.forEach(h => h.destroy())
			this.hearts = []
			for(var i = 0; i < 3; i++){
				var h = this.add()
				h.alpha = 1 
			}
		},
		get_empty: function(){
			var i = this.hearts.length 
			var c = game.width/2 
			
			return {
				//x: (game.width/2) + this.hearthis.hearts.length * 32 + 32,
				x: c + (i%2)*(16*i + 12) + (i%2 - 1)*16*i,
				y: 32
			}
		},
		add: function(){
			var xy = this.get_empty()
			var h = game.add.sprite(xy.x, xy.y, 'icons')
			h.anchor.set(.5)
			h.alpha = 0 
			h.bringToTop()
			this.hearts.push(h)
			
			
			audio.play('heart')
			
			return h 
			
		},
		sub: function(){
			if(this.hearts.length === 0){
				game.guy.kill()
				return 
			}
			var h = this.hearts.pop()
			
			h.tween = game.add.tween(h.scale).to({x:0,y:0}, 500, Phaser.Easing.Linear.None, true)

			h.tween.onComplete.add(()=>h.destroy())
			
			audio.play('skull')
			
			
		}
	}
	
	var progress = {
		init: function(){
			var bg = game.add.sprite(54, game.height - 96, 'icons')
			bg.frame = 1 
			bg.width = 692
			bg.height = 24
			
			this.bar = game.add.sprite(game.width/2, game.height - 96, 'icons')
			this.bar.anchor.set(.5, 0)
			this.bar.height = 24
			this.bar.scale.x = 0
			this.bar.frame = 2
			this.bar.update = function(){
				progress.value += 1 
				this.width = 692*progress.value/progress.max_value 
				if(progress.value > progress.max_value){
					progress.next()
				}
				
				var v = Math.min(progress.phase, progress.phases.length - 1)
				progress.phases[v](progress.value)
				
			}
			
			game.add.sprite(0,game.height - 100, 'progress')
			this.reset()
		},
		reset: function(){
			this.value = 0 
			this.phase = 0
			this.max_value = 1500
		},
		next: function(){
			this.phase += 1 
			this.value = 0
			this.max_value += 500
		
		},
		phases : [
			function(t){}, // 0
			function(t){ 
				if(t === 1){
					make_spike()
				}
			},
			function(t){ //
				if(t % 250 === 0){
					make_fire()
				}
			},
			function(t){ //
				if(t % 150 === 0){
					make_fire()
				}
			},
			function(t){ //
				if(t % 300 === 0){
					make_laser()
				}
			},
			function(t){
				if(t % 250  === 0){
					make_fire()
				}else if(t % 400 === 0){
					make_laser()
				}
			}
		]
	}
	
	return {
		create: function(){
			game.physics.startSystem(Phaser.Physics.ARCADE)
			
			game.add.sprite(0,0,'bg')
			game.hand = [] 
			
			game.p1 = make_pillar(1)
			game.p2 = make_pillar(-1)
			
			game.walls = [
				//make_wall(0),
				//make_wall(2),
				game.p1,
				game.p2,
				make_floor()
			]
			
			game.enemies = []
			
			game.guy = make_guy()
			
			progress.init()
			
			heart_manager.reset()
			
			make_hand(5)
			
			audio.make_mute()
			
			game.over = -1 
			
			
		},
		update: function(){
			
			if(game.over === 0){
				game.state.start('menu')
			}else if(game.over > 0){
				game.over -= 1 
			}
			
			game.physics.arcade.collide(game.guy, game.walls)
			game.physics.arcade.collide(game.guy, game.hand, function(guy, card){
				if(card.body.touching.down){
					card.bump()
				}
			})
			
			game.physics.arcade.collide(game.hand, game.hand, function(a,b){
				a.kill()
				b.kill()
			})
			
			game.physics.arcade.collide(game.hand, game.walls, function(card, wall){
				if(card.active && card.body.velocity.x * wall.body.velocity.x < 0){
					wall.body.x += wall.body.velocity.x * wall.bump 
				}
				card.kill()
			})
			
			game.physics.arcade.overlap(game.guy, game.enemies, function(guy, enemey){
				enemey.kill()
				guy.damage(enemey)
				audio.play('flame')
			})
			
			game.physics.arcade.collide(game.enemies, game.walls)
			
			game.hand = game.hand.filter(c => c.alive)
			
			if(game.hand.length === 0){
				make_hand(5)
			}
		},
		render: function(){
			//game.walls.forEach(e => game.debug.body(e))
		}
		
	}

})()