//(function(){
	const white = 0 
	const black = 1
	const marker = 2 
	
	const minx = -15 
	const miny = -15
	const maxx = 15
	const maxy = 15 
	
	const width = 600
	const height = 400
	
	let canvas, context, drawables
	let cards = [299, 300, 317, 330, 347, 427, 428, 445, 572, 573, 585, 587, 589, 590, 603, 604, 620, 668, 700, 701, 717, 718, 842, 922, 925, 940, 941, 1178, 1195, 1197, 1198, 1435, 1451, 1708, 2475, 2476, 2493, 2748, 2749, 2765, 2766, 4668, 4669, 4680, 4683, 4748, 4796, 4797, 5005, 5036, 5037, 5069, 5258, 5291, 6316, 6333, 6844, 6845, 7117, 9100, 9101, 9116, 9358, 10396, 10428, 10429, 10445, 10446, 10684, 10685]
	
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
	};
	
	
	let mouse = {
		down: false,
		clicked: false,
		color: white,
		update: function(){
			this.clicked = false
		},
		x: 0,
		y: 0,
		init: function(){
			
			document.onmousemove = function handleMouseMove(event) {
				// https://stackoverflow.com/questions/7790725/javascript-track-mouse-position
				let rect = canvas.getBoundingClientRect(); // abs. size of element
				let scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
				let scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

				mouse.x = (event.clientX - rect.left) * scaleX; // scale mouse coordinates after they have
				mouse.y =  (event.clientY - rect.top) * scaleY;     // been adjusted to be relative to element
			}

			canvas.addEventListener('mousedown', function(){
				mouse.down = true ;
				mouse.clicked = true ;
			});

			canvas.addEventListener('mouseup', function(){
				mouse.down = false ;
			});
		
		}
	};

	function draw_circ(x, y, r, color){
		context.beginPath()
		context.fillStyle = color === black ? p8.dark_blue : p8.blue
		context.strokeStyle = color === black ? p8.black : p8.dark_blue 
		context.arc(x, y, r, 0, 7)
		context.fill()
		context.stroke()
	}
	
	let comm = {
		request: function(url, callback, that){
			let xhttp = new XMLHttpRequest();
		
			xhttp.onreadystatechange = function () {
				if(xhttp.readyState === 4 && xhttp.status === 200){
					callback.call(that, xhttp.responseText)
				}
			}
			xhttp.open('GET', url, true)
			xhttp.send()
		},
		send: function(data, callback){

			let pairs = []
			for(let key in data){
				pairs.push(key + '-' + data[key])
			}
			let url = '/api/ominos/' + pairs.join('.')
			this.request(url, callback)
			
		},
		new_game: function(){
			let id = comm.get_player()
			if(id){
				let data = {
					action: 'new_game',
					player: id
				}
				comm.send(data, comm.new_game_callback, this)
			}else{
				setTimeout(comm.new_game, 500)
			}
			
		},
		receive_opp_move: function(text){
			//console.log(text)
			let re = /turn\-(\d+)\.code-(\d+)/
			let match = text.match(re)
			if(match && +match[1] > grid.turn){
				//grid.turn = +match[1]
				comm.waiting_for_opp_move = false
				comm.opp_move = +match[2]
			}else if(!grid.game_over){
				setTimeout(comm.get_last_move, 500)
				comm.waiting_for_opp_move = true
			}else{
				comm.waiting_for_opp_move = false
			}
			
			
		},
		get_last_move: function(){
			//console.log('Get Last Move')
			comm.send({
				action: 'get_last_move',
				game: comm.game_id
			}, comm.receive_opp_move)
		},
		get_opp_move: function(){
			if(this.opp_move){
				let opp = this.opp_move
				this.opp_move = false 
				return opp 
			}else if(!this.waiting_for_opp_move){
				this.get_last_move()
				this.waiting_for_opp_move = true 
			}
		},
		make_move: function(x, y, color, p1){
			x += 15
			y += 15
			
			let move = y + 32*x
			if(color === black){
				move += 1024
			}
			if(p1){
				move += 2048
			}
			
			this.send({
				action: 'set_move',
				game: this.game_id,
				move: move
			}, console.log)
			
		},
		new_game_callback: function(text){
			let re = /\((\d+), (\d+), (\d+), (\d+), (\d+)\)/
			let m = text.match(re)
			if(m){
				//console.log(m)
				comm.game_id = +m[1]
				let player_turn = comm.id === +m[2]
				let h1, h2 
				if(player_turn){
					h1 = +m[4]
					h2 = +m[5]
				}else{
					h1 = +m[5]
					h2 = +m[4]
				}
				grid.new_game(player_turn, h1, h2)
			}else{
				setTimeout(comm.new_game, 500)
			}
		},
		get_player: function(){
			let inp = document.getElementById('name')
			let name = inp.value 
			if(name !== this.name){
				this.name = name 
				this.send({
					action: 'get_player',
					player: name
				}, (id)=>this.id = +id)
				return false 
			}else{
				return this.id 
			}
		},
		end_game: function(winner){
			this.send({
				action: 'game_over',
				game: this.game_id
			}, console.log)
		},
		go: function(){
			let el = document.getElementById('code')
			let code = el.value 
			this.request('/api/ominos/' + code, console.log)
			
		}
	}
	
	let grid = {
		values: {},
		new_game: function(player_turn, h1, h2){
			this.init()
			
			this.player_turn = player_turn 
			this.first_player = player_turn
			this.turn = 0
			this.game_over = false 
			this.player_hand = new Hand(h1, false) 
			this.other_hand = new Hand(h2, true) 
			drawables.push(this.player_hand)
			drawables.push(this.other_hand)
		},
		init: function(){
			if(this.player_hand) this.player_hand.dead = true 
			if(this.other_hand) this.other_hand.dead = true 
			
			this.values = {}
			this.set(0, 0, marker)
		},
		set: function(i, j, v){
			if(!this.values[i]){
				this.values[i] = {}
			}
			this.values[i][j] = v 
			if(v != marker){
				let open = this.get_open()
				for(let i = 0; i < open.length; i++){
					this.set(open[i].i, open[i].j, marker)
				}
				this.check_matches()
				this.check_winner()
			}
		},
		get_neighbors(i, j){
			return [
				{i: i-1, 	j: j, 	color: this.get(i-1, j)},
				{i: i+1, 	j: j, 	color: this.get(i+1, j)},
				{i: i, 		j: j-1, color: this.get(i, j-1)},
				{i: i, 		j: j+1, color: this.get(i, j+1)}
			]
		},
		get_open: function(){
			let open = []
			for(let i = minx; i <= maxx; i++){
				for(let j = miny; j <= maxy; j++){
					let color = this.get(i, j)
					if(color === black || color === white){
						let neighbors = this.get_neighbors(i, j)
						for(let k = 0; k < neighbors.length; k++){
							let n = neighbors[k]
							if(n.color === undefined){
								open.push(n)
							}
						}
					}
				}
			}
			return open 
		},
		get: function(i, j){
			if(this.values[i]){
				return this.values[i][j]
			}else{
				return undefined
			}
		},
		to_grid: function(x, y){
			let w = height/(maxx - minx)
			let h = height/(maxy - miny)
			return {
				i: Math.round((x - height/2)/w),
				j: Math.round((y - height/2)/h)
			}
		},
		to_world: function(i, j){
			let w = height/(maxx - minx)
			let h = height/(maxy - miny)
			return {
				x: i*w + height/2,
				y: j*h + height/2 
			}
		},
		draw_point: function(x, y){
			context.fillStyle = p8.light_gray
			context.fillRect(x, y, 1, 1)
		},
		draw_marker: function(x, y){
			let r = 4
			context.beginPath()
			context.moveTo(x, y - r)
			context.lineTo(x - r, y)
			context.lineTo(x, y + r)
			context.lineTo(x + r, y)
			context.lineTo(x, y - r)
			context.strokeStyle = p8.pink
			context.stroke()
		},
		draw_black: function(x, y){
			this.draw_gem(x, y, black)
		},
		draw_white: function(x, y){
			this.draw_gem(x, y, white)
		},
		draw_gem: function(x, y, color){
			let r = height/(maxx - minx)/2
			draw_circ(x, y, r, color)
		},
		draw: function(){
			for(let i = minx; i <= maxx; i++){
				for(let j = miny; j <= maxy; j++){
					let pos = this.to_world(i, j)
					let color = this.get(i, j)
					let draw_funcs = {}
					draw_funcs[undefined] = 'draw_point',
					draw_funcs[marker] = 'draw_marker'
					draw_funcs[black] = 'draw_black'
					draw_funcs[white] = 'draw_white'
					

					this[draw_funcs[color]](pos.x, pos.y)

					
				}
			}
		
			context.beginPath()
			context.fillStyle = p8.green
			let x0 = width - (width - height)/2
			let t = 0.5 + (this.player_turn ? 0.25 : -0.25)
			context.arc(x0, t*height, 5, 0, 7)
			context.fill()
			
			context.fillStyle = p8.dark_gray
			context.textAlign = 'center'
			context.textBaseline = 'middle'
			context.fillText(this.turn, x0, height/2)
			
			
		},
		update: function(){
			if(!this.player_hand || this.game_over) return 
			
			//this.player_turn = this.first_player === (this.turn % 2 === 1)
			
			if(this.player_turn){
				if(mouse.clicked){
					let pos = this.to_grid(mouse.x, mouse.y)
					let color = this.get(pos.i, pos.j)
					if(color === marker){
						this.place(pos.i, pos.j, mouse.color)
						comm.make_move(pos.i, pos.j, mouse.color, this.first_player)
						
						this.next_turn()
					}
				}
			}else{
				
				let opp = comm.get_opp_move()
				if(opp){
					let p1 = opp > 2047
					opp = opp % 2048
					
					let color = opp > 1023 ? black : white
					opp = opp % 1024
					
					let y = opp % 32 - 15 
					opp = Math.floor(opp / 32)
					
					let x = opp - 15 
					
					drawables.push(new Mover(x, y, color, true))
					
					this.next_turn()
					
				}
				
			}
		},
		next_turn: function(){
			this.player_turn = !this.player_turn 
			this.turn += 1
			
			//console.log('New turn: ', this.turn)
		},
		place: function(i, j, color){
			drawables.push(new Mover(i, j, color, false))
		},
		check_matches: function(){
			for(let i = 0; i < 5; i++){
				if(this.match(this.player_hand.cards[i])){
					this.player_hand.cards[i].flipped = true 
				}
				if(this.match(this.other_hand.cards[i])){
					this.other_hand.cards[i].flipped = true 
				}
			}
		},
		check_winner: function(){
			let p1 = true 
			let p2 = true 
			for(let i = 0; i < 5; i++){
				p1 = p1 && this.player_hand.cards[i].flipped
				p2 = p2 && this.other_hand.cards[i].flipped
			}
			if(p1 && p2){
				comm.end_game('tie')
				alert('Tie!')
				this.player_turn = false 
				this.game_over = true 
			}else if(p1){
				comm.end_game('p1')
				alert('You Win!')
				this.player_turn = false 
				this.game_over = true 
			}else if(p2){
				comm.end_game('p2')
				alert('You Lose!')
				this.player_turn = false 
				this.game_over = true 
			}
		},
		match_at: function(om, i, j){
			
			for(let k = 0; k < om.points.length; k++){
				let p = om.points[k]
				let c1 = p.color 
				let c2 = this.get(i + p.x, j + p.y)
		
				if(c1 !== c2){
					return false
				}else{
					
				}
			}
			return true  
		},
		match: function(om){
			//console.log(om)
			for(let i = minx; i <= maxx; i++){
				for(let j = miny; j < maxy; j++){
					for(let k = 0; k < 4; k++){
						if(this.match_at(om, i, j)){
							return true 
						}
						om.rot90()
					}
				}
			}
			return false 
		}
		
	}
	
	function Mover(i, j, color, top){
		console.log(i, j, color)
		this.i = i 
		this.j = j 
		this.color = color 
		this.x = height/2 
		this.y = top ? -50 : height + 50 
		this.target = grid.to_world(i, j)
	}
	
	Mover.prototype.draw = function(){
		draw_circ(this.x, this.y, 8, this.color)
	}
	
	Mover.prototype.update = function(){
		let dx = this.target.x - this.x 
		let dy = this.target.y - this.y 
		let r = 1
		let v = .2
		if(dx*dx + dy*dy < r){
			this.dead = true 
			grid.set(this.i, this.j, this.color)
		}else{
			this.x += v*dx 
			this.y += v*dy 
		}
	}
	
	function Pool(x, y, color){
		this.r = 16
		this.x = x 
		this.y = y 
		this.color = color 
	}
	
	Pool.prototype.update = function(){
		this.active = mouse.color === this.color 
		if(mouse.clicked){
			let dx = this.x - mouse.x 
			let dy = this.y - mouse.y 
			if(dx*dx + dy*dy < this.r*this.r){
				mouse.color = this.color 
			}
		}
	}
	
	Pool.prototype.draw = function(){
		draw_circ(this.x, this.y, this.r, this.color)
		if(this.active){
			let s = 1.25
			context.strokeStyle = p8.red 
			context.strokeRect(this.x - s*this.r, this.y - s*this.r, 2*s*this.r, 2*s*this.r)
		}
	}
	
	
	function Point(id){
		this.color = id > 7 ? black : white 
		this.y = id % 2 
		this.x = Math.floor(id/2) % 4 
	}
	
	Point.prototype.draw = function(x0, y0, r){
		draw_circ(x0 + 2*r*this.x, y0 + 2*r*this.y, r, this.color)
	}
	
	function Omino(id, x, y){
		this.id = id 
		this.x = x
		this.y = y 
		this.flipped = false 
		this.points = []
		for(let i = 0; i < 4; i++){
			this.points.push(new Point(id % 16))
			id = Math.floor(id/16)
		}
		
	}
	
	Omino.prototype.rot90 = function(){
		let minx = 0
		let maxx = 0
		let miny = 0
		let maxy = 0
		for(let i = 0; i < this.points.length; i++){
			let p = this.points[i]
			let tempx = p.x 
			p.x = -p.y 
			p.y = tempx 
			
			minx = Math.min(p.x, minx)
			maxx = Math.max(p.x, maxx)
			miny = Math.min(p.y, miny)
			maxy = Math.max(p.y, maxy)
		}
		
		for(let i = 0; i < this.points.length; i++){
			let p = this.points[i]
			p.x -= minx
			p.y -= miny 
		}
	}
	
	Omino.prototype.draw = function(){
		let r = this.flipped ? 3 : 6
		this.points.forEach(p => p.draw(this.x, this.y, r))
	}
	
	Omino.prototype.update = function(){
		if(mouse.clicked){
			let dx = this.x - mouse.x
			let dy = this.y - mouse.y	
			let r = 20
			if(dx*dx + dy*dy < r*r){
				this.rot90()
			}
		}
	}
	
	function Hand(id, top){
		let ids = []
		while (id > 0){
			ids.push(cards[id % 70])
			id = Math.floor(id / 70)
		}
		
		this.cards = []
		let cw = (width - height)/5
		let x = height - cw
		let y = top ? cw/2 : height - cw
	
		for(let i = 0; i < 5; i++){
			x += 1.5 * cw
			if(x >= width){
				x = height + 1.5*cw
				y += top ? cw : -cw 
			}
			let id = ids[i]
			this.cards.push(new Omino(id, x, y))
		}
	}
	
	Hand.prototype.draw = function(){
		this.cards.forEach(c => c.draw())
	}
	
	Hand.prototype.update = function(){
		this.cards.forEach(c => c.update())
	}
	
	window.onload = function(){
		
		canvas = document.getElementById('canvas')
		context = canvas.getContext('2d')
		canvas.width = width 
		canvas.height = height 
		context.fillStyle = p8.white 
		context.fillRect(0, 0, width, height)
		mouse.init()
		grid.init()
		
		let margin_width = width - height 
		drawables = [
			grid,
			new Pool(height + .25*margin_width, height/2, white),
			new Pool(height + .75*margin_width, height/2, black),
			//new Hand(799237151, true),
			//new Hand(956874995, false)
		]
		
		let ids = ['new_game', 'go']
		ids.forEach(function(id){
			let butt = document.getElementById(id)
			butt.onclick = function(){
				comm[id]()
			}
		})
		
		
		update()
	}
	
	function update(){
		context.fillStyle = p8.white 
		context.fillRect(0, 0, width, height)
		
		drawables.forEach(function(d){
			d.update()
			d.draw()
		})
		
		drawables = drawables.filter(x => x.dead !== true)
		
		mouse.update()
		window.requestAnimationFrame(update);
	}

//})()