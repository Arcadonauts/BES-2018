(function(){
	function requestFullScreen(element) {
		// Supports most browsers and their versions.
		var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;

		if (requestMethod) { // Native full screen.
			requestMethod.call(element);
		} else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
			var wscript = new ActiveXObject("WScript.Shell");
			if (wscript !== null) {
				wscript.SendKeys("{F11}");
			}
		}
	}

	function setup_disp(){
		console.log('Setup Display')
		
		function top_height(win_h, can_h){
			//console.log(((win_h - can_h)/2) + 'px')
			return ((win_h - can_h)/2) + 'px'
			
		}

		var normalsize = document.getElementById('normalsize')
		var fullscreen = document.getElementById('fullscreen')
		
		function resize(){
			var c = document.getElementById('canvas')
			var t = document.getElementById('top')
			var width = 640
			var height = 512
			var win_h = window.innerHeight || document.body.clientHeight
			var win_w = window.innerWidth || document.body.clientWidth
			if(win_h > win_w*height/width){
				c.style.width = '100%'
				c.style.height = ''
				
				t.style.height = top_height(win_h, win_w*height/width)
				
			}else{
				c.style.height = '100%'	
				c.style.width = ''
				t.style.height = '0px'
			}
			
			normalsize.style.display = 'inline'
			fullscreen.style.display = 'none'
			
		}
		/*
		fullscreen.onclick = function(){
			
			var c = document.getElementById('canvas')
			requestFullScreen(document.body)
			resize()
			window.onresize = resize
			close_menu(document.getElementById('menu_list'))
		}
		*/
		//*
		fullscreen.onclick = function(){
			resize()
			// Fix this
			// http://stackoverflow.com/questions/641857/javascript-window-resize-event
			window.onresize = resize
			var m = document.getElementById('menu_list')
		}//*/
		
		
		function normal(){
			var win_h = window.innerHeight || document.body.clientHeight
			var win_w = window.innerWidth || document.body.clientWidth
			var c = document.getElementById('canvas')
			var t = document.getElementById('top')
			
			c.style.width = c.style.height = ''
			
			t.style.height = top_height(win_h, height)
			
			normalsize.style.display = 'none'
			fullscreen.style.display = 'inline'
			
		}
		
		normalsize.onclick = function(){
			normal()
			// Fix this
			// http://stackoverflow.com/questions/641857/javascript-window-resize-event
			window.onresize = normal
			var m = document.getElementById('menu_list')
		}
	
		normalsize.onclick()
	}
	
	window.disp = {set: false,
					setup: function(){
						if(this.set){
							return
						}else{
							setup_disp()
							this.set = true
						}
					}
				}

})()