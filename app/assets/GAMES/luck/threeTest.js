(function(){
	
	let width = window.innerWidth
	let height = window.innerHeight
	
	function setup(){
		let scene = new THREE.Scene();

		let camera = new THREE.PerspectiveCamera(75,width/height,0.1,1000)
		
		camera.position.x = 75;
		camera.position.y = 0;
		camera.position.z = -80;
		
		camera.rotation.y = 3.14158;
		
		let renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setClearColor("#000000");
		renderer.setSize(width, height);

		document.body.appendChild(renderer.domElement);
		
		/*let geometry = new THREE.SphereGeometry(1, 4, 4)
		let material = new THREE.MeshLambertMaterial({color: 0xffcc00})
		let mesh = new THREE.Mesh(geometry, material)
		
		scene.add(mesh)
		*/
		return {scene: scene, camera: camera, renderer: renderer}
	}
	
	function addMouse(scene){
		
		
		scene.mouse = {
			x: 0,
			y: 0,
			update: function(){
				scene.camera.rotation.y = Math.PI - scene.mouse.x/2
				scene.camera.rotation.x = scene.mouse.y/4
			}
		}
		
		document.addEventListener('mousemove', (event)=>{
			scene.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
			scene.mouse.y = (event.clientY / window.innerHeight) * 2 - 1
		}, false)
	}
	
	function addLight(scene, x, y, z){
		let light = new THREE.PointLight(0xffffff, 1, 500)
		light.position.set(x, y, z)
		scene.scene.add(light)
		return light 
	}
	
	function addShip(scene){
		var loader = new THREE.GLTFLoader();
		
		loader.load( '/static/GAMES/luck/apollo11/scene.gltf', function ( gltf ) {

			scene.add( gltf.scene );

		}, undefined, function ( error ) {

			console.error( error );

		} );
	}
	
	function onUpdate(scene){
		
		scene.mouse.update()
	}
	
	window.onload = function(){
		
		let scene = setup()
		addLight(scene, 1, 1, 1)
		addLight(scene, 75, 0, -80)
		addShip(scene.scene)
		
		addMouse(scene)
		
		
		window.scene = scene 
		
		function render(){
			requestAnimationFrame(render)
			scene.renderer.render(scene.scene, scene.camera)

			onUpdate(scene)
		}
		
		render()
		
	}
	
	
})()