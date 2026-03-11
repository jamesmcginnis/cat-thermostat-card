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
      // Background gradients
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
      // Text colours
      current_temp_color:  '#ffffff',
      name_color:          '#ffffff',
      target_label_color:  '#ffffff',
      target_temp_color:   '#ffffff',
      // Icon colour
      icon_color: '#ffffff',
      // Button colours
      btn_bg_color:   '#ffffff',
      btn_icon_color: '#ffffff',
      // Show +/- controls
      show_controls: true,
      // Custom icons (empty = use built-in SVG)
      icon_heating:   '',
      icon_cooling:   '',
      icon_heat_cool: '',
      icon_dry:       '',
      icon_fan_only:  '',
      icon_idle:      '',
      icon_off:       '',
      // Per-mode glass/transparent background (overrides gradient for that mode)
      heat_transparent:      false,
      cool_transparent:      false,
      heat_cool_transparent: false,
      dry_transparent:       false,
      fan_only_transparent:  false,
      idle_transparent:      false,
      // Per-mode breathing / pulsing glow animation
      heat_breathe:          false,
      cool_breathe:          false,
      heat_cool_breathe:     false,
      dry_breathe:           false,
      fan_only_breathe:      false,
      idle_breathe:          false,
      // HVAC mode to restore when turning the thermostat on
      // 'auto' = pick automatically from the entity's available modes (original behaviour)
      turn_on_mode:   'auto',
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

        /* ── Card breathing / pulsing glow ── */
        @keyframes card-breathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: var(--ha-card-box-shadow, 0 2px 2px rgba(0,0,0,0.14));
          }
          50% {
            transform: scale(1.013);
            box-shadow:
              0 8px 32px rgba(0,0,0,0.32),
              0 0 0 2px var(--breathe-glow, rgba(255,255,255,0.18)),
              0 0 28px 4px var(--breathe-glow, rgba(255,255,255,0.12));
          }
        }
        .card.breathing {
          animation: card-breathe var(--breathe-speed, 3.5s) ease-in-out infinite;
          transform-origin: center center;
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
  }

  // ── Helpers ────────────────────────────────────────────────────────

  _changeTemp(delta) {
    const entity = this._hass.states[this.config.entity];
    const attrs  = entity.attributes;

    // Dual-setpoint mode (heat_cool / auto) — uses target_temp_low / target_temp_high
    if (attrs.target_temp_low != null && attrs.target_temp_high != null) {
      const low  = parseFloat((attrs.target_temp_low  + delta).toFixed(1));
      const high = parseFloat((attrs.target_temp_high + delta).toFixed(1));
      this._hass.callService('climate', 'set_temperature', {
        entity_id:        this.config.entity,
        target_temp_low:  low,
        target_temp_high: high,
      });
      return;
    }

    // Single-setpoint mode (heat / cool / dry / fan_only)
    const current = attrs.temperature;
    if (current == null) return; // entity off or does not support a setpoint
    const newTemp = parseFloat((current + delta).toFixed(1));
    this._hass.callService('climate', 'set_temperature', {
      entity_id:   this.config.entity,
      temperature: newTemp,
    });
  }

  _togglePower() {
    const entity = this._hass.states[this.config.entity];
    if (entity.state === 'off') {
      const modes      = entity.attributes.hvac_modes || [];
      const configured = this.config.turn_on_mode || 'auto';

      let target;
      if (configured !== 'auto' && modes.includes(configured)) {
        // Use the mode the user explicitly chose in the editor
        target = configured;
      } else {
        // Fall back: pick the best available mode automatically
        if      (modes.includes('heat_cool')) target = 'heat_cool';
        else if (modes.includes('auto'))      target = 'auto';
        else if (modes.includes('heat'))      target = 'heat';
        else if (modes.includes('cool'))      target = 'cool';
        else target = modes.find(m => m !== 'off') || modes[0];
      }

      this._hass.callService('climate', 'set_hvac_mode', {
        entity_id: this.config.entity,
        hvac_mode: target,
      });
    } else {
      this._hass.callService('climate', 'turn_off', { entity_id: this.config.entity });
    }
  }

  _getHvacMode(entity) {
    const action = entity.attributes.hvac_action;
    const state  = entity.state;

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
  }

  // ── Main render ───────────────────────────────────────────────────

  _updateContent(entity) {
    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;

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

    // Per-mode glass: map display mode → config transparent key
    const _glassKey = { heating:'heat_transparent', cooling:'cool_transparent',
                        heat_cool:'heat_cool_transparent', dry:'dry_transparent',
                        fan_only:'fan_only_transparent', idle:'idle_transparent' };
    const isGlass = !!this.config[_glassKey[mode] || ''];

    if (isGlass) {
      card.style.background = 'transparent';
      card.style.border     = '1px solid rgba(255,255,255,0.15)';
    } else {
      card.style.background = `linear-gradient(135deg, ${start}, ${end})`;
      card.style.border     = '';
    }
    card.classList.toggle('is-active', isActive);

    // Per-mode breathing glow — maps mode → config breathe key + glow colour
    const _breatheKey  = { heating:'heat_breathe', cooling:'cool_breathe',
                           heat_cool:'heat_cool_breathe', dry:'dry_breathe',
                           fan_only:'fan_only_breathe', idle:'idle_breathe' };
    const _glowColours = { heating:'rgba(251,146,60,0.45)', cooling:'rgba(96,165,250,0.45)',
                           heat_cool:'rgba(167,139,250,0.45)', dry:'rgba(251,191,36,0.45)',
                           fan_only:'rgba(52,211,153,0.45)', idle:'rgba(156,163,175,0.3)' };
    const isBreathe = !!this.config[_breatheKey[mode] || ''];
    card.classList.toggle('breathing', isBreathe);
    if (isBreathe) {
      card.style.setProperty('--breathe-glow', isGlass
        ? 'rgba(255,255,255,0.18)'
        : (_glowColours[mode] || 'rgba(255,255,255,0.18)'));
    }

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
      // Idle: home-thermometer style — looks natural for "standing by"
      idle:      `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.7"><path d="M22,9V7H20V5C20,3.89 19.1,3 18,3H4C2.89,3 2,3.89 2,5V15A2,2 0 0,0 4,17H18C19.1,17 20,16.11 20,15V13H22V11H20V9H22M18,15H4V5H18V15M6,13H8.5V11.5H9.5V13H12V7H10V10H9V7H6V13M14,13H16V11H14V9H16V7H13V13H14V13Z"/></svg>`,
      off:       `<svg class="state-icon" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.5"><path d="M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13"/></svg>`,
    };

    // idle = thermostat on but not actively heating/cooling; off = entity state is 'off'
    const displayMode = entity.state === 'off' ? 'off' : mode;
    let animStyle = '';
    if (displayMode === 'heat_cool') animStyle = 'animation:pulse 2s infinite ease-in-out;';
    if (displayMode === 'fan_only')  animStyle = 'animation:spin 3s linear infinite;';
    if (displayMode === 'off')       animStyle = 'opacity:0.5;';
    if (displayMode === 'idle')      animStyle = 'opacity:0.7;';

    const customIcon = this.config[`icon_${displayMode}`];
    const iconHtml   = customIcon
      ? `<ha-icon class="state-icon" icon="${customIcon}" style="${animStyle}"></ha-icon>`
      : (defaultIcons[displayMode] || defaultIcons.idle);

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
    if (showTarget) {
      const attrs = entity.attributes;
      if (attrs.target_temp_low != null && attrs.target_temp_high != null) {
        // Dual-setpoint: show "low° – high°"
        targetTempEl.textContent =
          attrs.target_temp_low.toFixed(1) + '\u00b0' +
          ' \u2013 ' +
          attrs.target_temp_high.toFixed(1) + '\u00b0';
      } else {
        targetTempEl.textContent = attrs.temperature != null
          ? attrs.temperature.toFixed(1) + '\u00b0'
          : '';
      }
    } else {
      targetTempEl.textContent = '';
    }
    targetTempEl.style.color = this.config.target_temp_color || '#ffffff';
  }
}

/* =====================================================================
   CAT Thermostat Card  –  Visual Editor
   ===================================================================== */

class CATThermostatCardEditor extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config      = {};
    this._hass        = null;
    this._initialized = false;
  }

  setConfig(config) {
    this._config = { ...config };
    if (!this._initialized && this._hass) this._render();
    else if (this._initialized) this._syncUI();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) this._render();
  }

  // ─────────────────────────────────────────────────────────────────
  //  Render (once)
  // ─────────────────────────────────────────────────────────────────
  _render() {
    if (!this._hass || !this._config || this._initialized) return;
    this._initialized = true;

    const c  = this._config;
    const hs = this._hass.states;
    const climateEntities = Object.keys(hs).filter(e => e.startsWith('climate.'));

    // ── Mode groups for the Colours tab ─────────────────────────────
    const MODES = [
      { id:'heat',      emoji:'🔥', label:'Heating',     startKey:'heat_start',      endKey:'heat_end',       startDef:'#fb923c', endDef:'#f97316',  transKey:'heat_transparent',      breatheKey:'heat_breathe'      },
      { id:'cool',      emoji:'❄️', label:'Cooling',     startKey:'cool_start',      endKey:'cool_end',       startDef:'#60a5fa', endDef:'#2563eb',  transKey:'cool_transparent',      breatheKey:'cool_breathe'      },
      { id:'heat_cool', emoji:'🔄', label:'Heat / Cool', startKey:'heat_cool_start', endKey:'heat_cool_end',  startDef:'#a78bfa', endDef:'#7c3aed',  transKey:'heat_cool_transparent', breatheKey:'heat_cool_breathe' },
      { id:'dry',       emoji:'💧', label:'Dry',         startKey:'dry_start',       endKey:'dry_end',        startDef:'#fbbf24', endDef:'#f59e0b',  transKey:'dry_transparent',       breatheKey:'dry_breathe'       },
      { id:'fan_only',  emoji:'🌀', label:'Fan Only',    startKey:'fan_only_start',  endKey:'fan_only_end',   startDef:'#34d399', endDef:'#10b981',  transKey:'fan_only_transparent',  breatheKey:'fan_only_breathe'  },
      { id:'idle',      emoji:'⏸️', label:'Idle / Off', startKey:'idle_start',      endKey:'idle_end',       startDef:'#374151', endDef:'#111827',  transKey:'idle_transparent',      breatheKey:'idle_breathe'      },
    ];

    const TEXT_FIELDS = [
      { key:'current_temp_color',  label:'Current Temp',   desc:'Large temperature reading',       def:'#ffffff' },
      { key:'name_color',          label:'Card Name',       desc:'Name shown below temperature',    def:'#ffffff' },
      { key:'target_label_color',  label:'Status Label',    desc:'"Heating to", "Cooling to" …',    def:'#ffffff' },
      { key:'target_temp_color',   label:'Target Temp',     desc:'Setpoint value',                  def:'#ffffff' },
    ];

    const ICON_FIELDS = [
      { key:'icon_color',      label:'Mode Icon',         desc:'Animated HVAC state icon',          def:'#ffffff' },
      { key:'btn_bg_color',    label:'Button Background', desc:'Rendered at 25% opacity',           def:'#ffffff' },
      { key:'btn_icon_color',  label:'Button Symbol',     desc:'+/− icon colour',                   def:'#ffffff' },
    ];

    // ── Icon select helper ───────────────────────────────────────────
    const iconSelect = (emoji, title, key, placeholder, opts) => `
      <div class="ios-row" style="flex-direction:column;align-items:flex-start;gap:8px;padding:14px 16px;">
        <div class="ios-row-label" style="font-size:15px;font-weight:500;color:var(--primary-text-color)">${emoji} ${title}</div>
        <select data-key="${key}" class="ios-select">
          <option value="">✨ ${placeholder}</option>
          ${opts.map(([v,l]) => `<option value="${v}" ${c[key]===v?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>`;

    // ─────────────────────────────────────────────────────────────────
    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
          font-size: 15px;
          color: var(--primary-text-color);
          background: var(--secondary-background-color, #f2f2f7);
        }

        /* ── Tab bar ── */
        .tab-bar {
          display: flex;
          background: var(--card-background-color, #fff);
          border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.1));
          padding: 0 16px;
          gap: 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .tab-pill {
          flex: 1;
          padding: 14px 8px 12px;
          border: none;
          background: transparent;
          color: var(--secondary-text-color, #8e8e93);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: -0.1px;
          border-bottom: 2.5px solid transparent;
          transition: color 0.18s, border-color 0.18s;
          white-space: nowrap;
          font-family: inherit;
        }
        .tab-pill.active {
          color: #007AFF;
          border-bottom-color: #007AFF;
        }

        /* ── Panels ── */
        .panel { display: none; padding: 22px 16px 32px; }
        .panel.active { display: block; }

        /* ── Section label (above card group) ── */
        .group-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--secondary-text-color, #8e8e93);
          margin: 0 4px 6px;
        }

        /* ── iOS card group ── */
        .ios-group {
          background: var(--card-background-color, #fff);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          margin-bottom: 22px;
        }

        /* ── Row inside a group ── */
        .ios-row {
          display: flex;
          align-items: center;
          padding: 13px 16px;
          border-bottom: 0.5px solid var(--divider-color, rgba(0,0,0,0.1));
          min-height: 50px;
          gap: 12px;
        }
        .ios-row:last-child { border-bottom: none; }
        .ios-row-label {
          flex: 1;
          font-size: 15px;
          font-weight: 400;
          color: var(--primary-text-color);
          line-height: 1.35;
        }
        .ios-row-hint {
          font-size: 12px;
          color: var(--secondary-text-color, #8e8e93);
          margin-top: 2px;
          font-weight: 400;
        }

        /* ── iOS text input ── */
        .ios-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 15px;
          font-family: inherit;
          color: var(--primary-text-color);
          padding: 0;
          text-align: right;
          color: var(--secondary-text-color, #8e8e93);
        }
        .ios-input::placeholder { color: var(--secondary-text-color, #c7c7cc); }

        /* ── iOS select ── */
        .ios-select {
          width: 100%;
          background: var(--secondary-background-color, rgba(118,118,128,0.12));
          border: none;
          outline: none;
          font-size: 14px;
          font-family: inherit;
          color: var(--primary-text-color);
          padding: 10px 12px;
          border-radius: 9px;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        /* ── iOS toggle switch ── */
        .ios-toggle { position: relative; width: 51px; height: 31px; flex-shrink: 0; }
        .ios-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
        .ios-toggle-track {
          position: absolute; inset: 0;
          border-radius: 31px;
          background: rgba(120,120,128,0.32);
          cursor: pointer;
          transition: background 0.26s ease;
        }
        .ios-toggle-track::after {
          content: '';
          position: absolute;
          width: 27px; height: 27px;
          top: 2px; left: 2px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.28);
          transition: transform 0.26s ease;
        }
        .ios-toggle input:checked + .ios-toggle-track { background: #34C759; }
        .ios-toggle input:checked + .ios-toggle-track::after { transform: translateX(20px); }

        /* ── Segmented control ── */
        .ios-segmented {
          display: flex;
          background: rgba(118,118,128,0.2);
          border-radius: 9px;
          padding: 2px;
          gap: 2px;
          width: 100%;
        }
        .ios-segmented input[type="radio"] { display: none; }
        .ios-segmented label {
          flex: 1; text-align: center; padding: 8px 4px;
          font-size: 13px; font-weight: 500;
          border-radius: 7px; cursor: pointer;
          color: var(--primary-text-color);
          transition: all 0.2s ease; white-space: nowrap;
          font-family: inherit;
        }
        .ios-segmented input:checked + label {
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        }

        /* ── Colour grid ── */
        .colour-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px;
        }

        /* ── Colour card (crow / leopard style) ── */
        .colour-card {
          border: 1px solid var(--divider-color, rgba(0,0,0,0.1));
          border-radius: 11px;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s;
          background: var(--card-background-color, #fff);
        }
        .colour-card:hover {
          box-shadow: 0 3px 12px rgba(0,0,0,0.12);
          border-color: #007AFF;
        }
        .colour-card.glass-active { opacity: 0.38; pointer-events: none; }

        .colour-swatch { height: 44px; width: 100%; display: block; position: relative; }
        .colour-swatch input[type="color"] {
          position: absolute; inset: 0; width: 100%; height: 100%;
          opacity: 0; cursor: pointer; border: none; padding: 0;
        }
        .colour-swatch-preview { position: absolute; inset: 0; pointer-events: none; }
        .colour-swatch::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
          opacity: 0.28;
        }
        .colour-info { padding: 7px 9px 8px; }
        .colour-label {
          font-size: 11px; font-weight: 600;
          color: var(--primary-text-color); letter-spacing: 0.01em; margin-bottom: 2px;
        }
        .colour-desc { font-size: 10px; color: var(--secondary-text-color, #8e8e93); margin-bottom: 4px; line-height: 1.3; }
        .colour-hex-row { display: flex; align-items: center; gap: 4px; }
        .colour-dot {
          width: 11px; height: 11px; border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.12); flex-shrink: 0;
        }
        .colour-hex {
          flex: 1; font-size: 11px; font-family: 'SF Mono', 'Menlo', monospace;
          border: none; background: none; color: var(--secondary-text-color, #8e8e93);
          padding: 0; width: 0; min-width: 0;
        }
        .colour-hex:focus { outline: none; color: var(--primary-text-color); }
        .colour-edit-icon {
          opacity: 0; transition: opacity 0.15s;
          color: var(--secondary-text-color, #8e8e93); font-size: 13px; line-height: 1;
        }
        .colour-card:hover .colour-edit-icon { opacity: 1; }

        /* ── Glass pill badge ── */
        .glass-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600;
          color: #007AFF;
          background: rgba(0,122,255,0.1);
          border-radius: 20px; padding: 3px 9px;
          letter-spacing: 0.01em;
          flex-shrink: 0;
          opacity: 0; transition: opacity 0.18s;
          pointer-events: none;
        }
        .glass-badge.visible { opacity: 1; }
      </style>

      <!-- ══ Tab bar ══ -->
      <div class="tab-bar">
        <button class="tab-pill active" data-tab="general">⚙️ General</button>
        <button class="tab-pill" data-tab="colors">🎨 Colours</button>
        <button class="tab-pill" data-tab="icons">🔧 Icons</button>
      </div>

      <!-- ════════════ GENERAL PANEL ════════════ -->
      <div class="panel active" id="panel-general">

        <div class="group-label">Thermostat</div>
        <div class="ios-group">
          <div class="ios-row">
            <div class="ios-row-label">Entity</div>
            <select id="entity-select" class="ios-select" style="max-width:60%;text-align:right;">
              <option value="">Select…</option>
              ${climateEntities.map(eid => `
                <option value="${eid}" ${c.entity === eid ? 'selected' : ''}>
                  ${hs[eid].attributes.friendly_name || eid}
                </option>`).join('')}
            </select>
          </div>
          <div class="ios-row">
            <div class="ios-row-label">Display Name<div class="ios-row-hint">Leave blank to use entity name</div></div>
            <input id="name-input" class="ios-input" type="text"
                   value="${c.name || ''}" placeholder="e.g. Living Room">
          </div>
        </div>

        <div class="group-label">Controls</div>
        <div class="ios-group">
          <div class="ios-row">
            <div class="ios-row-label">Show +/− Buttons</div>
            <label class="ios-toggle">
              <input id="show-controls-toggle" type="checkbox"
                     ${c.show_controls === false ? '' : 'checked'}>
              <span class="ios-toggle-track"></span>
            </label>
          </div>
        </div>

        <div class="group-label">Power On Mode</div>
        <div class="ios-group">
          <div class="ios-row" style="flex-direction:column;align-items:flex-start;gap:10px;padding:14px 16px;">
            <div class="ios-row-hint" style="font-size:13px;">Which HVAC mode activates when tapping the icon to power on. Falls back automatically if unavailable.</div>
            <select id="turn-on-mode-select" class="ios-select">
              <option value="auto"      ${(c.turn_on_mode||'auto')==='auto'     ?'selected':''}>🔀 Auto — pick best available</option>
              <option value="heat_cool" ${(c.turn_on_mode||'')==='heat_cool'    ?'selected':''}>🔄 Heat / Cool</option>
              <option value="heat"      ${(c.turn_on_mode||'')==='heat'         ?'selected':''}>🔥 Heat</option>
              <option value="cool"      ${(c.turn_on_mode||'')==='cool'         ?'selected':''}>❄️ Cool</option>
              <option value="dry"       ${(c.turn_on_mode||'')==='dry'          ?'selected':''}>💧 Dry</option>
              <option value="fan_only"  ${(c.turn_on_mode||'')==='fan_only'     ?'selected':''}>🌀 Fan Only</option>
            </select>
          </div>
        </div>

      </div>

      <!-- ════════════ COLOURS PANEL ════════════ -->
      <div class="panel" id="panel-colors">
        <div id="mode-groups"></div>

        <div class="group-label">Text</div>
        <div class="ios-group">
          <div class="colour-grid" id="text-grid"></div>
        </div>

        <div class="group-label">Icon &amp; Buttons</div>
        <div class="ios-group">
          <div class="colour-grid" id="icon-grid"></div>
        </div>
      </div>

      <!-- ════════════ ICONS PANEL ════════════ -->
      <div class="panel" id="panel-icons">

        <div class="group-label">Custom Mode Icons</div>
        <div class="ios-group">
          <div class="ios-row" style="padding:12px 16px 10px;">
            <div class="ios-row-hint" style="font-size:13px;line-height:1.5;">Leave on "Default" to use built-in animated icons. Selecting an MDI icon replaces the animation for that mode.</div>
          </div>
          ${iconSelect('🔥','Heating',    'icon_heating',   'Default — Animated Flame', [
            ['mdi:fire','mdi:fire'],['mdi:fireplace','mdi:fireplace'],
            ['mdi:radiator','mdi:radiator'],['mdi:sun-thermometer','mdi:sun-thermometer'],
            ['mdi:thermometer-chevron-up','mdi:thermometer-chevron-up'],
            ['mdi:home-thermometer','mdi:home-thermometer'],
          ])}
          ${iconSelect('❄️','Cooling',    'icon_cooling',   'Default — Animated Snowflake', [
            ['mdi:snowflake','mdi:snowflake'],['mdi:snowflake-variant','mdi:snowflake-variant'],
            ['mdi:air-conditioner','mdi:air-conditioner'],
            ['mdi:thermometer-chevron-down','mdi:thermometer-chevron-down'],
            ['mdi:weather-snowy','mdi:weather-snowy'],
          ])}
          ${iconSelect('🔄','Heat / Cool','icon_heat_cool', 'Default — Animated Pulse', [
            ['mdi:autorenew','mdi:autorenew'],['mdi:sync','mdi:sync'],
            ['mdi:thermometer-auto','mdi:thermometer-auto'],
            ['mdi:thermostat-auto','mdi:thermostat-auto'],
            ['mdi:swap-vertical','mdi:swap-vertical'],
          ])}
          ${iconSelect('💧','Dry',        'icon_dry',       'Default — Water Drop', [
            ['mdi:water-percent','mdi:water-percent'],['mdi:water-off','mdi:water-off'],
            ['mdi:air-humidifier-off','mdi:air-humidifier-off'],
            ['mdi:weather-sunny','mdi:weather-sunny'],
          ])}
          ${iconSelect('🌀','Fan Only',   'icon_fan_only',  'Default — Spinning Fan', [
            ['mdi:fan','mdi:fan'],['mdi:fan-speed-1','mdi:fan-speed-1'],
            ['mdi:fan-speed-2','mdi:fan-speed-2'],['mdi:fan-speed-3','mdi:fan-speed-3'],
            ['mdi:weather-windy','mdi:weather-windy'],['mdi:air-filter','mdi:air-filter'],
          ])}
          ${iconSelect('⏸️','Idle',       'icon_idle',      'Default — Thermostat Display', [
            ['mdi:thermometer','mdi:thermometer'],
            ['mdi:home-thermometer','mdi:home-thermometer'],
            ['mdi:home-thermometer-outline','mdi:home-thermometer-outline'],
            ['mdi:thermostat','mdi:thermostat'],['mdi:sleep','mdi:sleep'],
          ])}
          ${iconSelect('⏹️','Off',        'icon_off',       'Default — Power Symbol', [
            ['mdi:power','mdi:power'],['mdi:power-off','mdi:power-off'],
            ['mdi:power-standby','mdi:power-standby'],
            ['mdi:stop-circle','mdi:stop-circle'],['mdi:cancel','mdi:cancel'],
          ])}
        </div>

      </div>
    `;

    // ── Build per-mode gradient groups ──────────────────────────────
    const modeContainer = this.shadowRoot.getElementById('mode-groups');
    for (const mode of MODES) {
      const isGlass   = !!this._config[mode.transKey];
      const isBreathe = !!this._config[mode.breatheKey];

      const groupWrap = document.createElement('div');
      groupWrap.dataset.modeGroup = mode.id;

      // Section label + badges
      const labelRow = document.createElement('div');
      labelRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin:0 4px 6px;gap:6px;';
      labelRow.innerHTML = `
        <span class="group-label" style="margin:0;">${mode.emoji} ${mode.label}</span>
        <span style="display:flex;gap:5px;flex-shrink:0;">
          <span class="glass-badge ${isGlass ? 'visible' : ''}" id="badge-${mode.id}">🪟 Glass</span>
          <span class="glass-badge ${isBreathe ? 'visible' : ''}" id="breathe-badge-${mode.id}" style="background:rgba(255,149,0,0.12);color:#FF9500;">💓 Breathe</span>
        </span>`;
      groupWrap.appendChild(labelRow);

      // Card group
      const group = document.createElement('div');
      group.className = 'ios-group';
      group.style.marginBottom = '22px';

      // Glass toggle row
      const glassRow = document.createElement('div');
      glassRow.className = 'ios-row';
      glassRow.innerHTML = `
        <div class="ios-row-label">
          Transparent / Glass
          <div class="ios-row-hint">Removes the gradient — shows a glass outline instead</div>
        </div>
        <label class="ios-toggle">
          <input type="checkbox" data-trans-key="${mode.transKey}"
                 ${isGlass ? 'checked' : ''}>
          <span class="ios-toggle-track"></span>
        </label>`;
      group.appendChild(glassRow);

      // Breathe toggle row
      const breatheRow = document.createElement('div');
      breatheRow.className = 'ios-row';
      breatheRow.innerHTML = `
        <div class="ios-row-label">
          Breathing Glow
          <div class="ios-row-hint">Card softly pulses with a coloured glow in this mode</div>
        </div>
        <label class="ios-toggle">
          <input type="checkbox" data-breathe-key="${mode.breatheKey}"
                 ${isBreathe ? 'checked' : ''}>
          <span class="ios-toggle-track" style="background:${isBreathe ? '#FF9500' : ''}"></span>
        </label>`;
      group.appendChild(breatheRow);

      // Colour cards row
      const gridRow = document.createElement('div');
      gridRow.className = 'colour-grid';
      gridRow.id = `grid-${mode.id}`;
      if (isGlass) gridRow.style.opacity = '0.38';
      gridRow.style.transition = 'opacity 0.22s';

      gridRow.appendChild(this._makeColourCard(mode.startKey, 'Start', 'Gradient start colour', mode.startDef));
      gridRow.appendChild(this._makeColourCard(mode.endKey,   'End',   'Gradient end colour',   mode.endDef));
      group.appendChild(gridRow);
      groupWrap.appendChild(group);
      modeContainer.appendChild(groupWrap);

      // Wire glass toggle
      const glassInput  = glassRow.querySelector('input[type=checkbox]');
      const glassBadge  = labelRow.querySelector(`#badge-${mode.id}`);
      glassInput.addEventListener('change', () => {
        const on = glassInput.checked;
        gridRow.style.opacity       = on ? '0.38' : '1';
        gridRow.style.pointerEvents = on ? 'none' : '';
        glassBadge.classList.toggle('visible', on);
        this._update(mode.transKey, on);
      });

      // Wire breathe toggle — orange track when on
      const breatheInput = breatheRow.querySelector('input[type=checkbox]');
      const breatheTrack = breatheRow.querySelector('.ios-toggle-track');
      const breatheBadge = labelRow.querySelector(`#breathe-badge-${mode.id}`);
      breatheInput.addEventListener('change', () => {
        const on = breatheInput.checked;
        breatheTrack.style.background = on ? '#FF9500' : '';
        breatheBadge.classList.toggle('visible', on);
        this._update(mode.breatheKey, on);
      });
    }

    // ── Build text colour grid ────────────────────────────────────
    const textGrid = this.shadowRoot.getElementById('text-grid');
    for (const f of TEXT_FIELDS) textGrid.appendChild(this._makeColourCard(f.key, f.label, f.desc, f.def));

    // ── Build icon/button colour grid ─────────────────────────────
    const iconGrid = this.shadowRoot.getElementById('icon-grid');
    for (const f of ICON_FIELDS) iconGrid.appendChild(this._makeColourCard(f.key, f.label, f.desc, f.def));

    this._bindStaticEvents();
    this._syncUI();
  }

  // ─────────────────────────────────────────────────────────────────
  //  Build a single colour card
  // ─────────────────────────────────────────────────────────────────
  _makeColourCard(key, label, desc, defaultVal) {
    const saved     = this._config[key] || '';
    const swatch    = saved || defaultVal;

    const card = document.createElement('div');
    card.className   = 'colour-card';
    card.dataset.key = key;
    card.innerHTML = `
      <label class="colour-swatch">
        <div class="colour-swatch-preview" style="background:${swatch}"></div>
        <input type="color" value="${swatch}">
      </label>
      <div class="colour-info">
        <div class="colour-label">${label}</div>
        <div class="colour-desc">${desc}</div>
        <div class="colour-hex-row">
          <div class="colour-dot" style="background:${swatch}"></div>
          <input class="colour-hex" type="text" value="${saved}"
                 maxlength="7" placeholder="${defaultVal}" spellcheck="false">
          <span class="colour-edit-icon">✎</span>
        </div>
      </div>`;

    const picker   = card.querySelector('input[type=color]');
    const hexInput = card.querySelector('.colour-hex');
    const preview  = card.querySelector('.colour-swatch-preview');
    const dot      = card.querySelector('.colour-dot');

    const apply = (val) => {
      preview.style.background = val;
      dot.style.background     = val;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) picker.value = val;
      hexInput.value           = val;
      this._update(key, val);
    };

    picker.addEventListener('input',  () => apply(picker.value));
    picker.addEventListener('change', () => apply(picker.value));
    hexInput.addEventListener('input', () => {
      const v = hexInput.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) apply(v);
    });
    hexInput.addEventListener('blur', () => {
      const cur = this._config[key] || defaultVal;
      if (!/^#[0-9a-fA-F]{6}$/.test(hexInput.value.trim())) hexInput.value = cur;
    });
    hexInput.addEventListener('keydown', e => { if (e.key === 'Enter') hexInput.blur(); });

    return card;
  }

  // ─────────────────────────────────────────────────────────────────
  //  Sync UI from config (no events fired)
  // ─────────────────────────────────────────────────────────────────
  _syncUI() {
    if (!this._initialized) return;
    const root = this.shadowRoot;

    // Colour cards
    root.querySelectorAll('.colour-card').forEach(card => {
      const key   = card.dataset.key;
      const saved = this._config[key] || '';
      const def   = card.querySelector('.colour-hex').placeholder;
      const sw    = saved || def;
      card.querySelector('.colour-swatch-preview').style.background = sw;
      card.querySelector('.colour-dot').style.background            = sw;
      const p = card.querySelector('input[type=color]');
      if (/^#[0-9a-fA-F]{6}$/.test(sw)) p.value = sw;
      card.querySelector('.colour-hex').value = saved;
    });

    // Glass toggles + grid opacity
    root.querySelectorAll('[data-trans-key]').forEach(input => {
      const on = !!this._config[input.dataset.transKey];
      input.checked = on;
      const modeId = input.dataset.transKey.replace('_transparent','');
      const grid   = root.getElementById(`grid-${modeId}`);
      if (grid) { grid.style.opacity = on ? '0.38' : '1'; grid.style.pointerEvents = on ? 'none' : ''; }
      const badge  = root.getElementById(`badge-${modeId}`);
      if (badge) badge.classList.toggle('visible', on);
    });

    // Breathe toggles
    root.querySelectorAll('[data-breathe-key]').forEach(input => {
      const on    = !!this._config[input.dataset.breatheKey];
      input.checked = on;
      const track = input.nextElementSibling;
      if (track) track.style.background = on ? '#FF9500' : '';
      const modeId = input.dataset.breatheKey.replace('_breathe','');
      const badge  = root.getElementById(`breathe-badge-${modeId}`);
      if (badge) badge.classList.toggle('visible', on);
    });

    // Static inputs
    const es = root.getElementById('entity-select');
    if (es) es.value = this._config.entity || '';
    const ni = root.getElementById('name-input');
    if (ni) ni.value = this._config.name || '';
    const sc = root.getElementById('show-controls-toggle');
    if (sc) sc.checked = this._config.show_controls !== false;
    const to = root.getElementById('turn-on-mode-select');
    if (to) to.value = this._config.turn_on_mode || 'auto';

    // Icon selects
    root.querySelectorAll('[data-key]').forEach(el => {
      if (el.tagName === 'SELECT') el.value = this._config[el.dataset.key] || '';
    });
  }

  // ─────────────────────────────────────────────────────────────────
  //  Static event wiring
  // ─────────────────────────────────────────────────────────────────
  _bindStaticEvents() {
    const root = this.shadowRoot;

    // Tab switching
    root.querySelectorAll('.tab-pill').forEach(tab => {
      tab.addEventListener('click', () => {
        root.querySelectorAll('.tab-pill').forEach(t => t.classList.remove('active'));
        root.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        root.querySelector(`#panel-${tab.dataset.tab}`).classList.add('active');
      });
    });

    root.getElementById('entity-select')
      .addEventListener('change', ev => this._update('entity', ev.target.value));
    root.getElementById('name-input')
      .addEventListener('input',  ev => this._update('name',   ev.target.value));
    root.getElementById('show-controls-toggle')
      .addEventListener('change', ev => this._update('show_controls', ev.target.checked));
    root.getElementById('turn-on-mode-select')
      .addEventListener('change', ev => this._update('turn_on_mode', ev.target.value));

    // Icon selects
    root.querySelectorAll('[data-key]').forEach(el => {
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', ev => this._update(el.dataset.key, ev.target.value));
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  //  Config dispatch
  // ─────────────────────────────────────────────────────────────────
  _update(key, value) {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }
}

/* ── Registration ─────────────────────────────────────────────────────── */

customElements.define('cat-thermostat-card',        CATThermostatCard);
customElements.define('cat-thermostat-card-editor', CATThermostatCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'cat-thermostat-card',
  name:        'CAT Thermostat Card',
  description: 'Dynamic thermostat card with all HVAC modes, custom colours, animated icons, and 0.5° increments.',
  preview:     true,
});
