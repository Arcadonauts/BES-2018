window.onload = function(){

	function stopRKey(evt) {
	  var evt = (evt) ? evt : ((event) ? event : null);
	  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
	  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
	}

	document.onkeypress = stopRKey;


	document.getElementById('show_quiz').addEventListener('click', function(e){
		e.preventDefault()
		//lines.hidden = !lines.hidden
		let name = document.getElementById('name').value
		let key = document.getElementById('key').value
		
		console.log(name, key)
		
		if(name && key){
			disable_input('name', name)
			disable_input('key', key)
			
			let butt = document.getElementById('show_quiz')
			butt.remove()
			generate_quiz(name, key)
			
		}else if(key){
			disable_input('key', key)
			alert('You need to enter your name!')
		}
		
		MathJax.typeset()
	})
	
	
	
}