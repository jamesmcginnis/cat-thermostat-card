// --- THE MAIN CARD CLASS ---
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
      color_start: '#fb923c',
      color_end: '#f97316'
    };
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this.config?.entity;
    const entity = entityId ? hass.states[entityId] : null;

    if (!entity) {
      this._renderPlaceholder();
      return;
    }

    if (!this.shadowRoot.querySelector('.cat-card')) {
      this._renderStructure();
    }

    this._updateContent(entity);
  }

  _renderPlaceholder() {
    this.shadowRoot.innerHTML = `
      <div style="padding: 24px; border: 2px dashed rgba(255,255,255,0.3); border-radius: 24px; text-align: center; background: #2c2c2c; color: white; font-family: system-ui;">
        <div style="font-size: 16px; font-weight: 600;">CAT Thermostat</div>
        <div style="font-size: 12px; opacity: 0.6; margin-top: 4px;">Select your radiator in the editor dropdown</div>
      </div>
    `;
  }

  _renderStructure() {
    const colorStart = this.config.color_start || '#fb923c';
    const colorEnd = this.config.color_end || '#f97316';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .cat-card {
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.5s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, ${colorStart} 0%, ${colorEnd} 100%);
          font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .cat-card:active { transform: scale(0.97); }
        .card-header { padding: 24px 24px 16px; }
        .heating-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .heating-icon { width: 20px; height: 20px; color: white; opacity: 0.5; }
        .is-heating .heating-icon { animation: breathe 2s infinite ease-in-out; opacity: 1; }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .status-text { color: white; font-size: 14px; font-weight: 500; opacity: 0.9; }
        .radiator-name { color: white; font-size: 24px; font-weight: 600; margin: 0; }
        .temp-display { padding: 0 24px 24px; }
        .current-temp-wrapper { display: flex; align-items: baseline; }
        .current-temp { color: white; font-size: 72px; font-weight: 300; line-height: 1; letter-spacing: -2px; }
        .degree-symbol { color: white; font-size: 42px; font-weight: 300; opacity: 0.8; margin-left: 2px; }
        .target-section {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px 24px;
        }
        .target-label { color: white; font-size: 13px; font-weight: 500; opacity: 0.7; text-transform: uppercase; }
        .target-temp { color: white; font-size: 32px; font-weight: 600; }
        .target-degree { font-size: 18px; margin-left: 1px; }
      </style>
      <div class="cat-card">
        <div class="card-header">
          <div class="heating-indicator">
            <svg class="heating-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C12,2 12,2 12,2C10.07,2 8.5,3.57 8.5,5.5C8.5,6.62 9.03,7.62 9.84,8.27C8.16,9.2 7,10.96 7,13C7,15.76 9.24,18 12,18C14.76,18 17,15.76 17,13C17,11.04 15.84,9.2 14.16,8.27C14.97,7.62 15.5,6.62 15.5,5.5C15.5,3.57 13.93,2 12,2M12,16C10.34,16 9,14.66 9,13C9,11.71 9.81,10.6 10.96,10.16L12,9.75L13.04,10.16C14.19,10.6 15,11.71 15,13C15,14.66 13.66,16 12,16Z" />
            </svg>
            <span class="status-text">Idle</span>
          </div>
          <h2 class="radiator-name">---</h2>
        </div>
        <div class="temp-display">
          <div class="current-temp-wrapper">
            <span class="current-temp">--</span>
            <span class="degree-symbol">°</span>
          </div>
        </div>
        <div class="target-section">
          <div class="target-label">Heat to</div>
          <div class="target-temp-wrapper">
            <span class="target-temp">--</span><span class="target-degree">°</span>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.cat-card').addEventListener('click', () => {
      if (this.config.entity) {
        const event = new CustomEvent('hass-more-info', {
          detail: { entityId: this.config.entity },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }
    });
  }

  _updateContent(entity) {
    const card = this.shadowRoot.querySelector('.cat-card');
    if (!card) return;
    const isHeating = entity.state === 'heat' || entity.attributes.hvac_action === 'heating';
    card.classList.toggle('is-heating', isHeating);
    card.style.background = `linear-gradient(135deg, ${this.config.color_start || '#fb923c'} 0%, ${this.config.color_end || '#f97316'} 100%)`;
    this.shadowRoot.querySelector('.current-temp').textContent = Math.round(entity.attributes.current_temperature || 0);
    this.shadowRoot.querySelector('.target-temp').textContent = Math.round(entity.attributes.temperature || 0);
    this.shadowRoot.querySelector('.radiator-name').textContent = this.config.name || entity.attributes.friendly_name || this.config.entity;
    this.shadowRoot.querySelector('.status-text').textContent = isHeating ? 'Heating' : 'Idle';
  }
}

// --- THE VISUAL EDITOR CLASS ---
class CATThermostatCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;

    // We only want to set the innerHTML once to avoid flickering and focus loss
    if (!this._initialRender) {
      this.innerHTML = `
        <div class="card-config" style="display: flex; flex-direction: column; gap: 16px; padding: 10px;">
          <div id="picker-container"></div>
          <paper-input 
            label="Custom Name (Optional)" 
            .value="${this._config.name || ''}" 
            config-value="name"
          ></paper-input>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <ha-color-picker label="Start" .hass="${this._hass}" .value="${this._config.color_start || '#fb923c'}" config-value="color_start"></ha-color-picker>
            <ha-color-picker label="End" .hass="${this._hass}" .value="${this._config.color_end || '#f97316'}" config-value="color_end"></ha-color-picker>
          </div>
        </div>
      `;
      this._initialRender = true;
    }

    // Update or Create the Entity Picker dynamically
    let picker = this.querySelector("ha-entity-picker");
    if (!picker) {
      picker = document.createElement("ha-entity-picker");
      picker.setAttribute("label", "Radiator Entity");
      picker.setAttribute("config-value", "entity");
      picker.includeDomains = ["climate"];
      this.querySelector("#picker-container").appendChild(picker);
      
      picker.addEventListener("value-changed", (ev) => this._valueChanged(ev));
      this.querySelectorAll("paper-input, ha-color-picker").forEach(el => {
         el.addEventListener("value-changed", (ev) => this._valueChanged(ev));
      });
    }

    // Always keep the picker synced with the current state
    picker.hass = this._hass;
    picker.value = this._config.entity;
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const target = ev.target;
    const configValue = target.getAttribute("config-value");
    const newValue = ev.detail.value;

    if (this._config[configValue] === newValue) return;

    const newConfig = { ...this._config, [configValue]: newValue };
    
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
  name: 'CAT Thermostat Card',
  description: 'A HomeKit-style radiator card',
  preview: true,
});
