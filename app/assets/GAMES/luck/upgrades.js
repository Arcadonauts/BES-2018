
function shoot(scene, from, to, callback){
	let s = scene.add.sprite(from.x, from.y, 'particles', 4)
	s.x = from.x,
	s.y = from.y 
	scene.add.tween({
		targets: s,
		y: s.y - 100,
		duration: 400,
		ease: 'Quad.easeOut',
		onComplete: ()=>{
			scene.add.tween({
				targets: s,
				x: to.x, 
				y: to.y, 
				duration: 200,
				onComplete: ()=>{
					callback()
					s.destroy()
				}
			})
		}
	})
}


window.upgrades = {
	one : {
		label: "Add 1 to this roll",
		icon: 27,
	},
	money : {
		label: "Gain $100",
		active: true,
		cost: 1000,
		icon: 10,
		action: (n, play, scene, source) => {
			
			shoot(scene, source.container, {x:0, y: 300}, ()=> {
				play.player.getMoney(scene, 100)
			})
			
			
			
		}
	},
	attack : {
		label: "Add 1 to your attack",
		icon: 4,
		active: true,
		cost: 600,
		action: (n, play, scene, source) => {
			if(scene.holders && scene.holders.length > 3){
				let holder = scene.holders[5]
				shoot(scene, source.container, holder.container, ()=>{
					holder.bonus += 1
					holder.refresh()
				})
			}
		}
	},
	reroll : {
		label: "Increase your reroll",
		icon: 13,
		active: true,
		cost: 200,
		action: (n, play, scene, source) => {
			if(scene.powers){
				shoot(scene, source.container, scene.powers[0].container, ()=>{
					play.player.reroll.value += 1
					scene.powers[1].refresh()
				})
			}
		}
	},
	repair : {
		label: "Add 1 to your total HP",
		active: true,
		cost: 400,
		icon: 9,
		cost: 300,
		action: (n, play, scene, source) => {
		
			if(!play.player.bar) return 
			
			shoot(scene, source.container, play.player.bar.container, ()=>{
				play.player.diceRepair(1)
			})
		}
	},
	defend : {
		label: "Add 1 to your total defense",
		icon: 9,
		active: true,
		cost: 500,
		action: (n, play, scene, source) => {
			if(scene.holders && scene.holders.length > 3){
				let holder = scene.holders[3]
				shoot(scene, source.container, holder.container, ()=>{
					holder.bonus += 1
					holder.refresh()
				})
			}
		}
	},
	damage: {
		label: "Add 1 to your total damage",
		icon: 5,
		active: true,
		cost: 500,
		action: (n, play, scene, source) => {
			if(scene.holders && scene.holders.length > 3){
				let holder = scene.holders[4]
				shoot(scene, source.container, holder.container, ()=>{
					holder.bonus += 1
					holder.refresh()
				})
			}
		}
	},
	spy: {
		label: "Increase your spy",
		icon: 12,
		active: true,
		cost: 100,
		action: (n, play, scene, source) => {
			if(scene.powers){
				shoot(scene, source.container, scene.powers[0].container, ()=>{
					play.player.spy.value += 1
					scene.powers[0].refresh()
				})
			}
		}
	},
	none: {
		empty: true,
		icon: 31,
		label: "Buy upgrades in stores and drag them here to equip."
	}
	
}