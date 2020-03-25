
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
		key: 'vol',
		name: 'Volume',
		problems: function(){
			let probs = []
			
			let a = random.range(1, 5)
			let b = random.range(1, 5)
			let c = random.range(1, 5)
			let q1 = this.funcs.q1(a, b, c) 
			probs.push({
				answer: q1.answer,
				formula: '\\[ \\ \\ ' + q1.form + '\\ \\ \\]',
				instruction: 'Find the volume of the solid when rotated around the ' + q1.axis + '-axis, \\['+q1.a+'\\leq x \\leq'+q1.b+'\\]'				
			})
			
			a = random.range(1, 5)
			b = random.range(1, 5)
			let q2 = this.funcs.q2(a, b)
			probs.push({
				answer: q2.answer,
				formula: '\\[ \\ \\ ' + q2.form + '\\ \\ \\]',
				instruction: 'Find the volume of the solid when rotated around the ' + q2.axis + '-axis, \\['+q2.a+'\\leq x \\leq \\frac{\\pi}{'+q2.b0+'}\\]'				
			})
			
			
			
			a = random.range(1, 5)
			b = random.range(1, 5)
			c = random.range(1, 5)
			d = random.range(1, 5)
			
			let q3 = this.funcs.q3(a, b, c, d)
			probs.push({
				answer: q3.answer,
				formula: '\\[ \\ \\ ' + q3.form + '\\ \\ \\]',
				instruction: 'Find the volume of the solid when rotated around the ' + q3.axis + '-axis, \\['+q3.a+'\\leq x \\leq '+q3.b0+'\\]'	
			})
			
			return probs
			
		},
		funcs: {
			q1: function(a, b, c){
				let d = c + a 
				
				return {
					f : (x)=> a*Math.pow(b + x*x, 3),
					g : (x)=> 0,
					a : c,
					b : d,
					axis : 'y',
					form : 'f(x) = ' + a + '(' + b + '+x^2)^3',
					answer: (a*Math.PI/4)*(Math.pow(b+d*d, 4) - Math.pow(b+c*c)^4)
				}
			},
			q2: function(a, b){
				return {
					f : (x)=> a*Math.sin(b*x),
					g : (x)=> 0,
					a : 0,
					b : Math.PI/b,
					b0: b,
					axis : 'x',
					form : 'f(x) = ' + a + '\\sin(' + b + 'x)',
					answer: a*a*Math.PI*Math.PI/(2*b)
				}
			},
			q3: function(a, b, c, d){
				function solution(a, b, c, d){
					return 2*Math.PI*(((a-c)/2)*Math.pow(a/b, 3)  -  ((b-d)/3)*Math.pow(a/b, 3))
				}
				
				function frac(a, b){
					if(Math.floor(a/b) == a/b){
						return '' + (a/b)
					}else{
						return '\\frac{'+a+'}{'+b+'}'
					}
				}
				
				let x0 = 0
				let xf, ans, b0 
				if(a/b < c/d){
					xf = a/b 
					ans = solution(a, b, c, d)
					b0 = frac(a, b)
				}else{
					xf = c/d 
					ans = solution(c, d, a, b)
					b0 = frac(c, d)
				}
				
				return {
					f: (x)=>a - b*x,
					g: (x)=>c - d*x,
					a: x0,
					b: Math.floor(100*xf)/100,
					b0: b0,
					axis: 'y',
					form: 'f(x)='+a+'-'+b+'x \\text{ and } g(x)='+c+'-'+d+'x',
					answer: ans
					
				}
			}
		}
	},
	{
		key: 'der',
		name: 'Derivatives',
		problems: function(){
			let probs = []
			
			let a =  random.range(4)
			let b = random.range(-4, 4)
			let c = random.range(-4, 4)
			while(!(b*c*a)){
				a =  random.range(4)
				b = random.range(-4, 4)
				c = random.range(-4, 4)
			}
			let quad = this.funcs.quad(a, b, c)
			
			for(let i = 0; i < 3; i ++){
				
				
				let x = quad.x(i)
			
				let y = quad.f(x)
				
				probs.push({
					answer: quad.fp(x),
					formula:" \\[ \\ \\ f(x)=" + quad.form + " \\ \\ \\]",
					instruction: "At the point (" + x + ", " + y + "), find the derivative of" 
				})
			}
			
			a =  random.range(4)
			b = random.range(1, 4)
			c = random.range(1, 4)
			
			let sqrt = this.funcs.sqrt(a, b, c)
			for(let i = 0; i < 2; i++){
				let x = sqrt.x(i)
			
				let y = sqrt.f(x)
				
				probs.push({
					answer: sqrt.fp(x),
					formula:" \\[ \\ \\ f(x)=" + sqrt.form + " \\ \\ \\]",
					instruction: "At x = " + x + ", find the derivative of" 
				})
			}
			
			a =  random.range(4)
			b = random.range(1, 4)
			c = random.range(1, 4)
			
			let inv = this.funcs.inv(a, b, c)
			for(let i = 0; i < 1; i++){
				let x = inv.x(i)
			
				let y = inv.f(x)
				
				probs.push({
					answer: inv.fp(x),
					formula:" \\[ \\ \\ f(x)=" + inv.form + " \\ \\ \\]",
					instruction: "At x = " + x + ", find the derivative of" 
				})
			}
			
			return probs
		},
		funcs: {
			quad: function(a, b, c){
				function sign(x){
					return x < 0 ? '- ' : '+ '
				}
			
				return {
					x: i => 3*i - 2,
					f: (x) => a*x*x + b*x + c,
					fp: (x) => 2*a*x + b,
					form: a + "x^2" + sign(b) + Math.abs(b) + 'x' + sign(c) + Math.abs(c)
				}
			},
			sqrt: function(a, b, d){
				
				
				d *= 2
				let c = (2*b*d+d*d)/4
				a *= d
				if(a === 0){
					a = 1
				}
				let xs = [-d/2, (2*b + d)/2]
				return {
					x: i => xs[i],
					f: (x) => a*Math.sqrt(b*x + c),
					fp: (x) => (a*b)/(2*Math.sqrt(b*x+c)),
					form: a + " \\sqrt{" + b  + " x + " + c + "}"
				}
			},
			inv: function(a0, b, d){
				a = b*d 
				c = a0*b 
				if(a === 0){
					a = 1
				}
				return {
					x: i => 1-a0,
					f: (x) => a/(b*x + c),
					fp: (x) => -(a*b)/(Math.pow(b*x+c, 2)),
					form: "\\frac{" + a + "}{" + b  + " x + " + c + "}"
				}
			}
		}
	},
	{
		key: 'conics',
		name: 'Rotating Conic Sections',
		problems: function(){
			function sign(x){
				return x < 0 ? '- ' : '+ '
			}
			
			function formula(A1, B1, C1, F){
				let f = A1 + "x^2 " + sign(B1) + Math.abs(B1) + "xy " + sign(C1) + Math.abs(C1) + "y^2 " + sign(F) + Math.abs(F) + ' = 0'
				return "\\[ \\ \\ \\ " + f + "\\ \\ \\ \\]"
			}
			
			function angle_prob(){
				let A1 = random.range(-5, 5)
				let B1 = random.range(-5, 5)
				let C1 = random.range(-5, 5)
				let F = random.range(-10, 10)
				
				while(A1 === 0){
					A1 = random.range(-5, 5)
				}
				while(B1 === 0){
					B1 = random.range(-5, 5)
				}
				while(C1 === 0 || C1 === A1){
					C1 = random.range(-5, 5)
				}
				while(F === 0){
					F = random.range(-5, 5)
				}
				
				return {
					formula: formula(A1, B1, C1, F),
					instruction: "What is the angle (in radians) you must rotate to eliminate B?",
					answer: Math.atan(B1/(A1-C1))/2
				}
			}
			
			let probs = []
			let p = 
			probs.push(angle_prob())
			probs.push(angle_prob())
			
			
			
			let A = random.range(10, 30)
			while(A === 25 || A === 16){
				A = random.range(10, 30)
			}
			let C = A - 25 
			let F = -A - C

			let A1 = (16*A + 9*C)/25
			let C1 = (9*A + 16*C)/25 
			let B1 = -24 
			
			let f = formula(A1, B1, C1, F)
			
			let ps = [
				[A, 'A'],
				[C, 'C'],
				[F, 'F']
			]
			
			
			
			
			
			ps.forEach(p => {
				probs.push({
					answer: p[0],
					formula: f,
					instruction: "Rotate to eliminate the B term. What is your new <b>" + p[1] + "</b>?"
				})
			})
			
			
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
		input.style = "width:80px"
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

