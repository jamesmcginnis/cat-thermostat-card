# CAT Thermostat Card

A beautiful, dynamic thermostat card for Home Assistant with animated HVAC mode indicators, customizable gradient backgrounds, and intuitive temperature controls.

![CAT Thermostat Card Preview](preview.png)

*Visual editor with full customization options:*

![CAT Thermostat Card Editor](editor.png)

## ✨ Key Features

- 🔥 **Complete HVAC Mode Support** - Heating, Cooling, Heat/Cool (Auto), Dry, Fan Only, and Off states.
- 🎬 **Animated Mode Indicators** - Native SVG icons that breathe, pulse, or spin based on active equipment status.
- 🔌 **Click-to-Toggle Power** - Click the animated icon to instantly toggle the thermostat on or off.
- 🎨 **Dynamic Gradients** - 135° smooth color transitions for each HVAC mode with fully customizable start/end colors.
- 🎯 **Manual Controls** - Precision +/- buttons to adjust temperature by 0.5° increments.
- 🖼️ **Custom Icon Support** - Choose from popular Material Design Icons (MDI) for each mode or use built-in animations.
- 🖌️ **Glassmorphism UI** - Translucent control buttons that adapt perfectly to any chosen gradient background.
- ⚙️ **Visual Editor** - Advanced tabbed configuration interface (General, Colors, Icons) within Home Assistant.

## 🖼️ Visual States

The card features six distinct states with unique animations that react to your HVAC's `hvac_action` and `state`:

| Mode | Icon | Animation | Background Style |
|------|------|-----------|-------|
| **Heating** | 🔥 Flame | Breathing | Orange gradient |
| **Cooling** | ❄️ Snowflake | Breathing | Blue gradient |
| **Heat/Cool (Auto)** | 🔄 Hourglass | Pulsing | Purple gradient |
| **Dry** | 💧 Water Drop | Breathing | Amber gradient |
| **Fan Only** | 🌀 Fan | Spinning | Green gradient |
| **Off** | ⏸️ Power | Static (dimmed) | Gray gradient |

## 🎨 Customization Options

Every visual element is fully customizable through the tabbed visual editor:

**Background Gradients**
- Unique start and end hex colors for all 6 HVAC modes.
- Real-time preview bars in the editor.

**Typography & UI Colors**
- Current temperature, Entity name, Target label, and Target temperature colors.
- **Button Colors:** Set the base color for +/− buttons (rendered at 25% opacity for a glassy look).
- **Icon Color:** Global color override for the mode indicator.

**Custom Icons**
- Dropdown selectors for each mode with popular MDI alternatives.
- Leave as "Default" to enjoy the custom-coded animated SVGs.

## 🎮 Interactive Controls

- **Click the card body** - Opens the standard `more-info` dialog.
- **Click the animated icon** - Toggles power. Smart logic turns the unit on to `auto`, `heat_cool`, or `heat` depending on availability.
- **Plus/Minus buttons** - Adjusts target temperature by 0.5°.

## 📋 Requirements

- Home Assistant 2023.x or newer.
- Any `climate` entity.
- Support for standard services: `set_temperature`, `set_hvac_mode`, and `turn_off`.

## 🆕 What's New

- ✅ **Advanced Visual Editor:** New tabbed UI for a cleaner configuration experience.
- ✅ **Full Mode Coverage:** Added dedicated support for Dry and Fan Only modes.
- ✅ **Power Toggle:** Added the ability to turn the thermostat on/off by clicking the icon.
- ✅ **Glassmorphism:** Buttons now feature a translucent glass effect.
- ✅ **Enhanced Animations:** Added CSS-based spinning and pulsing animations.
- ✅ **Icon Overrides:** Full MDI icon support via the visual editor.

## 📄 License

MIT License - feel free to use and modify as needed!

---

**Created with ❤️ for the Home Assistant community**
