var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
var controls = new THREE.OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var line = null;

function generateRuleSet(){
	let output = config.axiom;
	for(let i = 0; i < config.iterations; i++)
	{
		let next = "";
		for(let j = 0; j < output.length; j++)
		{
			if(config[output[j]])
			{
				next += config[output[j]];
			}
			else {
				next += output[j];
			}
		}
		output = next;
	}
	return output;
}

function onUpdate(){
	config.f = config.f.toLowerCase();
	config.g = config.g.toLowerCase();
	config.h = config.h.toLowerCase();
	config.a = config.a.toLowerCase();
	config.axiom = config.axiom.toLowerCase();

	if (line)
	{ 
		scene.remove(line); 
	}

	let ruleSet = generateRuleSet().toLowerCase();
	let position = new THREE.Vector3(0,0,0);
	let direction = new THREE.Vector3(1,0,0);
	let stack = [];
	let points = [];
	
	// Example: F = FX+FY+
	for(let i = 0; i < ruleSet.length; i++)
	{
		let char = ruleSet[i];
		let nextChar = ruleSet[i+1];

		if(char === 'f' || char === 'g' || char === 'h')
		{
			position = position.add(direction);
			points.push(position.clone());
		}
		else if(char === 'x')
		{
			let angle = (nextChar === '+') ? config.angle : -config.angle;
			let euler = new THREE.Euler(angle * Math.PI / 180, 0, 0, 'XYZ');
			direction.applyEuler(euler);
			i++;
		}
		else if(char === 'y')
		{
			let angle = (nextChar === '+') ? config.angle : -config.angle;
			let euler = new THREE.Euler(0, angle * Math.PI / 180, 0, 'XYZ');
			direction.applyEuler(euler);
			i++;
		}
		else if(char === 'z')
		{
			let angle = (nextChar === '+') ? config.angle : -config.angle;
			let euler = new THREE.Euler(0, 0, angle * Math.PI / 180, 'XYZ');
			direction.applyEuler(euler);
			i++;
		}
		else if(char === '[')
		{
			stack.push([position.clone(), direction.clone()]);
		}
		else if(char === ']')
		{
			let vector = stack.pop();
			position = vector[0];
			direction = vector[1];
		}
	}

	var geometry = new THREE.BufferGeometry().setFromPoints(points);
	line = new THREE.Line(geometry, material);
	scene.add(line);
}

var config = {
	f: 'GZ-FZ-G',
	g: 'FZ+GZ+F',
	h: '',
	a: '',
	axiom: 'f',
	iterations: 6,
	angle: 60,
	update: onUpdate,
	example1: function () {
		config.f = "FZ−GZ+FZ+GZ−F";
		config.g = "GG";
		config.h = config.a = "";
		config.angle = -120;
		config.axiom = "f";
		config.iterations = 7;
		onUpdate();
	},
	example2: function() {
		config.a = "FZ+[[A]Z-A]Y-F[Z-FA]Y+A";
		config.f = "FF";
		config.g = config.h = "";
		config.axiom = "z+z+z+z+a";
		config.angle = 25;
		config.iterations = 5;
		onUpdate();
	},
	example3: function() {
		config.f = "GZ-FZ-G";
		config.g = "FZ+GZ+F";
		config.h = config.a = "";
		config.angle = -60;
		config.iterations = 7;
		config.axiom = "f";
		onUpdate();
	}
};

var gui = new dat.GUI();
gui.add(config, 'f');
gui.add(config, 'g');
gui.add(config, 'h');
gui.add(config, 'a');
gui.add(config, 'axiom');
gui.add(config, 'angle', -360, 360, 1);
gui.add(config, 'iterations');
gui.add(config, 'update');
gui.add(config, 'example1');
gui.add(config, 'example2');
gui.add(config, 'example3');

var grid = new THREE.GridHelper(200, 10);
scene.add(grid);
camera.position.z = 5;
onUpdate();
controls.update();

var animate = function () {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
};

animate();