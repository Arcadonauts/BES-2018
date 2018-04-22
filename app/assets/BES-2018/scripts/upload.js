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
		send: function(file){
			
			var xml = new XMLHttpRequest();
			xml.open("POST", "/upload", true);
			var fd = new FormData();
            fd.append("file", file)
			fd.append('type', this.check_type())
			fd.append('lvl', this.check_level())
				
			xml.send(fd);
			/*xml.send(
				document.getElementById('form1')
			)*/
			xml.onloadend = this.success(xml, this);
			return true
        },
        success: function(xhr, that){
            return function(){
               alert(xhr.responseText)
			   that.clear()
            }
        },
		do_the_thing: function(){
			if(this.is_valid()){
				this.upload()
			}
				
		},
		is_valid: function(){
			var a = this.check_exists() && this.check_type()
			var b = this.check_level()
			return a && b && true 
		},
		check_exists: function(){
			//var error = document.getElementById('exists_error')
			if(this.file){
				this.error('exists', '')
				return this.file
			}else{
				this.error('exists', 'Click "Browse" to select file')
			}
		},
		check_type: function(){
			if(is.image(this.file)){
				this.error('filetype', '')
				return 'image'
			}
			if(is.audio(this.file)){
				this.error('filetype', '')
				return 'audio'
			}
			
			this.error('filetype', 'Error: Unrecognized file type ' + this.file.type)
		},
		check_level: function(){
			var lvl = document.getElementById('lvl').value
			
			if(lvl === 'Level' || lvl === '' || lvl === undefined){
				
				this.error('lvl', "Please select a level")
			}else{
				this.error('lvl', '')
				return lvl  
			}
		},
		upload: function(){
			this.send(this.file)
		},
		preview: function(){
			var prev = document.getElementById('prev')
			var fn = document.getElementById('filename')
			var ft = document.getElementById('filetype')
		
			var file = loader.file = this.files[0]
			
			var reader = new FileReader()
			
			reader.onload = function(){
				prev.src = this.result
			}
			
			if(file && is.image(file)){
				reader.readAsDataURL(file)
				fn.innerHTML = file.name
				ft.value = 'image'
			}else if(file && is.audio(file)){
				fn.innerHTML = file.name
				ft.value = 'audio'
				prev.src = ""
			}else{
				prev.src = ""
				ft.value = 'unknown'
				fn.innerHTML = file.name
			}
		},
		error: function(type, msg){
			if(!type.endsWith('_error')){
				type += '_error'
			}
			var e = document.getElementById(type)
			if(e){
				e.innerHTML = msg 
				return true 
			}else{
				console.warn('invalid error: ' + type)
				return false 
			}
			
		},
		clear: function(){
			var errors = document.getElementsByClassName('error')
			for(var i = 0; i < errors.length; i++){
				errors[i].innerHTML = ''
			}
			this.file = undefined
			
			var prev = document.getElementById('prev')
			var fn = document.getElementById('filename')
			var ft = document.getElementById('filetype')
			
			prev.src = ""
			ft.value = 'unknown'
			fn.innerHTML = ''
		}
		
	}
	
	function do_the_thing(){
		loader.do_the_thing()
	}
	
	function getQueryString() {
		//https://stackoverflow.com/questions/647259/javascript-query-string#647272
	  var result = {}, queryString = location.search.slice(1),
		  re = /([^&=]+)=([^&]*)/g, m;

	  while (m = re.exec(queryString)) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	  }

	  return result;
	}
	
	window.addEventListener('load', function(){
		var browse = document.getElementById('file')
		browse.onchange = loader.preview 
		
		document.getElementById('filetype').value = '' 
		
		var the_thing = document.getElementById('the_thing')
		the_thing.onclick = do_the_thing
		
		var form = document.getElementById('form1')
		form1.onchange = () => loader.is_valid()
		
		var level = getQueryString().level 
		if(level){
			var lvl = document.getElementById('lvl')
			lvl.value = level 
			if(!lvl.value){
				console.log('default')
				lvl.value = 'Level'
			}
		}
		
		var select = document.getElementById('lvl')
		var link = document.getElementById('edit_link')
		select.onchange = function(){
				
				link.href = '/editor/' + this.value 
		}
		if(select.value){
			link.href = '/editor/' + select.value 
		}
		
	})
	
	
	
	return loader 
})()