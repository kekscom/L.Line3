
proto.style = function(style) {
  style = style || {};
  var color;
  if ((color = style.color)) {
    COLOR = Color.parse(color).alpha(ZOOM_FACTOR);
    COLOR_STR = ''+ COLOR;
  }

  Layers.render();

  return this;
};

proto.set = function(data) {
  Data.set(data);
  return this;
};

var onEach = function() {};

proto.each = function(handler) {
  onEach = function(payload) {
    return handler(payload);
  };
  return this;
};

osmb.VERSION = VERSION;
