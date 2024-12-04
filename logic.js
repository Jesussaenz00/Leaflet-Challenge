// Step 1: Initialize the map and set the view to a starting position and zoom level.
const map = L.map('map').setView([37.09, -95.71], 5); // Center over the US

// Step 2: Add a tile layer to the map (background map image from OpenStreetMap).
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Step 3: Define the URL for USGS earthquake data (e.g., all earthquakes in the past 7 days).
const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Step 4: Fetch the earthquake data from the USGS GeoJSON feed.
fetch(earthquakeUrl)
    .then(response => response.json()) // Parse the JSON data from the response
    .then(data => createEarthquakeMarkers(data.features)); // Pass the data to our function

// Step 5: Function to determine the color based on earthquake depth.
function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#1a9850';
}

// Step 6: Function to determine the marker size based on earthquake magnitude.
function getRadius(magnitude) {
    return magnitude * 4; // Multiplied to increase visibility on the map
}

// Step 7: Function to create markers on the map with popups for each earthquake.
function createEarthquakeMarkers(earthquakes) {
    // Loop through each earthquake in the GeoJSON features array
    earthquakes.forEach(earthquake => {
        const [longitude, latitude, depth] = earthquake.geometry.coordinates; // Extract coordinates
        const magnitude = earthquake.properties.mag; // Extract magnitude

        // Create a circle marker with custom styling
        L.circleMarker([latitude, longitude], {
            radius: getRadius(magnitude), // Set radius based on magnitude
            fillColor: getColor(depth),   // Set color based on depth
            color: '#000',                // Border color for the circle
            weight: 0.5,                  // Border weight
            opacity: 1,
            fillOpacity: 0.7              // Transparency of the circle
        })
        .bindPopup(`<h3>${earthquake.properties.place}</h3><hr>
                    <p>Magnitude: ${magnitude}</p>
                    <p>Depth: ${depth} km</p>`) // Popup with earthquake info
        .addTo(map); // Add the circle marker to the map
    });
}

// Step 8: Create a legend to show color meanings based on depth.
const legend = L.control({ position: 'bottomright' }); // Position at bottom right

legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'info legend'); // Create a container div with class "info legend"
    const depths = [-10, 10, 30, 50, 70, 90]; // Depth ranges for color scale
    const labels = [];

    // Loop through depth intervals and create a colored label for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background:${getColor(depths[i] + 1)}"></i> ` +
            `${depths[i]}${depths[i + 1] ? '&ndash;' + depths[i + 1] : '+'}<br>`;
    }
    return div;
};

// Step 9: Add the legend to the map
legend.addTo(map);