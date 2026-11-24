import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type Planet = {
  name: string;
  type: string;
  diameterKm: number;
  moons: number;
  dayLength: string;
  yearDays: number;
  tempC: string;
  color: string;
  fact: string;
};

const planets: Planet[] = [
  { name: "Merkúr", type: "Kőzetbolygó", diameterKm: 4879, moons: 0, dayLength: "59 földi nap", yearDays: 88, tempC: "−180…430 °C", color: "#a8a8a8", fact: "A legkisebb bolygó, a Nap körüli pályáját mindössze 88 nap alatt futja be." },
  { name: "Vénusz", type: "Kőzetbolygó", diameterKm: 12104, moons: 0, dayLength: "243 földi nap", yearDays: 225, tempC: "~465 °C", color: "#e8b96f", fact: "Az erős üvegházhatás miatt ez a Naprendszer legforróbb bolygója." },
  { name: "Föld", type: "Kőzetbolygó", diameterKm: 12742, moons: 1, dayLength: "24 óra", yearDays: 365, tempC: "~15 °C", color: "#4a90e2", fact: "Az egyetlen ismert hely, ahol élet van. Felszínének mintegy 71%-át víz borítja." },
  { name: "Mars", type: "Kőzetbolygó", diameterKm: 6779, moons: 2, dayLength: "24,6 óra", yearDays: 687, tempC: "~−63 °C", color: "#d1502a", fact: "Itt található a Naprendszer legnagyobb vulkánja, az Olympus Mons." },
  { name: "Jupiter", type: "Gázóriás", diameterKm: 139820, moons: 95, dayLength: "10 óra", yearDays: 4333, tempC: "~−110 °C", color: "#d9a66c", fact: "A Nagy Vörös Folt egy több száz éve tartó óriási vihar, nagyobb, mint a Föld." },
  { name: "Szaturnusz", type: "Gázóriás", diameterKm: 116460, moons: 146, dayLength: "10,7 óra", yearDays: 10759, tempC: "~−140 °C", color: "#ead594", fact: "Átlagsűrűsége kisebb a vízénél, így elméletileg úszna egy elég nagy óceánon." },
  { name: "Uránusz", type: "Jégóriás", diameterKm: 50724, moons: 28, dayLength: "17 óra", yearDays: 30687, tempC: "~−195 °C", color: "#7fd8da", fact: "Az oldalán fekve kering a Nap körül, tengelyferdesége közel 98°." },
  { name: "Neptunusz", type: "Jégóriás", diameterKm: 49244, moons: 16, dayLength: "16 óra", yearDays: 60190, tempC: "~−200 °C", color: "#4466e8", fact: "A Naprendszer legerősebb szelei itt fújnak, akár 2000 km/h sebességgel." },
];

/* ---------- Procedurális textúrák (külső kép nélkül) ---------- */
function planetTexture(p: Planet): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = p.color;
  g.fillRect(0, 0, 512, 256);
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  if (p.type !== "Kőzetbolygó") {
    for (let y = 0; y < 256; y += rnd(4, 14)) {
      g.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${rnd(0.04, 0.18)})` : `rgba(0,0,0,${rnd(0.05, 0.2)})`;
      g.fillRect(0, y, 512, rnd(3, 12));
    }
  } else if (p.name === "Föld") {
    g.fillStyle = "#3f9b4f";
    for (let i = 0; i < 14; i++) {
      g.beginPath();
      g.ellipse(rnd(0, 512), rnd(50, 200), rnd(15, 55), rnd(8, 30), rnd(0, 3), 0, 6.28);
      g.fill();
    }
    g.fillStyle = "rgba(255,255,255,.85)";
    g.fillRect(0, 0, 512, 14);
    g.fillRect(0, 242, 512, 14);
    g.fillStyle = "rgba(255,255,255,.18)";
    for (let i = 0; i < 20; i++) { g.beginPath(); g.ellipse(rnd(0, 512), rnd(0, 256), rnd(20, 60), rnd(4, 10), 0, 0, 6.28); g.fill(); }
  } else {
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(0,0,0,${rnd(0.05, 0.25)})`;
      g.beginPath();
      g.arc(rnd(0, 512), rnd(0, 256), rnd(2, 14), 0, 6.28);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,240,170,1)");
  gr.addColorStop(0.25, "rgba(255,170,40,.55)");
  gr.addColorStop(1, "rgba(255,120,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

const sizeOf = (p: Planet) => 0.5 + Math.pow(p.diameterKm / 12742, 0.4) * 0.8;
const distOf = (i: number) => 16 + i * 9;

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(2);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // az animációs ciklus ref-eken keresztül olvassa az aktuális állapotot
  const selRef = useRef<number | null>(selected);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);
  selRef.current = selected;
  pausedRef.current = paused;
  speedRef.current = speed;
  const setSelRef = useRef(setSelected);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 55, 95);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 2;
    controls.maxDistance = 220;

    // Csillagok
    const starPos: number[] = [];
    for (let i = 0; i < 2500; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(300 + Math.random() * 200);
      starPos.push(v.x, v.y, v.z);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false })));

    // Nap
    scene.add(new THREE.AmbientLight(0x6070a0, 0.5));
    scene.add(new THREE.PointLight(0xfff0cc, 3, 0, 0));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffc23d }));
    scene.add(sun);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.set(34, 34, 1);
    scene.add(glow);

    // Bolygók
    const groups: THREE.Group[] = [];
    const meshes: THREE.Mesh[] = [];
    const angles = planets.map((_, i) => i * 1.3);
    planets.forEach((p, i) => {
      const r = distOf(i);
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 129 }, (_, k) => new THREE.Vector3(Math.cos((k / 128) * 6.2832) * r, 0, Math.sin((k / 128) * 6.2832) * r))
        ),
        new THREE.LineBasicMaterial({ color: 0x3a4aa8, transparent: true, opacity: 0.45 })
      );
      scene.add(ring);

      const s = sizeOf(p);
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(s, 48, 48),
        new THREE.MeshStandardMaterial({ map: planetTexture(p), roughness: 0.9, metalness: 0 })
      );
      group.add(mesh);
      if (p.name === "Szaturnusz") {
        const rg = new THREE.Mesh(
          new THREE.RingGeometry(s * 1.4, s * 2.4, 96),
          new THREE.MeshBasicMaterial({ color: 0xcdb97a, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
        );
        rg.rotation.x = Math.PI / 2 - 0.45;
        group.add(rg);
      }
      if (p.name === "Uránusz") group.rotation.z = 1.7;
      scene.add(group);
      groups.push(group);
      meshes.push(mesh);
    });

    // Kattintás (húzás nem számít)
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    const el = renderer.domElement;
    const pick = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObjects(meshes)[0]?.object as THREE.Mesh | undefined;
    };
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const hit = pick(e);
      if (hit) setSelRef.current(meshes.indexOf(hit));
    };
    const onMove = (e: PointerEvent) => { el.style.cursor = pick(e) ? "pointer" : "grab"; };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointermove", onMove);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    addEventListener("resize", onResize);

    // Animáció
    const clock = new THREE.Clock();
    let raf = 0;
    const tmp = new THREE.Vector3();
    const loop = () => {
      const dt = clock.getDelta();
      if (!pausedRef.current) {
        planets.forEach((p, i) => {
          angles[i] += (0.35 / Math.sqrt(p.yearDays / 88)) * dt * speedRef.current;
          meshes[i].rotation.y += dt * 0.6 * speedRef.current;
        });
        sun.rotation.y += dt * 0.1;
      }
      planets.forEach((_, i) => groups[i].position.set(Math.cos(angles[i]) * distOf(i), 0, Math.sin(angles[i]) * distOf(i)));

      // Kamera követi a kiválasztott bolygót
      const sel = selRef.current;
      const goal = sel === null ? tmp.set(0, 0, 0) : tmp.copy(groups[sel].position);
      const offset = camera.position.clone().sub(controls.target);
      const wantLen = sel === null ? 110 : sizeOf(planets[sel]) * 5 + 3;
      if (sel === null || offset.length() > wantLen * 1.02 || offset.length() < wantLen * 0.5) {
        offset.setLength(THREE.MathUtils.lerp(offset.length(), wantLen, 0.04));
      }
      controls.target.lerp(goal, 0.08);
      camera.position.copy(controls.target).add(offset);

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointermove", onMove);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(el);
    };
  }, []);

  // Nyilak
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setSelected((s) => ((s ?? -1) + 1) % 8);
      if (e.key === "ArrowLeft") setSelected((s) => ((s ?? 0) + 7) % 8);
      if (e.key === "Escape") setSelected(null);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const p = selected === null ? null : planets[selected];

  return (
    <>
      <style>{css}</style>
      <div ref={mountRef} className="scene" />

      <header className="title">
        <span className="pill">3D · Interaktív</span>
        <h1>A <em>Naprendszer</em></h1>
        <p>Húzd a nézetet, görgess a nagyításhoz, kattints egy bolygóra!</p>
      </header>

      <aside className="panel info">
        {p ? (
          <div key={p.name} className="fade">
            <h2>{p.name}</h2>
            <span className="badge">{p.type}</span>
            <p className="fact">{p.fact}</p>
            <div className="stats">
              <div className="stat"><b>{p.diameterKm.toLocaleString("hu-HU")} km</b><span>Átmérő</span></div>
              <div className="stat"><b>{p.moons}</b><span>Ismert hold</span></div>
              <div className="stat"><b>{p.dayLength}</b><span>Egy nap</span></div>
              <div className="stat"><b>{p.yearDays.toLocaleString("hu-HU")} nap</b><span>Egy év</span></div>
              <div className="stat"><b>{p.tempC}</b><span>Hőmérséklet</span></div>
              <div className="stat"><b>{(p.diameterKm / 12742).toFixed(2)}×</b><span>A Földhöz képest</span></div>
            </div>
          </div>
        ) : (
          <div className="fade">
            <h2>Áttekintés</h2>
            <p className="fact">Válassz egy bolygót az alsó sávból, vagy kattints rá közvetlenül a 3D térben. A kamera odarepül, és követi a keringését.</p>
          </div>
        )}
        <div className="controls">
          <button className="btn" onClick={() => setPaused((v) => !v)}>{paused ? "▶ Indítás" : "⏸ Szünet"}</button>
          <label className="speed">
            Sebesség
            <input type="range" min="0.2" max="6" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </label>
        </div>
      </aside>

      <nav className="dock">
        <button className={`chip ${selected === null ? "on" : ""}`} onClick={() => setSelected(null)}>☀ Áttekintés</button>
        {planets.map((pl, i) => (
          <button key={pl.name} className={`chip ${selected === i ? "on" : ""}`} onClick={() => setSelected(i)}>
            <i style={{ background: pl.color }} />{pl.name}
          </button>
        ))}
      </nav>
    </>
  );
}

const css = `
*{box-sizing:border-box;margin:0}
html,body,#root{height:100%}
body{background:#030614;color:#e9edff;font-family:system-ui,-apple-system,sans-serif;overflow:hidden}
.scene{position:fixed;inset:0;cursor:grab}
.scene canvas{display:block}
.title{position:fixed;top:20px;left:24px;pointer-events:none;max-width:360px}
.pill{display:inline-block;padding:3px 12px;border-radius:999px;background:#1a2260cc;color:#a9b6ff;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}
.title h1{font-size:clamp(1.8rem,4vw,2.8rem);letter-spacing:-.03em;margin-top:8px}
.title em{font-style:normal;background:linear-gradient(90deg,#ffd36b,#ff7ab8,#7a8cff);-webkit-background-clip:text;background-clip:text;color:transparent}
.title p{margin-top:6px;color:#93a0d6;font-size:.88rem}
.panel{background:rgba(10,15,42,.72);backdrop-filter:blur(10px);border:1px solid #232d6b;border-radius:20px;padding:20px}
.info{position:fixed;top:20px;right:20px;width:330px}
.fade{animation:fade .4s ease}
@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.info h2{font-size:1.7rem}
.badge{display:inline-block;margin:6px 0 10px;padding:2px 12px;border-radius:999px;background:#1c2766;color:#a9b6ff;font-size:.8rem}
.fact{color:#c3cbee;line-height:1.5;font-size:.92rem}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:14px 0}
.stat{background:#131b4a;border-radius:10px;padding:8px 10px}
.stat b{display:block;font-size:.92rem}
.stat span{color:#8793c7;font-size:.72rem}
.controls{display:flex;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap}
.btn{background:#18215a;color:#dfe5ff;border:1px solid #2f3b8a;border-radius:10px;padding:7px 14px;cursor:pointer;font-size:.9rem}
.btn:hover{background:#2a3694}
.speed{display:flex;flex-direction:column;font-size:.72rem;color:#8793c7;gap:2px}
.speed input{width:120px;accent-color:#7a8cff}
.dock{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;padding:8px;border-radius:999px;background:rgba(10,15,42,.75);backdrop-filter:blur(10px);border:1px solid #232d6b;max-width:calc(100vw - 24px);overflow-x:auto}
.chip{display:flex;align-items:center;gap:6px;white-space:nowrap;background:none;border:0;color:#cfd6f2;padding:7px 13px;border-radius:999px;cursor:pointer;font-size:.88rem}
.chip i{width:10px;height:10px;border-radius:50%;display:inline-block}
.chip:hover{background:#1a2366}
.chip.on{background:#4458d8;color:#fff}
@media(max-width:820px){.info{top:auto;bottom:74px;right:12px;left:12px;width:auto;max-height:42vh;overflow:auto}.title{left:14px;top:12px}.title p{display:none}}
`;
