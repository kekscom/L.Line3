
L.Line3 is a Leaflet layer for showing 3D vector lines.

Link Leaflet and OSM Buildings files in your HTML head section.

~~~ html
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"></script>
  <script src="L.Line3.js"></script>
</head>
~~~

Initialize the map

~~~ javascript
const map = new L.Map('map').setView([52.52020, 13.37570], 17);
~~~

Add the Line3 layer.

~~~ javascript
new L.Line3({GeoJSON}).addTo(map);
~~~

Only supported GeoJSON geometry is LineString, properties can hold 'color', coordinates must contain a 3rd member altitude.

~~~ javascript
const geoJSON = {
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
