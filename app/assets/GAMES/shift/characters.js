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
		
		return this 
	}
	
	Character.prototype.createGraphics = function(){
		this.graphics = this.scene.add.graphics({
			x: 50,
			y: 50,
			lineStyle: {
				width: 1,
				color: 0x000000, 
			},
			fillStyle: {
				color: Phaser.Display.Color.HSVToRGB(0, 1, 1).color
			}
	
		})
		
		this.building.container.add(this.graphics)
		let r = 6
		this.graphics.strokeCircle(0, 0, r)
		this.graphics.fillCircle(0, 0, r)
		
		/*
		this.purposeText = this.scene.add.text(0, 0, ''+this.name)
		this.building.container.add(this.purposeText)
		this.purposeText.setOrigin(0.5, 0)
		
		
		this.nameText = this.scene.add.text(0, 0, ''+this.name)
		this.building.container.add(this.nameText)
		this.nameText.setOrigin(0.5, 1)
		*/
		
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
	
	Character.prototype.update = function(t, step){
		let t0 = Math.floor(t/step)
		let dt = (t - step*t0)/step
		
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
			
			this.graphics.x = Phaser.Math.Linear(x0, x1, dt) + Math.sin(2*Math.PI*dt)
			this.graphics.y = Phaser.Math.Linear(y0, y1, dt) + Math.cos(2*Math.PI*dt)
			
			/*
			this.nameText.x = this.graphics.x 
			this.nameText.y = this.graphics.y 
			
			this.purposeText.x = this.graphics.x 
			this.purposeText.y = this.graphics.y 
			
			this.purposeText.text = b.purpose
			*/
		}
		
		
	}

	window.Character = Character
})()