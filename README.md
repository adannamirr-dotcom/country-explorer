# 🌍 Country Explorer

An interactive web application that lets users explore countries around the world on an interactive map.

Users can search for any country, view detailed information, visualize its borders, and explore its administrative states/provinces directly on the map.

---

## Features

- 🔍 Country search with autocomplete suggestions
- 🗺️ Interactive world map using Leaflet.js
- 🌍 Highlights selected country's borders
- 📍 Automatically zooms to the selected country
- 🏳️ Displays:
  - Flag
  - Capital
  - Languages
  - Currency
  - Area
  - Region
- 🌐 Clickable neighboring countries
- 🏛️ Hover over states/provinces to view their names
- ⚡ Dynamic loading of state GeoJSON files for improved performance

---

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Leaflet.js
- GeoJSON

---

## Data Sources

Country information:
- REST Countries API dataset

Country borders:
- GeoJSON dataset

State/Province boundaries:
- GeoJSON administrative boundary dataset

---

## Performance Optimization

The original state dataset was over **340 MB**, making it unsuitable for GitHub and causing slow loading times.

To improve performance, the dataset was split into individual country GeoJSON files that are loaded only when a country is selected.

This significantly reduces the initial amount of data loaded by the application.

---

## Project Structure

```
country-explorer/
│
├── states/
├── countries.geojson
├── countries.json
├── index.html
├── script.js
├── style.css
└── README.md
```

---

## Future Improvements

- Display additional country statistics
- Dark/Light mode
- Mobile responsiveness improvements
- Search by capital city
- Country comparison feature

---

## Author

Adan Amir