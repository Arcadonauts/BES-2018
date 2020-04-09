(function(){

	function Light(scene, x, y){
		this.x = x 
		this.y = y 
		this.scene = scene 
	}
	
	Light.prototype.shaderPos = function(){
		return [
			(this.x - this.scene.cameras.main.scrollX)/this.scene.width, 
			(this.y - this.scene.cameras.main.scrollY)/this.scene.height
		]
	}
	
	Light.prototype.shaderX = function(){
		return this.shaderPos()[0]
	}
	
	Light.prototype.shaderY = function(){
		return this.shaderPos()[1]
	}
	
	function scale(y, scene){
		return 0.4*((y - scene.cam.scrollY)/scene.height + 1)
	}
	
	function Trap(scene, x, y, angled){
		this.scene = scene 
		this.sprite = scene.add.sprite(x, y, angled ? 'angled' : 'trap')
		this.sprite.setScale(scale(y, scene))
		
		this.sprite.setInteractive()
		
		this.sprite.on('pointerdown', ()=>{
			this.sprite.play(angled ? 'angled' : 'trap')
		})
		
	}


	window.play = {
		create: function(){
			this.width = this.cameras.main.centerX*2 
			this.height = this.cameras.main.centerY*2
			this.cam = this.cameras.main 
		
			this.bg = this.add.sprite(0, 0, 'building')
			this.bg.setOrigin(0)
			
			this.cam.scrollX = this.bg.width - this.width
			this.cam.scrollY = this.bg.height - this.height
			
			this.traps = []
			let pos = [
				[0.44, 0.22],
				[0.20, 0.40],
				[0.45, 0.60],
				[0.17, 0.85]
			]
			for(let i = 0; i < 4; i++){
				let y = this.cam.scrollY + this.height*pos[i][1]
				let x = this.cam.scrollX + this.width*pos[i][0]
				this.traps.push(new Trap(this, x, y, !!(i%2)))
			}
		},
		update: function(){
			/*
			shader.setFloat2('light1', this.lights[0].shaderX(), this.lights[0].shaderY());
			//shader.setFloat('time', this.shaderTime)
			shader.setFloat1('time', this.shaderTime)
			this.shaderTime += 0.01 
			*/
			
			
		}
	}
})()