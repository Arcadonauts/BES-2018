(function(){
	
	let CustomPipeline2 = new Phaser.Class({

		Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

		initialize:

		function CustomPipeline2 (game, text)
		{
			Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
				game: game,
				renderer: game.renderer,
				fragShader: text
			});
		} 

	});
	
	let timeStep = 20 
	let maxTime = 500*timeStep
	
	function keys(obj){
		let ks = []
		for(let k in obj){
			if(obj.hasOwnProperty(k)){
				ks.push(k)
			}
		}
		return ks 
	}
	
	let hud = {
		init: function(scene, hr){
			this.scene = scene 
			scene.hud = this 
			
			this.hr = hr 
			
			this.create()
			
		},
		create: function(){
			this.title = this.scene.add.text(this.scene.cameras.main.centerX, 0.25*this.scene.cameras.main.centerY, 'Title', {
				fill: 'white',
				fontFamily: 'retro',
				fontSize: '24pt',
				align: 'left'
			})
			this.title.setOrigin(0)
			this.occupants = this.scene.add.text(this.scene.cameras.main.centerX, 0.4*this.scene.cameras.main.centerY, 'Occupants\nOccupants', {
				fill: 'white',
				fontFamily: 'retro',
				fontSize: '20pt',
				align: 'left'
			})
			
		},
		showRoom: function(index){
			this.roomIndex = index 
			this.updateRoom()
		},
		updateRoom: function(){
			let index = this.roomIndex
			let room = this.hr.building.rooms[index]
			if(index > -1){
				this.title.text = room.template.title.replace(/%s/g, room.name) 
				
				let occupants = this.hr.people.filter(p => p.room === index).map(p => (p.name + ' (' + p.job + ')'))
				if(occupants.length){
					this.occupants.text = ['Occupants:'].concat(occupants).join('\n\t')
				}else{
					this.occupants.text = 'empty'
				}
				
			}else{
				this.title.text = '' 
				this.occupants.text = ''
			}
		}
	}
	
	let hr = {
		init: function(building, people){
			this.building = building
			this.people = people 
			
			this.assignJobs(people)
			this.assignRooms(building, people)
			let schedule = this.createSchedule(building, people)
			people.forEach(person => {
				this.createPath(person, schedule, building)
			})
		},
		timeToClock: function(time){
			return time*8/maxTime + 9 
		},
		clockToTime: function(hours){
			return Math.floor((hours - 9)*maxTime/8)
		},
		timeToString: function(time){
			let hours = this.timeToClock(time)
			
			let hr = Math.floor(hours) % 12 
			let apm = hours >= 12 ? 'PM' : 'AM'
			let min = Math.floor(60*(hours - Math.floor(hours)))
			
			if(min < 10){
				min = '0' + min 
			}
			
			if(hr === 0){
				hr = 12
			}
			
			return hr + ":" + min + ' ' + apm 
		},
		isAvailable: function(start, dur, schedule, who){
			
			let times = keys(schedule)
			for(let i = 0; i < times.length; i++){
				let time = times[i]
				if(time >= start && time <= start + dur){
					
					
					for(let j = 0; j < who.length; j++){
						let name = who[j]
						if(schedule[time][who] !== undefined){
							//console.log('busy', name, time)
							return false 
						}
					}
				}
			}
			return true 
		},
		whoIsOpen: function(schedule){
			let opens = []
			for(let t in schedule){
				if(schedule.hasOwnProperty(t)){
					for(let p in schedule[t]){
						if(schedule[t].hasOwnProperty(p)){
							if(schedule[t][p] === undefined){
								if(opens.indexOf(p) === -1){
									opens.push(p)
								}
							}
						}
					}
				}
			}
			return opens 
		},
		addEvent: function(key, schedule, people, all){
			let e = this.events[key]
			let who = undefined
			if(e.who === 'all'){
				who = people.map(p => p.name)
			}else{
				who = people.filter(p => e.who.indexOf(p.job) > -1).map(p => p.name) 
			}
			
			if(!all){
				who = [random.pick(who)]
			}
			
			let dur = random.realInRange(e.duration[0], e.duration[1])
			
			let times = keys(schedule).map(x => +x)
			random.shuffle(times)
			let start = e.start 
			let i = 0
			
			while(!start){
				if(this.isAvailable(times[i], dur, schedule, who)){
					start = times[i]
				}
				i += 1
				if(i > times.length){
					return 
				}
			}
			start = +start 
			if(!start){
				return 
			}
			
			//console.log('add', key, 'at', start, 'for', dur)
			
			
			who.forEach(p => {
			
				
				times.forEach(time => {
					if(time >= start && time <= start + dur){
						schedule[time][p] = key 
						
					}
				})
				
			})
			
			
		},
		createSchedule: function(building, persons){
			let people = persons.slice()
			let schedule = {}
			for(let i = 9.0; i < 17; i += 0.25){ //Magic Numbers: 9:00 AM, 5:30 PM, 15 minutes 
				let timeSlot = {}
				people.forEach(person => {
					timeSlot[person.name] = undefined
					
				})
				schedule[i] = timeSlot
			}
			
			this.addEvent('arrive', schedule, people, true)
			this.addEvent('lunch', schedule, people, true)
			this.addEvent('leave', schedule, people, true)
			
			this.addEvent('meeting', schedule, people, true)
			this.addEvent('meeting', schedule, people, true)
			
			let opens = this.whoIsOpen(schedule)
			let es = keys(this.events)
			let limit = 1000
			while(opens.length && limit){
				let e = random.pick(es)
				this.addEvent(e, schedule, people.filter(p => opens.indexOf(p.name) > -1), false)
				
				opens = this.whoIsOpen(schedule)

				limit -- 
			}
			
			let table = []
			let times = keys(schedule).map(x => +x)
			times.sort((a, b) => a - b)
			
			times.forEach(t => {
				table.push(schedule[t])
			})
			console.table(table)
			//console.log(schedule)
			
			return schedule
		},
		createPath: function(who, schedule, building){
			
			let tasks = []
			let times = keys(schedule).map(t => +t)
			times.sort((a, b) => a - b)
			times.forEach(t => {
				t = +t 
				tasks.push({
					evnt: schedule[t][who.name],
					time: this.clockToTime(t)
				})
				
			})
			
			let agenda = []
			//console.groupCollapsed(who.name, who.job)
			
			tasks.forEach(task => {
				
				let evnt = this.events[task.evnt]
				let where = random.pick(evnt.where)
				let time = task.time 
				let room
				
				if(where === 'office'){
					room = who.office
				}else if(where === '*office'){
					room = building.getRandomRoom('office')
				}else if(where === 'base'){
					room = building.getRandomRoom(this.jobs[who.job].base)
				}else if(where === 'hall'){
					room = building.rooms[-1]
				}else if(where === 'entrance'){
					room = building.entrances
				}else{
					room = building.getRandomRoom(where)
				}
				
				let target = building.pick(room, 1)
				//console.log(task.time, where, room.flavor)
				if(agenda.length === 0){
					agenda.push(target)
					
				}else{
					let start = agenda[agenda.length - 1]
					if(target.room === start.room){
						
						target = start
						
					}
					
					let path = building.path(start, target)
					
					
					agenda = agenda.concat(path)
					
					
					while(agenda.length*timeStep < time){
					
						agenda.push(target)
					
					}
					/*
					while(agenda.length*timeStep > time){
						agenda.pop()
					}
					*/
					
				}
				
				
				
			})
			agenda.forEach(cell => {
				cell.use++
			})
			who.agenda = agenda 
			//console.groupEnd()
			//console.log(timeStep*agenda.length, maxTime)
			
			
			
		},
		assignRooms: function(building, people){
			let rooms = []
			let got = {}
			people.forEach(person => {
				let job = this.jobs[person.job]
				if(job.office === true){
					rooms.push({
						room: 'office',
						name: job.title.replace(/%s/g, person.lastName)
					})
				}else if(job.office){
					if(!got[job.office]){
						rooms.push({
							room: job.office
						})
						
						got[job.office] = true 
					}
				}
			})
			
			let optionalRooms = []
			for(key in this.rooms){
				if(this.rooms.hasOwnProperty(key)){
					let room = this.rooms[key]
					if(room.required){
						rooms.push({
							room: key
						})
					}
					if(!room.assigned){
						optionalRooms.push({
							room: key
						})
					}
				}
			}
			
			let i = 0 
			random.shuffle(optionalRooms)
			while(rooms.length < building.rooms.length){
				rooms.push(optionalRooms[i])
				i += 1 
				i %= optionalRooms.length 
			}
			
			rooms.sort((a, b) => this.rooms[a.room].size - this.rooms[b.room].size)
			let buildingRooms = building.rooms.slice()
			buildingRooms.sort((a, b) => a.length - b.length)
			
			rooms.forEach((room, i) => {
				buildingRooms[i].name = room.name 
				buildingRooms[i].template = this.rooms[room.room]
				buildingRooms[i].flavor = room.room 
			})
			
			
		},
		assignJobs: function(people){
			let min = 0 
			let max = 0 
			for(let job in this.jobs){
				if(this.jobs.hasOwnProperty(job)){
					this.jobs[job].count = 0 
					this.jobs[job].key = job 
					min += this.jobs[job].min 
					max += this.jobs[job].max 
				}
			}
			
			if(people.length < min || people.length > max){
				console.error("Wrong number of people:", people.length, "min:", min, "max:", max)
			}
			
			people.forEach(person => {
				let jobList = []
				for(let j in this.jobs){ // first satisfy the minumm requirement 
					if(this.jobs.hasOwnProperty(j)){
						let job = this.jobs[j]
						if(job.count < job.min){
							jobList.push(job)
						}
					}
				}
				if(jobList.length === 0){ // then satisfy the max requirement
					for(let j in this.jobs){
						if(this.jobs.hasOwnProperty(j)){
							let job = this.jobs[j]
							if(job.count < job.max){
								jobList.push(job)
							}
						}
					}
				}
				
		
				let job = random.pick(jobList)
				person.job = job.key
				job.count += 1 
				
				console.log(person.name, person.job)
			})
		},
		events: {
			lunch: {
				who: 'all',
				start: 12,
				duration: [0.75, 1.25],
				where: ['lounge']
			},
			checkin: {
				who: 'all',
				start: 9.25,
				duration: [0, 0.25],
				where: ['base']
			},
			phone: {
				who: 'all',
				duration: [0.25, 1],
				where: ['base']
			},
			paperwork: {
				who: ['agent', 'director'],
				duration: [0, 2],
				where: ['base']
			},
			arrive: {
				who: 'all',
				start: 9,
				duration: [0, 0.25],
				where: ['entrance'],
			},
			leave: {
				who: 'all',
				start: 16.75,
				duration: [0, 0.25],
				where: ['entrance']
			},
			clean: {
				who: ['janitor'],
				duration: [0, 0.5],
				where: ['bathroom', '*office', 'conference']
			},
			fix: {
				who: ['it'],
				duration: [0, 0.5],
				where: ['*office']
			},
			bathroom: {
				who: 'all',
				duration: [0, 0.5],
				where: ['bathroom']
			},
			meeting: {
				who: ['agent', 'intern', 'director'],
				duration: [0.5, 1.5],
				where: ['conference']
			},
			chat: {
				who: 'all',
				duration: [0, 0.5],
				where: ['*office']
			},
			wander: {
				who: 'all',
				duration: [0, 0.5],
				where: ['hall']
			},
			sleep: {
				who: 'all',
				duration: [0.25, 1],
				where: ['base']
			}
		},
		jobs: {
			intern: {
				level: 0,
				min: 0,
				max: 2,
				base: 'lounge'
			},
			agent: {
				level: 1,
				office: true,
				min: 2,
				max: 5,
				title: 'Agent %s',
				base: 'office'
			},
			director: {
				level: 3,
				office: true,
				min: 0, 
				max: 1,
				title: 'Director %s',
				base: 'office'
			},
			security: {
				level: 3,
				office: 'security',
				min: 1,
				max: 2,
				base: 'office'
			},
			it: {
				level: 2,
				office: 'it',
				min: 1,
				max: 2,
				base: 'office'
			},
			janitor: {
				level: 2,
				min: 1,
				max: 1,
				base: 'bathroom'
			}
		},
		rooms: {
			conference: {
				level: 0,
				required: true,
				size: 3,
				title: "Conference Room"
			},
			office: {
				level: 1,
				assigned: true,
				size: 1,
				title: "%s's Office"
			},
			bathroom: {
				level: 0,
				required: true,
				size: 1,
				title: "Bathroom"
			},
			server: {
				level: 2,
				size: 0,
				title: "Server Room"
			},
			security: {
				level: 3,
				assigned: true,
				size: 2,
				title: "Security Offices"
			},
			lounge: {
				level: 0,
				size: 3,
				title: "Break Room"
			},
			it: {
				level: 0,
				assigned: true,
				size: 1,
				title: "I.T."
			}
		},
		
	
	}
	
	function Timeline(scene){
	
		this.scene = scene 
		this.margin = 50 
		this.r = 15 
		let y = 1.85*scene.cameras.main.centerY
		this.width = this.scene.cameras.main.centerX*2 - 2*this.margin
		
		this.clock = scene.add.text(this.margin, y - this.margin/2, '11:00')
		this.clock.setOrigin(0.5)
		
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
				return x > -hitArea.x && x < hitArea.width + hitArea.x && Math.abs(y) < hitArea.height 
			}
		})
		this.scene.input.setDraggable(this.graphics, true)
		

		let that = this 
		
		function getTime(pointer){
			return Math.floor(Phaser.Math.Clamp(maxTime*(pointer.x - that.margin)/that.width, 0, maxTime))
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
		this.clock.x = x0 + this.graphics.x 
		//this.clock.text = this.scene.t + "\n" + hr.timeToString(this.scene.t)
		this.clock.text = hr.timeToString(this.scene.t)
	}

	window.play = {
		create: function(){
			this.t = 0 
			this.shaderTime = 0 
			let shader = this.cache.text.entries.entries['shader']
			
			this.customPipeline = game.renderer.addPipeline('Custom', new CustomPipeline2(game, shader));
			this.customPipeline.setFloat2('resolution', game.config.width, game.config.height);
			this.customPipeline.setFloat2('mouse', 0.5, 0.5);
		
			this.cameras.main.setRenderToTexture(this.customPipeline);
			
		
			
			this.building = new Building(this, 15, 15, 3, 4)
			this.guys = []
			for(let i = 0; i < 8; i++){
				this.guys.push(new Character(this, this.building))
			}
			hr.init(this.building, this.guys)
			hud.init(this, hr)
			
			this.timeline = new Timeline(this)
			
			this.building.graphics()
			this.guys.forEach(guy => {
				guy.createGraphics()
			})
			
			window.scene = this 
		
		},
		update: function(){
			this.customPipeline.setFloat2('mouse', 0.5, 0.5);
			this.customPipeline.setFloat1('time', this.shaderTime);
			this.shaderTime += 0.001 
			
			
			this.timeline.update()
			this.guys.forEach(guy => guy.update(this.t, timeStep))
			if(this.t % timeStep === 0){
					this.hud.updateRoom()
			}
			
		}
	}

})()