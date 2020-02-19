console.log('hello world')

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


let funcs = {
	exp: {
		func: Math.exp,
		disp: 'e^x',		
	}
}

function integrate(func, a, b){
	
	
	
	return {
		answer: simpson(func.func, a, b, 1000),
		formula: "\\[\\int_{" + a + '}^{' + b + '}' + func.disp + "dx\\]"
	}
}


window.onload = function(){
	let integral = integrate(funcs.exp, -2, 5)
	
	
	let span = document.getElementById('formula')
	span.innerHTML = integral.formula + '\\(\\ \\ \\approx \\ \\ \\)' + integral.answer 
	
	MathJax.typeset()
}