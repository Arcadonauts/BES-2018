/*
	To Do:
		Plot
			Steal Fire from the Gods
			And fire will find you 
		Bugs:
			makeMap(248)
		Powers
			Speed 
			Extra Lives 
			Extra Cards
		Anti-cards
		Countdown Timer Bar 
		Enemies
			Bats 
		Sound FX 
*/

(function(){
	const TW = 16 
	const path = '/static/GAMES/miz1/'
	const WIDTH = TW*30
	const HEIGHT = TW*20
	
	let sounds = [
		"basicExplosion",
		"bigExplosion",
		"bullet",
		"card",
		"coin",
		"dash",
		"delayExplosion",
		"drop",
		"flameOn",
		"hit",
		"key",
		"laser",
		"laser2",
		"mediumExplosion",
		"ring",
		"shield",
		"shoot",
		"smallExplosion",
		"superExplosion",
		"teleport",
		"unlock",
		'activate',
		'deactivate',
		'flaming',
	]
	
			
	let music = [
		'darkling', 'lobby', 'trouble', 'titans', 
		'campfire', //https://freesound.org/people/Spandau/sounds/40699/
	]
	
	let config = {
		
		backgroundColor: '#000000',//'#472d3c',
		pixelArt: true,
		zoom: 2,
		scale: {
			autoCenter: Phaser.Scale.CENTER_BOTH,
			mode: Phaser.Scale.FIT,
			width: WIDTH,
			height: HEIGHT
		},

		physics: {
			default: 'arcade',
			arcade: {
				gravity: {x:0, y:0},
				debug: !true
			}
		},
		//canvas = document.getElementById('canvas')
	};
	

	
	let menu = {
		create: function(){
			audio.playSong('titans')
			
			let img = this.add.sprite(0, 0, 'title')
			img.setOrigin(0, 0)
			
			let hs = localStorage.highScore || 0 
			let text = this.add.text(TW, HEIGHT - TW/2, 'High Score: ' + hs,{
				fill:  '#7a444a',
				fontFamily: 'retro',
				fontSize: '16pt',
				align: 'left'
			})
			text.setOrigin(0, 1)
			
			
			let wKey = this.input.keyboard.addKey('SPACE')
			wKey.on('down', () => {
				//console.log("play")
				this.scene.start('play', {startFresh: true})
			})
		},
		
	
	}
	
	let goodnight = {
		create: function(){
			this.particles = this.add.particles('dot');
			//this.particles.depth = -1 
			
			this.smoke = this.particles.createEmitter({
				scale: {start: 4, end: 4},
				alpha: { start: 0.25, end: 0.0 },
				//speed: { min: 0, max: 100 },
				lifespan: { min: 400, max: 8000 },
				tint: 0xcfc6b8,
				quantity: 1,
				gravityY: -10000,
				gravityX: 0,
				speedX: {min: -20, max: 20},
				maxVelocityY: 80,
				//maxVelocityX: 10,
				x: 240,
				y: 240,
				frequency: 40,
			});
			
			let fire = this.add.sprite(0, 0, 'goodnight')
			fire.setOrigin(0, 0)
			
			let bg = this.add.graphics()
			bg.fillStyle(0x000000, 1)
			bg.fillRect(0, 0, 30*TW, 20*TW)
			bg.alpha = 0 
			
			let fg = this.add.graphics()
			fg.fillStyle(0x000000, 1)
			fg.fillRect(0, 0, 30*TW, 20*TW)
			
			
	
			fire.preUpdate = function(){
				let step = 0.05
				let min = 0.0
				let max = 0.5
				bg.alpha += 2*step*Math.random() - step 
				
				if(bg.alpha > max){
					bg.alpha = max
				}
				if(bg.alpha < min){
					bg.alpha = min
				}
			}
			
			
			
			this.add.tween({
				targets: fg,
				alpha: 0.0,
				duration: 2000,
				onComplete: ()=>{
					this.add.tween({
						targets: fg,
						alpha: 1,
						delay: 5000,
						duration: 200,
						onComplete: ()=>{
							this.time.delayedCall(1000, ()=>{
								this.scene.start('menu')
							});
							
						}
					})
				}
			})
		}
	}

	function init(){
		window.game = new Phaser.Game(config)
		game.scene.add('setup', setup)
		game.scene.add('play', play)
		//game.scene.add('escape', play)
		game.scene.add('goodnight', goodnight)
		game.scene.add('menu', menu)
		game.scene.add('audio', _audio)
		

		game.scene.start('setup') // Don't change this!
	}
	
	let _audio = {
		create: function(){
			
			/*
			let button = this.add.sprite(0, 0, 'main', 814)
			button.setOrigin(0)
			button.setInteractive()
			button.tint = 0x7a444a
			
			button.on('pointerup', function () {

            if (this.scale.isFullscreen)
				{
					button.setFrame(814);

					this.scale.stopFullscreen();
				}
				else
				{
					button.setFrame(815);

					this.scale.startFullscreen();
				}

			}, this);
			//*/
			
			this.songs = {}
			this.sfx = {}
			
			music.forEach(song => {
				this.songs[song] = this.sound.add(song, {
					loop: true 
				})
			})
			
			sounds.forEach(s => {
				this.sfx[s] = this.sound.add(s)
			})
			
			this.musicVolume = function(v){ 
				for(let song in this.songs){
					if(this.songs.hasOwnProperty(song)){
						this.songs[song].volume = v
					}
				}
			}
			
			this.playSFX = function(s, noInterrupt){
				if(this.sfx[s]){
					if(!noInterrupt || !this.sfx[s].isPlaying){
						this.sfx[s].play()
					}
				}else{
					console.warn('unknown sound', s)
				}
			}
			
			this.stopSFX = function(s){
				if(this.sfx[s]){
					this.sfx[s].stop()
				}else{
					console.warn('unknown sound', s)
				}
			}
			
			this.stopSong = function(){
				for(let song in this.songs){
					if(this.songs.hasOwnProperty(song)){
						this.songs[song].stop()
					}
				}
			}
			
			this.playSong = function(s){
			
				for(let song in this.songs){
					if(this.songs.hasOwnProperty(song)){
						if(s === song){
							if(!this.songs[s].isPlaying){
								this.songs[s].play()
							}
						}else{
							this.songs[song].stop()
						}
					}
				}
			}
			
			//this.musicVolume(0)
			
			window.audio = this 
		}
	}
	
	let setup = {
		preload: function(){
			let version = Math.random()
			
			let text = this.add.text(config.width/2, config.height/2, 'Loading: 0%', {
				fill : 'white'
			})
			text.setOrigin(.5, .5)
			
			this.load.on('progress', function(v){
				
				text.text = 'Loading: ' + Math.floor(100*v) + '%'
			})

			this.load.spritesheet('main', path + "images/monochrome_transparent_packed.png", { frameWidth: 16, frameHeight: 16})
			this.load.image('img', path + "images/colored_packed.png")
			
			let imgs = [
				'dot', 'title', 'musicCredits', 'spotlight', 'goodnight'
			]
			
			imgs.forEach(img => {
				this.load.image(img, path + 'images/' + img + '.png?v=' + version)
			})
			/*
			this.load.image('dot', path + "images/dot.png")
			this.load.image('title', path + "images/title.png")
			this.load.image('musicCredits', path + "images/musicCredits.png")
			this.load.image('spotlight', path + "images/spotlight.png")
			*/
			
			for(let i = 0; i < sounds.length; i++){
				let s = sounds[i]
				//console.log('load:', s+'.wav')
				this.load.audio(s, path + 'sfx/' + s+'.wav?v='+version)
				
			}
			
			for(let i = 0; i < music.length; i++){
				let s = music[i]
				
				this.load.audio(s, path + 'music/'+ s + '.mp3?v=' + version)
				
			}
			
			this.sound.volume = 0.25
			
			
			//this.load.tilemapTiledJSON('lvl1', path+'maps/lvl1.json?='+Math.random());
			this.load.tilemapTiledJSON('store', path+'maps/store.json?v='+version);
			this.load.tilemapTiledJSON('tut', path+'maps/tut.json?v='+version);
			
			this.load.text('shader', path+'shader.shader?v='+version);
		
		},
		create:	function create(){
			
			let shaderText = this.cache.text.get('shader')
			
			let shaderPipelineClass = new Phaser.Class({

				Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

				initialize:

				function GrayscalePipeline (game){
					Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
						game: game,
						renderer: game.renderer,
						fragShader: shaderText
						
					});
				} 
			});
			
			window.shaderPipeline = this.game.renderer.addPipeline('shader', new shaderPipelineClass(this.game));
			
			this.scene.launch('audio')
			this.scene.start('menu')
			
		},
		update: function update(){
		}
	}
	
	
	init()
})()