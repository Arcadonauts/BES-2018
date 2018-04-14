console.log('level_select.js')
/*
var levels
var focus = 0

var init = function(){
	levels = document.getElementsByClassName('columns')[0].children
	levels[0].focus()
	//levels[0].children[0].className = 'selected'
	scroll_y = 0
	animate()
}


document.onkeydown = function(){
	

	if(keydown.D || keydown.right){
		focus += 1
	}
	if(keydown.A || keydown.left){
		focus -= 1
	}
	if(keydown.S || keydown.down){
		focus += 4
	}
	if(keydown.W || keydown.up){
		focus -= 4
	}
	focus = (focus % levels.length) 
	focus = focus >= 0 ? focus : focus + levels.length
	//console.log(focus)
	levels[focus].focus()
	for(var i = 0; i < levels.length; i++){
		levels[i].children[0].className =  i === focus ? 'selected' :  'unselected'
	}
	
}

function animate(time){
	
	//var sel = getOffsetRect(levels[focus]).top
	
	var sel = levels[focus].getBoundingClientRect().top
	if(sel > 150){
		scroll_y += 5
	}else if(sel < 140){
		scroll_y -= 5
	}else{
		//scroll_y = 145
	}
	
	scroll_y = constrain(scroll_y, 0, window.scrollHeight)
	
	window.scroll(0, scroll_y)
	
	//console.log(sel)
	requestAnimationFrame(animate)
}

function getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect()
     
    var body = document.body
    var docElem = document.documentElement
     
    // (2)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
     
    // (3)
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0
     
    // (4)
    var top  = box.top +  scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft
     
    return { top: Math.round(top), left: Math.round(left) }
}
//*/

