window.alt = (function(){
	var search
	
	function filter(){
		var the_things = document.getElementsByClassName('the_things')
		for(var i = 0; i < the_things.length; i++){
			var title = the_things[i].getElementsByTagName('h1')[0].innerHTML
			if(title.toLowerCase().indexOf(this.value.toLowerCase()) > -1){
				the_things[i].hidden = false 
			}else{
				the_things[i].hidden = true 
			}
		}
	}
	
	window.addEventListener('load', function(){
		console.log('load')
		
		search = document.getElementById('search')
		var events = ['change', 'keypress', 'paste', 'input']
		events.forEach(function(e){
			search.addEventListener(e, filter)
		})
		
		
		
	})
})()