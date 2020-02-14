//(function(){
	let classes = {
		10.1: ['Alex', 'Avery', 'Barry', 'Cathy', 'Ethan', 'Harris', 'Jasper', 'Jeff', 'Jennifer Yan', 'Jessie', 'Leo', 'Lucy', 'Michael Zhu', 'Nina Li', 'Peki', 'Reina', 'Roy', 'Tim Shen', 'Tony Hu', 'Vicky Li', 'William'],
		10.2: ['Alan Gao', 'Amy', 'Annie Xiong', 'Bill', 'Bob Hou', 'Casey', 'Cecilia', 'Frank', 'George Zhang', 'Helen', 'Irene', 'James Wang', 'Jenny', 'Jim', 'Jonathan', 'Lydia', 'Mike', 'Steven', 'Timmy', 'Tommy'],
		10.3: ['Aaron', 'Allen', 'Arie', 'Bob Wang', 'Dale', 'James Hu', 'Lori', 'Rebecca Pan', 'Susan', 'Tony Wang', 'Zack'],

		11.1: ['Abel', 'Albert', 'Angel', 'Ann', 'Benedict', 'Bob Wei', 'Carleton', 'Charles', 'Elias', 'George Zhang', 'Harvey', 'Howard', 'Iris', 'Isabella', 'Ivy', 'Jack', 'Jennifer Qiao', 'Katherine', 'Kenney', 'Leila', 'Loki', 'Lucas', 'Miles', 'Paul', 'Ray', 'Ruby', 'Sally', 'Sherry', 'Tom', 'Vicky Fu'],
		11.2: ['Annie Miao', 'Claire', 'Claudia', 'Evan', 'Grace', 'Johnny', 'Joyce', 'Kevin Zheng', 'Maxwell', 'Morris', 'Nina Huo', 'Rebecca Zhang', 'Rexa', 'Rita', 'Solomon', 'Tim Zhou', 'Winnie'],
		
		12: ['Alan Xie', 'Amanda', 'Ares', 'Barry_Allen', 'Bary', 'Buford', 'David', 'Kevin Zhang', 'Lynn', 'Mark', 'Michael Zhang', 'Nancy', 'Robert', 'Scott', 'Tony Tang', 'Yvette', 'Zed']
		
	};


	function get_line(line){
		if(!line) return 
		
		let comp_re = /^(\d+:\d+:\d+)\s+From\s+([^:]+) : (.+)$/
		let phone_re = /^(\d+:\d+:\d+)\s+([^:]+):\s+(.+)$/
	
		let match = line.match(comp_re)
		if(!match){
			match = line.match(phone_re)
			if(!match){
				console.log('bad line: ', line)
				return
			}
			
		}
		return {
			raw: line,
			time: match[1],
			name: match[2],
			text: match[3]
		}
	
	}
	
	let students = {
		init: function(){
			this.students = {}
			this.unidentified = {
				
					
			}
			this.active_classes = {}
			this.classes = [['10.1'], ['10.2', '10.3'], ['11.1', '11.2'], ['12']]
			this.for_each_name((name, cls) => {
			
					let names = name.split(' ')
					this.students[name + ' ' + cls] = {
						name: name.replace('_', ' '),
						cls: cls, 
						first: names[0].replace('_', ' '),
						last: names[1],
						lines: [],
						lower: names[0].replace('_', ' ').toLowerCase()
					}
			})
		},
		add_line: function(line){
			
			
			let stud = this.match_student(line)
			
			if(!stud ){
				return 
			}else if(stud.length === 0){
				console.log("Zero matches for student", line.name)
				return 
			}else if(stud.length === 1){
				stud = stud[0]
				
			}else{
				//console.log("Too many matches for student", line.name)
				if(this.unidentified[line.name]){
					this.unidentified[line.name].lines.push(line)
				}else{
					this.unidentified[line.name] = {
						name: line.name,
						lines: [line] 
					}
				}
				return 
				
			}
			
			if(stud.lines){
				stud.lines.push(line)
				this.active_classes[stud.cls] = true 
			}else{
				console.log(stud)
			}
			
			
		},
		match_student: function(line){
			if(!line) return 
			
			function remove_dupes(matches, func){
				if(matches.length > 1){
					let keepers = matches.filter(func)
					if(0 < keepers.length && keepers.length < matches.length){
						matches = keepers
					}
				}
				return matches
			}
			
			let matches = []
			this.for_each_student(stud => {
				if(line.name.toLowerCase().match(stud.lower)){
					matches.push(stud)
				}
			})
			
			let count = matches.length 
			matches = remove_dupes(matches, stud => {
				stud.last && line.name.toLowerCase().match(stud.last.toLowerCase())
			})
			
			
			matches = remove_dupes(matches, stud => {
				line.name.match(stud.first)
			})
			
			matches = remove_dupes(matches, stud => {
				let active = this.active_classes[stud.cls]
				//console.log(stud.cls, active)
				return active
			})
			
			matches = remove_dupes(matches, stud => {
				let exact = false
				line.name.split(' ').forEach(piece => {
					exact = exact || piece.toLowerCase().match(new RegExp(
						'^' + stud.lower + '$'
					))
				})
				return exact 
			})
			
			
			
			return matches 
		},
		for_each_student: function(func){
			this.classes.flat().forEach(cls => {
				classes[cls].forEach(name => {
					let stud = this.students[name + ' ' + cls]
					func(stud)
				})
			})
		},
		for_each_name: function(func){
			this.classes.flat().forEach(cls => {
				classes[cls].forEach(name => {
					func(name, cls)
				})
			})
		},
		get_class: function(name){
			let cls = []
			this.for_each_student(stud => {
				if(stud.cls === name){
					cls.push(stud)
				}
			})
			return cls 
		},
		get_unidentified: function(){
			return Object.values(this.unidentified)
		}
	}
	
	function clear_rosters(){
		let rosters = document.getElementById('rosters')
		while (rosters.firstChild) {
			rosters.removeChild(rosters.firstChild);
		}
	}
	
	function clear_textarea(){
		let chat_textarea = document.getElementById('chat')
		chat_textarea.value = ''
	}
	
	function show(class_name, students){
		let rosters = document.getElementById('rosters')
		
		let h = document.createElement('h2')
		h.innerHTML = class_name 
		rosters.appendChild(h)
		
		let ul = document.createElement('ul')
		rosters.appendChild(ul)
		
		students.forEach(stud => {
			let li = document.createElement('li')
			ul.appendChild(li)
			
			let a = document.createElement('a')
			
			
			let name = document.createElement('a')
			name.innerHTML = stud.name + ' (' + stud.lines.length + ') '
			name.href = '#'
			name.addEventListener('click', function(e){
				e.preventDefault()
				lines.hidden = !lines.hidden
			})
			
			li.appendChild(name)
			

			
			li.className = stud.lines.length ? 'good' : 'bad'
			
			let lines = document.createElement('ul')
		
			li.appendChild(lines)
			lines.hidden = true 
			
			stud.lines.forEach(line => {
				let li = document.createElement('li')
				lines.appendChild(li)
				
				let time = document.createElement('text')
				time.innerHTML = line.time + ' ' + line.name
				time.className = 'time'
				li.appendChild(time)
				
				let text = document.createElement('text')
				text.innerHTML = ' ' + line.text 
				text.className = 'comment'
				li.appendChild(text)
			})
		})
	}
	
	function h(text){
		return {
			time: '',
			text: text,
			name: '',
		}
	}
	
	let help = [
		{
			name: 'How do I use this?',
			lines: [
				h('Copy and paste the Zoom chat into the black box below'),
				h('then click the button that says "Do The Thing"')
			]
		},
		{
			name: 'Why are some students unidentified?',
			lines: [
				h('They might have used names that confused my program.'),
				h('They might have the same name as someone else'),
				h("They might be a teacher. The program isn't set up to identify teachers"),
				h("There might be an error in my program.")
			]
		},
		{
			name: 'Why are some students red?',
			lines: [
				h("Those are the students that don't have any comments at all."),
				h("(Or maybe they're just unidentified: See above)"),
			]
		},
		{
			name: 'Hints',
			lines: [
				h("Click on a student's name to see all of their comments"),
				h('Use "Ctrl + A" to select all the text in a file'),
				h('Use "Ctrl + C" to copy'),
				h('Use "Ctrl + V" to paste'),
				
			]
		},
	
	
	]

	function do_the_thing(){
		students.init()
		clear_rosters()
		
		let chat_textarea = document.getElementById('chat')
		let chat = chat_textarea.value
		let lines = chat.split('\n').map(get_line)
		
		
		lines.forEach(line => students.add_line(line))
		
		let unidentified = students.get_unidentified()
		if(unidentified.length){
			show('Unidentifable Students', unidentified)
		}
		
		students.classes.flat().filter(cls => students.active_classes[cls]).forEach(cls => {
			let roster = students.get_class(cls)
			show(cls, roster)
		})
		
		show('Help', help)
		
		//clear_textarea()
	
		
	}
	
	window.onload = function(){
		let butt = document.getElementById('the_button')
		
		butt.onclick = do_the_thing
		
		show('Help', help)

		
	}
	
//})()