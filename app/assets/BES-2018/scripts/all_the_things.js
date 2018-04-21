window.alt = (function(){
	var search
	
	function filter(){
		var the_things = document.getElementById('all_the_things').getElementsByClassName('the_things')
		console.log(the_things)
		for(var i = 0; i < the_things.length; i++){
			var title = the_things[i].getElementsByTagName('h1')[0].innerHTML
			if(title.toLowerCase().indexOf(this.value.toLowerCase()) > -1){
				the_things[i].hidden = false 
			}else{
				the_things[i].hidden = true 
			}
		}
	}
	
	function filter_status(){
		var status = this.innerText.toLowerCase().replace(' ', '_')
		
		console.log(status)
		var the_things = document.getElementsByClassName('the_things')
		for(var i = 0; i < the_things.length; i++){
			the_things[i].hidden = true 
		}
		
		var show = document.getElementsByClassName(status)
		for(var i = 0; i < show.length; i++){
			show[i].hidden = false 
		}
	}
	
	window.addEventListener('load', function(){
		console.log('load')
		
		search = document.getElementById('search')
		var events = ['change', 'keypress', 'paste', 'input']
		events.forEach(function(e){
			search.addEventListener(e, filter)
		})
		
		/*
		var butts = document.getElementById('status_buttons')
		for(var i = 0; i < butts.children.length; i++){
			butts.children[i].onclick = filter_status
		}
		*/
	
		
		
		
	})
})()