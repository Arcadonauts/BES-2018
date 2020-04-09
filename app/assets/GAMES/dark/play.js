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


	window.play = {
		create: function(){
			this.width = this.cameras.main.centerX*2 
			this.height = this.cameras.main.centerY*2
		
			this.bg = this.add.sprite(0, 0, 'sprites', 6)
			this.bg.setScale(this.width/this.bg.width, this.height/this.bg.height);
			this.bg.setOrigin(0)
		
			this.player = this.physics.add.sprite(100, 100, 'sprites')
			this.player.setSize(16, 16)
			this.player.setDepth(1)
			this.cameras.main.startFollow(this.player)
			
			this.map = this.add.tilemap('map')
			this.tileset = this.map.addTilesetImage('sprites', 'sprites')
			this.bg = this.map.createDynamicLayer('bg', this.tileset)
			this.bg.setCollisionByExclusion(-1, true);
			
			this.lights = []
			
			this.objs = this.map.getObjectLayer('objs')['objects']
			this.objs.forEach(obj => {
				if(obj.name === 'start'){
					this.player.x = obj.x 
					this.player.y = obj.y
					
					//this.player.setBounce(0.1)
					this.physics.add.collider(this.player, this.bg)
				}else if(obj.name === 'light'){
					this.lights.push(new Light(this, obj.x, obj.y))
				}
			})
			
			cursors = this.input.keyboard.createCursorKeys();
			
			this.cameras.main.setRenderToTexture(shader);
			this.shaderTime = 0
			shader.setFloat2('aspectRatio', 1.0, this.width/this.height);
		},
		update: function(){
			shader.setFloat2('light1', this.lights[0].shaderX(), this.lights[0].shaderY());
			//shader.setFloat('time', this.shaderTime)
			shader.setFloat1('time', this.shaderTime)
			this.shaderTime += 0.01 
			
			
			let player = this.player 
			let vx = 200
			let jump = 275
			//player.body.setVelocity(0);

			// Horizontal movement
			if (cursors.left.isDown)
			{
				player.body.setVelocityX(-vx);
			}
			else if (cursors.right.isDown)
			{
				player.body.setVelocityX(vx);
			}else{
				player.body.velocity.x *= 0.7
			}

			// Vertical movement
			if (cursors.up.isDown && player.body.blocked.down)
			{
				player.body.setVelocityY(-jump);
			}
			
		}
	}
})()