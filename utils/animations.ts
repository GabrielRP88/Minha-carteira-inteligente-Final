import { AnimationConfig } from "../types";

export const ANIMATION_PRESETS = [
  // ELÁSTICOS (GELATINA)
  { id: 'jelly-stretch', name: 'Gelatina Elástica', type: 'Elástico' },
  { id: 'rubber-band', name: 'Borracha Sônica', type: 'Elástico' },
  { id: 'super-bounce', name: 'Super Quique', type: 'Elástico' },
  { id: 'spring-y', name: 'Mola Vertical', type: 'Elástico' },
  { id: 'lateral-snap', name: 'Estalo Lateral', type: 'Elástico' },

  // CINÉTICOS (MOVIMENTO RÁPIDO)
  { id: 'ninja-spin', name: 'Giro Rápido', type: 'Cinético' },
  { id: 'backflip', name: 'Cambalhota', type: 'Cinético' },
  { id: 'tornado', name: 'Vento Forte', type: 'Cinético' },
  { id: 'side-kick', name: 'Deslize Lateral', type: 'Cinético' },
  { id: 'head-bang', name: 'Batida Seca', type: 'Cinético' },

  // DISTORÇÕES (FORMAS)
  { id: 'flat-squash', name: 'Achatamento', type: 'Distorção' },
  { id: 'tower-stretch', name: 'Esticada', type: 'Distorção' },
  { id: 'skew-blast', name: 'Inclinação', type: 'Distorção' },
  { id: 'accordion', name: 'Sanfona', type: 'Distorção' },
  { id: 'perspective-tilt', name: 'Perspectiva', type: 'Distorção' },

  // IMPACTO (FORÇA)
  { id: 'anvil-drop', name: 'Peso Pesado', type: 'Impacto' },
  { id: 'ufo-beam', name: 'Flutuar', type: 'Impacto' },
  { id: 'magnetic-pull', name: 'Atração', type: 'Impacto' },
  { id: 'earthquake', name: 'Tremor', type: 'Impacto' },
  { id: 'implosion', name: 'Encolher', type: 'Impacto' },

  // EFEITOS ESPECIAIS
  { id: 'glitch-jump', name: 'Falha Técnica', type: 'Extremo' },
  { id: 'wobble-crazy', name: 'Balanço', type: 'Extremo' },
  { id: 'orbit-swing', name: 'Pêndulo', type: 'Extremo' },
  { id: 'shiver-cold', name: 'Arrepio', type: 'Extremo' },
  { id: 'pulse-beast', name: 'Pulsação', type: 'Extremo' },
  { id: 'shrink-hide', name: 'Tímido', type: 'Extremo' },
  { id: 'mega-zoom', name: 'Zoom In', type: 'Extremo' },
  { id: 'mirror-flip', name: 'Inverter', type: 'Extremo' },
  { id: 'vortex', name: 'Giro', type: 'Extremo' },
  { id: 'heartbeat', name: 'Coração', type: 'Extremo' }
];

export const applyGlobalAnimations = (config: AnimationConfig) => {
  const styleId = 'wallet-global-animations';
  let styleEl = document.getElementById(styleId);
  
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  if (!config.enabled) {
    styleEl.innerHTML = '';
    return;
  }

  const { type, intensity, speed } = config;
  const duration = (0.5 / speed).toFixed(2); 
  const i = intensity;
  
  const selector = `
    button:not(:disabled), 
    a:not(:disabled), 
    [role="button"]:not(:disabled), 
    .cursor-pointer,
    .transaction-item,
    .bank-card,
    .utility-card,
    input[type="checkbox"],
    input[type="radio"]
  `;

  let keyframes = '';

  switch (type) {
    case 'jelly-stretch':
      keyframes = `
        0%, 100% { transform: scale(1, 1); }
        30% { transform: scale(${1 + (0.3 * i)}, ${1 - (0.15 * i)}); }
        60% { transform: scale(${1 - (0.1 * i)}, ${1 + (0.1 * i)}); }
      `;
      break;
    case 'rubber-band':
      keyframes = `
        0%, 100% { transform: scale3d(1, 1, 1); }
        30% { transform: scale3d(${1 + (0.25 * i)}, ${1 - (0.25 * i)}, 1); }
        50% { transform: scale3d(${1 - (0.15 * i)}, ${1 + (0.15 * i)}, 1); }
      `;
      break;
    case 'super-bounce':
      keyframes = `
        0%, 100% { transform: translateY(0) scale(1); }
        40% { transform: translateY(-${15 * i}px) scale(1.1); }
        60% { transform: translateY(0) scale(0.9); }
      `;
      break;
    case 'spring-y':
      keyframes = `
        0%, 100% { transform: scaleY(1); }
        40% { transform: scaleY(${1 + (0.4 * i)}); }
        70% { transform: scaleY(${1 - (0.2 * i)}); }
      `;
      break;
    case 'lateral-snap':
      keyframes = `
        0%, 100% { transform: skewX(0); }
        50% { transform: skewX(${15 * i}deg); }
      `;
      break;
    case 'ninja-spin':
      keyframes = `
        0%, 100% { transform: rotate(0) scale(1); }
        50% { transform: rotate(360deg) scale(${1 - (0.2 * i)}); }
      `;
      break;
    case 'backflip':
      keyframes = `
        0%, 100% { transform: rotateX(0); }
        50% { transform: rotateX(180deg) translateY(-10px); }
      `;
      break;
    case 'tornado':
      keyframes = `
        0%, 100% { transform: rotate(0); }
        25% { transform: rotate(${20 * i}deg); }
        75% { transform: rotate(-${20 * i}deg); }
      `;
      break;
    case 'side-kick':
      keyframes = `
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(${20 * i}px) skewX(-10deg); }
      `;
      break;
    case 'head-bang':
      keyframes = `
        0%, 100% { transform: rotateX(0); }
        50% { transform: rotateX(${40 * i}deg) translateY(5px); }
      `;
      break;
    case 'flat-squash':
      keyframes = `
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(${1 - (0.4 * i)}); }
      `;
      break;
    case 'tower-stretch':
      keyframes = `
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(${1 + (0.4 * i)}); }
      `;
      break;
    case 'skew-blast':
      keyframes = `
        0%, 100% { transform: skew(0); }
        50% { transform: skew(${25 * i}deg, ${10 * i}deg); }
      `;
      break;
    case 'accordion':
      keyframes = `
        0%, 100% { transform: scaleX(1); }
        50% { transform: scaleX(${1 + (0.5 * i)}); }
      `;
      break;
    case 'perspective-tilt':
      keyframes = `
        0%, 100% { transform: perspective(400px) rotateX(0); }
        50% { transform: perspective(400px) rotateX(${35 * i}deg); }
      `;
      break;
    case 'anvil-drop':
      keyframes = `
        0%, 100% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(${15 * i}px) scaleY(0.8); }
      `;
      break;
    case 'ufo-beam':
      keyframes = `
        0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
        50% { transform: translateY(-${20 * i}px) scale(0.8); opacity: 0.7; }
      `;
      break;
    case 'magnetic-pull':
      keyframes = `
        0%, 100% { transform: scale(1); }
        50% { transform: scale(${1 + (0.2 * i)}); }
      `;
      break;
    case 'earthquake':
      keyframes = `
        0%, 100% { transform: translate(0, 0); }
        20% { transform: translate(-${4 * i}px, ${4 * i}px); }
        40% { transform: translate(${4 * i}px, -${4 * i}px); }
        60% { transform: translate(-${4 * i}px, -${4 * i}px); }
        80% { transform: translate(${4 * i}px, ${4 * i}px); }
      `;
      break;
    case 'implosion':
      keyframes = `
        0%, 100% { transform: scale(1); filter: blur(0); }
        50% { transform: scale(${1 - (0.3 * i)}); filter: blur(2px); }
      `;
      break;
    case 'glitch-jump':
      keyframes = `
        0%, 100% { transform: translate(0,0); }
        33% { transform: translate(-${8*i}px, ${4*i}px) skew(5deg); }
        66% { transform: translate(${8*i}px, -${4*i}px) skew(-5deg); }
      `;
      break;
    case 'wobble-crazy':
      keyframes = `
        0%, 100% { transform: rotate(0); }
        25% { transform: rotate(-${15 * i}deg) translateX(-5px); }
        75% { transform: rotate(${15 * i}deg) translateX(5px); }
      `;
      break;
    case 'orbit-swing':
      keyframes = `
        0%, 100% { transform: rotate(0); transform-origin: top center; }
        50% { transform: rotate(${30 * i}deg); transform-origin: top center; }
      `;
      break;
    case 'shiver-cold':
      keyframes = `
        0%, 100% { transform: translate(0, 0); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-${2*i}px, 0); }
        20%, 40%, 60%, 80% { transform: translate(${2*i}px, 0); }
      `;
      break;
    case 'pulse-beast':
      keyframes = `
        0%, 100% { transform: scale(1); }
        50% { transform: scale(${1 + (0.3 * i)}); box-shadow: 0 0 ${20*i}px var(--primary-color); }
      `;
      break;
    case 'shrink-hide':
      keyframes = `
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.6); opacity: 0.5; }
      `;
      break;
    case 'mega-zoom':
      keyframes = `
        0%, 100% { transform: scale(1); }
        50% { transform: scale(${1 + (0.4 * i)}); z-index: 100; }
      `;
      break;
    case 'mirror-flip':
      keyframes = `
        0%, 100% { transform: scaleX(1); }
        50% { transform: scaleX(-1); }
      `;
      break;
    case 'vortex':
      keyframes = `
        0%, 100% { transform: rotate(0) scale(1); }
        50% { transform: rotate(180deg) scale(0.3); }
      `;
      break;
    case 'heartbeat':
      keyframes = `
        0%, 100% { transform: scale(1); }
        15% { transform: scale(${1 + (0.2 * i)}); }
        30% { transform: scale(1); }
        45% { transform: scale(${1 + (0.1 * i)}); }
      `;
      break;
  }

  // Nome estável da animação baseado no ID do preset
  const animName = `wallet-anim-${type}`;

  styleEl.innerHTML = `
    @keyframes ${animName} {
      ${keyframes}
    }

    ${selector} {
      /* Removemos o !important do transform base para permitir que os keyframes funcionem */
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform: scale(1) rotate(0) translate(0, 0);
      backface-visibility: hidden;
      -webkit-font-smoothing: subpixel-antialiased;
    }

    /* Aplica a animação no hover ou active */
    ${selector.split(',').map(s => `
      ${s.trim()}:hover, 
      ${s.trim()}:active {
        animation: ${animName} ${duration}s ease-in-out !important;
        will-change: transform;
      }
    `).join('\n')}
  `;
};