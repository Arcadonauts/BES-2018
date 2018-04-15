window.loader = (function(){

	/*
	var loader = {
        count: 0,
        file_list: [],
        get_files: function(){
            this.file_list = document.getElementById('file').files
        },
        send: function(){
            if(this.count < this.file_list.length){

                var fd = new FormData();
                fd.append("file", this.file_list[this.count])

                var xml = new XMLHttpRequest();
                xml.open("POST", "/upload", true);
                xml.send(fd);
                xml.onloadend = this.success(xml, this);

                this.count += 1
                return true

            }else{
                return false
            }

        },
        success: function(xhr, that){
            return function(){
                that.append_filename(xhr.responseText)
                return that.send()
            }
        },
        append_filename: function(fn){
            var ul = document.getElementById('filenames')
            var li = document.createElement('li')
            li.innerText = fn
            ul.appendChild(li)

        }
    }

	function previewFile() {
	  var preview = document.querySelector('img');
	  var file    = document.querySelector('input[type=file]').files[0];
	  var reader  = new FileReader();

	  reader.onloadend = function () {
		preview.src = reader.result;
	  }

	  if (file) {
		reader.readAsDataURL(file);
	  } else {
		preview.src = "";
	  }
	}

    function do_the_thing(){
        loader.get_files()
        loader.send()
    }
	
	 window.onload = function(){
        var butt = document.getElementById('the_thing')
        butt.onclick = do_the_thing
		
		var browse = document.getElementById('file')
		browse
    }
	*/
	
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
	
	window.addEventListener('load', function(){
		var browse = document.getElementById('file')
		browse.onchange = loader.preview 
		
		document.getElementById('filetype').value = '' 
		
		var the_thing = document.getElementById('the_thing')
		the_thing.onclick = do_the_thing
		
		var form = document.getElementById('form1')
		form1.onchange = () => loader.is_valid()
	})
	
	
	
	return loader 
})()