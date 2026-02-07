# CAT Thermostat Card

A beautiful, dynamic thermostat card for Home Assistant with animated HVAC mode indicators, customizable gradient backgrounds, and intuitive temperature controls.

![CAT Thermostat Card Preview](preview.png)

*Visual editor with full customization options:*

![CAT Thermostat Card Editor](editor.png)

## ✨ Key Features

- 🔥 **Complete HVAC Mode Support** - Heating, Cooling, Heat/Cool (Auto), Dry, Fan Only, and Off states
- 🎬 **Animated Mode Indicators** - Dynamic icons that breathe, pulse, or spin based on active mode
- 🔌 **Click-to-Toggle Power** - Click any animated icon to instantly turn the thermostat on or off
- 🎨 **Dynamic Gradients** - Smooth color transitions for each HVAC mode with fully customizable colors
- 🎯 **Manual Controls** - Quick +/- buttons to adjust temperature by 0.5° increments
- 🖼️ **Custom Icon Support** - Choose from popular Material Design Icons for each mode
- 🖌️ **Fully Customizable** - Configure all colors including 6 gradient pairs and 4 text elements
- 📱 **Responsive Design** - Clean, compact layout that fits perfectly in your dashboard
- ⚙️ **Visual Editor** - Easy-to-use configuration interface within Home Assistant

## 🖼️ Visual States

The card features six distinct HVAC mode states with unique animations:

| Mode | Icon | Animation | Color |
|------|------|-----------|-------|
| **Heating** | 🔥 Flame | Breathing | Orange gradient |
| **Cooling** | ❄️ Snowflake | Breathing | Blue gradient |
| **Heat/Cool (Auto)** | ⏳ Hourglass | Pulsing | Purple gradient |
| **Dry** | 💧 Water Drop | Breathing | Amber gradient |
| **Fan Only** | 🌀 Fan | Spinning | Green gradient |
| **Off** | ⏸️ Power | Static (dimmed) | Gray gradient |

Each state includes:
- Large current temperature display (customizable color)
- Entity name label (customizable color)
- Target temperature with contextual label (customizable colors)
- Temperature adjustment controls (+/- buttons in 0.5° increments)
- Clickable animated icon for power toggle

## 🎨 Customization Options

Every visual element is fully customizable through the visual editor:

**Background Gradients (6 modes)**
- Heating state colors (start & end)
- Cooling state colors (start & end)
- Heat/Cool (Auto) state colors (start & end)
- Dry mode colors (start & end)
- Fan Only mode colors (start & end)
- Idle/Off state colors (start & end)

**Text Colors (4 elements)**
- Current temperature
- Entity name
- Target label text
- Target temperature

**Custom Icons (6 modes)**
- Heating icon (dropdown with popular MDI icons)
- Cooling icon (dropdown with popular MDI icons)
- Heat/Cool (Auto) icon (dropdown with popular MDI icons)
- Dry mode icon (dropdown with popular MDI icons)
- Fan Only icon (dropdown with popular MDI icons)
- Off/Power icon (dropdown with popular MDI icons)

Leave any icon as "Default" to use the built-in animated SVG icons.

## 🎮 Interactive Controls

- **Click the card** - Opens the more-info dialog for detailed controls
- **Click the animated icon** - Toggles the thermostat on/off
- **Plus button** - Increases temperature by 0.5°
- **Minus button** - Decreases temperature by 0.5°

## 📋 Requirements

- Home Assistant 2023.x or newer
- Any `climate` entity (thermostat, HVAC system, AC unit, radiator, etc.)
- Supports all HVAC modes: heat, cool, heat_cool, auto, dry, fan_only, off
- Compatible with Material Design Icons (MDI)

## 🚀 Quick Start

1. Install via HACS or manually
2. Add card to your dashboard
3. Select your climate entity from the dropdown
4. Customize colors, icons, and appearance as desired
5. Enjoy beautiful, animated climate control!

## 💡 Use Cases

Perfect for:
- Multi-mode HVAC systems with heat, cool, and auto capabilities
- Central heating/cooling thermostats
- Individual room radiators with TRVs
- Air conditioning units with dry and fan modes
- Mini-split systems with heat pump functionality
- Smart thermostats with multiple operating modes
- Zone climate control systems
- Any `climate` entity in Home Assistant

## 🎯 Design Philosophy

This card prioritizes:
- **Visual Clarity** - Instant understanding of current HVAC mode and activity
- **Quick Access** - Common actions (temperature adjustment, power toggle) right on the card
- **Mode Awareness** - Animated icons and color-coded backgrounds for each operating mode
- **Aesthetic Appeal** - Smooth animations, modern gradients, and polished UI
- **Flexibility** - Adapts to any color scheme, supports custom icons, and fits any dashboard design
- **Complete Control** - Support for all standard HVAC modes without compromise

## 🔧 Technical Details

- Built with Web Components (Custom Elements) and Shadow DOM
- Smooth CSS transitions and animations (breathing, pulsing, spinning)
- Intelligent state detection (prioritizes `hvac_action` over `state`)
- Event-based interaction model with proper event bubbling
- Responsive to entity attribute changes in real-time
- Visual editor built with Home Assistant's configuration framework
- 0.5° temperature increment support for precise control
- Smart power toggle logic (turns on to preferred auto/heat_cool mode)

## 🆕 What's New in v2.0.0

- ✅ Added support for all HVAC modes (Heat/Cool, Dry, Fan Only)
- ✅ Implemented click-to-toggle power functionality on animated icons
- ✅ Added custom icon selection with dropdown selectors
- ✅ Enhanced visual editor with icon customization options
- ✅ Added mode-specific animations (breathing, pulsing, spinning)
- ✅ Improved state detection logic (hvac_action priority)
- ✅ Added 6 gradient color pairs for complete mode coverage
- ✅ Expanded icon library with popular MDI icon options

## 📄 License

MIT License - feel free to use and modify as needed!

---

**Created with ❤️ for the Home Assistant community**
