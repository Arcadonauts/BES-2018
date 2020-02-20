
function getQueryVariable(variable) {
	//https://davidwalsh.name/query-string-javascript
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable){return pair[1];}
	}
	return(false);
}

let random = {
	_seeded: false,
	hash: function xmur3(str) {
		
		for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
			h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
			h = h << 13 | h >>> 19;
		return function() {
			h = Math.imul(h ^ h >>> 16, 2246822507);
			h = Math.imul(h ^ h >>> 13, 3266489909);
			return (h ^= h >>> 16) >>> 0;
		}
	},
	sfc32: function (a, b, c, d) {
		return function() {
		  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
		  var t = (a + b) | 0;
		  a = b ^ b >>> 9;
		  b = c + (c << 3) | 0;
		  c = (c << 21 | c >>> 11);
		  d = d + 1 | 0;
		  t = t + d | 0;
		  c = c + t | 0;
		  return (t >>> 0) / 4294967296;
		}
	},
	seed: function(str){
		let h = this.hash('' + str)
		this.random = this.sfc32(h(), h(), h(), h())
	},
	random: function(){
		throw("Must seed random before using")
	},
	range: function(a, b){
		if(b === undefined){
			b = a 
			a = 0 
		}
		
		return Math.floor(a) + this._int_below(b-a)
	},
	choice: function(arr){
		let i = this.range(arr.length)
		return arr[i]
	},
	_int_below: function(a){
		return Math.floor(this.random()*a)
	},
	shuffle: function(arr){
		let n = arr.length 
		for(let i = n-1; i > 0; i -= 1){
			let j = this.range(0, i+1)
			let temp = arr[i]
			arr[i] = arr[j]
			arr[j] = temp
		}
	}
}

function simpson(f, a, b, n){
	let dx = (b-a)/n 
	let s = 0
	for(let i = 0; i <= n; i++){
		let k 
		if(i === 0 || i === n){
			k = 1 
		}else if(i % 2 === 1){
			k = 4
		}else{
			k = 2
		}
		
		let x = a + i*dx 
		let y = f(x)
		s += k*y 
		
	}
	
	return s*dx/3 
}




let quizzes = [
	{
		key: 'dumb',
		name: 'Dumb Quiz for Dummies',
		problems: function(){
			let probs = []
			
			for(let i = 0; i < 5; i ++){
				let a =  random.range(10)
				let b = random.range(10)
				
				probs.push({
					answer: a + b,
					formula: a + ' + ' + b ,
					instruction: "Find the sum: "
				})
			}
			
			return probs
		}
	},
	{
		key: 'u_sub',
		name: 'Calculus U-Substitution Quiz',
		problems: function(){
			let funcs = [this.funcs.a, this.funcs.b, this.funcs.c, this.funcs.d, this.funcs.e]
			let probs = []
			random.shuffle(funcs)
			funcs.forEach(func => {
				let endpoints = func.endpoints.slice(0)
				random.shuffle(endpoints)
				let e1 = this.parse(endpoints[0])
				let e2 = this.parse(endpoints[1])
				let a, b 
				if(e1.value < e2.value){
					a = e1
					b = e2 
				}else{
					a = e2 
					b = e1 
				}
				
				let prob = this.gen(func, a.value, b.value, a.string, b.string)
				
				probs.push(prob)
			})
			
			return probs 
		},
		parse: function(str){
			if(typeof str === 'number'){
				return {
					value: str,
					string: '' + str
				}
			}else{
				let p = Math.PI 
				return {
					value: eval(str),
					string: str.replace('p', '\\pi')
				}
			}
		},
		funcs: {
			a: {
				func: x => 1/Math.sqrt(1-x*x),
				disp: '\\frac{1}{\\sqrt{1-x^2}}',
				endpoints: [-0.5, 0, 0.5]
			},
			b: {
				func: x => 2*x/(x*x + 2),
				disp: '\\frac{2x}{x^2 + 2}',		
				endpoints: [-2, -3, -4, -5, 0, -1, 1, 2, 3, 4, 5, 6, 7]
			},
			c: {
				func: Math.tan,
				disp: '\\tan(x)',
				endpoints: ['-p/4', '-p/3', '-p/6', 0, 'p/4', 'p/3', 'p/6']
			},
			d: {
				func: x => x*Math.exp(x*x + 1),
				disp: 'x e^{x^2+1}',
				endpoints: [0, 1, 2, 3, 4, 5]
			},
			e: {
				func: x=> 15*x*Math.sqrt(x + 1),
				disp: '15 x \\sqrt{x+1}',
				endpoints: [-1, 0, 3, 8] 
			}
		},
		
		gen: function gen(func, av, bv, as, bs){
			return {
				answer: simpson(func.func, av, bv, 100000),
				formula: "\\[\\int_{" + as + '}^{' + bs + '}' + func.disp + "dx \\ \\approx \\ \\]",
				instruction: "Find the following: "
			}
		}
	},
	{
		key: 'simple_int',
		name: 'Simple Integral Test',
		problems: function(){
			let funcs = [this.funcs.exp, this.funcs.sin, this.funcs.sq]
			let probs = []
			random.shuffle(funcs)
			funcs.forEach(func => {
				let endpoints = func.endpoints.slice(0)
				random.shuffle(endpoints)
				let a = Math.min(endpoints[0], endpoints[1])
				let b = Math.max(endpoints[0], endpoints[1])
				
				let prob = this.gen(func, a, b)
				
				probs.push(prob)
			})
			
			return probs 
		},
		funcs: {
			exp: {
				func: Math.exp,
				disp: 'e^x',		
				endpoints: [-2, -3, -4, -5, 0, -1, 1, 2, 3, 4, 5, 6, 7]
			},
			sin: {
				func: Math.sin,
				disp: '\\sin(x)',
				endpoints: [-5.2, -2.4, -1.1, 8.8]
			},
			sq: {
				func: x => x*x,
				disp: 'x^2',
				endpoints: [0, 1, 2, 3, 4, 5]
			}
		},
		gen: function gen(func, a, b){
			return {
				answer: simpson(func.func, a, b, 1000),
				formula: "\\[\\int_{" + a + '}^{' + b + '}' + func.disp + "dx \\ \\approx \\ \\]",
				instruction: "Find the following: "
			}
		}
	}
]



function disable_input(id, val){
	let el = document.getElementById(id)

	el.value = val 
	
	el.setAttribute("readonly", true) 
}

function get_quiz(key){
	let quiz
	quizzes.forEach(q => {
		if(q.key === key){
			quiz = q 
		}
	})
	return quiz 
}

function generate_quiz(seed, key){
	random.seed(seed.trim())
	
	let quiz = get_quiz(key)
	
	let problems = quiz.problems()
	
	let parent = document.getElementById('problems')
	
	problems.forEach((prob, i) => {
		let div = document.createElement('div')
		parent.appendChild(div)
		
		let instruction = document.createElement('span')
		div.appendChild(instruction)
		instruction.className = "problem"
		instruction.innerHTML = prob.instruction
		
		let formula = document.createElement('span')
		div.appendChild(formula)
		formula.className = "problem"
		formula.innerHTML = prob.formula 
		
		
		let input = document.createElement('input')
		div.appendChild(input)
		input.className = "problem"
		input.id = 'q' + i 
		input.name = 'q' + i 
		
	})
	
	let submit = document.createElement('input')
	document.getElementById('quiz').appendChild(submit)
	submit.type = 'submit'
	submit.addEventListener('click', function(e){
		console.log(document.getElementById('quiz'))
		//e.preventDefault()
	})
	


	
}

