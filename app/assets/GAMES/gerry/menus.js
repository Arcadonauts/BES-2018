(function(){
	
	let guides = {
		intro: {
			bubble: 'Congratulations on your recent victory, Congressman! I know it was a hard-fought election, but at the end of the day, you really earned those votes! (Click "Continue" to hear more.)',
			next: 'intro1'
		},
		intro1: {
			bubble: "My name is Gerry, and I'm here to ensure that you will never lose another election.",
			next: 'intro2'
		},
		intro2: {
			bubble: "There's only one way to guarantee you're not going to lose your position to one of those dirty politicians in the other party, and that's redistricting.",
			next: 'intro3'
		},
		intro3: {
			bubble: "Your state is made up of voters, and those voters belong to districts. The red voters are the ones that will vote for us, and the blue voters plan to vote for the other guys.",
			anim: "Show Voters",
			next: 'intro3b',
		},
		intro3b: {
			bubble: "You can assign voters to a district by clicking and dragging.",
			anim: "Click and Drag",
			next: 'intro4',
		},
		intro4: {
			bubble: "There are two key rules to keep in mind: Every district must have the same number of voters, and every district must be one continuous area",
			anim: "Click and Drag",
			next: 'intro5',
		},
		intro5: {
			bubble: "The majority of voters in a district decides which party wins that district.",
			anim: "Majority",
			next: 'intro6'
		},
		intro6: {
			bubble: "Good luck, friend, and don't forget: In order to better serve our constituents, we need to maintain power.\n\n That means we need more red districts than blue districts.",
			play: true
		},
		dense: {
			bubble: "Sometimes there is more than one voter in a precinct. That's no problem for us; all we're worried about is who they vote for!",
			anim: "Dense",
			play: true
		},
		nonvoter: {
			bubble: "Sometimes people choose not to vote. They still count towards the population, but they don't affect the outcome of the election.",
			anim: "Nonvoter",
			play: true
		},
		suppress: {
			bubble: "When redistricting is not enough to get the job done, we have another tool at our disposal: Voter Suppression! Click an arrow to turn all the voters in that row into non-voters.",
			anim: "Suppress",
			play: true 
		},
		winner: {
			bubble: "Congratulations! That's all the levels I have for you. Thank you for playing!"
		}    

		
	}
	
	let anims = {
		"Suppress" : {
			create: function(scene){
				let container = scene.add.container(scene.cameras.main.centerX, 1.125*scene.cameras.main.centerY)
				
				let index = (i, j) => 10*j + i
				container.setScale(0.75)
				
				let corners = {}
				let voters = {}
				
				let dx = 280 /2
				let dy = 350 /2
						
				for(let i = -1; i < 2; i+= 1){
					for(let j = 0; j < 2; j += 1){
						
						
			
						let x = i*dx
						let y = j*dy
						let tl = scene.add.sprite(x, y, 'borders', 0)
						tl.setOrigin(1,1)
						tl.index = 0 
						container.add(tl)
						
						
						let tr = scene.add.sprite(x, y, 'borders', 2)
						tr.index = 2
						tr.setOrigin(0,1)
						container.add(tr)
						
						let bl = scene.add.sprite(x, y, 'borders', 8)
						bl.index = 8
						bl.setOrigin(1,0)
						container.add(bl)
						
						let br = scene.add.sprite(x, y, 'borders', 10)
						br.index = 10 
						br.setOrigin(0,0)
						container.add(br)
						
						corners[index(i, j)] = {
							tl: tl, bl: bl, tr: tr, br: br
						}
						
						let party = 1*(i+1)%3
						let voter = scene.add.sprite(x, y, 'voters', 12*party + Math.abs(i+j)%12)
						voters[index(i, j)] = voter 
						container.add(voter)
						
						
						
						
					}
				}
				
				let pointers = []
				for(let i = 0; i < 2; i++){
					let pointer = scene.add.sprite(-2*dx, i*dy, 'pointer')
					pointer.angle = -90
					pointer.setScale(0.5)
					container.add(pointer)
					
					
					pointers.push(pointer)
				}
				
				let mouse  = scene.add.sprite(-3*dx, dy, 'dots', 4)
				mouse.setScale(3)
				container.add(mouse)
				let duration = 200
				
				let tweens = [
					{
						targets: mouse,
						x: -2*dx,
						y: 0,
						duration: 2*duration,
					},
					{
						targets: pointers[0],
						x: 0*dx,
						
						duration: 2*duration,
						call_back: function(){
							pointers[1].destroy()
						}
					},
					{
						targets: pointers[0],
						x: 1*dx,
						
						duration: 1*duration,
						call_back: function(){
							voters[index(0, 0)].setFrame(0)
						}
					},
					{
						targets: pointers[0],
						x: 5*dx,
						
						duration: 5*duration,
						call_back: function(){
							voters[index(1, 0)].setFrame(1)
						}
					},
					{
						targets: mouse,
						on_complete: function(){
							container.destroy()
							anims['Suppress'].create(scene)
						}
					}
					
				]
				
				tweens.forEach((tween, i) => {
			
					if(tweens[i+1]){
						tween.onComplete = function(){
							if(tween.on_complete){
								tween.on_complete()
							}
							scene.add.tween(tweens[i+1])
						}
					}
				})
				
				scene.add.tween(tweens[0])
			}
		},
		"Nonvoter" : {
			create: function(scene){
				let container = scene.add.container(scene.cameras.main.centerX, 1.125*scene.cameras.main.centerY)
				
				let index = (i, j) => 10*j + i
				container.setScale(0.75)
				
				let corners = {}
				
				
				let dx = 280 /2
				let dy = 350 /2
						
				for(let i = -1; i < 2; i+= 1){
					for(let j = 0; j < 2; j += 1){
						
						
			
						let x = i*dx
						let y = j*dy
						let tl = scene.add.sprite(x, y, 'borders', 0)
						tl.setOrigin(1,1)
						tl.index = 0 
						container.add(tl)
						
						
						let tr = scene.add.sprite(x, y, 'borders', 2)
						tr.index = 2
						tr.setOrigin(0,1)
						container.add(tr)
						
						let bl = scene.add.sprite(x, y, 'borders', 8)
						bl.index = 8
						bl.setOrigin(1,0)
						container.add(bl)
						
						let br = scene.add.sprite(x, y, 'borders', 10)
						br.index = 10 
						br.setOrigin(0,0)
						container.add(br)
						
						corners[index(i, j)] = {
							tl: tl, bl: bl, tr: tr, br: br
						}
						
						let party = j+1
						if(Math.abs(i) == 1 && (i === 1 || j !== 0)){
							party = 0
						}
						let voter = scene.add.sprite(x, y, 'voters', 12*party + Math.abs(i+j)%12)
						
						container.add(voter)
						
						
						
						
					}
				}
				
				let mouse  = scene.add.sprite(-2*dx, dy, 'dots', 4)
				mouse.setScale(3)
				container.add(mouse)
				let duration = 200
				
				let tweens = [
					{
						targets: mouse,
						x: -1.5*dx,
						duration: duration,
					},
					{
						targets: mouse,
						x: -dx,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: dy/2,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: 0,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						x: -dx/2,
						duration: duration
					},
					{
						targets: mouse,
						x: 0,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(0,0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						x: 0.5*dx,
						duration: duration,
						
					},
					{
						targets: mouse,
						x: dx,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,1)]
							c.tl.setFrame(28-12)
							c.tr.setFrame(30-12)
							c.bl.setFrame(32-12)
							c.br.setFrame(34-12)
							
							c = corners[index(-1,0)]
							c.tl.setFrame(24-12)
							c.tr.setFrame(25-12)
							c.bl.setFrame(28-12)
							c.br.setFrame(35-12)
							
							c = corners[index(0,0)]
							c.tl.setFrame(25-12)
							c.tr.setFrame(26-12)
							c.bl.setFrame(33-12)
							c.br.setFrame(34-12)
							
							c = corners[index(1, 0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: 0.5*dy,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: dy,
						duration: duration,
						on_complete: function(){
							c = corners[index(1, 1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
						
					},
					{
						targets: mouse,
						x: 0.5*dx,
						duration: duration,
						
					},
					{
						targets: mouse,
						x: 0*dx,
						duration: duration,
						on_complete: function(){
							c = corners[index(0, 1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
						
					},
					{
						targets: mouse,
						y: 1.5*dy,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: 3*dy,
						duration: 5*duration,
						on_complete: function(){
							c = corners[index(1, 0)]
							c.tl.setFrame(24)
							c.tr.setFrame(26)
							c.bl.setFrame(28)
							c.br.setFrame(30)
							
							c = corners[index(1, 1)]
							c.tl.setFrame(31)
							c.tr.setFrame(30)
							c.bl.setFrame(33)
							c.br.setFrame(34)
							
							c = corners[index(0, 1)]
							c.tl.setFrame(24)
							c.tr.setFrame(25)
							c.bl.setFrame(32)
							c.br.setFrame(33)
						} 
						
					},
					{
						targets: mouse,
						on_complete: function(){
							container.destroy()
							anims['Nonvoter'].create(scene)
						}
					}
					
				]
				
				tweens.forEach((tween, i) => {
			
					if(tweens[i+1]){
						tween.onComplete = function(){
							if(tween.on_complete){
								tween.on_complete()
							}
							scene.add.tween(tweens[i+1])
						}
					}
				})
				
				scene.add.tween(tweens[0])
			}
		},
		"Dense": {
			create: function(scene){
				let container = scene.add.container(scene.cameras.main.centerX, 1.125*scene.cameras.main.centerY)
				
				let index = (i, j) => 10*j + i
				container.setScale(0.75)
				
				let corners = {}
				
				
				let dx = 280 /2
				let dy = 350 /2
						
				for(let i = -1; i < 2; i+= 1){
					for(let j = 0; j < 2; j += 1){
						
						if(i === 0 && j == 0){
							continue 
						}
			
						let x = i*dx
						let y = j*dy
						let tl = scene.add.sprite(x, y, 'borders', 0)
						tl.setOrigin(1,1)
						tl.index = 0 
						container.add(tl)
						
						
						let tr = scene.add.sprite(x, y, 'borders', 2)
						tr.index = 2
						tr.setOrigin(0,1)
						container.add(tr)
						
						let bl = scene.add.sprite(x, y, 'borders', 8)
						bl.index = 8
						bl.setOrigin(1,0)
						container.add(bl)
						
						let br = scene.add.sprite(x, y, 'borders', 10)
						br.index = 10 
						br.setOrigin(0,0)
						container.add(br)
						
						corners[index(i, j)] = {
							tl: tl, bl: bl, tr: tr, br: br
						}
						
						let party = j+1
						let voter = scene.add.sprite(x, y, 'voters', 12*party + Math.abs(i+j)%12)
						
						container.add(voter)
						
						if(i == -1 && j == 0){
							voter.x -= 25
							voter = scene.add.sprite(x, y, 'voters', 12*party + Math.abs(i+j + 1)%12)
							container.add(voter)
							voter.x += 25 
						}
						
						
						
					}
				}
				
				let mouse  = scene.add.sprite(-2*dx, dy, 'dots', 4)
				mouse.setScale(3)
				container.add(mouse)
				let duration = 200
				
				let tweens = [
					{
						targets: mouse,
						x: -1.5*dx,
						duration: duration,
					},
					{
						targets: mouse,
						x: -dx,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: dy/2,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: 0,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						x: -dx/2,
						duration: duration
					},
					{
						targets: mouse,
						x: 0,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,1)]
							c.tl.setFrame(28-12)
							c.tr.setFrame(30-12)
							c.bl.setFrame(32-12)
							c.br.setFrame(34-12)
							
							c = corners[index(-1,0)]
							c.tl.setFrame(24-12)
							c.tr.setFrame(26-12)
							c.bl.setFrame(28-12)
							c.br.setFrame(30-12)
							
						}
					},
					{
						targets: mouse,
						x: 0.5*dx,
						duration: duration,
						
					},
					{
						targets: mouse,
						x: dx,
						duration: duration,
						on_complete: ()=>{
				
							
							let c = corners[index(1, 0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: 0.5*dy,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: dy,
						duration: duration,
						on_complete: function(){
							c = corners[index(1, 1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
						
					},
					{
						targets: mouse,
						x: 0.5*dx,
						duration: duration,
						
					},
					{
						targets: mouse,
						x: 0*dx,
						duration: duration,
						on_complete: function(){
							c = corners[index(0, 1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
						
					},
					{
						targets: mouse,
						y: 1.5*dy,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: 3*dy,
						duration: 5*duration,
						on_complete: function(){
							c = corners[index(1, 0)]
							c.tl.setFrame(24)
							c.tr.setFrame(26)
							c.bl.setFrame(28)
							c.br.setFrame(30)
							
							c = corners[index(1, 1)]
							c.tl.setFrame(31)
							c.tr.setFrame(30)
							c.bl.setFrame(33)
							c.br.setFrame(34)
							
							c = corners[index(0, 1)]
							c.tl.setFrame(24)
							c.tr.setFrame(25)
							c.bl.setFrame(32)
							c.br.setFrame(33)
						} 
						
					},
					{
						targets: mouse,
						on_complete: function(){
							container.destroy()
							anims['Dense'].create(scene)
						}
					}
					
				]
				
				tweens.forEach((tween, i) => {
			
					if(tweens[i+1]){
						tween.onComplete = function(){
							if(tween.on_complete){
								tween.on_complete()
							}
							scene.add.tween(tweens[i+1])
						}
					}
				})
				
				scene.add.tween(tweens[0])
			}
		},
		"Majority": {
			create: function(scene){
				let container = scene.add.container(scene.cameras.main.centerX, 1.125*scene.cameras.main.centerY)
				
				let index = (i, j) => 10*j + i
				container.setScale(0.75)
				
				let corners = {}
				
				
				let dx = 280 /2
				let dy = 350 /2
						
				for(let i = -1; i < 2; i+= 1){
					for(let j = 0; j < 2; j += 1){
						
						
			
						let x = i*dx
						let y = j*dy
						let tl = scene.add.sprite(x, y, 'borders', 0)
						tl.setOrigin(1,1)
						tl.index = 0 
						container.add(tl)
						
						
						let tr = scene.add.sprite(x, y, 'borders', 2)
						tr.index = 2
						tr.setOrigin(0,1)
						container.add(tr)
						
						let bl = scene.add.sprite(x, y, 'borders', 8)
						bl.index = 8
						bl.setOrigin(1,0)
						container.add(bl)
						
						let br = scene.add.sprite(x, y, 'borders', 10)
						br.index = 10 
						br.setOrigin(0,0)
						container.add(br)
						
						corners[index(i, j)] = {
							tl: tl, bl: bl, tr: tr, br: br
						}
						
						let party = j+1
						let voter = scene.add.sprite(x, y, 'voters', 12*party + Math.abs(i+j)%12)
						
						container.add(voter)
						
						
						
						
					}
				}
				
				let mouse  = scene.add.sprite(-2*dx, dy, 'dots', 4)
				mouse.setScale(3)
				container.add(mouse)
				let duration = 200
				
				let tweens = [
					{
						targets: mouse,
						x: -1.5*dx,
						duration: duration,
					},
					{
						targets: mouse,
						x: -dx,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: dy/2,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: 0,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						x: -dx/2,
						duration: duration
					},
					{
						targets: mouse,
						x: 0,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(0,0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						x: 0.5*dx,
						duration: duration,
						
					},
					{
						targets: mouse,
						x: dx,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,1)]
							c.tl.setFrame(28-12)
							c.tr.setFrame(30-12)
							c.bl.setFrame(32-12)
							c.br.setFrame(34-12)
							
							c = corners[index(-1,0)]
							c.tl.setFrame(24-12)
							c.tr.setFrame(25-12)
							c.bl.setFrame(28-12)
							c.br.setFrame(35-12)
							
							c = corners[index(0,0)]
							c.tl.setFrame(25-12)
							c.tr.setFrame(26-12)
							c.bl.setFrame(33-12)
							c.br.setFrame(34-12)
							
							c = corners[index(1, 0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: 0.5*dy,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: dy,
						duration: duration,
						on_complete: function(){
							c = corners[index(1, 1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
						
					},
					{
						targets: mouse,
						x: 0.5*dx,
						duration: duration,
						
					},
					{
						targets: mouse,
						x: 0*dx,
						duration: duration,
						on_complete: function(){
							c = corners[index(0, 1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
						
					},
					{
						targets: mouse,
						y: 1.5*dy,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: 3*dy,
						duration: 5*duration,
						on_complete: function(){
							c = corners[index(1, 0)]
							c.tl.setFrame(24)
							c.tr.setFrame(26)
							c.bl.setFrame(28)
							c.br.setFrame(30)
							
							c = corners[index(1, 1)]
							c.tl.setFrame(31)
							c.tr.setFrame(30)
							c.bl.setFrame(33)
							c.br.setFrame(34)
							
							c = corners[index(0, 1)]
							c.tl.setFrame(24)
							c.tr.setFrame(25)
							c.bl.setFrame(32)
							c.br.setFrame(33)
						} 
						
					},
					{
						targets: mouse,
						on_complete: function(){
							container.destroy()
							anims['Majority'].create(scene)
						}
					}
					
				]
				
				tweens.forEach((tween, i) => {
			
					if(tweens[i+1]){
						tween.onComplete = function(){
							if(tween.on_complete){
								tween.on_complete()
							}
							scene.add.tween(tweens[i+1])
						}
					}
				})
				
				scene.add.tween(tweens[0])
			}
		},
		"Show Voters": {
			create: function(scene){
				for(let i = -1; i < 2; i+= 1){
					for(let j = 0; j < 2; j += 1){
						let s = 0.75 
						
						let dx = 280 /2
						let dy = 350 /2
			
						let x = scene.cameras.main.centerX + s*i*dx
						let y = 1.125*scene.cameras.main.centerY + s*j*dy
						let tl = scene.add.sprite(x, y, 'borders', 0)
						tl.setOrigin(1,1)
						tl.setScale(s)
						
						let tr = scene.add.sprite(x, y, 'borders', 2)
						tr.setOrigin(0,1)
						tr.setScale(s)
						
						let bl = scene.add.sprite(x, y, 'borders', 8)
						bl.setOrigin(1,0)
						bl.setScale(s)
						
						let br = scene.add.sprite(x, y, 'borders', 10)
						br.setOrigin(0,0)
						br.setScale(s)
						
						
						let party = j+1
						let voter = scene.add.sprite(x, y, 'voters', 12*party + Math.abs(i+j)%12)
						
						voter.setScale(s)
					}
				}
			}
		},
		"Click and Drag": {
			create: function(scene){
				let container = scene.add.container(scene.cameras.main.centerX, 1.125*scene.cameras.main.centerY)
				
				let index = (i, j) => 10*j + i
				container.setScale(0.75)
				
				let corners = {}
				
				
				let dx = 280 /2
				let dy = 350 /2
						
				for(let i = -1; i < 2; i+= 1){
					for(let j = 0; j < 2; j += 1){
						
						
			
						let x = i*dx
						let y = j*dy
						let tl = scene.add.sprite(x, y, 'borders', 0)
						tl.setOrigin(1,1)
						tl.index = 0 
						container.add(tl)
						
						
						let tr = scene.add.sprite(x, y, 'borders', 2)
						tr.index = 2
						tr.setOrigin(0,1)
						container.add(tr)
						
						let bl = scene.add.sprite(x, y, 'borders', 8)
						bl.index = 8
						bl.setOrigin(1,0)
						container.add(bl)
						
						let br = scene.add.sprite(x, y, 'borders', 10)
						br.index = 10 
						br.setOrigin(0,0)
						container.add(br)
						
						corners[index(i, j)] = {
							tl: tl, bl: bl, tr: tr, br: br
						}
						
						let party = j+1
						let voter = scene.add.sprite(x, y, 'voters', 12*party + Math.abs(i+j)%12)
						
						container.add(voter)
						
						
						
						
					}
				}
				
				let mouse  = scene.add.sprite(-2*dx, 0, 'dots', 4)
				mouse.setScale(3)
				container.add(mouse)
				let duration = 200
				
				let tweens = [
					{
						targets: mouse,
						x: -1.5*dx,
						duration: duration,
					},
					{
						targets: mouse,
						x: -dx,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(-1,0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						x: -dx/2,
						duration: duration,
						
					},
					{
						targets: mouse,
						x: 0,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(0,0)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: dy/2,
						duration: duration
					},
					{
						targets: mouse,
						y: dy,
						duration: duration,
						on_complete: ()=>{
							let c = corners[index(0,1)]
							c.tl.setFrame(c.tl.index + 36)
							c.tr.setFrame(c.tr.index + 36)
							c.bl.setFrame(c.bl.index + 36)
							c.br.setFrame(c.br.index + 36)
						}
					},
					{
						targets: mouse,
						y: 1.5*dy,
						duration: duration,
						
					},
					{
						targets: mouse,
						y: 5*dy,
						duration: 5*duration,
						on_complete: ()=>{
							let c = corners[index(-1,0)]
							c.tl.setFrame(12)
							c.tr.setFrame(13)
							c.bl.setFrame(20)
							c.br.setFrame(21)
							
							c = corners[index(0,0)]
							c.tl.setFrame(13)
							c.tr.setFrame(14)
							c.bl.setFrame(17)
							c.br.setFrame(18)
							
							c = corners[index(0,1)]
							c.tl.setFrame(16)
							c.tr.setFrame(18)
							c.bl.setFrame(20)
							c.br.setFrame(22)
						}
					},
					{
						targets: mouse,
						on_complete: function(){
							container.destroy()
							anims['Click and Drag'].create(scene)
						}
					}
					
				]
				
				tweens.forEach((tween, i) => {
			
					if(tweens[i+1]){
						tween.onComplete = function(){
							if(tween.on_complete){
								tween.on_complete()
							}
							scene.add.tween(tweens[i+1])
						}
					}
				})
				
				scene.add.tween(tweens[0])
			}
		},
	}
	
	function next(scene, guide){
		if(guide.next){
			scene.scene.start('tut', {
				//title: 'Test'
				title: guide.next
			})
		}else if(guide.play){
			let title 
			levels.titles.forEach(t => {
				if(!levels.lvls[t].locked){
					title = t 
				}
			})
			
			scene.scene.start('play', {title:title})
			
		}else{
			scene.scene.start('menu')
		}
	}
	
	window.tut = {
		init: function(data){
			this.data = data 
		},
		create: function(){
			let scene = this 
			let bg = this.add.sprite(0, 0, 'paper')
			bg.setOrigin(0, 0)
			let width = 2*this.cameras.main.centerX
			let height = 2*this.cameras.main.centerY
			let gerry = this.add.sprite(0, 0, 'gerry top')
			
			gerry.setOrigin(0)
			
			let guide = guides[this.data.title]
			
			let text = this.add.text(width/2, 350/2, guide.bubble, {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '15pt',
				align: 'center',
				fixedWidth: 0.75*width,
				wordWrap: {
					width: 0.75*width,
				}
			}) 
			text.setOrigin(0.5, 0)
			
			
			let con = this.add.sprite(0.775*width, 0.125*height, 'continue') 
			con.setScale(0.9)
			let dt = 3
			con.angle = -dt 
			
			this.add.tween({
				targets: con,
				angle: dt,
				duration: 1000,
				yoyo: true,
				repeat: -1,
				ease: 'Sine.easeInOut',
				
			})
			
			con.setOrigin(0.5, 0.5)
			
			con.setInteractive()
		
			con.on('pointerdown', function(){
				scene.sound.play('click')
				next(scene, guide)
				
			})
			
			con.on('pointerover', function(){
				scene.sound.play('tick')
				con.setScale(1)
			})
			
			con.on('pointerout', function(){
				con.setScale(0.9)
			})
			
			if(guide.anim){
				anims[guide.anim].create(this)
			}
			
		}
	}
	
	window.audio = {
		create: function(){
			
			this.sound.play('Haydn', {
				loop: true 
			})
			//this.sound.mute = true 
			let mute = this.add.text(this.cameras.main.centerX*2, 0, 'MUTE ', {
				fill: 'black',
				fontFamily: 'LinLib',
				fontSize: '30pt',
				
			})
			mute.setOrigin(1, 0)
			mute.alpha = 0.5 
			
			mute.setInteractive()
			scene = this 
			mute.on('pointerdown', function(){
				scene.sound.mute = !scene.sound.mute 
				
			})
			
			mute.on('pointerover', function(){
				mute.alpha = 1
			})
			
			mute.on('pointerout', function(){
				mute.alpha = 0.5
			})
		},
		update: function(){
			this.scene.bringToTop()
		}
		
	}
	
	window.menu = {
		create: function(){
			let bg = this.add.image(0, 0, 'paper')
			bg.setOrigin(0, 0)
			bg.setScrollFactor(0)
			
			levels.init(this)
			
			let cols = 6
			let rows = 3
			
			let cx = this.cameras.main.centerX
			let cy = this.cameras.main.centerY
			let dx = 2*cx/(cols)
			let dy = 2*cy/(rows)
			
			
			let i = 0
			let j = 0 
			
			let x0 = cx - dx*(cols-1)/2
			let y0 = cy - dy*(rows-1)/2
			
			
			levels.titles.forEach(title => {
				let x = x0 + i*dx 
				let y = y0 + j*dy 
				levels.thumb(this, x, y, title, (i+j)%2)
				
				i += 1 
				if(i >= cols){
					i = 0
					j += 1 
				}
			})
			
		}
	}
})()