function ascii(text){
	switch(text){
		case 'up': return 38; break;
		case 'down': return 40; break;
		case 'left': return 37; break;
		case 'right': return 39; break;
		case 'space': return 32; break;
		default:
			return text.charCodeAt(0)
	}
}

function str(num){
	switch(num){
		case 38: return 'up'; break;
		case 40: return 'down'; break;
		case 37: return 'left'; break;
		case 39: return 'right'; break;
		case 32: return 'space'; break;
		default:
			return String.fromCharCode(num)
	}
}
/*
function initialize(obj, el, value){
	if(obj[el] === undefined){
		obj[el] = value
	}
}

Color = function(r,g,b,a){
	this.r = r || 0
	this.g = g || 0
	this.b = b || 0
	this.a = a || 1
}
Color.prototype.set = function(r, g, b, a){
	this.r = r || this.r
	this.g = g || this.g
	this.b = b || this.b
	this.a = a || this.a
	return this
}
Color.prototype.get = function(){
	return ('rgba(' + this.r + ', '
					+ this.g + ', '
					+ this.b + ', '
					+ this.a + ')')
}

Color.prototype.copy = function(){
	return new Color(this.r, this.g, this.b, this.a)
}


function z_sort(lvl){
	var n = len(lvl)
	list = []
	for(var i = 0; i < n; i++){
		list[i] = lvl[i]
	}
	list.sort(function(a,b){return a.z - b.z})
	
	for(var i = 0; i < n; i++){
		lvl[i] = list[i]
	}
}

function get_objects_by(list, prop, value){
	var op = []
	for(var i = 0; i < len(list); i ++){
		if(list[i][prop] == value){
			op.push(list[i])
		}
	}
	return op
}


function wrap_text(text, x, y, width, line_height){
	line_height = parseFloat(line_height) || 20
	context.textBaseline = 'top'
	x = (x || 0)
	y = (y || 0)
	width = width || 1/0
	var words = text.split(' ')
	var line = ''
	max_width = 0
	for(var n = 0; n < words.length; n++){
		var test = line + words[n] + ' '
		var line_width = context.measureText(test).width
		if( line_width > width ){
			context.fillText(line, x, y)
			max_width = Math.max(max_width, context.measureText(line).width)
			line =  words[n] + ' '
			y += line_height
		}else{
			line = test
		}
	}
	context.fillText(test, x, y)
	y += context.measureText(test).height
	return [max_width, y]
}

function hittest(p1, p2, style){
	style = style || 'rect'
	switch(style){
		case 'rect':
			var x1, y1, w1, h1, x2, y2, w2, h2
			x1 = p1.dest_x + p1.hitoff_x
			y1 = p1.dest_y + p1.hitoff_y
			w1 = p1.hit_width
			h1 = p1.hit_height		
			x2 = p2.dest_x + p2.hitoff_x
			y2 = p2.dest_y + p2.hitoff_y
			w2 = p2.hit_width
			h2 = p2.hit_height
			
			return    ((x1 + w1 > x2) 
					&& (x1 < x2 + w2)
					&& (y1 + h1 > y2) 
					&& (y1 < y2 + h2))
			break;
		case 'circ':
			dx = (p1.dest_x + p1.hitoff_x)- (p2.dest_x + p2.hitoff_x)
			dy = (p1.dest_y + p1.hitoff_y)- (p2.dest_y + p2.hitoff_y)
			r = (p1.hit_width + p2.hit_width)/2
			return dx*dx  + dy*dy <= r*r
			break;
		case 'pointrect':
			var x1, y1, w1, h1, x, y
			x = p1[0]
			y = p1[1]

			x2 = p2.dest_x + p2.hitoff_x
			y2 = p2.dest_y + p2.hitoff_y
			w2 = p2.hit_width
			h2 = p2.hit_height	
			
			return    ((x >= x2) 
					&& (x <= x2 + w2)
					&& (y >= y2) 
					&& (y <= y2 + h2)) 
			break;
		case 'rectpoint':
			return hittest(p2, p1, 'pointrect')
			break;
		default:
			console.log('Unrecognized hittest: ' + style)
	}
}

function len(obj){
	return obj.length
}
//*/

function get(list, prop, value){
	for(var i = 0; i < list.length; i++){
		if(list[i][prop] == value){
			return list[i]
		}
	}
}

function z_sort(lvl){
	// In Place!
	lvl.sort(function(a, b){
		var bz = parseInt(b.z) || 1
		var az = parseInt(a.z) || 1
		return az - bz
	})
}

function constrain(x0, min, max){
	if(x0 < min){
		return min
	}else if(x0 > max){
		return max
	}else{
		return x0
	}
}

keydown = {}
for(var i = ascii('A'); i <= ascii('Z'); i++){
	keydown[str(i)] = false
}
for(var i = ascii('left'); i <= ascii('down'); i++){
	keydown[str(i)] = false
}
keydown.space = false

document.addEventListener('keydown', function(event) {
	for(var i = ascii('A'); i <= ascii('Z'); i++){
		if(event.keyCode == i){
			keydown[str(i)] = true
		}
	}
	for(var i = ascii('left'); i <= ascii('down'); i++){
		if(event.keyCode == i){
			keydown[str(i)] = true
		}
	}
	if(event.keyCode === ascii('space')){
		keydown[str(event.keyCode)] = true
	}
}, true);

document.addEventListener('keyup', function(event) {
	for(var i = ascii('A'); i <= ascii('Z'); i++){
		if(event.keyCode == i){
			keydown[str(i)] = false
		}
	}
	for(var i = ascii('left'); i <= ascii('down'); i++){
		if(event.keyCode == i){
			keydown[str(i)] = false
		}
	}
	if(event.keyCode === ascii('space')){
		keydown[str(event.keyCode)] = false
	}
	
}, true);//*/
