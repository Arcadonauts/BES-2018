//(function(){
	
	let font = {
		fill: 'white',
		fontFamily: 'LinLib',
		fontSize: '24pt',
		align: 'center',
		shadow: {
			offsetX: 0,
			offsetY: 0,
			color: '#000',
			blur: 5,
			stroke: false,
			fill: true
		}
	}
	
	function Player(scene){
		this.scene = scene 
		
		this.head = scene.add.sprite(0, 0, 'bird', 1)
		this.head.setOrigin(0.5, 0.5)
		this.head.dx = this.head.width/2
		this.ant1 = scene.add.sprite(0, 0, 'bird', 3)
		this.ant2 = scene.add.sprite(0, 0, 'bird', 2)
		
		this.check = {
			x: 300,
			y: 3600
		}
		
		this.sprite = scene.matter.add.sprite(this.check.x, this.check.y, 'bird', 0, {
			friction: 5.0,
			frictionStatic: 1000,
			shape: {
				type: 'circle',
				radius: 50
			},
			restitution: 0.5,
			label: 'player'
			
		})
		
	
		
		this.allSprites = [this.head, this.sprite, this.ant1, this.ant2]
		
		//this.frStatic = 0 
		this.sprite.setFrictionStatic(Infinity)
		this.sprite.setMass(20)
		this.sprite.parent = this 
		
		scene.cam.startFollow(this.sprite)
		scene.cam.setLerp(0.4, 0.4)

		this.sprite.setFixedRotation()

		this.pointer = new Pointer(scene)
		
		
		this.comfort = 1
		this.t = 0 
		
		this.canSee = {
			jump: false,
			plat: false,
			star: false
		}
	
		
	}
	
	Player.prototype.kill2 = function(){
		
		this.sprite.setVelocity(0) 
		
	}
	
	Player.prototype.kill = function(silent){
		if(this.dead) return 
		
		this.scene.cam.shake(200, .01)
		
		this.dead = true
		let dur1 = 600
		let dur2 = 1200
		this.allSprites.forEach(s => s.alpha = 0)
		//this.sprite.setSensor(true) 
		//this.sprite.setStatic(true)
		this.sprite.setCollidesWith(0)
		this.sprite.setCollisionGroup(1)
		this.sprite.setVelocity(0)
		
		let zoom = this.scene.cam.zoom 
		
		this.scene.add.tween({
			targets: this.sprite,
			x: this.sprite.x,
			y: this.sprite.y,
			duration: dur1,
			ease: 'Sine.easeInOut',
			onComplete: ()=>{
		
				
				this.scene.add.tween({
					targets: this.sprite,
					x: this.check.x,
					y: this.check.y,
					duration: dur2,
					ease: 'Sine.easeInOut',
					onComplete: ()=>{
						this.respawn()
					}
				})
			}
		})
		
		for(let i = 0; i < 25; i++){
			let h = Math.random()
			let t = h*Math.PI*2 
			let r = 50 + 100*Math.random()
			let s = this.scene.add.sprite(this.sprite.x, this.sprite.y, 'star', 1)
			
			//s.tint = Phaser.Display.Color.HSVToRGB(h, 1, 1).color 
			s.alpha = 0.5
			s.setScale(0.5)
			
			this.scene.add.tween({
				targets: s,
				x: this.sprite.x + r*Math.cos(t),
				y: this.sprite.y + r*Math.sin(t),
				ease: 'Expo.easeOut',
				duration: dur1,
				onComplete: ()=>{
					this.scene.add.tween({
						targets: s,
						x: this.check.x,
						y: this.check.y,
						duration: dur2,
						ease: 'Sine.easeInOut',
						onComplete: ()=>{
							s.destroy()
						}
					})
				}
			})
			
			
		}
		
		if(!silent){
			this.scene.sound.play('boom')
		}
	}
	
	Player.prototype.respawn = function(){
		this.scene.sound.play('ding')
		this.scene.add.tween({
			targets: this.allSprites,
			alpha: 1,
			duration: 300
		})
		//this.sprite.setSensor(false)
		//this.sprite.setStatic(false)
		this.sprite.setCollidesWith(1)
		this.sprite.setVelocity(0)
		//this.allSprites.forEach(s => s.alpha = 1)
		this.sprite.setPosition(this.check.x, this.check.y)
		this.dead = false 
	}
	
	Player.prototype.update = function(dt){
		if(this.dead){
			
		}else{
			
			this.t += dt
			//this.frStatic *= 2
			//this.sprite.setFrictionStatic(this.frStatic)
			let v = Math.abs(this.sprite.body.velocity.x) + Math.abs(this.sprite.body.velocity.y)
			if(v < 0.1){
				this.comfort += .02
			}else{
				this.comfort -= .1
			}
			this.comfort = Math.min(Math.max(this.comfort, 0), 1)
			let s = this.comfort
			this.head.setScale(s, 1)
			let r = (2*(+this.head.flipX)-1)
			
			this.head.x = this.sprite.x - s*r*this.head.dx
			this.head.y = this.sprite.y
			
			this.ant1.x = this.head.x - 0.5*r*s*this.head.dx 
			this.ant1.y = this.head.y + 0.3*this.head.dx
			this.ant1.rotation = 0.2*Math.sin(this.t/200)
			//this.ant1.setScale(s)
			
			this.ant2.x = this.head.x - 0.5*r*s*this.head.dx
			this.ant2.y = this.head.y + 0.3*this.head.dx
			this.ant2.rotation = 0.2*Math.cos(this.t/200)
			//this.ant2.setScale(s)
			
			this.pointer.update(this.sprite.x, this.sprite.y, dt)
		}
	}
	
	Player.prototype.fire = function(){
		if(this.dead) return 
		
		let fire = this.pointer.fire()
		if(!fire){
			this.whistle()
			return 
		}			
		let i = Math.floor(5*Math.random() + 1)
		this.scene.sound.play('b'+i)
		this.grabbed = false 
		
		let theta = this.pointer.rotation
		
		//this.frStatic = 0 
		//this.sprite.setFrictionStatic(this.frStatic)
		
		let force = 1
		let fx = force*Math.cos(theta)
		let fy = force*Math.sin(theta)
		
		this.sprite.applyForce({
			x: fx,
			y: fy
		})
		
		if(fx < 0){
			this.sprite.flipX = true 
		}else{
			this.sprite.flipX = false 
		}
		
		this.head.flipX = this.sprite.flipX
		this.ant1.flipX = this.sprite.flipX
		this.ant2.flipX = this.sprite.flipX
		
		
		
		this.sprite.setIgnoreGravity(false)
		this.pointer.dt = 2
		
	}
	
	Player.prototype.whistle = function(silent){
		if(this.dead) return
		
		
		
		if(this.canSee.star){
			this.scene.stars.forEach(star => {
				star.whistle()
			})
		}
		
		if(this.canSee.plat){
			this.scene.platforms.forEach(star => {
				star.whistle()
			})
		}
		
		if(this.canSee.jump){
			this.scene.jumps.forEach(star => {
				star.whistle()
			})
		}
		
		if(!silent){
			let i = Math.floor(9*Math.random() + 1)
			this.scene.sound.play('w'+i)
		}
	}
	
	Player.prototype.grab = function(sprite){
		if(this.dead) return 
		
		this.scene.add.tween({
			targets: this.sprite,
			x: sprite.x,
			y: sprite.y,
			duration: 600,
			ease: 'Bounce.easeOut'
			
		})

		
		this.grabbed = true 
		//this.sprite.setPosition(sprite.x, sprite.y)
		this.sprite.setVelocity(0)
		this.sprite.setIgnoreGravity(true)
		this.pointer.dt = 5
		
		//this.scene.sound.play('grab')
	}
	
	Player.prototype.collect = function(sprite){
		for(let i = 0; i < 25; i++){
			let h = Math.random()
			let t = h*Math.PI*2 
			let r = 50 + 100*Math.random()
			let s = this.scene.add.sprite(this.sprite.x, this.sprite.y, 'star', 1)
			
			//s.tint = Phaser.Display.Color.HSVToRGB(h, 1, 1).color 
			s.alpha = 0.5
			s.setScale(0.5)
			
			this.scene.add.tween({
				targets: s,
				x: sprite.x + r*Math.cos(t),
				y: sprite.y + r*Math.sin(t),
				ease: 'Expo.easeOut',
				duration: 600,
				onComplete: ()=>{
					this.scene.add.tween({
						targets: s,
						x: this.sprite.x,
						y: this.sprite.y,
						duration: 600,
						ease: 'Sine.easeInOut',
						onComplete: ()=>{
							s.destroy()
						}
					})
				}
			})
			
			
		}
		
		this.scene.sound.play('grab')
	}
	
	function Pointer(scene){
		this.scene = scene 
		this.sprite = scene.add.sprite(0, 0, 'pointer')
		//this.sprite.tint = 0xff55ff
		this.sprite.setDepth(2)
		this.angle = 180 + 45
		this.sprite.setScale(0.75)
		this.charge = 0 
		this.maxCharge = 50 
		this.dt = 2//0 
		
		this.bar = scene.add.graphics(0, 0)
		this.bar.alpha = 0.5
		this.bar.setDepth(2)
		
		
	}
	
	Pointer.prototype.update2 = function(x, y, dt){
		
		this.angle += (dt/16)*this.dt 
		this.sprite.angle = this.angle - 90 
		
		let r = 150
		this.sprite.x = x + r*Math.sin(-this.sprite.rotation)
		this.sprite.y = y + r*Math.cos(this.sprite.rotation)
		this.charge += 1
		
		if(this.charge < this.maxCharge){
			this.sprite.alpha = 0.5
			this.sprite.setScale(0.25)
		}else{
			this.sprite.alpha = 1 
			this.sprite.setScale(0.5)
		}
		
		
	}
	
	Pointer.prototype.update = function(x, y, dt){
		let mouseX, mouseY 
		
		if(x > 5600){
			mouseX = this.scene.input.activePointer.worldX
			mouseY = this.scene.input.activePointer.worldY
		}else{
			mouseX = this.scene.input.activePointer.position.x + this.scene.cameras.main.scrollX
			mouseY = this.scene.input.activePointer.position.y + this.scene.cameras.main.scrollY
		}
		
		

		
		let theta = Math.atan2(mouseY - y, mouseX - x)
		
		
		this.sprite.rotation = theta 
		this.rotation = theta 
		let r = 150
		this.sprite.x = x + r*Math.cos(theta)
		this.sprite.y = y + r*Math.sin(theta)
		
		if(this.charging){
			this.charge += 1
		}else{
			this.charge = 0 
		}
		
		this.bar.x = this.sprite.x 
		this.bar.y = this.sprite.y 
		
		
		
		this.bar.clear()
		/*
		if(this.charge === 0){
			this.sprite.alpha = 0
		}else
		//*/			
		if(this.charge < this.maxCharge){
			this.sprite.alpha = 0.5
			this.sprite.setScale(0.25)
			
			let r1 = 25
			let r2 = 45
			let t = Math.PI*2*this.charge/this.maxCharge
			
			this.bar.fillStyle(0xffffff)
			this.bar.beginPath()
			this.bar.moveTo(r1, 0)
			this.bar.arc(0, 0, r1, 0, t)
			this.bar.lineTo(r2*Math.cos(t), r2*Math.sin(t))
			this.bar.arc(0, 0, r2, t, 0, true)
			//this.bar.fillCircle(0, 0, r1)
			this.bar.fill()
		}else{
			this.sprite.alpha = 1 
			this.sprite.setScale(0.5)
		}
		
	}
	
	Pointer.prototype.fire = function(){
		if(this.charge >= this.maxCharge){
			this.charge = 0 
			return true 
		}else{
			return false 
		}
	}
	
	function Flower(scene, x, y, data){
		this.scene = scene
		let frame = data.frame || 0 
		this.sprite = scene.matter.add.sprite(x, y, 'flowers', frame, {
			isStatic: true,
			isSensor: true,
			label: 'flower',
	
		})
		
		this.sprite.action = data.action 
		this.t = 0 
		
	}
	
	Flower.prototype.update = function(){
		this.t += .01
		let h = 0.1 + 0.4*Math.sin(this.t)*Math.sin(this.t)
		let color = Phaser.Display.Color.HSVToRGB(h, 1, 1).color
		
		this.sprite.tint = color 
	}
	
	function Star(scene, x, y, dy, dur){
		dy = dy === undefined ? 10 : dy 
		dur = dur === undefined ? 600 : dur 
		this.scene = scene 
		this.sprite = scene.matter.add.sprite(x, y - dy, 'star', 0, {
			isStatic: true,
			isSensor: true,
			label: 'star',
			shape: {
				type: 'circle',
				radius: 20
			},
			
		})
		this.sprite.angle = 90 
		//this.sprite2 = scene.add.sprite(x, y, 'star')
		this.sprite.alpha = 0 
		//this.sprite.flipX = true 
		//this.sprite2.alpha = 0 
		this.t = 0 
		
		scene.add.tween({
			targets: this.sprite,
			y: y+dy,
			yoyo: true,
			repeat: -1,
			duration: dur,
			ease: 'Sine.easeInOut'
		})
		
	}
	
	Star.prototype.update = function(){
		this.t += .01
		let h = 0.08 + 0.09*Math.sin(this.t)*Math.sin(this.t)
		let color = Phaser.Display.Color.HSVToRGB(h, 1, 1).color
		
		this.sprite.tint = color 
		
		
	}
	
	Star.prototype.whistle = function(){
		this.sprite.alpha = 0 
		
		this.scene.add.tween({
			targets: [this.sprite, this.sprite2],
			alpha: 1,
			duration: 300,
			yoyo: true,
			onComplete: ()=>{
				this.sprite.alpha = 0 
		
			}
		})
	}
	
	function Jump(scene, x, y){
		this.scene = scene 
		this.sprite = scene.matter.add.sprite(x, y, 'star', 1, {
			isStatic: true,
			isSensor: true,
			label: 'jump',
			shape: {
				type: 'circle',
				radius: 40
			},
			
		})
		this.t = 0
		this.sprite.alpha = 0 
		
		scene.add.tween({
			targets: this.sprite,
			scale: 0.8,
			yoyo: true,
			duration: 600,
			repeat: -1,
			ease: 'Sine.easeInOut'
		})
	}
	
	Jump.prototype.update = function(dt){
		this.t += .01
		let h = 0.1 + 0.4*Math.sin(this.t)*Math.sin(this.t)
		let color = Phaser.Display.Color.HSVToRGB(h, 1, 1).color
		
		this.sprite.tint = color 
		
		this.sprite.rotation += dt/1000 
	}
	
	Jump.prototype.whistle = function(){
		this.sprite.alpha = 0 
		
		this.scene.add.tween({
			targets: this.sprite,
			alpha: 1,
			duration: 300,
			yoyo: true,
			onComplete: ()=>{
				this.sprite.alpha = 0 
		
			}
		})
	}
	
	function Sensor(scene, x, y, w, h, label){
		this.scene = scene 
		this.sprite = scene.matter.add.sprite(x, y, 'star', 0, {
			label: label,
			isSensor: true,
			isStatic: true,
			shape: {
				type: 'rectangle',
				width: w,
				height: h
			}
		})
		this.sprite.alpha = 0 
	}

	function Platform(scene, x, y, count){
		this.scene = scene 
		let dw = 70
		this.sprites = []
		for(let i = 0; i < count; i++){
			let s = scene.matter.add.sprite(x - dw*i, y, 'flowers', 2, {
				isStatic: true,
				
				label: 'plat',
				shape: {
					type: 'rectangle',
					width: dw,
					height: dw
				},
				render: {
					sprite: {
						xOffset: 0,
						yOffset: -0.15
					}
				}
				
			})
			
			s.t = i/10
			s.alpha = 0 
			this.sprites.push(s)
		}
		this.t = 0 
	}
	
	Platform.prototype.update = function(){
		this.t += .01
		this.sprites.forEach(s => {
			
			let h = 0.1 + 0.4*Math.sin(this.t + s.t)*Math.sin(this.t + s.t)
			let color = Phaser.Display.Color.HSVToRGB(h, 1, 1).color
			
			s.tint = color 
		})
	}
	
	Platform.prototype.whistle = function(){
		this.sprites.forEach(s => {
			s.alpha = 0 
			this.scene.add.tween({
				targets: s,
				alpha: 1,
				duration: 300,
				delay: 500*s.t,
				yoyo: true,
				onComplete: ()=>{
					s.alpha = 0 
			
				}
			})
		})
		
		
	}

	function say(what){
		if(textScene.text && textScene.text.destroy){
			textScene.text.destroy()
			textScene.text = undefined
		}
		let text = textScene.add.text(textScene.width/2, textScene.height, what, font)
		text.alpha = 0 
		text.y -= text.height
		text.setOrigin(0.5)
		text.setDepth(100)
		text.setScrollFactor(0)
		textScene.text = text 
		
		textScene.add.tween({
			targets: textScene.text,
			alpha: 1,
			duration: 300,
	
		})
		
		textScene.add.tween({
			targets: textScene.text,
			alpha: 0,
			delay: 3000,
			duration: 300,
		})
			
		return text 
	}
	
	function shutup(){
		if(textScene.text){
			textScene.add.tween({
				targets: textScene.text,
				alpha: 0,
				duration: 300,
				onComplete: ()=>{
					textScene.text.destroy()
					textScene.text = undefined
				}
			})
		}
	}
	
	window.text = {
		create: function(){
			this.width = 2*this.cameras.main.centerX
			this.height = 2*this.cameras.main.centerY
			
			window.textScene = this 
			
		},
		update: function(){
			this.scene.bringToTop()
		}
	}

	window.play = {
		create: function(){
			window.scene = this 
			this.width = this.cameras.main.centerX*2 
			this.height = this.cameras.main.centerY*2
			this.cam = this.cameras.main 
		
			let shapes = this.cache.json.get('bg')
		
			this.bg = this.matter.add.sprite(0, 0, 'bg', 0, {shape: shapes.bg, label: 'ground'})
			//this.bg.setOrigin(0)
			this.bg.setPosition(0 + this.bg.centerOfMass.x, this.bg.centerOfMass.y)
			this.bg.setFriction(1, 1, 1)
			
			this.matter.world.setBounds(0, 0, this.bg.width, this.bg.height)
			this.cam.setBounds(0, 0, this.bg.width, this.bg.height)
			
			
			
			this.player = new Player(this)
			
			let fg = this.add.sprite(0, 0, 'fg')
			fg.setOrigin(0)
			fg.setDepth(1)
			
			
			this.cam.setZoom(1)
			
			
			this.input.on('pointerdown', ()=>{
				this.player.pointer.charging = true 
			})
			
			this.input.on('pointerup', ()=>{
				this.player.pointer.charging = false 
				this.player.fire()
			})
			
			
			var keyObj = this.input.keyboard.addKey('D');  // Get key object
			keyObj.on('down', (event)=>{
				console.log(this.player.sprite.x, this.player.sprite.y)
			});
			keyObj.on('up', (event)=>{
				
			});
			
			this.matter.world.on('collisionstart', function(event, a, b){
				
				let player, obj 
				if(a.label === 'player'){
					player = a
					obj = b 
				}
				if(b.label === 'player'){
					player = b 
					obj = a 
				}
				
				if(!player){
					return
				}
				
				if(obj.label === 'flower'){
					player.gameObject.parent.collect(obj.gameObject)
					obj.gameObject.action(obj.gameObject, player.gameObject)
				}else if(obj.label === 'check'){
					player.gameObject.parent.check = obj.gameObject
				}else if(obj.label === 'death' || obj.label === 'star'){
					player.gameObject.parent.whistle(true)
					player.gameObject.parent.kill()
				}else if(obj.label === 'jump'){
					player.gameObject.parent.grab(obj.gameObject)
				}
			})
			
			this.flowers = [
				new Flower(this, 1400, 3500, {
					frame:1,
					action: (obj, player)=>{
						obj.destroy()
						player.parent.canSee.star = true 
						player.parent.whistle()
						say('Click to whistle and reveal your hidden enemies')
						
					}
				}),
				new Flower(this, 6100, 3400, {
					frame:0,
					action: (obj, player)=>{
						obj.destroy()
						player.parent.canSee.jump = true 
						player.parent.whistle()
						say('Whistling now shows sticky flowers')
						
					}
				}),
				new Flower(this, 2400, 2875, {
					frame:2,
					action: (obj, player)=>{
						obj.destroy()
						player.parent.canSee.plat = true 
						player.parent.whistle()
						say('Whistling now shows floating platforms')
						
					}
				}),
				new Flower(this, 2200, 900, {
					frame:3,
					action: (obj, player)=>{
						obj.destroy()
						
						this.add.tween({
							targets: this.cam,
							zoom: 0.125,
							duration: dur,
							ease: 'Sine.easeInOut',
							onComplete: ()=>{
								this.scene.start('title')
							}
						})
						
						this.add.tween({
							targets: this.orig,
							alpha: 1,
							duration: dur,
							ease: 'Sine.easeInOut'
						})
					}
				}),
			]
			
			this.stars = [
				new Star(this, 1800, 3300),
				new Star(this, 2400, 3400),
				new Star(this, 3300, 3300),
				new Star(this, 4600, 3400),
				new Star(this, 4950, 3200),
				new Star(this, 5400, 3200),
				new Star(this, 5900, 2550),
				//new Star(this, 5650, 1975),
				new Star(this, 4700, 1900),
				new Star(this, 3850, 1900, 200, 1000),
				new Star(this, 1000, 2100),
				new Star(this, 1000, 1800),
			]
			
			this.jumps = [
				new Jump(this, 6100, 3200),
				new Jump(this, 5900, 3000),
				new Jump(this, 5900, 2700),
				new Jump(this, 5600, 2700),
				new Jump(this, 5600, 2400),
				new Jump(this, 5900, 2400),
				new Jump(this, 6100, 2200),
				new Jump(this, 6100, 1900),
				
				new Jump(this, 1700, 2650),
				new Jump(this,  450, 2500),
				new Jump(this,  450, 2300),
				new Jump(this,  450, 2100),
				new Jump(this,  600, 1950),
				new Jump(this,  800, 1950),
				new Jump(this, 1700, 2000),
				new Jump(this, 1700, 1750),
				new Jump(this, 1700, 1500),
				new Jump(this, 1700, 1250),
				new Jump(this, 1700, 1000),
			]
			
			this.sensors = [
				new Sensor(this, 300, 3600, 200, 200, 'check'),
				new Sensor(this, 1500, 3500, 200, 200, 'check'),
				new Sensor(this, 2600, 3300, 200, 200, 'check'),
				
				new Sensor(this, 2800, 3800, 400, 200, 'death'),
				new Sensor(this, 3800, 3850, 400, 200, 'death'),
				
				new Sensor(this, 4000, 3400, 200, 200, 'check'),
				new Sensor(this, 6100, 3400, 200, 200, 'check'),
				//new Sensor(this, 5900, 2400, 200, 200, 'check'),
				new Sensor(this, 5850, 2000, 200, 200, 'check'),
				new Sensor(this, 5850, 1800, 200, 200, 'check'),
				new Sensor(this, 4100, 1900, 200, 200, 'check'),
				new Sensor(this, 4100, 1900, 200, 200, 'check'),
				new Sensor(this, 2400, 2875, 200, 200, 'check'),
				
				new Sensor(this, 1700, 1000, 200, 200, 'check'),
			]
			
			this.platforms = [
				new Platform(this, 2050, 3000, 8),
				new Platform(this, 1350, 2700, 16),
			
				new Platform(this, 1500, 2200, 8),
				new Platform(this, 2500, 1000, 8),
			]
			
			this.player.check = this.sensors[0].sprite
			this.player.kill(true)
			
			this.orig = this.add.sprite(0, 0, 'small')
			this.orig.setOrigin(0)
			this.orig.setScale(8)
			this.orig.setDepth(10)
			
			this.cam.setZoom(0.125)
			
			let dur = 4800
			this.add.tween({
				targets: this.cam,
				zoom: 0.75,
				duration: dur,
				ease: 'Sine.easeInOut',
				onComplete: function(){
					say('Press and hold the left mouse button')
				}
			})
			
			this.add.tween({
				targets: this.orig,
				alpha: 0,
				duration: dur,
				ease: 'Sine.easeInOut'
			})
			
			this.cam.setZoom(.125)
			this.orig.alpha = 1
			
			//this.cameras.main.setRenderToTexture(shader);
			
		},
		update: function(time, dt){
			//console.log(time, delta)
			this.player.update(dt)
			this.flowers.forEach(flower => flower.update(dt))
			this.stars.forEach(star => star.update(dt))
			this.jumps.forEach(star => star.update(dt))
			this.platforms.forEach(star => star.update(dt))
			/*
			shader.setFloat2('light1', this.lights[0].shaderX(), this.lights[0].shaderY());
			//shader.setFloat('time', this.shaderTime)
			shader.setFloat1('time', this.shaderTime)
			this.shaderTime += 0.01 
			*/
			
			
		}
	}
	
	window.title = {
		create: function(){
			let bg = this.add.sprite(0, 0, 'small')
			bg.setOrigin(0)
			
			this.input.on('pointerdown', ()=>{
				this.scene.start('play')
				shutup()
			})
			
			
			
			say('Click to begin')
		}
	}
//})()