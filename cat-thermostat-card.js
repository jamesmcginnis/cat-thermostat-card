class CATThermostatCardEditor extends HTMLElement {

  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._elements = {};
    this._rendered = false;
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._rendered) {
      this._updateFields();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    } else {
      this._populateEntityList();
    }
  }

  /* ───────────────────────────────────────────── */

  _render() {
    if (!this._hass) return;

    this.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
          font-size: 13px;
        }

        .field {
          margin-bottom: 14px;
        }

        .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .hint {
          font-size: 11px;
          font-weight: 400;
          color: var(--secondary-text-color, #6b7280);
          margin-left: 4px;
        }

        .inp, .sel {
          width: 100%;
          padding: 9px 10px;
          background: var(--input-fill-color, #111111);
          border: 1px solid var(--input-ink-color, #383838);
          border-radius: 7px;
          color: var(--primary-text-color, #fff);
          font-size: 13px;
          box-sizing: border-box;
        }

        .inp:focus, .sel:focus {
          outline: none;
          border-color: var(--primary-color, #6366f1);
        }
      </style>

      <div class="field">
        <label class="label">Climate Entity</label>
        <select class="sel" id="entity"></select>
      </div>

      <div class="field">
        <label class="label">
          Display Name
          <span class="hint">(leave blank to use entity name)</span>
        </label>
        <input class="inp" id="name" type="text" placeholder="e.g. Living Room">
      </div>

      <div class="field">
        <label class="label">
          <input type="checkbox" id="show_controls">
          Show +/− Buttons
        </label>
      </div>
    `;

    /* Cache element references */
    this._elements.entity = this.querySelector('#entity');
    this._elements.name = this.querySelector('#name');
    this._elements.show_controls = this.querySelector('#show_controls');

    /* Populate dropdown */
    this._populateEntityList();

    /* Bind events ONCE */
    this._elements.entity.addEventListener('change', e => {
      this._update('entity', e.target.value);
    });

    this._elements.name.addEventListener('input', e => {
      this._update('name', e.target.value);
    });

    this._elements.show_controls.addEventListener('change', e => {
      this._update('show_controls', e.target.checked);
    });

    /* Apply current config */
    this._updateFields();
  }

  /* ───────────────────────────────────────────── */

  _populateEntityList() {
    if (!this._hass || !this._elements.entity) return;

    const climateEntities = Object.keys(this._hass.states)
      .filter(e => e.startsWith('climate.'));

    const select = this._elements.entity;
    const current = select.value;

    select.innerHTML = `
      <option value="">— Select a thermostat —</option>
      ${climateEntities.map(eid => `
        <option value="${eid}">
          ${this._hass.states[eid].attributes.friendly_name || eid}
        </option>
      `).join('')}
    `;

    select.value = this._config.entity || current || '';
  }

  /* ───────────────────────────────────────────── */

  _updateFields() {
    if (!this._elements.name) return;

    this._elements.entity.value =
      this._config.entity || '';

    this._elements.name.value =
      this._config.name || '';

    this._elements.show_controls.checked =
      this._config.show_controls !== false;
  }

  /* ───────────────────────────────────────────── */

  _update(key, value) {
    this._config = {
      ...this._config,
      [key]: value
    };

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}
