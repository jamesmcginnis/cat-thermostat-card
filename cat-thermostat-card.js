/* =====================================================================
CAT Thermostat Card  –  Home Assistant Custom Card
===================================================================== */

class CATThermostatCard extends HTMLElement {
constructor() {
super();
this.attachShadow({ mode: ‘open’ });
}

static getConfigElement() {
return document.createElement(‘cat-thermostat-card-editor’);
}

static getStubConfig() {
return {
entity: ‘’,
name: ‘’,
// Background gradients
idle_start:      ‘#374151’,
idle_end:        ‘#111827’,
heat_start:      ‘#fb923c’,
heat_end:        ‘#f97316’,
cool_start:      ‘#60a5fa’,
cool_end:        ‘#2563eb’,
heat_cool_start: ‘#a78bfa’,
heat_cool_end:   ‘#7c3aed’,
dry_start:       ‘#fbbf24’,
dry_end:         ‘#f59e0b’,
fan_only_start:  ‘#34d399’,
fan_only_end:    ‘#10b981’,
// Text colours
current_temp_color:  ‘#ffffff’,
name_color:          ‘#ffffff’,
target_label_color:  ‘#ffffff’,
target_temp_color:   ‘#ffffff’,
// Icon colour
icon_color: ‘#ffffff’,
// Button colours
btn_bg_color:   ‘#ffffff’,
btn_icon_color: ‘#ffffff’,
// Show +/- controls
show_controls: true,
power_on_mode: ‘’,
idle_icon: ‘power’,
// Custom icons (empty = use built-in animated SVG)
icon_heating:   ‘’,
icon_cooling:   ‘’,
icon_heat_cool: ‘’,
icon_dry:       ‘’,
icon_fan_only:  ‘’,
icon_off:       ‘’,
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
this.shadowRoot.innerHTML = ` <div style="padding:15px;border:1px dashed #888;border-radius:12px; text-align:center;color:#888;font-size:12px;"> Select a Thermostat in the Visual Editor </div>`;
}

_renderStructure() {
if (this.shadowRoot.querySelector(’.card’)) return;

```
this.shadowRoot.innerHTML = `
  <style>
    :host { display: block; height: 100%; }

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
      box-sizing: border-box;
      height: 100%;
      position: relative;
    }

    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      cursor: pointer;
    }
    .temp-group  { display: flex; flex-direction: column; }
    .current-temp { font-size: 34px; font-weight: 300; line-height: 1; margin-bottom: 2px; }
    .entity-name {
      font-size: 11px; font-weight: 700; opacity: 0.7;
      text-transform: uppercase; letter-spacing: 0.5px;
    }

    .state-icon { width: 24px; height: 24px; cursor: pointer; }
    ha-icon.state-icon { --mdc-icon-size: 24px; display: block; }
    .is-active .state-icon { animation: breathe 2.5s infinite ease-in-out; }

    @keyframes breathe {
      0%, 100% { transform: scale(1);    opacity: 0.6; }
      50%       { transform: scale(1.1); opacity: 1;   }
    }
    @keyframes spin {
      0%   { transform: rotate(0deg);   }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1);    opacity: 0.7; }
      50%       { transform: scale(1.15); opacity: 1;  }
    }

    .bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 12px;
    }
    .target-info { display: flex; align-items: baseline; gap: 4px; }
    .target-label { font-size: 11px; opacity: 0.7; font-weight: 600; }
    .target-temp  { font-size: 14px; font-weight: 600; }

    .controls { display: flex; gap: 8px; }
    .btn {
      border: none;
      border-radius: 8px;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: filter 0.2s, transform 0.1s;
    }
    .btn:hover  { filter: brightness(1.3); }
    .btn:active { transform: scale(0.9); }
    .btn svg { width: 18px; height: 18px; fill: currentColor; }
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

this.shadowRoot.querySelector('.top-row').addEventListener('click', (e) => {
  if (e.target.closest('.icon-container')) return;
  this.dispatchEvent(new CustomEvent('hass-more-info', {
    detail: { entityId: this.config.entity },
    bubbles: true,
    composed: true,
  }));
});

this.shadowRoot.querySelector('.minus').addEventListener('click', (e) => {
  e.stopPropagation();
  this._changeTemp(-0.5);
});

this.shadowRoot.querySelector('.plus').addEventListener('click', (e) => {
  e.stopPropagation();
  this._changeTemp(0.5);
});
```

}

// ── Helpers ────────────────────────────────────────────────────────

_changeTemp(delta) {
const entity  = this._hass.states[this.config.entity];
const newTemp = parseFloat(((entity.attributes.temperature || 0) + delta).toFixed(1));
this._hass.callService(‘climate’, ‘set_temperature’, {
entity_id: this.config.entity,
temperature: newTemp,
});
}

_togglePower() {
const entity = this._hass.states[this.config.entity];
if (entity.state === ‘off’) {
const modes = entity.attributes.hvac_modes || [];
const preferred = this.config.power_on_mode;
let target;
if (preferred && modes.includes(preferred)) {
target = preferred;
} else {
if      (modes.includes(‘auto’))      target = ‘auto’;
else if (modes.includes(‘heat_cool’)) target = ‘heat_cool’;
else if (modes.includes(‘heat’))      target = ‘heat’;
else if (modes.includes(‘cool’))      target = ‘cool’;
else if (modes.length > 1)            target = modes.find(m => m !== ‘off’) || modes[0];
}
if (!target) return;
this._hass.callService(‘climate’, ‘set_hvac_mode’, {
entity_id: this.config.entity,
hvac_mode: target,
});
} else {
this._hass.callService(‘climate’, ‘turn_off’, { entity_id: this.config.entity });
}
}

_getHvacMode(entity) {
const action = entity.attributes.hvac_action;
const state  = entity.state;

```
if (action === 'heating') return 'heating';
if (action === 'cooling') return 'cooling';
if (action === 'drying')  return 'dry';
if (action === 'fan')     return 'fan_only';
if (action === 'idle')    return 'idle';

if (state === 'heat')                          return 'heating';
if (state === 'cool')                          return 'cooling';
if (state === 'heat_cool' || state === 'auto') return 'heat_cool';
if (state === 'dry')                           return 'dry';
if (state === 'fan_only')                      return 'fan_only';

return 'idle';
```

}

// ── Main render ───────────────────────────────────────────────────

_updateContent(entity) {
const card = this.shadowRoot.querySelector(’.card’);
if (!card) return;

```
const mode     = this._getHvacMode(entity);
const isActive = mode !== 'idle';

// Background gradient
const gradients = {
  heating:  [this.config.heat_start      || '#fb923c', this.config.heat_end      || '#f97316'],
  cooling:  [this.config.cool_start      || '#60a5fa', this.config.cool_end      || '#2563eb'],
  heat_cool:[this.config.heat_cool_start || '#a78bfa', this.config.heat_cool_end || '#7c3aed'],
  dry:      [this.config.dry_start       || '#fbbf24', this.config.dry_end       || '#f59e0b'],
  fan_only: [this.config.fan_only_start  || '#34d399', this.config.fan_only_end  || '#10b981'],
};
const [start, end] = gradients[mode] || [
  this.config.idle_start || '#374151',
  this.config.idle_end   || '#111827',
];
card.style.background = `linear-gradient(135deg, ${start}, ${end})`;
card.classList.toggle('is-active', isActive);

// ── Show / hide +/- controls ────────────────────────────────────
const controlsEl = this.shadowRoot.querySelector('.controls');
if (controlsEl) {
  controlsEl.style.display = (this.config.show_controls === false) ? 'none' : 'flex';
}

// ── Button colours ──────────────────────────────────────────────
const btnBg   = this.config.btn_bg_color   || '#ffffff';
const btnIcon = this.config.btn_icon_color || '#ffffff';

// Convert hex to rgba so we keep a translucent glass look at 25% opacity
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

this.shadowRoot.querySelectorAll('.btn').forEach(btn => {
  btn.style.background = hexToRgba(btnBg, 0.25);
  btn.style.color      = btnIcon;
});

// ── Icon ────────────────────────────────────────────────────────
const defaultIcons = {
  heating:   `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12C6.5,10.15 7.42,8.5 8.84,7.5C8.35,9.03 8.89,10.74 10.13,11.66C10.1,11.44 10.08,11.22 10.08,11C10.08,9.08 11.08,7.39 12.58,6.44C12.1,8.03 12.72,9.78 14.09,10.73C14.06,10.5 14.03,10.25 14.03,10C14.03,8.37 14.73,6.91 15.84,5.88C15.42,7.5 16.09,9.25 17.5,10.23V12M12,22A10,10 0 0,0 22,12C22,10.03 21.42,8.2 20.42,6.67C19.89,8.27 18.5,9.44 16.82,9.44C17.2,8.08 17,6.62 16.24,5.43C16.89,4 16.89,2.37 16.24,1C14.41,2.29 13.31,4.43 13.31,6.82C11.94,5.43 10,4.55 7.91,4.55C8.42,6.03 8.24,7.67 7.42,9C5.31,10.11 3.88,12.38 3.88,15A8.12,8.12 0 0,0 12,23.12V22Z"/></svg>`,
  cooling:   `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22,11H19.17L21,9.17L19.58,7.76L17.17,10.17L15,8V5H18V3H15V1H13V3H11V1H9V3H6V5H9V8L6.83,10.17L4.42,7.76L3,9.17L4.83,11H2V13H4.83L3,14.83L4.42,16.24L6.83,13.83L9,16V19H6V21H9V23H11V21H13V23H15V21H18V19H15V16L17.17,13.83L19.58,16.24L21,14.83L19.17,13H22V11M13,14V19H11V14H6.5L9,11.5L6.5,9H11V4H13V9H17.5L15,11.5L17.5,14H13Z"/></svg>`,
  heat_cool: `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="animation:pulse 2s infinite ease-in-out"><path d="M12,2C10.73,2 9.6,2.8 9.18,4H3V6H4.95L2,14C1.53,16 3,17.45 5.5,18C8.5,18.55 9.5,19.5 9.5,21H14.5C14.5,19.5 15.5,18.55 18.5,18C21,17.45 22.47,16 22,14L19.05,6H21V4H14.82C14.4,2.8 13.27,2 12,2M12,4A1,1 0 0,1 13,5A1,1 0 0,1 12,6A1,1 0 0,1 11,5A1,1 0 0,1 12,4M5.05,6H18.95L21.9,14.12C22.03,14.82 21.63,15.5 20.73,15.84C17.35,17.06 16.39,18.25 16.14,19H7.86C7.61,18.25 6.65,17.06 3.27,15.84C2.37,15.5 1.97,14.82 2.1,14.12L5.05,6Z"/></svg>`,
  dry:       `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C15.31,2 18,4.66 18,7.95C18,12.41 12,19 12,19C12,19 6,12.41 6,7.95C6,4.66 8.69,2 12,2M12,4A3.94,3.94 0 0,0 8,7.95C8,11.14 11.63,16.07 12,16.58C12.37,16.07 16,11.14 16,7.95A3.94,3.94 0 0,0 12,4M14,17H10V22H14V17Z"/></svg>`,
  fan_only:  `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="animation:spin 3s linear infinite"><path d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z"/></svg>`,
  off:       `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.5"><path d="M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13"/></svg>`,
};

let displayMode;
let idleDisplay = false;
if (entity.state === 'off') {
  displayMode = 'off';
} else if (mode === 'idle' && this.config.idle_icon === 'mode') {
  const stateToIcon = { heat: 'heating', cool: 'cooling', heat_cool: 'heat_cool', auto: 'heat_cool', dry: 'dry', fan_only: 'fan_only' };
  displayMode = stateToIcon[entity.state] || 'off';
  idleDisplay = true;
} else {
  displayMode = mode;
}
let animStyle = '';
if (!idleDisplay) {
  if (displayMode === 'heat_cool') animStyle = 'animation:pulse 2s infinite ease-in-out;';
  if (displayMode === 'fan_only')  animStyle = 'animation:spin 3s linear infinite;';
  if (displayMode === 'off')       animStyle = 'opacity:0.5;';
} else {
  animStyle = 'opacity:0.45;';
}

const customIcon = this.config[`icon_${displayMode}`];
const iconHtml   = customIcon
  ? `<ha-icon class="state-icon" icon="${customIcon}" style="${animStyle}"></ha-icon>`
  : (defaultIcons[displayMode] || defaultIcons.off);

const iconContainer = this.shadowRoot.querySelector('.icon-container');
iconContainer.innerHTML = iconHtml;

const iconColor = this.config.icon_color || '#ffffff';
iconContainer.style.color = iconColor;

const iconEl = iconContainer.querySelector('.state-icon');
if (iconEl) {
  iconEl.style.cursor = 'pointer';
  if (iconEl.tagName === 'HA-ICON') iconEl.style.color = iconColor;
  iconEl.addEventListener('click', (e) => { e.stopPropagation(); this._togglePower(); });
}

// ── Text fields ─────────────────────────────────────────────────
const currentTempEl = this.shadowRoot.querySelector('.current-temp');
const nameEl        = this.shadowRoot.querySelector('.entity-name');
const targetLabelEl = this.shadowRoot.querySelector('.target-label');
const targetTempEl  = this.shadowRoot.querySelector('.target-temp');

currentTempEl.textContent = (entity.attributes.current_temperature || 0).toFixed(1) + '\u00b0';
currentTempEl.style.color = this.config.current_temp_color || '#ffffff';

nameEl.textContent = this.config.name || entity.attributes.friendly_name || entity.entity_id;
nameEl.style.color = this.config.name_color || '#ffffff';

const labels = {
  heating:  'Heating to ',
  cooling:  'Cooling to ',
  heat_cool:'Auto ',
  dry:      'Drying ',
  fan_only: 'Fan Only ',
  idle:     entity.state.charAt(0).toUpperCase() + entity.state.slice(1),
};
targetLabelEl.textContent = labels[mode] || entity.state;
targetLabelEl.style.color = this.config.target_label_color || '#ffffff';

const showTarget = ['heating', 'cooling', 'heat_cool'].includes(mode);
targetTempEl.textContent = showTarget
  ? (entity.attributes.temperature || 0).toFixed(1) + '\u00b0'
  : '';
targetTempEl.style.color = this.config.target_temp_color || '#ffffff';
```

}
}

/* =====================================================================
CAT Thermostat Card  –  Visual Editor
===================================================================== */

class CATThermostatCardEditor extends HTMLElement {

setConfig(config) {
this._config = config || {};
// If already rendered, just update the stored config without re-rendering.
// Re-rendering would destroy the focused input after every keystroke.
if (this._initialized) return;
if (this._hass) this._render();
}

set hass(hass) {
this._hass = hass;
this._render();
}

_render() {
if (!this._hass || !this._config || this._initialized) return;
this._initialized = true;

```
const c  = this._config;
const hs = this._hass.states;
const climateEntities = Object.keys(hs).filter(e => e.startsWith('climate.'));

// ── Template helpers ──────────────────────────────────────────────

// Gradient pair row: swatch | preview bar | swatch
const gradRow = (emoji, title, startKey, endKey, startDef, endDef) => `
  <div class="grad-group">
    <div class="grad-label">${emoji} ${title}</div>
    <div class="grad-row">
      <label class="swatch-wrap">
        <span class="swatch-hint">Start</span>
        <input data-key="${startKey}" type="color"
               value="${c[startKey] || startDef}" class="swatch grad-swatch">
      </label>
      <div class="grad-preview" id="gp-${startKey}"
           style="background:linear-gradient(90deg,${c[startKey]||startDef},${c[endKey]||endDef})"></div>
      <label class="swatch-wrap">
        <span class="swatch-hint">End</span>
        <input data-key="${endKey}" type="color"
               value="${c[endKey] || endDef}" class="swatch grad-swatch">
      </label>
    </div>
  </div>`;

// Single colour row: label | preview dot | hex code | swatch
const colorRow = (emoji, title, key, def) => {
  const val = c[key] || def;
  return `
    <label class="color-row">
      <span class="color-label">${emoji}&nbsp;${title}</span>
      <span class="color-right">
        <span class="color-dot" style="background:${val}"></span>
        <span class="color-hex" id="hex-${key}">${val.toUpperCase()}</span>
        <input data-key="${key}" type="color" value="${val}" class="swatch color-swatch">
      </span>
    </label>`;
};

// Icon select row
const iconRow = (emoji, title, key, placeholder, opts) => `
  <div class="icon-row">
    <div class="icon-row-label">${emoji}&nbsp;${title}</div>
    <select data-key="${key}" class="sel">
      <option value="">✨ ${placeholder}</option>
      ${opts.map(([v,l]) =>
        `<option value="${v}" ${c[key]===v?'selected':''}>${l}</option>`).join('')}
    </select>
  </div>`;

// ── Full HTML ─────────────────────────────────────────────────────

// Pre-compute Power On Mode options (avoids IIFE inside template literal)
const powerOnModeLabels = { heat: 'Heat', cool: 'Cool', heat_cool: 'Heat / Cool', auto: 'Auto', dry: 'Dry', fan_only: 'Fan Only' };
const entityModes = (c.entity && hs[c.entity] && hs[c.entity].attributes.hvac_modes)
  ? hs[c.entity].attributes.hvac_modes.filter(m => m !== 'off')
  : Object.keys(powerOnModeLabels);
const powerOnModeOptions = entityModes
  .map(m => `<option value="${m}"${c.power_on_mode === m ? ' selected' : ''}>${powerOnModeLabels[m] || m}</option>`)
  .join('');

this.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      font-size: 13px;
      color: var(--primary-text-color, #e5e7eb);
    }

    /* ─ Tab bar ─ */
    .tabs {
      display: flex;
      gap: 4px;
      background: var(--secondary-background-color, #1a1a1a);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 14px;
    }
    .tab {
      flex: 1;
      padding: 9px 6px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: var(--secondary-text-color, #9ca3af);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, color 0.18s;
      white-space: nowrap;
    }
    .tab.active {
      background: var(--primary-color, #6366f1);
      color: #fff;
    }
    .tab:hover:not(.active) {
      background: rgba(255,255,255,0.08);
      color: var(--primary-text-color, #fff);
    }

    /* ─ Panels ─ */
    .panel { display: none; }
    .panel.active { display: block; }

    /* ─ Section blocks ─ */
    .section {
      background: var(--secondary-background-color, #1e1e1e);
      border: 1px solid var(--divider-color, #2d2d2d);
      border-radius: 10px;
      padding: 14px 14px 10px;
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--secondary-text-color, #6b7280);
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--divider-color, #2a2a2a);
    }

    /* ─ Generic field ─ */
    .field { margin-bottom: 10px; }
    .field:last-child { margin-bottom: 0; }
    .field-label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 5px;
      display: block;
    }
    .field-hint {
      font-size: 11px;
      font-weight: 400;
      color: var(--secondary-text-color, #6b7280);
      margin-left: 4px;
    }

    /* ─ Inputs ─ */
    .inp, .sel {
      width: 100%;
      padding: 9px 10px;
      background: var(--input-fill-color, #111111);
      border: 1px solid var(--input-ink-color, #383838);
      border-radius: 7px;
      color: var(--primary-text-color, #fff);
      font-size: 13px;
      box-sizing: border-box;
      transition: border-color 0.18s;
    }
    .inp:focus, .sel:focus {
      outline: none;
      border-color: var(--primary-color, #6366f1);
    }

    /* ─ Toggle row ─ */
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0 2px;
    }
    .toggle-label {
      font-size: 12px;
      font-weight: 600;
    }
    .toggle-switch {
      position: relative;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    .toggle-track {
      position: absolute;
      inset: 0;
      border-radius: 22px;
      background: var(--divider-color, #3a3a3a);
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle-track::after {
      content: '';
      position: absolute;
      left: 3px;
      top: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.2s;
    }
    .toggle-switch input:checked + .toggle-track {
      background: var(--primary-color, #6366f1);
    }
    .toggle-switch input:checked + .toggle-track::after {
      transform: translateX(18px);
    }

    /* ─ Gradient rows ─ */
    .grad-group { margin-bottom: 12px; }
    .grad-group:last-child { margin-bottom: 0; }
    .grad-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--secondary-text-color, #9ca3af);
      margin-bottom: 6px;
    }
    .grad-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .swatch-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      cursor: pointer;
    }
    .swatch-hint {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: var(--secondary-text-color, #6b7280);
    }
    .swatch {
      border: 2px solid var(--divider-color, #3a3a3a);
      border-radius: 7px;
      cursor: pointer;
      padding: 0;
      background: none;
    }
    .swatch:hover { border-color: var(--primary-color, #6366f1); }
    .grad-swatch { width: 44px; height: 38px; }
    .grad-preview {
      flex: 1;
      height: 38px;
      border-radius: 7px;
      transition: background 0.25s;
    }

    /* ─ Single colour rows ─ */
    .color-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 0;
      border-bottom: 1px solid var(--divider-color, #262626);
      cursor: pointer;
      gap: 8px;
    }
    .color-row:last-child { border-bottom: none; padding-bottom: 0; }
    .color-label {
      font-size: 12px;
      font-weight: 600;
      flex: 1;
    }
    .color-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .color-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.2);
      display: inline-block;
      flex-shrink: 0;
    }
    .color-hex {
      font-size: 11px;
      font-weight: 700;
      font-family: monospace;
      color: var(--secondary-text-color, #9ca3af);
      min-width: 52px;
      text-align: right;
    }
    .color-swatch { width: 32px; height: 28px; border-radius: 6px; }

    /* ─ Icon rows ─ */
    .icon-row { margin-bottom: 10px; }
    .icon-row:last-child { margin-bottom: 0; }
    .icon-row-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--secondary-text-color, #9ca3af);
      margin-bottom: 5px;
    }

    /* ─ Info tip ─ */
    .tip {
      font-size: 11px;
      line-height: 1.55;
      color: var(--secondary-text-color, #9ca3af);
      background: rgba(99,102,241,0.07);
      border-left: 3px solid var(--primary-color, #6366f1);
      border-radius: 0 6px 6px 0;
      padding: 7px 10px;
      margin-bottom: 12px;
    }

    /* ─ Divider within a section ─ */
    .sub-divider {
      border: none;
      border-top: 1px dashed var(--divider-color, #2d2d2d);
      margin: 10px 0;
    }
    /* - Divider within a section - */
    .sub-divider {
      border: none;
      border-top: 1px dashed var(--divider-color, #2d2d2d);
      margin: 10px 0;
    }
  </style>

  <!-- ════ Tab bar ════ -->
  <div class="tabs">
    <button class="tab active" data-tab="general">⚙️ General</button>
    <button class="tab" data-tab="colors"> Colors</button>
    <button class="tab" data-tab="icons"> Icons</button>
  </div>

  <!-- ══════════ GENERAL PANEL ══════════ -->
  <div class="panel active" id="panel-general">
    <div class="section">
      <div class="section-title">Thermostat Setup</div>

      <div class="field">
        <label class="field-label">Climate Entity</label>
        <select id="entity-select" class="sel">
          <option value="">— Select a thermostat —</option>
          ${climateEntities.map(eid => `
            <option value="${eid}" ${c.entity === eid ? 'selected' : ''}>
              ${hs[eid].attributes.friendly_name || eid}
            </option>`).join('')}
        </select>
      </div>

      <div class="field">
        <label class="field-label">
          Display Name
          <span class="field-hint">(leave blank to use entity name)</span>
        </label>
        <input id="name-input" class="inp" type="text"
               value="${c.name || ''}" placeholder="e.g. Living Room">
      </div>
    </div>

    <div class="section">
      <div class="section-title">Controls</div>
      <div class="toggle-row">
        <span class="toggle-label">➕ Show +/− Buttons</span>
        <label class="toggle-switch">
          <input id="show-controls-toggle" type="checkbox"
                 ${c.show_controls === false ? '' : 'checked'}>
          <span class="toggle-track"></span>
        </label>
      </div>
      <hr class="sub-divider">
      <div class="field">
        <label class="field-label">
          Idle Icon
          <span class="field-hint">(when on but not running)</span>
        </label>
        <select id="idle-icon-select" class="sel">
          <option value="power" ${(c.idle_icon || 'power') === 'power' ? 'selected' : ''}>Power icon - same as off</option>
          <option value="mode"  ${c.idle_icon === 'mode' ? 'selected' : ''}>Mode icon dimmed - power only when truly off</option>
        </select>
      </div>
      <hr class="sub-divider">
      <div class="field">
        <label class="field-label">
          Power On Mode
          <span class="field-hint">(mode activated when turning on)</span>
        </label>
        <select id="power-on-mode-select" class="sel">
          <option value="">Auto - use best available</option>
          ${powerOnModeOptions}
        </select>
      </div>
    </div>
  </div>

  <!-- ══════════ COLORS PANEL ══════════ -->
  <div class="panel" id="panel-colors">

    <div class="section">
      <div class="section-title">Background Gradients</div>
      <div class="tip">Each mode shows a two-colour gradient. Click a swatch to change its colour — the preview bar updates live.</div>
      ${gradRow('','Heating',     'heat_start',      'heat_end',       '#fb923c','#f97316')}
      ${gradRow('❄️','Cooling',     'cool_start',      'cool_end',       '#60a5fa','#2563eb')}
      ${gradRow('','Heat / Cool', 'heat_cool_start', 'heat_cool_end',  '#a78bfa','#7c3aed')}
      ${gradRow('','Dry',         'dry_start',       'dry_end',        '#fbbf24','#f59e0b')}
      ${gradRow('','Fan Only',    'fan_only_start',  'fan_only_end',   '#34d399','#10b981')}
      ${gradRow('⏸️','Idle / Off',  'idle_start',      'idle_end',       '#374151','#111827')}
    </div>

    <div class="section">
      <div class="section-title">Text Colors</div>
      ${colorRow('️','Current Temperature', 'current_temp_color', '#ffffff')}
      ${colorRow('️','Card Name',           'name_color',         '#ffffff')}
      ${colorRow('','Status Label',         'target_label_color', '#ffffff')}
      ${colorRow('','Target Temperature',   'target_temp_color',  '#ffffff')}
    </div>

    <div class="section">
      <div class="section-title">Icon Color</div>
      ${colorRow('✨','Mode Icon',            'icon_color',         '#ffffff')}
    </div>

    <div class="section">
      <div class="section-title">Button Colors</div>
      <div class="tip">The +/− buttons are rendered at 25% opacity of the chosen background colour to keep a translucent, glassy look on any gradient.</div>
      ${colorRow('⬛','Button Background',    'btn_bg_color',        '#ffffff')}
      ${colorRow('✏️','Button Symbol (+/−)', 'btn_icon_color',      '#ffffff')}
    </div>
  </div>

  <!-- ══════════ ICONS PANEL ══════════ -->
  <div class="panel" id="panel-icons">
    <div class="section">
      <div class="section-title">Custom Mode Icons</div>
      <div class="tip">Leave on "Default" to use the built-in animated icons. Selecting an MDI icon will replace the animation for that mode.</div>
      ${iconRow('','Heating',    'icon_heating',   'Default — Animated Flame', [
        ['mdi:fire',                   'mdi:fire'],
        ['mdi:fireplace',              'mdi:fireplace'],
        ['mdi:radiator',               'mdi:radiator'],
        ['mdi:sun-thermometer',        'mdi:sun-thermometer'],
        ['mdi:white-balance-sunny',    'mdi:white-balance-sunny'],
        ['mdi:thermometer-chevron-up', 'mdi:thermometer-chevron-up'],
        ['mdi:home-thermometer',       'mdi:home-thermometer'],
      ])}
      ${iconRow('❄️','Cooling',    'icon_cooling',   'Default — Animated Snowflake', [
        ['mdi:snowflake',                'mdi:snowflake'],
        ['mdi:snowflake-variant',        'mdi:snowflake-variant'],
        ['mdi:air-conditioner',          'mdi:air-conditioner'],
        ['mdi:thermometer-chevron-down', 'mdi:thermometer-chevron-down'],
        ['mdi:weather-snowy',            'mdi:weather-snowy'],
        ['mdi:glacier',                  'mdi:glacier'],
      ])}
      ${iconRow('','Heat / Cool','icon_heat_cool', 'Default — Animated Hourglass', [
        ['mdi:autorenew',        'mdi:autorenew'],
        ['mdi:sync',             'mdi:sync'],
        ['mdi:thermometer-auto', 'mdi:thermometer-auto'],
        ['mdi:heat-wave',        'mdi:heat-wave'],
        ['mdi:swap-vertical',    'mdi:swap-vertical'],
        ['mdi:thermostat-auto',  'mdi:thermostat-auto'],
      ])}
      ${iconRow('','Dry',        'icon_dry',       'Default — Water Drop', [
        ['mdi:water-percent',     'mdi:water-percent'],
        ['mdi:water-off',         'mdi:water-off'],
        ['mdi:water-minus',       'mdi:water-minus'],
        ['mdi:air-humidifier-off','mdi:air-humidifier-off'],
        ['mdi:weather-sunny',     'mdi:weather-sunny'],
        ['mdi:weather-sunset',    'mdi:weather-sunset'],
      ])}
      ${iconRow('','Fan Only',   'icon_fan_only',  'Default — Spinning Fan', [
        ['mdi:fan',           'mdi:fan'],
        ['mdi:fan-speed-1',   'mdi:fan-speed-1'],
        ['mdi:fan-speed-2',   'mdi:fan-speed-2'],
        ['mdi:fan-speed-3',   'mdi:fan-speed-3'],
        ['mdi:wind-turbine',  'mdi:wind-turbine'],
        ['mdi:weather-windy', 'mdi:weather-windy'],
        ['mdi:air-filter',    'mdi:air-filter'],
      ])}
      ${iconRow('⏸️','Off / Power','icon_off',       'Default — Power Symbol', [
        ['mdi:power',         'mdi:power'],
        ['mdi:power-off',     'mdi:power-off'],
        ['mdi:power-standby', 'mdi:power-standby'],
        ['mdi:stop-circle',   'mdi:stop-circle'],
        ['mdi:sleep',         'mdi:sleep'],
        ['mdi:cancel',        'mdi:cancel'],
      ])}
    </div>
  </div>
`;

this._bindEvents();
```

}

// ── Event wiring ───────────────────────────────────────────────────

_bindEvents() {
// Tab switching
this.querySelectorAll(’.tab’).forEach(tab => {
tab.addEventListener(‘click’, () => {
this.querySelectorAll(’.tab’).forEach(t => t.classList.remove(‘active’));
this.querySelectorAll(’.panel’).forEach(p => p.classList.remove(‘active’));
tab.classList.add(‘active’);
this.querySelector(`#panel-${tab.dataset.tab}`).classList.add(‘active’);
});
});

```
// Static named inputs
this.querySelector('#entity-select')
  .addEventListener('change', ev => this._update('entity', ev.target.value));
this.querySelector('#name-input')
  .addEventListener('input',  ev => this._update('name',   ev.target.value));

// Show controls toggle
this.querySelector('#show-controls-toggle')
  .addEventListener('change', ev => this._update('show_controls', ev.target.checked));

// Idle icon behaviour
this.querySelector('#idle-icon-select')
  .addEventListener('change', ev => this._update('idle_icon', ev.target.value));

// Power on mode
this.querySelector('#power-on-mode-select')
  .addEventListener('change', ev => this._update('power_on_mode', ev.target.value));

// All data-key inputs (colours + icon selects)
this.querySelectorAll('[data-key]').forEach(el => {
  const key = el.dataset.key;
  const evt = el.type === 'color' ? 'input' : 'change';

  el.addEventListener(evt, ev => {
    const val = ev.target.value;
    this._update(key, val);

    // Update hex label + colour dot for single-colour rows
    const hexEl = this.querySelector(`#hex-${key}`);
    if (hexEl) hexEl.textContent = val.toUpperCase();
    const dotEl = hexEl && hexEl.closest('.color-right')
      ? hexEl.closest('.color-right').querySelector('.color-dot')
      : null;
    if (dotEl) dotEl.style.background = val;

    // Update gradient preview bar when either swatch changes
    const isStart = key.endsWith('_start');
    const isEnd   = key.endsWith('_end');
    if (isStart || isEnd) {
      const base    = key.replace(/_start$|_end$/, '');
      const startEl = this.querySelector(`[data-key="${base}_start"]`);
      const endEl   = this.querySelector(`[data-key="${base}_end"]`);
      const preview = this.querySelector(`#gp-${base}_start`);
      if (startEl && endEl && preview) {
        preview.style.background =
          `linear-gradient(90deg,${startEl.value},${endEl.value})`;
      }
    }
  });
});
```

}

// ── Config dispatch ────────────────────────────────────────────────

_update(key, value) {
this._config = { …this._config, [key]: value };
this.dispatchEvent(new CustomEvent(‘config-changed’, {
detail: { config: this._config },
bubbles: true,
composed: true,
}));
}
}

/* ── Registration ─────────────────────────────────────────────────────── */

customElements.define(‘cat-thermostat-card’,        CATThermostatCard);
customElements.define(‘cat-thermostat-card-editor’, CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
type:        ‘cat-thermostat-card’,
name:        ‘CAT Thermostat Card’,
description: ‘Dynamic thermostat card with all HVAC modes, custom colours, animated icons, and 0.5° increments.’,
preview:     true,
});