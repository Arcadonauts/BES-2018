(function(){
	
	
	
	const timeStep = 20 
	const maxTime = 500*timeStep
	const startTime = 8.75 // 8:45
	const endTime = 17.25 // 5:15
	
	function makeButton(graphics, that, x, y, w, h){
		//console.log(graphics, that, x, y, w, h)
		graphics.setInteractive({
			hitArea: {
				x: x,
				y: y, 
				width: w, 
				height: h
			},
			hitAreaCallback: function(hitArea, x, y, gameObject){
				return x > hitArea.x && x < hitArea.width + hitArea.x && y > hitArea.y && y < hitArea.height + hitArea.y
			}
		})
		

		graphics.alpha = 0.5
		
		graphics.on('pointerover', ()=>{
			
			//graphics.scene.sound.play('boop')
			graphics.setScale(1.1)
		})
		
		graphics.on('pointerout', ()=>{
			graphics.alpha = 0.5
			graphics.setScale(1.0)
		})
		
		graphics.on('pointerdown', ()=>{
			graphics.alpha = 1.0
			
		})
		
		graphics.on('pointerup', ()=>{
			//this.graphics.setScale(1.0)
			//graphics.scene.sound.play('bip')
			graphics.alpha = 0.5
			that.select()
		})
	}
	
	function keys(obj){
		let ks = []
		for(let k in obj){
			if(obj.hasOwnProperty(k)){
				ks.push(k)
			}
		}
		return ks 
	}
	
	function Tab(hud, id, color, text, children){
		
		this.hud = hud 
		let scene = hud.scene 
		this.children = children 
		
		this.width = 100
		this.height = 25
		this.lineWidth = 4
		this.color = color 
		
		let up = 5
		
		let x = 6 + (this.width + this.lineWidth)*id 
		let y = up + this.lineWidth
		
		this.container = scene.add.container(x, y)
		
		this.graphics = scene.add.graphics(0, 0)
		this.container.add(this.graphics)
		
		this.graphics.lineStyle(this.lineWidth, color)
		this.graphics.fillStyle(0x000000)
		this.graphics.strokeRect(0, 0, this.width, this.height)
		this.graphics.fillRect(0, 0, this.width, this.height + 2*this.lineWidth)
		
		let c = Phaser.Display.Color.ValueToColor(color)
		this.text = scene.add.text(this.width/2, this.height/2, text, {
			fill:  Phaser.Display.Color.RGBToString(c.red, c.green, c.blue),
			fontFamily: 'retro',
			fontSize: '16pt',
			align: 'center'
		})
		this.container.add(this.text)
		this.text.setOrigin(0.5, 0.4)
		
		
		this.graphics.setInteractive({
			hitArea: {
				x: 0,
				y: 0, 
				width: this.width, 
				height: this.height
			},
			hitAreaCallback: function(hitArea, x, y, gameObject){
				return x > hitArea.x && x < hitArea.width + hitArea.x && y > hitArea.y && y < hitArea.y + hitArea.height 
			}
		})
		
		let that = this 
		this.graphics.on('pointerover', function(){
			//scene.sound.play('boop')
			that.text.y -= up 
			that.graphics.y -= up 
		})
		
		this.graphics.on('pointerout', function(){
			that.text.y += up 
			that.graphics.y += up 
		})
		
		this.graphics.on('pointerdown', function(){
			//scene.sound.play('bip')
			that.select()
		})
		
		return this 
		
	}
	
	Tab.prototype.select = function(){
		this.hud.clear()
		
		this.hud.tabs.forEach(tab => {
			
			if(tab === this){
				tab.container.setDepth(1)
				tab.hud.draw(this.color)
				tab.children.forEach(child => child.show())
			}else{
				tab.container.setDepth(-1)
				tab.children.forEach(child => child.hide())
			}				
		})
		
		
	}
	
	function Hud(scene, hr){
		this.scene = scene 
		this.hr = hr 
		
		this.tabs = [] 
		this.tabsData = []
		this.mode = 'timeline'
		
		return this 
	}
	
	Hud.prototype.init = function(){

		this.create()
		this.createTabs()
		this.tabs[0].select()
		
	}
	
	Hud.prototype.update = function(){
		if(this.mode === 'timeline'){
			this.updateRoom()
		}
	}
	
	Hud.prototype.addTab = function(data){
		this.tabsData.push(data)
	}
	
	Hud.prototype.createTabs = function(){
		
		
		this.tabsData.forEach((data, i) => {
			this.tabs.push(new Tab(this, i, data.color, data.label, data.children))
		})
	}
	
	Hud.prototype.create = function(){
		
		this.box = this.scene.add.graphics(0, 0)
		this.draw(0x00ffff)
		let x0 = 0.05*this.scene.cameras.main.centerX
		this.title = this.scene.add.text(x0, 0.2*this.scene.cameras.main.centerY, 'Title', {
			fill: 'white',
			fontFamily: 'retro',
			fontSize: '22pt',
			align: 'left'
		})
		this.title.setOrigin(0)
		this.occupants = this.scene.add.text(x0, 0.35*this.scene.cameras.main.centerY, 'Occupants\nOccupants', {
			fill: 'white',
			fontFamily: 'retro',
			fontSize: '18pt',
			align: 'left',
			lineSpacing: 5,
		})
		
		
		
	}
	
	Hud.prototype.draw = function(color){
		this.box.clear()
		this.box.lineStyle(2, color)
		let x0 = 5 
		let y0 = 35
		this.box.strokeRect(x0, y0, 0.875*this.scene.cameras.main.centerX, 1.5*this.scene.cameras.main.centerY)
		
	}
	
	Hud.prototype.showRoom = function(index){
		if(this.roomIndex !== index){
			//this.scene.sound.play('boop')
		}
		this.roomIndex = index 
		this.mode = 'timeline'
		
		this.updateRoom()
	}
	
	Hud.prototype.updateRoom = function(){
		let index = this.roomIndex
		let room = this.hr.building.rooms[index]
		if(index > -1){
			this.title.text = room.template.title.replace(/%s/g, room.name) 
			
			let occupants = this.hr.people.filter(p => p.room === index).map(p => p.name)
			if(occupants.length){
				this.occupants.text = ['Occupants:'].concat(occupants).join('\n>>\t')
			}else{
				this.occupants.text = 'empty'
			}
			
		}else{
			this.title.text = '' 
			this.occupants.text = ''
		}
	}
	
	Hud.prototype.showPersonnel = function(title, report, person){
		this.mode = 'personnel'
		this.title.text = title 
		this.occupants.text = report 
		this.activePersonnel = person 
		this.scene.accuse.show()
	}
	
	Hud.prototype.clear = function(){
		this.title.text = ''
		this.occupants.text = '' 
		this.activePersonnel = undefined
	}
	
	
	let hr = {
		init: function(building, people){
			this.building = building
			this.people = people 
			
			people.forEach((person, i) => {
				while(people.map(p => p.name).indexOf(person.name) !== i){
					person.getName()
				}
			})
			
			this.assignJobs(people)
			this.assignRooms(building, people)
			let schedule = this.createSchedule(building, people)
			
		
			people.forEach((person, i) => {
				this.createPath(person, schedule, building)
			
			})
			
			let shifter = random.pick(people)
			shifter.makeShifter(people)
		},
		
		timeToClock: function(time){
			let len = endTime - startTime
			return time*len/maxTime + startTime 
		},
		clockToTime: function(hours){
			let len = endTime - startTime
			return Math.floor((hours - startTime)*maxTime/len)
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
			for(let i = startTime; i <= endTime; i += 0.25){ 
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
					let base = this.jobs[who.job].base
					if(base === 'office'){
						
						if(this.jobs[who.job].office === true){
							room = building.rooms.find(x => x.name === who.office)
							
						}else{
							room = building.getRandomRoom(this.jobs[who.job].office)
						}
						
					}else{
						room = building.getRandomRoom(base)
					}
					
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
					let wait = random.between(0, 20)
					for(let i = 0; i < wait; i++){
						agenda.push(target)
					}
					
					
				}else{
					let start = agenda[agenda.length - 1]
					if(target.room === start.room && !target.room === -1){
						
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
					let title = job.title.replace(/%s/g, person.lastName)
					rooms.push({
						room: 'office',
						name: title,
					})
					person.office = title 
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
				if(job.key === 'intern'){
					person.profile.age = 19
				}
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
				start: 9.0,
				duration: [0, 0.25],
				where: ['base']
			},
			paperwork: {
				who: ['agent', 'director'],
				duration: [0, 2],
				where: ['base']
			},
			arrive: {
				who: 'all',
				start: 8.75,
				duration: [0, 0.25],
				where: ['entrance'],
			},
			leave: {
				who: 'all',
				start: 17.0,
				duration: [1, 2],
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
				where: ['*office']
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
	
	function Accuse(scene){
		this.scene = scene 
		
		let ax = 0.45*scene.cameras.main.centerX
		let ay = 1.40*scene.cameras.main.centerY
			
		let w = 200
		let h = 60
		
		
		this.graphics = scene.add.graphics({
			x: 0,
			y: 0,
			lineStyle: {
				width: 5,
				color: 0xff0000,
				alpha: 1
			},
		})
	
		this.graphics.strokeRect(-w/2, -h/2, w, h)
		
		this.text = scene.add.text(0, 0, "ACCUSE", {
			fill: 'red',
			fontFamily: 'retro',
			fontSize: '36pt',
			align: 'left',
			lineSpacing: 5,
		})
		this.text.setOrigin(0.5, 0.45)

		
		let container = scene.add.container(ax, ay)
		container.add(this.graphics)
		container.add(this.text)
		
		makeButton(container, this, -w/2, -h/2, w, h)
	
		this.container = container 
		
	}
	
	Accuse.prototype.select = function(){
		new PopUp(this.scene, this.scene.hud.activePersonnel, this.scene.shifter)
	}
	
	Accuse.prototype.show = function(){
		if(this.scene.hud.activePersonnel){
			
			this.container.y = Math.abs(this.container.y)
		
		}
	}
	
	Accuse.prototype.hide = function(){
		this.container.y = -Math.abs(this.container.y)
		
	}
	
	function PopUp(scene, accused, shifter){
		let width = 2*scene.cameras.main.centerX
		let height = 2*scene.cameras.main.centerY
		let bg = scene.add.graphics({
			x: 0,
			y: 0,
			fillStyle: {
				color: 0xff0000,
				alpha: 0.02
			}
		})
		bg.setDepth(2)
		bg.fillRect(0, 0, width, height)
		
		bg.setInteractive({
			hitArea: {
				x: 0,
				y: 0, 
				width: width, 
				height: height
			},
			hitAreaCallback: function(hitArea, x, y, gameObject){
				return x > hitArea.x && x < hitArea.width + hitArea.x && y > hitArea.y && y < hitArea.height + hitArea.y
			}
		})
		
		bg.fillStyle(0x000000, 1)
		bg.lineStyle(6, 0xff0000, 1)
		let x = 40
		let y = 0.25*height
		let w = 0.4*width - x 
		let h = 0.55*w 
		
		bg.fillRect(x, y, w, h)
		bg.strokeRect(x, y, w, h)
		
		let mx = 10
		
		let sure = scene.add.text(x+w/2+3, y+5, "Are you sure you want to accuse " + accused.trueName + " of being the shape-shifter?", {
			fill: '#ff0000',
			fontFamily: 'retro',
			fontSize: '20pt',
			align: 'center',
			wordWrap: {
				width: w
			}
		})
		sure.setOrigin(0.5, 0)
		sure.setDepth(2)
		
		
		let bw = 0.135*w 
		let bh = 0.5*bw 
		

		let yes = scene.add.container(x + 0.3*w, y + 0.8*h)
		makeButton(yes, {
			select: ()=> scene.scene.start('accuse', {
				shifter: shifter,
				accused: accused,
				diff: scene.diff
			})
		}, -bw, -bh, 2*bw, 2*bh)
		yes.setDepth(3)
		
		let yesBox = scene.add.graphics({
			x: 0,
			y: 0,
			lineStyle: {
				width: 4,
				color: 0xff0000
			}
		})
		yesBox.strokeRect(-bw, -bh, 2*bw, 2*bh)
		yes.add(yesBox)
		
		let yesText = scene.add.text(0, 0, "YES", {
			fill: '#ff0000',
			fontFamily: 'retro',
			fontSize: '20pt',
			align: 'center',
	
		})
		yesText.setOrigin(0.5)
		yes.add(yesText)
		
		
		
		
		let no = scene.add.container(x + 0.7*w, y + 0.8*h)
		makeButton(no, {
			select: ()=>{
				yes.destroy()
				no.destroy()
				bg.destroy()
				sure.destroy()
			}
		}, -bw, -bh, 2*bw, 2*bh)
		no.setDepth(3)
		
		let noBox = scene.add.graphics({
			x: 0,
			y: 0,
			lineStyle: {
				width: 4,
				color: 0xff0000
			}
		})
		noBox.strokeRect(-bw, -bh, 2*bw, 2*bh)
		no.add(noBox)
		
		let noText = scene.add.text(0, 0, "NO", {
			fill: '#ff0000',
			fontFamily: 'retro',
			fontSize: '20pt',
			align: 'center',
	
		})
		noText.setOrigin(0.5)
		no.add(noText)
		
	}
	
	function TimelineButton(timeline, id){
		
		
		let w = 0.125*timeline.scene.cameras.main.centerX
		let m = w/2 
	
	
		let x = (id % 2)*(w + m) + (0.875/2) * timeline.scene.cameras.main.centerX + 5
		let y = 1.45*timeline.scene.cameras.main.centerY
		
		this.graphics = timeline.scene.add.graphics({x:x, y:y})
		makeButton(this.graphics, this, -w/2, -w/2, w, w)
		this.graphics.lineStyle(2, 0x00ffff)
		this.id = id 
		this.timeline = timeline
		
		this.draw(this.graphics, id, w)
		
			
		if(id === 2){
			this.disable()
		}else{
			this.enable()
		}			
		
		
		
	}
	
	TimelineButton.prototype.select = function(){
		
		
		if(this.id % 2 === 0){
			this.timeline.buttons.forEach(butt => butt.enable())
			this.disable()
			if(this.id === 0){
				this.timeline.play = 0 
			}else{
				this.timeline.play = 1 
			}
		}else{
			if(this.timeline.play){
				if(Math.abs(this.timeline.dt + this.id*2) <= this.timeline.max){
					this.timeline.dt += this.id*2 
				}
			}else{
				this.timeline.dt = this.id*Math.abs(this.timeline.dt)
				this.timeline.buttons.find(butt => butt.id === 2).select()
			}
		}
	}
	
	TimelineButton.prototype.enable = function(){
		this.graphics.setInteractive()
		this.graphics.y = Math.abs(this.graphics.y)
		this.graphics.alpha = 0.5
		this.enabled = false 
	}
	
	TimelineButton.prototype.disable = function(){
		this.enabled = true 
		this.graphics.disableInteractive()
		this.graphics.y = -Math.abs(this.graphics.y)
	}
	
	TimelineButton.prototype.hide = function(){
		this.disable()
	}
	
	TimelineButton.prototype.show = function(){
		if(this.timeline.play && this.id !== 2){
			this.enable()
		}
		if(!this.timeline.play && this.id !== 0){
			this.enable()
		}
	}
	
	TimelineButton.prototype.draw = function(graphics, i, w){
		//graphics.clear()
		let x0 = 0 
		let y0 = 0
		this.graphics.strokeRect(-w/2, -w/2, w, w)
		
		let r = 0.3*w
		let k = 0.3*r
		
		graphics.beginPath()
		if(i === 0){
			graphics.moveTo(x0 - r, y0 - r)
			graphics.lineTo(x0 + r, y0    )
			graphics.lineTo(x0 - r, y0 + r)
			graphics.lineTo(x0 - r, y0 - r)
		}else if(i == 2){
			graphics.moveTo(x0 - r, y0 - r)
			graphics.lineTo(x0 - k, y0 - r)
			graphics.lineTo(x0 - k, y0 + r)
			graphics.lineTo(x0 - r, y0 + r)
			graphics.lineTo(x0 - r, y0 - r)
			
			graphics.moveTo(x0 + r, y0 - r)
			graphics.lineTo(x0 + k, y0 - r)
			graphics.lineTo(x0 + k, y0 + r)
			graphics.lineTo(x0 + r, y0 + r)
			graphics.lineTo(x0 + r, y0 - r)
		
		}else{
			graphics.moveTo(x0-i*r, y0 - r)
			graphics.lineTo(x0    , y0 - r)
			graphics.lineTo(x0+i*r, y0    )
			graphics.lineTo(x0    , y0 + r)
			graphics.lineTo(x0-i*r, y0 + r)
			graphics.lineTo(x0    , y0    )
			graphics.lineTo(x0-i*r, y0 - r)
		}
		
		
		graphics.stroke()
		
	}
	
	function Timeline(scene){
	
		this.scene = scene 
		this.margin = 50 
		this.r = 10 
		let y = 1.85*scene.cameras.main.centerY
		this.width = this.scene.cameras.main.centerX*2 - 2*this.margin
		
		this.dt = 1 
		this.play = 1
		this.max = 12
		
		this.buttons = [
			new TimelineButton(this, -1),
			new TimelineButton(this, 0),
			new TimelineButton(this, 1),
			new TimelineButton(this, 2)
		]
		
		this.clock = scene.add.text(this.margin, y - this.margin/2, '11:00', {
			fill: '#00ffff',
			fontFamily: 'retro',
			fontSize: '20pt',
			align: 'left'
		})
	
		this.clock.setOrigin(0.5, 0.75)
		
		
		
		this.graphics = scene.add.graphics({
			x: this.margin,
			y: y,
			lineStyle: {
				width: 6,
				color: 0x005555, 
			},
			fillStyle: {
				color: 0x000000
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
		this.graphics.lineStyle(6, 0x00ffff)
		this.graphics.beginPath()
		this.graphics.moveTo(0, 0)
		this.graphics.lineTo(this.width, 0)
		this.graphics.strokePath()
		
		this.graphics.lineStyle(6, 0x00ffff)
		this.graphics.fillCircle(x0, 0, r)
		this.graphics.strokeCircle(x0, 0, r)
		
		let k = 0.02*this.width
		let s = 0.05*this.width
		let q = 0.05*this.width
		this.graphics.beginPath()
		let t = this.dt > 0 ? 1 : -1 
		for(let i = 1; i < 0.5*(Math.abs(this.dt)) + 1; i += 1){
			if(i > 2){
				break
			}
			this.graphics.moveTo(x0 + t*i*k, -r)
			this.graphics.lineTo(x0 + t*(i*k + r), 0)
			this.graphics.lineTo(x0 + t*i*k, r)
		}
		this.graphics.strokePath()
		
		if(!this.dragging && !this.hidden){
			if(this.dt > 0 && this.scene.t < maxTime){
				this.scene.t += this.dt*this.play 
			}else if(this.dt < 0 && this.scene.t > 0){
				this.scene.t += this.dt*this.play 
			}
		}
		this.clock.x = x0 + this.graphics.x 
		this.clock.text = hr.timeToString(this.scene.t) //+ "\n" +  Math.floor(this.scene.t/timeStep) //
		//this.clock.text = hr.timeToString(this.scene.t)
	
	}
	
	Timeline.prototype.show = function(){
		this.graphics.alpha = 1
		this.clock.alpha = 1
		this.buttons.forEach(butt => butt.show())
		this.hidden = false 
	}
	
	Timeline.prototype.hide = function(){
		this.graphics.alpha = 0
		this.clock.alpha = 0
		this.buttons.forEach(butt => butt.hide())
		this.hidden = true 
	}

	function Personnel(scene, person, id){
		this.person = person 
		this.id = id 
		this.scene = scene 
		this.text = scene.add.text(scene.cameras.main.centerX, 35*(id + 1), '   ' + person.name, {
			fill: Phaser.Display.Color.RGBToString(255, 255, 0),
			fontFamily: 'retro',
			fontSize: '18pt',
			align: 'left'
		})
		
		this.text.setInteractive()
		
		this.text.on('pointerover', ()=>{
			//this.scene.sound.play('boop')
			this.text.text = '>> ' + person.trueName 
		})
		
		this.text.on('pointerout', ()=>{
			this.text.text = '   ' + person.trueName 
		})
		
		this.text.on('pointerdown', ()=>{
			//this.scene.sound.play('bip')
			this.select()
		})
		
		return this 
	}
	
	Personnel.prototype.select = function(){
		this.scene.personnel.forEach(p => {
			let color 
			if(p === this){
				color = 'white'
			}else{
				color = 'yellow'
			}
			p.text.setColor(color)
		})
		
		let person = this.person 
		let title = this.person.trueName 
		
		let job = person.job 
		if(job === "it"){
			job = "I.T."
		}else{
			job = job.toUpperCase()[0] + job.slice(1) 
		}
		
		let report = [
			" Position: " + job,
			" Age:      " + person.profile.age + ' years',
			" Height:   " + person.profile.height + ' cm',
			" Weight:   " + person.profile.weight + ' kg'
		].join('\n')
		
		this.scene.hud.showPersonnel(title, report, person)
	}
	
	Personnel.prototype.show = function(){
		this.text.alpha = 1 
		this.scene.personnel.forEach(p => {
		
			p.text.setColor('yellow')
		})
	}
	
	Personnel.prototype.hide = function(){
		this.text.alpha = 0
	}
	
	

	window.play = {
		init: function(data){
			this.diff = data.diff 
			console.warn('diff', data.diff)
		},
		create: function(){
			console.log(this.diff)
			
			window.playScene = this 
			
			this.t = 0 
			this.shaderTime = 0 
			
		
			this.cameras.main.setRenderToTexture(shader);
			
			let diff = [
				[4, 2, 3],
				[5, 3, 3],
				[6, 3, 3],
				[7, 3, 3],
				[8, 3, 4],
				[9, 3, 4],
				[10, 4, 4]
			]
			
			let d = diff[this.diff]
			
			this.building = new Building(this, 15, 15, d[1], d[2])
			this.guys = []
			for(let i = 0; i < d[0]; i++){
				this.guys.push(new Character(this, this.building))
			}
			
			this.timeline = new Timeline(this)
			
			hr.init(this.building, this.guys)
			
			this.personnel = []
			this.guys.forEach((guy, i) => {
				this.personnel.push(new Personnel(this, guy, i))
			})
			
			
			this.accuse = new Accuse(this)
			this.hud = new Hud(this, hr)
			this.hud.addTab({
				color: 0x00ffff,
				label: "Timeline",
				children: this.guys.concat([this.timeline, this.building])
			})
			this.hud.addTab({
				color: 0xffff00,
				label: "Personnel",
				children: this.personnel.concat([this.accuse]),
			})
			/*
			this.hud.addTab({
				color: 0xff00ff,
				label: "Map",
				children: []
			})
			*/
			
			this.hud.init()
			
			
			this.building.refreshGraphics()
			this.guys.forEach(guy => {
				guy.createGraphics()
			})
			
			
		
		},
		update: function(){
			let sx = this.input.mousePointer.x/(2*this.cameras.main.centerX)
			let sy = this.input.mousePointer.y/(2*this.cameras.main.centerY)
			shader.setFloat2('mouse', sx, sy);
			shader.setFloat1('time', this.shaderTime);
			this.shaderTime += 0.001 
			
			
			this.timeline.update()
			this.guys.forEach(guy => guy.update(this.t, timeStep))
			if(this.t % timeStep === 0){
				this.hud.update()
			}
			
		}
	}
	
})()