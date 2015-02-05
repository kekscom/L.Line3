
var Data = {

  items: [],

  getPixelCoordinates: function(coordinates) {
    var
      lat = 1, lon = 0, alt = 2,
      res = [],
      px;

    for (var i = 0, il = coordinates.length; i < il; i++) {
      px = geoToPixel(coordinates[i][lat], coordinates[i][lon]);
      px.z = coordinates[i][alt]/ZOOM_SCALE;
      res[i] = px;
    }

    return res;
  },

  resetItems: function() {
    this.items = [];
  },

  addRenderItems: function(data) {
    var item, scaledItem;
    var geojson = GeoJSON.read(data);
    for (var i = 0, il = geojson.length; i < il; i++) {
      item = geojson[i];
      if ((scaledItem = this.scale(item))) {
        this.items.push(scaledItem);
      }
    }
    fadeIn();
  },

  scale: function(item) {
    var res = {};

    if (item.id) {
      res.id = item.id;
    }

    res.coordinates = this.getPixelCoordinates(item.coordinates);

    var color;
    if ((color = Color.parse(item.color || COLOR_STR))) {
      color = color.alpha(ZOOM_FACTOR);
      res.altColor = ''+ color.lightness(0.7);
      res.color    = ''+ color;
    }

    return res;
  },

  set: function(data) {
    this.resetItems();
    this._staticData = data;
    this.addRenderItems(this._staticData);
  },

  update: function() {
    this.resetItems();

    if (ZOOM < MIN_ZOOM) {
      return;
    }

    this.addRenderItems(this._staticData);
  }
};
