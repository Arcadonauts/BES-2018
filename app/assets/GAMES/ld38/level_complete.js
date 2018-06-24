window.level_complete = (function(){
	function hittest(a, b, r){
		var dx = a.x - b.x ;
		var dy = a.y - b.y ;

		return dx*dx + dy*dy < r*r; 
	}

	function mod(x, y){ return (x % y + y) % y;};

	function make_button(dir){
		// All of this code is crap.
		var compass = ['east', 'south', 'west', 'north'][dir]; // I haven't a clue about why south and north are switched...
		var but = lc.buttons.create(lc.world.x, lc.world.y, 'button_' + compass);
		but.anchor.set(0.5);
		but.dir = dir ;
		but.fixedToCamera = true 
		// Beware all who enter here
		but.dir_angle = [0, Math.PI/2, -Math.PI, -Math.PI/2][dir]
		but.down_sound = game.add.sound('select')
		but.over_sound = game.add.sound('over')

		but.update = function(){
			this.frame = 2 ;
			if(hittest(lc.mouse, this, this.width/2)){
				// http://stackoverflow.com/questions/1878907/the-smallest-difference-between-2-angles
				var theta = Math.atan2(lc.mouse.y - this.y, lc.mouse.x - this.x);
				var a = this.dir_angle - theta ;
				a = mod(a + Math.PI,  2*Math.PI) - Math.PI ;
				
				if(Math.abs(a) < Math.PI/4){
					if(lc.mouse.down){
						this.frame = 1 ;
						this.down_sound.play()
						game.state.start('upgrades', true, false, this.dir, lc.old_tech, lc.level);
					}else{
						if(this.down){
							
							//game.state.start('upgrades', true, false, this.dir, lc.old_tech, lc.level);
						}
						if(!this.over){
							this.over = true 
							this.over_sound.play()
						}
						this.frame = 0;


					}
					
				}else{
					this.over = false 
				}
				this.down = lc.mouse.down; 
			}else{
				this.over = false 
			}
		};
	}

	var tech = {
		xp_boost: ['shield', 4],
		tripple_shot: ['launcher', 4],
		health_boost: ['shield', 3],
		reflector: ['shield', 5],
		double_shot: ['launcher', 2],
		shot_gun: ['launcher', 6],
		shield: ['shield', 0],
		cannon: ['launcher', 0],
		double_shield: ['shield', 1],
		laser: ['launcher', 8],
		tripple_shield: ['shield', 2],
		rainbow_shield: ['shield', 6],
		big_boom: ['launcher', 10],
		explode_shot: ['launcher', 12],
	};

	function make_tech(name, dir){
		console.log(dir + ' ' + tech[name][0])
		var x = [1, 0, -1, 0][dir];
		var y = [0, 1, 0, -1][dir];
		var sprite = game.add.sprite(256*x, 256*y, tech[name][0])
		sprite.frame = tech[name][1]
		sprite.anchor.set(.5)
		sprite.angle = 90*dir;

		if(tech[name][0] === 'shield'){
			var ratio = sprite.width/sprite.height;
			sprite.height = lc.world.height;
			sprite.width = ratio*(sprite.height)
		}
		return sprite 
	}

	function make_world(old_tech){
		var sprite = game.add.sprite(500, 300, 'world');
		sprite.anchor.set(0.5);
		sprite.width = 128;
		sprite.height = sprite.width ;

		for(var i = 0; i < old_tech.length; i++){
			if(old_tech[i] !== 'root'){
				sprite.addChild(make_tech(old_tech[i], i))
			}
		}

		return sprite 
	}

	var lc = {
		init: function(old_tech, level){
			this.old_tech = old_tech
			this.level = level 
		},
		create: function(){
			var offset = 20
			var bg = game.add.sprite(-offset, -offset, 'level_complete_bg');

			this.world = make_world(this.old_tech)

			this.buttons = game.add.group();
			for(i = 0; i < 4; i++){
				make_button(i);
			}

			this.mouse = {};

			game.add.sound('level_up').play()


		},
		update: function(){
			this.mouse.down = game.input.activePointer.leftButton.isDown; //&& game.input.activePointer.x < 448
			this.mouse.x = game.input.activePointer.x;
			this.mouse.y = game.input.activePointer.y ;
		}
	}

	return lc

})()