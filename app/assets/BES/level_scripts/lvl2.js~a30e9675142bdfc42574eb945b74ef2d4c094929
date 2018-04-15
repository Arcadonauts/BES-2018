console.log('Level two script loaded');
(function(window) {
	var scripts = {
		update: function(that, body_def, fix_def){
			fix_def.shape = new b2.CircleShape(20/SCALE)
			
		},
		init: function(view, width, height){
			console.log(view.update)
			switch(view.update){
				case 'wait':
					
					view.body.SetAwake(false)
					view.do_once = true
					view.ontick = function(){
						if(sensor.v.touched && this.do_once){
							this.body.SetAwake(true)
							this.body.SetLinearVelocity(new b2.Vec2(5, 0))
							this.do_once = false
						}
					}
					//view.body.SetLinearVelocity(new b2.Vec2(10, 0))
					
					
					
					break
				default:
					break
			}
		}
	
	}


	var lvl_script = function(){
		var type = arguments[0]
		if(scripts[type]){
			var args = []
			for(var i = 1; i < arguments.length; i++){
				args.push(arguments[i])
			}
			return scripts[type].apply(this, args)
		}else{
			console.log('What?')
		}
	
	}

	window.lvl_script = lvl_script


})(window)