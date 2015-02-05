L.Line3 is Leaflet map layer for drawing 3D vector lines.

**Example** http://keks.com/examples/Line3

## Documentation

### Integration with Leaflet

Link Leaflet and OSM Buildings files in your HTML head section.

~~~ html
<head>
  <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css">
  <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
  <script src="L.Line3.js"></script>
</head>
~~~

Initialize the map engine and add a map tile layer.

~~~ javascript
var map = new L.Map('map').setView([52.52020, 13.37570], 17);
new L.TileLayer('http://{s}.tiles.mapbox.com/v3/<YOUR KEY HERE>/{z}/{x}/{y}.png',
  { attribution: 'Map tiles &copy; <a href="http://mapbox.com">MapBox</a>', maxZoom: 17 }).addTo(map);
~~~

Add the Line3 layer.

~~~ javascript
new L.Line3(GeoJSON).addTo(map);
~~~

Supported GeoJSON geometry is LineString, property can hold color, coordinates must contain a 3rd member: altitude.

~~~ javascript
var geoJSON = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [[
        [13.37356, 52.52064, 50],
        [13.37350, 52.51971, 40],
        [13.37664, 52.51973, 45],
        [13.37594, 52.52062, 10]
      ]]
    },
    "properties": {
      "color": "rgb(255,0,0)"
    }
  }]
};
~~~
