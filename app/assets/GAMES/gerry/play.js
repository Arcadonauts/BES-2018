(function(){

	function make_voter(x, y, str){
		let party = {
			x:0,
			o:12,
			_:24,
			'?':36
		}
		
		let c = this.add.container(x, y)
		
		c.card = this.add.sprite(0, 0, 'cards')
		c.card.id = Math.floor(2*Math.random())
		//c.card.setFrame(c.card.id)
		c.add(c.card)
		
		c.voter = this.add.sprite(0, 0, 'voters')
		c.voter.id = Math.floor(12*Math.random())
		
		c.voter.party = party[str[0]]
		console.log(str, c.voter.party)
		c.voter.setFrame(c.voter.party + c.voter.id)
		c.add(c.voter)
		
		return c 
	}

	let levels = {
		lvls: {},
		titles: [],
		load: function(scene){
			this.string = scene.cache.text.entries.entries['levels']
		},
		process: function(){
			const re = {
				title: /^\@title\((.+)\)$/,
				size: /^\@size\((\d+)\)$/,
				end: /@end/
			}
			const WAIT = 'wait';
			const GO = 'go'
			let lines = this.string.split('\n').map(x => x.trim())
			let mode = WAIT
			let lvl
			lines.forEach(line => {
				if(mode === WAIT){
					if(line === '@start'){
						mode = GO 
						lvl = {rows:[]}
					}
				}else if(mode === GO){
					if(line.match(re.end)){
						this.lvls[lvl.title] = lvl 
						this.titles.push(lvl.title)
						lvl = undefined
						mode = WAIT
					}else if(line.match(re.title)){
						let match = line.match(re.title)
						lvl['title'] = match[1]
					}else if(line.match(re.size)){
						let match = line.match(re.size)
						lvl['size'] = +match[1]
					}else if(line.length > 0){
						lvl.rows.push(line.split(/\s/).filter(x => x.length))
					}
				}
			})
			console.log(this.lvls)
		},
		check: function(){
			this.titles.forEach(title => {
				let lvl = this.lvls[title]
				
				if(lvl.rows.length === 0){
					throw(title + " has no rows")
				}
				let cols = undefined
				lvl.rows.forEach(row => {
					if(cols === undefined){
						cols = row.length 
					}else{
						if(cols !== row.length){
							throw(title + ' rows are different lengths')
						}
					}
				})
				if(cols === 0){
					throw(title + " has a row with zero entries")
				}
				if(!lvl.size){
					throw(title + ' size undefined')
				}
				if(!lvl.title){
					throw(title + ' title undefined')
				}
				
				
			})
		},
		populate: function(){
			this.titles.forEach(title => {
				let lvl = this.lvls[title]
				lvl.pop = 0 
				lvl.rows.forEach(row => {
					row.forEach(str => {
						lvl.pop += str.length
					})
				})
				lvl.count = Math.floor(lvl.pop/lvl.size)
				if(lvl.count * lvl.size !== lvl.pop){
					throw(title + ' population is not a multiple of its size')
				}
			})
		},
		init: function(scene){
			this.load(scene)
			this.process()
			this.check()
			this.populate()
			this.init = ()=>{console.log('levels loaded')}
		},
		create: function(scene){
			let lvl = this.lvls[scene.data.title]
			if(!lvl){
				throw(scene.data.title + ' not found')
			}
			let x0 = 500
			let y0 = 200 
			let dx = 300 
			let dy = 350 
			lvl.rows.forEach((row, y) => {
				row.forEach((str, x) => {
					make_voter.call(scene, x0 + dx*x, y0 + dy*y, str)
				})
			})
		}
		
	}

	window.play = {
		init: function(data){
			this.data = data
		},
		create: function(){
			//console.log(this)
			levels.init(this)
			this.voters = levels.create(this)
			
		}
	}
})()