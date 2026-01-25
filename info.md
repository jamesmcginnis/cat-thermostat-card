# CAT Radiator Card

A beautiful, animated thermostat card for Home Assistant with dynamic gradients and intuitive controls.

## ✨ Key Features

- 🔥 **Animated State Indicators** - Pulsing flame when heating, snowflake when cooling
- 🎨 **Dynamic Gradients** - Smooth color transitions based on thermostat state
- 🎯 **Quick Controls** - Adjust temperature with +/- buttons directly on the card
- 🖌️ **Fully Customizable** - Configure all colors including backgrounds and text
- 📱 **Responsive Design** - Compact layout perfect for any dashboard
- ⚙️ **Visual Editor** - Easy configuration through Home Assistant UI

## 🖼️ Preview

The card features three distinct visual states:

- **Heating**: Warm orange/red gradient with animated flame icon
- **Cooling**: Cool blue gradient with animated snowflake icon  
- **Idle**: Neutral gray gradient with no icon

Each state includes:
- Large current temperature display
- Entity name label
- Target temperature with contextual label ("Heating to", "Cooling to", or state name)
- Temperature adjustment controls

## 🎨 Customization

Every visual element is customizable:

**Background Gradients**
- Heating state colors (start & end)
- Cooling state colors (start & end)
- Idle state colors (start & end)

**Text Colors**
- Current temperature
- Entity name
- Target label
- Target temperature

## 📋 Requirements

- Home Assistant 2023.x or newer
- Climate entity (thermostat, radiator, HVAC, etc.)

## 🚀 Quick Start

1. Install via HACS or manually
2. Add card to your dashboard
3. Select your climate entity
4. Customize colors to match your theme
5. Enjoy!

## 💡 Use Cases

Perfect for:
- Individual room radiators
- Central heating thermostats
- Air conditioning units
- Smart TRVs (Thermostatic Radiator Valves)
- Zone climate control
- Any `climate` entity in Home Assistant

## 🎯 Design Philosophy

This card prioritizes:
- **Visual Clarity** - Instant understanding of heating/cooling status
- **Quick Access** - Common actions (temperature adjustment) right on the card
- **Aesthetic Appeal** - Smooth animations and modern gradients
- **Flexibility** - Adapts to any color scheme or dashboard design

## 🔧 Technical Details

- Built with Web Components (Custom Elements)
- Shadow DOM for style encapsulation
- Smooth CSS
