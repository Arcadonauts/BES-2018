(function(){
	
	let timeStep = 20 
	let maxTime = 100*timeStep
	
	let HR = {
		init: function(building, people){
			this.building = building
			this.people = people 
		},
		jobs: {
			intern: {
				level: 0
			},
			agent: {
				level: 1
			},
			director: {
				level: 3
			},
			security: {
				level: 3
			},
			it: {
				level: 2
			},
			janitor: {
				level: 2
			}
		},
		rooms: {
			conference: {
				level: 0
			},
			office: {
				level: 1
			},
			bathroom: {
				level: 0
			},
			server: {
				level: 2
			},
			security: {
				level: 3
			},
			lounge: {
				level: 0
			}
		},
		
	
	}
	
	function Timeline(scene){
	
		this.scene = scene 
		this.margin = 50 
		this.r = 15 
		let y = 1.85*scene.cameras.main.centerY
		this.width = this.scene.cameras.main.centerX*2 - 2*this.margin
		
		this.graphics = scene.add.graphics({
			x: this.margin,
			y: y,
			lineStyle: {
				width: 6,
				color: 0x000000, 
			},
			fillStyle: {
				color: Phaser.Display.Color.HSVToRGB(0, 0.0, 0.25).color
			}
		})

		this.graphics.setInteractive({
			hitArea: {
				x: this.margin,
				y: y - this.r, 
				width: this.width, 
				height: 2*this.r
			},
			hitAreaCallback: function(hitArea, x, y, gameObject){
				return x > 0 && x < hitArea.width && Math.abs(y) < hitArea.height 
			}
		})
		this.scene.input.setDraggable(this.graphics, true)
		

		let that = this 
		
		function getTime(pointer){
			return Phaser.Math.Clamp(maxTime*(pointer.x - that.margin)/that.width, 0, maxTime)
		}
		
		this.graphics.on('dragstart', function(pointer, x, y){
			that.dragging = true 
			that.scene.t = getTime(pointer)
		})
		
		this.graphics.on('drag', function(pointer, x, y){
			
			that.scene.t = getTime(pointer)
		})
		
		this.graphics.on('dragend', function(pointer, x, y){
			that.dragging = false 
			that.scene.t = getTime(pointer)
		})
		
	

	}
	
	Timeline.prototype.update = function(){
		let x0 = this.width*this.scene.t/maxTime
		let r = this.r 
		this.graphics.clear()
		this.graphics.beginPath()
		this.graphics.moveTo(0, 0)
		this.graphics.lineTo(this.width, 0)
		this.graphics.strokePath()
		
		this.graphics.fillCircle(x0, 0, r)
		this.graphics.strokeCircle(x0, 0, r)
		
		if(!this.dragging && this.scene.t < maxTime){
			this.scene.t += 1 
		}
	}

	window.play = {
		create: function(){
			this.t = 0 
			let house = new Building(this, 15, 15, 3, 4)
			this.guys = []
			for(let i = 0; i < 8; i++){
				this.guys.push(new Character(this, house))
			}
			this.timeline = new Timeline(this)
		
		},
		update: function(){
			
			this.timeline.update()
			this.guys.forEach(guy => guy.update(this.t, timeStep))
			
		}
	}

})()