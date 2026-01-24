# CAT Thermostat Card

A beautiful, HomeKit-style thermostat card for Home Assistant with a visual editor and smooth animations.

![CAT Thermostat Card](https://via.placeholder.com/600x300?text=CAT+Thermostat+Card)

## Features

- 🎨 **Customizable gradient backgrounds** - Choose your own color schemes
- 🔥 **Visual heating indicator** - Animated flame icon when actively heating
- 📱 **Modern, clean design** - HomeKit-inspired interface
- ✏️ **Visual editor** - Configure the card directly in the UI
- 🎯 **Click to open more info** - Tap the card to access full thermostat controls
- ⚡ **Smooth animations** - Breathing animation for heating state

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend"
3. Click the "+" button and search for "CAT Thermostat Card"
4. Click "Install"
5. Restart Home Assistant

### Manual Installation

1. Download `cat-thermostat-card.js` from the latest release
2. Copy it to your `config/www` folder
3. Add the resource in your Home Assistant configuration:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **Add Resource**
   - Set URL to `/local/cat-thermostat-card.js`
   - Set Resource Type to **JavaScript Module**
4. Restart Home Assistant

## Configuration

### Visual Editor

The easiest way to configure the card is through the visual editor:

1. Add a new card to your dashboard
2. Search for "CAT Thermostat Card"
3. Select your climate entity
4. Customize the name and colors as desired

### YAML Configuration

You can also configure the card manually in YAML:

```yaml
type: custom:cat-thermostat-card
entity: climate.living_room
name: Living Room
color_start: '#fb923c'
color_end: '#f97316'
```

## Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `entity` | string | **Required** | The climate entity ID |
| `name` | string | Entity's friendly name | Display name for the thermostat |
| `color_start` | string | `#fb923c` | Gradient start color (hex code) |
| `color_end` | string | `#f97316` | Gradient end color (hex code) |

## Color Presets

Here are some suggested color combinations:

**Warm Orange (Default)**
```yaml
color_start: '#fb923c'
color_end: '#f97316'
```

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

**Red**
```yaml
color_start: '#f87171'
color_end: '#ef4444'
```

## Examples

### Basic Setup

```yaml
type: custom:cat-thermostat-card
entity: climate.bedroom
```

### Fully Customized

```yaml
type: custom:cat-thermostat-card
entity: climate.office
name: Office Radiator
color_start: '#60a5fa'
color_end: '#3b82f6'
```

### Multiple Cards in a Grid

```yaml
type: grid
columns: 2
cards:
  - type: custom:cat-thermostat-card
    entity: climate.living_room
    name: Living Room
  - type: custom:cat-thermostat-card
    entity: climate.bedroom
    name: Bedroom
    color_start: '#c084fc'
    color_end: '#a855f7'
```

## Requirements

- Home Assistant 2021.11 or newer
- A `climate` entity (thermostat)

## Troubleshooting

**Card doesn't appear**
- Make sure the resource is properly added in Settings → Dashboards → Resources
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check the browser console for errors

**Entity not found error**
- Verify the entity ID is correct
- Ensure the entity domain is `climate`

**Colors not updating**
- Use valid hex color codes (e.g., `#fb923c`)
- Refresh the page after making changes

## Support

If you encounter any issues or have suggestions:

- [Report an issue](https://github.com/yourusername/cat-thermostat-card/issues)
- [Feature requests](https://github.com/yourusername/cat-thermostat-card/issues/new)

## License

MIT License - feel free to use and modify as needed.

## Credits

Created with ❤️ for the Home Assistant community.
