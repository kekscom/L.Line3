/**
 * Copyright (C) 2015 Jan Marsch
 * @kekscom
 */
//****** file: prefix.js ******

(function(global) {

  'use strict';


//****** file: shortcuts.js ******

// object access shortcuts
var
  m = Math,
  exp = m.exp,
  log = m.log,
  sin = m.sin,
  cos = m.cos,
  tan = m.tan,
  atan = m.atan,
  atan2 = m.atan2,
  min = m.min,
  max = m.max,
  sqrt = m.sqrt,
  ceil = m.ceil,
  floor = m.floor,
  round = m.round,
  pow = m.pow;

// polyfills

var
  Int32Array = Int32Array || Array,
  Uint8Array = Uint8Array || Array;

var IS_IOS = /iP(ad|hone|od)/g.test(navigator.userAgent);
var IS_MSIE = !!~navigator.userAgent.indexOf('Trident');

var requestAnimFrame = (global.requestAnimationFrame && !IS_IOS && !IS_MSIE) ?
  global.requestAnimationFrame : function(callback) {
    callback();
  };



//****** file: Color.debug.js ******

var Color = (function(window) {


var w3cColors = {
  aqua:'#00ffff',
  black:'#000000',
  blue:'#0000ff',
  fuchsia:'#ff00ff',
  gray:'#808080',
  grey:'#808080',
  green:'#008000',
  lime:'#00ff00',
  maroon:'#800000',
  navy:'#000080',
  olive:'#808000',
  orange:'#ffa500',
  purple:'#800080',
  red:'#ff0000',
  silver:'#c0c0c0',
  teal:'#008080',
  white:'#ffffff',
  yellow:'#ffff00'
};

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q-p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q-p) * (2/3 - t) * 6;
  return p;
}

function clamp(v, max) {
  return Math.min(max, Math.max(0, v));
}

var Color = function(h, s, l, a) {
  this.H = h;
  this.S = s;
  this.L = l;
  this.A = a;
};

/*
 * str can be in any of these:
 * #0099ff rgb(64, 128, 255) rgba(64, 128, 255, 0.5)
 */
Color.parse = function(str) {
  var
    r = 0, g = 0, b = 0, a = 1,
    m;

  str = (''+ str).toLowerCase();
  str = w3cColors[str] || str;

  if ((m = str.match(/^#(\w{2})(\w{2})(\w{2})$/))) {
    r = parseInt(m[1], 16);
    g = parseInt(m[2], 16);
    b = parseInt(m[3], 16);
  } else if ((m = str.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)(\D+([\d.]+))?\)/))) {
    r = parseInt(m[1], 10);
    g = parseInt(m[2], 10);
    b = parseInt(m[3], 10);
    a = m[4] ? parseFloat(m[5]) : 1;
  } else {
    return;
  }

  return this.fromRGBA(r, g, b, a);
};

Color.fromRGBA = function(r, g, b, a) {
  if (typeof r === 'object') {
    g = r.g / 255;
    b = r.b / 255;
    a = r.a;
    r = r.r / 255;
  } else {
    r /= 255;
    g /= 255;
    b /= 255;
  }

  var
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    h, s, l = (max+min) / 2,
    d = max-min;

  if (!d) {
    h = s = 0; // achromatic
  } else {
    s = l > 0.5 ? d / (2-max-min) : d / (max+min);
    switch (max) {
      case r: h = (g-b) / d + (g < b ? 6 : 0); break;
      case g: h = (b-r) / d + 2; break;
      case b: h = (r-g) / d + 4; break;
    }
    h *= 60;
  }

  return new Color(h, s, l, a);
};

Color.prototype = {

  toRGBA: function() {
    var
      h = clamp(this.H, 360),
      s = clamp(this.S, 1),
      l = clamp(this.L, 1),
      rgba = { a: clamp(this.A, 1) };

    // achromatic
    if (s === 0) {
      rgba.r = l;
      rgba.g = l;
      rgba.b = l;
    } else {
      var
        q = l < 0.5 ? l * (1+s) : l + s - l*s,
        p = 2 * l-q;
        h /= 360;

      rgba.r = hue2rgb(p, q, h + 1/3);
      rgba.g = hue2rgb(p, q, h);
      rgba.b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(rgba.r*255),
      g: Math.round(rgba.g*255),
      b: Math.round(rgba.b*255),
      a: rgba.a
    };
  },

  toString: function() {
    var rgba = this.toRGBA();

    if (rgba.a === 1) {
      return '#' + ((1 <<24) + (rgba.r <<16) + (rgba.g <<8) + rgba.b).toString(16).slice(1, 7);
    }
    return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a.toFixed(2)].join(',') + ')';
  },

  hue: function(h) {
    return new Color(this.H*h, this.S, this.L, this.A);
  },

  saturation: function(s) {
    return new Color(this.H, this.S*s, this.L, this.A);
  },

  lightness: function(l) {
    return new Color(this.H, this.S, this.L*l, this.A);
  },

  alpha: function(a) {
    return new Color(this.H, this.S, this.L, this.A*a);
  }
};

return Color; }(this));

//****** file: variables.js ******

var
  VERSION      = '0.1.0',

  PI         = Math.PI,
  HALF_PI    = PI/2,
  QUARTER_PI = PI/4,

  MAP_TILE_SIZE  = 256,    // map tile size in pixels
  ZOOM, MAP_SIZE,

  MIN_ZOOM = 15,

  LAT = 'latitude', LON = 'longitude',

  TRUE = true, FALSE = false,

  WIDTH = 0, HEIGHT = 0,
  CENTER_X = 0, CENTER_Y = 0,
  ORIGIN_X = 0, ORIGIN_Y = 0,

  COLOR = Color.parse('rgba(200, 190, 180)'),
  COLOR_STR = ''+ COLOR,

  ZOOM_FACTOR = 1,
  ZOOM_SCALE = 1,

  MAX_HEIGHT, // taller features will be cut to this

  CAM_X, CAM_Y, CAM_Z = 450,

  isZooming;


//****** file: geometry.js ******



//****** file: functions.js ******


function rad(deg) {
  return deg * PI / 180;
}

function deg(rad) {
  return rad / PI * 180;
}

function geoToPixel(lat, lon) {
  var
    latitude  = min(1, max(0, 0.5 - (log(tan(QUARTER_PI + HALF_PI * lat / 180)) / PI) / 2)),
    longitude = lon/360 + 0.5;
  return {
    x: longitude*MAP_SIZE <<0,
    y: latitude *MAP_SIZE <<0
  };
}

function fromRange(sVal, sMin, sMax, dMin, dMax) {
  sVal = min(max(sVal, sMin), sMax);
  var rel = (sVal-sMin) / (sMax-sMin),
    range = dMax-dMin;
  return min(max(dMin + rel*range, dMin), dMax);
}

function isVisible(coordinates) {
   var
    maxX = WIDTH+ORIGIN_X,
    maxY = HEIGHT+ORIGIN_Y;

  // TODO: checking coordinates is sufficient for visibility - NOT VALID FOR SHADOWS!
  for (var i = 0, il = coordinates.length; i < il; i++) {
    if (coordinates[i].x > ORIGIN_X && coordinates[i].x < maxX && coordinates[i].y > ORIGIN_Y && coordinates[i].y < maxY) {
      return true;
    }
  }
  return false;
}


//****** file: GeoJSON.js ******


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


//****** file: Data.js ******


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


//****** file: Line3.js ******

var Line3 = {

  draw: function(context, item) {
    this.extrude(context, item);
  },

  extrude: function(context, item) {
    var
      coordinates = item.coordinates,
      a = { x:0, y:0, z:0 },
      b = { x:0, y:0, z:0 },
      _a, _b;

    for (var i = 0, il = coordinates.length-1; i < il; i++) {
      a.x = coordinates[i].x-ORIGIN_X;
      a.y = coordinates[i].y-ORIGIN_Y;
      a.z = coordinates[i].z;
      b.x = coordinates[i+1].x-ORIGIN_X;
      b.y = coordinates[i+1].y-ORIGIN_Y;
      b.z = coordinates[i+1].z;

      _a = Features.project(a, CAM_Z / (CAM_Z-a.z));
      _b = Features.project(b, CAM_Z / (CAM_Z-b.z));

      // depending on direction, set wall shading
      if ((a.x < b.x && a.y < b.y) || (a.x > b.x && a.y > b.y)) {
        context.fillStyle = item.altColor;
      } else {
        context.fillStyle = item.color;
      }

      context.beginPath();
      this.polygon(context, [b, a, _a, _b]);
      context.closePath();
      context.stroke();
      context.fill();
    }
  },

  polygon: function(context, coordinates) {
    context.moveTo(coordinates[0].x, coordinates[0].y);
    for (var i = 1; i < coordinates.length; i++) {
      context.lineTo(coordinates[i].x, coordinates[i].y);
    }
  },

  shadow: function(context, item) {
    var
      coordinates = item.coordinates,
      mode = null,
      a = { x:0, y:0 },
      b = { x:0, y:0 },
      _a, _b;

    for (var i = 0, il = coordinates.length-1; i < il; i++) {
      a.x = coordinates[i  ].x-ORIGIN_X;
      a.y = coordinates[i  ].y-ORIGIN_Y;
      a.z = coordinates[i  ].z;
      b.x = coordinates[i+1].x-ORIGIN_X;
      b.y = coordinates[i+1].y-ORIGIN_Y;
      b.z = coordinates[i+1].z;

      _a = Shadows.project(a, a.z);
      _b = Shadows.project(b, b.z);

      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(_a.x, _a.y);
      context.lineTo(_b.x, _b.y);
      context.lineTo(b.x, b.y);

      context.closePath();
      context.fill();
    }
  }
};


//****** file: Features.js ******

var Features = {

  project: function(p, m) {
    return {
      x: (p.x-CAM_X) * m + CAM_X <<0,
      y: (p.y-CAM_Y) * m + CAM_Y <<0
    };
  },

  render: function() {
    var context = this.context;
    context.clearRect(0, 0, WIDTH, HEIGHT);

    // show on high zoom levels only and avoid rendering during zoom
    if (ZOOM < MIN_ZOOM || isZooming) {
      return;
    }

    var dataItems = Data.items;

    for (var i = 0, il = dataItems.length; i < il; i++) {
      if (!isVisible(dataItems[i].coordinates)) {
        continue;
      }
      Line3.draw(context, dataItems[i]);
    }
  }
};


//****** file: Shadows.js ******

var Shadows = {

  enabled: true,
  direction: { x:2, y:2 },

  project: function(p, h) {
    return {
      x: p.x + this.direction.x*h,
      y: p.y + this.direction.y*h
    };
  },

  render: function() {
    var context = this.context;

    context.clearRect(0, 0, WIDTH, HEIGHT);

    // show on high zoom levels only and avoid rendering during zoom
    if (ZOOM < MIN_ZOOM || isZooming) {
      return;
    }

    var
      i, il,
      dataItems = Data.items;

    context.fillStyle = '#000000';
    context.canvas.style.opacity = 0.4 / (ZOOM_FACTOR * 2);

    for (i = 0, il = dataItems.length; i < il; i++) {
      if (!isVisible(dataItems[i].coordinates)) {
        continue;
      }
      Line3.shadow(context, dataItems[i]);
    }
  }
};


//****** file: Debug.js ******

var Debug = {

  point: function(x, y, color, size) {
    var context = this.context;
    context.fillStyle = color || '#ffcc00';
    context.beginPath();
    context.arc(x, y, size || 3, 0, 2*PI);
    context.closePath();
    context.fill();
  },

  line: function(ax, ay, bx, by, color) {
    var context = this.context;
    context.strokeStyle = color || '#ffcc00';
    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.closePath();
    context.stroke();
  }
};


//****** file: Layers.js ******

var animTimer;

function fadeIn() {
  Layers.render();
}

var Layers = {

  container: document.createElement('DIV'),
  items: [],

  init: function() {
    this.container.style.pointerEvents = 'none';
    this.container.style.position = 'absolute';
    this.container.style.left = 0;
    this.container.style.top  = 0;

    // TODO: improve this to .setContext(context)
    Shadows.context  = this.createContext(this.container);
    Features.context = this.createContext(this.container);
    Debug.context    = this.createContext(this.container);
  },

  render: function(quick) {
    requestAnimFrame(function() {
      if (!quick) {
        Shadows.render();
      }
      Features.render();
    });
  },

  createContext: function(container) {
    var canvas = document.createElement('CANVAS');
    canvas.style.webkitTransform = 'translate3d(0,0,0)'; // turn on hw acceleration
    canvas.style.imageRendering  = 'optimizeSpeed';
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top  = 0;

    var context = canvas.getContext('2d');
    context.lineCap   = 'round';
    context.lineJoin  = 'round';
    context.lineWidth = 1;

    context.mozImageSmoothingEnabled    = false;
    context.webkitImageSmoothingEnabled = false;

    this.items.push(canvas);
    if (container) {
      container.appendChild(canvas);
    }

    return context;
  },

  appendTo: function(parentNode) {
    parentNode.appendChild(this.container);
  },

  remove: function() {
    this.container.parentNode.removeChild(this.container);
  },

  setSize: function(width, height) {
    for (var i = 0, il = this.items.length; i < il; i++) {
      this.items[i].width  = width;
      this.items[i].height = height;
    }
  },

  // usually called after move: container jumps by move delta, cam is reset
  setPosition: function(x, y) {
    this.container.style.left = x +'px';
    this.container.style.top  = y +'px';
  }
};

Layers.init();


//****** file: adapter.js ******


function setOrigin(origin) {
  ORIGIN_X = origin.x;
  ORIGIN_Y = origin.y;
}

function moveCam(offset) {
  CAM_X = CENTER_X + offset.x;
  CAM_Y = HEIGHT   + offset.y;
  Layers.render(true);
}

function setSize(size) {
  WIDTH  = size.width;
  HEIGHT = size.height;
  CENTER_X = WIDTH /2 <<0;
  CENTER_Y = HEIGHT/2 <<0;

  CAM_X = CENTER_X;
  CAM_Y = HEIGHT;

  Layers.setSize(WIDTH, HEIGHT);
  MAX_HEIGHT = CAM_Z-50;
}

function setZoom(z) {
  ZOOM = z;
  MAP_SIZE = MAP_TILE_SIZE <<ZOOM;

  ZOOM_FACTOR = pow(0.95, ZOOM-MIN_ZOOM);

  COLOR_STR = ''+ COLOR.alpha(ZOOM_FACTOR);

  ZOOM_SCALE = 6 / pow(2, ZOOM-MIN_ZOOM);
}

function onResize(e) {
  setSize(e);
  Layers.render();
  Data.update();
}

function onMoveEnd(e) {
  Layers.render();
  Data.update(); // => fadeIn() => Layers.render()
}

function onZoomStart() {
  isZooming = true;
// effectively clears because of isZooming flag
// TODO: introduce explicit clear()
  Layers.render();
}

function onZoomEnd(e) {
  isZooming = false;
  setZoom(e.zoom);
  Data.update(); // => fadeIn()
  Layers.render();
}


//****** file: Leaflet.js ******


var osmb = function(geojson) {
  this.offset = { x:0, y:0 };
  Data.set(geojson);
};

var proto = osmb.prototype = L.Layer ? new L.Layer() : {};

proto.addTo = function(map) {
  map.addLayer(this);
};

proto.onAdd = function(map) {
  this.map = map;
  Layers.appendTo(map._panes.overlayPane);

  var
    off = this.getOffset(),
    po = map.getPixelOrigin();
  setSize({ width:map._size.x, height:map._size.y });
  setOrigin({ x:po.x-off.x, y:po.y-off.y });
  setZoom(map._zoom);

  Layers.setPosition(-off.x, -off.y);

  map.on({
    move:      this.onMove,
    moveend:   this.onMoveEnd,
    zoomstart: this.onZoomStart,
    zoomend:   this.onZoomEnd,
    resize:    this.onResize,
    viewreset: this.onViewReset,
    click:     this.onClick
  }, this);

  if (map.options.zoomAnimation) {
    map.on('zoomanim', this.onZoom, this);
  }

  Data.update();
};

proto.onRemove = function() {
  var map = this.map;

  map.off({
    move:      this.onMove,
    moveend:   this.onMoveEnd,
    zoomstart: this.onZoomStart,
    zoomend:   this.onZoomEnd,
    resize:    this.onResize,
    viewreset: this.onViewReset,
    click:     this.onClick
  }, this);

  if (map.options.zoomAnimation) {
    map.off('zoomanim', this.onZoom, this);
  }
  Layers.remove();
  map = null;
};

proto.onMove = function(e) {
  var off = this.getOffset();
  moveCam({ x:this.offset.x-off.x, y:this.offset.y-off.y });
};

proto.onMoveEnd = function(e) {
  if (this.noMoveEnd) { // moveend is also fired after zoom
    this.noMoveEnd = false;
    return;
  }

  var
    map = this.map,
    off = this.getOffset(),
    po = map.getPixelOrigin();

  this.offset = off;
  Layers.setPosition(-off.x, -off.y);
  moveCam({ x:0, y:0 });

  setSize({ width:map._size.x, height:map._size.y }); // in case this is triggered by resize
  setOrigin({ x:po.x-off.x, y:po.y-off.y });
  onMoveEnd(e);
};

proto.onZoomStart = function(e) {
  onZoomStart(e);
};

proto.onZoom = function(e) {
//    var map = this.map,
//        scale = map.getZoomScale(e.zoom),
//        offset = map._getCenterOffset(e.center).divideBy(1 - 1/scale),
//        viewportPos = map.containerPointToLayerPoint(map.getSize().multiplyBy(-1)),
//        origin = viewportPos.add(offset).round();
//
//    this.container.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString((origin.multiplyBy(-1).add(this.getOffset().multiplyBy(-1)).multiplyBy(scale).add(origin))) + ' scale(' + scale + ') ';
//    isZooming = true;
};

proto.onZoomEnd = function(e) {
  var
    map = this.map,
    off = this.getOffset(),
    po = map.getPixelOrigin();

  setOrigin({ x:po.x-off.x, y:po.y-off.y });
  onZoomEnd({ zoom:map._zoom });
  this.noMoveEnd = true;
};

proto.onResize = function() {};

proto.onViewReset = function() {
  var off = this.getOffset();

  this.offset = off;
  Layers.setPosition(-off.x, -off.y);
  moveCam({ x:0, y:0 });
};

proto.getOffset = function() {
  return L.DomUtil.getPosition(this.map._mapPane);
};


//****** file: public.js ******


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


//****** file: suffix.js ******


  if (global.L) {
    global.L.Line3 = osmb;
  }

}(this));


