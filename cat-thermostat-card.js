class CATThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement("cat-thermostat-card-editor");
  }

  static getStubConfig() {
    return { 
      entity: '', 
      name: '', 
      idle_start: '#374151', 
      idle_end: '#111827',
      heat_start: '#fb923c', 
      heat_end: '#f97316' 
    };
  }

  setConfig(config) {
    this.config = config;
    if (this._hass && this.config.entity) {
      this._updateContent(this._hass.states[this.config.entity]);
    }
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
    this.shadowRoot.innerHTML = `<div style="padding:10px;border:1px dashed #888;border-radius:10px;text-align:center;color:#888;font-size:11px;">Select Radiator in Editor</div>`;
  }

  _renderStructure() {
    if (this.shadowRoot.querySelector('.card')) return;
    this.shadowRoot.innerHTML = `
      <style>
        .card { 
          border-radius: 12px; 
          padding: 0 16px; 
          color: white; 
          font-family: -apple-system, system-ui, sans-serif; 
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.6s ease, transform 0.1s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          user-select: none;
          overflow: hidden;
        }
        .card:active { transform: scale(0.98); }
        .left-side { display: flex; align-items: center; gap: 12px; }
        .temp-main { font-size: 28px; font-weight: 300; }
        .info-block { display: flex; flex-direction: column; justify-content: center; }
        .entity-name { font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.8; line-height: 1.2; }
        .target-line { font-size: 10px; opacity: 0.6; display: flex; gap: 4px; align-items: baseline; }
        .target-val { font-weight: 700; font-size: 11px; }
        .right-side { display: flex; align-items: center; }
        .flame-icon { width: 20px; height: 20px; opacity: 0; transition: opacity 0.5s ease; color: white; }
        .is-heating .flame-icon { opacity: 1; animation: breathe 2.5s infinite ease-in-out; }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      </style>
      <div class="card">
        <div class="left-side">
          <div class="temp-main">--°</div>
          <div class="info-block">
            <div class="entity-name">---</div>
            <div class="target-line">Heating to <span class="target-val">--°</span></div>
          </div>
        </div>
        <div class="right-side">
          <svg class="flame-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12C6.5,10.15 7.42,8.5 8.84,7.5C8.35,9.03 8.89,10.74 10.13,11.66C10.1,11.44 10.08,11.22 10.08,11C10.08,9.08 11.08,7.39 12.58,6.44C12.1,8.03 12.72,9.78 14.09,10.73C14.06,10.5 14.03,10.25 14.03,10C14.03,8.37 14.73,6.91 15.84,5.88C15.42,7.5 16.09,9.25 17.5,10.23V12M12,22A10,10 0 0,0 22,12C22,10.03 21.42,8.2 20.42,6.67C19.89,8.27 18.5,9.44 16.82,9.44C17.2,8.08 17,6.62 16.24,5.43C16.89,4 16.89,2.37 16.24,1C14.41,2.29 13.31,4.43 13.31,6.82C11.94,5.43 10,4.55 7.91,4.55C8.42,6.03 8.24,7.67 7.42,9C5.31,10.11 3.88,12.38 3.88,15A8.12,8.12 0 0,0 12,23.12V22Z" />
          </svg>
        </div>
      </div>
    `;

    let timer;
    const card = this.shadowRoot.querySelector('.card');
    card.addEventListener('mousedown', () => timer = setTimeout(() => this._toggle(true), 500));
    card.addEventListener('touchstart', () => timer = setTimeout(() => this._toggle(true), 500));
    card.addEventListener('mouseup', () => { if(timer) { clearTimeout(timer); this._toggle(false); } });
    card.addEventListener('touchend', () => { if(timer) { clearTimeout(timer); this._toggle(false); } });
  }

  _toggle(isHold) {
    if (isHold) {
      const state = this._hass.states[this.config.entity].state;
      const newHvacMode = state === 'off' ? 'heat' : 'off';
      this._hass.callService('climate', 'set_hvac_mode', { entity_id: this.config.entity, hvac_mode: newHvacMode });
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      const event = new CustomEvent('hass-more-info', { detail: { entityId: this.config.entity }, bubbles: true, composed: true });
      this.dispatchEvent(event);
    }
  }

  _updateContent(entity) {
    if (!entity || !this.shadowRoot.querySelector('.card')) return;
    const card = this.shadowRoot.querySelector('.card');
    const isHeating = entity.attributes.hvac_action === 'heating' || entity.state === 'heat';
    const start = isHeating ? (this.config.heat_start || '#fb923c') : (this.config.idle_start || '#374151');
    const end = isHeating ? (this.config.heat_end || '#f97316') : (this.config.idle_end || '#111827');
    
    card.style.background = `linear-gradient(135deg, ${start}, ${end})`;
    card.classList.toggle('is-heating', isHeating);
    this.shadowRoot.querySelector('.temp-main').textContent = Math.round(entity.attributes.current_temperature || 0) + '°';
    this.shadowRoot.querySelector('.entity-name').textContent = this.config.name || entity.attributes.friendly_name;
    this.shadowRoot.querySelector('.target-val').textContent = Math.round(entity.attributes.temperature || 0) + '°';
  }
}

class CATThermostatCardEditor extends HTMLElement {
  setConfig(config) { this._config = config || {}; }
  set hass(hass) { this._hass = hass; this._render(); }
  _render() {
    if (!this._hass || !this._config || this._initialized) return;
    this._initialized = true;
    const climateEntities = Object.keys(this._hass.states).filter(e => e.startsWith('climate.'));
    
    this.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; padding:10px; font-family:sans-serif; font-size:13px; color: white;">
        <div>
          <label style="display:block; margin-bottom:4px; font-weight:bold; color: white;">Radiator Entity</label>
          <select id="entity-select" style="width:100%; padding:6px; background:#222; color:white; border:1px solid #444; border-radius:4px;">
            <option value="">-- Select --</option>
            ${climateEntities.map(eid => `<option value="${eid}" ${this._config.entity === eid ? 'selected' : ''}>${this._hass.states[eid].attributes.friendly_name || eid}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="display:block; margin-bottom:4px; font-weight:bold; color: white;">Custom Name</label>
          <input id="name-input" type="text" value="${this._config.name || ''}" style="width:100%; padding:6px; background:#222; color:white; border:1px solid #444; border-radius:4px;">
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div>
            <label style="display:block; margin-bottom:4px; color:#fb923c; font-weight:bold;">Heat Start</label>
            <input id="heat-start" type="color" value="${this._config.heat_start || '#fb923c'}" style="width:100%; height:30px; border:none; background:none;">
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; color:#fb923c; font-weight:bold;">Heat End</label>
            <input id="heat-end" type="color" value="${this._config.heat_end || '#f97316'}" style="width:100%; height:30px; border:none; background:none;">
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; color:#9ca3af; font-weight:bold;">Idle Start</label>
            <input id="idle-start" type="color" value="${this._config.idle_start || '#374151'}" style="width:100%; height:30px; border:none; background:none;">
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; color:#9ca3af; font-weight:bold;">Idle End</label>
            <input id="idle-end" type="color" value="${this._config.idle_end || '#111827'}" style="width:100%; height:30px; border:none; background:none;">
          </div>
        </div>
      </div>
    `;
    this.querySelectorAll('input, select').forEach(el => {
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', (ev) => {
        const field = ev.target.id.replace('-', '_');
        const newConfig = { ...this._config, [field]: ev.target.value };
        this._config = newConfig;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
      });
    });
  }
}

customElements.define('cat-thermostat-card', CATThermostatCard);
customElements.define('cat-thermostat-card-editor', CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cat-thermostat-card',
  name: 'CAT Radiator Card',
  description: 'Fixed entity selection sync.',
  preview: true,
});
