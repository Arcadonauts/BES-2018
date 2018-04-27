window.alt = (function(){
	var search
	
	function filter(){
		var the_things = document.getElementById('all_the_things').getElementsByClassName('the_things')
		var value = document.getElementById('search').value
		console.log(the_things)
		for(var i = 0; i < the_things.length; i++){
			var title = the_things[i].getElementsByTagName('h1')[0].innerHTML
			if(title.toLowerCase().indexOf(value.toLowerCase()) > -1){
				the_things[i].hidden = false 
			}else{
				the_things[i].hidden = true 
			}
		}
		
		for(var s in status){
			if(!status[s]){
				the_things = document.getElementById('all_the_things').getElementsByClassName(s)
				for(var i = 0; i < the_things.length; i++){
					the_things[i].hidden = true 
				}
			}
		}
		
		
	}
	
	var status = {}
	
	function filter_status(){
		console.log('hello??')
		status[this.id] = this.checked 
		filter()
		console.log(status)
	}
	
	window.addEventListener('load', function(){
		console.log('load')
		
		search = document.getElementById('search')
		var events = ['change', 'keypress', 'paste', 'input']
		events.forEach(function(e){
			search.addEventListener(e, filter)
		})
		
		
		var butts = document.getElementsByTagName('input')
		boxes = []
		for(var i = 0; i < butts.length; i++){boxes.push(butts[i])}
		boxes.forEach(function(box){
			if(box.type === 'checkbox'){
				box.onclick = filter_status
				status[box.id] = box.checked 
			}
		})
		
		filter()
		
		var statuses = ['fifth_grade', 'unstarted', 'editing', 'finished', 'missing']
		var the_things = document.getElementById('all_the_things')
		var keys = document.getElementById('status_buttons')
		statuses.forEach(function(status){
			var div = keys.getElementsByClassName(status)[0]
			var count = the_things.getElementsByClassName(status).length 
			var text = document.createTextNode(' (' + count + ') ')
			div.appendChild(text)
			
		})
		
	
		
		
		
	})
})()