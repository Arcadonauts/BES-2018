(function(){
	
	const tw = 25 


	function Building(scene, width, height, rows, cols){
		this.rows = rows || 4
		this.cols = cols || 3
		this.scene = scene
		this.width = width 
		this.height = height 
		let x = 50 
		let y = 50 
		
		this.rooms = [] 
		this.entrances = []
		this.interiorDoors = [] 

			
		this.container = this.scene.add.container(x, y)
		this.container.setInteractive({
			hitArea: {
				x: x,
				y: y, 
				width: tw*width, 
				height: tw*height
			},
			hitAreaCallback: function(hitArea, x, y, gameObject){
				return x > 0 && x < hitArea.width && y > 0 && y < hitArea.height 
			}
		})
		
		let that = this 
		this.container.on('pointermove', function(pointer, x, y){
			this.scene.hud.showRoom(that.getWorld(pointer.x, pointer.y).room)
		})
			
		this.footprint()
		this.divide()
		this.halls()
		this.createRooms()
		this.doors()
	
		//this.graphics()

		
		return this 
	}
	
	Building.prototype.getWorld = function(x, y){
		return this.get(
			Math.floor((x - this.container.x)/tw),
			Math.floor((y - this.container.y)/tw)
		)
	}
	
	Building.prototype.forEach = function(func){
		for(let i = 0; i < this.width; i++){
			for(let j = 0; j < this.height; j++){
				func(this.get(i, j), i, j)
			}
		}
	}
	
	Building.prototype.footprint = function(){
		let grid = []
		
		for(let i = 0; i < this.height; i++){
			for(let j = 0; j < this.width; j++){
				grid.push(this.cell(i, j))
			}
		}
		
		let index = (x, y) => {
			if(x < 0 || y < 0 || x >= this.width || y >= this.height){
				return undefined
			}else{
				return x + this.width*y 
			}
		}
		this.get = function(x, y){
			return grid[index(x, y)]
		}
	}
	
	Building.prototype.cell = function(j, i){
		let c = new Phaser.Display.Color(255, 255, 255)
		c.random()
		return {
			i: i,
			j: j,
			color: c,
			x: i*tw + tw/2,
			y: j*tw + tw/2,
			id: i + this.width*j,
			use: 0 
		}
	}
	
	Building.prototype.path = function(a, b){
		 
		if(a.room === b.room){
			if(a.room === -1){
				return this.breadthPath(a, b)
			}else{
				return this.diagonalPath(a, b)
			}
			
		}else{
			if(a.room === -1){
				let bDoor = this.interiorDoors[b.room]
				return this.breadthPath(a, bDoor).concat(this.diagonalPath(bDoor, b))
			}else if(b.room === -1){
				let aDoor = this.interiorDoors[a.room]
				return this.diagonalPath(a, aDoor).concat(this.breadthPath(aDoor, b))
			}else{
				let aDoor = this.interiorDoors[a.room]
				let bDoor = this.interiorDoors[b.room]
				return this.diagonalPath(a, aDoor).concat(this.breadthPath(aDoor, bDoor)).concat(this.diagonalPath(bDoor, b))
			}
		}
	}
	
	Building.prototype.breadthPath = function(a, b){
		//https://www.redblobgames.com/pathfinding/tower-defense/
		let frontier = []
		frontier.push(a)
		let cameFrom = {}
		cameFrom[a.id] = false
		let found = false 
		
		while(frontier.length && !found){
			//console.log(frontier.length)
			let current = frontier.shift()
			this.getAdjacent(current).forEach(next => {
				
				if(cameFrom[next.id] === undefined){
					
					frontier.push(next)
					cameFrom[next.id] = current 
					if(next === b){
						found = true 
					}
				}
			})
		}
		
		
		if(found){
			let path = []
			let prev = cameFrom[b.id]
			while(cameFrom[prev.id]){
				
				path.unshift(prev)
				prev = cameFrom[prev.id]
			}
			
			return path 
		}else{
			return []
		}
	}
	
	Building.prototype.diagonalPath = function(c0, cf){
		let c = c0  
		let path = [c]
		let ver = c0.i == cf.i 
		//console.log(c0.i, c0.j, cf.i, cf.j)
		while(c !== cf){
			//console.log(c.i, c.j)
			let di = Phaser.Math.Clamp(cf.i - c.i, -1, 1)
			let dj = Phaser.Math.Clamp(cf.j - c.j, -1, 1)
			
			if(di === 0){
				c = this.get(c.i, c.j + dj)
			}else if(dj === 0){
				c = this.get(c.i + di, c.j)
			}else if(ver){
				c = this.get(c.i + di, c.j)
				ver = !ver 
			}else{
				c = this.get(c.i, c.j + dj)
				ver = !ver 
			}
			path.push(c)
		}
		return path 
	}
	
	Building.prototype.getAdjacent = function(cell){
		
		let neighs = this.getNeighbors(cell).filter(x => x)
		let keepers = []
		neighs.forEach(neigh => {
			if(neigh.room === cell.room){
				keepers.push(neigh)
			}else if(neigh.room === -1 && cell.door){
				keepers.push(neigh)
			}else if(cell.room === -1 && neigh.door){
				keepers.push(neigh)
			}
		})
		//console.log(keepers.length)
		return keepers
	}
	
	Building.prototype.divide = function(){
		let rows = this.rows 
		let cols = this.cols 
		this.forEach((cell, i, j) => {
			let rw = this.width/cols 
			let rh = this.height/rows 

			let rx = Math.floor(i/rw)
			let ry = Math.floor(j/rh)
			let room = rx + cols*ry

			cell.room = room 
			
			//this.rooms[room].push(cell)
		})
	}
	
	Building.prototype.createRooms = function(){
		this.forEach(cell => {
			if(!this.rooms[cell.room]){
				let room = [] 
				
				this.rooms[cell.room] = room 
			}
			this.rooms[cell.room].push(cell)
		})
	}
	
	Building.prototype.connections = function(){
		let connections = []
		this.forEach((cell, i, j) => {
			let neigs = [
				this.get(i - 1, j),
				this.get(i + 1, j),
				this.get(i, j - 1),
				this.get(i, j + 1)
			]
			
			neigs.forEach(n => {
				if(n && n.room !== cell.room){
					if(!connections[cell.room]){
						connections[cell.room] = []
					}
					let cons = connections[cell.room]
					if(cons.indexOf(n.room) === -1){
						cons.push(n.room)
					}
				}
			})
		})
		return connections
	}
	
	Building.prototype.accessibility = function(){
		let access = []
		this.forEach((cell, i, j) => {
			
		})
	}
	
	Building.prototype.isConnected = function(){
		let connections = this.connections()
		for(let i = 0; i < connections.length; i++){
			if(connections[i].indexOf(-1) === -1){
				return false 
			}
		}
		return true 
	}
	
	Building.prototype.halls = function(){
		
		let vert = true 
		while(!this.isConnected()){
			
			let i = random.between(0, this.width - 2)//Math.floor((this.width-1)*Math.random())
			let j = random.between(0, this.height - 2)//Math.floor((this.height-1)*Math.random())
			
			//let vert = Math.floor(2*Math.random())
		
			let cellA = this.get(i, j)
			let cellB = this.get(i + vert, j + 1 - vert)
	
			if(cellA.room !== cellB.room && cellA.room !== -1 && cellB.room !== -1){
				this.addHall(cellA, cellB)
				vert = !vert
			}
			
			
			
		}
	}
	
	Building.prototype.doors = function(){
		this.rooms.forEach(room => {
			let potentials = []
			room.forEach(cell => {
				let neighs = this.getNeighbors(cell)
				
				let walls = neighs.filter(neigh => neigh && neigh.room === -1)
				if(walls.length === 1){
					if(neighs.filter(neigh => !neigh || neigh.room !== cell.room && neigh.room !== -1).length === 0){
						potentials.push(cell)
					}
				}
			})
			
			if(potentials.length > 0){
				this.addDoor(random.pick(potentials))
			}
			
		})
		
		//let potentials = []
		this.forEach(cell => {
			if(cell.room === -1){
				let neighs = this.getNeighbors(cell)
				if(neighs.south === undefined){
					cell.door = true 
					this.entrances.push(cell)
				}
			}
		})
	}
	
	Building.prototype.addHall = function(cellA, cellB){

		if(cellA.i === cellB.i){ // A/B
			for(let i = 0; i < this.width; i++){
				this.get(i, cellA.j).room = -1 
				//this.get(i, cellB.j).room = -1 
			}
		}else if(cellA.j === cellB.j){ // A|B 
			for(let j = 0; j < this.height; j++){
				this.get(cellA.i, j).room = -1 
				//this.get(cellB.i, j).room = -1 
			}
		}else{
			console.warn('huh?')
		}
	}
	
	Building.prototype.addDoor = function(cell){
		cell.door = true 
		this.interiorDoors.push(cell)
	}
	
	Building.prototype.getNeighbors = function(cell){
		let i = cell.i 
		let j = cell.j 
		
		let north = this.get(i, j-1)
		let south = this.get(i, j+1)
		let east = this.get(i-1, j)
		let west = this.get(i+1, j)
		
		let op = [west, north, east, south]
		op.north = north
		op.south = south 
		op.east = east 
		op.west = west 
		
		return op 
	}
	
	Building.prototype.graphics = function(){
		function drawWall(cell, neigh){
			return (
				neigh === undefined || (
					neigh.room !== cell.room && (
						cell.room !== -1 && !cell.door || cell.room === -1 && !neigh.door
					)
				)
			)
		}
		
		let w = 4
			
			
		let graphics = this.scene.add.graphics({
			x: 0,
			y: 0,
			lineStyle: {
				width: 2*w,
				color: 0xffffff, //cell.color.color
			}
	
		})
		
		this.container.add(graphics)
		
		graphics.fillStyle(0x000000)
		graphics.fillRect(-w, -w, tw*this.width+2*w, tw*this.height+2*w)
		
		this.forEach((cell, i, j) => {
			let x0 = cell.x - tw/2
			let y0 = cell.y - tw/2 
			
			if(cell.room === -1){
				cell.color.setFromHSV(0.25, 0.75, 0.5)
			}else{
				let h = cell.room/(this.rows*this.cols)
				let s = 1
				let v = 1 
				cell.color.setFromHSV(0.5 + ((i + j)%2)*0.125, 0.75, 0.5)
			
			}
			
			//cell.color.setFromHSV(0.0, 0.5, 0.5+0.01*cell.use)
			cell.color.setFromHSV(0.1*cell.room, 0.5, 0)
			
			graphics.fillStyle(cell.color.color)
			graphics.fillRect(x0, y0, tw, tw)
			
		})
		
		this.forEach((cell, i, j) => {
			
			
			
			let x0 = cell.x - tw/2 
			let y0 = cell.y - tw/2
			

			graphics.beginPath()
			
			let neighs = this.getNeighbors(cell)
			let north = neighs.north 
			let south = neighs.south 
			let east = neighs.east 
			let west = neighs.west 
			
			// N 
			if(drawWall(cell, north)){
				graphics.moveTo(x0 - w, 	 y0)
				graphics.lineTo(x0 + tw + w, y0)
			}
			
			// S 
			if(drawWall(cell, south)){
				graphics.moveTo(x0 - w, 	 y0 + tw)
				graphics.lineTo(x0 + tw + w, y0 + tw)
			}
			
			// E 
			if(drawWall(cell, east)){
				graphics.moveTo(x0, 	 y0 - w)
				graphics.lineTo(x0,		 y0 + tw + w)
			}
			
			// W 
			if(drawWall(cell, west)){
				graphics.moveTo(x0 + tw, y0 - w)
				graphics.lineTo(x0 + tw, y0 + tw + w)
			}
			
			graphics.strokePath()
			
			if(!true){
				let text = this.scene.add.text(x0 + tw/2, y0 + tw/2, cell.id)
				text.setOrigin(0.5)
				text.setScale(0.5)
				
				this.container.add(text)
			}
			/*
			let text1 = this.scene.add.text(i*tw, j*tw, cell.use)
			//let text2 = this.scene.add.text((i+1)*tw, (j+1)*tw, cell.j)
			text1.setOrigin(00)
			//text2.setOrigin(1)
			this.container.add(text1)
			//this.container.add(text2)
			//*/
			
			
		})
	
	}
	
	Building.prototype.getRoomsBy = function(flavor){
		return this.rooms.filter(room => room.flavor === flavor)
	}
	
	Building.prototype.getRandomRoom = function(flavor){
		if(flavor){
			return random.pick(this.getRoomsBy(flavor))
		}else{
			console.error("No flavor")
			return random.pick(this.rooms)
		}
	}
	
	Building.prototype.pick = function(a, t){
		a.sort((a, b) => {
			if(a.i === b.i){
				return a.j - b.j
			}else{
				return a.i - b.i
			}
		})
		//random.shuffle(list) // prevent from always starting in the corner and moving down 
		let leastUsed = a[0]
		a.forEach(cell => {
			if(cell.use < leastUsed.use){
				leastUsed = cell 
			}
		})
		
		//console.log('use')
		//choice.use += t
		return leastUsed
	}
	
	window.Building = Building
	

})()