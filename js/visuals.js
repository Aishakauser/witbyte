// WitByte — Interactive Visuals Registry
// Maps module IDs to visual component factories

const registry = {};

export function registerVisual(moduleId, factory) {
  if (!registry[moduleId]) registry[moduleId] = [];
  registry[moduleId].push(factory);
}

export function getVisuals(moduleId) {
  return registry[moduleId] || [];
}

export function renderVisuals(moduleId, container) {
  const visuals = getVisuals(moduleId);
  if (!visuals.length) return;

  const section = document.createElement('div');
  section.className = 'interactive-visuals';

  for (const factory of visuals) {
    const wrapper = document.createElement('div');
    wrapper.className = 'visual-block';
    try {
      factory(wrapper);
      section.appendChild(wrapper);
    } catch (e) {
      console.error(`Visual error in ${moduleId}:`, e);
    }
  }

  const contentEl = container.querySelector('.module-content');
  if (contentEl) {
    const heading = document.createElement('h2');
    heading.textContent = 'Interactive Exploration';
    heading.className = 'visual-heading';
    contentEl.appendChild(heading);
    contentEl.appendChild(section);
  }
}
