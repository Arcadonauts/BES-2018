window.loader = (function(){

	var is = {
		image: function(file){
			return !! file.type.match(/^image/)
		},
		audio: function(file){
			return !! file.type.match(/^audio/)
		}
	}
	
	var loader = {
		send: function(lvl, id){
			
			var xml = new XMLHttpRequest();
			xml.open("POST", "/create", true);
			var fd = new FormData();
			fd.append('lvl', lvl)
			fd.append('id', id)
				
			xml.send(fd);
			xml.onloadend = this.success(xml, this);
			return true
        },
        success: function(xhr, that){
            return function(){
				alert(xhr.responseText)
			   //that.redirect('/upload')
            }
        },
		do_the_thing: function(){
			if(this.is_valid()){
				this.upload()
			}
				
		},
		is_valid: function(){
			var id = document.getElementById('id').value 
			var lvl = document.getElementById('lvl').value 
			if(id.match(/^[a-zA-Z0-9_\-]+$/)){
				this.send(lvl, id)
			}else{
				this.error("Level ID can only contain letters, numbers, _, and -")
			}
		},
		redirect: function(to){
			window.location = to 
		},
		error: function(msg){
			type = 'error'
			var e = document.getElementById(type)
			if(e){
				e.innerHTML = msg 
				return true 
			}else{
				console.warn('invalid error: ' + type)
				return false 
			}
			
		},
		
	}
	
	function do_the_thing(){
		loader.do_the_thing()
	}
	
	function create_id(value){
		var id_input = document.getElementById('id')

		id_input.value = value.split(' ').map(x => x[0] ? x[0].toUpperCase() : '').join('')
	
		
	}
	
	window.addEventListener('load', function(){
		var the_thing = document.getElementById('create')
		the_thing.onclick = do_the_thing
		
		var lvl_input = document.getElementById('lvl')
		lvl_input.addEventListener('input', function(){
			create_id(this.value)
		})
	})
	
	
	
	return loader 
})()