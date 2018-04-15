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
		send: function(lvl){
			
			var xml = new XMLHttpRequest();
			xml.open("POST", "/create", true);
			var fd = new FormData();
			fd.append('lvl', lvl)
				
			xml.send(fd);
			xml.onloadend = this.success(xml, this);
			return true
        },
        success: function(xhr, that){
            return function(){
				alert(xhr.responseText)
			   that.redirect('/upload')
            }
        },
		do_the_thing: function(){
			if(this.is_valid()){
				this.upload()
			}
				
		},
		is_valid: function(){
			var lvl = document.getElementById('lvl').value 
			if(lvl.match(/^[a-zA-Z0-9_\-]+$/)){
				this.send(lvl)
			}else{
				this.error("Level name can only contain letters, numbers, _, and -")
			}
		},
		upload: function(){
			this.send(this.file)
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
	
	window.addEventListener('load', function(){
		var the_thing = document.getElementById('create')
		the_thing.onclick = do_the_thing
	})
	
	
	
	return loader 
})()