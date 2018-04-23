window.tools = (function(){

var todo = {
	label: 'To Do',
	id: 'todo',
	list: [
		// To Do
		'thumbs',
		
		'! Esacpe -> Escape',
		'Change of type from dynamic to floating with multiple sprites bug.',
		'Fix animation add first time bug',
		
		'?Sprite Mode Foreground',
		
		
		'Sprite Mode Message Box',
		
		
		'Default Level Code',
		'Foreground',

		'Win State',
		
		
		'Hide Player in Data Menu',
		
		
		'?Checkpoints',
		'?Help Tab',
		'?Level Code API',
		'?Mute/Volume',
		'?User Login Stuff',
		'?Capsule Hit Box',
		'?Double Jump',

		'?Resize All Images on Publishing',
		'?Bug Report Emailing',

		'?Refactor code so that there is only one data<br>object per sprite family',
		'?Refactor code so that player tab is part of data tab.',

		'?Volume Sliders',

		// To Done
		'~Auto Size Notes area',
		'~Collectables + Float',
		'~Fix Drag Bug',
		'~/BES-2018 (level select)',
		'~/all_the_things',
		'~Sprite Mode Counters',
		'~Fixed Edit Sprite Bug',
		'~Sprite Mode Projectile',
		'~Notes Tab',
		'~Warn before loading/saving',
		'~Action Key',
		'~Message Box',
		'~links tab',
		'~Contact API',
		'~random() for data',
		'~Added float movement',
		'~ Added jump and fall to walkers',
		'~Table hints in data/player',
		'~Added Level ID System',
		'~Prepare presentation',
		'~Data inputs change by type (dropdown for bool, etc.)',
		'~z depth',
		'~Death Animation',
		'~Report Tab',
		'~Image Uploader',
		'~Port to Python Anywhere',
		'~Retooled enitire file structrue',
		'~Sound FX',
		'~Audio Tab',
		'~Worksheets for Students',
		'~Data only changes one object bug',
		'~Tool Tips',
		'~Jump Timer',
		'~Frame Rate',
		'~Fix auto-bg bug',
		'~Animation Support',
		'~Fix player resizing bug',
		"~Image Resizing",
		'~Restructure Code',
		'~Sprite Editor',
		'~Place Ground',
		'~Improve Player Movement',
		'~fix Delete Sprite Bug',
		'~Fix Buttons Click Bug',
		'~Rectangle Tool',
		'~Code Editor',
		'~Player Data Edit',
		'~Clean Up UI',
		'~Data Edit',
		'~To Do List',
		'~Player Controls',
		'~Sprite Editor',
		'~Camera',
		'~Triangle Editor'
	],
	init: function(div){
		this.format(div)
	},
	format: function(outer){
		var div = document.createElement('div')
		outer.appendChild(div)
		div.className = 'col'
		var ul = document.createElement('ul')
		div.appendChild(ul)
		this.list.sort(function(a, b){
			var code = {
				'~': -10,
				'!': 2,
				'?': -1
			}

			var ac = code[a[0]] || 0
			var bc = code[b[0]] || 0

			return ac < bc ? 1 : -1

		})

		this.list.forEach(function(item){
			var li = document.createElement('li')
			if(item.startsWith('~')){
				li.className = 'done'
				li.innerHTML =  item.slice(1)
			}else if(item.startsWith('!')){
				li.className = 'urgent'
				li.innerHTML = item.slice(1)
			}else if(item.startsWith('?')){
				li.className = 'unimportant'
				li.innerHTML = item.slice(1)
			}else{
				li.className = 'todo'
				li.innerHTML = item
			}

			ul.appendChild(li)
		})
	},
}

var hints = {
	friction: 'A number between 0 and 1. The higher the number, the more slippery',
	jump: 'A positive number. The higher the number, the higher the jump.',
	speed: 'A positive number. The higher the number, the faster.',
	depth: 'A number. The sprites with higher numbers appear in front of sprites with lower numbers.',
	type: '<b>Do not edit this!</b> Instead, click the sprite with the <i class="material-icons">mode_edit</i> tool.',
	climb: 'A number between 0 and 1. The higher the number, the steeper the slope the sprite can climb',
	fall: 'Does this sprite fall when it reaches the edge of a platform, or turn around? Invalid if jump is not 0.',
	jump_interval: 'A postive number. The higher the number, the longer the sprite waits before jumping',
	amplitude_x: 'A number. The higher the number, the more this sprite moves left and right.',
	amplitude_y: 'A number. The higher the number, the more this sprite moves up and down.',
	period_x: 'A number. The higher the number, the longer this sprite takes to move left and right',
	period_y: 'A number. The higher the number, the longer this sprite takes to move up and down',
	//shift_x: 'A number. This controls the offset of the


}

function get_lvl(){
	return document.getElementById('lvl').innerHTML
}

function get_keys(obj, sort){
	var keys = []
	for(var k in obj){
		keys.push(k)
	}
	if(sort){
		keys.sort(sort)
	}
	return keys
}

function remove_children(node){
	while(node.hasChildNodes()){
		node.removeChild(node.lastChild)
	}
}

function parse(string){
	if(typeof string !== 'string'){
		return string
	}
	if(string.toLowerCase() === 'true'){
		return true
	}
	if(string.toLowerCase() === 'false'){
		return false
	}

	if(parseFloat(string) == string){
		return parseFloat(string)
	}

	return string
}

function data_table(div, data, onchange, options){
	console.log('build table')
	var table = document.createElement('table')
	div.appendChild(table)

	var row, el, input
	var keys = get_keys(data, function(x, y){
		var dots_x = x.split('.').length - 1
		var dots_y = y.split('.').length - 1

		if(dots_x > dots_y){
			return 1
		}else if(dots_x < dots_y){
			return -1
		}else{
			return x < y ? -1 : 1
		}

	})
	//for(var k in data){
	for(var i = 0; i < keys.length; i++){
		k = keys[i]
		if(play.no_copy.indexOf(k) > -1) continue

		row = document.createElement('tr')
		table.appendChild(row)

		el = document.createElement('td')
		row.appendChild(el)
		el.innerHTML = k

		el = document.createElement('td')
		row.appendChild(el)
		cell.create(k, data[k], el, onchange, options)

		if(hints[k]){
			el = document.createElement('td')
			row.appendChild(el)

			el.innerHTML = '<div class="tooltip"><i class="material-icons">help</i><span class="tooltiptext">' + hints[k] + '</span></div>'
		}

		//console.log(cell)

	}

	return table
}

function new_row_button(table, that, key, data){
	var cell, row, input

	row = document.createElement('tr')
	table.appendChild(row)

	cell = document.createElement('td')
	row.appendChild(cell)

	input = document.createElement('input')
	cell.appendChild(input)

	input.type = 'button'
	input.value = 'Add New Row'
	input.onclick = function(){
		var k = prompt('New Key:')
		data[k] = ""
		that.build(key)
	}
}

var cell = {
	create: function(name, value, parent, onchange, options){
		if(options){
			return this._create.array(name, value, parent, onchange, options)
		}
		var type = typeof value
		if(this._create[type]){
			return this._create[type](name, value, parent, onchange)
		}else{
			console.warn('Defaulting to string')
			return this._create.string(name, value, parent, onchange)
		}
	},
	_create: {
		array: function(name, value, parent, onchange, options){
			var input = document.createElement('select')
			parent.appendChild(input)

			var option = document.createElement('option')
			input.add(option)

			options.sort()
			options.forEach(function(opt){
				var option = document.createElement('option')
				option.value = opt
				option.innerHTML = opt

				input.add(option)
			})

			input.name = name
			input.onchange = onchange
			input.value = value


		},
		'boolean': function(name, value, parent, onchange){
			var input = document.createElement('input')
			parent.appendChild(input)

			input.type = 'checkbox'
			input.checked = value
			input.name = name
			input.onchange = onchange
		},
		string: function(name, value, parent, onchange){
			var input = document.createElement('input')
			parent.appendChild(input)

			input.type = 'text'
			input.value = value
			input.name = name
			input.onchange = onchange
		},
		number: function(name, value, parent, onchange){
			var input = document.createElement('input')
			parent.appendChild(input)

			input.type = 'text'
			input.value = value
			input.name = name
			input.onchange = onchange
		}
	},
	get: function(el){
		if(el.type === 'checkbox'){
			return el.checked
		}else{
			return el.value
		}

	},
}

var data = {
	label: 'Data',
	id: 'data',
	init: function(outer){
		this.outer = outer
		var div = this.div = document.createElement('div')
		outer.appendChild(div)

		var select = document.createElement('select')
		div.appendChild(select)
		select.style.width = '80%'
		
		var edit = document.createElement('a')
		div.appendChild(edit)
		edit.href = '#'
		edit.style.padding = '0 20px'
		edit.onclick = function(){
			le.edit_sprite_by_key(select.value)
		}
		
		var icon = document.createElement('i')
		edit.appendChild(icon)
		
		icon.className = 'material-icons'
		icon.innerHTML = 'mode_edit'
		
		var sprites = this.sprites = {}
		for(var i = 0; i < le.physics.data.sprites.length; i++){
			var s = le.physics.data.sprites[i]
			if(s){
				sprites[s.key] = s.data
			}
		}

		var opt
		var keys = get_keys(sprites, (x, y) => x < y ? -1 : 1) //function(x, y){ return x < y ? -1 : 1})
		for(var i = 0; i < keys.length; i++){
			key = keys[i]
			opt = document.createElement('option')
			select.appendChild(opt)

			opt.innerHTML = key
			opt.value = key

			var that = this
			
		}
		
		select.addEventListener('click', function(){
		//select.onchange = (function(){
			that.build(this.value)
		})
		
		
		
			
		this.table_div = document.createElement('div')
		div.appendChild(this.table_div)

		if(select.firstChild){
			select.firstChild.click()
		}
	},
	build: function(key){
		console.log(key)
		var data = this.sprites[key]
		//var that = this

		remove_children(this.table_div)

		var table = data_table(this.table_div, data, function(){
			var d
			var count = 0
			for(var i = 0; i < le.physics.data.sprites.length; i++){
				d = le.physics.data.sprites[i]
				if(d && d.key === key){
					d.data[this.name] = parse(cell.get(this))
					count += 1
				}
			}
		})
		new_row_button(table, this, key, data)

	},
	onclick: function(){
		this.div.remove()
		this.init(this.outer)
	}
}

var player = {
	label: 'Player',
	id: 'player',
	init: function(outer){
		this.outer = outer
		var div = document.createElement('div')
		outer.appendChild(div)

		var data = le.physics.data.player

		var table = data_table(div, data, function(){
			le.physics.data.player[this.name] = parse(cell.get(this))
		})

		new_row_button(table, this, undefined, data)
	},
	build: function(){
		console.log('build')
		remove_children(this.outer)
		this.init(this.outer)
	},
	onclick: function(){
		this.build()
	}
}

var code = {
	label: 'Code',
	id: 'code',
	init: function(outer){
		this.outer = outer
	},
	build: function(outer){
		var that = this
		var div = document.createElement('div')
		outer.appendChild(div)

		div.className = 'codediv'
		/*var area = document.createElement('textarea')
		div.appendChild(area)*/

		var editor = CodeMirror(div, {
			lineNumbers: true,
			theme: 'seti',
			tabSize: 5,
			gutter: true,
		})

		editor.setValue(this.value)

		editor.on('change', function(cm, change){
			that.value = cm.getValue()
		})

	},
	value: '',
	onclick: function(){
		remove_children(this.outer)
		this.build(this.outer)
	},
	save: function(){
		if(this.value.length === 0) return

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "/script-handler/" + get_lvl());
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.send(JSON.stringify({code: this.value}));
	},
	auto: function(){
		var imgs = document.getElementById('imgs')
		var img 
		var funcs = [
			'preupdate',
			'postupdate',
			'init',
			'ondeath',
			'collect',
			'action'
			 // begin_contact(this_sprite, other_sprite, equation)
			//  end_contact(this_sprite, other_sprite, equation)
			  //message.value
			  //message.close
		]
		var code = ''
		code += 'window.level_code = (function(){ \n'
		code += '\n\n'
		code += '  return {\n'
		code += '    preinit: function(){},\n'
		code += '    postinit: function(sprites){},\n'
		for(var i = 0; i < imgs.children.length; i++){
			img = imgs.children[i].innerHTML
			if(img.toLowerCase().endsWith('.png')){
				code += '    "' + img + '": {\n'
				for(var j = 0; j < funcs.length; j++){
					code += '      ' + funcs[j] + ': function(){},\n'
				}
				code += '      begin_contact: function(sprite, other, eq){},\n'
				code += '      end_contact: function(sprite, other, eq){}\n'
				code += '    },\n'
			}
		}
		code += '    message: {\n'
		code += "      value : '',\n"
		code += '      close : function(){}\n'
		code += '    }\n'
		
		code += '  }\n'
		code += '})()'
		return code 
	},
	open: function(){
		var xhr = new XMLHttpRequest()
		var that = this
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 && xhr.status === 200){
				that.value = xhr.responseText || that.auto()
			}
		}
		var lvl = get_lvl()
		xhr.open('GET', '/script-handler/' + lvl, true);
		xhr.send();

	}
}

var notes = {
	label: 'Notes',
	id: 'notes',
	init: function(outer){
		this.outer = outer
	},
	build: function(outer){
		var that = this
		var div = document.createElement('div')
		outer.appendChild(div)

		div.className = 'codediv'
		/*var area = document.createElement('textarea')
		div.appendChild(area)*/

		/*var editor = CodeMirror(div, {
			lineNumbers: true,
			theme: 'seti',
			tabSize: 5,
			gutter: true,
		})*/
		editor = document.createElement('textarea')
		editor.rows = 100

		editor.value = this.value

		editor.addEventListener('change', function(){
			that.value = this.value 
		})
		
		div.appendChild(editor)

	},
	value: '',
	onclick: function(){
		remove_children(this.outer)
		this.build(this.outer)
	},
	save: function(){
		//console.log('save notes ' + this.value)
		if(this.value.length === 0) return

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "/notes-handler/" + get_lvl());
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.send(JSON.stringify({code: this.value}));
	},
	open: function(){
		var xhr = new XMLHttpRequest()
		var that = this
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 && xhr.status === 200){
				that.value = xhr.responseText
			}
		}
		var lvl = get_lvl()
		xhr.open('GET', '/notes-handler/' + lvl, true);
		xhr.send();

	}
}

var help = {
	init: function(outer){
		this.outer = outer
	},
	label: 'Help',
	id: 'help',
	a: function (link, text){
		var aa = document.createElement('a')
		aa.href = link
		aa.innerHTML = text
		aa.target = '_blank'

		return aa
	},
	section: function (title){
		var div = document.createElement(div)

		var h = document.createElement('h1')
		h.innerHTML = title
		div.appendChild(h)

		var p = document.createElement('p')
		for(var i = 1; i < arguments.length; i++){
			var arg = arguments[i]
			if(typeof arg === 'string'){
				var text = document.createTextNode(arg)
				p.appendChild(text)
			}else{
				p.appendChild(arguments[i])
			}
		}
		div.append(p)

		return div
	},
	build: function(outer){
		var div = document.createElement('div')
		this.outer.appendChild(div)

		div.appendChild(
			this.section('Images', this.a('/upload', 'Click here'), ' to add an image to the game file. You must refresh the page (Ctrl + R) when you finish.')
		)

		div.appendChild(
			this.section('Physics', 'Use the triangle, rectangle, or ground button to create terrain for the sprite to interact with.')
		)



	},
	onclick: function(){
		remove_children(this.outer)
		this.build(this.outer)
	}
}

var report = {
	label: 'Report',
	id: 'report',
	init: function(outer){
		this.outer = outer
	},
	onclick: function(){
		remove_children(this.outer)
		this.build(this.outer)
	},
	build: function(outer){
		var div = document.createElement('div')
		outer.appendChild(div)

		var form = document.createElement('form')
		div.appendChild(form)

		form.appendChild(
			this.input('name', 'Name', 'Your Name')
		)

		form.appendChild(
			this.input('class', 'Class', 'Your Class')
		)

		form.appendChild(
			this.input('msg', 'Message', '', 'textarea')
		)

		var butt = document.createElement('button')
		div.appendChild(butt)

		butt.innerHTML = 'Send Message!'
		butt.onclick = this.send



	},
	send: function(){
		var entries = ['name', 'class', 'msg']

		var xml = new XMLHttpRequest();
		xml.open("POST", "/BES-2018-message", true);
		var fd = new FormData();

		entries.forEach(e => {
			fd.append(e, document.getElementById(e).value)
		})
		fd.append('lvl', get_lvl())
		xml.send(fd);
		/*xml.send(
			document.getElementById('form1')
		)*/
		xml.onreadystatechange = function(){
			if(xml.readyState === 4 && xml.status === 200){
				alert(xml.responseText)
			}
		}
		/*
		xml.onloadend = function(){

			alert('Message Sent!')
		}*/

	},
	input: function(id, title, placeholder, area){
		var div = document.createElement('div')
		div.className = 'report'

		var label = document.createElement('label')
		div.appendChild(label)
		label['for'] = id
		label.innerHTML = title

		if(area){
			var area = document.createElement('textarea')
			div.appendChild(area)
			area.id = id
			area.name = id
		}else{
			var input = document.createElement('input')
			div.appendChild(input)
			input.id = id
			input.type = 'text'
			input.placeholder = placeholder || title
			input.name = id
		}

		return div

	}
}

var audio = {
	init: function(outer){
		this.outer = outer
	},
	label: 'Sound FX',
	id: 'sound',
	build: function(outer){
		remove_children(this.outer)

		var div = document.createElement('div')
		this.outer.appendChild(div)

		var a = document.createElement('a')
		a.href = 'http://sfbgames.com/chiptone/'
		a.innerHTML = 'Sound Effects Generator'
		a.target = '_blank'

		div.appendChild(a)

		var data = le.get_list('audio')

		var table = data_table(div, le.physics.data.audio,  function(){
			le.physics.data.audio[this.name] = parse(cell.get(this))
		}, data)

		new_row_button(table, this, undefined, le.physics.data.audio)
	},
	onclick: function(){

		this.build(this.outer)
	}
}

var links = {
	init: function(outer){
		this.outer = outer
	},
	label: 'Links',
	id: 'links',
	a: function (link, text){
		var aa = document.createElement('a')
		aa.href = link
		aa.innerHTML = text
		aa.target = '_blank'

		return aa
	},
	style: function(tag, text){
		var t = document.createElement(tag)
		t.innerHTML = text 
		return t 
	},
	section: function (title){
		var div = document.createElement(div)

		var h = document.createElement('h1')
		h.innerHTML = title
		div.appendChild(h)

		var p = document.createElement('p')
		for(var i = 1; i < arguments.length; i++){
			var arg = arguments[i]
			if(typeof arg === 'string'){
				var text = document.createTextNode(arg)
				p.appendChild(text)
			}else{
				p.appendChild(arguments[i])
			}
		}
		div.append(p)

		return div
	},
	build: function(outer){
		var div = document.createElement('div')
		this.outer.appendChild(div)

		div.appendChild(
			this.section('Upload', this.a('/upload?level=' + get_lvl(), 'Click here'), ' to add an image or auido file to the level.', this.style('b', 'You must refresh the page (Ctrl + R) when you finish.'))
		)

		div.appendChild(
			this.section('Play', this.a('/BES-2018/' + get_lvl(), 'Click here'), ' to play the finished version of this level.')
		)
		
		div.appendChild(
			this.section('Edit', this.a('/editor', 'Click here'), ' to edit a different level.')
		)
		
		div.appendChild(
			this.section('Sound Effects', this.a('http://sfbgames.com/chiptone/', 'Click here'), ' to create sound effects.')
		)
		
		/*
		div.appendChild(
			this.section('Create', this.a('/create', 'Click here'), ' to create a new level.')
		)
		*/


	},
	onclick: function(){
		remove_children(this.outer)
		this.build(this.outer)
	}
}

function add_tool(tool){
	var parent = document.getElementById('content')
	var tabs = document.getElementById('tabs')

	var li = document.createElement('li')
	var a = document.createElement('a')

	a.innerHTML = tool.label
	a.href = '#'
	a.value = tool.id
	a.onclick = function(){
		var that = this

		tools.pages.forEach(function(tab){
			if(tab.id === that.value){
				tab.style.display = 'inherit'
				//tab.style.backgroundColor = 'green'
			}else{
				tab.style.display = 'none'
				//tab.style.backgroundColor = 'red'
			}
		})

		var tabs = document.getElementById('tabs')
		for(var i = 0; i < tabs.children.length; i++){
			var li = tabs.children[i]
			li.firstChild.style.backgroundColor = '#333333'
		}
		this.style.backgroundColor = 'black'

		if(tool.onclick){
			tool.onclick()
		}

	}
	li.appendChild(a)

	tabs.appendChild(li)

	var div = document.createElement('div')
	div.id = tool.id
	div.className = 'content'

	tool.init(div)

	parent.appendChild(div)

	tools.pages.push(div)

	if(tool.save || tool.open){
		le.physics.plugins.push(tool)
	}

}

window.addEventListener('load', function(){
	tools.pages = []

	if(window.location.hostname === 'localhost'){
		add_tool(todo)
	}else{
		//add_tool(report)
	}
	add_tool(links)
	add_tool(player)
	add_tool(data)
	add_tool(code)
	add_tool(notes)
	add_tool(audio)


	document.getElementById('tabs').children[0].children[0].click()

})


var tools = {}

return tools
})()