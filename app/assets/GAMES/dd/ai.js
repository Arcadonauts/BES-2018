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
		go: function(baddies, decks){
			let acts = []
			baddies.forEach((bad, i) => {
				let ai = bad.ai || 'simple'
				acts.push(this[ai](bad, decks[i]))
			})
		},
		simple: function(bad, deck){
			//console.log(bad, deck)
		}

	}
	
	window.ai = {
		
		init: function(scene){
			this.scene = scene 
			this.decks = []
			scene.baddies.forEach((b, i) => {
				this.decks[i] = b.deck.map(card_name => state.make.card(card_name, b, scene))
			})
		
		},
		take_turn: function(){
			//this.scene.baddies.forEach(b => b.rest())
			strats.go(this.scene.baddies, this.decks)
			
			state.turn.end()
		}
	}
})()