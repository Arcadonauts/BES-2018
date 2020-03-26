//(function(){
	
	
	let tints = {
		lightOrange: 	Phaser.Display.Color.HSVToRGB( 1/12, 0.35, 1.00).color,
		darkOrange: 	Phaser.Display.Color.HSVToRGB( 1/12, 0.75, 0.75).color,
		lightPurple: 	Phaser.Display.Color.HSVToRGB(10/12, 0.35, 1.00).color,
		darkPurple: 	Phaser.Display.Color.HSVToRGB(10/12, 0.75, 0.75).color
		
	}
	
	function isDot(i, j, n){
		let bitMasks = [16, 257, 273, 325, 341, 365, 381, 495, 511]
		let k = Math.pow(2, i + 3*j)
		
		return !!(k&bitMasks[n-1])
		
	}
	
	function createDieSide(scene, n, orange){
		this.container = scene.add.container(0, 0)
		
		this.roll = scene.add.sprite(0, 0, 'roll')
		this.roll.setOrigin(0.5)
		this.container.add(this.roll)
		this.roll.angle = 90*Math.floor(4*Math.random())
		this.roll.setScale(0.85)
		
		
		this.o = orange ? 'o' : ''
		
		this.roll.play(this.o + 'roll')
		
		this.bg = scene.add.sprite(0, 0, 'icons')
		this.bg.setOrigin(0.5)
		this.container.add(this.bg)
		this.bg.setFrame(3)
		this.bg.tint = 0 
		this.bg.alpha = 0
		
		this.base = scene.add.sprite(0, 0, 'icons')
		this.base.setOrigin(0.5)
		this.container.add(this.base)
		this.base.setFrame(1)
		
		
		
		this.base.tint = orange ? tints.lightOrange : tints.lightPurple 
		this.base.alpha = 0
		
		let dx = this.base.width/5
		let dy = dx 
		
		for(let i = 0; i < 3; i++){
			for(let j = 0; j < 3; j++){
				if(isDot(i, j, n)){
					let dot = scene.add.sprite((i-1)*dx, (j-1)*dy, 'icons')
					dot.setFrame(2)
					dot.tint = 0 
					dot.setOrigin(0.5)
					this.container.add(dot)
					dot.alpha = 0
				}
			}
		}
		
		this.container.setDepth(0)
	}
	
	function box(text){
		let scene = text.scene 
		let w = text.width 
		//let bounds = text.getBounds() // Doesn't play well with setOrigin()
		let bounds = text.getTopLeft()
		bounds.width = text.width 
		bounds.height = text.height 
		
		let ox = text.originX
		let oy = text.originY 
		//bounds.x += ox*bounds.width
		//bounds.y += oy*bounds.height
		//console.log(ox, oy)
		
		let mx = 40
		let my = mx/2
		let rect = scene.add.rectangle(bounds.x - mx, bounds.y - my, bounds.width + 2*mx, bounds.height + 2*my, 0)
		rect.setOrigin(0)
		rect.setFillStyle(0x000000, 0.5)
		rect.setStrokeStyle(2, 0xffffff, 0.5)
		
		rect.setDepth(1)
		text.setDepth(2)
		
		text.on('destroy', ()=>{
			rect.destroy()
		})
	}
	
	function Done(scene, x, y, label, callback){
		this.container = scene.add.container(x, y + 300)
		
		let frames = []
		for(let i = -1; i < 2; i+=2){
			
			let frame = scene.add.sprite(0, 0, 'icons', 25 + i)
			frame.x += i*frame.width/2
			frames.push(frame)
			frame.tint = tints.darkPurple
			this.container.add(frame)
			
		}
		
		let w = frames[0].width
		let h = frames[0].height 
		
		
		let text = scene.add.text(0, 0, label, {
			fill: 'white',
			fontFamily: 'LinLib',
			fontSize: '24pt',
			align: 'left',
			wordWrap: {
				width: w,
	
			},
		
		
		})
		text.tint = tints.lightPurple
		text.setOrigin(0.5, 0.5)
		this.container.add(text)
		
		scene.add.tween({
			targets: this.container,
			y: y,
			ease: 'Quad.easeOut',
			duration: 300,
			delay: 600
		})
		
		let hitArea = scene.add.sprite(0, 0, 'icons', 3)
		hitArea.setScale(2, 1)
		this.container.add(hitArea)
		hitArea.alpha = 0.01
		
		hitArea.setInteractive()
		
		hitArea.on('pointerover', ()=>{
			this.container.setScale(1.1)
		})
		
		hitArea.on('pointerout', ()=>{
			this.container.setScale(1.0)
		})
		
		hitArea.on('pointerdown', callback)
	}
	
	function MenuButton(scene, x, y, text, callback){
		this.text = scene.add.text(x, y, ' ' + text + ' ', {
			fill: 'white',
			fontFamily: 'LinLib',
			fontSize: '32pt',
			align: 'left'
		
		})
		
		this.text.alpha = 0.75
		this.text.setOrigin(0.5)
		this.text.setShadow(0, 0, '#ffbfff', 5, true, true)
		
		this.text.setInteractive()
		this.text.on('pointerover', ()=>{
			this.text.alpha = 1
		})
		
		this.text.on('pointerout', ()=>{
			this.text.alpha = 0.75
		})
		
		this.text.on('pointerdown', ()=>{
			callback(scene, this)
		})
	}
	
	function makeTip(obj, text){
		obj.setInteractive()
		
		let tip 
		obj.on('pointerover', (pointer)=>{
			if(!tip){
				tip = play.add.text(obj.scene.cameras.main.centerX, 25, text, {
					fill: 'white',
					fontFamily: 'LinLib',
					fontSize: '16pt',
					align: 'center'
				})
				
				tip.alpha = 0.75
				tip.setOrigin(0.5, 0)
				box(tip)
				
			}else{
			
			}
			
		})
		
		obj.on('destroy', ()=>{
			if(tip && tip.destroy){
				tip.destroy()
				tip = undefined
			}
		})
		
		obj.on('pointermove', (pointer)=>{
			if(tip){
				//tip.x = pointer.x 
				//tip.y = pointer.y 
			}
		})
		
		obj.on('pointerout', (pointer)=>{
			if(tip && tip.destroy){
				tip.destroy()
				tip = undefined
			}
		})
		
		obj.on('pointerdown', (pointer)=>{
			if(tip && tip.destroy){
				tip.destroy()
				tip = undefined
			}
		})
	}
	
	
	

	function LuckManager(scene){
		this.scene = scene 
		this.history = []
		
		this.y = scene.cameras.main.centerY*0.45
		this.dx = 50
		this.x0 = scene.cameras.main.centerX - this.dx*2.5
		this.dicons = []
		for(let i = 0; i < 6; i++){
			let dicon = new Dicon(this.scene, {
				x: this.x0 + i*this.dx,
				y: this.y,
				n: i+1,
				delay: 0,
				duration: 100,
				purple: true,
				alpha: 0.25
			})
			dicon.container.alpha = 0.5 
			this.dicons.push(dicon)
		}
		
	}
	
	LuckManager.prototype.add = function(die){
		let cx = this.scene.cameras.main.centerX 
		
		if(this.history[die.n]){
			this.dicons[die.n-1].tint(tints.darkOrange)
			console.log(this.history)
			let loss = 0
			this.history.forEach((x, i) => loss += (x ? 100*(i) : 0))
			play.player.getMoney(this.scene, -loss, ()=>{
				this.scene.add.tween({
					targets: die.container,
					x: 3*cx,
					duration: 600,
					ease: 'Cubic.easeOut',
					onComplete: ()=>{
						this.scene.doneButton.container.x = cx 
						this.scene.add.tween({
							targets: [this.scene.doneButton.container],
							y: this.scene.buttonY,
							ease: 'Quad.easeOut',
							duration: 300
						})
						
					}
				})
			})
			
			
		}else{
			this.history[die.n] = true 
			
			this.scene.add.tween({
				targets: die.container,
				x: this.x0 + (die.n-1)*this.dx,
				y: this.y,
				scale: 0.5,
				duration: 600,
				delay: 900,
				ease: 'Cubic.easeOut',
				onComplete: ()=>{
					die.container.x = cx
					die.container.y = 700 
					die.container.setScale(1)
					this.dicons[die.n-1].container.alpha = 1
					play.player.getMoney(this.scene, 100*die.n, ()=>{
						this.scene.add.tween({
							targets: [this.scene.rollButton.container, this.scene.doneButton.container],
							y: this.scene.buttonY,
							ease: 'Quad.easeOut',
							duration: 300
						})
					})
					
				}
			})
		}
		
	}
	
	LuckManager.prototype.addDicon = function(n){
		console.log(n)
		
	}
	
	LuckManager.prototype.last = function(){
		
		return this.history[this.history.length - 1]
	}


	
	
	
	function TutManager(scene, index){
		this.scene = scene 
		let cx = scene.cameras.main.centerX 
		let cy = scene.cameras.main.centerY 
		
		this.index = index || -1 
		this.moments = [
			{
				text: {
					text: "Hello and welcome to\nthe Dice Blaster 3000!",
					x: cx,
					y: cy,
				}
			},
			{
				text: {
					text: [
					   "This is a ship powered by a Dice Drive.",
					   "It's the cutting edge in probability base travel.",
					   "(It's also pretty handy in a fight...)",
					   "Let's take a look!"
				    ].join('\n'),
					x: cx,
					y: cy,
				}
			},
			{
				command: ()=>{
					play.view.step(-1)
				},
				text: {
					text: "Wow! Isn't she a beauty!",
					x: 1.25*cx,
					y: cy,
				}
			},
			{
				command: (that)=>{
					that.button.container.y = 2.5*cy
					scene.block.x = cx 
					that.invisible.setScale(cx/that.invisible.width, 2*cy/that.invisible.height)
					that.invisible.callback = ()=>{
						play.view.die.setScale(2)
						play.view.die.play('explode')
						that.next()
						
					}
				},
				text: {
					text: "You can touch it if you want.\nGo ahead! Give it a click.",
					x: 1.25*cx,
					y: cy,
				}
			},
			{
				command: (that)=> {
					
					that.button.container.y = 1.5*cy
					that.button.container.x = 1.5*cx
					that.invisible.x = 1.75*cx 
					scene.block.y = 2*cy 
					that.invisible.callback = ()=>{}
				},
				text: {
					text: "Oh look! You have an unequipped\nupgrade.You can drag that onto an\nempty die-slot to equip it.",
					x: 1.25*cx,
					y: cy,
				}
			},
			{
				command: (that) => {
					that.button.container.y = 2.5*cy
					that.invisible.callback = ()=>{
						play.view.step(1)
						play.view.die.play('spin')
						play.scene.stop('dieEdit')
						that.next()
					}
					
				},
				text:  {
					text: "When you're ready to get\nback to the game just click\nthe right side of the screen.",
					x: 1.25*cx,
					y: cy,
				}
			},{
				command: (that) => {
					scene.scene.launch('battle', {diff: 1})
					scene.block.x = 0 
					scene.block.y = 0 
					that.invisible.callback = ()=>{}
					that.button.container.x = 0.25*cx 
					that.button.container.y = 1.75*cy 
				},
				text: {
					text: "Holy crap! We're under attack!",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "Don't worry, we can take this fight\nat our own pace.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "I've disabled the controls for now,\nbut in a minute we'll really\nget into it.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "For now, I just want to explain what everything is.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "See the dice on the bottom? Those are yours.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "The spinning dice on the top are your foe's.\n You won't be able to see what they are\nuntil after you've placed your dice.",
					x: cx,
					y: .3*cy,
				}
			},{
				text: {
					text: "The icons in the middle are where the magic happens.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "The shield on the left is your defence\nand the sword on the right is your attack.",
					x: cx,
					y: .25*cy,
				}
			},{

				text: {
					text: "If your attack die is more than their defence\nthen your attack will hit them.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "Similarly, if their attack is more than your defence\nthen their attack will hit you.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "The explosion in the middle is the amount\nof damage you will do if your attack is sucessful.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "One last thing...\nThe bars on the right are health bars.\nThe pink one belongs to you.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "If the enemy's bar falls below zero,\nhe'll be defeated.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "But if your bar falls below zero...\ngame over.",
					x: cx,
					y: .25*cy,
				}
			},{
				text: {
					text: "Ok, that's it. You're on your own now.\nClick and drag the dice\nand Good Luck!",
					x: cx,
					y: .25*cy,
				}
			},{
				command: ()=>{
					scene.scene.stop()
					this.index += 1 
				}
			},{
				text: {
					text: "Wow! Great job!",
					x: cx,
					y: .25*cy,
				},
				
			},{
				text: {
					text: "Now that you've defeated your foe\nit's time to reap the rewards.",
					x: cx,
					y: .25*cy,
				},
				
			},{
				text: {
					text: "After every battle, you'll roll three more dice.\nBefore you put them on the icons below,\nlet me tell you what they do.",
					x: cx,
					y: .25*cy,
				},
				
			},{
				text: {
					text: "The first is how much money you get.\nYou get money equal to 100 times the\nvalue of the die.",
					x: cx,
					y: .25*cy,
				},
			},{
				text: {
					text: "The wrench in the middle will repair any\ndamage you took during battle.",
					x: cx,
					y: .25*cy,
				},
			},{
				text: {
					text: "The arrow on the right is how far you\nwill move on the map.",
					x: cx,
					y: .25*cy,
				},
				
			},{
				text: {
					text: "Take a close look at the map.\nThe icons tell you what kind of encounter you will\nhave if you land there.",
					x: cx,
					y: .75*cy,
				},
			},{
				text: {
					text: "Ok, that's it for real this time! The tutorial is over.\nJust remember:",
					x: cx,
					y: .25*cy,
				},
				
			},{
				text: {
					text: "Out here we make our own luck.",
					x: cx,
					y: cy,
				},
				
			},{
				command: ()=>{
					scene.scene.stop()
					this.index += 1 
					play.stillTutting = false 
				}
			}
			
			
		]
		
		this.button = new Done(scene, 0.25*cx, 1.75*cy, 'Next', ()=>this.next())
		this.invisible = scene.add.sprite(0, 0, 'icons', 17)
		this.invisible.setInteractive()
		this.invisible.setOrigin(0)
		this.invisible.callback = ()=>{}
		let that = this 
		this.invisible.on('pointerdown', ()=>{
			this.invisible.callback(that)
		})
		
		this.next()
	}
	
	TutManager.prototype.next = function(){
		this.index += 1 
		let moment = this.moments[this.index]
		if(this.text){
			this.text.destroy()
		}
		if(moment.text){
			this.text = this.scene.add.text(moment.text.x, moment.text.y, moment.text.text, {
				fill: 'white',
				fontFamily: 'LinLib',
				fontSize: '24pt',
				align: 'center'
			})
			this.text.setOrigin(0.5)
			box(this.text)
		}
		if(moment.command){
			moment.command(this)
		}
		console.log(this.index)
	}
	
	
	
	function Upgrade(data){
		this.data = data 
		this.bought = false
		this.equipped = false
		this.cost = data.cost
		
	}
	
	Upgrade.prototype.display = function(scene, x, y){
		this.container = scene.add.container(x, y - 300)
		this.alphaReset()
		
		let frames = []
		for(let i = -1; i < 2; i+=2){
			
			let frame = scene.add.sprite(0, 0, 'icons', 25 + i)
			frame.x += i*frame.width/2
			frames.push(frame)
			frame.tint = tints.darkPurple
			this.container.add(frame)
			
		}
		
		let w = frames[0].width
		let h = frames[0].height 
		
		
		
		let icon = scene.add.sprite(frames[0].x, 0, 'icons', this.data.icon)
		icon.setScale(0.5)
		this.container.add(icon)
		icon.tint = tints.lightPurple
		
		let text = scene.add.text(0.25*w, 0, '$' + this.cost, {
			fill: 'white',
			fontFamily: 'LinLib',
			fontSize: '24pt',
			align: 'left',
			wordWrap: {
				width: w,
	
			},
		
		
		})
		text.tint = tints.lightPurple
		text.setOrigin(0.5, 0.5)
		this.container.add(text)
		
		scene.add.tween({
			targets: this.container,
			y: y,
			ease: 'Bounce.easeOut',
			duration: 600,
			delay: 1000 - 4*y + 0.25*x
		})
		
		let hitArea = scene.add.sprite(0, 0, 'icons', 3)
		hitArea.setScale(2, 1)
		this.container.add(hitArea)
		hitArea.alpha = 0.01
		
		if(this.data.label){
			makeTip(hitArea, "When rolled, " + this.data.label)
		}
		
		hitArea.setInteractive()
		
		hitArea.on('pointerover', ()=>{
			this.container.setScale(1.1)
		})
		
		hitArea.on('pointerout', ()=>{
			this.container.setScale(1.0)
		})
		
		hitArea.on('pointerdown', ()=>{
			this.buy(scene, this.container)
		})
	}
	
	Upgrade.prototype.show = function(scene, x, y){
		this.container = scene.add.container(x, y)
		
		this.frame = scene.add.sprite(0, 0, 'icons', 0)
		this.frame.tint = tints.darkPurple
		this.container.add(this.frame)
		
		this.bg  = scene.add.sprite(0, 0, 'icons', 3)
		this.bg.tint = tints.darkPurple
		this.container.add(this.bg)
		
		
		
		this.icon = scene.add.sprite(0, 0, 'icons', this.data.icon)
		this.icon.tint = tints.lightPurple
		this.container.add(this.icon)
		this.icon.setScale(0.75)	
		
		if(this.data.label){
			makeTip(this.frame, "When rolled, " + this.data.label)
		}
		
		if(this.data.empty){
			this.bg.alpha = 0
			this.icon.tint = tints.darkPurple
		}
		
		this.container.alpha = 0
		scene.add.tween({
			targets: this.container,
			alpha: 1,
			duration: 200,
			delay: x + y
		})
	}
	
	Upgrade.prototype.draggable = function(scene){
		this.frame.setInteractive()
		scene.input.setDraggable(this.frame);
		
		this.frame.on('drag', (pointer)=>{
			this.container.x = pointer.x 
			this.container.y = pointer.y 
		})
		
		this.frame.drop = (that)=>{
			that.replaceWith(this)
		}
	}
	
	Upgrade.prototype.destroy = function(){
		this.dead = true 
		this.container.destroy()
	}
	
	Upgrade.prototype.replaceWith = function(newUp){
		for(let i = 0; i < play.player.die.upgrades.length; i++){
			for(let j = 0; j < play.player.die.upgrades[i].length; j++){
				let oldUp = play.player.die.upgrades[i][j]
				if(oldUp === this){
					newUp.container.x = oldUp.container.x 
					newUp.container.y = oldUp.container.y 
					newUp.container.setScale(oldUp.container.scaleX)
					oldUp.destroy()
					play.player.die.upgrades[i][j] = newUp 
					newUp.frame.disableInteractive()
					newUp.equipped = true 
					play.player.upgrades = play.player.upgrades.filter(x => !x.equipped)
					play.sound.play('powerup')
				}
			}
		}
	}
	
	Upgrade.prototype.dropzone = function(scene){
		this.frame.setInteractive()
		
		let x0 = this.container.x 
		let y0 = this.container.y 
		let w = this.frame.width 
		let h = this.frame.height 
		
		this.zone = scene.add.zone(x0, y0, w, h).setRectangleDropZone(w, h)
		let that = this 
		scene.input.on('drop', (pointer, obj, zone)=>{
			if(!obj.drop){
				return 
			}
			if(zone === that.zone){
				obj.drop(that)
			}
			
			
		})
		
	}
	
	Upgrade.prototype.alphaReset = function(){
		this.container.alpha = this.cost <= play.player.money ? 1 : 0.5
	}
	
	Upgrade.prototype.buy = function(scene, container){
		if(this.cost <= play.player.money){
			container.disableInteractive()
			scene.add.tween({
				targets: this.container,
				x: 0,
				y: scene.cameras.main.centerY,
				duration: 150,
				ease: 'Quad.easeIn'
			})
			this.bought = true 
			play.player.spendMoney(scene, this.cost)
			play.player.getUpgrade(this)
			scene.manager.alphaReset()
		}else{
			
		}
		
		
	}
	
	Upgrade.prototype.action = function(val, play, scene, source, delay){
		if(this.data.action){
			scene.add.tween({
				targets: this,
				countdown: 0,
				delay: delay,
				onComplete: () => {
					this.data.action(val, play, scene, source)
				}
			})
		}
	}
	
	
	
	function StoreManager(){
		console.log('welcome to my store!')
		
		this.supply = []
		for(let up in upgrades){
			if(upgrades.hasOwnProperty(up) && upgrades[up].active){
				let upgrade = upgrades[up] 
				this.supply.push(upgrade)
			}
		}
		
		this.upgrades = []
		
		for(let i = 0; i < 6; i++){
			this.upgrades.push(
				new Upgrade(random.pick(this.supply))
			)
		}
		
	}
	
	StoreManager.prototype.draw = function(scene){
		let cx = scene.cameras.main.centerX 
		let cy = scene.cameras.main.centerY
		
		this.upgrades.forEach((up, i) => {
			
			let x = cx + ((i%3) - 1)*96*2
			let y = 1.5*96 + 96*Math.floor(i / 3) 
			up.display(scene, x, y)
		})
		
		play.player.makeMoney(scene)
		play.player.showMoney(scene)()
		
		let done = new Done(scene, 1*cx, 1.5*cy, 'Done', ()=>{
			scene.scene.start('jump', {
				message: 'Good Luck!'
			})
		})
		
		let text = scene.add.text(1*cx, 1.2*cy, "Don't forget to equip your upgrades!", {
			fill: Phaser.Display.Color.ValueToColor(tints.lightOrange).rgba,
			fontFamily: 'LinLib',
			fontSize: '20pt',
			align: 'center'
		})
		
		text.setOrigin(0.5)
		text.alpha = 0 
		
		scene.add.tween({
			targets: text,
			alpha: 1,
			delay: 900,
			duration: 300
		})
		
		
		//box(text)
		
	}
	
	StoreManager.prototype.alphaReset = function(){
		this.upgrades.forEach(up => up.alphaReset())
	}

	
	
	function Map(){
		this.stops = []
		this.at = 0 
		let total = 25
		for(let i = 0; i < total; i ++){
			let s
			if(i === 0){
				s = 'start'
			}else if(i === total - 1){
				s = 'end'
			}else if(i % 5 === 1){
				s = 'store'
			}else if(i % 5 === 3){
				s = 'random'
			}else{
				s = 'battle'
			}
			this.stops.push(s)
		}
		
		let pur = tints.lightPurple
		let or = tints.lightOrange
		this.key = {
			'start': [19, pur],
			'end': [23, or],
			'store': [10, pur],
			'random': [14, pur],
			'battle': [4, or]
		}
	}
	
	Map.prototype.draw = function(scene, delay){
		let graphics = scene.add.graphics({
			x:0,
			y:0
		})
		
		let width = scene.cameras.main.centerX*2 
		
		let x0 = width/4 
		let dx = width/2/this.stops.length 
		
		let y0 = 150
		let dy = 12
		
		graphics.lineStyle(2, 0xffffff, 0.5)
		graphics.beginPath()
		graphics.moveTo(x0, y0-dy)
		this.icons = []
		this.stops.forEach((stop, i)=>{
			let x = x0 + i*dx 
			let y = y0 + (2*(i%2) - 1)*dy
			graphics.lineTo(x, y)
			
			
			
			let icon = scene.add.sprite(x, y0 + (2*(i%2) - 1)*dy*2, 'icons', this.key[stop][0])
			this.icons.push(icon)
			icon.setScale(0.25)
			icon.tint = this.key[stop][1]
			if(i <= this.at){
				icon.alpha = 0.5
			}
			if(i == this.at){
				this.marker = scene.add.sprite(x, y0 + (2*(i%2) - 1)*dy*2, 'icons', 15)
				this.marker.setScale(0.5)
				scene.add.tween({
					targets: this.marker,
					scale: 0.6,
					yoyo: true,
					repeat: -1,
					duration: 300,
					ease: 'Quad.easeInOut'
				})
			}
			
		})
		graphics.stroke()
		
		let black = scene.add.sprite(0, 0, 'icons', 3)
		black.setOrigin(0)
		black.setScale(width/black.width,)
		black.tint = 0 
		black.alpha = 1 
		
		scene.add.tween({
			targets: black,
			x: width,
			duration: 1600,
			delay: delay 
		})
	}
	
	Map.prototype.move = function(scene, step){
		if(this.at >= this.icons.length - 1){
			play.player.win()
			return 
		}
		if(step <= 0){
			this.go(scene)
		}else{
			let next = this.icons[this.at + 1]
			scene.add.tween({
				targets: this.marker,
				x: next.x,
				y: next.y,
				duration: 600,
				onComplete: ()=>{
					this.at += 1
					next.alpha = 0.5
					this.move(scene, step - 1)
					scene.sound.play('drop')
				}
			})
		}
	}
	
	Map.prototype.go = function(scene){
		let k = this.stops[this.at]
		
		if(k === 'battle'){
			scene.scene.start('battle', {
				diff: this.at 
			})
		}else if(k === 'store'){
			scene.scene.start('store', {
				diff: this.at 
			})
		}else if(k === 'random'){
			scene.scene.start('luck', {
				diff: this.at 
			})
		}else{
			console.error(k)
		}
	}
	
	
	
	function JumpManager(scene){
		this.scene = scene 
		
		scene.dice = []
		scene.input.enabled = true 
		
		for(let i = 0; i < 3; i++){
			x = scene.x0 + (i-1)*scene.dx 
			let die = new BattleDie(scene, play.player.die.roll(scene), false)
			play.player.dice.push(die)
			die.container.y = 400 
			die.to(x, 400, 900+200*(5 - i))
			die.x = x 
			scene.holders[i].unlock()
		
		}
		
	}
	
	JumpManager.prototype.checkIn = function(){
		let holders = this.scene.holders
		if(holders.length === 3 && holders.filter(x => !x.locked).length === 0){
			this.play()
		}
	}
	
	JumpManager.prototype.play = function(){
		let scene = this.scene 
		scene.input.enabled = false 
		
		let moneyHolder = scene.holders[0]
		let repairHolder = scene.holders[1]
		let moveHolder = scene.holders[2]
		
		let money = moneyHolder.die 
		let repair = repairHolder.die 
		let move = moveHolder.die 
		
		scene.add.tween({
			targets: [moneyHolder.container, money.container],
			alpha: 0,
			duration: 300
		})
			
		play.player.getMoney(scene, 100*money.value, ()=>{
			
			scene.add.tween({
				targets: [repairHolder.container, repair.container],
				alpha: 0,
				duration: 300
			})
			
			play.player.repair(scene, repair.value, ()=>{
				
				scene.add.tween({
					targets: [moveHolder.container, move.container],
					alpha: 0,
					duration: 300
				})
			
				play.map.move(scene, move.value)
			})
		})
		
	
	}

	
	
	function BattleManager(scene){
		this.scene = scene 
		this.speed = 1
	}
	
	BattleManager.prototype.checkIn = function(){
		let holders = this.scene.holders
		if(holders.length === 6 && holders.filter(x => !x.locked).length === 0){
			this.play()
		}
	}
	
	BattleManager.prototype.play = function(){
		
		
		let scene = this.scene 
		let s = 1/this.speed 
		scene.input.enabled = false 
		
		let ship = this.scene.ship
		let player = play.player 
		
		scene.sound.play('powerup')
		
		let goodAttackHolder = this.scene.holders[5]
		let goodDamageHolder = this.scene.holders[4]
		let goodDefendHolder = this.scene.holders[3]
		
		
		let badAttack = this.scene.holders[0].die
		let badDamage = this.scene.holders[1].die
		let badDefend = this.scene.holders[2].die
		
		let goodAttack = this.scene.holders[5].die
		let goodDamage = this.scene.holders[4].die
		let goodDefend = this.scene.holders[3].die
		
		let dummy = {}
		
		let durations = [800, 600, 600, 1000, 600, 600, 1000]
		let delays = []
		durations.forEach((dir, i) => {
			if(i){
				delays[i] = dir + delays[i-1]
			}else{
				delays[i] = dir 
			}
		})

		
		/*
		console.table({
			badAttack: badAttack,
			badDamage: badDamage,
			badDefend: badDefend,
			goodAttack: goodAttack,
			goodDamage: goodDamage,
			goodDefend: goodDefend
		})
		*/
		
		function add(){
			let tweens = []
			for(let i = 0; i < arguments.length; i++){
				tweens.push(arguments[i])
			}
			return ()=>{
				tweens.forEach(tween => scene.add.tween(tween))
			}
		}
		
		function sfx(key){
			
			return {
				targets: dummy,
				duration: 1,
				x: 0,
				onComplete: ()=>{
					scene.sound.play(key)
				}
			}
		}
		
		function pullback(who, dir, delay){
			return {
				targets: who.container,
				y: who.container.y + dir*100,
				ease: 'Quad.easeOut',
				delay: s*delay,
				duration: s*500
			}
		}
		
		function fire(who, at){
			let dir = who.container.y > at.container.y ? 1 : -1
			return {
				targets: who.container,
				y: at.container.y + dir*0.75*at.base.height,
				duration: s*600,
				ease: 'Expo.easeIn'
			}
		}
		
		function fly(who, dir){
			return {
				targets: who.container,
				y: dir*800,
				duration: s*500,
				ease: 'Linear'
			}
		}
		
		function bump(who, dir){
			return {
				targets: who.container,
				y: who.container.y + dir*10,
				duration: s*30,
				ease: 'Linear',
				yoyo: true 
			}
		}
		
		function slide(who, dir){
			return {
				targets: who.container,
				y: who.container.y + dir*15,
				alpha: 0,
				duration: s*1000,
				ease: 'Expo.easeOut',
			}
		}
		
		function fade(who){
			return {
				targets: who.container,
				alpha: 0,
				duration: s*300
			}
		}
		
		function sidewinderX(who){
			return {
				targets: who.container,
				x: ship.sprite.x,
				duration: s*300,
				ease: 'Linear',
				scale: 0.5
			}
		}
		
		function sidewinderY(who){
			return {
				targets: who.container,
				y: ship.sprite.y,
				duration: s*300,
				ease: 'Cubic.easeInOut'
			}
		}
		
		function blast(who){
			return {
				targets: who.container,
				y: 700,
				duration: s*300,
				ease: 'Linear'
			}
		}
		
		function scale(who){
			return {
				targets:who.container,
				scale: 4,
				duration: s*300,
				ease: 'Quad.easeIn'
			}
		}
		
		function reveal(who, delay){
			return {
				targets: who.container,
				scale: 1.2,
				delay: s*delay,
				duration: s*300,
				yoyo: true,
				ease: 'Quad.easeOut',
				onComplete: ()=>{
					who.reveal()
				}
			}
		}
		
		let s0 = reveal(badAttack, 0)
		let s1 = reveal(badDamage, 200)
		let s2 = reveal(badDefend, 400)
		scene.add.tween(s0)
		scene.add.tween(s1)
		scene.add.tween(s2)
		
		
		let p0 = pullback(goodAttack, 1, 1500)
		
		let p1 = fire(goodAttack, badDefend)
		p0.onComplete = add(p1)
		
		let p3 
		if(goodAttack.value + goodAttackHolder.bonus > badDefend.value){
			let p2a = fly(badDefend, -1)
			let p2b = slide(goodAttack, 1)
			p1.onComplete = add(p2a, p2b, sfx('boom'))
			
			let p3a = sidewinderX(goodDamage)
			p3a.onComplete = function(){
				goodDamage.container.alpha = 0
				ship.hit(goodDamage.value + goodDamageHolder.bonus)
			}
			let p3b = sidewinderY(goodDamage)
			p2a.onComplete = add(p3a, p3b, sfx('laser'), sfx('crash'))
			p3 = p3b
			
		}else{
			let p2a = bump(badDefend, -1)
			let p2b = slide(goodAttack, 1)
			p1.onComplete = add(p2a, p2b, sfx('bump'))
			
			let p3a = fade(badDefend)
			let p3b = fade(goodDamage)
			p2b.onComplete = add(p3a, p3b)
			p3 = p3b
		}
		
		let p4a = pullback(badAttack, -1, 0)
		p3.onComplete = add(p4a)
		
		let p4b = fire(badAttack, goodDefend)
		p4a.onComplete = add(p4b)

		let p6 
		if(badAttack.value > goodDefend.value + goodDefendHolder.bonus){
			let p5a = fly(goodDefend, 1)
			let p5b = slide(badAttack, -1)
			p4b.onComplete = add(p5a, p5b, sfx('boom'))
			
			let p6a = blast(badDamage)
			let p6b = scale(badDamage)
			p6b.onComplete = function(){
				player.hit(badDamage.value)
			}
			p5a.onComplete = add(p6a, p6b, sfx('laser'), sfx('crash'))
			p6 = p6a
		}else{
			let p5a = bump(goodDefend, 1)
			let p5b = slide(badAttack, -1)
			p4b.onComplete = add(p5a, p5b, sfx('bump'))
			
			let p6a = fade(badAttack)
			let p6b = fade(badDamage)
			let p6c = fade(goodDefend)
			p5b.onComplete = add(p6b, p6c)
			p6 = p6b
		}
		
		p6.onComplete = ()=>{
			this.next()
		}
		
		
		
		scene.add.tween(p0)
	}
	
	BattleManager.prototype.next = function(){
		let scene = this.scene 
		scene.sound.play('laser')
		play.player.dice = []
		scene.ship.dice = [] 
		scene.input.enabled = true 
		for(let i = 0; i < 3; i++){
			x = scene.x0 + i*scene.dx 
			let die = new BattleDie(scene, play.player.die.roll(scene), false)
			play.player.dice.push(die)
			die.container.y = 400 
			die.to(x, 400, 900+200*(5 - i))
			die.x = x 
			scene.holders[i+3].unlock()
			scene.holders[i+3].bonus = 0
			scene.holders[i+3].refresh()
			
		
			let d = new BattleDie(scene, scene.ship.die.roll(scene), true)
			scene.ship.dice.push(d)
			d.base.disableInteractive()
			d.place(x, 162, 900+100*(5 - i))
			d.x = x 
			
			scene.holders[i].disable(d)
			scene.holders[i].bonus = 0
			scene.holders[i].refresh()

		}
	}
	
	BattleManager.prototype.over = function(victory){
		this.scene 
		/*
		scene.holders.concat(play.player.dice).concat(scene.ship.dice).concat(scene.powers).concat([scene.ship]).forEach(thing => {
			thing.destroy()
		})(
		*/
		this.scene.add.tween({
			targets: this,
			countdown: 0,
			duration: 1200,
			onComplete: ()=>{
				this.scene.cameras.main.fadeOut(600)
			}
		})
		
		this.scene.add.tween({
			targets: this,
			countdown2: 0,
			duration: 3500,
			onComplete: ()=>{
				this.scene.scene.start('jump', {
					message: 'Good Luck!'
				})
			}
		})
		
	}
	
	
	
	function Power(scene, target, x, y, onDrop){
		this.scene = scene 
		
		this.container = scene.add.container(x+300, y)
		this.onDrop = onDrop 
		
		this.target = target
		
		this.frame = scene.add.sprite(0, 0, 'icons', 15)
		this.container.add(this.frame)
		this.frame.tint = tints.darkPurple
		
		this.pie = scene.add.sprite(0, 0, 'icons', 19)
		this.container.add(this.pie)
		this.pie.tint = tints.darkPurple
		
		this.icon = scene.add.sprite(0, 0, 'icons', target.icon)
		this.container.add(this.icon)
		this.icon.tint = tints.lightPurple
		this.icon.setScale(0.5)
		
		makeTip(this.pie, target.tip)

		this.maskShape = scene.add.graphics({
			x: x,
			y: y
		})
		
		this.home = {
			x: x,
			y: y 
		}
		
		this.mask = this.maskShape.createGeometryMask();
		this.mask.setInvertAlpha()
		this.pie.setMask(this.mask)

		this.pie.setInteractive()
		
		this.scene.input.setDraggable(this.pie);
		
		let that = this 
		this.pie.on('dragstart', (pointer) => {
			that.container.setDepth(100)
		})
		
		this.pie.on('drag', (pointer)=>{
			that.container.x = pointer.x
			that.container.y = pointer.y 
		})
		
		this.pie.on('dragend', (point)=>{
			
			if(onDrop){
				onDrop(that)
			}
			
			that.scene.add.tween({
				targets: that.container,
				x: that.home.x,
				y: that.home.y,
				ease: 'Quad.easeOut',
				duration: 50
			})
			
		})
		
		//*
		scene.add.tween({
			targets: this.container,
			x: x,
			duration: 300,
			delay: 300 + x,
			ease: 'Expo.easeOut'
			
		})
		//*/
	
		this.refresh()
		
	}
	
	Power.prototype.clear = function(){
		
		this.target.value = 0
		this.refresh()
		this.pie.disableInteractive()
		this.tween.stop()
	}
	
	Power.prototype.refresh = function(){
		
		this.maskShape.clear()
		this.pie.disableInteractive()
		
		if(this.target.value === 0){
			this.container.alpha = 0.25
			this.pie.alpha = 0
		}else if(this.target.value >= this.target.max){
			this.pie.setInteractive()
			this.container.alpha = 1 
			this.tween = this.scene.add.tween({
				targets: this.container,
				scale: 1.1,
				yoyo: true,
				repeat: -1,
				duration: 600
			})
			this.pie.alpha = 1 
		}else{
			this.pie.alpha = 1
			let dt = Math.PI*2*this.target.value/this.target.max

			
			this.container.alpha = 0.75
			
			
			this.maskShape.fillStyle(0xffff00, 0)
			this.maskShape.beginPath()
			this.maskShape.slice(0, 0, 100, -Math.PI/2, -Math.PI/2 + dt, true)
			this.maskShape.fill()
		
			
			
			
		}
	}
	
	
	
	function Bar(scene, data){
		this.scene = scene 

		this.value = data.value 
		this.max = data.max 
		this.width = data.width 
		
		
		
		
		this.container = scene.add.container(data.x, data.y)
		
		let frameOffset = data.big ? 0 : 8
		let dark = data.orange ? tints.darkOrange : tints.darkPurple
		let light = data.orange ? tints.lightOrange : tints.lightPurple
		
		
		this.centerBar = scene.add.sprite(0, 0, 'icons', 13 + frameOffset)
		this.container.add(this.centerBar)
		let w = this.centerBar.width 
		this.centerBar.setScale((data.width-2*w)/(2*w), 1)
		this.centerBar.setOrigin(0.5)
		this.centerBar.tint = dark
		
			
		this.leftBar = scene.add.sprite(-data.width/2 + w/2, 0, 'icons', 12 + frameOffset)
		this.container.add(this.leftBar)
		this.leftBar.setOrigin(0.5)
		this.leftBar.tint = dark
		
		this.rightBar = scene.add.sprite(data.width/2 - w/2, 0, 'icons', 14 + frameOffset)
		this.container.add(this.rightBar)
		this.rightBar.setOrigin(0.5)
		this.rightBar.tint = dark
		

		
		this.maskShape = scene.make.graphics({
			x: this.container.x,
			y: this.container.y,
			fillStyle: {
				color: 0xffffff,
				alpha: 0.25
			}
		})		
		//this.container.add(this.maskShape)
		
		this.maskShape.beginPath();
		this.maskShape.fillRect(14-data.width/2, -this.centerBar.height/2, data.width-28, this.centerBar.height)
		
		
		this.mask = this.maskShape.createGeometryMask();
		this.mask.setInvertAlpha()
		this.leftBar.setMask(this.mask)
		this.rightBar.setMask(this.mask)
		
		
		this.leftFrame = scene.add.sprite(this.leftBar.x, this.leftBar.y, 'icons', 8 + frameOffset)
		this.container.add(this.leftFrame)
		this.leftFrame.tint = dark
		
		this.rightFrame = scene.add.sprite(this.rightBar.x, this.rightBar.y, 'icons', 10 + frameOffset)
		this.container.add(this.rightFrame)
		this.rightFrame.tint = dark
		
		this.centerFrame = scene.add.sprite(this.centerBar.x, this.centerBar.y, 'icons', 9 + frameOffset)
		this.container.add(this.centerFrame)
		this.centerFrame.tint = dark
		this.centerFrame.setScale(this.centerBar.scaleX, this.centerBar.scaleY)
		
		this.text = scene.add.text(this.leftFrame.x, this.leftFrame.y, 'BAR', {
			fill: Phaser.Display.Color.ValueToColor(light).rgba,
			fontFamily: 'LinLib',
			fontSize: '16pt',
			align: 'center'
		})
		this.container.add(this.text)
		this.text.setOrigin(0.5)
		let that = this 
		this.text.on('destroy', ()=>{
			that.text = undefined 
		})
		
		this.container.alpha = 0
		

			
		scene.add.tween({
			targets: this.container,
			alpha: 1,
			delay: data.delay,
			duration: data.duration
		})
		
		
		
		//this.container.iterate(child => child.tint = tints.lightOrange)
		this.set(this.value)
	}
	
	Bar.prototype.set = function(value){
		
		let x 
		if(this.container){
			x = this.container.x + value/this.max*(this.width - 28)
		}
		
		if(this.text){
			this.text.text = value + '/' + this.max
		}
		
		
		this.value = value 
		
		this.scene.add.tween({
			targets: this.maskShape,
			x: x,
			duration: 300,
			onComplete: ()=>{
				
			}
		})
	}
	
	
	
	function Dicon(scene, data){
		this.scene = scene 

		this.container = scene.add.container(data.x, data.y)
		
		this.outline = scene.add.sprite(0, 0, 'icons', 7)
		this.container.add(this.outline)
		
		let tint
		if(data.purple){
			tint = tints.darkPurple
		}else{
			tint = tints.darkOrange
		}
		this.outline.tint = tint
		
		for(let i = 0; i < 3; i++){
			for(let j = 0; j < 3; j ++){
				if(isDot(i, j, data.n)){
					let d = 12
					let dot = scene.add.sprite((i-1)*d, (j-1)*d, 'icons', 2)
					dot.setScale(0.5)
					this.container.add(dot)
					dot.tint = tint
				}
				
			}
		}
		
		this.container.alpha = 0
			
		scene.add.tween({
			targets: this.container,
			alpha: data.alpha || 1,
			delay: data.delay,
			duration: data.duration
		})
	}
	
	Dicon.prototype.tint = function(tint){
		this.container.iterate(d => d.tint = tint)
	}
	
	
	
	function Ship(scene, diff){
		this.scene = scene 
		this.diff = diff || 4
		
		this.hp = 2 + this.diff*2
		
		
		let values = []
		for(let i = 0; i < 6; i++){
			values.push(Math.min(9, Math.floor((diff+2)*i/10 + 1)))
		}
		
		this.die = new Die(values)
		
		let cx = scene.cameras.main.centerX
		let cy = scene.cameras.main.centerY
		let f = Math.floor(4*Math.random())
		this.sprite = scene.add.sprite(2*cx, .25*cy, 'enemy', f)
		this.sprite.setScale(0)
		this.home = {
			x: 1.325*cx,
			y: 0.625*cy
		}
		
		scene.add.tween({
			targets: this.sprite,
			x: this.home.x,
			y: this.home.y,
			scale: 1,
			duration: 800,
			ease: 'Quad.easeIn',
			onComplete: ()=> {
				//this.explode()
			}
		})
		
		this.dice = []
		
		this.bar = new Bar(scene, {
			x: 1.35*cx,
			y: 0.95*cy,
			big: false,
			width: 192,
			orange: true,
			value: this.hp,
			max: this.hp,
			delay: 600,
			duration: 300
		})
		
		this.dicons = []
		this.die.values.forEach((n, i) =>{
			let x0 = 1.35*cx
			let dx = 48
			let x = x0 + (i % 3 - 1)*dx 
			
			let y0 = this.bar.container.y + 16 + 24
			let dy = 48
			let y = y0 + Math.floor(i/3)*dy
			this.dicons.push(new Dicon(scene, {
				x: x,
				y: y,
				n: n,
				delay: 800 + 100*i,
				duration: 300
			}))
		})
		
		
		
	}
	
	Ship.prototype.hit = function(dam){
		this.hp -= dam
		this.hp = Math.max(this.hp, 0)
		this.bar.set(this.hp)
		this.shake(5*dam)
		
		if(this.hp <= 0){
			this.explode()
		}
	}
	
	Ship.prototype.explode = function(){
		
		this.scene.sound.play('explode')
		this.scene.add.tween({
			targets: this.sprite,
			alpha: 0,
			duration: 300
		})
		
		let particles = this.scene.add.particles('particles');

		let emitter = particles.createEmitter({
			frames: [0, 1, 2, 3],
			alpha: { start: 1, end: 0.5 },
			scale: { start: 1, end: 0 },
			//tint: { start: 0xff945e, end: 0xff945e },
			speed: {min: 0, max: 800},
			
			angle: { min: -180, max: 180 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 1000, max: 2000 },
			blendMode: 'ADD',
			//frequency: 110,
			//maxParticles: 20,
			x: this.sprite.x,
			y: this.sprite.y
		});
		
		emitter.setFrame([0, 1, 2, 3])
		emitter.explode(500, this.sprite.x, this.sprite.y)
		
		this.scene.manager.over(true)
		
	}
	
	Ship.prototype.shake = function(dur){
		
		if(dur <= 0){
			this.sprite.x = this.home.x 
			this.sprite.y = this.home.y 
			return 
		}
		
		let amount = 5
		
		this.scene.add.tween({
			targets: this.sprite,
			x: this.home.x + random.between(-amount, amount),
			y: this.home.y + random.between(-amount, amount),
			duration: 2,
			onComplete: ()=>{
				this.shake(dur - 2)
			}
		})
	}
	
	
	
	function Holder(scene, x, yc, dy, icon, tint, delay){
		let yf = yc + dy
		let y0 = yc + dy*8
		this.scene = scene 
		
		this.container = scene.add.container(x, y0)
		
		this.bonus = 0
		
		this.flavor = 4+icon 
		if(tint === tints.darkOrange){
			this.flavor *= -1 
		}
		
		
		this.sprite = scene.add.sprite(0, 0, 'icons')
		this.sprite.setFrame(4 + icon)
		this.sprite.tint = tint 
		this.container.add(this.sprite)
		
		this.frame = scene.add.sprite(0, 0, 'icons')
		this.frame.tint = tint 
		this.container.add(this.frame)
		
		
		
		this.zone = this.scene.add.zone(x, yf, this.sprite.width, this.sprite.height).setRectangleDropZone(this.sprite.width, this.sprite.height)
		let that = this 
		this.scene.input.on('drop', (pointer, obj, zone)=>{
			if(!obj.drop){
				return 
			}
			if(zone === that.zone){
				if(that.locked && that.die){
					that.die.returnHome()
					that.unlock()
					obj.drop(that)
				}else if(!that.locked){
					obj.drop(that)
				}
				
			}
			
			
		})
		
		this.bonusFrame = scene.add.sprite(0.45*this.sprite.width, -0.45*this.sprite.height, 'icons', 3)
		this.container.add(this.bonusFrame)
		this.bonusFrame.setScale(0.35)
		this.bonusFrame.tint = tints.lightPurple
		
		
		
		makeTip(this.frame, this.tip())
		makeTip(this.zone, this.tip())
		
		this.bonusDots = []
		for(let i = 0; i < 3; i++){
			for(let j = 0; j < 3; j++){
				let dx = 8
				let dot = scene.add.sprite(this.bonusFrame.x + dx*(i-1), this.bonusFrame.y + dx*(j-1), 'icons', 2)
				dot.i = i 
				dot.j = j 
				dot.setScale(0.35)
				dot.tint = 0
				this.container.add(dot)
				this.bonusDots.push(dot)
			}
		}
		
		this.refresh()
		
		scene.add.tween({
			targets: this.container,
			y: yf,
			delay: (delay || 0) + 600+x,
			ease: 'Bounce.easeOut',
			duration: 600
		})
	}
	
	Holder.prototype.tip = function(){
		let flavor = {
			4: 'Attack',
			5: 'Damage',
			6: 'Defense',
			8: 'Move',
			9: 'Repair',
			10: 'Reward'
		}[Math.abs(this.flavor)]
		
		if(this.flavor < 0){
			return 'Enemy ' + flavor 
		}else{
			return 'Drag and drop dice here to activate your ' + flavor
		}
	}
	
	Holder.prototype.refresh = function(){
		if(this.bonus <= 0){
			this.bonusFrame.alpha = 0
		}else{
			this.bonusFrame.alpha = 1
		}
		
		this.bonusDots.forEach(dot => {
			if(isDot(dot.i, dot.j, this.bonus)){
				dot.alpha = 1
			}else{
				dot.alpha = 0
			}
		})
	}
	
	Holder.prototype.lock = function(die){
		
		this.locked = true 
		if(this.flavor > 0){
			this.scene.sound.play('holderDrop')
		}else{
			
		}
		this.die = die 
		//this.container.alpha = 0.5
		
		this.scene.manager.checkIn()
	
	}
	
	Holder.prototype.disable = function(die){
		this.lock(die)
		this.zone.destroy()
		
	}
	
	Holder.prototype.unlock = function(){
		this.locked = false 
		this.die = undefined
		this.container.alpha = 1 
	}
	
	
	
	function BattleDie(scene, roll, orange){
		this.n = roll.value
		this.upgrades = roll.upgrades 
		
		this.isOrange = orange 
		
		this.scene = scene 
		this.create(scene, this.n, orange)
	}
	
	BattleDie.prototype.create = function(scene, n, orange){
		this.value = n 
		
		createDieSide.call(this, scene, n, orange)
		
		this.base.setInteractive()
		this.scene.input.setDraggable(this.base);
		
		let that = this 
		this.base.on('dragstart', (pointer) => {
			if(that.holder){
				that.holder.unlock()
				that.holder = undefined
				
			}
			that.container.setDepth(10)
				
			
		})
		
		this.base.on('drag', (pointer)=>{
			
			that.container.x = pointer.x
			that.container.y = pointer.y 
		})
		
		this.base.on('dragend', (point)=>{
			if(!that.holder && that.home){
				that.returnHome()
				
			}
			that.container.setDepth(0)
			
		})
		
		this.base.drop = function(holder){
			that.container.x = holder.zone.x 
			that.container.y = holder.zone.y 
			
			that.holder = holder 
			that.holder.lock(that)
			
		}
	}
	
	BattleDie.prototype.returnHome = function(){
		this.holder = undefined
		this.scene.add.tween({
			targets: this.container,
			x: this.home.x,
			y: this.home.y,
			duration: 100,
			ease: 'Sine.easeIn'
		})
	}
	
	BattleDie.prototype.place = function(x, y, delay){
		this.home = {
			x: x,
			y: y 
		}
		this.scene.add.tween({
			targets: this.container,
			y: y,
			x: x,
			delay: delay,
			ease: 'Sine.easeIn',
			duration: 600,
			onComplete: ()=>{
				this.scene.sound.play('laser')
			}
			
		})
	}
	
	BattleDie.prototype.to = function(x, y, delay, callback){
		/*
		this.container.x = x 
		this.container.y = y 
		
		//*/
		//*
		this.home = {
			x: x,
			y: y 
		}
		this.scene.add.tween({
			targets: this.container,
			y: y,
			x: x,
			delay: delay,
			ease: 'Sine.easeIn',
			duration: 600,
			onComplete: ()=>{
				this.reveal(300)
				if(callback){
					callback(this)
				}
			}
		})
		//*/
	}
	
	BattleDie.prototype.reveal = function(delay){
		
		this.upgrades.forEach((upgrade, i) => {
			upgrade.action(this.n, play, this.scene, this, 300*i)
		})
		this.upgrades = []
		
		this.container.iterate(child => {
			if(child === this.roll){
				this.scene.add.tween({
					targets: child,
					delay: delay,
					alpha: 0,
					
					onStart: ()=> {
						child.play(this.o + 'reveal')
						
					},
					onComplete: ()=>{
						this.scene.sound.play('drop')
					},
					duration: 200
				})
			}else{
				this.scene.add.tween({
					targets: child,
					delay: delay,
					alpha: 1,
					duration: 200
				})
			}
				
			
		})
		
		
	}
	
	BattleDie.prototype.reroll = function(roll, callback){
		let value = roll.value 
		this.n = value 
		this.upgrades = roll.upgrades 
		this.container.y += 200

		this.container.destroy()
		let x0 = this.home.x 
		let y0 = this.home.y 
		this.create(this.scene, value, this.isOrange)
		this.container.y =  y0 + 200 
		this.container.x = x0 
		this.to(x0, y0, 0, callback)
		
		
	}
	
	
	
	function Player(scene){
		this.scene = scene 
		this.die = new Die([1, 2, 3, 4, 5, 6])
		this.die.parent = this 
		this.xp = 0
		this.hp = 30
		this.maxHp = 30
		this.money = 0
		this.dice = []
		this.upgrades = []
		
		this.spy = {
			value: 0,
			max: 5,
			icon: 12,
			tip: "When charged, drag and drop this on enemy dice to see their value."
		}
		
		this.reroll = {
			value: 0,
			max: 5,
			icon: 13,
			tip: "When charged, drag and drop this on your dice to reroll."
		}
		
		//this.getUpgrade(new Upgrade(upgrades.money))
		this.getUpgrade(new Upgrade(upgrades.repair))


		//this.getUpgrade(new Upgrade(upgrades.money))
	}
	
	Player.prototype.hit = function(dam){
		this.hp -= dam 
		if(this.hp < 0){
			this.lose()
		}
		if(this.bar){
			this.bar.set(this.hp)
		}
		this.scene.cameras.main.shake(100*dam, 0.02)
		this.scene.sound.play('crash')
	}
	
	Player.prototype.diceRepair = function(amount){
		this.hp += amount 
		this.scene.sound.play('good')
		this.hp = Math.min(this.hp, this.maxHp)
		if(this.bar){
			this.bar.set(this.hp)
		}
	}
	
	Player.prototype.spendMoney = function(scene, amount){
		this.plusMoney(scene, -amount)()
	}
	
	Player.prototype.makeMoney = function(scene, amount){
		amount = amount || ''
		
		if(this.container){
			this.container.alpha = 0
		}
		
		this.container = scene.add.container(0, 1.5*scene.cameras.main.centerY)
		
		let graphics = scene.add.graphics(0, 0)
		
		let text = scene.add.text(0, 0, '$' + this.money + amount, {
			fill: 'white',
			fontFamily: 'LinLib',
			fontSize: '32pt',
			align: 'center'
		})
		text.setOrigin(0.5)
		
		graphics.lineStyle(2, 0xffffff)
		graphics.fillStyle(0x000000)
		
		let w = text.width + 20
		let h = text.height + 10
		graphics.fillRect(-w/2, -h/2, w, h)
		graphics.strokeRect(-w/2, -h/2, w, h)
		
		this.container.add(graphics)
		this.container.add(text)
		
		text.text = '$' + this.money
		
		this.container.text = text 
		this.container.w = w 
		this.container.h = h 
	}
	
	Player.prototype.plusMoney = function(scene, amount, callback){
		let text = this.container.text 
		let w = this.container.w 
		let h = this.container.h 
		
		return (() => {
			scene.sound.play('money')
			this.money += amount 
			text.text = '$' + this.money
			
			let pm = amount > 0 ? '+' : '-'
			let pText = scene.add.text(0, 0, pm + Math.abs(amount), {
				fill: 'white',
				fontFamily: 'LinLib',
				fontSize: '32pt',
				align: 'center'
			})
			this.container.add(pText)
			pText.setOrigin(0.5)
			
			scene.add.tween({
				targets: pText,
				y: -2*h,
				duration: 600,
				alpha: 0,
				ease: 'Quad.easeOut',
				onComplete: callback
			})
		})
	}
	
	Player.prototype.hideMoney = function(scene, callback){
		let text = this.container.text 
		let w = this.container.w 
		let h = this.container.h 
		
		return (()=>{
			scene.add.tween({
				targets: this.container,
				x: 0,
				ease: 'Quad.easeIn',
				duration: 500,
				onComplete: callback
			})
		})
	}
	
	Player.prototype.showMoney = function(scene, callback){
		let text = this.container.text 
		let w = this.container.w 
		let h = this.container.h 
		
		return ()=>{
			scene.tweens.add({
				targets: this.container,
				x: 200 + w/2,
				ease: 'Quad.easeOut',
				duration: 500,
				onComplete: callback
			})
		}
	}
	
	Player.prototype.getMoney = function(scene, amount, callback){
		
		
		this.makeMoney(scene, amount)
		let text = this.container.text 
		let w = this.container.w 
		let h = this.container.h ;
		
		(this.showMoney(scene, 
			this.plusMoney(scene, amount,	
				this.hideMoney(scene, 
					callback
				)
			)
		))()

	}
	
	Player.prototype.repair = function(scene, amount, callback){
		
		let bar = new Bar(scene, {
			x: scene.cameras.main.centerX,
			y: 2*scene.cameras.main.centerY,
			big: false,
			width: 192,
			orange: false,
			value: this.hp,
			max: this.maxHp,
			delay: 0,
			duration: 0
		})
		
		
		
		scene.add.tween({
			targets: [bar.maskShape, bar.container],
			y: 1.5*scene.cameras.main.centerY,
			ease: 'Quad.easeOut',
			duration: 600,
			onComplete: ()=>{
				scene.sound.play('good')
				this.hp += amount 
				this.hp = Math.min(this.hp, this.maxHp)
				bar.set(this.hp)
				scene.add.tween({
					targets: [bar.maskShape, bar.container],
					y: 2*scene.cameras.main.centerY,
					ease: 'Quad.easeIn',
					duration: 600,
					delay: 600,
					onComplete: ()=>{
						callback()
					}
				})
			}
		})
		
		
	}
	
	Player.prototype.getUpgrade = function(upgrade){
		this.upgrades.push(upgrade)
	}
	
	Player.prototype.lose = function(){
		play.scene.launch('lose', {message: "Bad Luck!"})
	}
	
	Player.prototype.win = function(){
		play.scene.launch('lose', {message: "You Win!"})
	}
	
	
	function Die(values){
		this.values = values 
		this.upgrades = [] 
		this.values.forEach((v, i) => {
			this.upgrades.push([
				new Upgrade(upgrades.none),
				new Upgrade(upgrades.none)
			])
		})
		this.history = []
		
		
	}
	
	Die.prototype.roll = function(){
		let index = random.between(0, this.values.length - 1)
		let val = this.values[index]
		this.history.push(val)
		
		let upgrades = []
		if(this.parent === play.player){
		this.upgrades[index].forEach((upgrade, i) => {
			upgrades.push(upgrade)
		})
		}
		/*
		this.upgrades[index].forEach((upgrade, i) => {
			if(this.parent === play.player){
				console.log('action')
				upgrade.action(val, play, scene, 300 + 300*i)
			}
		})
		*/

		return {
			value: val,
			upgrades: upgrades
		}
	}
	
	
	
	function View(scene){
		console.log("Check out that view")
		this.block = scene.add.sprite(0, 0, 'icons', 17)
		this.block.setOrigin(0)
		this.block.setScale(
			2*scene.cameras.main.centerX/this.block.width,
			2*scene.cameras.main.centerY/this.block.height
		)
		this.block.setInteractive()
		
		this.scene = scene 
		this.front = scene.add.sprite(0, 0, 'front')
		this.front.setOrigin(0)
		
		this.left = scene.add.sprite(0, 0, 'left')
		this.left.setOrigin(0)
		
		this.right = scene.add.sprite(0, 0, 'right')
		this.right.setOrigin(0)
		
		this.animation = scene.add.sprite(0, 0, 'transitions')
		this.animation.setScale(2*scene.cameras.main.centerY/this.animation.height)
		this.animation.setOrigin(0)
		
		this.die = scene.add.sprite(0, 0, 'die')
		this.die.setOrigin(0)
		this.die.setScale(2*scene.cameras.main.centerY/this.die.height)
		this.die.setInteractive()
		
		this.die.on('pointerdown', ()=>{
			this.die.setScale(2)
			this.die.play('explode')
		})
		
		scene.anims.create({
			key: 'spin',
			frames: scene.anims.generateFrameNumbers('die', { start: 0, end: 20 }),
			frameRate: 48,
			repeat: -1
		})
		
		let explodeAnim = scene.anims.create({
			key: 'explode',
			frames: scene.anims.generateFrameNumbers('explode', { start: 0, end: 20 }),
			frameRate: 24,
			//repeat: -1
		})
		
		explodeAnim.on('complete', ()=>{
			scene.scene.launch('dieEdit')
			scene.add.tween({
				targets: this.die,
				alpha: 0,
				duration: 300
			})
		})
		
		this.die.play('spin')
		this.die.alpha = 0 
		
		
		let views = [
			['left', 0],
			['front', 10],
			['right', 20]
		]
		

		for(let i = 0; i < views.length; i++){
			for(let j = 0; j < views.length; j++){
				let v1 = views[i]
				let v2 = views[j]
				let k1 = v1[0]
				let k2 = v2[0]
				let f1 = v1[1]
				let f2 = v2[1]
				
		
				
				if(k1 !== k2){
					let anim = scene.anims.create({
						key: k1 + '-to-' + k2,
						frames: scene.anims.generateFrameNumbers('transitions', { start: f1, end: f2 }),
						frameRate: 24
					})
					anim.on('complete', ()=>this.set(k2))
				}
			}
		}
		
		
		this.swipeLeft = this.makeSwipe(-1)
		
		this.swipeRight = this.makeSwipe(1)
		
		this.hum = this.scene.sound.add('hum')
		this.hum.setLoop(true)
		this.hum.stop()
		
		
		this.set('front')
		
		return this 
		
	}
	
	View.prototype.makeSwipe = function(dir){
		let cx = this.scene.cameras.main.centerX 
		let swipe = this.scene.add.sprite((1+dir)*cx, 0, 'swipe')
		swipe.setOrigin(0)
		swipe.alpha = 0.01 
		swipe.setInteractive()
		swipe.setScale(-dir, 1)
		
		swipe.on('pointerover', ()=>{
			swipe.alpha = 0.3
		})
		
		swipe.on('pointerout', ()=>{
			swipe.alpha = 0.01
		})
		
		swipe.on('pointerup', ()=>{
			this.step(dir)
		})
		
		swipe.disableInteractive()
		
	
		
		return swipe 
	}
	
	View.prototype.set = function(dir){
		let dirs = ['front', 'left', 'right', 'animation']
		dirs.forEach(d => {
			
			if(dir === d){
				this[d].alpha = 1
			}else{
				this[d].alpha = 0 
			}
		})
		this.dir = dir 
		
		this.die.alpha = +(dir === 'left')
		if(dir === 'front'){
			this.swipeLeft.setInteractive()
			this.block.disableInteractive()
		}else{
			this.swipeLeft.disableInteractive()
			this.block.setInteractive()
		}
		
		if(dir === 'left'){
			this.swipeRight.setInteractive()
			this.scene.add.tween({
				targets: this.hum,
				volume: 1,
				duration: 300,
			})
			this.hum.setVolume(0)
			this.hum.play()
		}else{
			this.swipeRight.disableInteractive()
			this.scene.add.tween({
				targets: this.hum,
				volume: 0,
				duration: 300,
				onComplete: ()=>{
					this.hum.stop()
				}
			})
		}
	}
	
	View.prototype.step = function(s){
		let dirs = ['left', 'front', 'right']
		let current = dirs.indexOf(this.dir)
		this.goTo(dirs[current + s])
	}
	
	View.prototype.goTo = function(dir){
		let start = this.dir 
		let end = dir 
		let animName = start + "-to-" + end 
		//console.log(animName)
		this.set('animation')
		this.animation.play(animName)
	}
	
	
	
	window.title = {
		create: function(){
			this.scene.moveAbove('play')
			play.view.set('right')
			
			let cx = this.cameras.main.centerX + 25
			let cy = this.cameras.main.centerY
			
			let playButton = new MenuButton(this, cx, 1.2*cy, 'Play Tutorial', (scene)=>{
				scene.scene.start('tut')
				play.view.goTo('front')
			})

			let skipButton = new MenuButton(this, cx, 1.4*cy, 'Skip Tutorial', (scene)=>{
				scene.scene.start('jump', {message:'Good Luck!'})
				play.view.goTo('front')
			})

			
		}
	}
	
	window.dieEdit = {
		create: function(){
			this.scene.moveAbove('play')
			let cx = this.cameras.main.centerX 
			let cy = this.cameras.main.centerY 
			
			let sides = []
			
			play.player.die.values.forEach((val, i) => {
				createDieSide.call(this, this, val, false)
				
				this.container.x = 48
				this.container.y = 89*(i+1) - 46
				this.container.setScale(0.88)
				
				this.container.iterate(child => {
					if(child === this.roll){
						child.alpha = 0
					}else{
						this.add.tween({
							targets: child,
							alpha: 1,
							duration: 200
						})
					}
				})
				sides.push(this.container)
				
			})
			
			play.player.die.upgrades.forEach((row, i) => {
				row.forEach((upgrade, j) => {
					upgrade.show(this, 100*j + 150, sides[i].y)
					upgrade.container.setScale(0.88)
					if(upgrade.data.empty === true){
						upgrade.dropzone(this)
					}
				})
			})
			
			play.player.upgrades.forEach((upgrade, i) => {
				let x = cx + (i % 4)*100
				let y = 0.5*cy + Math.floor(i/4)*100
				upgrade.show(this, x, y)
				upgrade.draggable(this)
			})
			
			
			let swipe = this.add.sprite(2*cx, 0, 'swipe')
			swipe.setOrigin(0)
			swipe.alpha = 0.01 
			swipe.setInteractive()
			swipe.setScale(-1, 1)
			
			swipe.on('pointerover', ()=>{
				swipe.alpha = 0.3
				
			})
			
			swipe.on('pointerout', ()=>{
				swipe.alpha = 0.01
			})
			
			swipe.on('pointerup', ()=>{
				play.view.step(1)
				play.view.die.play('spin')
				this.scene.stop()
			})
			
			
			
		}
	}
	
	window.play = {
		create: function(){
			
			window.play = this 
			
			this.view = new View(this)
			this.player = new Player(this)
			
			this.scene.launch('title', {
				diff: 1
			})
			
			this.map = new Map()
		}
	}
	

	
	window.lose = {
		init: function(data){
			
			this.message = data.message || 'Bad Luck!'
		},
		create: function(){
			let cx = this.cameras.main.centerX 
			let cy = this.cameras.main.centerY
			let chars = []
			let cumWidths = [0]
			
			let scenes = [
				'luck', 
				'tut', 
				//'title', 
				'jump', 
				'battle', 
				'store', 
				'dieEdit'
			]
			scenes.forEach(s => this.scene.stop(s))
		
			
			this.sound.play('explode')
			
			this.message.split('').forEach(c => {
				let t = this.add.text(300, -100, c, {
		
					fill: 'white',
					fontFamily: 'LinLib',
					fontSize: '64pt',
					align: 'center'
				
				})
				chars.push(t)
				
			
				cumWidths.push(cumWidths[cumWidths.length-1] + t.width)
			
				
			})
			
			
			
			let x0 = cx - cumWidths[cumWidths.length - 1]/2
			chars.forEach((c, i) => {
				c.x = x0 + cumWidths[i]
				
				this.add.tween({
					targets: c,
					y: 200,
					ease: 'Bounce.easeOut',
					delay: 50*i,
					duration: 800,
					onComplete: ()=>{
						this.add.tween({
							targets: c,
							delay: 600,
							duration: 300,
							alpha: 0
						})
					}
				})
			})
			
			let that = this 
			let done = new Done(this, this.cameras.main.centerX, this.cameras.main.centerY, 'Menu', ()=>{
				that.scene.start('title')
			})
			
			done.container.alpha = 0 
			this.add.tween({
				targets: done.container,
				alpha: 1,
				duration: 300,
				delay: 3000
			})
			
			
			
		}
	}
	
	window.tut = {
		init: function(data){
			this.index = data.index 
		},
		create: function(){
			this.scene.bringToTop()
			
			
			let width = this.cameras.main.centerX*2
			let height = this.cameras.main.centerY*2
			
			
			this.block = this.add.sprite(0, 0, 'icons', 17)
			this.block.setOrigin(0)
			this.block.setScale(width/this.block.width, height/this.block.height)
			this.block.setInteractive()
			
			console.log(this.index)
			
			this.manager = new TutManager(this, this.index)

			play.stillTutting = true 
		
		}
		
	}
			
	window.battle = {
		init: function(data){
			this.diff = data.diff 
		},
		create: function(){
			
			
		
			this.ship = new Ship(this, this.diff)
			let width = 2*this.cameras.main.centerX
			let height = 2*this.cameras.main.centerY 
			
			this.manager = new BattleManager(this)
			
			this.x0 = 0.25*width
			this.dx = 0.125*width 
			this.yc = 0.4*height
			
			
			this.holders = []
			for(let j = 0; j < 2; j++){
				for(let i = 0; i < 3; i++){
	
					let x = this.x0 + i*this.dx 
					//let y = y0 + j*dy 
					let dy = (2*j - 1)*0.1*height 
					let icon = j ? 2 - i : i
				
					let holder = new Holder(this, x, this.yc, dy, icon, j ? tints.darkPurple : tints.darkOrange)
					this.holders.push(holder)
					
				}
			}
			
			
			let cx = 1.35*width/2
			let dx = 32
			
			play.player.bar = new Bar(this, {
				x: cx,
				y: 1.70*height/2,
				big: false,
				width: 192,
				orange: false,
				value: play.player.hp,
				max: play.player.maxHp,
				delay: 1800,
				duration: 300
			})
			
			this.powers = [
				new Power(this, play.player.spy, cx - dx, 1.5*height/2, (power)=>{
					let die = power.scene.ship.dice.find(s => {
						return (
							Math.abs(s.container.x - power.container.x) + Math.abs(s.container.y - power.container.y) < (s.base.width/2)
						)
						
					})
					
					if(die){
						die.reveal()
						power.clear()
					}
					
					
					
				}),
				new Power(this, play.player.reroll, cx + dx, 1.5*height/2, (power)=>{
					let die = play.player.dice.find(s => {
						return (
							Math.abs(s.container.x - power.container.x) + Math.abs(s.container.y - power.container.y) < (s.base.width/2)
						)
						
					})
					
					if(die){
						die.reroll(play.player.die.roll(this))
						power.clear()
					}
					
					
					
				})
			]
					
			this.manager.next()
						
			
		}
	}
		
	window.jump = {
		init: function(data){
			this.message = data.message || 'VICTORY!'
		},
		create: function(){
			if(play.stillTutting){
				this.scene.launch('tut', {index:21})
			}
			let cx = this.cameras.main.centerX 
			let cy = this.cameras.main.centerY
			let chars = []
			let cumWidths = [0]
			
			this.anims.create({
				key: 'roll',
				frames: this.anims.generateFrameNumbers('roll', { start: 0, end: 20 }),
				frameRate: 48,
				repeat: -1
			})
			
			this.anims.create({
				key: 'reveal',
				frames: this.anims.generateFrameNumbers('roll', { start: 20, end: 24 }),
				frameRate: 48,

			})
			
			
			play.map.draw(this, 2600)
			
			
			this.message.split('').forEach(c => {
				let t = this.add.text(300, -100, c, {
		
					fill: 'white',
					fontFamily: 'LinLib',
					fontSize: '64pt',
					align: 'center'
				
				})
				chars.push(t)
				
			
				cumWidths.push(cumWidths[cumWidths.length-1] + t.width)
			
				
			})
			
			
			
			let x0 = cx - cumWidths[cumWidths.length - 1]/2
			chars.forEach((c, i) => {
				c.x = x0 + cumWidths[i]
				
				this.add.tween({
					targets: c,
					y: 200,
					ease: 'Bounce.easeOut',
					delay: 50*i,
					duration: 800,
					onComplete: ()=>{
						this.add.tween({
							targets: c,
							delay: 600,
							duration: 300,
							alpha: 0
						})
					}
				})
			})
			
			this.holders = []
			
			this.x0 = cx 
			this.dx = 128
			for(let i = 0; i < 3; i++){
				let x = cx + (i-1)*this.dx  
				//let y = y0 + j*dy 
				let dy = -100 
				let icon = 6 - i
			
				let holder = new Holder(this, x, 375, dy, icon, tints.darkPurple, 600)
				this.holders.push(holder)
				
			}
			
			this.manager = new JumpManager(this)
			
	
		}
	}
	
	window.store = {
		create: function(){
			this.manager = new StoreManager()
			
			this.manager.draw(this)
		}
	}

	window.luck = {
		create: function(){
			let cx = this.cameras.main.centerX
			let cy = this.cameras.main.centerY
			
			let text = this.add.text(cx, 0.85*cy, [
				"Want to satisfy your gambling vice?",
				"Then step right up, get something nice!",
				"All you do is roll your dice,",
				"But lose it all if you make the same roll twice!"
			].join('\n'), {
				fill: 'white',
				fontFamily: 'LinLib',
				fontSize: '20pt',
				align: 'center'
			})
			
			text.setOrigin(0.5)
			
			this.manager = new LuckManager(this)
			
			this.die = new BattleDie(this, play.player.die.roll(), false)
			this.die.container.x = cx
			this.die.container.y = 700 
				
			let dx = 0.2
			let that = this 
			this.buttonY = 1.25*cy
			this.first = true 
			this.rollButton = new Done(this, (1 - dx)*cx, this.buttonY, 'Roll', ()=>{
				
				this.rollButton.container.y = 1000
				this.doneButton.container.y = 1000 
				if(this.first){
					this.first = false 
					this.die.to(cx, 350, 0, (die)=>{
						this.manager.add(this.die)
						
					})
				}else{
					this.die.reroll(play.player.die.roll(), (die)=>{
						this.manager.add(this.die)
						
					})
				}
			})
			this.doneButton = new Done(this, (1 + dx)*cx, this.buttonY, 'Leave', ()=>this.scene.start('jump', {message: "Good Luck!"}))
			
			
			
		}
	}

//})()