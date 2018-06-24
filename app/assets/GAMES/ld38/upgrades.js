window.upgrades = (function(){

	window. tree = {
		name: 'root',
		son: {
			name: 'shield',
			son: {
				name: 'reflector',
				son: {
					name: 'health_boost'
				},
				daughter: {
					name: 'xp_boost' 
				}
			},
			daughter: {
				name: 'double_shield',
				son: {
					name: 'tripple_shield'
				},
				daughter: {
					name: 'rainbow_shield'
				}
			}
		},
		daughter: {
			name: 'cannon', 
			son: {
				name: 'double_shot',
				son: {
					name: 'shot_gun' 
				},
				daughter: {
					name: 'tripple_shot'
				}
			},
			daughter: {
				name: 'laser',
				son: {
					name: 'explode_shot'
				},
				daughter: {
					name: 'big_boom' 
				}
			}
		}		
	}

	var descriptions = {
		xp_boost: 10,
		tripple_shot: 'Fire three shots at once.',
		health_boost: 'You will recover some health every time you take a hit.',
		reflector: 'Your shield will fire a shot every time it takes a hit.',
		double_shot: 'Fire two shots at once.',
		shot_gun: 'Fire a spread of shots with low range.',
		shield: 'Block a single hit.',
		cannon: 'Fire a laser.',
		double_shield: 'Take two hits before your shield has to recharge.',
		laser: 'Fast firing laser cannon',
		tripple_shield: 'Take three hits before your shield has to recharge',
		rainbow_shield: "I'm not sure what this does.",
		big_boom: 'Go big, or go home.',
		explode_shot: 'Explodes on impact'
	}
 
	function pos(key){
		var n = {
			xp_boost: 10,
			tripple_shot: 20,
			health_boost: 01,
			reflector: 11,
			double_shot: 21,
			shot_gun: 31,
			shield: 12,
			cannon: 22,
			double_shield: 13,
			laser: 23,
			tripple_shield: 14,
			rainbow_shield: 03,
			big_boom: 24,
			explode_shot: 33
		}[key]

		if(n === undefined) return n 

		return {x: Math.floor(n/10), y: n - 10*Math.floor(n/10)}
	}
	
	function in_branch(name, branch){
		if(branch === undefined){
			return false 
		}else{
			return branch.name === name || in_branch(name, branch.son) || in_branch(name, branch.daughter)
		}
		
	}

	function button_callback(name){
		return function(){
			upgrades.old_tech[upgrades.dir] = name 
			game.state.start('play', true, false, upgrades.old_tech, upgrades.level+1)
		}
		

	}

	function describe(name){
		return function(){
			clear()
			var style = { font: "bold 16px Arial", fill: "#fff", align: 'center', boundsAlignH: "center", boundsAlignV: "middle" };
			var text = game.add.text(10, 360, name.toUpperCase().replace('_', ' '), style);
			upgrades.message.add(text)

			var text = game.add.text(10, 400, descriptions[name], style);
			upgrades.message.add(text)
		}
		
	}

	function clear(){
		for(var i = upgrades.message.children.length-1; i >= 0; i--){
			upgrades.message.children[i].destroy()
		}
	}



	function draw(branch, x0, y0, xscale, yscale, name, status){
		/*
		name: 'string'
		status:
			-1: impossible
			0: current
			1: active
			2+: future 
		*/
		if(status === undefined){
			if(branch.name === name){
				status = 0 
			}else if(!in_branch(name, branch)){
				status = -1
			}
		}

		var place = pos(branch.name)
		if(place){
			if(status === 1){
				var but = game.add.button(x0 + xscale*place.x, y0 + yscale*place.y, 'upgrade_button', button_callback(branch.name), this, 1, 3, 2, 1)
				but.setOverSound(game.add.sound('over'))
				but.setDownSound(game.add.sound('select'))
			}else{
				var but = game.add.button(x0 + xscale*place.x, y0 + yscale*place.y, 'upgrade_button', function(){}, this, 0, 0, 0, 0)
			}

			but.anchor.set(.5, .5)
			but.onInputOver.add(describe(branch.name))
			but.onInputOut.add(clear)

			if(status > -1){
				var style = { font: "bold 16px Arial", fill: "#fff", align: 'center', boundsAlignH: "center", boundsAlignV: "middle" };

   		 		var text = game.add.text(0, 4, branch.name.toUpperCase().replace('_', '\n'), style);
   		 		if(status > 1){
   		 			but.alpha = .35
					text.alpha = .35 
   		 		}
				
				text.anchor.set(.5, .5)
   		 		but.addChild(text)

			}else{
				but.alpha = .1
			}



   		 	   		
		}
		if(branch.son){
			draw(branch.son, x0, y0, xscale, yscale, name, status >= 0 ? status+1 : status)
		}
		if(branch.daughter){
			draw(branch.daughter, x0, y0, xscale, yscale, name, status >= 0 ? status+1 : status)
		}
	} // 98 x 48


	var upgrades = {
		init: function(dir, tech, level){
			this.dir = dir
			this.old_tech = tech
			this.level = level 
		},
		create: function(){
			var bg = game.add.sprite(0, 0, 'upgrade_bg')
			draw(tree, 100, 50, 145, 70, this.old_tech[this.dir])
			var fg = game.add.sprite(0, 0, 'upgrade_fg')
			this.message = game.add.group()

			this.dir_but = game.add.button(550, 370, 'world_hud', function(){
				game.state.start('upgrades', true, false, (upgrades.dir + 1)%4, upgrades.old_tech, upgrades.level);
			})
			this.dir_but.anchor.set(.5)
			this.dir_but.angle = this.dir*90
			this.dir_but.setOverSound(game.add.sound('over'))
			this.dir_but.setDownSound(game.add.sound('select'))


			this.skip = game.add.button(game.width, 0, 'skip_button', function(){
				game.state.start('play', true, false, upgrades.old_tech, upgrades.level+1)
			}, this, 1, 0, 2)
			this.skip.anchor.set(1, 0)
		}
	}

	return upgrades 
})()