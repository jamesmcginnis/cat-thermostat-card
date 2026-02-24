/* =====================================================================
   CAT Thermostat Card  –  Home Assistant Custom Card
   ===================================================================== */

class CATThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement('cat-thermostat-card-editor');
  }

  static getStubConfig() {
    return {
      entity: '',
      name: '',
      idle_start:      '#374151',
      idle_end:        '#111827',
      heat_start:      '#fb923c',
      heat_end:        '#f97316',
      cool_start:      '#60a5fa',
      cool_end:        '#2563eb',
      heat_cool_start: '#a78bfa',
      heat_cool_end:   '#7c3aed',
      dry_start:       '#fbbf24',
      dry_end:         '#f59e0b',
      fan_only_start:  '#34d399',
      fan_only_end:    '#10b981',
      current_temp_color:  '#ffffff',
      name_color:          '#ffffff',
      target_label_color:  '#ffffff',
      target_temp_color:   '#ffffff',
      icon_color: '#ffffff',
      btn_bg_color:   '#ffffff',
      btn_icon_color: '#ffffff',
      show_controls: true,
      icon_heating:   '',
      icon_cooling:   '',
      icon_heat_cool: '',
      icon_dry:       '',
      icon_fan_only:  '',
      icon_off:       '',
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
    this.shadowRoot.innerHTML = `
      <div style="padding:15px;border:1px dashed #888;border-radius:12px;
                  text-align:center;color:#888;font-size:12px;">
        Select a Thermostat in the Visual Editor
      </div>`;
  }

  _renderStructure() {
    if (this.shadowRoot.querySelector('.card')) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block;height:100%; }
        .card {
          border-radius:var(--ha-card-border-radius,12px);
          padding:16px;
          color:white;
          font-family:var(--paper-font-common-base_-_font-family,inherit);
          min-height:100px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          transition:background 0.8s ease;
          box-shadow:var(--ha-card-box-shadow,0 2px 2px rgba(0,0,0,0.14));
          box-sizing:border-box;
          height:100%;
          position:relative;
        }
        .top-row { display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer; }
        .temp-group{ display:flex;flex-direction:column; }
        .current-temp{ font-size:34px;font-weight:300;line-height:1;margin-bottom:2px; }
        .entity-name{
          font-size:11px;font-weight:700;opacity:.7;
          text-transform:uppercase;letter-spacing:.5px;
        }
        .state-icon{ width:24px;height:24px;cursor:pointer; }
        ha-icon.state-icon{ --mdc-icon-size:24px;display:block; }
        .is-active .state-icon{ animation:breathe 2.5s infinite ease-in-out; }
        @keyframes breathe{
          0%,100%{transform:scale(1);opacity:.6;}
          50%{transform:scale(1.1);opacity:1;}
        }
        @keyframes spin{
          0%{transform:rotate(0deg);}
          100%{transform:rotate(360deg);}
        }
        @keyframes pulse{
          0%,100%{transform:scale(1);opacity:.7;}
          50%{transform:scale(1.15);opacity:1;}
        }
        .bottom-row{
          display:flex;justify-content:space-between;
          align-items:flex-end;margin-top:12px;
        }
        .target-info{ display:flex;align-items:baseline;gap:4px; }
        .target-label{ font-size:11px;opacity:.7;font-weight:600; }
        .target-temp{ font-size:14px;font-weight:600; }
        .controls{ display:flex;gap:8px; }
        .btn{
          border:none;border-radius:8px;width:32px;height:32px;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:filter .2s,transform .1s;
        }
        .btn:hover{filter:brightness(1.3);}
        .btn:active{transform:scale(.9);}
        .btn svg{width:18px;height:18px;fill:currentColor;}
      </style>

      <div class="card">
        <div class="top-row">
          <div class="temp-group">
            <div class="current-temp">--&deg;</div>
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
            <button class="btn minus">
              <svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z"/></svg>
            </button>
            <button class="btn plus">
              <svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ========================= EDITOR ========================= */

class CATThermostatCardEditor extends HTMLElement {

  setConfig(config) {
    this._config = config || {};
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;

    const c  = this._config;
    const hs = this._hass.states;
    const climateEntities = Object.keys(hs).filter(e => e.startsWith('climate.'));

    this.innerHTML = `
      <style>
        :host{display:block;font-family:sans-serif;font-size:13px;}
        .field{margin-bottom:12px;}
        .inp,.sel{
          width:100%;padding:8px;border-radius:6px;
          border:1px solid #444;background:#111;color:#fff;
        }
      </style>

      <div class="field">
        <label>Climate Entity</label>
        <select id="entity-select" class="sel">
          <option value="">— Select a thermostat —</option>
          ${climateEntities.map(eid => `
            <option value="${eid}" ${c.entity===eid?'selected':''}>
              ${hs[eid].attributes.friendly_name||eid}
            </option>`).join('')}
        </select>
      </div>

      <div class="field">
        <label>Display Name</label>
        <input id="name-input" class="inp" type="text"
               value="${c.name||''}" placeholder="e.g. Living Room">
      </div>
    `;

    this.querySelector('#entity-select')
      .addEventListener('change', ev => this._update('entity', ev.target.value));

    this.querySelector('#name-input')
      .addEventListener('input', ev => this._update('name', ev.target.value));
  }

  _update(key,value){
    this._config={...this._config,[key]:value};
    this.dispatchEvent(new CustomEvent('config-changed',{
      detail:{config:this._config},
      bubbles:true,
      composed:true,
    }));
  }
}

/* ── Registration ───────────────────────────────────────── */

customElements.define('cat-thermostat-card',        CATThermostatCard);
customElements.define('cat-thermostat-card-editor', CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:'cat-thermostat-card',
  name:'CAT Thermostat Card',
  description:'Dynamic thermostat card with all HVAC modes, custom colours, animated icons, and 0.5° increments.',
  preview:true,
});
