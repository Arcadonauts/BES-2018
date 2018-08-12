window.tools = (function(){
	
	 var p8 = {
		black: 0x000000,
		dark_blue: 0x1D2B53,
		dark_purple: 0x7E2553,
		dark_green: 0x008751,
		brown: 0xAB5236,
		dark_gray: 0x5F574F,
		light_gray: 0xC2C3C7,
		white: 0xFFF1E8,
		red: 0xFF004D,
		orange: 0xFFA300,
		yellow: 0xFFEC27,
		green: 0x00E436,
		blue: 0x29ADFF,
		indigo: 0x83769C,
		pink: 0xFF77A8,
		peach: 0xFFCCAA
	}
	
	var tab_manager = {
		init: function(){
			this.tabs = []
			this.dx = 5
			this.dy = 5
			this.right = this.dx 
		},
		add: function(tab){
			tab.x = this.right 
			tab.y = this.dy 
			tab.id = this.tabs.length 
			this.right += this.dx + tab.width 
			
			this.tabs.push(tab)
		},
		select: function(id){
			this.tabs.forEach(t => t.frame = 1)
			this.tabs[id].frame = 0 
			this.tabs[id].select()
			
		}
		
	}
	
	function make_tab(canvas){
		var s = game.add.sprite(0,0,'tab')
		tab_manager.add(s)
		
		s.inputEnabled = true 
		s.events.onInputDown.add(function(s){
			tab_manager.select(s.id)
			
		})
		
		var text = game.add.text(0,0,canvas.label, {
			fontSize: 16,
			boundsAlignH : 'center',
			fill: '#' + p8.white.toString(16)
		})
		
		text.setTextBounds(0,	0,	s.width,	s.height)
		s.addChild(text)
		s.text = text 
		
		s.select = function(){
			canvas.select()
		}
		
		s.update = function(){
			if(s.frame === 0){
				s.tint = canvas.tint 
			}else{
				s.tint = 0xffffff
			}
		}
		
	}
		
		
	function make_canvas(c){

		c.select = function(){
			console.log('mode: ' + this.label)
		}
		
		return c 
	}	
	
	function make_part(){
		var c = {
			label: 'part',
			tint: p8.blue 
		}
		
		make_canvas(c)
	
		return c 
	}
	
	function make_gate(){
		var c = {
			label: 'gate',
			tint: p8.pink 
		}
		
		make_canvas(c)
		
		return c
		
	}

	function make_board(){
		var c = {
			label: 'board',
			tint: p8.green 
		}
		
		make_canvas(c)
		
		return c 
		
	}
	
	return {
		make_part: make_part,
		make_gate: make_gate,
		make_board: make_board,
		make_tab: make_tab,
		tab_manager: tab_manager
	}

})()