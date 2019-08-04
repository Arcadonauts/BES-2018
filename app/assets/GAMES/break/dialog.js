(function(){

	window.dialog = {
	
		initialized: false,
		env: {},
		blocks: {},
		
		init: function(cache){
			if(this.initialized) return 
			
			this.env = {}
			this.blocks = {}
			let text = cache.text.get('dialog')
			
			this.interpret(text)
			
			this.initialized = true 
			
		},
		
		interpret: function(text){
			text = this.pre_process(text)
			//console.log(text)
			let tokens = this.tokenize(text)
			//console.log(tokens.slice())
			let tree = this.read_from_tokens(tokens.slice())
			//console.log(tree)
			this.eval(tree)
		},
		
		pre_process: function(text){
			return '{' +text.trim()+'}' 
		},
		
		tokenize: function(text){
			let special = ['{', '}', ':']
			let t = ''
			let tokens = []
			for(let i = 0; i < text.length; i++){
				let found = false 
				for(j = 0; j < special.length; j++){
					if(text[i] === special[j]){
						found = true 
					}
				}
				if(found){
					if(t.trim().length > 0){
						tokens.push(t.trim())
					}
					tokens.push(text[i])
					t = ''
				}else{
					t += text[i]
				}
			}
			if(t.trim().length > 0){
				tokens.push(t.trim())
			}
			
			return tokens 
		},
		
		read_from_tokens: function(tokens){
			if(tokens.length === 0){
				this.error('Unexpected EOF')
			}
			let token = tokens.shift()
			if(token === '{'){
				let branch = []
				while(tokens[0] != '}'){
					branch.push(this.read_from_tokens(tokens))
				}
			//	console.log(branch)
				tokens.shift()
				return branch 
			/*
			}else if(token === ':'){
				let branch = []
				while(tokens[0] != ':'){
					branch.push(this.read_from_tokens(tokens))
				}
				return branch
							
			*/
			}else if(token === ')'){
				this.error('Syntax Error: Unexpected "}"')
			}else{
				return token 
			}
		},
		text: function(s, opts, op, title, icon, close){
			s = s === undefined ? '' : s.replace('_', ' ')
			opts = opts || []
			
			let that = this
			return {
				text: s, 
				options: opts,
				act: op,
				icon: icon, 
				title: title,
				close: close || false,
				concat: function(t2){
					let op = that.text()
					op.text = this.text + t2.text 
					op.options = this.options.concat(t2.options)
					op.act = t2.act || this.act 
					op.icon = t2.icon || this.icon 
					op.title = t2.title || this.title 
					op.close = t2.close || this.close 
					return op 
				}
			}
		},
		option: function(text, go){
			return {
				text: text,
				go: go 
			}
		},
		eval: function(tree){
			if(tree === undefined || tree.length === 0){
				return this.text()
			}else if(tree[0] === ':'){
				if(tree[1] === 'SET'){
					let a = this.eval(tree[2]).text
					let b = this.eval(tree[3]).text
					this.env[a] = b
					return this.text().concat(this.eval(tree.slice(4)))
				}else if(tree[1] === 'GET'){
					let a = this.eval(tree[2]).text
					return this.text(this.env[a]).concat(this.eval(tree.slice(3)))
				}else if(tree[1] === 'BLOCK'){
					let a = this.eval(tree[2]).text
					let b = tree[3]
					this.blocks[a] = b 
					return this.text().concat(this.eval(tree[3])).concat(this.eval(tree.slice(4)))
				}else if(tree[1] === 'GOTO'){
					let a = this.eval(tree[2]).text
					return this.text().concat(this.eval(this.blocks[a]))
				}else if(tree[1] === 'OPT'){
					let opt = this.option(this.eval(tree[2]).text, this.eval(tree[3]).text)
					return this.text(undefined, [opt]).concat(this.eval(tree.slice(4)))
				}else if(tree[1] === 'ACT'){
					return this.text(undefined, undefined, this.eval(tree[2]).text).concat(this.eval(tree.slice(3)))
				}else if(tree[1] === 'EQUAL'){
					let a = this.eval(tree[2]).text
					let b = this.eval(tree[3]).text 
					//console.log('EQUAL', a, b)
					return this.text(''+(a===b)).concat(this.eval(tree.slice(4)))
				}else if(tree[1] === 'IF'){
					let a = this.eval(tree[2]).text 
					//console.log('IF', a)
		
					return this.eval(a === 'true' ? tree[3] : tree[4]).concat(this.eval(tree.slice(5)))
				}else if(tree[1] === 'ICON'){
					return this.text(undefined, undefined, undefined, undefined, this.eval(tree[2]).text).concat(this.eval(tree.slice(3)))
				}else if(tree[1] === 'TITLE'){
					return this.text(undefined, undefined, undefined, this.eval(tree[2]).text).concat(this.eval(tree.slice(3)))
				}else{
					this.error(tree[1] + ' not recognized')
				}
			}else{
				return this.text(tree[0]).concat(this.eval(tree.slice(1)))
			}
		},
		say: function(block){
			//console.log('block')
			return this.eval(this.blocks[block])
		},
		error: function(s){
			throw(s)
		}
		
	}
})()