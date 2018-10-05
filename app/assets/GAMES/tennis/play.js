window.play = (function(){
	
	/*
	http://www.html5gamedevs.com/topic/28424-solved-loading-custom-fonts-and-displaying-cyrillicfrenchturkish-characters/
	
		To Do:
			
			Intro Marquee
			Resize
			Classic Tennis vs. Roo Tennis 
			
			Music?
			Wackiness
				Bird
				UFO
				Blocks
				Moving Net
				Special Abilities:
					Mobster - Machine Gun
					Kangaroo - Jump 
					-Wind 
					Matt - Marquee Stupiditiy 
					
			Juice:
				screen shake
			Make Settings Look better
			
			
			To Done:
				Skill Bars 
				Settings
				Set counter 	
				Marquee 
				Win State
				Make Settings Look better
				Sound FX 
				Two Player
	*/
	
	const SCALE = 1
	const font = "press_start"
	
	let p8 = {
		black: "#000000",
		dark_blue: "#1D2B53",
		dark_purple: "#7E2553",
		dark_green: "#008751",
		brown: "#AB5236",
		dark_gray: "#5F574F",
		light_gray: "#C2C3C7",
		white: "#FFF1E8",
		red: "#FF004D",
		orange: "#FFA300",
		yellow: "#FFEC27",
		green: "#00E436",
		blue: "#29ADFF",
		indigo: "#83769C",
		pink: "#FF77A8",
		peach: "#FFCCAA"
	}
	
	function make_scoreboard(){
		let progression = ['love', '15', '30', '40']
		
		let dx = game.width/4
		let sprite = game.add.sprite(game.width/2,48)
		sprite.update = function(){
			this.children.forEach(c => c.update())
		}
		
		for(let i=1; i<=2; i++){
		
			let s = sprite['p' + i] = game.add.sprite(i === 1 ? -dx : dx, 0)
			s.side = i === 1 ? 'left' : 'right'
			
			s.anchor.set(.5)
			sprite.addChild(s)
			
			let name = game.add.text(0, 0, i === 1 ? play.er.name : play.ai.name, {
				font: "bold 24px " + font,
			})
			s.addChild(name)
			name.anchor.set(.5)
			
			s.score = game.add.text(0, 32, '0', {
					font: "bold 52px " + font,
					align: 'center',
				})
			s.score.anchor.set(.5, 0)
			s.addChild(s.score)
			
			s.serve = game.add.sprite(name.left - 5, -5, 'ball')
			s.serve.anchor.set(1,.5)
			s.addChild(s.serve)
			
			s.games = game.add.sprite(0,0)
			s.addChild(s.games)
			s.games.anchor.set(.5)
			
			
			
			s.update = function(){
				this.serve.alpha = +play.scoreboard[this.side].serve 
				let len = this.games.children.length
				if(play.scoreboard[this.side].games > len){
					let x = len % 2 ? (len+1)/2 : -len/2
					this.games.addChild(
						game.add.sprite(10*x, 15, 'marker')
					)
				}
			}
		}
		
		
		
		return {
			sprite: sprite,
			left: {
				points: 0,
				games: 0,
				serve: play.settings.first === 'Player'
			},
			right: {
				points: 0,
				games: 0,
				serve: play.settings.first !== 'Player' 
			},
			win_game: function(side){

				this[side].games += 1 
				
				let sides = ['left', 'right']
				for(let i = 0; i < sides.length; i++){
					let s = this[sides[i]]
					s.points = 0
					s.serve = ! s.serve 
				}
				
				this.refresh_scores()
				if(this[side].games >= play.settings.games){
					if(play.settings.by2.toLowerCase() === 'on'){
						let a = side 
						let b = side === 'left' ? 'right' : 'left'
						if(this[a].games > this[b].games + 1){
							this.win_match(side)
						}
					}else{
						this.win_match(side)
					}
				}

			},
			win_match: function(side){
				let loser = side === 'left' ? 'right' : 'left'
				play.er.update = ()=>{}
				play.ai.update = ()=>{}
				
				play.won = true 
				play.winner = play.settings[side]
				play.loser = play.settings[loser]
				
				
			},
			inc_score: function(lr, p){
				let points = this[lr].points += 1
				this.refresh_scores()
			},
			refresh_scores: function(){
				let prog = progression.slice()
				prog[0] = '0'
				
				let left = this.left.points 
				let right = this.right.points 
				let le, ri
				
				if(left >= 3 && left === right){
					le =  'Deuce'
					ri = 'Deuce'
				}else if(left > right && right >= 3){
					le = 'Adv.'
					ri = ' '
				}else if(right > left && left >= 3){
					le = ' '
					ri= 'Adv.'
				}else{
					le = prog[left]
					ri = prog[right]
				}
				
				this.sprite.p1.score.text = le || ''
				this.sprite.p2.score.text = ri || ''
			
	
			},
			check_winner: function(){
			
				if(this.left.points >= 4 || this.right.points >= 4){
					if(this.left.points > this.right.points + 1){
						this.win_game('left')
					}
					if(this.right.points > this.left.points + 1){
						this.win_game('right')	
					}
				}
			},
			score: function(left){
				
				if(left){
					this.inc_score('left', 'p1')
				}else{
					this.inc_score('right', 'p2')
				}
				
				this.marquee()
				this.check_winner()
				
				if(this.left.serve){
					play.er.serving = true 
				}else{
					play.ai.serving = true 
				}
				
			},
			marquee: function(){
				play.marqueeing = true 
				let m = game.add.sprite(0, 250, 'marquee')
				m.anchor.set(0,.5)
				m.scale.y = 0
				
				audio.play('woosh5')
				
				let tx = 300
				
				let text = game.add.text(-tx, 250, this.call(this.left.points, this.right.points), {
					fill: p8.white, 
					font: "bold 32px " + font,
				})
				text.anchor.set(.5)
				
				let cx = .49
				
				let scale_in = game.add.tween(m.scale)
				scale_in.to({y:.5}, 150, Phaser.Easing.Cubic.Out)
				scale_in.to({y:.5}, 600*3, Phaser.Easing.Linear.None)
				scale_in.to({y:0}, 150, Phaser.Easing.Cubic.In)
				
				let text_in = game.add.tween(text.position)
				text_in.to({x:-tx}, 150, Phaser.Easing.Linear.None)
				text_in.to({x:cx*game.width}, 600, Phaser.Easing.Cubic.Out)
				text_in.to({x:(1-cx)*game.width}, 600, Phaser.Easing.Linear.None)
				text_in.to({x:game.width+tx}, 600, Phaser.Easing.Cubic.In)
				
				scale_in.onComplete.add(function(){
					play.marqueeing = false
					m.destroy()
					text.destroy()
				})
				scale_in.start()
				text_in.start()
				

				
			},
			call: function(a, b){
				
				let a_name = play.er.name
				let b_name = play.ai.name 
				
				if(a < progression.length && b < progression.length){
					if(a === b){
						if(a === 3){
							return 'DEUCE'
						}else{
							return progression[a] + ' ALL'
						}
					}else{
						return progression[a].toUpperCase() + ' - ' + progression[b].toUpperCase()
					}
				}else{
					if(a === b){
						return 'DEUCE'
					}else if(a === b+1){
						return 'ADVANTAGE ' + a_name.toUpperCase() 
					}else if(a > b+1){
						return a_name + ' wins!'
					}else if(b === a+1){
						return 'ADVANTAGE ' + b_name.toUpperCase()
					}else if(b > a+1){
						return b_name + ' wins!'
					}else{
						throw 'Unknown score: ' + a + ' : ' + b 
					}
					
				}
			}
		}
	}

	function make_character(id){
		let s = game.add.sprite(0,0,'players')
		s.anchor.set(.5)
		game.physics.arcade.enable(s)
		s.body.collideWorldBounds = true
		s.scale.set(SCALE)
		s.y = 550
		
		s.frame = id * 3
		s.anchor.set(.5)
		
		let r = game.add.sprite(10,6,'racket')
		r.anchor.set(.5)
		s.addChild(r)
		s.racket = r 
		r.animations.add('swing', [0, 1, 2, 0], 12)
		
		let m = game.add.sprite(0,0, 'marker')
		m.anchor.set(.5)
		m.alpha = 0 
		s.addChild(m)
		s.marker = m 
		
		s.serve_angle = Math.PI/3
		s.t = 0 
		s.serve_dir = .1

		
		for(let i in play.data[id]){
			s[i]=play.data[id][i]
		}
		
		s.animations.add('run', [3*id, 3*id+1, 3*id, 3*id+2], 12, true)
		s.animations.add('stand', [3*id])
		
		s.swing = function(){
			if(this.racket.frame !== 0) return 
			
			this.racket.play('swing')
			
			if(play.ball){
				let dx = play.ball.x - this.x 
				let dy = play.ball.y - this.y 
				let r = Math.sqrt(dx*dx + dy*dy)
				//let t = Math.atan2(dy, dx)
				let t = this.swing_angle
				if(r < this.reach + play.ball.r){
					audio.play('hit')
					play.ball.body.velocity.x = this.power*Math.cos(t)
					play.ball.body.velocity.y = this.power*Math.sin(t)
			
				}
			}
			
		}
		return s 
	}

	function make_player(id){
		let s = make_character(id)
		s.lefty = true 
		s.x = .25*game.width
		s.serving = play.settings.first === 'Player' || play.settings.first === 'Player 1'
		s.serve_dir = .05
		
		
		
		s.update = function(){
			
			let keys = {}
			let ks = ['left', 'right', 'hit']
			for(let i = 0; i < ks.length; i++){
				let k = ks[i]
				if(play.settings.two && s.lefty){
					keys[k] = 'p1_' + k 
				}else if(play.settings.two && !s.lefty){
					keys[k] = 'p2_' + k
				}else{
					keys[k] = k 
				}
			}
			
			if(play.ball){
				this.swing_angle = Math.atan2(play.ball.y - this.y, play.ball.x - this.x)
			}
			if(this.serving){
				
				this.marker.alpha = 1 
				
				this.serve_angle += this.serve_dir
				if(this.serve_angle < 0){
					this.serve_dir = Math.abs(this.serve_dir)
				}else if(this.serve_angle > Math.PI/2){
					this.serve_dir = -Math.abs(this.serve_dir)
				}
				
				let r = 100
				let t = this.serve_angle
				
				this.marker.x = r*Math.cos(-t)
				this.marker.y = r*Math.sin(-t)
				
			}else{
				this.marker.alpha = 0 
			}
			
			if(key.down(keys.hit) && !this.swinging){
				if(this.serving){
					make_ball(this)
					this.serving = false 
				}else{
					this.swing()
				}
				
			}
			this.swinging = key.down(keys.hit)
			
			if(key.down(keys.left)){
				this.body.velocity.x = -this.v
				this.animations.play('run')
			}else if(key.down(keys.right)){
				this.body.velocity.x = this.v
				this.animations.play('run')
			}else{
				this.body.velocity.x *= this.fr
				this.animations.play('stand')
			}
		}
		
		return s 
	}
	
	function make_player2(id){
		let s = make_player(id)
		s.serving = !(s.serving = play.settings.first === 'Player' || play.settings.first === 'Player 1')
		s.lefty = false 
		s.x = .75*game.width 
		s.scale.x = -1
		
		return s 
	}
	
	function make_ai(id){
		let s = make_character(id)
		s.scale.x *= -1 
		s.x = .75*game.width
		s.serving = play.settings.first !== 'Player'
		s.cooldown = 30
		
		
		s.update = function(){
			this.swing_angle = Math.PI + Math.random()*Math.PI/2
			
			if(play.ball){
				this.cooldown -= 1
				
				let xf = play.ball.dest() + 15
				if(xf > game.width/2 && Math.abs(this.x - xf) > 10){
					if(this.x < xf){
						this.body.velocity.x = this.v 
					}else{
						this.body.velocity.x = -this.v 
					}
					this.animations.play('run')
				}else{
					this.body.velocity.x = 0 
					this.animations.play('stand')
				}
				
				let dx = this.x - play.ball.x 
				let dy = this.y - play.ball.y 
				
				let d = Math.sqrt(dx*dx + dy*dy)
				if(dx > 0 && d < 50 && this.cooldown <= 0){
					this.swing()
					this.cooldown = 30 
				}
			}else if(this.serving){
				if(this.x < .8*game.width){
					this.body.velocity.x = this.v 
					this.animations.play('run')
				}else{
					this.animations.play('stand')
					if(!play.marqueeing){
						this.serve_angle = Math.PI/4 + Math.random()*Math.PI/6 
						make_ball(this)
						this.serving = false 
						this.cooldown = 30
					}
				}
				
			}else{
				this.body.velocity.x = 0
				this.animations.play('stand')
			}
		}
		
		
		return s 
		
	}
	
	function make_ball(server){
		let theta = -server.serve_angle
		let dir = server.scale.x 
		let fx = dir * Math.cos(theta)
		let fy = Math.sin(theta)
		
		audio.play('serve')
		let ball = game.add.sprite(server.x, server.y, 'ball')
		ball.r = ball.width/2 
		ball.anchor.set(.5)
		play.ball = ball 
		
		ball.server = server
		
		game.physics.arcade.enable(ball)
		
		
		ball.body.velocity.x = fx * server.power
		ball.body.velocity.y = server.power * fy
		ball.body.allowGravity = true 
		ball.body.gravity.y = 700
		ball.body.bounce.set(1)
		
		ball.kill = function(){
			play.ball = undefined
			this.destroy()
		}
		
		/*
		let marker = game.add.sprite(0,0,'marker')
		marker.update = function(){
			if(ball.body){
				this.x = ball.dest()
				this.y = game.height - ball.r 
			}else{
				this.destroy()
			}
		}
		*/
		
		ball.dest = function(){
			let x0 = this.body.x 
			let y0 = this.body.y 
			let vx = this.body.velocity.x 
			let vy = this.body.velocity.y 
			let g = this.body.gravity.y
			let y = game.height - this.r 
			
			let t = (-vy + Math.sqrt(vy*vy - 2*g*(y0-y)))/(g)

			let x = vx*t + x0
			
			let w = game.width - this.r 
			if(x > w){
				x = 2*w - x 
			}
			if(x < 0){
				x = -x 
			}
			
			return x 
		}
		
		ball.update = function(){
			if(this.bottom > game.height){
				play.scoreboard.score(this.x > game.width/2)
				this.kill()
			}else if( Math.abs(this.x - game.width/2) > game.width/2) {
				//play.scoreboard.score(this.x < game.width)
			}
			/*
			let players = ['ai', 'er']
			for(let i = 0; i < players.length; i++){
				let p = play[players[i]]
				
				let dx = p.x - this.x 
				let dy = p.y - this.y 
				
				let r = Math.sqrt(dx*dx + dy*dy)
				let t = Math.atan2(dy, dx)
				if(r < p.reach && p.frame != 0 ){
					this.body.velocity.x = p.power * Math.cos(t)
					this.body.velocity.y = p.power * Math.sin(t)
				}
			}
			*/
		}
	}
	
	function make_net(){
		let s = game.add.sprite(game.width/2, 565, 'net')
		s.anchor.set(.5)
		s.scale.set(SCALE)
		
		game.physics.arcade.enable(s)
		s.body.immovable = true;
		
		return s 
		
	}
	
	function make_wall(x){
		let wall = game.add.sprite(x, 0, 'wall')
		game.physics.arcade.enable(wall)
		wall.body.immovable = true 
		
		return wall 
	}

	let play = {
		init: function(data){
			if(data === undefined){
				this.settings = {
					left: 0, 
					right: 1,
					first: 'Player',
					games: 3,
					by2: 'Off',
					two: false 
				}
			}else{
				this.settings = data 
			}
			
			
		},
		create: function(){
			game.add.sprite(0,0,'bg')
			
			game.physics.startSystem(Phaser.Physics.ARCADE);
			
			this.er = make_player(this.settings.left)
			if(this.settings.two){
				this.ai = make_player2(this.settings.right)
			}else{
				this.ai = make_ai(this.settings.right)
			}
			
			this.won = undefined
			this.marqueeing = false 
			this.winner = undefined
			this.loser = undefined
			
			this.scoreboard = make_scoreboard()
			
			this.walls = [
				make_net(),
				make_wall(-20),
				make_wall(game.width)
			]
			
			audio.make_mute()
		},
		update: function(){
			game.physics.arcade.collide(this.walls, this.er)
			game.physics.arcade.collide(this.walls, this.ai)
			
			game.physics.arcade.collide(this.walls, this.ball, function(){
				audio.play('bomp')
			})
			
			if(this.won && !this.marqueeing){
				game.state.start('win', true, false, this.winner, this.loser)
			
			}
			
		}
	}
	
	
	
	return play 

})()