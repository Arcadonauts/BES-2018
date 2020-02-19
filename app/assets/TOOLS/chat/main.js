//(function(){
	let classes = {
		10.1: ['Alex', 'Avery', 'Barry', 'Cathy', 'Ethan', 'Harris', 'Jasper', 'Jeff', 'Jennifer Yan', 'Jessie', 'Leo', 'Lucy', 'Michael Zhu', 'Nina Li', 'Peki', 'Reina', 'Roy', 'Tim Shen', 'Tony Hu', 'Vicky Li', 'William'],
		10.2: ['Alan Gao', 'Amy', 'Bill', 'Bob Hou', 'Casey', 'Cecilia', 'Frank', 'George Zhang', 'Helen', 'Irene', 'James Wang', 'Jenny', 'Jim', 'Jonathan', 'Lydia', 'Mike', 'Steven', 'Timmy', 'Tommy'],
		10.3: ['Aaron', 'Allen', 'Arie', 'Bob Wang', 'Dale', 'James Hu', 'Lori', 'Rebecca Pan', 'Susan', 'Tony Wang', 'Zack'],

		11.1: ['Abel', 'Albert', 'Angel', 'Ann', 'Benedict', 'Bob Wei', 'Carleton', 'Charles', 'Elias', 'George Zhang', 'Harvey', 'Howard', 'Iris', 'Isabella', 'Ivy', 'Jack', 'Jennifer Qiao', 'Katherine', 'Kenney', 'Leila', 'Loki', 'Lucas', 'Miles', 'Paul', 'Ray', 'Ruby', 'Sally', 'Sherry', 'Tom', 'Vicky Fu'],
		11.2: ['Annie', 'Claire', 'Claudia', 'Evan', 'Grace', 'Johnny', 'Joyce', 'Kevin Zheng', 'Maxwell', 'Morris', 'Nina Huo', 'Rebecca Zhang', 'Rexa', 'Rita', 'Solomon', 'Tim Zhou', 'Winnie'],
		
		12: ['Alan Xie', 'Amanda', 'Ares', 'Barry_Allen', 'Bary', 'Buford', 'David', 'Kevin Zhang', 'Lynn', 'Mark', 'Michael Zhang', 'Nancy', 'Robert', 'Scott', 'Tony Tang', 'Yvette', 'Zed']
		
	};

	let chinese_names = {
		10.1: {'Alex': '王琢玉', 'Avery': '李怡鑫', 'Barry': '王翊宁', 'Cathy': '刘奕', 'Ethan': '范伊天', 'Harris': '祝明浩', 'Jasper': '李郑浩', 'Jeff': '王嘉诚', 'Jennifer': '闫辰洁', 'Jessie': '宋佳禧', 'Leo': '李奉奇', 'Lucy': '杨默涵', 'Michael': '朱豪', 'Nina': '李彦卿', 'Peki': '武佩琪', 'Reina': '胡瑞佳', 'Roy': '任嘉欣', 'Tim': '申博', 'Tony': '胡南', 'Vicky': '李豫王蒙', 'William': '王大任'}, 
		10.2: {'Alan': '郜彦哲', 'Amy': '侯景媛', 'Annie': '熊思雅', 'Bill': '梁贝尔', 'Bob': '侯泽林', 'Casey': '赵曼可', 'Cecilia': '刘一帆', 'Frank': '郑琪烁', 'George': '张哲', 'Helen': '郭怡媛', 'Irene': '李晨熙', 'James': '王泰寓', 'Jenny': '徐越洋', 'Jim': '田紫晗', 'Jonathan': '袁浩喆', 'Lydia': '孙红娇', 'Mike': '杨御钦', 'Steven': '董哲琨', 'Timmy': '丁麒霖', 'Tommy': '赵桐祥'}, 
		10.3: {'Aaron': '张一统', 'Allen': '段成誉', 'Arie': '霍奕名', 'Bob': '王禹豪', 'Dale': '张壹斐', 'George': '张润龙', 'James': '胡孝典', 'Lori': '周俊彤', 'Rebecca': '潘迎好', 'Susan': '李嘉琪', 'Tony': '王文康', 'Zack': '苏昭朔'}, 
		11.1: {'Abel': '李想', 'Albert': '陈黄栋', 'Angel': '杜安琪', 'Ann': '汤子涵', 'Benedict': '张桂铭', 'Bob': '位 晨', 'Carleton': '李梓硕', 'Charles': '范海涵', 'Elias': '李青鼎', 'George': '张国豪', 'Harvey': '李炫霖', 'Howard': '马子豪', 'Iris': '李姮秀', 'Isabella': '巴伊莎', 'Ivy': '杨牧涵', 'Jack': '周翔宇', 'Jennifer': '乔佳艺', 'Katherine': '蔡 林', 'Kenney': '刘嘉宣', 'Leila': '付名赟', 'Loki': '朱鹏宇', 'Lucas': '李龙飞', 'Miles': '孟鑫阳', 'Paul': '田鹏钰', 'Ray': '王骁航', 'Ruby': '张珺逸', 'Sally': '马赛雨迪', 'Sherry': '李珂馨', 'Tom': '郑镇非', 'Vicky': '付嘉华'}, 
		11.2: {'Annie': '苗昕宜', 'Claire': '张 旭', 'Claudia': '郑家星', 'Evan': '禹明君', 'Grace': '叶芮希', 'Johnny': '陶嘉乐', 'Joyce': '王 莹', 'Kevin': '郑 钊', 'Maxwell': '王一帆', 'Morris': '常克营', 'Nina': '霍宁宁', 'Rebecca': '张英琦', 'Rexa': '高彧飞', 'Rita': '马一文', 'Solomon': '李昊洋', 'Tim': '周亦凡', 'Winnie': '魏卓然'}, 
		12: {'Alan': '谢璐阳', 'Amanda': '张琦', 'Ares': '魏星宇', 'Barry Allen': '郝珈铭', 'Bary': '周也涛', 'Buford': '吕祎玮', 'David': '张沅朋', 'Kevin': '张一行', 'Lynn': '李欣雨', 'Mark': '张皓源', 'Michael': '张益持枫', 'Nancy': '刘冰姿', 'Robert': '张博康', 'Scott': '朱少坤', 'Tony': '唐子维', 'Yvette': '王悦懿', 'Zed': '赵楚涵'}
	}

	function get_line(line){
		if(!line) return 
		
		let comp_re = /^(\d+:\d+:\d+)\s+From\s+([^:]+) : (.+)$/
		let phone_re = /^(\d+:\d+:\d+)\s+([^:]+):\s+(.+)$/
		let ding_re = /^(.+):\s?(.+)$/
	
		let match = line.match(comp_re)
		if(match){
			return {
				raw: line,
				time: match[1],
				name: match[2],
				text: match[3]
			}
		}
	
		match = line.match(phone_re)
		if(match){
			return {
				raw: line,
				time: match[1],
				name: match[2],
				text: match[3]
			}
		}
		
		match = line.match(ding_re)
		if(match){
			return {
				raw: line,
				time: '...',
				name: match[1],
				text: match[2]
			}
		}
		
		console.log('bad line: ', line)
		return
		
		
	}
	
	let students = {
		init: function(){
			this.students = {}
			this.unidentified = {
				
					
			}
			this.active_classes = {}
			this.classes = [['10.1'], ['10.2', '10.3'], ['11.1', '11.2'], ['12']]
			this.for_each_name((name, cls) => {
					//console.log(cls)
					let names = name.split(' ')
					let first = names[0].replace('_', ' ')
					let chinese = chinese_names[cls][first]
					
					if(!chinese) console.log("No chinese name", first, cls)
					this.students[name + ' ' + cls] = {
						name: name.replace('_', ' '),
						cls: cls, 
						first: first,
						last: names[1],
						lines: [],
						lower: names[0].replace('_', ' ').toLowerCase(),
						chinese: chinese 
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
			//console.log(line)
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
				if(!stud.chinese){
					console.log(stud.name, 'has no Chinese name')
				}
					
				if(line.name.toLowerCase().match(stud.lower)){
					matches.push(stud)
				}
				if(line.name.match(stud.chinese)){
					console.log(line.name, stud.chinese)
					matches.push(stud)
				}
			})
			
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
			name.innerHTML = '' 
			
			if(stud.help){
				name.innerHTML = stud.help
			}else{
				english_check = document.getElementById('english_check').checked 
				chinese_check = document.getElementById('chinese_check').checked 
				
				if(english_check){
					name.innerHTML += stud.name + ' ' 
				}
				
				if(chinese_check){
					name.innerHTML += stud.chinese + ' '
				}
				
				name.innerHTML += '(' + stud.lines.length + ') '
			}
			
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
			help: 'How do I use this?',
			lines: [
				h('Copy and paste the Zoom chat into the black box below'),
				h('then click the button that says "Do The Thing"')
			]
		},
		{
			help: 'Why are some students unidentified?',
			lines: [
				h('They might have used names that confused my program.'),
				h('They might have the same name as someone else'),
				h("They might be a teacher. The program isn't set up to identify teachers"),
				h("There might be an error in my program.")
			]
		},
		{
			help: 'Why are some students red?',
			lines: [
				h("Those are the students that don't have any comments at all."),
				h("(Or maybe they're just unidentified: See above)"),
			]
		},
		{
			help: 'Hints',
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