# CAT Thermostat Card

A beautiful, HomeKit-style thermostat card for Home Assistant with customizable gradients and smooth animations.

## Features

✨ **Modern Design** - Clean, HomeKit-inspired interface with smooth animations

🎨 **Customizable Colors** - Choose your own gradient color schemes

🔥 **Heating Indicator** - Animated flame icon shows when actively heating

✏️ **Visual Editor** - Easy configuration directly in the Home Assistant UI

📱 **Responsive** - Works beautifully on desktop, tablet, and mobile

⚡ **Smooth Interactions** - Breathing animation for heating state and tap feedback

## Quick Start

After installation, add the card to your dashboard:

1. Click "Add Card" on your dashboard
2. Search for "CAT Thermostat Card"
3. Select your climate entity
4. Customize the name and colors (optional)

## Configuration

```yaml
type: custom:cat-thermostat-card
entity: climate.living_room
name: Living Room
color_start: '#fb923c'
color_end: '#f97316'
```

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `entity` | string | Yes | - | Climate entity ID |
| `name` | string | No | Entity name | Display name |
| `color_start` | string | No | `#fb923c` | Gradient start color |
| `color_end` | string | No | `#f97316` | Gradient end color |

## Color Examples

**Cool Blue**
```yaml
color_start: '#60a5fa'
color_end: '#3b82f6'
```

**Purple**
```yaml
color_start: '#c084fc'
color_end: '#a855f7'
```

**Green**
```yaml
color_start: '#4ade80'
color_end: '#22c55e'
```

## Support

For issues, feature requests, or questions, please visit the [GitHub repository](https://github.com/yourusername/cat-thermostat-card).
