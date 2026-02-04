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
      heat_end: '#f97316',
      cool_start: '#60a5fa',
      cool_end: '#2563eb',
      heat_cool_start: '#a78bfa',
      heat_cool_end: '#7c3aed',
      dry_start: '#fbbf24',
      dry_end: '#f59e0b',
      fan_only_start: '#34d399',
      fan_only_end: '#10b981',
      auto_start: '#60a5fa',
      auto_end: '#3b82f6',
      current_temp_color: '#ffffff',
      name_color: '#ffffff',
      target_label_color: '#ffffff',
      target_temp_color: '#ffffff',
      icon_heating: '',
      icon_cooling: '',
      icon_heat_cool: '',
      icon_dry: '',
      icon_fan_only: '',
      icon_off: ''
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
    this.shadowRoot.innerHTML = `<div style="padding:15px;border:1px dashed #888;border-radius:12px;text-align:center;color:#888;font-size:12px;">Select a Thermostat in the Visual Editor</div>`; 
  } 

  _renderStructure() { 
    if (this.shadowRoot.querySelector('.card')) return; 
    this.shadowRoot.innerHTML = ` 
      <style> 
        :host {
          display: block;
          height: 100%;
        }
        .card {  
          border-radius: var(--ha-card-border-radius, 12px);  
          padding: 16px;  
          color: white;  
          font-family: var(--paper-font-common-base_-_font-family, inherit);  
          min-height: 100px;
          display: flex; 
          flex-direction: column; 
          justify-content: space-between; 
          transition: background 0.8s ease; 
          box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0,0,0,0.14)); 
          position: relative; 
          box-sizing: border-box;
          height: 100%;
        } 
        
        .top-row { display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer; } 
        .temp-group { display: flex; flex-direction: column; }
        .current-temp { font-size: 34px; font-weight: 300; line-height: 1; margin-bottom: 2px; } 
        .entity-name { font-size: 11px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; }

        .state-icon { width: 24px; height: 24px; opacity: 1; transition: opacity 0.5s ease; cursor: pointer; } 
        .is-active .state-icon { animation: breathe 2.5s infinite ease-in-out; }
        ha-icon.state-icon { --mdc-icon-size: 24px; display: block; } 
        
        @keyframes breathe { 
          0%, 100% { transform: scale(1); opacity: 0.6; } 
          50% { transform: scale(1.1); opacity: 1; } 
        } 

        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }

        @keyframes pulse { 
          0%, 100% { transform: scale(1); opacity: 0.7; } 
          50% { transform: scale(1.15); opacity: 1; } 
        }
        
        .bottom-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; }
        .target-info { display: flex; align-items: baseline; gap: 4px; }
        .target-label { font-size: 11px; opacity: 0.7; font-weight: 600; }
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
            <span class="target-temp"></span> 
          </div>
          <div class="controls">
            <button class="btn minus"><svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z" /></svg></button>
            <button class="btn plus"><svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg></button>
          </div>
        </div> 
      </div> 
    `; 

    this.shadowRoot.querySelector('.top-row').addEventListener('click', (e) => {
      // Don't trigger more-info if clicking on the icon
      if (e.target.closest('.icon-container')) return;
      
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

  _togglePower() {
    const entity = this._hass.states[this.config.entity];
    const currentState = entity.state;
    
    if (currentState === 'off') {
      // Turn on to the last known mode or default to heat_cool/auto
      const hvacModes = entity.attributes.hvac_modes || [];
      let targetMode = 'heat_cool';
      
      // Prefer auto/heat_cool, then heat, then cool, then first available
      if (hvacModes.includes('auto')) {
        targetMode = 'auto';
      } else if (hvacModes.includes('heat_cool')) {
        targetMode = 'heat_cool';
      } else if (hvacModes.includes('heat')) {
        targetMode = 'heat';
      } else if (hvacModes.includes('cool')) {
        targetMode = 'cool';
      } else if (hvacModes.length > 1) {
        // Get first mode that isn't 'off'
        targetMode = hvacModes.find(mode => mode !== 'off') || hvacModes[0];
      }
      
      this._hass.callService('climate', 'set_hvac_mode', {
        entity_id: this.config.entity,
        hvac_mode: targetMode
      });
    } else {
      // Turn off
      this._hass.callService('climate', 'turn_off', {
        entity_id: this.config.entity
      });
    }
  }

  _getHvacMode(entity) {
    // Check hvac_action first (what it's actually doing), then fall back to state (what mode it's set to)
    const action = entity.attributes.hvac_action;
    const state = entity.state;
    
    // Priority: actual action over set mode
    if (action === 'heating') return 'heating';
    if (action === 'cooling') return 'cooling';
    if (action === 'drying') return 'dry';
    if (action === 'fan') return 'fan_only';
    
    // Fall back to state
    if (state === 'heat') return 'heating';
    if (state === 'cool') return 'cooling';
    if (state === 'heat_cool' || state === 'auto') return 'heat_cool';
    if (state === 'dry') return 'dry';
    if (state === 'fan_only') return 'fan_only';
    
    return 'idle';
  }

  _updateContent(entity) { 
    const card = this.shadowRoot.querySelector('.card'); 
    if (!card) return;
    
    const mode = this._getHvacMode(entity);
    const isActive = mode !== 'idle';

    // Determine colors based on mode
    let start, end;
    switch(mode) {
      case 'heating':
        start = this.config.heat_start || '#fb923c';
        end = this.config.heat_end || '#f97316';
        break;
      case 'cooling':
        start = this.config.cool_start || '#60a5fa';
        end = this.config.cool_end || '#2563eb';
        break;
      case 'heat_cool':
        start = this.config.heat_cool_start || '#a78bfa';
        end = this.config.heat_cool_end || '#7c3aed';
        break;
      case 'dry':
        start = this.config.dry_start || '#fbbf24';
        end = this.config.dry_end || '#f59e0b';
        break;
      case 'fan_only':
        start = this.config.fan_only_start || '#34d399';
        end = this.config.fan_only_end || '#10b981';
        break;
      default:
        start = this.config.idle_start || '#374151';
        end = this.config.idle_end || '#111827';
    }
     
    card.style.background = `linear-gradient(135deg, ${start}, ${end})`; 
    card.classList.toggle('is-active', isActive); 

    // Default icon definitions with animations
    const defaultIcons = {
      heating: `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12C6.5,10.15 7.42,8.5 8.84,7.5C8.35,9.03 8.89,10.74 10.13,11.66C10.1,11.44 10.08,11.22 10.08,11C10.08,9.08 11.08,7.39 12.58,6.44C12.1,8.03 12.72,9.78 14.09,10.73C14.06,10.5 14.03,10.25 14.03,10C14.03,8.37 14.73,6.91 15.84,5.88C15.42,7.5 16.09,9.25 17.5,10.23V12M12,22A10,10 0 0,0 22,12C22,10.03 21.42,8.2 20.42,6.67C19.89,8.27 18.5,9.44 16.82,9.44C17.2,8.08 17,6.62 16.24,5.43C16.89,4 16.89,2.37 16.24,1C14.41,2.29 13.31,4.43 13.31,6.82C11.94,5.43 10,4.55 7.91,4.55C8.42,6.03 8.24,7.67 7.42,9C5.31,10.11 3.88,12.38 3.88,15A8.12,8.12 0 0,0 12,23.12V22Z" /></svg>`,
      cooling: `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22,11H19.17L21,9.17L19.58,7.76L17.17,10.17L15,8V5H18V3H15V1H13V3H11V1H9V3H6V5H9V8L6.83,10.17L4.42,7.76L3,9.17L4.83,11H2V13H4.83L3,14.83L4.42,16.24L6.83,13.83L9,16V19H6V21H9V23H11V21H13V23H15V21H18V19H15V16L17.17,13.83L19.58,16.24L21,14.83L19.17,13H22V11M13,14V19H11V14H6.5L9,11.5L6.5,9H11V4H13V9H17.5L15,11.5L17.5,14H13Z" /></svg>`,
      heat_cool: `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="animation: pulse 2s infinite ease-in-out;"><path d="M12,2C10.73,2 9.6,2.8 9.18,4H3V6H4.95L2,14C1.53,16 3,17.45 5.5,18C8.5,18.55 9.5,19.5 9.5,21H14.5C14.5,19.5 15.5,18.55 18.5,18C21,17.45 22.47,16 22,14L19.05,6H21V4H14.82C14.4,2.8 13.27,2 12,2M12,4A1,1 0 0,1 13,5A1,1 0 0,1 12,6A1,1 0 0,1 11,5A1,1 0 0,1 12,4M5.05,6H18.95L21.9,14.12C22.03,14.82 21.63,15.5 20.73,15.84C17.35,17.06 16.39,18.25 16.14,19H7.86C7.61,18.25 6.65,17.06 3.27,15.84C2.37,15.5 1.97,14.82 2.1,14.12L5.05,6Z" /></svg>`,
      dry: `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C15.31,2 18,4.66 18,7.95C18,12.41 12,19 12,19C12,19 6,12.41 6,7.95C6,4.66 8.69,2 12,2M12,4A3.94,3.94 0 0,0 8,7.95C8,11.14 11.63,16.07 12,16.58C12.37,16.07 16,11.14 16,7.95A3.94,3.94 0 0,0 12,4M14,17H10V22H14V17Z" /></svg>`,
      fan_only: `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 3s linear infinite;"><path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z" /></svg>`,
      off: `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.5;"><path d="M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13" /></svg>`
    };

    // Helper function to get custom icon or default
    const getIcon = (mode, animationStyle = '') => {
      const customIconKey = `icon_${mode}`;
      const customIcon = this.config[customIconKey];
      
      if (customIcon) {
        return `<ha-icon class="state-icon" icon="${customIcon}" style="${animationStyle}"></ha-icon>`;
      }
      
      // Return default icon
      return defaultIcons[mode] || defaultIcons.off;
    };

    const iconContainer = this.shadowRoot.querySelector('.icon-container');
    // Show power icon when off, otherwise show mode-specific icon
    const displayMode = entity.state === 'off' ? 'off' : mode;
    
    // Apply appropriate animation style based on mode
    let animationStyle = '';
    if (displayMode === 'heat_cool') {
      animationStyle = 'animation: pulse 2s infinite ease-in-out;';
    } else if (displayMode === 'fan_only') {
      animationStyle = 'animation: spin 3s linear infinite;';
    } else if (displayMode === 'off') {
      animationStyle = 'opacity: 0.5;';
    }
    
    iconContainer.innerHTML = getIcon(displayMode, animationStyle);
    
    // Add click handler to icon to toggle thermostat power
    const iconEl = iconContainer.querySelector('.state-icon');
    if (iconEl) {
      iconEl.style.cursor = 'pointer';
      iconEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this._togglePower();
      });
    }

    const currentTempEl = this.shadowRoot.querySelector('.current-temp');
    const nameEl = this.shadowRoot.querySelector('.entity-name');
    const targetLabelEl = this.shadowRoot.querySelector('.target-label');
    const targetTempEl = this.shadowRoot.querySelector('.target-temp');

    currentTempEl.textContent = (entity.attributes.current_temperature || 0).toFixed(1) + '°'; 
    currentTempEl.style.color = this.config.current_temp_color || '#ffffff';

    nameEl.textContent = this.config.name || entity.attributes.friendly_name; 
    nameEl.style.color = this.config.name_color || '#ffffff';

    // Label text based on mode
    const labels = {
      heating: 'Heating to ',
      cooling: 'Cooling to ',
      heat_cool: 'Auto ',
      dry: 'Drying ',
      fan_only: 'Fan Only ',
      idle: entity.state.charAt(0).toUpperCase() + entity.state.slice(1)
    };
    
    targetLabelEl.textContent = labels[mode] || entity.state;
    targetLabelEl.style.color = this.config.target_label_color || '#ffffff';

    const showTarget = ['heating', 'cooling', 'heat_cool'].includes(mode);
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
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Thermostat Entity</label> 
          <select id="entity-select" style="width:100%; padding:8px; border-radius:4px; background:#222; color:white; border:1px solid #444;"> 
            <option value="">-- Select Thermostat --</option> 
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
              <span style="font-size:10px; color:#fb923c">🔥 HEATING</span>
              <div style="display:flex; gap:5px;">
                <input id="heat-start" type="color" value="${this._config.heat_start || '#fb923c'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="heat-end" type="color" value="${this._config.heat_end || '#f97316'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
            <div>
              <span style="font-size:10px; color:#60a5fa">❄️ COOLING</span>
              <div style="display:flex; gap:5px;">
                <input id="cool-start" type="color" value="${this._config.cool_start || '#60a5fa'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="cool-end" type="color" value="${this._config.cool_end || '#2563eb'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
            <div>
              <span style="font-size:10px; color:#a78bfa">🔄 HEAT/COOL (AUTO)</span>
              <div style="display:flex; gap:5px;">
                <input id="heat-cool-start" type="color" value="${this._config.heat_cool_start || '#a78bfa'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="heat-cool-end" type="color" value="${this._config.heat_cool_end || '#7c3aed'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
            <div>
              <span style="font-size:10px; color:#fbbf24">💧 DRY</span>
              <div style="display:flex; gap:5px;">
                <input id="dry-start" type="color" value="${this._config.dry_start || '#fbbf24'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="dry-end" type="color" value="${this._config.dry_end || '#f59e0b'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
            <div>
              <span style="font-size:10px; color:#34d399">🌀 FAN ONLY</span>
              <div style="display:flex; gap:5px;">
                <input id="fan-only-start" type="color" value="${this._config.fan_only_start || '#34d399'}" style="width:100%; height:30px; border:none; background:none;">
                <input id="fan-only-end" type="color" value="${this._config.fan_only_end || '#10b981'}" style="width:100%; height:30px; border:none; background:none;">
              </div>
            </div>
            <div>
              <span style="font-size:10px; color:#9ca3af">⏸️ IDLE / OFF</span>
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

        <div style="border-top: 1px solid #444; padding-top: 10px;"> 
          <label style="display:block; margin-bottom:5px; font-weight:bold;">Custom Icons</label>
          <p style="font-size:10px; color:#888; margin:0 0 10px 0;">Select from popular MDI icons. Leave as "Default" to use built-in animated icons.</p>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div>
              <span style="font-size:10px; color:#fb923c;">🔥 HEATING ICON</span>
              <select id="icon-heating" style="width:100%; padding:6px; border-radius:4px; background:#222; color:white; border:1px solid #444; font-size:11px;">
                <option value="">Default (Animated Flame)</option>
                <option value="mdi:fire" ${this._config.icon_heating === 'mdi:fire' ? 'selected' : ''}>mdi:fire</option>
                <option value="mdi:fireplace" ${this._config.icon_heating === 'mdi:fireplace' ? 'selected' : ''}>mdi:fireplace</option>
                <option value="mdi:radiator" ${this._config.icon_heating === 'mdi:radiator' ? 'selected' : ''}>mdi:radiator</option>
                <option value="mdi:sun-thermometer" ${this._config.icon_heating === 'mdi:sun-thermometer' ? 'selected' : ''}>mdi:sun-thermometer</option>
                <option value="mdi:white-balance-sunny" ${this._config.icon_heating === 'mdi:white-balance-sunny' ? 'selected' : ''}>mdi:white-balance-sunny</option>
                <option value="mdi:thermometer-chevron-up" ${this._config.icon_heating === 'mdi:thermometer-chevron-up' ? 'selected' : ''}>mdi:thermometer-chevron-up</option>
                <option value="mdi:home-thermometer" ${this._config.icon_heating === 'mdi:home-thermometer' ? 'selected' : ''}>mdi:home-thermometer</option>
              </select>
            </div>
            <div>
              <span style="font-size:10px; color:#60a5fa;">❄️ COOLING ICON</span>
              <select id="icon-cooling" style="width:100%; padding:6px; border-radius:4px; background:#222; color:white; border:1px solid #444; font-size:11px;">
                <option value="">Default (Animated Snowflake)</option>
                <option value="mdi:snowflake" ${this._config.icon_cooling === 'mdi:snowflake' ? 'selected' : ''}>mdi:snowflake</option>
                <option value="mdi:snowflake-variant" ${this._config.icon_cooling === 'mdi:snowflake-variant' ? 'selected' : ''}>mdi:snowflake-variant</option>
                <option value="mdi:air-conditioner" ${this._config.icon_cooling === 'mdi:air-conditioner' ? 'selected' : ''}>mdi:air-conditioner</option>
                <option value="mdi:thermometer-chevron-down" ${this._config.icon_cooling === 'mdi:thermometer-chevron-down' ? 'selected' : ''}>mdi:thermometer-chevron-down</option>
                <option value="mdi:weather-snowy" ${this._config.icon_cooling === 'mdi:weather-snowy' ? 'selected' : ''}>mdi:weather-snowy</option>
                <option value="mdi:glacier" ${this._config.icon_cooling === 'mdi:glacier' ? 'selected' : ''}>mdi:glacier</option>
              </select>
            </div>
            <div>
              <span style="font-size:10px; color:#a78bfa;">🔄 HEAT/COOL (AUTO) ICON</span>
              <select id="icon-heat-cool" style="width:100%; padding:6px; border-radius:4px; background:#222; color:white; border:1px solid #444; font-size:11px;">
                <option value="">Default (Animated Hourglass)</option>
                <option value="mdi:autorenew" ${this._config.icon_heat_cool === 'mdi:autorenew' ? 'selected' : ''}>mdi:autorenew</option>
                <option value="mdi:sync" ${this._config.icon_heat_cool === 'mdi:sync' ? 'selected' : ''}>mdi:sync</option>
                <option value="mdi:thermometer-auto" ${this._config.icon_heat_cool === 'mdi:thermometer-auto' ? 'selected' : ''}>mdi:thermometer-auto</option>
                <option value="mdi:heat-wave" ${this._config.icon_heat_cool === 'mdi:heat-wave' ? 'selected' : ''}>mdi:heat-wave</option>
                <option value="mdi:swap-vertical" ${this._config.icon_heat_cool === 'mdi:swap-vertical' ? 'selected' : ''}>mdi:swap-vertical</option>
                <option value="mdi:thermostat-auto" ${this._config.icon_heat_cool === 'mdi:thermostat-auto' ? 'selected' : ''}>mdi:thermostat-auto</option>
              </select>
            </div>
            <div>
              <span style="font-size:10px; color:#fbbf24;">💧 DRY ICON</span>
              <select id="icon-dry" style="width:100%; padding:6px; border-radius:4px; background:#222; color:white; border:1px solid #444; font-size:11px;">
                <option value="">Default (Water Drop)</option>
                <option value="mdi:water-percent" ${this._config.icon_dry === 'mdi:water-percent' ? 'selected' : ''}>mdi:water-percent</option>
                <option value="mdi:water-off" ${this._config.icon_dry === 'mdi:water-off' ? 'selected' : ''}>mdi:water-off</option>
                <option value="mdi:water-minus" ${this._config.icon_dry === 'mdi:water-minus' ? 'selected' : ''}>mdi:water-minus</option>
                <option value="mdi:air-humidifier-off" ${this._config.icon_dry === 'mdi:air-humidifier-off' ? 'selected' : ''}>mdi:air-humidifier-off</option>
                <option value="mdi:weather-sunny" ${this._config.icon_dry === 'mdi:weather-sunny' ? 'selected' : ''}>mdi:weather-sunny</option>
                <option value="mdi:weather-sunset" ${this._config.icon_dry === 'mdi:weather-sunset' ? 'selected' : ''}>mdi:weather-sunset</option>
              </select>
            </div>
            <div>
              <span style="font-size:10px; color:#34d399;">🌀 FAN ONLY ICON</span>
              <select id="icon-fan-only" style="width:100%; padding:6px; border-radius:4px; background:#222; color:white; border:1px solid #444; font-size:11px;">
                <option value="">Default (Spinning Fan)</option>
                <option value="mdi:fan" ${this._config.icon_fan_only === 'mdi:fan' ? 'selected' : ''}>mdi:fan</option>
                <option value="mdi:fan-speed-1" ${this._config.icon_fan_only === 'mdi:fan-speed-1' ? 'selected' : ''}>mdi:fan-speed-1</option>
                <option value="mdi:fan-speed-2" ${this._config.icon_fan_only === 'mdi:fan-speed-2' ? 'selected' : ''}>mdi:fan-speed-2</option>
                <option value="mdi:fan-speed-3" ${this._config.icon_fan_only === 'mdi:fan-speed-3' ? 'selected' : ''}>mdi:fan-speed-3</option>
                <option value="mdi:wind-turbine" ${this._config.icon_fan_only === 'mdi:wind-turbine' ? 'selected' : ''}>mdi:wind-turbine</option>
                <option value="mdi:weather-windy" ${this._config.icon_fan_only === 'mdi:weather-windy' ? 'selected' : ''}>mdi:weather-windy</option>
                <option value="mdi:air-filter" ${this._config.icon_fan_only === 'mdi:air-filter' ? 'selected' : ''}>mdi:air-filter</option>
              </select>
            </div>
            <div>
              <span style="font-size:10px; color:#9ca3af;">⏸️ OFF/POWER ICON</span>
              <select id="icon-off" style="width:100%; padding:6px; border-radius:4px; background:#222; color:white; border:1px solid #444; font-size:11px;">
                <option value="">Default (Power Symbol)</option>
                <option value="mdi:power" ${this._config.icon_off === 'mdi:power' ? 'selected' : ''}>mdi:power</option>
                <option value="mdi:power-off" ${this._config.icon_off === 'mdi:power-off' ? 'selected' : ''}>mdi:power-off</option>
                <option value="mdi:power-standby" ${this._config.icon_off === 'mdi:power-standby' ? 'selected' : ''}>mdi:power-standby</option>
                <option value="mdi:stop-circle" ${this._config.icon_off === 'mdi:stop-circle' ? 'selected' : ''}>mdi:stop-circle</option>
                <option value="mdi:sleep" ${this._config.icon_off === 'mdi:sleep' ? 'selected' : ''}>mdi:sleep</option>
                <option value="mdi:cancel" ${this._config.icon_off === 'mdi:cancel' ? 'selected' : ''}>mdi:cancel</option>
              </select>
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
    this.querySelector('#heat-cool-start').addEventListener('input', (ev) => this._update('heat_cool_start', ev.target.value)); 
    this.querySelector('#heat-cool-end').addEventListener('input', (ev) => this._update('heat_cool_end', ev.target.value)); 
    this.querySelector('#dry-start').addEventListener('input', (ev) => this._update('dry_start', ev.target.value)); 
    this.querySelector('#dry-end').addEventListener('input', (ev) => this._update('dry_end', ev.target.value)); 
    this.querySelector('#fan-only-start').addEventListener('input', (ev) => this._update('fan_only_start', ev.target.value)); 
    this.querySelector('#fan-only-end').addEventListener('input', (ev) => this._update('fan_only_end', ev.target.value)); 
    this.querySelector('#idle-start').addEventListener('input', (ev) => this._update('idle_start', ev.target.value)); 
    this.querySelector('#idle-end').addEventListener('input', (ev) => this._update('idle_end', ev.target.value)); 
    this.querySelector('#current-temp-color').addEventListener('input', (ev) => this._update('current_temp_color', ev.target.value)); 
    this.querySelector('#name-color').addEventListener('input', (ev) => this._update('name_color', ev.target.value)); 
    this.querySelector('#target-label-color').addEventListener('input', (ev) => this._update('target_label_color', ev.target.value)); 
    this.querySelector('#target-temp-color').addEventListener('input', (ev) => this._update('target_temp_color', ev.target.value)); 
    this.querySelector('#icon-heating').addEventListener('change', (ev) => this._update('icon_heating', ev.target.value)); 
    this.querySelector('#icon-cooling').addEventListener('change', (ev) => this._update('icon_cooling', ev.target.value)); 
    this.querySelector('#icon-heat-cool').addEventListener('change', (ev) => this._update('icon_heat_cool', ev.target.value)); 
    this.querySelector('#icon-dry').addEventListener('change', (ev) => this._update('icon_dry', ev.target.value)); 
    this.querySelector('#icon-fan-only').addEventListener('change', (ev) => this._update('icon_fan_only', ev.target.value)); 
    this.querySelector('#icon-off').addEventListener('change', (ev) => this._update('icon_off', ev.target.value)); 
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
  name: 'CAT Thermostat Card', 
  description: 'Dynamic Thermostat card with all HVAC modes, custom colors, animated icons, and 0.5° increments.', 
  preview: true, 
});
