# CAT Thermostat Card

A beautiful, dynamic thermostat card for Home Assistant featuring animated HVAC mode indicators, customizable glassmorphism gradients, and an intuitive visual editor.

![Preview](preview.png)

## ✨ Features

* **Complete HVAC Mode Support:** Distinct styles for Heating, Cooling, Heat/Cool (Auto), Dry, Fan Only, and Off states.
* **Animated Mode Indicators:** Native SVG icons that breathe, pulse, or spin based on active equipment status.
* **Click-to-Toggle Power:** Tap the animated icon to instantly toggle your thermostat on or off.
* **Glassmorphism UI:** 135° smooth color transitions for each mode with translucent buttons that adapt to any background.
* **Visual Editor:** Full configuration interface—no YAML required to customize colors or icons.
* **Manual Controls:** Quick-adjust buttons for 0.5° temperature increments.
* **Custom Icon Support:** Choose from popular Material Design Icons (MDI) to replace built-in animations.

---

## 📸 Screenshots

### Card Preview
> ![Card Preview Placeholder](preview.png)
> *The card automatically detects HVAC states and displays dynamic animations and gradients.*

### Visual Editor
> ![Editor Preview Placeholder](editor.png)
> *The intuitive editor features tabs for General setup, Color gradients, and Icon selection.*

---

## 🚀 Installation

### HACS (Recommended)
1. Open **HACS** in your Home Assistant instance.
2. Go to **Frontend**.
3. Click the menu (⋮) in the top right and select **Custom repositories**.
4. Add this repository URL and select **Dashboard** as the category.
5. Click **Install**.

### Manual Installation
1. Download `cat-thermostat-card.js`.
2. Copy it to your `config/www/` directory.
3. Add the following to your Lovelace resources (**Settings > Dashboards > Resources**):
    * **URL:** `/local/cat-thermostat-card.js`
    * **Type:** `module`

---

## 🛠️ Configuration

### Using the Visual Editor
Edit your dashboard, click "Add Card," and search for **CAT Thermostat Card**. The visual editor includes:
* **⚙️ General:** Entity selection and custom display name.
* **🎨 Colors:** 6 gradient pairs, text colors, and icon/button styling.
* **🔧 Icons:** Select from built-in animations or custom MDI icons.

### Manual YAML Configuration
```yaml
type: custom:cat-thermostat-card
entity: climate.living_room
name: Living Room
# Heating colors
heat_start: '#fb923c'
heat_end: '#f97316'
# Cooling colors
cool_start: '#60a5fa'
cool_end: '#2563eb'
# Text colors
current_temp_color: '#ffffff'
name_color: '#ffffff'
# Custom icons (optional)
icon_heating: 'mdi:fire'
icon_cooling: 'mdi:snowflake'
