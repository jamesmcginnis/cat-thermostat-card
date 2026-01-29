Class CATThermostatCard extends HTMLElement { 
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
      heat_end: '#f97316',
      cool_start: '#60a5fa',
      cool_end: '#2563eb',
      current_temp_color: '#ffffff',
      name_color: '#ffffff',
      target_label_color: '#ffffff',
      target_temp_color: '#ffffff'
    }; 
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
    this.shadowRoot.innerHTML = `<div style="padding:15px;border:1px dashed #888;border-radius:12px;text-align:center;color:#888;font-size:12px;">Select a Radiator in the Visual Editor</div>`; 
  } 

  _renderStructure() { 
    if (this.shadowRoot.querySelector('.card')) return; 
    this.shadowRoot.innerHTML = ` 
      <style> 
        .card {  
          border-radius: 16px;  
          padding: 14px 16px;  
          color: white;  
          font-family: var(--paper-font-common-base_-_font-family, inherit);  
          height: 120px; 
          display: flex; 
          flex-direction: column; 
          justify-content: space-between; 
          transition: background 0.8s ease, transform 0.2s ease; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
          position: relative; 
          box-sizing: border-box;
        } 
        
        .top-row { display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer; } 
        .temp-group { display: flex; flex-direction: column; }
        .current-temp { font-size: 34px; font-weight: 300; line-height: 1; margin-bottom: 2px; } 
        .entity-name { font-size: 11px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; }

        .state-icon { width: 24px; height: 24px; opacity: 0; transition: opacity 0.5s ease; } 
        .is-active .state-icon { opacity: 1; animation: breathe 2.5s infinite ease-in-out; } 
        
        @keyframes breathe { 
          0%, 100% { transform: scale(1); opacity: 0.6; } 
          50% { transform: scale(1.1); opacity: 1; } 
        } 
        
        .bottom-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .target-info { display: flex; align-items: baseline; gap: 4px; }
        .target-label { font-size: 11px; opacity: 0.7; text-transform: uppercase; font-weight: 600; }
        .target-temp { font-size: 14px; font-weight: 600; }

        .controls { display: flex; gap: 8px; }
        .btn { 
          background: rgba(255,255,255,0.15); 
          border: none; 
          border-radius: 8px; 
          color: white; 
          width: 32px; 
          height: 32px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:hover { background: rgba(255,255,255,0.25); }
        .btn:active { transform: scale(0.9); }
        .btn svg { width: 18px; height: 18px; fill: currentColor; }
      </style> 
      <div class="card"> 
        <div class="top-row"> 
          <div class="temp-group"> 
            <div class="current-temp">--°</div> 
            <div class="entity-name">---</div>
          </div> 
          <div class="icon-container"></div>
        </div> 
        <div class="bottom-row">
          <div class="target-info">
            <span class="target-label">---</span>
            <span class="target-temp">--°</span> 
          </div>
          <div class="controls">
            <button class="btn minus"><svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z" /></svg></button>
            <button class="btn plus"><svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg></button>
          </div>
        </div> 
      </div> 
    `; 

    this.shadowRoot.querySelector('.top-row').addEventListener('click', () => { 
      const event = new CustomEvent('hass-more-info', { 
        detail: { entityId: this.config.entity }, 
        bubbles: true, 
        composed: true, 
      }); 
      this.dispatchEvent(event); 
    }); 

    this.shadowRoot.querySelector('.minus').addEventListener('click', (e) => {
      e.stopPropagation();
      this._changeTemp(-0.5);
    });

    this.shadowRoot.querySelector('.plus').addEventListener('click', (e) => {
      e.stopPropagation();
      this._changeTemp(0.5);
    });
  } 

  _changeTemp(change) {
    const entity = this._hass.states[this.config.entity];
    const currentTarget = entity.attributes.temperature || 0;
    const newTemp = parseFloat((currentTarget + change).toFixed(1));
    this._hass.callService('climate', 'set_temperature', {
      entity_id: this.config.entity,
      temperature: newTemp
    });
  }

  _updateContent(entity) { 
    const card = this.shadowRoot.querySelector('.card'); 
    if (!card) return;
    const isHeating = entity.attributes.hvac_action === 'heating' || entity.state === 'heat'; 
    const isCooling = entity.attributes.hvac_action === 'cooling' || entity.state === 'cool';

    let start, end;
    if (isHeating) {
      start = this.config.heat_start || '#fb923c';
      end = this.config.heat_end || '#f97316';
    } else if (isCooling) {
      start = this.config.cool_start || '#60a5fa';
      end = this.config.cool_end || '#2563eb';
    } else {
      start = this.config.idle_start || '#374151';
      end = this.config.idle_end || '#111827';
    }
     
    card.style.background = `linear-gradient(135deg, ${start}, ${end})`; 
    card.classList.toggle('is-active', isHeating || isCooling); 

    const iconContainer = this.shadowRoot.querySelector('.icon-container');
    const flameIcon = `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12C6.5,10.15 7.42,8.5 8.84,7.5C8.35,9.03 8.89,10.74 10.13,11.66C10.1,11.44 10.08,11.22 10.08,11C10.08,9.08 11.08,7.39 12.58,6.44C12.1,8.03 12.72,9.78 14.09,10.73C14.06,10.5 14.03,10.25 14.03,10C14.03,8.37 14.73,6.91 15.84,5.88C15.42,7.5 16.09,9.25 17.5,10.23V12M12,22A10,10 0 0,0 22,12C22,10.03 21.42,8.2 20.42,6.67C19.89,8.27 18.5,9.44 16.82,9.44C17.2,8.08 17,6.62 16.24,5.43C16.89,4 16.89,2.37 16.24,1C14.41,2.29 13.31,4.43 13.31,6.82C11.94,5.43 10,4.55 7.91,4.55C8.42,6.03 8.24,7.67 7.42,9C5.31,10.11 3.88,12.38 3.88,15A8.12,8.12 0 0,0 12,23.12V22Z" /></svg>`;
    const snowflakeIcon = `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22,11H19.17L21,9.17L19.58,7.76L17.17,10.17L15,8V5H18V3H15V1H13V3H11V1H9V3H6V5H9V8L6.83,10.17L4.42,7.76L3,9.17L4.83,11H2V13H4.83L3,14.83L4.42,16.24L6.83,13.83L9,16V19H6V21H9V23H11V21H13V23H15V21H18V19H15V16L17.17,13.83L19.58,16.24L21,14.83L19.17,13H22V11M13,14V19H11V14H6.5L9,11.5L6.5,9H11V4H13V9H17.5L15,11.5L17.5,14H13Z" /></svg>`;
    iconContainer.innerHTML = isHeating ? flameIcon : (isCooling ? snowflakeIcon : '');

    const currentTempEl = this.shadowRoot.querySelector('.current-temp');
    const nameEl = this.shadowRoot.querySelector('.entity-name');
    const targetLabelEl = this.shadowRoot.querySelector('.target-label');
    const targetTempEl = this.shadowRoot.querySelector('.target-temp');

    currentTempEl.textContent = (entity.attributes.current_temperature || 0).toFixed(1) + '°'; 
    currentTempEl.style.color = this.config.current_temp_color || '#ffffff';

    nameEl.textContent = this.config.name || entity.attributes.friendly_name; 
    nameEl.style.color = this.config.name_color || '#ffffff';

    const hvacState = entity.state.charAt(0).toUpperCase() + entity.state.slice(1);
    targetLabelEl.textContent = isHeating ? 'Heating to' : (isCooling ? 'Cooling to' : hvacState);
    targetLabelEl.style.color = this.config.target_label_color || '#ffffff';

    const showTarget = isHeating || isCooling;
    targetTempEl.textContent = showTarget ? (entity.attributes.temperature || 0).toFixed(1) + '°' : ''; 
    targetTempEl.style.color = this.config.target_temp_color || '#ffffff';
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
      <div style="display:flex; flex-direction:column; gap:15px; padding:10px; font-family:sans-serif;"> 
        <div> 
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Radiator Entity</label> 
          <select id="entity-select" style="width:100%; padding:8px; border-radius:4px; background:#222; color:white; border:1px solid #444;"> 
            <option value="">-- Select Radiator --</option> 
            ${climateEntities.map(eid => `<option value="${eid}" ${this._config.entity === eid ? 'selected' : ''}>${this._hass.states[eid].attributes.friendly_name || eid}</option>`).join('')} 
          </select> 
        </div> 
         
        <div> 
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Custom Name</label> 
          <input id="name-input" type="text" value="${this._config.name || ''}" style="width:100%; padding:8px; border-radius:4px; background:#222; color:white; border:1px solid #444;"> 
        </div> 

        <div style="border-top: 1px solid #444; padding-top: 10px;"> 
          <label style="display:block; margin-bottom:10px; font-weight:bold;">Background Colors</label> 
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <span style="font-size:10px; color:#fb923c">HEATING</span>
              <div style="display:flex; gap:5px;">
                <input id="heat-start" type="color" value="${this._config.heat_start || '#fb923c'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="heat-end" type="color" value="${this._config.heat_end || '#f97316'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
            <div>
              <span style="font-size:10px; color:#60a5fa">COOLING</span>
              <div style="display:flex; gap:5px;">
                <input id="cool-start" type="color" value="${this._config.cool_start || '#60a5fa'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="cool-end" type="color" value="${this._config.cool_end || '#2563eb'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
            <div style="grid-column: span 2;">
              <span style="font-size:10px; color:#9ca3af">IDLE / OTHER</span>
              <div style="display:flex; gap:5px;">
                <input id="idle-start" type="color" value="${this._config.idle_start || '#374151'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="idle-end" type="color" value="${this._config.idle_end || '#111827'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
          </div>
        </div> 

        <div style="border-top: 1px solid #444; padding-top: 10px;"> 
          <label style="display:block; margin-bottom:10px; font-weight:bold;">Text Colors</label> 
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <span style="font-size:10px;">CURRENT TEMP</span>
              <input id="current-temp-color" type="color" value="${this._config.current_temp_color || '#ffffff'}" style="width:100%; height:30px; border:none; background:none;">
            </div>
            <div>
              <span style="font-size:10px;">NAME TEXT</span>
              <input id="name-color" type="color" value="${this._config.name_color || '#ffffff'}" style="width:100%; height:30px; border:none; background:none;">
            </div>
            <div>
              <span style="font-size:10px;">LABEL TEXT</span>
              <input id="target-label-color" type="color" value="${this._config.target_label_color || '#ffffff'}" style="width:100%; height:30px; border:none; background:none;">
            </div>
            <div>
              <span style="font-size:10px;">TARGET TEMP</span>
              <input id="target-temp-color" type="color" value="${this._config.target_temp_color || '#ffffff'}" style="width:100%; height:30px; border:none; background:none;">
            </div>
          </div>
        </div> 
      </div> 
    `; 

    this.querySelector('#entity-select').addEventListener('change', (ev) => this._update('entity', ev.target.value)); 
    this.querySelector('#name-input').addEventListener('input', (ev) => this._update('name', ev.target.value)); 
    this.querySelector('#heat-start').addEventListener('input', (ev) => this._update('heat_start', ev.target.value)); 
    this.querySelector('#heat-end').addEventListener('input', (ev) => this._update('heat_end', ev.target.value)); 
    this.querySelector('#cool-start').addEventListener('input', (ev) => this._update('cool_start', ev.target.value)); 
    this.querySelector('#cool-end').addEventListener('input', (ev) => this._update('cool_end', ev.target.value)); 
    this.querySelector('#idle-start').addEventListener('input', (ev) => this._update('idle_start', ev.target.value)); 
    this.querySelector('#idle-end').addEventListener('input', (ev) => this._update('idle_end', ev.target.value)); 
    this.querySelector('#current-temp-color').addEventListener('input', (ev) => this._update('current_temp_color', ev.target.value)); 
    this.querySelector('#name-color').addEventListener('input', (ev) => this._update('name_color', ev.target.value)); 
    this.querySelector('#target-label-color').addEventListener('input', (ev) => this._update('target_label_color', ev.target.value)); 
    this.querySelector('#target-temp-color').addEventListener('input', (ev) => this._update('target_temp_color', ev.target.value)); 
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
  description: 'Dynamic radiator card with custom font support and manual controls.', 
  preview: true, 
});
