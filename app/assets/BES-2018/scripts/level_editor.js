window.le = (function(){
	
const THRESHHOLD = 1
const ACTIVE_ICON = .54
const INACTIVE_ICON = .26

var WIDTH = 800
var HEIGHT = 600

var icon_map = {
	'Move': ['action', 'open_with', 'Click and drag to move.'],
	'Zoom In': ['action', 'zoom_in', 'Zoom in'],
	'Zoom Out': ['action', 'zoom_out', 'Zoom out'],
	'Triangle': ['image', 'details', 'Click to add triangle (for terrain)'],
	'Delete': ['navigation', 'close', 'Click to delete sprite or triangle.'],
	//'Sprite': ['content', 'add_circle_outline', 'Click to add a sprite.'],
	'Sprite': ['image', 'tag_faces', 'Click to add a sprite.'],
	'Save': ['content', 'save', 'Save current level.'],
	'Load': ['file', 'file_upload', 'Load level.'],
	'Play': ['av', 'play_circle_outline', 'Test the game.'],
	'Back': ['content', 'reply', 'Return to previous screen.'],
	//'Rectangle': ['content', 'add_box'],
	'Circle': ['content', 'add_circle', 'Circle Hitbox'],
	'Ok': ['action', 'done', 'Add to level'],
	'Edit': ['image', 'edit', 'Click a sprite to edit it.'],
	'Clear': ['action', 'delete', 'Delete Entire Level.'],
	'Background': ['device', 'settings_system_daydream', 'Add or change background.'],
	'Ground': ['action', 'timeline', 'Click from left to right to add ground. Click this button when finished.'],
	'Rectangle': ['image', 'crop_5_4', 'Click to add rectangle (for terrain)'],
	'Box': ['content', 'add_box', 'Rectangle Hitbox'],
	'+' : ['content', 'add_circle_outline', '+1'],
	'-' : ['content', 'remove_circle_outline', '-1']
	
}

var types = [
	{
		type: 'Dynamic'
	},	{
		type: 'Player'
	},	{ 
		type: 'Floating',
		amplitude_y: 10,
		period_y: 120,
		shift_y: 0,
		amplitude_x: 0,
		period_x: 0,
		shift_x: 0
	},	{
		type: 'Ghost',
		depth: 100,
	},	{
		type: 'Walk',
		speed: 100,
		jump: 0,
		fall: true,
		jump_interval: 50,
		climb: .7,
	}, {
		type: 'Projectile',
		fired_from: 'player',
		speed: 400,
		angle: 45,
		lead_x: 10,
		lead_y: 10,
		warmup: 0,
		lifetime: 120,
//	}, {
//		type: 'Message',
	}, {
		type: 'Counter',
		enumerate: true,
		who: 'player',
		what: 'health',
		dx: 0,
	}, {
		type: 'Collectable',
		amplitude_y: -5,
		period_y: 240,
		shift_y: 0,
		amplitude_x: 0,
		period_x: 0,
		shift_x: 0
	}, {
		type: 'Shadow',
		who: 'player'
	}
]

var buttons = []

function get_lvl(){
	return document.getElementById('lvl').innerText
}

function get_list(id){
	var ul = document.getElementById(id)
	var op = []
	for(var i = 0; i < ul.childElementCount; i++){
		op.push(ul.children[i].innerHTML)
	}
	return op 
}

function update(old, data){
	for(var key in data){
		if(data.hasOwnProperty(key)){
			old[key] = data[key]
		}
	}
}

function constrain(x, min, max){
	if(x < min){
		return min 
	}
	if(x > max){
		return max 
	}
	return x 
}

function dist(x1, y1, x2, y2){
	return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2))
}

function Triangle(x1, y1, x2, y2, x3, y3){
	if(y1 == x2 && x2 == y2 && y2 == x3 && x3 == y3 && y3 === undefined){
		this.points = x1 
	}else{
		this.points = [x1, y1, x2, y2, x3, y3]
	}
	this.make_ccw()
}

Triangle.prototype = {
	vertices: function(){
		// return an object, v,  do make vertex access easier
		// v.x1, v.x2, ...
		var v = {}
		for(var i = 0; i < this.points.length; i++){
			if(i % 2 === 0){
				v['x' + (i/2 + 1)] = this.points[i]
			}else{
				v['y' + (i+1)/2] = this.points[i]
			}
		}
		return v 
	},
	shoelace: function(){
		// return double the signed area 
		var v = this.vertices()
		return v.x1*v.y2 + v.x2*v.y3 + v.x3*v.y1 - v.x2*v.y1 - v.x3*v.y2 - v.x1*v.y3 
	},
	is_ccw: function(){
		return this.shoelace() > 0 
	},
	is_cw: function(){
		return !this.is_ccw()
	},
	is_linear: function(){
		return Math.abs(this.shoelace()) <= THRESHHOLD
	},
	is_good: function(){
		var dists = []
		var ps = this.points
		var j 
		for(var i = 0; i < 6; i += 2){
			j = (i+2)%6
			dists.push(
				dist(ps[i], ps[i+1], ps[j], ps[j+1])
			)
		}
		dists.sort(function(a, b){return a - b})
		var goodness = (dists[0] + dists[1] - dists[2])/dists[2]
		
		return goodness > 0.001 
		
	},
	area: function(){
		return Math.abs(this.shoelace())/2 
	},
	make_ccw: function(){
		if(this.is_ccw()){
			return 
		}else{
			var v = this.vertices()
			// The old switcheroo 
			this.points = [v.x1, v.y1, v.x3, v.y3, v.x2, v.y2]
		}
	},
	inside: function(x, y){
		function sign(p1x, p1y, p2x, p2y, p3x, p3y){
			return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y)
		}
		var v = this.vertices()
		
		var b1 = sign(x, y, v.x1, v.y1, v.x2, v.y2) < 0
		var b2 = sign(x, y, v.x2, v.y2, v.x3, v.y3) < 0 
		var b3 = sign(x, y, v.x3, v.y3, v.x1, v.y1) < 0 
		
		return (b1 == b2) && (b2 == b3)
	}
}

function radio(x, y, labels, callback, callbackContext){

	function radio_button(label){
		var b = le.editor.add.sprite(x, y, 'radio')
		container.addChild(b)
		container.buttons.push(b)
		b.parent = container
		b.label = label 
		b.inputEnabled = true 
		
		var t = le.editor.add.text(b.width, 0, label, {fill: 'white'})
		b.addChild(t)
		b.text = t 
		t.anchor.set(0, 0)
		
		b.events.onInputDown.add(function(b){
			b.select()
		})
		
		b.select = function(){
			var c 
			for(var i = 0; i < this.parent.buttons.length; i++){
				c = this.parent.buttons[i]
				c.frame = 1
				c.text.alpha = .3
			}
			this.frame = 0 
			this.parent.value = this.label.toLowerCase()
			this.text.alpha = 1 
			console.log(this.parent.value)
		}
		
		return b 
	}
	
	var container = le.editor.add.sprite(x, y)
	container.buttons = []
	container.select = function(i){
		this.buttons[i].select()
	}
	
	container.choose = function(key){
		this.buttons.forEach(function(butt){
			if(butt.label.toLowerCase() === key.toLowerCase()){
				butt.select()
			}
		})
	}
	
	var bg = container.bg = le.editor.add.sprite(0, 0, 'rect_container')
	container.addChild(bg)
	
	var b
	x = y = 0
	var w = 0 
	var h = 0
	for(var i = 0; i < labels.length; i++){
		b = radio_button(labels[i])
		y += b.height 
		h += b.height 
		w = Math.max(w, b.width + b.text.width + 8)
	
	}
	
	container.select(0)
	
	bg.width = w 
	bg.height = h 
	
	return container 
	
}

function textbutton(x, y, label, callback, callbackContext){
	var butt 
	butt = iconbutton(x, y, label, callback, callbackContext)
	if(butt){
		return butt 
	}
	
	butt = le.editor.add.button(x, y, 'button', callback, callbackContext, 1, 0, 2, 3)
	var text = le.editor.add.text(butt.width/2, butt.height/2, label, {
		fontSize: 16
	})
	text.anchor.set(.5)
	butt.addChild(text)
	butt.text = text 
	
	
	return butt 
}

function loadicon(label){
	var dir1 = 'https://raw.githubusercontent.com/google/material-design-icons/master/' //ic_blur_on_black_18dp.png'
	var folder = icon_map[label][0]
	var dir2 =  '/2x_web/ic_'
	var file = icon_map[label][1]
	var size = '24dp'
	var ext = '.png'
	var color = 'black'
	var _ = '_'
	
	var url = dir1 + folder + dir2 + file + _ + color + _  + size + ext 
	var key = label + '_button'
	
	le.editor.load.spritesheet(key, url)
}

function iconbutton(x, y, label, callback, callbackContext, box){
	box = box === undefined ? true : box 
	
	if(!icon_map[label]){
		return false 
	}
	
	var tool_tip = icon_map[label][2]
	
	var key = label + '_button'
	
	var empty = le.editor.add.sprite(x, y)
	empty.anchor.set(1, 0)
	
	var cont = le.editor.add.sprite(0, 0, 'rect_container')
	if(!box) cont.alpha = 0 // Ugly 
	
	var butt = le.editor.add.button(0, 0, key, callback, callbackContext)
	butt.activate = function(){
		//this.tint = '0x000000'
		cont.tint = '0xffffff'
		this.alpha = ACTIVE_ICON 
	}
	
	butt.select = function(){
		this.alpha = 1
		//this.tint = '0xff00ff'
		cont.tint = '0xff00ff'
		
	}
	
	butt.onInputOver.add(function(){
		this.alpha = 1 
		mouse.tip.show(tool_tip)
	}, butt)
	
	butt.onInputOut.add(function(){
		this.activate()
		mouse.tip.hide()
	}, butt)
	
	
	butt.activate()
	
	cont.width = butt.width 
	cont.height = butt.height 

	empty.addChild(cont)
	empty.addChild(butt)
	
	butt.text = {text:label}
	butt.empty = empty 
	
	buttons.push(butt)
//	console.log(buttons.length)
	
	return butt  
	
	
	
}

function counter(x, y, label, value, callback, width){
	
	
	
	var style = {
		fill: 'white',
		fontSize: '18px',
		align: 'center',
		boundsAlignH: 'center'
		
	}
	
	
	
	function get_text(value){
		return label + '\n' + value
	}
	
	function change(bump){
		return function(){
			empty.set(bump(empty.value))
		}
	}
	
	var empty = le.editor.add.sprite(x, y)
	
	empty.set = function(x){
		if(x < 1) x = 1 
		
		this.value = x 
		this.text.text = get_text(this.value)
		if(callback) callback(this.value)
	}

	empty.get = function(){
		return this.value 
	}
	
	
	
	
	var minus = iconbutton(0, 0, '-', change(x => x-1), undefined, false)
	
	width -= 2*minus.width 
	
	var label_text = le.editor.add.text(minus.right, 0, get_text(value), style)
	label_text.lineSpacing = -5
	
	var px, cont_width
	if(width > label_text.width){
		label_text.x = 0//minus.x + minus.width 
		label_text.y = 0 
		label_text.setTextBounds(minus.right, label_text.y, width, label_text.height)
		px = label_text.x + width + minus.width
		cont_width = width + 2*minus.width 
		console.log('width: ' + width)
	}else{
		label_text.right 
		console.log('autowidth')
	}
	var plus = iconbutton(px, 0, '+', change(x => x+1), undefined, false)
	var cont = le.editor.add.sprite(0, 0, 'rect_container')
	
	
	empty.addChild(cont)
	empty.addChild(minus.empty)
	empty.addChild(label_text)
	//empty.addChild(value_text)
	
	empty.addChild(plus.empty)
	
	empty.value = value 
	empty.text = label_text
	
	//plus.x = text.x + text.width
	cont.width = cont_width || label_text.right + plus.width
//	console.log([plus.x, plus.y, plus.left, plus.right])
	cont.height = plus.bottom 
	
	return empty 
	
	
}

function load_img(fn, next){
	return function(){
		le.editor.state.start(next, true, false, fn)
		/*
		if(next === 'bg'){
			le.editor.state.start('main', true, false, fn)
		}else if(next === 'sprite'){
			le.editor.state.start('main', true, false, fn)
		}
			console.log(next)
		}
		//*/
	}
}

function add_triangle(points, sprite, id){
	for(var i = 0; i < points.length; i += 2){
		points[i] -= sprite.x 
		points[i+1] -= sprite.y 
		
		points[i] /= sprite.scale.x 
		points[i+1] /= sprite.scale.y
		
	}
	

	if(id === undefined){
		id = physics.add.terrain(points)
	}
	if(id === false){
		return 
	}

	
	var poly = new Phaser.Polygon(points)
	var graphics = le.editor.add.graphics(0, 0)
	graphics.beginFill(0xff33ff)
	graphics.alpha = .5
	graphics.drawPolygon(poly.points)
	graphics.endFill()
	graphics.id = id 
	graphics.points = points 
	graphics.shape = 'triangle'
	
	//var tex = graphics.generateTexture()
	//graphics.destroy()
	sprite.addChild(graphics)
}

function add_sprite(data, bg, id){
	var sprite = le.editor.add.sprite(data.x, data.y, data.key)
	bg.addChild(sprite)
	
	sprite.inputEnabled = true
	sprite.id = id 
	sprite.hit = function(x, y){
		console.log('hit test')
		return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height 
	}
	sprite.events.onDragStop.add(function(sprite, pointer){
		physics.data.sprites[sprite.id].x = sprite.x 
		physics.data.sprites[sprite.id].y = sprite.y 
	})
	
	sprite.scale.set(data.data.scale )
	
	return sprite 
}

function edit_sprite(sprite){
	le.editor.state.start('sprite_editor', true, false, false, sprite)
}

function edit_sprite_by_key(key){
	var sprite 
	main.bg.children.forEach(s => sprite = s.key === key ? s : sprite)
	if(sprite) edit_sprite(sprite)
}

function add_control_node(parent, x_key, y_key){
	var node = le.editor.add.sprite(0, 0, 'node')
	node.anchor.set(.5)
	node.node = true 
	//parent.addChild(sprite)
	//sprite.parent = parent 
	if(parent.nodes && parent.nodes.push){
		parent.nodes.push(node)
	}
	
	//sprite.x = parent[x_key]
	//sprite.y = parent[y_key]
	node.x_key = x_key 
	node.y_key = y_key 
	
	node.inputEnabled = true 
	node.input.enableDrag()
	
	node.events.onDragUpdate.add(function(node, pointer, x, y, snap, from_start){
		
		var obj = {}
		obj[node.x_key] = x 
		obj[node.y_key] = y 
		resize_hitbox(parent, node, obj)
	})
	
	node.reposition = function(){
		//console.log(parent.x + ', ' + parent.parent.x)
		this.x = /*parent._parent.world.x + */ parent[x_key]
		this.y = /*parent._parent.world.y + */parent[y_key]
	}
	
	node.reposition()
	
	return node  
}

function add_follow_node(x, y, leader, xy){
	var node = le.editor.add.sprite(x, y, 'node')
	node.anchor.set(.5)
	node.update = function(){
		this.position[xy] = leader.position[xy]
	}
	return node 
}

function remove_hitzone(sprite){
	if(sprite.hitbox){
		if(sprite.hitbox.nodes){
			for(var i = 0; i < sprite.hitbox.nodes.length; i++){
				sprite.hitbox.nodes[i].destroy()
			}
		}
		sprite.hitbox.nodes = []
		sprite.hitbox.destroy()
		sprite.hitbox = undefined
	}
}

function add_hitbox(parent){
	var box = le.editor.add.sprite(parent.x, parent.y, 'rect_select')
	//parent.addChild(box)
	box._parent = parent 
	parent.hitbox = box 
	
	box.nodes = []
	
	add_control_node(box, 'left', 'top')
	add_control_node(box, 'right', 'top')
	add_control_node(box, 'left', 'bottom')
	add_control_node(box, 'right', 'bottom')
	
	return box 
}

function add_circle(parent){
	var circ = le.editor.add.sprite(parent.width/2, parent.height/2, 'circ_select')
	//parent.addChild(circ)
	circ._parent = parent 
	parent.hitbox = circ 
	circ.circle = true 
	
	circ.nodes = []

	circ.anchor.set(.5)
	
	reradius(circ)
	
	add_control_node(circ, 'centerX', 'centerY')
	add_control_node(circ, 'radiusX', 'radiusY')
	
	return circ 
	
}

function reradius(circ){
	circ.radiusX = circ.centerX  + circ.width/2
	circ.radiusY = circ.centerY 
	//console.log([circ.centerX, circ.centerY])
}

function mouse_out(){
	buttons = buttons.filter(function(x){return x.exists})
	buttons.forEach(function(b){
		if(b && b.exists && b.activate){
			b.activate()
		}
	})
	
	mouse.tip.hide()
	
}

var resize_hitbox = function(box, node, xy){
		if(xy.radiusX !== undefined && xy.radiusY !== undefined){
			var r = Math.abs(xy.radiusX - box.centerX - box.parent.x)
			box.width = box.height = 2*r 
			reradius(box) 
		}
		if(xy.centerX !== undefined){
			box.centerX = xy.centerX - box.parent.x 
			reradius(box) 
		}
		if(xy.centerY !== undefined){
			box.centerY = xy.centerY - box.parent.y 
			reradius(box)
		}
		if(xy.left !== undefined){
			var dx = xy.left - box.parent.x - box.x 
			box.x = xy.left - box.parent.x
			box.width -= dx 
		}
		if(xy.top !== undefined){
			var dy = xy.top - box.parent.y - box.y
			box.y = xy.top - box.parent.y
			box.height -= dy 
		}
		if(xy.bottom !== undefined){
			box.height = xy.bottom - box.y - box.parent.y
		}
		if(xy.right !== undefined){
			box.width = xy.right - box.x  - box.parent.x 
		}
		
		for(var i = 0; i < box.nodes.length; i++){
			box.nodes[i].reposition()
		}
}

var hud = {
	data: {},
	following: [],
	messages: [],
	follow: function(object, key, killable){
		this.following.push([object, key, killable]) 
	},
	message: function(msg, life){
		life = life || 100
		this.messages.push([msg, life])
	},
	log: function(){
		for(var i = 0; i < arguments.length; i++){
			this.message(arguments[i])
		}
	},
	state: undefined,
	update: function(){
		var t = ''
		
		if(this.state !== le.editor.state.current){
			this.init()
		}
		this.following = this.following.filter(function(x){return !x[2] || x[0].alive})
		for(var i = 0; i < this.following.length; i++){
			var key = this.following[i][1]
			var obj = this.following[i][0]
			this.data[obj.key + ' ' + key] = obj[key] 
		}
		
		this.messages = this.messages.filter(function(x){return x[1] > 0})
		for(var i = 0; i < this.messages.length; i++){
			t += '\n' + this.messages[i][0]
			this.messages[i][1] -- 
		}
		
		for(var key in this.data){
			t += '\n' + key + ': ' + this.data[key]
		}
		this.text.text = t 
	},
	init: function(){
		this.data = {}
		//this.following = {}
		this.state = le.editor.state.current
		this.text = le.editor.add.text(10, HEIGHT, 'Hello, World!', {
			fill: 'white',
			font: '16pt'
		})
		this.text.anchor.set(0, 1)
	}
}

var physics = {
	key: 'physics',
	reload: false,
	data: {
		lvl: '',
		bg: '',
		terrain: [],
		sprites: [],
		audio: {
			jump: '',
			win: '',
			lose: ''
		},
		player: {
			'body.damping': 0,
			speed: 300,
			jump: 450,
			friction: 0.85
		}
	},
	plugins: [],
	load: function(bg){
		var points, sprite, obj
		for(var i = 0; i < this.data.terrain.length; i++){
			if(!this.data.terrain[i]) continue 
			
			points = this.data.terrain[i].shape 
			
			add_triangle(points, bg, i)
		}
		for(var i = 0; i < this.data.sprites.length; i++){
			if(!this.data.sprites[i]) continue 
			
			add_sprite(this.data.sprites[i], bg, i)
		}
	},
	open: function(){
		// https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 && xhr.status === 200){
				le.editor.state.start('opener', true, false, JSON.parse(xhr.responseText))
			}
		}
		xhr.open('GET', '/json-handler/' + get_lvl(), true);
		xhr.send();
		
		this.plugins.forEach(function(p){
			if(p.open){
				p.open()
			}
		})
	},
	save: function(){
		//this.data.terrain = this.data.terrain.filter(function(x){return x})
		// https://stackoverflow.com/questions/6418220/javascript-send-json-object-with-ajax
		var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
		xmlhttp.open("POST", "/json-handler/" + get_lvl());
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.send(JSON.stringify(this.data));
		
		this.plugins.forEach(function(p){
			if(p.save){
				p.save()
			}
		})
	},
	remove: {
		terrain: function(x, y){
			for(var i = 0; i < physics.data.terrain.length; i++){
				var tri = new Triangle(physics.data.terrain[i].shape)
				if(tri.inside(x, y)){
					//console.log('INSIDE')
					return true 
				}
			}
			//console.log('OUTSIDE')
			return false 
		}
	},
	get: {
		sprite: function(key){
			for(var i = 0; i < physics.data.sprites.length; i++){
				var s = physics.data.sprites[i]
				if(s && s.key === key){
					return s 
				}
			}
			return undefined 
		}
	},
	add: {
		sprite: function(sprite, override){
			var w = sprite.width * (sprite.animations.frameData ? sprite.animations.frameTotal : 1)
			var h = sprite.height 
			
			var obj = {
				key: sprite.key,
				x: sprite.x,
				y: sprite.y,
			}
			
			console.log(sprite.animations)
			
			var old = physics.get.sprite(sprite.key)
			if(old && !override){ // Copy 
				obj.data = old.data 
				physics.data.sprites.push(obj)
				return 

			}else{
				obj.data = {
					type: sprite.type.value.toLowerCase(),
					scale: sprite.resizer.get()/10,
					img_width: w,
					img_height: h,
					frames: sprite.reframer.get(),
					frame_rate: sprite.frame_rater.get()
				}
				
				var defaults = {}
				update(defaults, types.filter(t => t.type.toLowerCase() === obj.data.type)[0])
				//console.log(defaults)
				//console.log(old)
				if(old) update(defaults, old.data)
				if(defaults){
					for(var k in defaults){
						if(obj.data[k] === undefined){
							//console.log(k + ' is undefined and being updated to ' + defaults[k])
							obj.data[k] = defaults[k]
						}
					}
				}else{
					console.warn('Illegal type: ' + obj.data.type)
				}
			}
			
			if(sprite.hitbox.circle){
				obj.data.centerX = sprite.hitbox.centerX - sprite.x 
				obj.data.centerY = sprite.hitbox.centerY - sprite.y 
				obj.data.r = sprite.hitbox.width/2 
				
				obj.data.width = sprite.hitbox.width
				obj.data.height = sprite.hitbox.height
			}else{
				obj.data.width = sprite.hitbox.width
				obj.data.height = sprite.hitbox.height
				obj.data.offsetX = sprite.hitbox.x - sprite.x 
				obj.data.offsetY = sprite.hitbox.y - sprite.y 
			}
			
			if(old && override){ // Edit 
				// update EACH sprite.obj with appropriate key 
				physics.data.sprites.forEach(function(s){
					if(s && s.key === sprite.key) update(s.data, obj.data)
				})
			}else{ // New 
				//console.log([old, override])
				physics.data.sprites.push(obj)
			}
		},
		terrain: function(points){
			if(points.length === 6){
				var tri = new Triangle(points)
				console.log(tri.area())
				if(!tri.is_good()){
					return false 
				}
				tri.make_ccw()
				physics.data.terrain.push({shape: tri.points})
				return physics.data.terrain.length - 1 
			}
		}
	}
}

var mouse = {
	key: 'mouse',
	x: 0,
	y: 0,
	init: function(){
		this.tip.init()
	},
	modes: {
		edit: {
			start: function(sprite){
				mouse.pointer.set('green_edit')
				mouse.pointer.sprite.anchor.set(0)
				sprite.ignoreChildInput = true 
			},
			click: function(sprite, x, y){
				x -= sprite.x 
				y -= sprite.y 
				
				x /= sprite.scale.x 
				y /= sprite.scale.y
				
				
				var child 
				var found_sprite = false 
				for(var i = 0; i < sprite.children.length; i++){
					child = sprite.children[i]
					if(child.hit && child.hit(x, y)){
						found_sprite = true 
						break 
					}
				}
				if(found_sprite){
					//physics.data.sprites[child.id] = undefined
					edit_sprite(child)
				}
				
			},
			end: function(sprite){
				mouse.pointer.destroy()
			}
			
		},
		move: {
			start: function(sprite){
				mouse.pointer.set('blue_move')
				sprite.input.enableDrag()
				sprite.children.forEach(function(c){
					if(c.input) {
						c.input.enableDrag()						
						//c.events.onDragUpdate.add((s, p, x, y)=> console.log([s.x, s.y, x, y, p.x, p.y]))
						c.events.onDragUpdate.add(function(sprite, mouse, x, y){
							var parent = sprite.parent 
							var s = parent.scale.x 
							var x0 = parent.position.x 
							var y0 = parent.position.y
							
							sprite.x = (mouse.x - x0)/s - sprite.width/2 
							sprite.y = (mouse.y - y0)/s - sprite.height/2 
							
						})
					}
				})
				sprite.ignoreChildInput = false 
			},
			end: function(sprite){
				sprite.input.disableDrag()
				sprite.children.forEach(function(c){
					if(c.input) c.input.disableDrag()
				})
			mouse.pointer.destroy()
			}
		},
		'delete': {
			start: function(sprite){
				mouse.pointer.set('x')
				sprite.ignoreChildInput = true 
			},
			end: function(sprite){
				mouse.pointer.destroy()
			},
			click: function(sprite, x, y){ // sprite == bg 
				x -= sprite.x 
				y -= sprite.y 
				
				x /= sprite.scale.x 
				y /= sprite.scale.y
				
				
				var child 
				var found_tri = found_sprite = false 
				for(var i = 0; i < sprite.children.length; i++){
					child = sprite.children[i]
					if(child.shape === 'triangle'){
						var tri = new Triangle(child.points)
						if(tri.inside(x, y)){
							found_tri = true 
							break 
						}
					}else if(child.hit && child.hit(x, y)){
						console.log('del: sprite')
						found_sprite = true 
						break 
					}
				}
				if(found_tri){
					physics.data.terrain[child.id] = undefined
					child.destroy()
				}else if(found_sprite){
					physics.data.sprites[child.id] = undefined
					child.destroy()
				}
				
			}
		},
		ground: {
			start: function(sprite){
				mouse.pointer.set('node')
				this.edges = []
				this.nodes = []
				sprite.ignoreChildInput = true 
			},
			end: function(sprite){
				mouse.pointer.destroy()
				this.create(this.nodes, sprite)
				this.destroy()
			},
			click: function(sprite, x, y){
				// Left to Right 
				if(this.nodes.length && x < this.nodes[this.nodes.length - 1].x) return 
				
				var node = le.editor.add.sprite(x, y, 'node')
				node.anchor.set(.5)
				this.nodes.push(node)
				
				if(this.edges.length > 0){
					var e = this.edges[this.edges.length - 1]
					e.points[1] = node.position
				}
				this.edges.push(
					le.editor.add.rope(0, 0, 'rope', null, [node.position, mouse.pointer.sprite.position])
				)
			},
			create: function(nodes, sprite){
				if(nodes.length < 2) return 
				
				var buff = 10
				var points = []
				var y_max = nodes[0].y
				for(var i = 0; i < nodes.length; i++){
					points.push(nodes[i].x)
					points.push(nodes[i].y)
					y_max = Math.max(y_max, nodes[i].y)
				}
				y_max += buff 
				for(var i = 0; i < points.length - 2; i += 2){
					var x0, y0, x1, y1 
					if(points[i+1] > points[i+3]){
						x0 = points[i]
						y0 = points[i+1]
						x1 = points[i+2]
						y1 = points[i+3]
					}else{
						x1 = points[i]
						y1 = points[i+1]
						x0 = points[i+2]
						y0 = points[i+3]
					}
					
					
					add_triangle([x0, y0, x0, y_max, x1, y_max], sprite)
					add_triangle([x0, y0, x1, y1, x1, y_max], sprite)
				}
				
			},
			destroy: function(){
				for(var i = 0; i < this.nodes.length; i++){
					this.nodes[i].destroy()
				}
				for(var i = 0; i < this.edges.length; i++){
					this.edges[i].destroy()
				}
				this.nodes = []
				this.edges = [] 

			}
		},
		rectangle: {
			start: function(sprite){
				mouse.pointer.set('node')
				this.edges = []
				this.nodes = []
				sprite.ignoreChildInput = true 
			},
			end: function(sprite){
				mouse.pointer.destroy()
				this.destroy()
			},
			click: function(sprite, x, y){
				var node = le.editor.add.sprite(x, y, 'node')
				node.anchor.set(.5)
				this.nodes.push(node)
				var p0 = node.position
				
				var len = this.nodes.length 
				if(len == 4){
					this.create(this.nodes, sprite)
					this.destroy()
					
					return 
				}else{
					var node = add_follow_node(x, y, mouse.pointer.sprite, 'x')
					this.nodes.push(node)
					var p1 = node.position
					
					var node = add_follow_node(x, y, mouse.pointer.sprite, 'y')
					this.nodes.push(node)
					var p2 = node.position
					
					var p3 = mouse.pointer.sprite.position
					
					var e = [
						[p0, p1], [p1, p3], [p2, p0], [p3, p2]
					]
					
					for(var i = 0; i < e.length; i++){
						this.edges.push(
							le.editor.add.rope(0, 0, 'rope', null, e[i])
						)
					}
					/*
					le.editor.add.rope(0, 0, 'rope', null, [p0, p1])
					le.editor.add.rope(0, 0, 'rope', null, [p1, p3])
					le.editor.add.rope(0, 0, 'rope', null, [p2, p0])
					le.editor.add.rope(0, 0, 'rope', null, [p3, p2])
					*/
				}
			},
			destroy: function(){
				for(var i = 0; i < this.nodes.length; i++){
					this.nodes[i].destroy()
				}
				for(var i = 0; i < this.edges.length; i++){
					this.edges[i].destroy()
				}
				this.nodes = []
				this.edges = [] 
			},
			create: function(nodes, sprite){
				var x0 = nodes[0].x 
				var y0 = nodes[0].y 
				var x1 = nodes[3].x
				var y1 = nodes[3].y 
				add_triangle([x0, y0, x0, y1, x1, y1], sprite)
				add_triangle([x0, y0, x1, y0, x1, y1], sprite)
			}
		},
		triangle: {
			start: function(sprite){
				mouse.pointer.set('node')
				this.edges = []
				this.nodes = []
				sprite.ignoreChildInput = true 
			},
			end: function(sprite){
				mouse.pointer.destroy()
				this.destroy()
			},
			click: function(sprite, x, y){
				var node = le.editor.add.sprite(x, y, 'node')
				node.anchor.set(.5)
				this.nodes.push(node)
				
				var len = this.nodes.length 
				if(len == 3){
					this.create(this.nodes, sprite)
					this.destroy()
					
					return 
					
				}else if(len == 2){
					var p1 = this.nodes[len - 2].position
					var p2 = this.nodes[len - 1].position
					this.edges.push(
						le.editor.add.rope(0, 0, 'rope', null, [p1, p2])
					)
				}
		
				var p1 = this.nodes[len - 1].position
				var p2 = mouse.pointer.sprite.position
				this.edges.push(
					le.editor.add.rope(0, 0, 'rope', null, [p1, p2])
				)
			},
			destroy: function(){
					for(var i = 0; i < this.nodes.length; i++){
						this.nodes[i].destroy()
					}
					for(var i = 0; i < this.edges.length; i++){
						this.edges[i].destroy()
					}
					this.nodes = []
					this.edges = [] 
			},
			create: function(nodes, sprite){
				add_triangle([nodes[0].x, nodes[0].y, nodes[1].x, nodes[1].y, nodes[2].x, nodes[2].y], sprite)
			}
		}
	},
	pointer: {
		set: function(key){
			this.destroy()
			this.sprite = le.editor.add.sprite(0, 0, key)
			//var sprite = le.editor.add.sprite(0, 0, key)
			this.sprite.anchor.set(.5)
			this.sprite.position = le.editor.input.position
		},
		hide_cursor: function(){
			// Doesn't Work
			/*
			var fp = document.getElementById('img_dir').innerText
			var div = document.getElementById('game')
			//console.log( 'url(' + fp + 'dot.gif), pointer;')
			div.firstChild.style.cursor = 'url(/img/dot.gif)'
			*/
			//console.log(div.firstChild.style.cursor)
		},
		destroy: function(){
			if(this.sprite){
				this.sprite.destroy()
				this.sprite = undefined
			}
		}
	},
	set: function(key, sprite){
		if(this.mode && this.mode.end){
			this.mode.end(sprite)
		}
		
		this.mode = this.modes[key]
		if(this.mode && this.mode.start){
			this.mode.start(sprite)
			console.log('Mouse mode: ' + key)
		}else{
			console.log('Mouse mode: undefined')
		}
		
	},
	update: function(sprite){
		var x = this.x = le.editor.input.x 
		var y = this.y = le.editor.input.y 

		
		if(this.mode && this.mode.update){
			this.mode.update(sprite, x, y)
		}
		if(le.editor.input.activePointer.leftButton.isDown){
			if(this.mode && this.mode.down){
				this.mode.down(sprite, x, y)
			}
			/*
			if(!this.down && this.mode && this.mode.click){
				this.mode.click(sprite, x, y)
			}
			*/
		}else{
			if(this.mode && this.mode.up){
				this.mode.up(sprite, x, y)
			}
			if(this.down && this.mode && this.mode.release){
				this.mode.release(sprite, x, y)
			}
		}
		this.down = le.editor.input.activePointer.leftButton.isDown 
		
		if(this.pointer.sprite){
			this.pointer.hide_cursor()
		}
		this.tip.update()
		/*
		if(this.pointer.sprite){
			this.pointer.sprite.x = x 
			this.pointer.sprite.y = y 
		}*/
	},
	mode: undefined,
	click: function(sprite){
		if(this.mode && this.mode.click){
			this.mode.click(sprite, this.x, this.y)
		}
	},
	tip: {
		init: function(){
			this.box = le.editor.add.text(0, 0, 'cheese', {
				fontSize: '16px',
				fill: 'grey',
				backgroundColor: 'black'
			})
			
			this.box.alpha = .5
			this.box.anchor.set(1,0)
			this.hide()
			this.box.lineSpacing = -5
		},
		show: function(message){
			if(!message) return 
			
			this.box.alpha = 1 
			this.box.text = this.wrap(message)
			
			if(mouse.x < le.editor.width/2){
				this.box.anchor.set(0, 1)
			}else{
				this.box.anchor.set(1,1)
			}
			
		},
		wrap: function(msg){
			var buff = '   '
			return buff + msg + buff
		},
		hide: function(){
			this.box.alpha = 0 
		},
		update: function(){
			this.box.x = mouse.x 
			this.box.y = mouse.y 
			
			
		}
	}
}

var preloader = {
	preload: function(){
		var fp = document.getElementById('static_dir').innerText + '/img/'
		
		var imgs = ['node', 'rope', 'x', 'rect_select', 'circ_select', 'rect_container', 'blue_move', 'green_edit']		
		for(var i = 0; i < imgs.length; i++){
			le.editor.load.spritesheet(imgs[i], fp + imgs[i] + '.png')
		}
		
		for(var label in icon_map){
			loadicon(label)
		}
		
		le.editor.load.spritesheet('button', fp + 'button.png', 100, 38)
		le.editor.load.spritesheet('radio', fp + 'radio.png', 32, 32)
		
	},
	create: function(){
		le.editor.state.start('main')
		/*
		if(le.lvl){
			le.editor.state.start('main', true, false, le.lvl + '_bg.jpg')
		}else{
			le.editor.state.start('menu')
		}
		*/
	}
	
}

var reloader = {
	init: function(data){
		this.data = data 
	},
	preload: function(){
		preloader.preload()
		opener.preload.call(this, this.data)
	},
	create: function(){
		console.log('Reloaded.')
		le.editor.state.start('main', true, false, physics.data.bg)
		
	}
}

var opener = {
	init: function(data){
		console.log(data)
		this.data = data 
	},
	preload: function(){
		var fp = document.getElementById('img_dir').innerText
		var sprite, s 
		var game = le.editor 
		for(var i = 0; i < this.data.sprites.length; i++){
			s = this.data.sprites[i]
			if(! s) continue
			
			key = s.key 
			//le.editor.load.spritesheet(key, fp + key)
			
			if(s.data.frames > 1){
				fw = s.data.img_width/s.data.scale/ s.data.frames
				fh = s.data.img_height/s.data.scale
				
				game.load.spritesheet(key, fp + key, fw, fh)
			}else{
				game.load.spritesheet(key, fp + key)
			}
		}
	},
	create: function(){
		physics.data = this.data 
		le.editor.state.start('main', true, false, this.data.bg)
	}
	
}

var main = {
	init: function(bg_fn){
		if(bg_fn){
			this.bg_fn = bg_fn 
		}
	},
	preload: function(){
		//*
		if(this.bg_fn){
			var fp = document.getElementById('img_dir').innerText
			le.editor.load.spritesheet('bg', fp + this.bg_fn)
			physics.data.bg = this.bg_fn
		}
	//*/

		
	},
	create: function(){
		var sprite = this.bg = le.editor.add.sprite(0,0,'bg')
		sprite.inputEnabled = true 
		
		sprite.events.onInputDown.add(function(){
			//console.log('click')
			mouse.click(sprite)
		})
		
		
		sprite.zoom= {
			key: 'zoom',
			max: 2,
			min: .2,
			value: 1,
			shoe_size: .1,
			step: function(d){
				this.value = constrain(this.value + d*this.shoe_size, this.min, this.max)
				this.value = Math.round(this.value*10)/10
				return this.value 
			}
		}
		
		physics.load(sprite)
		
		hud.follow(sprite, 'x', true)
		hud.follow(sprite, 'y', true)
		hud.follow(sprite.zoom, 'value')
		
		var mem = {x:le.editor.width - 48, y:0, buttons:[]}
		function butt(name, callback){
			var b = textbutton(mem.x, mem.y, name, callback)
			//b.x -= b.width 
			mem.y += b.height 
			mem.buttons.push(b)
		}
		
		function select(button){
			for(var i = 0; i < mem.buttons.length; i ++){
				mem.buttons[i].activate()
				//mem.buttons[i].inputEnabled = true 
			}
			if(button){
				//button.inputEnabled = false 
				mouse.set(button.text.text.toLowerCase(), sprite)
				button.select()
			}else{
				mouse.set(undefined, sprite)
			}

		}
		
		butt('Move', function(){
			select(this)
			
		})
		
		butt('Zoom In', function(){
			select()
			sprite.scale.set(sprite.zoom.step(1))
			
		})
		
		butt('Zoom Out', function(){
			select()
			sprite.scale.set(sprite.zoom.step(-1))
		})
		
		butt('Triangle', function(){
			select(this)
		})
		
		butt('Rectangle', function(){
			select(this)
		})
		
		butt('Sprite', function(){
			le.editor.state.start('img_selector', true, false, 'sprite_editor')
		})
		
		butt('Ground', function(){
			select(this)
		})
		
		butt('Background', function(){
			le.editor.state.start('img_selector', true, false, 'main')
		})
		
		butt('Delete', function(){
			select(this)
		})
		
		butt('Edit', function(){
			select(this)
		})
		
		butt('Save', function(){
			var ok = confirm('Save level?')
			if(ok){
				physics.save()
			}
		})
	
		butt('Load', function(){
			var ok = true || confirm('Load level? You will lose any unsaved progress.')
			if(ok){
				physics.open()
			}
		})
		
		textbutton(0, 0, 'Play', function(){
			le.editor.data = physics.data 
			le.editor.state.start('play', true, false, le.editor, function(){
				var butt = textbutton(0, 0, 'Back', function(){
					this.state.start('main')
				}, le.editor)
				butt.fixedToCamera = true 
			}, true)
		})
		
			mouse.init()
		
	},
	update: function(){
		mouse.update(this.bg)
		hud.update()
	}
}

var img_selector = {
	init: function(next){
		console.log(next)
		this.next = next 
	},
	create: function(){
		imgs = document.getElementById('imgs')
		var x = 0
		var y = 0 
		for(var i = 0; i < imgs.childElementCount; i++){
			var fn = imgs.children[i].innerText
			var butt = textbutton(x, y, fn, load_img(fn, this.next))
			y += butt.height 
			if(y + butt.height > le.editor.height){
				y = 0 
				x += butt.width 
			}
		}
		hud.update()
	}
}

var sprite_editor = {
	init: function(fn, sprite){
		this.fn = fn 
		this.sprite = sprite
	},
	preload: function(){
		var fp = document.getElementById('img_dir').innerText
		le.editor.load.spritesheet(this.fn, fp + this.fn)
	},
	create: function(){
		if(this.fn){
			this.first()
		}else{
			this.edit(this.sprite)
		}
		mouse.init()
	},
	edit: function(sprite){
		var s = physics.get.sprite(sprite.key)
		this.override = true 
		
		this.sprite = le.editor.add.sprite(100, 100, sprite.key)
		this.sprite.inputEnabled = true 
		this.sprite.scale.set(s.data.scale)
		
		this.sprite.frame_count = s.data.frames 
		this.sprite.frame_rate = s.data.frame_rate
		
		// Set hitbox 
		if(s.data.r){
			
			add_circle(this.sprite)
			this.sprite.hitbox.centerX = s.data.centerX + this.sprite.x 
			this.sprite.hitbox.centerY = s.data.centerY + this.sprite.y 
			this.sprite.hitbox.width = 2*s.data.r
			this.sprite.hitbox.height = this.sprite.hitbox.width 
			
			reradius(this.sprite.hitbox)

		}else{
			add_hitbox(this.sprite)
			
			this.sprite.hitbox.width = s.data.width 
			this.sprite.hitbox.height = s.data.height 
			this.sprite.hitbox.x = this.sprite.hitbox.offsetX = s.data.offsetX + this.sprite.x 
			this.sprite.hitbox.y = this.sprite.hitbox.offsetY = s.data.offsetY + this.sprite.y 
		}
		
		this.sprite.hitbox.nodes.forEach(node => node.reposition())
		
		this.setup(this.sprite)
		
		this.sprite.type.choose(s.data.type)
		
		
		
	},
	first: function(){
		var sprite = this.sprite = le.editor.add.sprite(100, 100, this.fn)
		if(physics.get.sprite(this.fn)){
			physics.add.sprite(sprite)
			le.editor.state.start('reloader', true, true, physics.data)
		}
		
		add_hitbox(sprite)
		
		sprite.inputEnabled = true 
		
		this.setup(this.sprite)
	},
	setup: function(sprite){
		sprite.zoom= {
			max: 2,
			min: .2,
			value: 1,
			shoe_size: .1,
			step: function(d){
				this.value = constrain(this.value + d*this.shoe_size, this.min, this.max)
				return this.value 
			}
		}
		
		var mem = {x:le.editor.width-48, y:0, buttons:[]}
		function butt(name, callback){
			var b = textbutton(mem.x, mem.y, name, callback)
			//b.x -= b.width 
			mem.y += b.height 
			mem.buttons.push(b)
		}
		
		function select(button){
			for(var i = 0; i < mem.buttons.length; i ++){
				mem.buttons[i].frame = 0 
				mem.buttons[i].inputEnabled = true 
			}
			if(button){
				button.inputEnabled = false 
				mouse.set(button.text.text.toLowerCase(), sprite)
			}else{
				mouse.set(undefined, sprite)
			}

		}
		
		butt('Box', function(){
			select(this)
			
			remove_hitzone(sprite)	
			add_hitbox(sprite)
		})
		
		butt('Circle', function(){
			select(this)

			remove_hitzone(sprite)			
			add_circle(sprite)
		})
		
		var override = this.override
		butt('Ok', function(){
			//console.log([sprite.width, sprite.height])
			physics.add.sprite(sprite, override)
			//console.log([sprite.width, sprite.height])
			le.editor.state.start('reloader', true, true, physics.data)
		})
		
		
		sprite.type = radio(400 - 100, 0, types.map(t => t.type))
		
		
		var counter_width = 200
		var y0  = 0
		var dy = 56
		var x0 = 350
		
		sprite.resizer = counter(x0, y0, 'scale', 10*sprite.scale.x, function(size){
			sprite.scale.set(size/10)
		}, counter_width)

		sprite.reframer = counter(x0, y0 + dy, 'frames', sprite.frame_count ? sprite.frame_count : 1, function(){}, counter_width)
		
		sprite.frame_rater = counter(x0, y0 + 2*dy, 'frame rate', sprite.frame_rate ? sprite.frame_rate : 12, function(){}, counter_width)
		
		sprite.type.x = le.editor.width - sprite.type.bg.width - mem.buttons[0].width - 16
		
	},
	update: function(){
		hud.update()
		mouse.update()
	}
}

var menu = {
	create: function(){
		textbutton(100, 100, 'BG Load', function(){
			le.editor.state.start('img_selector', true, false, 'main')
		})
	}
}

window.addEventListener('load', function(){
	
	le.editor = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'game')

	
	le.editor.state.add('menu', menu)
	le.editor.state.add('preloader', preloader)
	le.editor.state.add('reloader', reloader)
	le.editor.state.add('opener', opener)
	le.editor.state.add('main', main)
	le.editor.state.add('play', play)
	le.editor.state.add('img_selector', img_selector)
	le.editor.state.add('sprite_editor', sprite_editor)
	

	le.lvl = physics.data.lvl = get_lvl()
	
	le.editor.state.start('preloader')
	
	var div = document.getElementById('game')
	div.addEventListener('mouseout', mouse_out, false)
	
})



var le = {
	Triangle: Triangle,
	physics: physics,
	buttons: buttons,
	mouse: mouse,
	update: update,
	sprite_editor: sprite_editor,
	get_lvl: get_lvl,
	get_list: get_list,
	types: types,
	edit_sprite_by_key: edit_sprite_by_key
}

return le 
})()