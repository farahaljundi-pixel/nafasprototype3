import { useState, useEffect, useRef, useCallback } from "react";

// ─── TOKENS ──────────────────────────────────────────────────────
const B = {
  ink: "#09090b", panel: "#111113",
  gold: "#C9A84C", goldDim: "rgba(201,168,76,0.13)",
  parchment: "#F9F3E8", parchmentDim: "rgba(249,243,232,0.52)",
  parchmentFaint: "rgba(249,243,232,0.04)",
};

// ─── ZONE DATA ────────────────────────────────────────────────────
const ZONES = {
  crown:     { label:"Crown · Sahasrara",         title:"Disconnection & the Pineal Field",     color:[140,72,180],  hsl:[280,52,50], imgKey:"sky",
    anatomy:"The crown corresponds to the prefrontal cortex and pineal gland — the body's light-sensitive clock. Chronic stress disrupts melatonin regulation, creating brain fog and the felt sense of being unable to arrive in your own life." },
  thirdeye:  { label:"Third Eye · Ajna",           title:"Intuition & the Narrowed Field",       color:[80,68,160],   hsl:[244,40,44], imgKey:"night",
    anatomy:"Cortisol under chronic stress literally shrinks prefrontal grey matter, narrowing perception to threat-scanning. When the amygdala dominates, we lose access to what we already know — a peculiar grief of not trusting ourselves." },
  jaw:       { label:"Jaw · Withheld Expression",  title:"The Masseter & What Goes Unsaid",      color:[100,140,160], hsl:[200,24,50], imgKey:"water",
    anatomy:"The masseter tightens to brace, absorb, contain what cannot be said. The trigeminal nerve communicates directly with the vagal system — tension here signals threat, creating a feedback loop the body struggles to exit alone." },
  throat:    { label:"Throat · Vishuddha",         title:"The Vagus Nerve & Silenced Truth",     color:[58,120,160],  hsl:[207,46,42], imgKey:"water",
    anatomy:"The vagus nerve passes directly through the throat — the primary channel of the parasympathetic system. The hyoid bone, anchoring the tongue, is held entirely by muscle, making it exquisitely sensitive to emotional suppression." },
  shoulders: { label:"Shoulders · The Burden",     title:"The Trapezius & Chronic Vigilance",    color:[90,130,180],  hsl:[216,34,52], imgKey:"mountain",
    anatomy:"The upper trapezius — the body's primary bracing muscle — runs skull to shoulder. Chronic elevation compresses cervical vertebrae and restricts blood flow to the brain. The brachial plexus emerges here, meaning shoulder tension can manifest as tingling hands." },
  heart:     { label:"Heart · Anahata",            title:"Cardiac Coherence & Grief",            color:[72,140,110],  hsl:[153,33,42], imgKey:"forest",
    anatomy:"The heart has its own nervous system — 40,000 neurons, sending more signals to the brain than it receives. Grief suppresses Heart Rate Variability. The pericardium physically tightens with sustained emotional pain, creating the sensation of heaviness in the chest." },
  solar:     { label:"Solar Plexus · Manipura",    title:"The Enteric Brain & Collapsed Power",  color:[194,158,48],  hsl:[44,62,47],  imgKey:"desert",
    anatomy:"500 million neurons line the digestive tract — the enteric second brain. The solar plexus is the largest nerve ganglion outside the brain. Stress suppresses gut motility and creates the felt loss of authority: the stomach knot before confrontation." },
  sacral:    { label:"Sacral · Svadhisthana",      title:"The Psoas & the Cost of Not Feeling",  color:[180,96,48],   hsl:[25,56,44],  imgKey:"water",
    anatomy:"The psoas major crosses the sacral plexus, directly innervated by fight-or-flight. Chronic contraction tilts the pelvis and suppresses sensation — pleasure, creativity, and desire are physiologically shut down when the body cannot afford to feel good." },
  hips:      { label:"Hips · Ancestral Storage",   title:"The Iliopsoas & Inherited Bracing",    color:[150,80,80],   hsl:[0,32,45],   imgKey:"ancestors",
    anatomy:"The iliopsoas stores unprocessed shock in the hip fascia. Peter Levine's research shows trembling during somatic release is the body completing interrupted defensive responses — finishing what the nervous system started and never resolved." },
  root:      { label:"Root · Muladhara",           title:"The Pelvic Floor & the Right to Exist",color:[139,58,58],   hsl:[0,40,38],   imgKey:"ground",
    anatomy:"The pelvic floor contracts involuntarily under threat. In people who have experienced chronic danger — violence, displacement, precarity — it may never fully release. The pudendal nerve makes root tension an embodied response to the most fundamental violations of safety." },
};

// vertical position on body (0–1)
const ZONE_Y = { crown:.22, thirdeye:.32, jaw:.37, throat:.41, shoulders:.44, heart:.50, solar:.55, sacral:.60, hips:.63, root:.67 };

// ─── IMAGES ──────────────────────────────────────────────────────
const IMGS = {
  sky:       "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1400&q=80",
  night:     "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1400&q=80",
  water:     "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1400&q=80",
  mountain:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80",
  forest:    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80",
  desert:    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=80",
  ground:    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1400&q=80",
  ancestors: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80",
  grief:     "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1400&q=80",
  anger:     "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1400&q=80",
  joy:       "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1400&q=80",
  fear:      "https://images.unsplash.com/photo-1504198266287-1659872e6590?w=1400&q=80",
  love:      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1400&q=80",
  breath:    "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=1400&q=80",
  welcome:   "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1400&q=80",
};

const EMOTION_KW = {
  grief:["grief","loss","sad","cry","mourn","miss","gone","empty","alone"],
  anger:["anger","rage","furious","frustrated","resent","livid"],
  joy:["joy","happy","delight","grateful","alive","free","pleasure"],
  fear:["fear","anxious","scared","panic","dread","worry","unsafe"],
  love:["love","warmth","tender","close","beloved","held","longing"],
  breath:["breathe","breath","inhale","exhale","air","lungs","prana"],
  ground:["ground","earth","settle","anchor","soil"],
  ancestors:["ancestor","ancestral","lineage","generational","inherited"],
};
const ZONE_KW = {
  crown:    ["head","headache","disconnected","fog","brain","meaning","purpose","spiritual","crown","confused","overwhelm","mind","scattered","lost"],
  thirdeye: ["vision","intuition","knowing","trust","see","eyes","forehead","pressure","insomnia","dreams"],
  jaw:      ["jaw","clench","grind","teeth","silence","unsaid","brace","face","tense","tmj"],
  throat:   ["throat","voice","words","silence","swallow","choke","express","tight","say","speak"],
  shoulders:["shoulders","neck","carry","burden","weight","responsible","tense","upper back","bracing","hunched"],
  heart:    ["heart","chest","grief","love","loss","tight","breathe","heavy","broken","hurt","ache","longing"],
  solar:    ["stomach","gut","power","nausea","knot","nervous","agency","confidence","control","belly","anxious"],
  sacral:   ["pelvis","creativity","pleasure","desire","flow","creative","joy","want","lower belly"],
  hips:     ["hips","hip","ancestral","stored","release","psoas","stiff","generational","ancestors","inherited"],
  root:     ["root","ground","safe","safety","belong","home","survival","land","base","pelvic","foundation","exist","earth"],
};

function detectZones(text) {
  const t = text.toLowerCase();
  return Object.entries(ZONE_KW).filter(([,kws])=>kws.some(k=>t.includes(k))).map(([z])=>z);
}
function detectEmotion(text) {
  const t = text.toLowerCase();
  for (const [e,kws] of Object.entries(EMOTION_KW)) if (kws.some(k=>t.includes(k))) return e;
  return null;
}
function pickImageKey(text, zones) {
  if (zones.length > 0 && ZONES[zones[0]]) return ZONES[zones[0]].imgKey;
  const e = detectEmotion(text);
  if (e && IMGS[e]) return e;
  return null;
}

// ─── ORB CANVAS HOOK ─────────────────────────────────────────────
function useOrb(canvasRef) {
  const state = useRef({
    T:0, x:0, y:0, tx:0, ty:0,
    h:42, s:52, l:50, th:42, ts:52, tl:50,
    r:0.26, tr:0.26,
    nx:Math.random()*80, ny:Math.random()*80,
    sats: Array.from({length:5},(_,i)=>({ phase:(i/5)*Math.PI*2, speed:0.00035+Math.random()*0.00035, orbit:0.11+Math.random()*0.09, rFrac:0.055+Math.random()*0.07, dh:(Math.random()-.5)*55, a:0.1+Math.random()*0.13 })),
    raf:null,
  });

  const lerp = (a,b,t) => a+(b-a)*t;
  const sn = (x,s1,s2,T) => Math.sin(x*1.3+T*s1)*.5 + Math.sin(x*2.8+T*s2)*.3 + Math.sin(x*.65+T*(s1*.4))*.2;

  const setTarget = useCallback((h,s,l,yFrac=null) => {
    const o = state.current;
    o.th=h; o.ts=s; o.tl=l;
    if (yFrac!=null && canvasRef.current) o.ty = canvasRef.current.height * yFrac;
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const o = state.current;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      o.x = o.tx = canvas.width  * 0.5;
      o.y = o.ty = canvas.height * 0.44;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function frame() {
      const W = canvas.width, H = canvas.height;
      o.nx+=.0028; o.ny+=.0022;
      const dx = sn(o.nx,.16,.08,o.T)*W*.038;
      const dy = sn(o.ny,.12,.06,o.T)*H*.032;
      o.x  = lerp(o.x,  o.tx+dx, .011);
      o.y  = lerp(o.y,  o.ty+dy, .011);
      o.h  = lerp(o.h,  o.th,    .009);
      o.s  = lerp(o.s,  o.ts,    .009);
      o.l  = lerp(o.l,  o.tl,    .009);
      o.r  = lerp(o.r,  o.tr,    .007);

      const breathe = 1 + .065*Math.sin(o.T*.65) + .028*Math.sin(o.T*1.35);
      const R = o.r * Math.min(W,H) * breathe;

      ctx.clearRect(0,0,W,H);

      // outer atmosphere
      const atm = ctx.createRadialGradient(o.x,o.y,R*.3,o.x,o.y,R*3.2);
      atm.addColorStop(0,  `hsla(${o.h},${o.s}%,${o.l}%,.1)`);
      atm.addColorStop(.5, `hsla(${o.h},${o.s}%,${o.l}%,.04)`);
      atm.addColorStop(1,  `hsla(${o.h},${o.s}%,${o.l}%,0)`);
      ctx.fillStyle=atm; ctx.fillRect(0,0,W,H);

      // mid bloom
      const bloom = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,R*1.7);
      bloom.addColorStop(0,  `hsla(${o.h},${o.s}%,${o.l+12}%,.28)`);
      bloom.addColorStop(.45,`hsla(${o.h},${o.s}%,${o.l}%,.13)`);
      bloom.addColorStop(1,  `hsla(${o.h},${o.s}%,${o.l}%,0)`);
      ctx.fillStyle=bloom; ctx.beginPath(); ctx.arc(o.x,o.y,R*1.7,0,Math.PI*2); ctx.fill();

      // warped morphing core
      ctx.save(); ctx.globalAlpha=0.9;
      const core = ctx.createRadialGradient(o.x-R*.18,o.y-R*.22,0,o.x,o.y,R);
      core.addColorStop(0,   `hsla(${o.h+22},${o.s-8}%,${o.l+30}%,.96)`);
      core.addColorStop(.32, `hsla(${o.h},${o.s}%,${o.l}%,.84)`);
      core.addColorStop(.68, `hsla(${o.h-14},${o.s+12}%,${o.l-14}%,.52)`);
      core.addColorStop(1,   `hsla(${o.h-28},${o.s+18}%,${o.l-22}%,0)`);
      ctx.fillStyle=core;
      ctx.beginPath();
      for (let i=0;i<=72;i++){
        const a=(i/72)*Math.PI*2;
        const w=1+.10*sn(a*1.2,.21,.10,o.T)+.06*sn(a*2.6,.34,.18,o.T)+.03*Math.sin(a*5+o.T*.58);
        const pr=R*w;
        i===0 ? ctx.moveTo(o.x+pr*Math.cos(a),o.y+pr*Math.sin(a))
              : ctx.lineTo(o.x+pr*Math.cos(a),o.y+pr*Math.sin(a));
      }
      ctx.closePath(); ctx.fill(); ctx.restore();

      // inner specular
      const spec = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,R*.38);
      spec.addColorStop(0,`hsla(${o.h+35},22%,97%,.52)`);
      spec.addColorStop(1,`hsla(${o.h+35},22%,97%,0)`);
      ctx.fillStyle=spec; ctx.beginPath(); ctx.arc(o.x,o.y,R*.38,0,Math.PI*2); ctx.fill();

      // satellite orbs
      o.sats.forEach(s=>{
        s.phase+=s.speed*(o.T*.008+.016);
        const mx=o.x+Math.cos(s.phase)*W*s.orbit;
        const my=o.y+Math.sin(s.phase)*H*s.orbit*.6;
        const mr=s.rFrac*Math.min(W,H)*(0.88+.12*Math.sin(o.T*.48+s.phase));
        const sg=ctx.createRadialGradient(mx,my,0,mx,my,mr);
        sg.addColorStop(0,`hsla(${o.h+s.dh},${o.s}%,${o.l+10}%,${s.a})`);
        sg.addColorStop(1,`hsla(${o.h+s.dh},${o.s}%,${o.l}%,0)`);
        ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(mx,my,mr,0,Math.PI*2); ctx.fill();
      });

      // tendrils
      for(let t=0;t<4;t++){
        const ba=(t/4)*Math.PI*2+o.T*.038;
        ctx.beginPath();
        ctx.strokeStyle=`hsla(${o.h+t*18},${o.s}%,${o.l+8}%,.055)`;
        ctx.lineWidth=1.5;
        const tl=R*(1.7+.6*Math.sin(o.T*.28+t));
        for(let k=0;k<=28;k++){
          const f=k/28;
          const ang=ba+sn(f*3+t,.18,.09,o.T)*.85;
          const dist=f*tl;
          k===0?ctx.moveTo(o.x+Math.cos(ang)*dist,o.y+Math.sin(ang)*dist)
               :ctx.lineTo(o.x+Math.cos(ang)*dist,o.y+Math.sin(ang)*dist);
        }
        ctx.stroke();
      }

      o.T+=.016;
      o.raf = requestAnimationFrame(frame);
    }
    o.raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(o.raf); ro.disconnect(); };
  }, [canvasRef]);

  return { setTarget };
}

// ─── SYSTEM PROMPT ───────────────────────────────────────────────
const SYSTEM = `You are the Nafas Guide — created by Farah Al-Jundi, a 1000-hour certified Integrative Yoga and Embodied Wellness Coach specialising in the Spiritual Sciences. Nafas (نَفَس) means breath in Arabic.

Your voice: warm, grounded, poetic but precise. You speak like a wise practitioner who has studied deeply — not a clinician, not a wellness influencer. You hold somatic, spiritual, and political dimensions simultaneously without performing any of them.

EVERY response must end with a HOLO block and optionally an EXERCISE block.

FORMAT — in this order:

[Your spoken response — warm, present, embodied. Under 130 words unless teaching anatomy or a practice.]

EXERCISE:{"name":"Practice Name","type":"Somatic / Breathwork / Movement","steps":"Step 1. ...\\nStep 2. ...\\nStep 3. ...","teacher":"Full Teacher Name — Book or Tradition"}

HOLO:{"zones":["heart","shoulders"],"imgKey":"forest","hsl":[153,33,42],"caption":"what the chest has been holding","attr":"After bell hooks — love as practice"}

HOLO rules:
- zones: any subset of: crown, thirdeye, jaw, throat, shoulders, heart, solar, sacral, hips, root. Use [] if none.
- imgKey: one of: sky, night, water, mountain, forest, desert, ground, ancestors, grief, anger, joy, fear, love, breath, welcome
- hsl: [hue, saturation, lightness] array to set the orb colour. Match the emotional tone. Examples: grief=[220,32,44], anger=[8,70,46], joy=[52,76,60], fear=[196,38,40], love=[340,52,50], breath=[192,48,54], heart=[153,33,42], root=[0,40,38], crown=[280,52,50]
- caption: poetic phrase under 8 words naming what is being held
- attr: "After [Teacher Name] — [concept]" or ""

IMAGE KEY GUIDE:
- grief, loss, sadness → grief or water
- anger → anger
- joy, pleasure → joy
- fear, anxiety → fear
- love, tenderness → love
- throat, voice → water
- heart, grief, love → forest
- root, earth, safety → ground
- hips, ancestry → ancestors
- power, gut, agency → desert
- breath, flow → breath
- crown, spirit, mind → sky or night
- shoulders, burden → mountain

ANATOMY: When a body zone is relevant, weave one sentence in naturally explaining WHY that area holds what it holds — physiologically, neurologically. Not as a lecture. As illumination.

EXERCISE: Include when genuinely useful. Name the teacher in your spoken text AND in the attribution field.

TONE:
- Never say "amazing", "I hear you", "that's valid", "wonderful"
- Speak from the body, not at it
- One precise question — never a list
- Never perform care. Embody it.
- Hold political, ancestral, collective material when the client names it.`;

// ─── API CALL ────────────────────────────────────────────────────
async function callAPI(messages) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM,
      messages,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `HTTP ${resp.status}`);
  return data.content?.[0]?.text || "";
}

function parseBlock(raw, tag) {
  const re = new RegExp(tag + ":(\\{[\\s\\S]*?\\})(?:\\n|$)");
  const m = raw.match(re);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
function stripBlocks(text) {
  return text.replace(/EXERCISE:\{[\s\S]*?\}(\n|$)/g,"").replace(/HOLO:\{[\s\S]*?\}(\n|$)/g,"").trim();
}

// ─── EXERCISE CARD ───────────────────────────────────────────────
function ExCard({ ex }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop:13, border:`1px solid ${B.goldDim}`, borderRadius:6, overflow:"hidden", background:"rgba(201,168,76,0.025)" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", cursor:"pointer", background: open?"rgba(201,168,76,0.05)":"transparent", borderBottom: open?`1px solid ${B.goldDim}`:"none" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:B.gold, opacity:.52, marginBottom:2 }}>{ex.type||"Practice"}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14.5, color:B.parchment }}>{ex.name||"Exercise"}</div>
        </div>
        <span style={{ color:B.gold, opacity:.3, fontSize:11, transition:"transform .3s", transform: open?"rotate(180deg)":"none" }}>▾</span>
      </div>
      {open && (
        <div style={{ padding:"14px 16px 16px" }}>
          <div style={{ fontSize:12.5, lineHeight:1.88, color:B.parchmentDim, whiteSpace:"pre-line" }}>{(ex.steps||"").replace(/\\n/g,"\n")}</div>
          {ex.teacher && <div style={{ marginTop:10, paddingTop:9, borderTop:`1px solid ${B.goldDim}`, fontSize:10.5, letterSpacing:"0.05em", color:B.gold, opacity:.46, fontStyle:"italic" }}>— {ex.teacher}</div>}
        </div>
      )}
    </div>
  );
}

// ─── BODY SVG ────────────────────────────────────────────────────
function BodySVG({ activeZones, onZoneClick }) {
  const zoneIds = Object.keys(ZONES);
  return (
    <svg viewBox="0 0 220 500" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"auto" }}>
      <defs>
        <radialGradient id="bGrad2" cx="50%" cy="38%" r="52%">
          <stop offset="0%" stopColor="rgba(40,40,44,0.72)"/>
          <stop offset="100%" stopColor="rgba(5,5,7,0.52)"/>
        </radialGradient>
        <filter id="bGlow2" x="-25%" y="-12%" width="150%" height="124%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="zGlow2" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g filter="url(#bGlow2)">
        <ellipse cx="110" cy="44" rx="27" ry="32" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <rect x="100" y="73" width="20" height="18" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M68 91 Q56 100 53 125 L50 215 Q53 225 68 228 L152 228 Q167 225 170 215 L167 125 Q164 100 152 91 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <ellipse cx="62" cy="102" rx="16" ry="11" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <ellipse cx="158" cy="102" rx="16" ry="11" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M48 102 Q35 118 34 148 L36 170 Q42 174 52 170 L54 142 Q56 116 62 105 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M172 102 Q185 118 186 148 L184 170 Q178 174 168 170 L166 142 Q164 116 158 105 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M34 170 Q30 198 32 224 L40 224 Q44 200 42 172 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M186 170 Q190 198 188 224 L180 224 Q176 200 178 172 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M50 224 Q47 242 52 260 L70 270 L150 270 L168 260 Q173 242 170 224 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M70 268 Q60 288 62 320 L76 325 Q82 293 86 271 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M150 268 Q160 288 158 320 L144 325 Q138 293 134 271 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M62 320 Q58 355 60 388 L74 390 Q78 358 76 326 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <path d="M158 320 Q162 355 160 388 L146 390 Q142 358 144 326 Z" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <ellipse cx="67" cy="396" rx="13" ry="8" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
        <ellipse cx="153" cy="396" rx="13" ry="8" fill="url(#bGrad2)" stroke="rgba(249,243,232,.07)" strokeWidth="1"/>
      </g>
      <line x1="110" y1="78" x2="110" y2="256" stroke="rgba(201,168,76,.06)" strokeWidth="1" strokeDasharray="3 8"/>

      {/* Zone glows */}
      {[
        {id:"crown",     tag:"circle",  props:{cx:110,cy:16, r:18}},
        {id:"thirdeye",  tag:"circle",  props:{cx:110,cy:46, r:11}},
        {id:"jaw",       tag:"ellipse", props:{cx:110,cy:65, rx:14,ry:9}},
        {id:"throat",    tag:"circle",  props:{cx:110,cy:82, r:12}},
        {id:"shoulders", tag:"ellipse", props:{cx:110,cy:100,rx:64,ry:14}},
        {id:"heart",     tag:"circle",  props:{cx:110,cy:144,r:25}},
        {id:"solar",     tag:"circle",  props:{cx:110,cy:186,r:20}},
        {id:"sacral",    tag:"circle",  props:{cx:110,cy:220,r:18}},
        {id:"hips",      tag:"ellipse", props:{cx:110,cy:245,rx:52,ry:16}},
        {id:"root",      tag:"circle",  props:{cx:110,cy:260,r:17}},
      ].map(({id, tag, props}) => {
        const active = activeZones.includes(id);
        const zd = ZONES[id];
        const [r,g,b] = zd.color;
        const fill = active ? `rgba(${r},${g},${b},0.52)` : "rgba(0,0,0,0)";
        const Tag = tag;
        return (
          <Tag key={id} {...props} fill={fill} filter="url(#zGlow2)"
            style={{ transition:"fill 1s ease", cursor:"pointer" }}
            onClick={()=>onZoneClick(id)}
          />
        );
      })}
    </svg>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
function NafasGuide({ intakeContext }) {
  const orbRef   = useRef(null);
  const { setTarget } = useOrb(orbRef);

  const [msgs, setMsgs]           = useState([]);
  const [history, setHistory]     = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [activeZones, setActiveZones] = useState([]);
  const [imgKey, setImgKey]       = useState(null);
  const [imgVisible, setImgVisible] = useState(false);
  const [washColor, setWashColor] = useState(null);
  const [caption, setCaption]     = useState({ zone:null, title:"", attr:"" });
  const [annotation, setAnnotation] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, loading]);

  // Boot message — uses intake context if available
  useEffect(() => {
    setTimeout(() => {
      if (intakeContext) {
        setMsgs([{ role:"guide", text:intakeContext, zones:[], ex:null }]);
      } else {
        setMsgs([{ role:"guide", text:"Welcome to Nafas — نَفَس.\n\nBefore we begin, I want to know what brought you here — not your history, not your goals.\n\nWhat is alive in your body right now?", zones:[], ex:null }]);
      }
    }, 600);
  }, [intakeContext]);

  function applyHolo(holo) {
    if (!holo) return;
    const zones = holo.zones || [];
    setActiveZones(zones);
    if (holo.imgKey && IMGS[holo.imgKey]) {
      setImgKey(holo.imgKey);
      setImgVisible(false);
      setTimeout(() => setImgVisible(true), 350);
    }
    if (holo.hsl) setTarget(holo.hsl[0], holo.hsl[1], holo.hsl[2], zones[0] ? ZONE_Y[zones[0]] : null);
    if (holo.caption || zones[0]) setCaption({ zone: zones[0]||null, title: holo.caption||"", attr: holo.attr||"" });
    if (zones[0]) setAnnotation(ZONES[zones[0]] || null);
    const wc = zones[0] ? ZONES[zones[0]].color : null;
    setWashColor(wc);
  }

  function reactInstant(text) {
    const zones = detectZones(text);
    const ik    = pickImageKey(text, zones);
    const emotion = detectEmotion(text);
    if (zones.length > 0) {
      setActiveZones(zones);
      const zd = ZONES[zones[0]];
      setTarget(zd.hsl[0], zd.hsl[1], zd.hsl[2], ZONE_Y[zones[0]]);
      setWashColor(zd.color);
    } else if (emotion) {
      const moods = { grief:[220,32,44], anger:[8,70,46], joy:[52,76,60], fear:[196,38,40], love:[340,52,50], breath:[192,48,54], ground:[22,42,36], ancestors:[18,38,38] };
      const m = moods[emotion] || [42,52,50];
      setTarget(m[0],m[1],m[2],null);
      setWashColor(null);
    }
    if (ik && IMGS[ik]) {
      setImgKey(ik);
      setImgVisible(false);
      setTimeout(() => setImgVisible(true), 340);
    }
  }

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMsgs(m => [...m, { role:"client", text }]);
    const newHistory = [...history, { role:"user", content:text }];
    setHistory(newHistory);
    reactInstant(text);
    setLoading(true);
    try {
      const raw = await callAPI(newHistory);
      const holo = parseBlock(raw, "HOLO");
      const ex   = parseBlock(raw, "EXERCISE");
      const clean = stripBlocks(raw);
      setHistory(h => [...h, { role:"assistant", content:raw }]);
      applyHolo(holo);
      setMsgs(m => [...m, { role:"guide", text:clean, zones: holo?.zones||[], ex: ex||null }]);
    } catch(e) {
      setMsgs(m => [...m, { role:"guide", text:`Connection error: ${e.message}`, zones:[], ex:null }]);
    }
    setLoading(false);
  }

  // ─── render
  const stageStyle = {
    position:"relative", overflow:"hidden", background:"#050507",
    display:"flex", alignItems:"center", justifyContent:"center",
  };
  const vignetteStyle = {
    position:"absolute", inset:0,
    background:"radial-gradient(ellipse at 50% 50%, transparent 28%, rgba(0,0,0,0.88) 100%)",
    pointerEvents:"none", zIndex:10,
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", height:"100vh", width:"100vw", background:B.ink, color:B.parchment, fontFamily:"Inter, sans-serif", fontWeight:300, overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&family=Noto+Naskh+Arabic:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.13);border-radius:2px;}
        @keyframes msgin{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);}}
        @keyframes sdot{0%,100%{opacity:1;}50%{opacity:.18;}}
        @keyframes tdot{0%,80%,100%{transform:scale(.7);opacity:.26;}40%{transform:scale(1);opacity:1;}}
        @keyframes bodyIn{from{opacity:0;transform:scale(.94) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}
      `}</style>

      {/* ══ STAGE ══ */}
      <div style={stageStyle}>
        {/* orb canvas — always visible */}
        <canvas ref={orbRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:1 }}/>

        {/* image — fades in over orb */}
        {imgKey && (
          <div style={{ position:"absolute", inset:0, zIndex:2, opacity: imgVisible?1:0, transition:"opacity 2.2s ease" }}>
            <img src={IMGS[imgKey]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:`saturate(0.38) brightness(0.5)` }}/>
          </div>
        )}

        {/* colour wash */}
        {washColor && imgVisible && (
          <div style={{ position:"absolute", inset:0, zIndex:3, background:`rgb(${washColor[0]},${washColor[1]},${washColor[2]})`, opacity:0.42, mixBlendMode:"color", transition:"background-color 1.6s ease, opacity 1.8s ease" }}/>
        )}

        {/* orb glow stays on top of image */}
        <div style={{ position:"absolute", inset:0, zIndex:4, pointerEvents:"none",
          background:`radial-gradient(ellipse at 50% 44%, rgba(${[42,42,42].join(",")},0) 30%, transparent 70%)` }}/>

        {/* body hologram */}
        {activeZones.length > 0 && (
          <div style={{ position:"absolute", zIndex:6, width:188, animation:"bodyIn 1.5s cubic-bezier(0.22,1,0.36,1) forwards", pointerEvents:"none" }}>
            <BodySVG activeZones={activeZones} onZoneClick={z=>setAnnotation(ZONES[z]||null)}/>
          </div>
        )}

        {/* deep vignette */}
        <div style={vignetteStyle}/>

        {/* caption */}
        <div style={{ position:"absolute", bottom:44, left:0, right:0, textAlign:"center", zIndex:11, pointerEvents:"none" }}>
          {caption.zone && ZONES[caption.zone] && (
            <div style={{ fontSize:9, letterSpacing:"0.32em", textTransform:"uppercase", color:B.gold, opacity:.5, marginBottom:5 }}>
              {ZONES[caption.zone].label}
            </div>
          )}
          {caption.title && (
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontStyle:"italic", color:B.parchment, opacity:.76, textShadow:"0 2px 32px rgba(0,0,0,.98)" }}>
              {caption.title}
            </div>
          )}
          {caption.attr && (
            <div style={{ fontSize:10, letterSpacing:"0.13em", color:B.gold, opacity:.34, marginTop:5 }}>
              {caption.attr}
            </div>
          )}
        </div>

        {/* annotation card */}
        {annotation && (
          <div style={{ position:"absolute", top:"50%", right:24, transform:"translateY(-50%)", width:212, background:"rgba(4,4,6,.93)", border:`1px solid ${B.goldDim}`, borderRadius:5, padding:"16px 18px", zIndex:12, backdropFilter:"blur(16px)" }}>
            <button onClick={()=>setAnnotation(null)} style={{ position:"absolute", top:10, right:12, background:"none", border:"none", color:B.parchmentDim, fontSize:13, cursor:"pointer", opacity:.3 }}>✕</button>
            <div style={{ fontSize:9, letterSpacing:"0.22em", color:B.gold, opacity:.55, textTransform:"uppercase", marginBottom:7 }}>{annotation.label}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14.5, color:B.parchment, marginBottom:9, lineHeight:1.35 }}>{annotation.title}</div>
            <div style={{ fontSize:11.5, lineHeight:1.74, color:B.parchmentDim }}>{annotation.anatomy}</div>
          </div>
        )}
      </div>

      {/* ══ PANEL ══ */}
      <div style={{ display:"flex", flexDirection:"column", background:B.panel, borderLeft:`1px solid ${B.goldDim}`, height:"100vh", overflow:"hidden" }}>

        {/* header */}
        <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${B.goldDim}`, display:"flex", alignItems:"baseline", gap:10, flexShrink:0 }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:300, color:B.gold, letterSpacing:"0.04em" }}>Nafas</span>
          <span style={{ fontFamily:"'Noto Naskh Arabic',serif", fontSize:14, color:B.gold, opacity:.35, direction:"rtl" }}>نَفَس</span>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, fontSize:9, letterSpacing:"0.14em", color:B.parchmentDim, opacity:.35, textTransform:"uppercase" }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:B.gold, animation:"sdot 2.6s ease-in-out infinite" }}/>
            <span>Present</span>
          </div>
        </div>

        {/* chat */}
        <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"22px 20px 8px", display:"flex", flexDirection:"column", gap:18 }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", gap:3, animation:"msgin .42s ease" }}>
              <div style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", opacity: m.role==="guide"?.46:.28, color: m.role==="guide"?B.gold:B.parchment }}>
                {m.role==="guide"?"Nafas Guide":"You"}
              </div>
              {m.role==="guide" ? (
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15.5, color:B.parchment, borderLeft:`2px solid ${B.goldDim}`, paddingLeft:14, lineHeight:1.78, whiteSpace:"pre-wrap" }}>
                  {m.text}
                  {m.ex && <ExCard ex={m.ex}/>}
                  {m.zones && m.zones.length>0 && (
                    <button onClick={()=>{setActiveZones(m.zones);setAnnotation(ZONES[m.zones[0]]||null);}}
                      style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:11, padding:"5px 13px", border:`1px solid ${B.goldDim}`, borderRadius:20, fontSize:10, letterSpacing:"0.11em", color:B.gold, opacity:.58, cursor:"pointer", background:"transparent", textTransform:"uppercase" }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:B.gold, animation:"sdot 1.6s ease-in-out infinite" }}/>
                      See on body — {m.zones.map(z=>ZONES[z]?.label.split("·")[0].trim()||z).join(" · ")}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ background:B.parchmentFaint, border:`1px solid rgba(249,243,232,.07)`, borderRadius:5, padding:"11px 14px", color:B.parchmentDim, alignSelf:"flex-end", maxWidth:"90%", fontSize:14, lineHeight:1.78, whiteSpace:"pre-wrap" }}>
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"2px 0" }}>
              {[0,.18,.36].map((d,i)=>(
                <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:B.gold, animation:`tdot 1.4s ease-in-out ${d}s infinite` }}/>
              ))}
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, fontStyle:"italic", color:B.gold, opacity:.36 }}>The Guide is with you</span>
            </div>
          )}
        </div>

        {/* input */}
        <div style={{ padding:"12px 18px 18px", borderTop:`1px solid ${B.goldDim}`, flexShrink:0 }}>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
            <textarea
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="What is your body saying right now…"
              rows={2}
              style={{ flex:1, background:B.parchmentFaint, border:`1px solid rgba(249,243,232,.07)`, borderRadius:5, padding:"11px 14px", color:B.parchment, fontFamily:"Inter, sans-serif", fontSize:13, resize:"none", outline:"none", lineHeight:1.5, minHeight:44, maxHeight:100 }}
            />
            <button onClick={send} disabled={loading||!input.trim()}
              style={{ background:"transparent", border:`1px solid ${B.goldDim}`, borderRadius:5, color:B.gold, padding:"11px 16px", cursor:"pointer", fontSize:15, lineHeight:1, opacity: loading||!input.trim()?.5:1 }}>
              ↑
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


// ─── LANDING SCREEN ──────────────────────────────────────────────
function Landing({ onStart }) {
  return (
    <div style={{ minHeight:"100vh", background:"#09090b", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, fontFamily:"'Cormorant Garamond',serif" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <p style={{ fontSize:72, color:"rgba(201,168,76,0.15)", letterSpacing:12, marginBottom:-28, fontFamily:"'Noto Naskh Arabic',serif" }}>نَفَس</p>
      <h1 style={{ fontSize:56, fontWeight:300, color:"#F9F3E8", letterSpacing:6, marginBottom:8 }}>NAFAS</h1>
      <p style={{ fontSize:11, letterSpacing:8, color:"rgba(201,168,76,0.6)", marginBottom:40, fontWeight:300 }}>A LIBERATION WELLNESS GUIDE</p>
      <div style={{ height:1, width:80, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)", marginBottom:40 }}/>
      <p style={{ fontSize:16, color:"rgba(249,243,232,0.55)", lineHeight:1.8, textAlign:"center", maxWidth:480, marginBottom:48, fontStyle:"italic" }}>
        An AI guide drawing from 35+ teachers, traditions, and modalities — holding somatic, spiritual, and collective dimensions of healing simultaneously.
      </p>
      <button onClick={onStart} style={{ background:"transparent", border:"1px solid rgba(201,168,76,0.35)", color:"rgba(201,168,76,0.85)", padding:"14px 44px", fontFamily:"'Cormorant Garamond',serif", fontSize:15, letterSpacing:4, cursor:"pointer", transition:"all 0.3s" }}
        onMouseEnter={e=>{ e.target.style.background="rgba(201,168,76,0.08)"; e.target.style.borderColor="rgba(201,168,76,0.7)"; }}
        onMouseLeave={e=>{ e.target.style.background="transparent"; e.target.style.borderColor="rgba(201,168,76,0.35)"; }}>
        BEGIN
      </button>
      <p style={{ fontSize:11, color:"rgba(249,243,232,0.2)", marginTop:48, letterSpacing:2 }}>
        Designed by Farah Al-Jundi · 1,000-Hour Certified Integrative Yoga Coach · Prototype v1.0
      </p>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | guide
  return (
    <>
      {screen === "landing" && <Landing onStart={() => setScreen("guide")} />}
      {screen === "guide"   && <NafasGuide intakeContext={null} />}
    </>
  );
}
