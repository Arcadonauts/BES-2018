window.tools = (function(){

var todo = {
	label: 'To Do',
	id: 'todo',
	list: [
		// To Do 
		'!Port to Python Anywhere',
		'!Fix animation add first time bug',
		
		'Help Tab',
		'More Sprite Modes',
		'Default Level Code',
		
		'~Image Uploader',
		
		'Level Code API',
		'Foreground',
		'?User Login Stuff',
		'?Capsule Hit Box',
		'z depth',
		'random() for data',
		'Death Animation',
		'Win Animation',
		
		
		'?Double Jump',
		'?Health Bar',
		'?Resize All Images on Publishing',
		'?Bug Report Emailing',
		'?Warn before loading/saving',
		'?Refactor code so that there is only one data<br>object per sprite family',
		'?Refactor code so that player tab is part of data tab.',
		'?Data inputs change by type (dropdown for bool, etc.)',
		'?Volume Sliders',
		
		// To Done 
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
	format: function(div){
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
/*
function get_queries(){
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);

    var urlParams = {};
    while (match = search.exec(query)){
       urlParams[decode(match[1])] = decode(match[2]);
	}
	
	return urlParams 
}
*/
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
		
		//console.log(cell)
		cell.create(k, data[k], el, onchange, options)
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
			opt.onclick = function(){
				that.build(this.value)
			}
		}
		
		this.table_div = document.createElement('div')
		div.appendChild(this.table_div)
		
		if(select.firstChild){
			select.firstChild.click()
		}
	},
	build: function(key){
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
	open: function(){
		var xhr = new XMLHttpRequest()
		var that = this 
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 && xhr.status === 200){
				that.value = xhr.responseText
			}
		}
		var lvl = get_lvl()
		xhr.open('GET', '/script-handler/' + lvl, true);
		xhr.send();
		
	}
}
	
var help = {
	init: function(outer){
		this.outer = outer 
	},
	label: 'Help',
	id: 'help',
	build: function(outer){
		var div = document.createElement('div')
		this.outer.appendChild(div)
		
		div.innerHTML = 'HELP'
	},
	onclick: function(){
		remove_children(this.outer)
		this.build(this.outer)
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
	
	//add_tool(help)
	add_tool(todo)
	add_tool(player)
	add_tool(data)
	add_tool(code)
	add_tool(audio)
	
	
	document.getElementById('tabs').children[0].children[0].click()
	
})


var tools = {}

return tools 
})()