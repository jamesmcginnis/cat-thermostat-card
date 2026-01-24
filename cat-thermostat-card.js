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
    if (!this.config) return;

    const entityId = this.config.entity;
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
      <div style="padding: 24px; border: 2px dashed #444; border-radius: 24px; text-align: center; color: #aaa; font-family: sans-serif; background: #222;">
        <b>CAT Thermostat</b><br>
        Please select a radiator in the editor dropdown below.
      </div>
    `;
  }

  _renderStructure() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .cat-card {
          border-radius: 24px;
          padding: 24px;
          transition: background 0.5s ease;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .radiator-name { font-size: 22px; font-weight: 600; margin: 0; }
        .current-temp { font-size: 56px; font-weight: 300; margin: 10px 0; }
        .status { opacity: 0.7; font-size: 13px; text-transform: uppercase; font-weight: bold; }
      </style>
      <div class="cat-card">
        <div class="status">--</div>
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

// --- THE ROBUST VISUAL EDITOR CLASS ---
class CATThermostatCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    // GUARD: If config isn't loaded yet, stop to prevent "undefined" error
    if (!this._config || !this._hass) return;

    // Only build the UI once to prevent focus loss and flickering
    if (!this._initialized) {
      this.innerHTML = `
        <style>
          .editor-container { display: flex; flex-direction: column; gap: 16px; padding: 10px; font-family: sans-serif; }
          .label { display: block; margin-bottom: 8px; font-size: 12px; opacity: 0.8; }
        </style>
        <div class="editor-container">
          <div id="entity-picker-area"></div>
          <paper-input label="Custom Name (Optional)" id="name-input" .configValue="${"name"}"></paper-input>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <span class="label">Start Color</span>
              <ha-color-picker id="start-picker" .configValue="${"color_start"}"></ha-color-picker>
            </div>
            <div>
              <span class="label">End Color</span>
              <ha-color-picker id="end-picker" .configValue="${"color_end"}"></ha-color-picker>
            </div>
          </div>
        </div>
      `;

      // Manually create the entity picker to force it to initialize
      const picker = document.createElement("ha-entity-picker");
      picker.setAttribute("label", "Select Radiator");
      picker.includeDomains = ["climate"];
      picker.setAttribute("config-value", "entity");
      this.querySelector("#entity-picker-area").appendChild(picker);

      // Attach events
      this.addEventListener("value-changed", this._valueChanged.bind(this));
      
      this._initialized = true;
    }

    // Always sync current data to the elements
    const picker = this.querySelector("ha-entity-picker");
    if (picker) {
      picker.hass = this._hass;
      picker.value = this._config.entity || "";
    }
    
    this.querySelector("#name-input").value = this._config.name || "";
    this.querySelector("#start-picker").value = this._config.color_start || "#fb923c";
    this.querySelector("#end-picker").value = this._config.color_end || "#f97316";
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const target = ev.target;
    const configValue = target.configValue || target.getAttribute("config-value");
    const value = ev.detail.value;

    if (this._config[configValue] === value) return;

    const newConfig = { ...this._config, [configValue]: value };
    
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
  description: 'Fixed radiator card with working entity list.',
  preview: true,
});
