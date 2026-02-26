# CAT Thermostat Card

A dynamic custom thermostat card for [Home Assistant](https://www.home-assistant.io/) with animated icons, per-mode gradient backgrounds, full colour customisation, and +/− temperature controls — all configurable through the Visual Editor.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge&logo=homeassistantcommunitystore&logoColor=white)](https://github.com/jamesmcginnis/cat-thermostat-card)

## Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=jamesmcginnis&repository=cat-thermostat-card&category=plugin)

1. Click the button above, or open HACS → Frontend → ⋮ → Custom repositories and add `https://github.com/jamesmcginnis/cat-thermostat-card` as a **Dashboard** plugin.
1. Search for **CAT Thermostat Card** and install it.
1. Reload your browser.

### Manual

1. Download `cat-thermostat-card.js` from the [latest release](https://github.com/jamesmcginnis/cat-thermostat-card/releases).
1. Copy it to `config/www/cat-thermostat-card.js`.
1. In Home Assistant go to **Settings → Dashboards → Resources** and add `/local/cat-thermostat-card.js` as a **JavaScript module**.
1. Reload your browser.

-----

## Preview

![CAT Thermostat Card – heating mode](preview1.png)
![CAT Thermostat Card – cooling mode](preview2.png)

-----

## Configuration

Add the card to any dashboard and configure it through the Visual Editor, or use YAML:

```yaml
type: custom:cat-thermostat-card
entity: climate.living_room
name: Living Room
```

### Options

|Option                             |Type   |Default              |Description                               |
|-----------------------------------|-------|---------------------|------------------------------------------|
|`entity`                           |string |**required**         |`climate.*` entity                        |
|`name`                             |string |entity name          |Display name shown on the card            |
|`show_controls`                    |boolean|`true`               |Show/hide the +/− temperature buttons     |
|`power_on_mode`                    |string |auto                 |HVAC mode to activate when powering on    |
|`heat_start` / `heat_end`          |color  |`#fb923c` / `#f97316`|Heating gradient                          |
|`cool_start` / `cool_end`          |color  |`#60a5fa` / `#2563eb`|Cooling gradient                          |
|`heat_cool_start` / `heat_cool_end`|color  |`#a78bfa` / `#7c3aed`|Heat/Cool gradient                        |
|`dry_start` / `dry_end`            |color  |`#fbbf24` / `#f59e0b`|Dry gradient                              |
|`fan_only_start` / `fan_only_end`  |color  |`#34d399` / `#10b981`|Fan Only gradient                         |
|`idle_start` / `idle_end`          |color  |`#374151` / `#111827`|Idle/Off gradient                         |
|`current_temp_color`               |color  |`#ffffff`            |Current temperature text colour           |
|`name_color`                       |color  |`#ffffff`            |Card name text colour                     |
|`target_label_color`               |color  |`#ffffff`            |Status label text colour                  |
|`target_temp_color`                |color  |`#ffffff`            |Target temperature text colour            |
|`icon_color`                       |color  |`#ffffff`            |Mode icon colour                          |
|`btn_bg_color`                     |color  |`#ffffff`            |+/− button background colour (25% opacity)|
|`btn_icon_color`                   |color  |`#ffffff`            |+/− button symbol colour                  |
|`icon_heating`                     |string |built-in             |Custom MDI icon for heating mode          |
|`icon_cooling`                     |string |built-in             |Custom MDI icon for cooling mode          |
|`icon_heat_cool`                   |string |built-in             |Custom MDI icon for heat/cool mode        |
|`icon_dry`                         |string |built-in             |Custom MDI icon for dry mode              |
|`icon_fan_only`                    |string |built-in             |Custom MDI icon for fan only mode         |
|`icon_off`                         |string |built-in             |Custom MDI icon for off state             |

-----

## Features

- **Animated icons** — flame, snowflake, spinning fan, and more built-in; swap any for any MDI icon
- **Per-mode gradients** — unique background for heating, cooling, heat/cool, dry, fan only, and idle
- **+/− controls** — adjust target temperature in 0.5° increments directly from the card
- **Power toggle** — tap the mode icon to turn the thermostat on/off; configurable power-on mode
- **Full Visual Editor** — no YAML required; all colours, gradients, icons, and controls configurable in the UI

-----

## License

MIT © [jamesmcginnis](https://github.com/jamesmcginnis)