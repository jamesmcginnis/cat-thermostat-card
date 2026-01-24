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
    if (!this.config || !this.config.entity) {
      this._renderPlaceholder();
      return;
    }

    const entity = hass.states[this.config.entity];
    if (!entity) {
      this._renderPlaceholder("Entity not found");
      return;
    }

    this._renderStructure();
    this._updateContent(entity);
  }

  _renderPlaceholder(msg = "Select a radiator in the editor") {
    this.shadowRoot.innerHTML = `
      <div style="padding: 24px; border: 2px dashed #444; border-radius: 24px; text-align: center; color: #aaa; font-family: sans-serif;">
        <b>CAT Thermostat</b><br>${msg}
      </div>
    `;
  }

  _renderStructure() {
    if (this.shadowRoot.querySelector('.cat-card')) return;
    this.shadowRoot.innerHTML = `
      <style>
        .cat-card {
          border-radius: 24px; padding: 24px; color: white;
          font-family: system-ui, sans-serif; transition: background 0.5s ease;
        }
        .name { font-size: 20px; font-weight: 600; margin: 0; }
        .temp { font-size: 48px; font-weight: 300; margin: 8px 0; }
        .status { opacity: 0.7; font-size: 12px; text-transform: uppercase; }
      </style>
      <div class="cat-card">
        <div class="status">--</div>
        <h2 class="name">---</h2>
        <div class="temp">--°</div>
      </div>
    `;
  }

  _updateContent(entity) {
    const card = this.shadowRoot.querySelector('.cat-card');
    if (!card) return;
    const isHeating = entity.state === 'heat' || entity.attributes.hvac_action === 'heating';
    card.style.background = `linear-gradient(135deg, ${this.config.color_start || '#fb923c'} 0%, ${this.config.color_end || '#f97316'} 100%)`;
    this.shadowRoot.querySelector('.name').textContent = this.config.name || entity.attributes.friendly_name;
    this.shadowRoot.querySelector('.temp').textContent = Math.round(entity.attributes.current_temperature || 0) + '°';
    this.shadowRoot.querySelector('.status').textContent = isHeating ? 'Heating' : 'Idle';
  }
}

// --- UPDATED EDITOR ---
class CATThermostatCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    // CRITICAL: Stop if config is missing to prevent the 'undefined' error
    if (!this._config || !this._hass) return;
    if (this._initialized) {
        // Keep the form updated with latest HASS data
        const form = this.querySelector('ha-form');
        if (form) form.hass = this._hass;
        return;
    }

    this._initialized = true;
    this.innerHTML = `
      <div style="padding: 16px;">
        <ha-form
          .hass="${this._hass}"
          .data="${this._config}"
          .schema="${[
            { name: "entity", label: "Select Radiator", selector: { entity: { domain: "climate" } } },
            { name: "name", label: "Display Name", selector: { text: {} } },
            { name: "color_start", label: "Start Color", selector: { color_rgb: {} } },
            { name: "color_end", label: "End Color", selector: { color_rgb: {} } }
          ]}"
          .computeLabel="${(s) => s.label}"
        ></ha-form>
      </div>
    `;

    this.querySelector("ha-form").addEventListener("value-changed", (ev) => {
      const config = ev.detail.value;
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }));
    });
  }
}

customElements.define('cat-thermostat-card', CATThermostatCard);
customElements.define('cat-thermostat-card-editor', CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'cat-thermostat-card',
  name: 'CAT Radiator Card',
  description: 'Visual editor with working entity dropdown.',
  preview: true,
});
