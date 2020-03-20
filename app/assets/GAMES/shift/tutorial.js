(function(){

	
	let lines = [
		//*
		"I know you're wondering how you got here, or even where \"here\" is.\n(Click here to continue.)",
		"Unfortunately, I can't tell you that at this time.",
		//*/
		"I can, however, introduce myself.",
		0,
		//*
		"I'm an agent with the FBI's Extraterrestrial Investigations Unit.",
		"We're exactly what you would guess: We hunt down aliens.",
		"Normally I would never reveal this information to an outsider, but desperate times...",
		"You see, we've been compromised. We have intel that one of our agents has been replaced with an alien capable of shifting its shape.",
		"We call them \"Shape-shifters\"\n\n(Perhaps you could have guessed that.)",
		"We can't trust anyone in the agency; and so we're turning to you.",
		//*/
		"Our system collects information about the whereabouts of everyone in the office each day. You need to use that information to find the Shape-shifiter.",
		1,
		"This is a map of the building. You can see the whereabouts of our agents at as they move around.",
		2,
		"If you hover your mouse over a room, you can see who is in it.",
		3,
		"You can click and drag the timeline below to change the time",
		4,
		"You can also use these controls to play, pause, fast-forward, and rewind.",
		5,
		"When you think you know who the Shape-shifiter is, Click the personnel tab to make your accusation.",
		6,
		"Be careful though, you only get one try.",
		0,
		"A final piece of advice: The shape-shifters can't help but change form; I think it makes them feel powerful.",
		"Study the map carefully and you'll find times when there's more than one copy of the same person. That's the key to finding the shape-shifiter.",
		7
	]
	
		
	let events = {
		0: (box, scene) => {
			scene.agent = scene.add.sprite(1.5*scene.cameras.main.centerX, 0, 'agent')
			scene.agent.setOrigin(0)
			scene.agent.setScale(0.5)
			scene.agent.alpha = 0.25
			
			box.set('', 20, 50, 400, 250, true)
			
			
		},
		1: (box, scene) => {
			scene.agent.destroy()
			
			scene.scene.launch('play', {diff: 3})
			
			scene.scene.sendToBack('play');
			scene.bg1.set(0, 0, 0.45, 1)
			scene.bg2.set(0, 0.82, 1, 0.2)
		},
		2: (box, scene) => {
			scene.bg1.set(0, 0, 0.45, .09)
			scene.bg1.visible(false)
			
			
			box.set('', 50, 300, 400, 200, true)
		},
		3: (box, scene) => {
			box.set('', 30, 100, 350, 200, true)
			scene.bg2.set(0.02, 0.6, 0.4, 0.2)
		},
		4: (box, scene) => {
			scene.bg2.set(2,2,0,0)
		},
		5: (box, scene) => {
			scene.bg1.set(0.0, 0, 1, 1)
			scene.bg1.visible(false)
			playScene.hud.tabs[1].select()
			box.set('', 20, 50, 400, 275, true)
			//scene.bg2.set(0, 0.6, 1, 0.4)
		},
		6: (box, scene) => {
			let w = 450
			scene.scene.stop('play')
			box.set('', scene.cameras.main.centerX - w/2, 0.75*scene.cameras.main.centerY, w, 150, true)
		},
		7: (box, scene) => {
			scene.scene.start('title', {unlocked: 1})
		}
	}
	
	
	function TextBox(scene, lines){
		this.scene = scene 
		this.lines = lines 
		this.current = 0 
		this.container = scene.add.container(100, 100)
			
		this.graphics = scene.add.graphics({
			x: 0,
			y: 0,
			lineStyle: {
				width: 4,
				color: 0xffffff
			},
			fillStyle: {
				color: 0x000000
			}
		})
		
		this.text = scene.add.text(10, 10, 'text', {
				fill: 'white',
				fontFamily: 'retro',
				fontSize: '24pt',
				align: 'left',
				wordWrap: {
					width: 100
				}
			})
		
		
		this.container.add(this.graphics)
		this.container.add(this.text)
		this.setInteractive()
		
		let w = 450 
		this.set(lines[this.current], scene.cameras.main.centerX - w/2, 0.75*scene.cameras.main.centerY, w, 150, true)
		
		
		
	}
	
	TextBox.prototype.setInteractive = function(){

		this.dot = this.scene.add.sprite(0, 0, 'dot')
		this.dot.setInteractive()
		
		this.dot.on('pointerover', ()=>{
			//this.scene.sound.play('boop')
			this.container.setScale(1.05)
		})
		
		this.dot.on('pointerout', ()=>{
			this.container.alpha = 1
			this.container.setScale(1.0)
		})
		
		this.dot.on('pointerdown', ()=>{
			this.container.alpha = 0.5
			
		})
		
		this.dot.on('pointerup', ()=>{
			//this.graphics.setScale(1.0)
			//this.scene.sound.play('bip')
			this.container.alpha = 1
			this.next()
		})
		this.dot.setScale(50)
		this.dot.setOrigin(0)
		this.dot.alpha = 0.01
		this.container.add(this.dot)
	}
	
	TextBox.prototype.set = function(text, x, y, width, height, outline){
		this.text.text = text 
		if(isNaN(x*y*width*height)){
			return 
		}
		
		this.container.x = x
		this.container.y = y 
		this.graphics.fillRect(0, 0, width, height)
		this.graphics.clear()
		this.graphics.fillRect(0, 0, width, height)
		this.dot.setScale(width/2, height/2) 
		this.text.setWordWrapWidth(width)
		if(outline){
			this.graphics.strokeRect(0, 0, width, height)
		}
	}
	
	TextBox.prototype.next = function(){
		this.current += 1 
		
		let line = lines[this.current]
		if(typeof line === 'string'){
			this.set(line)
		}else if(typeof line === 'number'){
			events[line](this, this.scene)
			this.next()
		}
		
	}
	
	function Background(scene){
		this.dot = scene.add.sprite(0, 0, 'dot')
		this.scene = scene 
		this.dot.setInteractive()
		this.dot.setOrigin(0)
		this.dot.alpha = 1
		this.set(0, 0, 1, 1)
	}
	
	Background.prototype.set = function(sx, sy, sw, sh){
		this.dot.x = 2*sx * this.scene.cameras.main.centerX
		this.dot.y = 2*sy * this.scene.cameras.main.centerY
		this.dot.setScale(sw*this.scene.cameras.main.centerX, sh*this.scene.cameras.main.centerY)
	}
	
	Background.prototype.visible = function(yes){
		this.dot.alpha = yes ? 1 : 0.01
	}
	
	window.tut = {
		create: function(){
			this.bg1 = new Background(this)
			this.bg2 = new Background(this)
			
			let cx = this.cameras.main.centerX
			let cy = this.cameras.main.centerY 
			
			this.shaderTime = 0 
		
			this.cameras.main.setRenderToTexture(shader);
			
			this.box = new TextBox(this, lines)
		
			
			this.t = 0 
			this.isRevealed = false 
			
		},
		update: function(){
			let sx = this.input.mousePointer.x/(2*this.cameras.main.centerX)
			let sy = this.input.mousePointer.y/(2*this.cameras.main.centerY)
			shader.setFloat2('mouse', sx, sy);
			
			shader.setFloat1('time', this.shaderTime);
			this.shaderTime += 0.001 
			if(this.shaderTime > 0.005){
				this.shaderTime -= 0.005
			}
			
			
			
			this.t += 1 
		}
	}

})()