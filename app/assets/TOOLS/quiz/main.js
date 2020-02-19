console.log('hello world')

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