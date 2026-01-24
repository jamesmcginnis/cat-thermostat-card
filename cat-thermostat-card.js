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
      <div style="padding: 24px; border: 2px dashed #444; border-radius: 24px; text-align: center; color: #aaa; font-family: sans-serif;">
        <b>CAT Thermostat</b><br>
        Select a radiator entity in the editor below.
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
          padding: 24px;
          transition: background 0.5s ease;
          background: linear-gradient(135deg, ${colorStart} 0%, ${colorEnd} 100%);
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .radiator-name { font-size: 24px; font-weight: 600; margin: 0; }
        .current-temp { font-size: 64px; font-weight: 300; }
        .status { opacity: 0.8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      </style>
      <div class="cat-card">
        <div class="status">Idle</div>
        <h2 class="radiator-name">---</h2>
        <div class="current-temp">--°</div>
      </div>
    `;
  }

  _updateContent(entity) {
    const card = this.shadowRoot.querySelector('.cat-card');
    if (!card) return;
    
    const isHeating = entity.state === 'heat' || entity.attributes.hvac_action === 'heating';
    card.style.background = `linear-gradient(135deg, ${this.config.color_start || '#fb923c'} 0%, ${this.config.color_end || '#f97316'} 100%)`;
    
    this.shadowRoot.querySelector('.radiator-name').textContent = this.config.name || entity.attributes.friendly_name || this.config.entity;
    this.shadowRoot.querySelector('.current-temp').textContent = Math.round(entity.attributes.current_temperature || 0) + '°';
    this.shadowRoot.querySelector('.status').textContent = isHeating ? 'Heating' : 'Idle';
  }
}

// --- THE VISUAL EDITOR CLASS ---
class CATThermostatCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._render();
    } else {
      // Keep the picker updated with latest hass data so the list populates
      const picker = this.querySelector("ha-entity-picker");
      if (picker) picker.hass = hass;
    }
  }

  _render() {
    this._initialized = true;
    this.innerHTML = `
      <div id="editor-container" style="display: flex; flex-direction: column; gap: 20px; padding: 10px;">
        <div id="picker-slot"></div>
        <paper-input label="Custom Name" id="name-input"></paper-input>
        <div style="display: flex; gap: 10px;">
           <ha-color-picker label="Start" id="color-start"></ha-color-picker>
           <ha-color-picker label="End" id="color-end"></ha-color-picker>
        </div>
      </div>
    `;

    // 1. Manually create the Entity Picker to ensure it registers correctly
    const picker = document.createElement("ha-entity-picker");
    picker.label = "Select Radiator Entity";
    picker.hass = this._hass;
    picker.value = this._config.entity;
    picker.includeDomains = ["climate"]; // This limits the list to Radiators/Thermostats
    picker.allowCustomEntity = true;
    
    this.querySelector("#picker-slot").appendChild(picker);

    // 2. Set initial values for other fields
    this.querySelector("#name-input").value = this._config.name || "";
    this.querySelector("#color-start").value = this._config.color_start || "#fb923c";
    this.querySelector("#color-end").value = this._config.color_end || "#f97316";

    // 3. Listen for changes
    picker.addEventListener("value-changed", (ev) => this._handleUpdate("entity", ev.detail.value));
    this.querySelector("#name-input").addEventListener("value-changed", (ev) => this._handleUpdate("name", ev.detail.value));
    this.querySelector("#color-start").addEventListener("value-changed", (ev) => this._handleUpdate("color_start", ev.detail.value));
    this.querySelector("#color-end").addEventListener("value-changed", (ev) => this._handleUpdate("color_end", ev.detail.value));
  }

  _handleUpdate(key, value) {
    if (!this._config) return;
    const newConfig = { ...this._config, [key]: value };
    this._config = newConfig; // Update local copy
    
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }
}

// Register components
customElements.define('cat-thermostat-card', CATThermostatCard);
customElements.define('cat-thermostat-card-editor', CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cat-thermostat-card',
  name: 'CAT Radiator Card',
  description: 'A custom card for radiators with a working picker.',
  preview: true,
});
