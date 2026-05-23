@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Manrope", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  /* Custom Indigo/Navy palette */
  --color-primary: #001e40;
  --color-on-primary: #ffffff;
  --color-primary-container: #003366;
  --color-on-primary-container: #799dd6;
  --color-inverse-primary: #a7c8ff;

  /* Premium Gold/Amber palette */
  --color-secondary: #735c00;
  --color-on-secondary: #ffffff;
  --color-secondary-container: #fed65b;
  --color-on-secondary-container: #745c00;

  --color-tertiary: #001e42;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #003369;
  --color-on-tertiary-container: #689def;

  --color-background: #f8f9fa;
  --color-on-background: #191c1d;

  --color-surface: #f8f9fa;
  --color-on-surface: #191c1d;
  --color-on-surface-variant: #43474f;
  --color-outline: #737780;
  --color-outline-variant: #c3c6d1;
  --color-surface-dim: #d9dadb;
  --color-surface-bright: #f8f9fa;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f3f4f5;
  --color-surface-container: #edeeef;
  --color-surface-container-high: #e7e8e9;
  --color-surface-container-highest: #e1e3e4;

  /* Custom animation durations and transitions */
  --animate-fade-in-up: fade-in-up 0.6s ease-out forwards;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    background-color: var(--color-background);
    color: var(--color-on-background);
    font-family: var(--font-sans);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

