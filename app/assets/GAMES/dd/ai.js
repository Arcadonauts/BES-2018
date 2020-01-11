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
			strat: strat
		}
		
		state.act(args)
	}
	
	function get_cells(grid, cond){
		let op = [] 
		for(let i = 0; i < grid.length; i++){
			for(let j = 0; j < grid[i].length; j++){
				if(cond(grid[i][j])){
					op.push(grid[i][j])
				}
			}
		}
		return op 
	}
	
	let strats = {
		get_highest_hp: function(args, highlighted, flavor){
			if(flavor === 'move'){
				let dist = (x, y) => Math.abs(x.row - y.row) + Math.abs(x.col - y.col)
				let tp = args.players.reduce((x,y) => !x || y.data.HP > x.data.HP ? y : x)
				let tc = highlighted.reduce((x,y) => !x || dist(x,tp.cell) > dist(y,tp.cell) ? y : x)
				tc.on_up()
				
			}else if(flavor === 'melee'){
				let cmp = (c1, c2) => {
					if(!c1){
						return c2 
					}else if(c1.occupied && c1.occupied.evil){
						return c2
					}else if(c1.occupied && !c1.occupied.evil){
						if(c2.occupied && !c2.occupied.evil){
							if(c1.occupied.data.HP > c2.occupied.data.HP){
								return c1 
							}else{
								return c2 
							}
						}else{
							return c1 
						}
					}else{
						if(c2.occupied && !c2.occupied.evil){
							return c2 
						}else{
							return c1 
						}
					}
				}
			
				let tc = highlighted.reduce(cmp)
				tc.on_up()
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
		
		},
		take_turn: function(){
			//this.scene.baddies.forEach(b => b.rest())
			let moves = get_legal_moves(this.scene.baddies, this.decks)
			//console.log('Moves: ', moves.length)
			if(moves.length){
				act(moves[0], this.scene, strats.get_highest_hp)
			}else{
				state.turn.end()
			}
		}
	}
})()