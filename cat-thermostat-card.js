class CATThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement("cat-thermostat-card-editor");
  }

  static getStubConfig() {
    return { entity: '', name: '', color_start: '#fb923c', color_end: '#f97316' };
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config || !this.config.entity || !hass.states[this.config.entity]) {
      this._renderPlaceholder();
      return;
    }
    this._renderStructure();
    this._updateContent(hass.states[this.config.entity]);
  }

  _renderPlaceholder() {
    this.shadowRoot.innerHTML = `<div style="padding:20px;border:1px dashed #888;border-radius:16px;text-align:center;color:#888;">Select a Radiator in the Visual Editor</div>`;
  }

  _renderStructure() {
    if (this.shadowRoot.querySelector('.card')) return;
    this.shadowRoot.innerHTML = `
      <style>
        .card { border-radius:20px; padding:20px; color:white; font-family:sans-serif; transition: 0.5s; }
        .name { font-size: 18px; opacity: 0.9; }
        .temp { font-size: 40px; font-weight: bold; margin: 10px 0; }
      </style>
      <div class="card">
        <div class="name"></div>
        <div class="temp"></div>
      </div>
    `;
  }

  _updateContent(entity) {
    const card = this.shadowRoot.querySelector('.card');
    card.style.background = `linear-gradient(135deg, ${this.config.color_start || '#fb923c'}, ${this.config.color_end || '#f97316'})`;
    this.shadowRoot.querySelector('.name').textContent = this.config.name || entity.attributes.friendly_name;
    this.shadowRoot.querySelector('.temp').textContent = Math.round(entity.attributes.current_temperature || 0) + '°C';
  }
}

// --- THE MANUALLY BUILT EDITOR ---
class CATThermostatCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (this._initialized) return;
    this._initialized = true;

    // Get all radiator (climate) entities manually
    const climateEntities = Object.keys(this._hass.states).filter(e => e.startsWith('climate.'));

    this.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:15px; padding:10px; font-family:sans-serif;">
        <div>
          <label style="display:block; margin-bottom:5px;">Choose your Radiator:</label>
          <select id="entity-select" style="width:100%; padding:8px; border-radius:4px; background:#222; color:white;">
            <option value="">-- Select Radiator --</option>
            ${climateEntities.map(eid => `<option value="${eid}" ${this._config.entity === eid ? 'selected' : ''}>${this._hass.states[eid].attributes.friendly_name || eid}</option>`).join('')}
          </select>
        </div>
        
        <div>
          <label style="display:block; margin-bottom:5px;">Name Override:</label>
          <input id="name-input" type="text" value="${this._config.name || ''}" style="width:100%; padding:8px; border-radius:4px; background:#222; color:white; border:1px solid #444;">
        </div>

        <div style="display:flex; gap:10px;">
          <div style="flex:1;">
            <label style="display:block; margin-bottom:5px;">Start Color:</label>
            <input id="start-input" type="color" value="${this._config.color_start || '#fb923c'}" style="width:100%; height:40px; border:none; background:none;">
          </div>
          <div style="flex:1;">
            <label style="display:block; margin-bottom:5px;">End Color:</label>
            <input id="end-input" type="color" value="${this._config.color_end || '#f97316'}" style="width:100%; height:40px; border:none; background:none;">
          </div>
        </div>
      </div>
    `;

    // Add listeners to standard HTML elements
    this.querySelector('#entity-select').addEventListener('change', (ev) => this._update('entity', ev.target.value));
    this.querySelector('#name-input').addEventListener('input', (ev) => this._update('name', ev.target.value));
    this.querySelector('#start-input').addEventListener('input', (ev) => this._update('color_start', ev.target.value));
    this.querySelector('#end-input').addEventListener('input', (ev) => this._update('color_end', ev.target.value));
  }

  _update(key, value) {
    const newConfig = { ...this._config, [key]: value };
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('cat-thermostat-card', CATThermostatCard);
customElements.define('cat-thermostat-card-editor', CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cat-thermostat-card',
  name: 'CAT Radiator Card',
  description: 'A radiator card with a manual entity list.',
  preview: true,
});
