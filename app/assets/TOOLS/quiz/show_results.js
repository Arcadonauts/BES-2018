let tol = 2

let students = {
	init: function(){
		this.students = []
	},
	add: function(key, line){
		let name = line[0]
		if(name.length === 0){
			return 
		}
		
		random.seed(name.trim())
		console.log('seed', name)
		
		let quiz = get_quiz(key)
		
		let problems = quiz.problems()
		
		let stud = {
			name: name,
			answers: line.slice(1),
			correct: problems.map(p => p.answer),
			questions: problems.map(p => p.formula)
		}
		
		
		let score = 0
		let tot = 0 
		stud.correct.forEach((c, i) => {
			let a = stud.answers[i]
			if( Math.abs(a - c) < Math.pow(10, -tol)){
				score += 1
			}
			tot += 1
		})
		
		stud.score = Math.ceil(100*score/tot)
	
		
	
		
		console.log(problems)
		
		
		this.students.push(stud)
	},
	show: function(){
		let ul = document.getElementById('scores')
		this.students.forEach(stud => {
			let li = document.createElement('li')
			ul.appendChild(li)
			li.innerHTML = stud.name + ' (' + stud.score + ')'
			
			let answers = document.createElement('ul')
			li.appendChild(answers)
			stud.questions.forEach((q, i) => {
				let a = stud.answers[i]
				let c = stud.correct[i]
				
				let li = document.createElement('li')
				answers.appendChild(li)
				
				let q_span = document.createElement('span')
				li.appendChild(q_span)
				q_span.innerHTML = q 
				q_span.className = 'question'
				
				
				
				let c_span = document.createElement('span')
				li.appendChild(c_span)
				c_span.innerHTML = Math.round(c*Math.pow(10, tol))/Math.pow(10, tol)
				c_span.className = 'right'
				
				let a_span = document.createElement('span')
				li.appendChild(a_span)
				a_span.innerHTML = 'Student: ' + a 
				a_span.className = Math.abs((+a)-(+c)) < Math.pow(10, -tol) ? 'correct' : 'wrong'
				
			})
		})
		
		MathJax.typeset()
	}
}

function get_results(key){
	// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", function(){
		
		show(key, this.responseText);
	});
	oReq.open("GET", "/static/TOOLS/quiz/quizzes/" + key + ".txt?v="+Math.random());
	oReq.send();
}

function show(key, str){
	students.init()
	console.log(str)
	let scores = document.getElementById('scores')
	while (scores.firstChild) {
		scores.removeChild(scores.firstChild);
	}
		
		
	let lines = str.split('\n')
	
	lines.forEach(line => {
		students.add(key, line.trim().split(' '))
	})
	
	students.show()
}

window.onload = function(){
	
	
	let butt = document.getElementById('get_scores')
	butt.addEventListener('click', function(e){
		e.preventDefault()
		
		let key = document.getElementById('key')
		let pw = document.getElementById('pw')
		if(true || random.hash(pw.value)() === 3617750114){ // Not super secure, but should be enough to deter cheaters...
			get_results(key.value)
		}else{
			alert('Wrong password!')
		}
	})
	
}