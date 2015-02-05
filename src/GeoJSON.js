
var GeoJSON = (function() {

  return {
    read: function(geojson) {
      if (!geojson || geojson.type !== 'FeatureCollection') {
        return [];
      }

      var
        collection = geojson.features,
        i, il,
        res = [],
        feature,
        item;

      for (i = 0, il = collection.length; i < il; i++) {
        feature = collection[i];

        if (feature.type !== 'Feature' || onEach(feature) === false) {
          continue;
        }

        item = feature.properties;
        item.coordinates = feature.geometry.coordinates;
        if (feature.id || feature.properties.id) {
          item.id = feature.id || feature.properties.id;
        }

        res.push(item);
      }

      return res;
    }
  };
}());
