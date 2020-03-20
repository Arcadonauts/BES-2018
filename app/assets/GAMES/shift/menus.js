(function(){

	function reveal(agent){
		agent.scene.add.tween({
			targets: agent,
			alpha: 0,
			yoyo: true,
			onYoyo: function(){
				agent.setFrame(1)
			}
		})
	}

	window.accuseScene = {
		init: function(data){
			this.data = data 
		},
		create: function(){
			this.shaderTime = 0 
			let scene = this 

			
			this.cameras.main.setRenderToTexture(shader);
			
			
			
			let cx = this.cameras.main.centerX
			let cy = this.cameras.main.centerY
			let dy = 0.1 * cy 
			let m = 0.125
			
			let agent = this.add.sprite(1.5*cx, cy, 'agent')
			agent.setOrigin(0.5)
			agent.setScale(0.5)
			agent.alpha = 0.5
			
			
			let line0 = this.add.text(m*cx, 0.3*cy, "You accused " + this.data.accused.trueName + " of being the shape-shifter.", {
				fill: '#ffffff',
				fontFamily: 'retro',
				fontSize: '20pt',
				align: 'left',
				wordWrap: {
					width: cx
				}
			})
			line0.setOrigin(0)
			
			let line1
			let line2 
			let unlocked = 0 
			if(this.data.shifter === this.data.accused){
				unlocked = this.data.diff + 2
				
				line1 = this.add.text(line0.x, line0.y + line0.height + dy, "An autopsy shows that you were correct.", {
					fill: '#ffffff',
					fontFamily: 'retro',
					fontSize: '20pt',
					align: 'left',
					wordWrap: {
						width: cx
					}
				})
				line1.setOrigin(0)
				
				line2 = this.add.text(line1.x, line1.y + line1.height + dy, "Good work.", {
					fill: '#00ffff',
					fontFamily: 'retro',
					fontSize: '20pt',
					align: 'left',
					wordWrap: {
						width: cx
					}
				})
				line2.setOrigin(0)
				
				
			}else{
				line1 = this.add.text(line0.x, line0.y + line0.height + dy, "An autopsy shows that you were wrong.", {
					fill: '#ffffff',
					fontFamily: 'retro',
					fontSize: '20pt',
					align: 'left',
					wordWrap: {
						width: cx
					}
				})
				line1.setOrigin(0)
				
				line2 = this.add.text(line1.x, line1.y + line1.height + dy, this.data.shifter.trueName + " was the true shape-shifter.", {
					fill: '#ff0000',
					fontFamily: 'retro',
					fontSize: '20pt',
					align: 'left',
					wordWrap: {
						width: cx
					}
				})
				line2.setOrigin(0)
			}
			
			let cont = this.add.text(line0.x, 1.8*cy, "Continue", {
				fill: '#ffffff',
				fontFamily: 'retro',
				fontSize: '20pt',
				align: 'left',
				wordWrap: {
					width: cx
				}
			})
			
			cont.setOrigin(0.5)
			cont.x += cont.width/2
			
			cont.setInteractive()
		
			cont.alpha = 0.5
			
			cont.on('pointerover', ()=>{
				//this.play('boop')
				cont.setScale(1.1)
			})
			
			cont.on('pointerout', ()=>{
				cont.alpha = 0.5
				cont.setScale(1.0)
			})
			
			cont.on('pointerdown', ()=>{
				cont.alpha = 1.0
				
			})
			
			cont.on('pointerup', ()=>{
				//this.play('bip')
				//this.graphics.setScale(1.0)
				cont.alpha = 0.5
				console.warn(this.data)
				this.scene.start('title', {unlocked: unlocked})
			})
			
			let lines = [line0, line1, line2, cont]
			lines.forEach((line, i) => {
				line.alpha = 0 
				this.add.tween({
					targets: line,
					alpha: 1,
					delay: 1000*(0 + 2.5*i),
					duration: 800*5,
					ease: 'Quad.easeInOut',
					onComplete: function(){
						if(i === 1 && unlocked === 0){
							reveal(agent)	
						}
					}
				})
			})
			
			
		},
		update: function(){
			let sx = this.input.mousePointer.x/(2*this.cameras.main.centerX)
			let sy = this.input.mousePointer.y/(2*this.cameras.main.centerY)
			shader.setFloat2('mouse', sx, sy);
			shader.setFloat1('time', this.shaderTime);
			this.shaderTime += 0.001 
		}
	}
	
	
	
	window.title = {
		init: function(data){
			if(data.unlocked !== undefined){
				state.set(data.unlocked)
				console.warn("unllocked", data.unlocked)
			}else{
				throw("EEE")
			}
		},
		create: function(){
			
			this.shaderTime = 0 
			
			this.cameras.main.setRenderToTexture(shader);
			
			this.nineTo = this.add.text(0, 0, "NINE\nTO", {
				fill: 'white',
				fontFamily: 'retro',
				fontSize: '100pt',
				align: 'left'
			})
			
			this.die = this.add.text(0, this.nineTo.height, "DIE", {
				fill: 'red',
				fontFamily: 'retro',
				fontSize: '100pt',
				align: 'left'
			})
			this.t = 0 
			this.isRevealed = false 
			
			this.phase = 0
			
			
			
			let levels = [
				'Tutorial',
				'Practice',
				'Easy',
				'Basic',
				'Medium',
				
				'Challenging',
				'Difficult',

				'Brutal',
				
			]
				
			levels.forEach((level, i) => {
				if(i <= state.unlocked){
					let text = this.add.text(this.cameras.main.centerX, 0.5*this.cameras.main.centerY + 30*i, "  "+level, {
						fill: '#ffffff',
						fontFamily: 'retro',
						fontSize: '20pt',
						align: 'left',
					
					})
					
					text.setOrigin(0.5)
					text.x += text.width/2
					
					text.setInteractive()
				
					text.alpha = 0.5
					
					text.on('pointerover', ()=>{
						text.text = ">>" + level
						//this.sound.play('boop')
					})
					
					text.on('pointerout', ()=>{
						text.alpha = 0.5
						text.text = "  " + level
					})
					
					text.on('pointerdown', ()=>{
						text.alpha = 1.0
						
					})
					
					text.on('pointerup', ()=>{
						//this.graphics.setScale(1.0)
						text.alpha = 0.5
						//this.sound.play('bip')
						if(i === 0){
							this.scene.start('tut')
						}else{
							console.log(i-1)
							this.scene.start('play', {
								diff: i - 1
							})
						}
					})
					
				}
			})
			
		},
		update: function(){
			let sx = this.input.mousePointer.x/(2*this.cameras.main.centerX)
			let sy = this.input.mousePointer.y/(2*this.cameras.main.centerY)
			shader.setFloat2('mouse', sx, sy);
			shader.setFloat1('time', this.shaderTime);
			this.shaderTime += 0.001 
			
		
			
			
			this.t += 1 
		}
	}

})()