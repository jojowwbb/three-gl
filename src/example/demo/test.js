import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

export function test(){
    var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
camera.position.set(13, 25, 38);
camera.lookAt(scene.position);
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
var canvas = renderer.domElement
document.body.appendChild(canvas);
console.log(OrbitControls);
var controls = new OrbitControls(camera, renderer.domElement);

var geometry = new THREE.PlaneGeometry( 20, 20 );
geometry.computeBoundingBox();
var material = new THREE.ShaderMaterial({
  uniforms: {
    color1: {
      value: new THREE.Color("red")
    },
    color2: {
      value: new THREE.Color("purple")
    },
    bboxMin: {
      value: geometry.boundingBox.min
    },
    bboxMax: {
      value: geometry.boundingBox.max
    }
  },
  vertexShader: `
  
    varying vec2 vUv;

    void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
  	#define PI 3.1415926
    #define TWO_PI PI*2.
    	
    uniform vec3 color1;
    uniform vec3 color2;
  
    varying vec2 vUv;
    
    void main() {
      
      vec2 uv = vUv * 2. - 1.;
      
      float a = atan(uv.x,uv.y)+PI;
      float r = TWO_PI/4.;
      float d = cos(floor(.5+a/r)*r-a)*length(uv);
      
      gl_FragColor = vec4(mix(color1, color2, d), 1.0);
    }
  `,
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);



render();

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render() {
  if (resize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
}