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
        .card { 
          border-radius: 24px; 
          padding: 24px; 
          color: white; 
          font-family: -apple-system, system-ui, sans-serif; 
          height: 160px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: 0.5s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }
        .top-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .temp-group {
          display: flex;
          flex-direction: column;
        }
        .current-temp { 
          font-size: 52px; 
          font-weight: 300; 
          line-height: 1;
          margin-bottom: 2px;
        }
        .entity-name { 
          font-size: 13px; 
          font-weight: 600;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .flame-icon {
          width: 32px;
          height: 32px;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .is-heating .flame-icon {
          opacity: 1;
          animation: breathe 2.5s infinite ease-in-out;
          color: white;
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .bottom-row {
          display: flex;
          flex-direction: column;
        }
        .target-label {
          font-size: 11px;
          opacity: 0.7;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .target-temp {
          font-size: 22px;
          font-weight: 600;
        }
      </style>
      <div class="card">
        <div class="top-section">
          <div class="temp-group">
            <div class="current-temp">--°</div>
            <div class="entity-name">---</div>
          </div>
          <svg class="flame-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12C6.5,10.15 7.42,8.5 8.84,7.5C8.35,9.03 8.89,10.74 10.13,11.66C10.1,11.44 10.08,11.22 10.08,11C10.08,9.08 11.08,7.39 12.58,6.44C12.1,8.03 12.72,9.78 14.09,10.73C14.06,10.5 14.03,10.25 14.03,10C14.03,8.37 14.73,6.91 15.84,5.88C15.42,7.5 16.09,9.25 17.5,10.23V12M12,22A10,10 0 0,0 22,12C22,10.03 21.42,8.2 20.42,6.67C19.89,8.27 18.5,9.44 16.82,9.44C17.2,8.08 17,6.62 16.24,5.43C16.89,4 16.89,2.37 16.24,1C14.41,2.29 13.31,4.43 13.31,6.82C11.94,5.43 10,4.55 7.91,4.55C8.42,6.03 8.24,7.67 7.42,9C5.31,10.11 3.88,12.38 3.88,15A8.12,8.12 0 0,0 12,23.12V22Z" />
          </svg>
        </div>
        <div class="bottom-row">
          <div class="target-label">Heating to</div>
          <div class="target-temp">--°</div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.card').addEventListener('click', () => {
      const event = new CustomEvent('hass-more-info', {
        detail: { entityId: this.config.entity },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    });
  }

  _updateContent(entity) {
    const card = this.shadowRoot.querySelector('.card');
    card.style.background = `linear-gradient(135deg, ${this.config.color_start || '#fb923c'}, ${this.config.color_end || '#f97316'})`;
    
    // Check if heating is active
    const isHeating = entity.attributes.hvac_action === 'heating' || entity.state === 'heat';
    card.classList.toggle('is-heating', isHeating);

    this.shadowRoot.querySelector('.current-temp').textContent = Math.round(entity.attributes.current_temperature || 0) + '°';
    this.shadowRoot.querySelector('.entity-name').textContent = this.config.name || entity.attributes.friendly_name;
    this.shadowRoot.querySelector('.target-temp').textContent = Math.round(entity.attributes.temperature || 0) + '°';
  }
}

// --- EDITOR CLASS (STAYS THE SAME) ---
class CATThermostatCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; }
  set hass(hass) { this._hass = hass; this._render(); }
  _render() {
    if (!this._hass || !this._config || this._initialized) return;
    this._initialized = true;
    const climateEntities = Object.keys(this._hass.states).filter(e => e.startsWith('climate.'));
    this.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:15px; padding:10px; font-family:sans-serif;">
        <div>
          <label style="display:block; margin-bottom:5px;">Choose your Radiator:</label>
          <select id="entity-select" style="width:100%; padding:8px; border-radius:4px; background:#222; color:white; border:1px solid #444;">
            <option value="">-- Select Radiator --</option>
            ${climateEntities.map(eid => `<option value="${eid}" ${this._config.entity === eid ? 'selected' : ''}>${this._hass.states[eid].attributes.friendly_name || eid}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="display:block; margin-bottom:5px;">Name Override:</label>
          <input id="name-input" type="text" value="${this._config.name || ''}" style="width:100%; padding:8px; border-radius:4px; background:#222; color:white; border:1px solid #444;">
        </div>
        <div style="display:flex; gap:10px;">
          <div style="flex:1;"><label style="display:block; margin-bottom:5px;">Start Color:</label><input id="start-input" type="color" value="${this._config.color_start || '#fb923c'}" style="width:100%; height:40px; border:none; background:none;"></div>
          <div style="flex:1;"><label style="display:block; margin-bottom:5px;">End Color:</label><input id="end-input" type="color" value="${this._config.color_end || '#f97316'}" style="width:100%; height:40px; border:none; background:none;"></div>
        </div>
      </div>
    `;
    this.querySelector('#entity-select').addEventListener('change', (ev) => this._update('entity', ev.target.value));
    this.querySelector('#name-input').addEventListener('input', (ev) => this._update('name', ev.target.value));
    this.querySelector('#start-input').addEventListener('input', (ev) => this._update('color_start', ev.target.value));
    this.querySelector('#end-input').addEventListener('input', (ev) => this._update('color_end', ev.target.value));
  }
  _update(key, value) {
    const newConfig = { ...this._config, [key]: value };
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
  }
}

customElements.define('cat-thermostat-card', CATThermostatCard);
customElements.define('cat-thermostat-card-editor', CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cat-thermostat-card',
  name: 'CAT Radiator Card',
  description: 'Pulsing flame icon added.',
  preview: true,
});
