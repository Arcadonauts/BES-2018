(function(){
	function Character(scene, building){
		this.scene = scene 
		this.building = building
		let targets = []
		for(let i = 0; i < 5; i ++){
			targets.push(building.get(
				random.between(0, building.width-1), 
				random.between(0, building.height-1)
			))
		}
		this.agenda = []
		for(let i = 0; i < targets.length - 1; i++){
			//this.agenda = this.agenda.concat(building.path(targets[i], targets[i+1]))
		}
		
		//this.createGraphics()
		
		this.getName()
		this.color = Phaser.Display.Color.ValueToColor(0)
		this.color.setFromHSV(0, 1, 1)
		
		
		return this 
	}
	
	Character.prototype.makeShifter = function(people){
		
		//this.color.setFromHSV(0.25, 1, 1)
		
		this.createGraphics()
		
		this.identity = []
		 
		let shiftTimes = [0]
		let t = 0
		while(t < this.agenda.length){
			t += random.between(20, 100)
			shiftTimes.push(t)
		}
		
		let shifted = true 
		let shifts = []
		for(let i = 0; i < shiftTimes.length - 1; i++){
			let t0 = shiftTimes[i]
			let t1 = shiftTimes[i+1]
			let rooms = this.inRoomsBetween(t0, t1)
			let see = this.seeWhoBetween(people, t0, t1)
			
			
			let name 
			if(rooms.indexOf(-1) === -1 || shifted || see.length === people.length || rooms.length === 1){
				name = this.name 
				shifted = false 
			}else{
				let copy = random.pick(people.filter(x => see.indexOf(x) === -1))
				name = copy.name 
				shifted = true 
			}
			
			
			shifts.push(name)
			
			
		}
		
		console.groupCollapsed("Click here if you are a cheater...")
		console.log(this.name, "is the shifter")
		shiftTimes.forEach((t, i) => {
			console.log(t, shifts[i])
		})
		console.groupEnd()
		
		
		let i = 0
		let t0 = shiftTimes[i]
		let t1 = shiftTimes[i+1]
		let identity = this.name 
		this.agenda.forEach((cell, t) => {
			if(t > t1){
				i += 1
				t0 = shiftTimes[i]
				t1 = shiftTimes[i+1]
			}
			if(cell.room === -1){
				identity = shifts[i]
			}
			this.identity.push(identity)
		})
		
		this.shifter = true 
		
	},
	
	Character.prototype.seeWhoBetween = function(people, t0, t1){
		let seen = [] 
		
		for(let t = t0; t < t1; t++){
			this.update(t, 1)
			people.forEach(person => {
				person.update(t, 1)
				if(person.room === this.room && this.room != -1){
					if(!seen.find(x => x.name === person.name)){
						seen.push(person)
					}
				}
			})
		}
		
		return seen 
	}
	
	Character.prototype.inRoomsBetween = function(t0, t1){
		let rooms = [] 
		for(let t = t0; t < t1; t++){
			this.update(t, 1)
			
			if(rooms.indexOf(this.room) === -1){
				rooms.push(this.room)
			}
		}
		return rooms 
	}
	
	Character.prototype.createGraphics = function(){
		if(this.graphics){
			this.graphics.clear()
		}else{
			this.graphics = this.scene.add.graphics({
				x: 50,
				y: 50,
				lineStyle: {
					width: 1,
					color: 0x000000, 
				},
				fillStyle: {
					color: this.color.color
				}
		
			})
			
			this.building.container.add(this.graphics)
			
			/*
			this.nameText = this.scene.add.text(0, 0, ''+this.name)
			this.building.container.add(this.nameText)
			this.nameText.setOrigin(0.5, 1)
			//*/
		}
	
		let r = 6
		this.graphics.strokeCircle(0, 0, r)
		this.graphics.fillCircle(0, 0, r)
		
	
	}
	
	Character.prototype.getName = function(){
		/*
		https://www.thoughtco.com/most-common-us-surnames-1422656
		https://www.ssa.gov/OACT/babynames/decades/century.html
		*/
		let firsts = this.scene.cache.text.entries.entries['firsts'].split('\n')
		let lasts = this.scene.cache.text.entries.entries['lasts'].split('\n')
		
		let first = random.pick(firsts).split('\t')[0]
		let last = random.pick(lasts).split('\t')[0]
		let name
		if(random.frac() < 0.2){
			let middle = random.pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
			name = first + ' ' + middle + '. ' + last 
		}else{
			name = first + ' ' + last 
		}
		
		this.lastName = last 
		this.name = name 
		
		//this.nameText.text = this.name 
	}
	
	Character.prototype.shiftUpdate = function(t0){
		this.name = this.identity[t0]
	}
	
	Character.prototype.update = function(t, step){
		
		
		let t0 = Math.floor(t/step)
		let dt = (t - step*t0)/step
		
		if(this.shifter){
			this.shiftUpdate(t0)
		}
		
		let a, b 
		if(t0 > this.agenda.length - 2){
			a = this.agenda[this.agenda.length - 2]
			b = this.agenda[this.agenda.length - 1]
			dt = 1

		}else{
			a = this.agenda[t0]
			b = this.agenda[t0+1]
		}
		
		
		if(a && b){
			let x0 = a.x 
			let x1 = b.x 
			let y0 = a.y 
			let y1 = b.y 
			
			if(a.room === -1){
				this.room = b.room 
			}else{
				this.room = a.room 
			}
			
			if(this.graphics){
			
				this.graphics.x = Phaser.Math.Linear(x0, x1, dt) + Math.sin(2*Math.PI*dt)
				this.graphics.y = Phaser.Math.Linear(y0, y1, dt) + Math.cos(2*Math.PI*dt)
				
				if(a === b && a.room === -1 && a.door){
					this.graphics.alpha = 0 
				}else{
					this.graphics.alpha = 1 
				}
				
				//*
				if(this.nameText){
					this.nameText.text = this.name 
					this.nameText.x = this.graphics.x 
					this.nameText.y = this.graphics.y 
				}
				
				
				//*/
			}
		}
		
		
	}

	window.Character = Character
})()