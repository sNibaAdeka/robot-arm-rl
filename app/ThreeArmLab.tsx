'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Metrics = { episodes: number; reward: string; success: number };

const lerp = (from: number, to: number, ratio: number) => from + (to - from) * ratio;

function link(length: number, radius: number, material: THREE.Material) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * .9, length, 20), material);
  body.castShadow = true; body.receiveShadow = true; body.position.y = length / 2; group.add(body);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.03, .026, 10, 24), new THREE.MeshStandardMaterial({ color: '#d3ffff', metalness: .55, roughness: .28 }));
  edge.rotation.x = Math.PI / 2; edge.position.y = length; group.add(edge);
  return group;
}

export default function ThreeArmLab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [running, setRunning] = useState(true);
  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({ episodes: 37, reward: '-0.84', success: 12 });
  const runningRef = useRef(true); const trainingRef = useRef(false);

  const accelerate = () => { setTraining(true); trainingRef.current = true; window.setTimeout(() => { setTraining(false); trainingRef.current = false; }, 1500); };
  const toggle = () => { setRunning(value => { runningRef.current = !value; return !value; }); };

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#07141a'); scene.fog = new THREE.Fog('#07141a', 7, 16);
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100); camera.position.set(5.4, 3.5, 6.8); camera.lookAt(.1, .8, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enablePan = false; controls.enableDamping = true; controls.minDistance = 4.8; controls.maxDistance = 9; controls.target.set(.1, .9, 0);
    const hemi = new THREE.HemisphereLight('#c7feff', '#12232a', 2.2); scene.add(hemi); const key = new THREE.DirectionalLight('#ecffff', 4.4); key.position.set(4, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key); const rim = new THREE.PointLight('#42e1d2', 16, 7); rim.position.set(-2.5, 2.8, 1.8); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), new THREE.MeshStandardMaterial({ color: '#0d232b', metalness: .25, roughness: .78 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(14, 28, '#24515a', '#173940'); grid.position.y = .006; (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = .64; scene.add(grid);
    const table = new THREE.Mesh(new THREE.BoxGeometry(5.8, .22, 3.7), new THREE.MeshStandardMaterial({ color: '#17343c', metalness: .42, roughness: .43 })); table.position.set(.35, .1, 0); table.castShadow = true; table.receiveShadow = true; scene.add(table);
    const robot = new THREE.Group(); robot.position.set(-1.35, .22, 0); scene.add(robot);
    const teal = new THREE.MeshStandardMaterial({ color: '#42d8cc', metalness: .72, roughness: .22 }); const dark = new THREE.MeshStandardMaterial({ color: '#164b54', metalness: .7, roughness: .3 }); const jointMat = new THREE.MeshStandardMaterial({ color: '#e2ffff', metalness: .65, roughness: .2 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.62, .76, .34, 32), dark); base.position.y = .17; base.castShadow = true; robot.add(base); const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(.38, .48, .24, 32), teal); pedestal.position.y = .46; pedestal.castShadow = true; robot.add(pedestal);
    const shoulder = new THREE.Group(); shoulder.position.y = .54; robot.add(shoulder); const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(.28, 24, 24), jointMat); shoulderJoint.castShadow = true; shoulder.add(shoulderJoint);
    const L1 = 1.55, L2 = 1.23, L3 = .72; const armOne = link(L1, .19, teal); shoulder.add(armOne); const elbow = new THREE.Group(); elbow.position.y = L1; armOne.add(elbow); const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(.24, 24, 24), jointMat); elbowJoint.castShadow = true; elbow.add(elbowJoint);
    const armTwo = link(L2, .15, teal); elbow.add(armTwo); const wrist = new THREE.Group(); wrist.position.y = L2; armTwo.add(wrist); const wristJoint = new THREE.Mesh(new THREE.SphereGeometry(.18, 22, 22), jointMat); wristJoint.castShadow = true; wrist.add(wristJoint); const forearm = link(L3, .11, teal); wrist.add(forearm);
    const hand = new THREE.Group(); hand.position.y = L3; forearm.add(hand); const palm = new THREE.Mesh(new THREE.BoxGeometry(.28,.25,.34), jointMat); palm.position.y=.1;palm.castShadow=true;hand.add(palm); const fingerL = new THREE.Mesh(new THREE.BoxGeometry(.08,.32,.08),teal), fingerR = fingerL.clone(); fingerL.position.set(-.15,.28,0);fingerR.position.set(.15,.28,0);fingerL.castShadow=fingerR.castShadow=true;hand.add(fingerL,fingerR);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(.35,.35,.35), new THREE.MeshStandardMaterial({ color: '#ff7c5c', metalness: .35, roughness: .27, emissive: '#32120b', emissiveIntensity: .4 })); cube.position.set(.55,.4,0);cube.castShadow=true;scene.add(cube);
    const target = new THREE.Group(); target.position.set(1.55,.24,0);scene.add(target);const disc = new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.016,40),new THREE.MeshStandardMaterial({color:'#245d3e',emissive:'#3daa55',emissiveIntensity:.65,transparent:true,opacity:.7}));target.add(disc);const ring = new THREE.Mesh(new THREE.TorusGeometry(.42,.028,12,42),new THREE.MeshStandardMaterial({color:'#a5f474',emissive:'#5fba55',emissiveIntensity:1.2}));ring.rotation.x=Math.PI/2;ring.position.y=.02;target.add(ring);
    const resize = () => { const { width, height } = mount.getBoundingClientRect(); renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}; resize(); const observer = new ResizeObserver(resize);observer.observe(mount);
    const clock = new THREE.Clock(); let raf = 0, held = false, lastMetric = 0, currentRound = -1;
    const end = new THREE.Vector3(), pivot = new THREE.Vector3(), goal = new THREE.Vector3();
    const solveIK = (targetPoint: THREE.Vector3) => {
      for (let pass = 0; pass < 5; pass += 1) {
        for (const joint of [wrist, elbow, shoulder]) {
          hand.getWorldPosition(end); joint.getWorldPosition(pivot);
          const endAngle = Math.atan2(end.y - pivot.y, end.x - pivot.x);
          const goalAngle = Math.atan2(targetPoint.y - pivot.y, targetPoint.x - pivot.x);
          const delta = Math.atan2(Math.sin(goalAngle - endAngle), Math.cos(goalAngle - endAngle));
          joint.rotateZ(clamp(delta, -.18, .18)); robot.updateMatrixWorld(true);
        }
      }
    };
    const resetRound = () => { if (cube.parent !== scene) { cube.removeFromParent(); scene.add(cube); } cube.position.set(.55,.4,0); cube.rotation.set(0,0,0); held = false; };
    const animate = () => {
      const elapsed = clock.getElapsedTime(); const round = Math.floor(elapsed / 9); const cycle = runningRef.current ? elapsed % 9 : 0;
      if (round !== currentRound) { currentRound = round; resetRound(); }
      robot.updateMatrixWorld(true);
      if (cycle < 3.4 && !held) { cube.getWorldPosition(goal); goal.y += .25; solveIK(goal); }
      else if (!held) { hand.getWorldPosition(end); if (end.distanceTo(cube.getWorldPosition(goal)) < .42) { held = true; hand.add(cube); cube.position.set(0,.36,0); } }
      else if (cycle < 6.8) { target.getWorldPosition(goal); goal.y += .40; solveIK(goal); }
      else { hand.getWorldPosition(end); target.getWorldPosition(goal); if (end.distanceTo(goal) < .52) { hand.remove(cube); scene.add(cube); cube.position.copy(goal).add(new THREE.Vector3(0,.20,0)); held = false; } }
      const closed = held; fingerL.position.x = THREE.MathUtils.lerp(fingerL.position.x, closed ? -.065 : -.15, .13); fingerR.position.x = THREE.MathUtils.lerp(fingerR.position.x, closed ? .065 : .15, .13);
      target.rotation.y += .014; controls.update(); renderer.render(scene,camera);
      if (elapsed-lastMetric>.8) { setMetrics(old=>({episodes:old.episodes+(trainingRef.current?94:1),reward:held?'+8.60':cycle>6.8?'+10.00':'-0.32',success:Math.min(94,old.success+(trainingRef.current?5:1))})); lastMetric=elapsed; }
      raf=requestAnimationFrame(animate);
    }; animate();
    return () => {cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.dispose();mount.removeChild(renderer.domElement);};
  },[]);
  return <main className="minimal-lab"><header><a href="#scene">arm<span>rl</span></a><div className="live"><i/> LIVE 3D</div></header><section className="scene" id="scene"><div ref={mountRef} className="three-stage" aria-label="Интерактивная 3D сцена роботизированной руки"/><div className="scene-title"><p>ROBOTICS · REINFORCEMENT LEARNING</p><h1>3D robot arm</h1><span>{training?'Агент обновляет политику':'Агент выполняет pick & place'}</span></div><div className="controls"><button className="train" onClick={accelerate}>{training?'Обучение…':'Ускорить обучение'}</button><button onClick={toggle}>{running?'Пауза':'Продолжить'}</button><button onClick={()=>window.location.reload()}>Новая задача</button></div><div className="hud"><span><b>{metrics.episodes.toLocaleString('ru-RU')}</b> эпизодов</span><span><b>{metrics.success}%</b> успех</span><span><b>{metrics.reward}</b> награда</span></div><p className="hint">Потяни сцену мышью, чтобы посмотреть руку с другого угла.</p></section></main>;
}
