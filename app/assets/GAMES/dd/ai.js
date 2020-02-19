(function(){
	
	function get_legal_moves(baddies, decks){
		let moves = []
		baddies.forEach((b, i) => {
			decks[i].forEach(c => {
				if(c.data.COST <= b.data.STA){
					moves.push({
						card: c,
						baddie: b 
					})
				}
			})
		})
		Phaser.Math.RND.shuffle(moves)
		return moves 
	}
	
	function make_strat(target){
		//this.args.strat(this.args, tiles, this.eff.flavor)
		
		function dist(t1, t2){
			let dx = t1.x - t2.x 
			let dy = t1.y - t2.y 
			
			if(isNaN(dx) || isNaN(dy)){
				console.warn('Bad tiles', t1, t2)
			}
			
			return Math.abs(dx) + Math.abs(dy)
		}
		
		return function(args, tiles, flavor, execute){
			//console.log('target:', target)
			if(flavor === 'move'){
				tiles = tiles.filter(t => t.layer.name === 'ground')
				tiles.sort((t1, t2) => {
					//return args.grid.get_path(t2, target).length - args.grid.get_path(t1, target).length
					return dist(t1, target) - dist(t2, target)
				})
				console.log('tiles:', tiles)
				console.log('target:', target)
				execute(args.grid.get_tiles_from_tile(tiles[0]))
			}else if(flavor === 'melee' || flavor === 'range'){
				let found = false 
				tiles.forEach(t => {
					if(t === target){
						execute(args.grid.get_tiles_from_tile(t))
						found = true 
					}
				})
				if(!found){
					console.warn('Could not find target', target, tiles)
					execute(args.grid.get_tiles_from_tile(tiles[0]))
				}
			}
			
			
		}
	}
	
	function stategize(scene, bad, card, strat){
		let flavors = {}
		let i = 1 
		
		function rangeable(t0, dx, dy){
			if(dx === undefined && dy === undefined){
				return [rangeable(t0, 1, 0), rangeable(t0, -1, 0), rangeable(t0, 0, 1), rangeable(t0, 0, -1)].filter(x => x)
			}else{
				let t = scene.grid.get_tiles_from_tile(t0)
				t = scene.grid.get_rel_tiles(t.ground, dx, dy)
				if(!t || !t.ground) return 
				
				let tf = t 
				do{
					tf = t 
					t = scene.grid.get_rel_tiles(t.ground, dx, dy)
				}while(t && t.ground && !tf.occupied)
				
				if(tf.occupied){
					return tf.ground
				}else{
					return undefined
				}
			}
		}
		
		function damage(tile, atks){
			if(atks[0] === 'DAM'){
				dam = 0
				atks.slice(1).forEach(a => {
					if(a[0] === 'D'){
						dam += 3.5 // avg(1, 2, 3, 4, 5, 6)
					}else{
						dam += (+a)
					}
				})
				return dam 
			}else if(atks[0] === 'TGL'){
				let already = !! scene.grid.get_tiles_from_tile(tile).entangled
				return already ? -5 : 5
			}else if(atks[0] === 'TOX'){
				return 5 
			}
		}
		
		while(card['effect' + i]){
			let eff = card['effect' + i]
			flavors[eff.flavor] = {} 
			if(eff.distance){
				flavors[eff.flavor].distance = eff.distance	
			}
			if(eff.damage){
				flavors[eff.flavor].damage = eff.damage 
			}
			
			i += 1
		}
		//console.log('flavors', flavors)
		let t0 = bad.get_ground()
		let reachable = []
		if(flavors.move){
			reachable = scene.grid.get_all_tiles_that(t => scene.grid.get_path(t0, t).length <= flavors.move.distance+1).filter(t => t.layer.name === 'ground')
		}
		reachable.push(t0)
		
		let attackable = []
		if(flavors.melee){
			reachable.forEach(tile => {
				//console.log('tile', tile)
				scene.grid.get_neighbors(tile, true).forEach(t => {
					if(t !== t0 && scene.grid.get_tiles_from_tile(t).occupied){ // && attackable.indexOf(t) === -1){
						attackable.push({
							target: t,
							damage: damage(t, flavors.melee.damage)+1,
							flavor: 'melee'
						})
					}
				})
			})
		}
		
		if(flavors.range){
			reachable.forEach(tile => {
				//console.log('tile', tile)
				 rangeable(tile).forEach(t => {
					if(t !== t0 && scene.grid.get_tiles_from_tile(t).occupied){ // && attackable.indexOf(t) === -1){
						attackable.push({
							target: t,
							damage: damage(t, flavors.range.damage)+2,
							flavor: 'range'
						})
					}
				})
			})
		}
		
		//console.log('Reachable:', reachable.length)
		//console.log('Attackable:', attackable.length)
		
		let attacks = []
		scene.players.forEach(p => {
			let t = p.get_ground()
			attackable.forEach(opt => {
				if(!p.evil && opt.target === t && opt.damage > 0){
					opt.player = p 
					attacks.push(opt)
				}
			})
		})
		
		//console.log('Attacks:', attacks.length)
		if(attacks.length > 0){
			attacks.sort((a1, a2) => strat(a1.player, a2.player))
			let best = attacks[0]
			//console.log('best', best)
			return {
				flavor: best.flavor,
				score: best.damage,
				target: best.target,
				card: card,
				baddie: bad ,
				strat: make_strat(best.target)
			}
		}else{
			let players = scene.players.slice(0)
			players.sort(strat)
			let target = players[0].get_ground()
			let score = flavors.melee || flavors.range || scene.grid.get_tiles_from_tile(bad.get_ground()).entangled ? -5 : 0
			//console.log('Move target:', target)
			return {
				flavor: 'move',
				score: score,
				target: target,
				card: card,
				baddie: bad,
				strat: make_strat(target)
			}
		}
		
		
	}
	
	function act(move, scene, strat){
		let args = {
			hand: scene.cardtainers.map(x => x.card),
			players: scene.players,
			baddies: scene.baddies,
			scene: scene,
			grid: scene.grid,
			card: move.card,
			player: move.baddie,
			strat: strat,
			pointer: {},
		}
		
		state.act(args)
	}
	
	let strats = {
		go: function(scene, decks){
			let acts = []
			//console.log(decks)
			scene.baddies.forEach((bad, i) => {
				let ai = this.ais[bad.name] || this.ais['simple']
				
				acts = acts.concat(ai(scene, bad, decks.find(d => d[i] && d[i].who === bad.name)))
		
				
			})
			return acts 
		},
		ais: {
			simple: function(scene, bad, deck){
				//console.log(bad, deck)
				let strats = []
				if(deck){
					deck.filter(card => card.data.COST <= bad.stamina).forEach(card => {
						//console.log(bad.name, 'has', card)
						let strat = stategize(scene, bad, card, (p1, p2) => p1.data.HP - p2.data.HP)
						strats.push(strat)
						//console.log(strat)
					})
					strats = strats.filter(s => s.score >= 0)
				}
				console.log(bad.name, 'has', strats, 'options')
				
				
				return strats  
			}
		
		}

	}
	
	window.ai = {
		
		init: function(scene){
			this.scene = scene 
			this.decks = []
			scene.baddies.forEach((b, i) => {
				this.decks[i] = b.deck.map(card_name => state.make.card(card_name, b, scene))
			})
			this.max_turns = 2
			this.remaining_turns = this.max_turns 
		
		},
		take_turn: function(){
			//this.scene.baddies.forEach(b => b.rest())
			let acts = strats.go(this.scene, this.decks)
			acts.sort((a1, a2) => a2.score - a1.score)
			
			console.log('AI has', acts.length, 'option(s) and ', this.remaining_turns, 'turns')
			if(acts.length && this.remaining_turns > 0){
				let sel = acts[0] //Phaser.Math.RND.pick(acts)
				act({
					card: sel.card,
					baddie: sel.baddie,
				}, this.scene, sel.strat)
				this.remaining_turns -= 1
			}else{
				this.remaining_turns = this.max_turns 
				state.turn.end()
			}
			
			
			
		}
	}
})()