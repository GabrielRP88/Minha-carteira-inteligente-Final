
import { AnimationConfig } from "../types";

export const ANIMATION_PRESETS = [
  { id: 'scale-up', name: 'Zoom In (Pulsar)', type: 'transform' },
  { id: 'scale-down', name: 'Zoom Out (Comprimir)', type: 'transform' },
  { id: 'lift', name: 'Levitar (Sombra)', type: 'transform' },
  { id: 'sink', name: 'Afundar (Clique)', type: 'transform' },
  { id: 'rotate-right', name: 'Girar Direita', type: 'transform' },
  { id: 'rotate-left', name: 'Girar Esquerda', type: 'transform' },
  { id: 'wiggle', name: 'Wiggle (Minhoca)', type: 'keyframes' },
  { id: 'shake-x', name: 'Shake Horizontal', type: 'keyframes' },
  { id: 'shake-y', name: 'Shake Vertical', type: 'keyframes' },
  { id: 'jello', name: 'Gelatina', type: 'keyframes' },
  { id: 'rubber', name: 'Elástico', type: 'keyframes' },
  { id: 'tada', name: 'Tada! (Festa)', type: 'keyframes' },
  { id: 'wobble', name: 'Bambo (Wobble)', type: 'keyframes' },
  { id: 'bounce', name: 'Saltitar', type: 'keyframes' },
  { id: 'pulse-glow', name: 'Brilho Pulsante', type: 'box-shadow' },
  { id: 'neon', name: 'Neon Flash', type: 'box-shadow' },
  { id: 'skew-x', name: 'Inclinar X', type: 'transform' },
  { id: 'skew-y', name: 'Inclinar Y', type: 'transform' },
  { id: 'flip-x', name: 'Flip 3D X', type: 'transform' },
  { id: 'flip-y', name: 'Flip 3D Y', type: 'transform' },
  { id: 'slide-right', name: 'Deslizar Direita', type: 'transform' },
  { id: 'slide-up', name: 'Deslizar Cima', type: 'transform' },
  { id: 'swing', name: 'Balanço (Swing)', type: 'keyframes' },
  { id: 'heartbeat', name: 'Batida Coração', type: 'keyframes' },
  { id: 'flash', name: 'Flash (Piscar)', type: 'opacity' },
  { id: 'blur-focus', name: 'Foco (Blur)', type: 'filter' },
  { id: 'grayscale-color', name: 'P&B para Cor', type: 'filter' },
  { id: 'squeeze', name: 'Espremer', type: 'transform' },
  { id: 'expand-border', name: 'Borda Expansiva', type: 'border' },
  { id: 'pop', name: 'Pop (Estourar)', type: 'keyframes' },
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
  const duration = (0.3 / speed).toFixed(2); // Base duration adjusted by speed
  const timing = 'cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Helper multipliers based on intensity (0.5 to 2.0)
  const i = intensity;
  
  let css = '';
  let keyframes = '';

  // Selector targets all interactive elements
  const selector = `
    button:not(:disabled), 
    a:not(:disabled), 
    [role="button"]:not(:disabled), 
    .cursor-pointer,
    input[type="checkbox"],
    input[type="radio"],
    select
  `;

  // Base transition property
  css += `${selector} { transition: all ${duration}s ${timing} !important; will-change: transform, opacity, box-shadow; }`;

  // Generate specific CSS based on animation type
  switch (type) {
    case 'scale-up':
      css += `${selector}:hover { transform: scale(${1 + (0.05 * i)}) !important; }`;
      css += `${selector}:active { transform: scale(${1 - (0.05 * i)}) !important; }`;
      break;
    case 'scale-down':
      css += `${selector}:hover { transform: scale(${1 - (0.05 * i)}) !important; }`;
      css += `${selector}:active { transform: scale(${1 - (0.1 * i)}) !important; }`;
      break;
    case 'lift':
      css += `${selector}:hover { transform: translateY(-${2 * i}px) !important; box-shadow: 0 ${10 * i}px ${20 * i}px -5px rgba(0,0,0,0.2) !important; }`;
      css += `${selector}:active { transform: translateY(0) !important; box-shadow: none !important; }`;
      break;
    case 'sink':
      css += `${selector}:hover { transform: translateY(${2 * i}px) !important; }`;
      css += `${selector}:active { transform: translateY(${4 * i}px) !important; }`;
      break;
    case 'rotate-right':
      css += `${selector}:hover { transform: rotate(${3 * i}deg) !important; }`;
      css += `${selector}:active { transform: rotate(0deg) !important; }`;
      break;
    case 'rotate-left':
      css += `${selector}:hover { transform: rotate(-${3 * i}deg) !important; }`;
      css += `${selector}:active { transform: rotate(0deg) !important; }`;
      break;
    case 'wiggle':
      keyframes = `
        @keyframes global-wiggle {
          0%, 100% { transform: rotate(-${3 * i}deg); }
          50% { transform: rotate(${3 * i}deg); }
        }
      `;
      css += `${selector}:hover { animation: global-wiggle ${duration}s ease-in-out infinite !important; }`;
      break;
    case 'shake-x':
      keyframes = `
        @keyframes global-shake-x {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-${3 * i}px); }
          75% { transform: translateX(${3 * i}px); }
        }
      `;
      css += `${selector}:hover { animation: global-shake-x ${duration}s ease-in-out infinite !important; }`;
      break;
    case 'shake-y':
      keyframes = `
        @keyframes global-shake-y {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-${2 * i}px); }
          75% { transform: translateY(${2 * i}px); }
        }
      `;
      css += `${selector}:hover { animation: global-shake-y ${duration}s ease-in-out infinite !important; }`;
      break;
    case 'jello':
      keyframes = `
        @keyframes global-jello {
          0% { transform: scale3d(1, 1, 1); }
          30% { transform: scale3d(${1.15 * i}, ${0.85 * i}, 1); }
          40% { transform: scale3d(${0.85 * i}, ${1.15 * i}, 1); }
          50% { transform: scale3d(${1.05 * i}, ${0.95 * i}, 1); }
          65% { transform: scale3d(${0.98 * i}, ${1.02 * i}, 1); }
          75% { transform: scale3d(${1.02 * i}, ${0.98 * i}, 1); }
          100% { transform: scale3d(1, 1, 1); }
        }
      `;
      css += `${selector}:hover { animation: global-jello ${Number(duration) * 2}s both infinite !important; }`;
      break;
    case 'rubber':
      keyframes = `
        @keyframes global-rubber {
          0% { transform: scale3d(1, 1, 1); }
          30% { transform: scale3d(${1.15 * i}, ${0.85 * i}, 1); }
          40% { transform: scale3d(${0.85 * i}, ${1.15 * i}, 1); }
          50% { transform: scale3d(${1.05 * i}, ${0.95 * i}, 1); }
          65% { transform: scale3d(${0.98 * i}, ${1.02 * i}, 1); }
          75% { transform: scale3d(${1.02 * i}, ${0.98 * i}, 1); }
          100% { transform: scale3d(1, 1, 1); }
        }
      `;
      css += `${selector}:active { animation: global-rubber ${duration}s both !important; }`;
      css += `${selector}:hover { transform: scale(${1 + (0.05 * i)}); }`;
      break;
    case 'tada':
      keyframes = `
        @keyframes global-tada {
          0% { transform: scale3d(1, 1, 1); }
          10%, 20% { transform: scale3d(${0.9 * i}, ${0.9 * i}, ${0.9 * i}) rotate3d(0, 0, 1, -${3 * i}deg); }
          30%, 50%, 70% { transform: scale3d(${1.1 * i}, ${1.1 * i}, ${1.1 * i}) rotate3d(0, 0, 1, ${3 * i}deg); }
          40%, 60%, 80% { transform: scale3d(${1.1 * i}, ${1.1 * i}, ${1.1 * i}) rotate3d(0, 0, 1, -${3 * i}deg); }
          100% { transform: scale3d(1, 1, 1); }
        }
      `;
      css += `${selector}:hover { animation: global-tada ${Number(duration) * 2}s both !important; }`;
      break;
    case 'wobble':
      keyframes = `
        @keyframes global-wobble {
          0%, 100% { transform: translateX(0%); transform-origin: 50% 50%; }
          15% { transform: translateX(-${6 * i}px) rotate(-${6 * i}deg); }
          30% { transform: translateX(${3 * i}px) rotate(${6 * i}deg); }
          45% { transform: translateX(-${3 * i}px) rotate(-${3.6 * i}deg); }
          60% { transform: translateX(${2 * i}px) rotate(${2.4 * i}deg); }
          75% { transform: translateX(-${1 * i}px) rotate(-${1.2 * i}deg); }
        }
      `;
      css += `${selector}:hover { animation: global-wobble ${Number(duration) * 2}s both infinite !important; }`;
      break;
    case 'bounce':
      keyframes = `
        @keyframes global-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-${6 * i}px); }
        }
      `;
      css += `${selector}:hover { animation: global-bounce ${duration}s ease-in-out infinite !important; }`;
      break;
    case 'pulse-glow':
      keyframes = `
        @keyframes global-pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
          70% { box-shadow: 0 0 0 ${10 * i}px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
      `;
      css += `${selector}:hover { animation: global-pulse-glow ${Number(duration) * 2}s infinite !important; }`;
      break;
    case 'neon':
      css += `${selector}:hover { box-shadow: 0 0 ${10 * i}px ${2 * i}px rgba(99, 102, 241, 0.6) !important; filter: brightness(1.1); }`;
      css += `${selector}:active { box-shadow: 0 0 ${5 * i}px ${1 * i}px rgba(99, 102, 241, 0.8) !important; }`;
      break;
    case 'skew-x':
      css += `${selector}:hover { transform: skewX(-${10 * i}deg) !important; }`;
      css += `${selector}:active { transform: skewX(0deg) !important; }`;
      break;
    case 'skew-y':
      css += `${selector}:hover { transform: skewY(-${5 * i}deg) !important; }`;
      css += `${selector}:active { transform: skewY(0deg) !important; }`;
      break;
    case 'flip-x':
      css += `${selector}:hover { transform: perspective(400px) rotateX(${20 * i}deg) !important; }`;
      css += `${selector}:active { transform: perspective(400px) rotateX(0deg) !important; }`;
      break;
    case 'flip-y':
      css += `${selector}:hover { transform: perspective(400px) rotateY(${20 * i}deg) !important; }`;
      css += `${selector}:active { transform: perspective(400px) rotateY(0deg) !important; }`;
      break;
    case 'slide-right':
      css += `${selector}:hover { transform: translateX(${6 * i}px) !important; }`;
      css += `${selector}:active { transform: translateX(0) !important; }`;
      break;
    case 'slide-up':
      css += `${selector}:hover { transform: translateY(-${4 * i}px) !important; }`;
      css += `${selector}:active { transform: translateY(0) !important; }`;
      break;
    case 'swing':
      keyframes = `
        @keyframes global-swing {
          20% { transform: rotate3d(0, 0, 1, ${15 * i}deg); }
          40% { transform: rotate3d(0, 0, 1, -${10 * i}deg); }
          60% { transform: rotate3d(0, 0, 1, ${5 * i}deg); }
          80% { transform: rotate3d(0, 0, 1, -${5 * i}deg); }
          100% { transform: rotate3d(0, 0, 1, 0deg); }
        }
      `;
      css += `${selector}:hover { transform-origin: top center; animation: global-swing ${Number(duration) * 2}s both !important; }`;
      break;
    case 'heartbeat':
      keyframes = `
        @keyframes global-heartbeat {
          from { transform: scale(1); transform-origin: center center; animation-timing-function: ease-out; }
          10% { transform: scale(${0.95 * i}); animation-timing-function: ease-in; }
          17% { transform: scale(${0.98 * i}); animation-timing-function: ease-out; }
          33% { transform: scale(${0.87 * i}); animation-timing-function: ease-in; }
          45% { transform: scale(1); animation-timing-function: ease-out; }
        }
      `;
      css += `${selector}:hover { animation: global-heartbeat ${Number(duration) * 3}s ease-in-out infinite both !important; }`;
      break;
    case 'flash':
      css += `${selector}:hover { opacity: ${0.7 / i} !important; }`;
      css += `${selector}:active { opacity: 1 !important; }`;
      break;
    case 'blur-focus':
      css += `${selector} { filter: blur(0px); }`;
      css += `${selector}:hover { filter: blur(${1 * i}px) !important; }`;
      css += `${selector}:active { filter: blur(0px) !important; }`;
      break;
    case 'grayscale-color':
      css += `${selector} { filter: grayscale(100%); }`;
      css += `${selector}:hover { filter: grayscale(0%) !important; }`;
      break;
    case 'squeeze':
      css += `${selector}:hover { transform: scale(${1 + (0.1 * i)}, ${1 - (0.1 * i)}) !important; }`;
      css += `${selector}:active { transform: scale(${1 - (0.1 * i)}, ${1 + (0.1 * i)}) !important; }`;
      break;
    case 'expand-border':
      css += `${selector}:hover { outline: ${2 * i}px solid rgba(99, 102, 241, 0.3) !important; outline-offset: ${2 * i}px !important; }`;
      break;
    case 'pop':
      keyframes = `
        @keyframes global-pop {
          50% { transform: scale(${1.1 * i}); }
        }
      `;
      css += `${selector}:active { animation: global-pop ${duration}s linear 1 !important; }`;
      break;
    default:
      break;
  }

  styleEl.innerHTML = keyframes + css;
};
