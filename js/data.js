// WitByte curriculum metadata

export const TRACKS = {
  cs: {
    name: 'Computer Science',
    color: 'cs',
    tagline: 'Beyond coding — SDLC, architecture, databases, APIs, security, production engineering',
    modules: 15,
    hours: 180,
    phases: ['Foundation — How Systems Are Built','Intermediate — Building Production Systems','Advanced — Production at Scale'],
    targetRole: 'Software Engineer',
    whyCare: 'The engineer other engineers trust in production — you will own databases, deploys, monitoring, and the 2am incident response.'
  },
  hw: {
    name: 'Hardware',
    color: 'hw',
    tagline: 'Digital logic to SoC architecture — processors, memory, buses, RTOS, firmware, silicon lifecycle',
    modules: 14,
    hours: 142,
    phases: ['Foundation — Digital Systems','Intermediate — Hardware Interfaces','Advanced — Software on Hardware'],
    targetRole: 'Hardware / Embedded Engineer',
    whyCare: 'Bring up boards from bare silicon — read datasheets, debug power rails, choose bus protocols, and ship real hardware.'
  },
  bsp: {
    name: 'BSP',
    subtitle: 'Board Support & System Software',
    color: 'bsp',
    tagline: 'The hardware-OS bridge — boot sequences, kernel drivers, device trees, subsystem deep dives',
    modules: 15,
    hours: 156,
    phases: ['Foundation — Getting a Board to Boot','Intermediate — Driver & System Development','Advanced — Subsystem Deep Dives'],
    targetRole: 'BSP / Systems Software Engineer',
    whyCare: 'Make Linux boot on new hardware — device trees, kernel drivers, build systems. The most underserved skill in embedded.'
  },
  ai: {
    name: 'AI & ML',
    color: 'ai',
    tagline: 'Build with AI and build the models underneath — agents, RAG, fine-tuning, deployment',
    modules: 21,
    hours: 246,
    phases: ['Foundations','Build WITH AI','Make & Fine-tune AI','Capstone'],
    targetRole: 'AI Engineer',
    whyCare: 'Ship the whole AI product — the app, the RAG pipeline, the agent framework, the eval harness that proves it works, and the serving stack that runs it. You will size GPUs, quantize models, benchmark quality, and deploy to cloud or edge.'
  }
};


export const CONNECTIONS = [
  {name:'APIs everywhere',from:'CS · 04 APIs',to:'BSP · 08 HAL',what:'API design principles apply to HAL interfaces and driver APIs',c1:'cs',c2:'bsp'},
  {name:'Memory hierarchy',from:'HW · 02 Architecture',to:'CS · 11 Performance',what:'Understanding cache/memory informs software caching strategy',c1:'hw',c2:'cs'},
  {name:'Security stack',from:'CS · 07 Security',to:'HW · 08 TrustZone',what:'Software security concepts ground hardware secure elements',c1:'cs',c2:'hw'},
  {name:'Bus → Driver',from:'HW · 06 Bus Protocols',to:'BSP · 09 Peripheral Drivers',what:'Hardware protocol knowledge enables writing correct drivers',c1:'hw',c2:'bsp'},
  {name:'Power across layers',from:'HW · 07 Clock/Power',to:'BSP · 14 Power Frameworks',what:'Hardware power domains map to kernel power management',c1:'hw',c2:'bsp'},
  {name:'SoC → BSP',from:'HW · 04 SoC Architecture',to:'BSP · 01 What is a BSP?',what:'SoC block diagram becomes the BSP scope document',c1:'hw',c2:'bsp'},
  {name:'Observability',from:'CS · 10 Observability',to:'AI · 10 Langfuse',what:'Same mental model — logs, metrics, traces — applied to AI systems',c1:'cs',c2:'ai'},
  {name:'On-device AI',from:'HW · 04 SoC (NPU)',to:'AI · 19 On-device',what:'NPU architecture informs model quantization & deployment',c1:'hw',c2:'ai'},
  {name:'Production eng',from:'CS · 09 DevOps',to:'AI · 14 Production Eng',what:'Same Docker/CI/testing patterns, applied to AI services',c1:'cs',c2:'ai'}
];
