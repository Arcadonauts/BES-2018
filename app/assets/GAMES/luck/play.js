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
		rect.setFillStyle(0x000000, 0.75)
		rect.setStrokeStyle(2, 0xffffff, 0.75)
		
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
					scene.scene.launch('battle')
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
		
		console.table(this.supply)
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
		
		let done = new Done(scene, cx, 1.5*cy, 'Done', ()=>{
			scene.scene.start('jump', {
				message: 'Good Luck!'
			})
		})
		
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
		console.log('move', step)
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
		this.speed = 2
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
		

		
		let goodAttackHolder = this.scene.holders[5]
		let goodDamageHolder = this.scene.holders[4]
		let goodDefendHolder = this.scene.holders[3]
		
		
		let badAttack = this.scene.holders[0].die
		let badDamage = this.scene.holders[1].die
		let badDefend = this.scene.holders[2].die
		
		let goodAttack = this.scene.holders[5].die
		let goodDamage = this.scene.holders[4].die
		let goodDefend = this.scene.holders[3].die
		
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
			p1.onComplete = add(p2a, p2b)
			
			let p3a = sidewinderX(goodDamage)
			p3a.onComplete = function(){
				goodDamage.container.alpha = 0
				ship.hit(goodDamage.value + goodDamageHolder.bonus)
			}
			let p3b = sidewinderY(goodDamage)
			p2a.onComplete = add(p3a, p3b)
			p3 = p3b
			
		}else{
			let p2a = bump(badDefend, -1)
			let p2b = slide(goodAttack, 1)
			p1.onComplete = add(p2a, p2b)
			
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
			p4b.onComplete = add(p5a, p5b)
			
			let p6a = blast(badDamage)
			let p6b = scale(badDamage)
			p6b.onComplete = function(){
				player.hit(badDamage.value)
			}
			p5a.onComplete = add(p6a, p6b)
			p6 = p6a
		}else{
			let p5a = bump(goodDefend, 1)
			let p5b = slide(badAttack, -1)
			p4b.onComplete = add(p5a, p5b)
			
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
			duration: 1800,
			onComplete: ()=>{
				this.scene.scene.start('jump', {
					message: 'Good Luck!'
				})
			}
		})
		
	}
	
	
	
	function Power(scene, target, x, y, onDrop){
		this.scene = scene 
		
		this.container = scene.add.container(x, y)
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

		this.maskShape = scene.add.graphics({
			x: this.container.x,
			y: this.container.y
		})
		
		this.home = {
			x: this.container.x,
			y: this.container.y 
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
		
		/*
		scene.add.tween({
			targets: this.container,
			x: x,
			duration: 300,
			delay: 1200,
			ease: 'Expo.easeOut'
			
		})
		*/
	
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
		
		let x = this.container.x + value/this.max*(this.width - 28)
		
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
		this.outline.tint = tints.darkOrange
		
		for(let i = 0; i < 3; i++){
			for(let j = 0; j < 3; j ++){
				if(isDot(i, j, data.n)){
					let d = 12
					let dot = scene.add.sprite((i-1)*d, (j-1)*d, 'icons', 2)
					dot.setScale(0.5)
					this.container.add(dot)
					dot.tint = tints.darkOrange
				}
				
			}
		}
		
		this.container.alpha = 0
			
		scene.add.tween({
			targets: this.container,
			alpha: 1,
			delay: data.delay,
			duration: data.duration
		})
	}
	
	
	
	function Ship(scene, diff){
		this.scene = scene 
		this.diff = diff || 4
		
		this.hp = 1//2 + this.diff*2
		
		
		let values = []
		for(let i = 0; i < 6; i++){
			values.push(Math.min(i+1, diff))
		}
		
		this.die = new Die(values)
		
		let cx = scene.cameras.main.centerX
		let cy = scene.cameras.main.centerY
		this.sprite = scene.add.sprite(2*cx, .25*cy, 'enemy')
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
		console.log('boom!')
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
		if(!die){
			throw "no dice!"
		}
		this.locked = true 
		
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
			
		})
	}
	
	BattleDie.prototype.to = function(x, y, delay){
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
					
					onStart: ()=> child.play(this.o + 'reveal'),
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
	
	BattleDie.prototype.reroll = function(roll){
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
		this.to(x0, y0, 0)
		
		
	}
	
	
	
	function Player(scene){
		this.scene = scene 
		this.die = new Die([1, 2, 3, 4, 5, 6])
		this.die.parent = this 
		this.xp = 0
		this.hp = 20
		this.maxHp = 20
		this.money = 500
		this.dice = []
		this.upgrades = []
		
		this.spy = {
			value: 5,
			max: 5,
			icon: 12
		}
		
		this.reroll = {
			value: 8,
			max: 8,
			icon: 13
		}
		
		//this.getUpgrade(new Upgrade(upgrades.money))
		this.getUpgrade(new Upgrade(upgrades.repair))
		//this.getUpgrade(new Upgrade(upgrades.money))
	}
	
	Player.prototype.hit = function(dam){
		this.hp -= dam 
		if(this.bar){
			this.bar.set(this.hp)
		}
		this.scene.cameras.main.shake(100*dam, 0.02)
	}
	
	Player.prototype.diceRepair = function(amount){
		this.hp += amount 
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
				bar.set(this.hp + amount)
				this.hp += amount 
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
		console.log(animName)
		this.set('animation')
		this.animation.play(animName)
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
				let x = cx + (i % 5)*100
				let y = 0.25*cy + Math.floor(i/5)*100
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
			
			this.scene.launch('jump')
			
			this.map = new Map()
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
		create: function(){
			
			
		
			this.ship = new Ship(this, 2)
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
			if(true || play.stillTutting){
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

//})()