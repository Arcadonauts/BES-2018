window.play = (function(){

	function none(){}

	function mod(x, y){ return (x % y + y) % y;};

	function hittest(a, b, r){
		var dx = a.x - b.x ;
		var dy = a.y - b.y ;

		return dx*dx + dy*dy < r*r; 
	}

	function collide(group_a, group_b, resolve){
		var a, b; 
		for(var i = group_a.children.length - 1; i >= 0; i--){
			for(var j = group_b.children.length - 1; j >= 0; j--){
				a = group_a.children[i];
				b = group_b.children[j];
				if(a && b && hittest(a, b, (a.height + b.height)/2)){
					resolve(a, b);
				}
			}
		}
	}

	

	function lookup(value, dict){
		for(var key in dict){
			if(dict.hasOwnProperty(key)){
				if(dict[key] === value){
					return key ;
				}
			}
		}
	}

	var audio = {
		sounds: {},
		init: function(){
			var sounds = ['coin', 'big_explosion', 'explosion', 'low_laser', 'med_explosion', 'med_laser', 'shield_down', 'shield_up']
			for(var i = 0; i < sounds.length; i++){
				this.sounds[sounds[i]] = game.add.sound(sounds[i]) 
			}
		},
		play: function(string){
			if(this.sounds[string]){
				this.sounds[string].play()
			}else{
				console.log(this.sounds)
				console.log(string)
			}
			
		}
	}

	function make_bar(value){
		var color = {
			'health': 'red',
			'currency': 'blue',
		}[value];

		var onfull = {
			health: none,
			currency: function(){
				play.level_up = true ;
			}
		}

		var onempty = {
			health: function(){
				play.game_over = true;
				audio.play('big_explosion')
			},
			currency: none
		}

		var x = game.height;
		var y = {
			health: 40,
			currency: 128
		}[value];

		var empty = play.bars.create(x, y, 'empty');
		empty.fixedToCamera = true 
		color = game.add.sprite(17, 0, 'bar_' + color);
		color.anchor.set(17/192, 0);
		color.width = color.width*play.world[value]/play.world['max_' + value];
		var sprite = game.add.sprite(0, 0, 'bar_outline');
		empty.addChild(color);
		empty.addChild(sprite);
		empty.color = color ;
		empty.outline = sprite ;
		empty.value = value ;
		empty.onfull = onfull[value]
		empty.onempty = onempty[value]

		empty.update = function(){
			var w = play.world[this.value]/play.world['max_' + this.value];
			
			var diff = this.color.width - w * this.outline.width;
			if(Math.abs(diff) < 2){
				this.color.width = w*this.outline.width ;
			}else{
				this.color.width -= 0.1 * diff ;
			}

			if(w >= 0.99 && Math.abs(diff) < 2){
				this.onfull()
			}else if(w <= 0.01 && Math.abs(diff) < 2){
				this.onempty()
			}	


		};

	}

	function make_dot(parent){
		var sprite = play.dots.create(parent.x, parent.y, 'dots');
		sprite.anchor.set(0.5);
		sprite.frame = Math.floor((sprite.animations.frameTotal-1)*Math.random());

		var v = 0.75 + 0.5*Math.random();
		var theta = Math.random() * Math.PI * 2 ;

		sprite.vx = v*Math.cos(theta);
		sprite.vy = v*Math.sin(theta);
		sprite.max_v = 2*v ;

		sprite.update = function(){
			var angle = Math.atan2(this.y - play.world.y, this.x - play.world.x);

			var g = -0.1 ;
			var ax = g*Math.cos(angle);
			var ay = g*Math.sin(angle);

			this.vx += ax ;
			this.vy += ay ;

			this.vx = Math.min(this.vx, this.max_v);
			this.vy = Math.min(this.vy, this.max_v);

			var fr = 0.99;
			this.vx *= fr ;
			this.vy *= fr ;

			this.x += this.vx ;
			this.y += this.vy ;

			if(hittest(this, play.world, play.world.width/4)){
				this.destroy();
				play.world.currency += 1;
				audio.play('coin')
			}


		};
	}

	/* **WORLD**
                                                                           
  //       //      //////         //////         //             /////      
 //       //      //  //         //  //         //             //   //     
//  ///  //      //  //         //////         //             //   //      
//// ////       //  //         // //          //             //   //       
//   //        //////         //  //         //////         /////          

*/

	function make_health_packet(baddie){
		var sprite = play.dots.create(baddie.x, baddie.y, 'health')
		sprite.dangle = Math.random()*360
		sprite.anchor.set(.5)
		sprite.frame = Math.floor(Math.random()*8)
		sprite.width = sprite.height = 4 + 8*Math.random()
		var theta = Math.atan2(baddie.vy, baddie.vx) + Math.PI 
		var dt = (2*Math.random() - 1)*Math.PI/2

		var v = 2 + 2*Math.random()
		sprite.age = 50*Math.random()
		sprite.t = 0 
		sprite.vx = v*Math.cos(theta + dt)
		sprite.vy = v*Math.sin(theta + dt)

		sprite.update = function(){
			this.angle += this.dangle 
			this.t += 1 
			if(this.t > this.age){
				this.destroy()
			}
			this.x += this.vx 
			this.y += this.vy 
		}

		return sprite 
	}

	function make_world(tech){
		var sprite = game.add.sprite(game.height/2, game.height/2, 'world');
		sprite.anchor.set(0.5);
		sprite.width = 128;
		sprite.height = sprite.width ;

		sprite.rot_vel = 0.005;

		sprite.explode = function(baddie){
			this.health -= baddie.damage;
			for(var i = 0; i < baddie.damage; i+=1){
				make_health_packet(baddie)
			}
			audio.play('med_explosion')


		}

		sprite.update = function(){
			
			var fire = play.mouse.down && play.mouse.x < game.height;
			this.children.forEach(function(child){
				child.update();
			});

			var rot_vel = this.rot_vel;
			if(fire){
				
				if(hittest(play.mouse, this, this.height/2)){
					this.children.forEach(function(child){
						child.fire();
					});
					this.has_fired = true 
				}else{
					rot_vel *= 10;
					if(this.has_fired){
						this.has_rotated = true 
					}
				}

				
			}

			if(this.currency >= this.max_currency){
				this.currency = this.max_currency;


				
			}

			this.health = Math.min(this.health, this.max_health)

			this.rotation += rot_vel;
		};
		sprite.health = 100 ;
		sprite.max_health = 100;

		sprite.currency = 0;
		sprite.max_currency = leveler.max_currency();

		for(var i = 0; i < tech.length; i++){
			sprite.addChild(tech[i](i))
		}
		/*
		sprite.addChild(zero(0));
		sprite.addChild(one(1));
		sprite.addChild(two(2));
		sprite.addChild(three(3));
		*/

		sprite.projectiles = game.add.group();

		return sprite ;
	}

var tech = {
		root: make_empty,
		xp_boost: make_xp_boost_shield,
		tripple_shot: make_tripple_cannon,
		health_boost: make_health_boost_shield,
		reflector: make_reflection_shield,
		double_shot: make_double_cannon,
		shot_gun: make_shotgun,
		shield: make_shield,
		cannon: make_launcher,
		double_shield: make_double_shield,
		laser: make_laser_cannon,
		tripple_shield: make_tripple_shield,
		rainbow_shield: make_rainbow_shield,
		big_boom: make_big_boom_shot,
		explode_shot: make_explode_shot,
	};

	function make_clock(){
		var sprite = game.add.sprite(-32, 0, 'clock')
		sprite.anchor.set(.5)
		sprite.scale.set(4)
		sprite.set = function(t, max){
			if(t >= max){
				this.alpha = 0
			}else{
				
				var frame = Math.floor((t/max)*8)
				this.frame = frame
				this.alpha = 1
			}

		}

		return sprite 
	}

	/* **SHIELDS**
                                                                                                         
    /////          //  //         //////         //////         //             /////          /////      
   //             //  //           //           //             //             //   //        //          
  /////          //////           //           ////           //             //   //        /////        
    //          //  //           //           //             //             //   //           //         
/////          //  //         //////         //////         //////         /////          /////          

*/

	function make_shield(dir){
		var x = [1, 0, -1, 0][dir];
		var y = [0, 1, 0, -1][dir];
		 
		var sprite =  game.add.sprite(x*256, y*256, 'shield');
		sprite.angle = 90*dir;
		sprite.anchor.set(0.5);
		sprite.dir = dir ; 
		sprite.max_cooldown = 25;
		sprite.cooldown = 25 ;

		sprite.clock = make_clock()
		sprite.addChild(sprite.clock)

		var ratio = sprite.width/sprite.height;
		sprite.height = play.world.height;
		sprite.width = ratio*(sprite.height )

		sprite.fire = none 
		sprite.deflect = function(){
			audio.play('shield_down')
			this.cooldown = 25*Math.floor(this.cooldown/25) - 25
		} 

		sprite.get_frame = function(){
			return  Math.floor(this.cooldown/25) - 1
		}
		
		sprite.update = function(){
			this.clock.set(this.cooldown, this.max_cooldown)
			if(this.cooldown < 25){
				if(this.frame !== 7){
					//audio.play('shield_down')
				}
				this.frame = 7 
			}else{
				if(this.frame === 7){
					audio.play('shield_up')
				}
				this.frame = this.get_frame()
				for(var i = play.enemies.children.length - 1; i >= 0; i--){
					if(hittest(play.world, play.enemies.children[i], 0.9*play.world.width)){
						var alpha = Math.atan2(this.world.y - play.world.y, this.world.x - play.world.x);
						var beta = Math.atan2(play.enemies.children[i].world.y - play.world.y, play.enemies.children[i].world.x - play.world.x);
						var a = alpha - beta ;
						a = mod(a + Math.PI,  2*Math.PI) - Math.PI ;
						
						if(Math.abs(a) < Math.PI/4){
							play.enemies.children[i].destroy()
							this.deflect()
						}
					}
				}
			}
			
			this.cooldown = Math.min(this.cooldown + .08, this.max_cooldown)
		};

		return sprite;
	}

	function make_double_shield(dir){
		var sprite = make_shield(dir)
		sprite.cooldown = sprite.max_cooldown = 50

		return sprite 
	}

	function make_tripple_shield(dir){
		var sprite = make_shield(dir)
		sprite.cooldown = sprite.max_cooldown = 75

		return sprite 
	}

	function make_reflection_shield(dir){
		var sprite = make_shield(dir)
		sprite.deflect = function(){
			this.cooldown = 0 
			audio.play('shield_down')
			make_laser(this.world, dir)
		}	

		sprite.get_frame = function(){
			return 5
		}

		return sprite 
	}

	function make_xp_boost_shield(dir){
		var sprite = make_shield(dir)
		sprite.deflect = function(){
			audio.play('shield_down')
			this.cooldown = 0 
			play.world.currency += 20 
		}
		sprite.get_frame = function(){
			return 4
		}

		return sprite 
	}

	function make_health_boost_shield(dir){
		var sprite = make_shield(dir)
		sprite.deflect = function(){
			audio.play('shield_down')
			this.cooldown = 0 
			play.world.health += 10 
		}
		sprite.get_frame = function(){
			return 3
		}

		return sprite 
	}

	function make_rainbow_shield(dir){

		var sprite = make_shield(dir)
		sprite.deflect = function(){
			audio.play('shield_down')
			this.cooldown = 0 

		}
		sprite.get_frame = function(){
			return 6
		}

		return sprite 
	}

	/* **WEAPONS**
                                                                                                         
  //       //      //////         ////           //////         //////         //  //         /////      
 //       //      //             // //          //  //         //  //         /// //         //          
//  ///  //      ////           //  //         //////         //  //         //////         /////        
//// ////       //             ///////        //             //  //         // ///            //         
//   //        //////         //    //       //             //////         //  //         /////          

*/

	

	function make_empty(dir){
		var sprite =  game.add.sprite(game.height/2, game.height/2, 'empty');
		sprite.fire = none ;

		return sprite;
	}

	function make_launcher(dir){
		console.log(dir + ' launcher')
		var x = [1, 0, -1, 0][dir];
		var y = [0, 1, 0, -1][dir];
		 
		var sprite =  game.add.sprite(x*256, y*256, 'launcher');
		sprite.angle = 90*dir;
		sprite.anchor.set(0.5);
		sprite.dir = dir ;
		sprite.max_cooldown = 50;
		sprite.cooldown = 0 ;
		sprite.ammo = make_laser ;

		sprite.clock = make_clock()
		sprite.addChild(sprite.clock)


		sprite.fire = function(){
			if(this.cooldown <= 0){
				this.cooldown = this.max_cooldown;
				this.ammo(this.world, this.dir);
				this.frame = this.down ;
			}
			
		};

		sprite.up = 1 ;
		sprite.down = 0 ;

		sprite.update = function(){
			this.clock.set(this.max_cooldown - this.cooldown, this.max_cooldown)
			if(this.cooldown > 0){
				this.cooldown -= 1;
				this.frame = this.up ;
			}
			if(this.cooldown < 0.6*this.max_cooldown){
				this.frame = this.down ;
			}
		};

		return sprite;

	}

	function make_double_cannon(dir){
		var sprite = make_launcher(dir);
		sprite.up = 3 ;
		sprite.down = 2 ;

		sprite.fire = function(){
			if(this.cooldown <= 0){
				this.cooldown = this.max_cooldown;

				var dt = Math.PI/18;
				var r = play.world.width/2 ;
				for(var i = -1; i < 2; i+=2){
					var theta = Math.PI/2*this.dir + play.world.rotation + i*dt;
					var x = play.world.x + r*Math.cos(theta);
					var y = play.world.y + r*Math.sin(theta);

					make_laser({x:x, y:y}, this.dir);
				}
				
				this.frame = this.down ;
			}
		};

		return sprite ;
	}

	function make_tripple_cannon(dir){
		var sprite = make_launcher(dir);
		sprite.down = 4;
		sprite.up = 5 ;

		sprite.fire = function(){
			if(this.cooldown <= 0){
				this.cooldown = this.max_cooldown;
				for(var i = -1; i < 2; i++){
					this.ammo(this.world, (this.dir + i)%4);
				}
				this.frame = this.down ;
			}
			
		};

		return sprite ;
	}

	function make_shotgun(dir){
		var sprite = make_launcher(dir);
		sprite.down = 6;
		sprite.up = 7;
		sprite.ammo = make_shotgun_bullets;
		//*
		sprite.fire = function(){
			if(this.cooldown <= 0){
				this.cooldown = this.max_cooldown;
				var r = 4 + 4*Math.random();
				var shot ;
				for(var i = 0; i < r; i++){
					shot = this.ammo(this.world, this.dir);

					var angle = Math.atan2(shot.vy, shot.vx);
					var v = Math.sqrt(shot.vx*shot.vx + shot.vy*shot.vy)/2;
					angle += Math.PI/4 * (1 - 2*Math.random());

					shot.vx = v*Math.cos(angle);
					shot.vy = v*Math.sin(angle);

				}
				this.frame = this.down ;
			}
			
		};
		//*/
		return sprite ;
	}

	function make_laser_cannon(dir){
		var sprite = make_launcher(dir);
		sprite.down = 8;
		sprite.up = 9;
		sprite.max_cooldown = 20

		sprite.ammo = make_super_laser

		return sprite ;
	}

	function make_big_boom_shot(dir){
		var sprite = make_launcher(dir);
		sprite.down = 10;
		sprite.up = 11;
		sprite.ammo = make_big_bullet;
		sprite.max_cooldown = 70

		return sprite ;
	}

	function make_explode_shot(dir){
		var sprite = make_launcher(dir);
		sprite.down = 12;
		sprite.up = 13;

		sprite.ammo = make_explode_bullet

		return sprite ;
	}

	/* **PROJECTILES**
                                                                                                                                                                     
    //////         //////         //////             //         //////         //////       //////           //////         //             //////         /////      
   //  //         //  //         //  //             //         //             //             //               //           //             //             //          
  //////         //////         //  //             //         ////           //             //               //           //             ////           /////        
 //             // //          //  //         //  //         //             //             //               //           //             //                //         
//             //  //         //////         //////         //////         //////         //             //////         //////         //////         /////          

*/

	function make_laser(pos, dir){
		var theta = play.world.rotation + dir*Math.PI/2;
		var r = 16 ;

		var sprite = play.world.projectiles.create(pos.x + r*Math.cos(theta), pos.y + r*Math.sin(theta), 'laser');
		sprite.damage = 5 ;

		sprite.anchor.set(0.5);
		sprite.width = sprite.height = sprite.base_size = 16 ;
		sprite.t = 0 ;

		
		var v = 4 ;
		sprite.vx = v*Math.cos(theta);
		sprite.vy = v*Math.sin(theta);
    
		sprite.update = function(){
			this.t += 1 ;
			this.x += sprite.vx ;
			this.y += sprite.vy ;

			this.width = this.height = this.base_size * (2 + Math.cos(this.t/5));

			if(this.x > game.height || this.x < 0 || this.y > game.height || this.y < 0){
				this.destroy();
			}
		};

		sprite.hit = function(other){
			if(other.key === 'ufo' || other.key === 'missile')
			this.destroy();
		};

		audio.play('low_laser')

		return sprite ;

	}

	function make_super_laser(pos, dir){
		var sprite = make_laser(pos, dir);

		sprite.damage = 15;
		sprite.tint = '0x00ff00'
	}

	function make_shotgun_bullets(pos, dir){
		var sprite = make_laser(pos, dir);
		sprite.base_size = 8 ;
		sprite.age = 15 + 30*Math.random();
		sprite.damage = 1 ;

		sprite.update =  function(){
			this.t += 1 ;
			this.x += sprite.vx ;
			this.y += sprite.vy ;

			this.width = this.height = this.base_size * (2 + Math.cos(this.t/5));

			if(this.x > game.height || this.x < 0 || this.y > game.height || this.y < 0){
				this.destroy();
			}
			if(this.t > this.age){
				this.destroy();
			}
		};


		return sprite ;
	}

	function make_big_bullet(pos, dir){
		var sprite = make_laser(pos, dir);
		sprite.base_size = 2 ;
		sprite.damage = 2 ;
		sprite.max_size = 128
		sprite.tint = '0xff0000'

		var theta = play.world.rotation + dir*Math.PI/2

		var v = 1 ;
		sprite.vx = v*Math.cos(theta);
		sprite.vy = v*Math.sin(theta);

		sprite.hit = none 

		sprite.update =  function(){
			this.t += 1 ;
			this.x += sprite.vx ;
			this.y += sprite.vy ;

			this.angle += 2 

			this.width = Math.min(2 * this.base_size * this.t, this.max_size) ;
      		this.height = this.width ;
			this.damage = this.width/5;

			if(this.x > game.height || this.x < 0 || this.y > game.height || this.y < 0){
				this.destroy();
			}
		};

	}

	function make_explode_bullet(dir, pos){
		var sprite = make_laser(dir, pos);
		sprite.tint = '0xffff00'

		sprite.hit = function(){
			//var theta, laser 
			for(var i = 0; i < 6; i++){
				var shot = make_laser(this.position, 0);

				var angle = Math.atan2(shot.vy, shot.vx);
				var v = Math.sqrt(shot.vx*shot.vx + shot.vy*shot.vy)/2;
				angle += (i/5)*2*Math.PI + Math.PI/5;

				shot.vx = v*Math.cos(angle);
				shot.vy = v*Math.sin(angle);

				shot.base_size *= 0.5;
				shot.tint = '0xffff00';



			}

			this.destroy()
		}

		return sprite 
	}

	/* **ENEMIES**
                                                                                                         
    //////         //  //         //////         //   //        //////         //////         /////      
   //             /// //         //             ///  ///         //           //             //          
  ////           //////         ////           //// ////        //           ////           /////        
 //             // ///         //             // //// //       //           //                //         
//////         //  //         //////         //  ///  //    //////         //////         /////          

*/

	function explode(sprite){
		var value = sprite.value === undefined ? 7 + 5*Math.random() : sprite.value;
		for(var i = 0; i < value; i++){
			make_dot(sprite);
		}
		audio.play('explosion')

		sprite.destroy();
	}

	function make_ufo(){
		var dir = Math.floor(4*Math.random());
		var x, y ;
		switch(dir){
			case 0:
				x = game.height;
				y = Math.random()*game.height ;
				break ;
			case 1:
				x = Math.random()*game.height;
				y = 0;
				break ;
			case 2:
				x = 0;
				y = Math.random()*game.height ;
				break ;
			case 3:
				x = Math.random()*game.height;
				y = game.height ;
				break ;
			default:

		}

		var sprite = play.enemies.create(x, y, 'ufo');
		sprite.anchor.set(0.5);
		sprite.height = 48;
		sprite.width = sprite.height*1.5;
		sprite.dir = dir ;
		sprite.animations.add('play').play(10, true);
		sprite.value = 20 


		sprite.get_target = function(){
			var x0, y0, x1, y1, x, y;
			var r = 0.25;
			switch(this.dir){
				case 0:
					x0 = (1-r)*game.height ;
					x1 = game.height ;
					y0 = 0 ;
					y1 = game.height;
					break ;
				case 1:
					x0 = 0;
					x1 = game.height ;
					y0 = 0 ;
					y1 = r*game.height;
					break ;
				case 2:
					x0 = 0;
					x1 = r*game.height;
					y0 = 0 ;
					y1 = game.height ;
          break;
				case 3:
					x0 = 0;
					x1 = game.height ;
					y0 = (1-r)*game.height;
					y1 = game.height ;
          break;
				default:

			}
			x = x0 + Math.random()*(x1 - x0);
			y = y0 + Math.random()*(y1 - y0);
			//console.log([this.dir, x, y])
			return {x: x, y: y};
		};

		sprite.target = sprite.get_target();
		
		sprite.update = function(){
			 if(this.at_target){
			 	this.at_target = false ;
			 	this.target = this.get_target();
			 }else if(hittest(this, this.target, 5)){
			 	this.at_target = true ;
			 	this.fire();
			 }else{
			 	this.x += -0.03*(this.x - this.target.x);
			 	this.y += -0.03*(this.y - this.target.y);
			 }



		};

		sprite.fire = function(){
			make_enemey_laser(this)
		};

		sprite.hit_by = function(){
			explode(this);
		};

		return sprite ;
	}

	function make_enemey_laser(pos){
		var sprite = play.enemies.create(pos.world.x, pos.world.y, 'laser');
		sprite.tint = '0xff0000'
		sprite.width = sprite.height = 32

		var v = 5
		var theta = Math.atan2(play.world.y - sprite.y, play.world.x - sprite.x)
		sprite.vx = v*Math.cos(theta)
		sprite.vy = v*Math.sin(theta)

		sprite.damage = 10 

		sprite.update = function(){
			this.x += this.vx ;
			this.y += this.vy ;

			if(hittest(this, play.world, play.world.width/2)){
				play.world.explode(this)
				this.destroy();
			}
		};

		audio.play('med_laser')

		sprite.hit_by = none 

	}

	function make_missile(){
		var theta = Math.random() * 2 * Math.PI ;

		var r = 0.75 * game.height ;
		var origin = 0.5 * game.height ;

		var sprite = play.enemies.create(origin + r*Math.cos(theta), origin + r*Math.sin(theta), 'missile');
		sprite.animations.add('play').play(10, true);

		sprite.anchor.set(0.5);
		sprite.rotation = Math.PI + theta ;
		sprite.height = 32;
		sprite.width = 3*sprite.height ;

		var v = -1 ;
		sprite.vx = v*Math.cos(theta);
		sprite.vy = v*Math.sin(theta);
		sprite.damage = 10 ;

		sprite.update = function(){
			this.x += this.vx ;
			this.y += this.vy ;

			if(hittest(this, play.world, play.world.width/2)){
				
				play.world.explode(this)
				this.destroy();
			}
		};

		sprite.hit_by = function(){
			explode(this);
		};
	}

	function make_tardis(){
		var x,y 
		do{
			x = game.height * Math.random()
			y = game.height * Math.random()
		}while(hittest(play.world, {x:x, y:y}, play.world.width))

		var sprite = play.enemies.create(x, y, 'tardis')
		sprite.angle = -90 
		sprite.alpha = 0 
		sprite.dalpha = .01
		sprite.value = 30
		sprite.anchor.set(.5)
		sprite.update = function(){
			if(this.alpha >=1){
				this.dalpha *= -1
				this.alpha = 1 
				make_enemey_laser(this)
			}else if(this.alpha <= 0){
				this.dalpha *= -1
				this.alpha = 0 
				var x,y 
				do{
					x = game.height * Math.random()
					y = game.height * Math.random()
				}while(hittest(play.world, {x:x, y:y}, play.world.width))

				this.position.set(x, y) 

			}else{
				
			}
			this.alpha += this.dalpha
			this.alpha = Math.max(this.alpha, 0)
		}

		sprite.hit_by = function(){
			explode(this);
		};

		return sprite 
	}


	window.leveler = {
		t: 0, 
		update: function(){
			for(var i = 0; i < this.levels[this.level].length; i += 2){
				if(this.t % this.levels[this.level][i+1] === 0){
					this.levels[this.level][i]()
					break 
				}
			}
			this.t += 1
		},
		init: function(level){
			level = Math.min(level, this.levels.length - 1)
			console.log('Level: '  + level)
			this.level = level 
			this.t = 0 
		},
		levels: [
			[make_missile, 250],
			[make_missile, 150],
			[make_ufo, 500, make_missile, 300],
			[make_ufo, 300],
			[make_ufo, 400, make_missile, 150],
			[make_ufo, 400, make_missile, 150, make_tardis, 500],
		],
		max_currency: function(){
			var x = play.level 
			return 20 + 10*x*x
		}
	};


	/* **PLAY**
                                                            
    //////         //             ////         //  //       
   //  //         //             // //         ////         
  //////         //             //  //         //           
 //             //             ///////        //            
//             //////         //    //       //             

*/

	var tutorial = {
		init: function(){
			if(play.level !== 0){
				this.phase = -1  
			}else{
				var style = { font: "bold 16px Arial", fill: "#fff", align: 'center', boundsAlignH: "center", boundsAlignV: "middle" };
				this.text = game.add.text(game.height/2, 50, 'Click on the small world to fire.', style)
				this.text.anchor.set(.5)
				this.phase = 1 
			}
			
		}, 
		update: function(){
			var style = { font: "bold 16px Arial", fill: "#fff", align: 'center', boundsAlignH: "center", boundsAlignV: "middle" };
			if(this.phase === 1){
				if(play.world.has_fired){
					this.text.destroy()
					this.text = game.add.text(game.height/2, 50, 'Click the area around the small world to rotate faster.', style)
					this.text.anchor.set(.5)
					this.phase = 2
				}
			}else if(this.phase === 2){
				if(play.world.has_rotated){
					this.text.destroy()
				}
			}
		}
	}

	var play =  {
		init: function(new_tech, level){
			this.tech = (new_tech || ['root','root','root', 'cannon']).map(function(x){return tech[x];}); //[make_empty, make_empty, make_empty, make_launcher];
			this.level = level || 0 ;
		}, 
		create: function(){
			var offset = 20
			var bg = game.add.sprite(-offset, -offset, 'play_bg');

			this.world = make_world(this.tech);

			this.enemies = game.add.group();
			this.dots = game.add.group();
			
			this.level_up = false ;
			this.game_over = false ; 

			var side_bar = game.add.sprite(game.width, game.height, 'side_bar_bg');
			side_bar.anchor.set(1)
			side_bar.fixedToCamera = true 

			
			this.bars = game.add.group();
			audio.init()

			var bars = ['health', 'currency'];
			var labels = ['Health', 'XP'];
			var text ;
			var style = {}
			for(var i = 0; i < bars.length; i++){
				make_bar(bars[i]);
				text = game.add.text(game.height + 24, 24 + 92*i, labels[i], style)
				text.fixedToCamera = true 
			}

			leveler.init(this.level)

			tutorial.init()
/*
			for(i = 0; i < 4; i++){
				make_button(i);
			}
*/
			this.mouse = {};

			game.camera.bounds = {
				x: -offset,
				y: -offset,
				width: game.width + offset,
				height: game.height + offset
			}

			var but = game.add.button(460, game.height - 48, 'menu_button', function(){
				game.state.start('menu')
			}, this, 1, 0, 2)
			but.fixedToCamera = true 
			but.setDownSound(game.add.sound('select'))
			but.setOverSound(game.add.sound('over'))
			//but.anchor.set(.5)

			var but = game.add.button(460, game.height - 80, 'mute_button', function(){
				game.sound.mute = !game.sound.mute 
			}, this, 1, 0, 2)
			but.fixedToCamera = true 
			but.setDownSound(game.add.sound('select'))
			but.setOverSound(game.add.sound('over'))
			//but.anchor.set(.5)

			var mute_check = game.add.sprite(but.x + but.width, but.y, 'check')
			//mute_check.anchor.set(.5)
			mute_check.fixedToCamera = true 
			mute_check.update = function(){
				this.alpha = (+game.sound.mute)*(0.5) 
			}

			var but = game.add.button(460, game.height - 112, 'steady_button', function(){
				play.dont_shake = !play.dont_shake 
			}, this, 1, 0, 2)
			but.fixedToCamera = true 
			but.setDownSound(game.add.sound('select'))
			but.setOverSound(game.add.sound('over'))
			//but.anchor.set(.5)

			var shake_check = game.add.sprite(but.x + but.width, but.y, 'check')
			//shake_check.anchor.set(.5)
			shake_check.fixedToCamera = true 
			shake_check.update = function(){
				this.alpha = (+!!play.dont_shake)*(0.5) 
			}

			game.input.mouse.capture = true;


		},
		update: function(){
			if(this.level_up){
				var old_tech = [];
				for(var i = 0; i < play.tech.length; i++){
					old_tech.push(lookup(this.tech[i], tech));
				}
				game.state.start('level_complete', true, false, old_tech, this.level);
			}

			if(this.game_over){
				game.state.start('game_over', true, false, this.level);
			}

			this.mouse.down = game.input.activePointer.leftButton.isDown; //&& game.input.activePointer.x < 448
			this.mouse.x = game.input.activePointer.x;
			this.mouse.y = game.input.activePointer.y ;

			if(!this.dont_shake){
				var dx = this.mouse.x - this.world.x 
				var dy = this.mouse.y - this.world.y 
				var scale = function(x){
					return 0.05*x
				}

				game.camera.x = scale(dx);
				game.camera.y = scale(dy);
			}

			leveler.update();
			

			collide(this.world.projectiles, this.enemies, function(a, b){
				a.hit(b);
				b.hit_by(a);
			});

			tutorial.update()
		
		}
	};

	return play ;
})();