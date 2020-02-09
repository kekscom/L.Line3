var Color = (function () {

  var w3cColors = {
    aqua: '#00ffff',
    black: '#000000',
    blue: '#0000ff',
    fuchsia: '#ff00ff',
    gray: '#808080',
    grey: '#808080',
    green: '#008000',
    lime: '#00ff00',
    maroon: '#800000',
    navy: '#000080',
    olive: '#808000',
    orange: '#ffa500',
    purple: '#800080',
    red: '#ff0000',
    silver: '#c0c0c0',
    teal: '#008080',
    white: '#ffffff',
    yellow: '#ffff00'
  };

  function hue2rgb (p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function clamp (v, max) {
    return Math.min(max, Math.max(0, v));
  }

  var Color = function (h, s, l, a) {
    this.H = h;
    this.S = s;
    this.L = l;
    this.A = a;
  };

  /*
   * str can be in any of these:
   * #0099ff rgb(64, 128, 255) rgba(64, 128, 255, 0.5)
   */
  Color.parse = function (str) {
    var
      r = 0, g = 0, b = 0, a = 1,
      m;

    str = ('' + str).toLowerCase();
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

  Color.fromRGBA = function (r, g, b, a) {
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
      h, s, l = (max + min) / 2,
      d = max - min;

    if (!d) {
      h = s = 0; // achromatic
    } else {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    return new Color(h, s, l, a);
  };

  Color.prototype = {

    toRGBA: function () {
      var
        h = clamp(this.H, 360),
        s = clamp(this.S, 1),
        l = clamp(this.L, 1),
        rgba = {a: clamp(this.A, 1)};

      // achromatic
      if (s === 0) {
        rgba.r = l;
        rgba.g = l;
        rgba.b = l;
      } else {
        var
          q = l < 0.5 ? l * (1 + s) : l + s - l * s,
          p = 2 * l - q;
        h /= 360;

        rgba.r = hue2rgb(p, q, h + 1 / 3);
        rgba.g = hue2rgb(p, q, h);
        rgba.b = hue2rgb(p, q, h - 1 / 3);
      }

      return {
        r: Math.round(rgba.r * 255),
        g: Math.round(rgba.g * 255),
        b: Math.round(rgba.b * 255),
        a: rgba.a
      };
    },

    toString: function () {
      var rgba = this.toRGBA();

      if (rgba.a === 1) {
        return '#' + ((1 << 24) + (rgba.r << 16) + (rgba.g << 8) + rgba.b).toString(16).slice(1, 7);
      }
      return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a.toFixed(2)].join(',') + ')';
    },

    hue: function (h) {
      return new Color(this.H * h, this.S, this.L, this.A);
    },

    saturation: function (s) {
      return new Color(this.H, this.S * s, this.L, this.A);
    },

    lightness: function (l) {
      return new Color(this.H, this.S, this.L * l, this.A);
    },

    alpha: function (a) {
      return new Color(this.H, this.S, this.L, this.A * a);
    }
  };

  return Color;
}());

L.Line3 = class extends L.Layer {

  constructor (geojson) {
    super();

    this._defaultColor = Color.parse(L.Line3.DEFAULT_COLOR);

    this._origin = [0, 0];
    
    this._width = 0;
    this._height = 0;
    this._offset = [0, 0];
    this._cam = [0, 0, 450];

    this._data = [];
    this._renderData = [];

    this._container = document.createElement('DIV');

    this._container.style.pointerEvents = 'none';
    this._container.style.position = 'absolute';
    this._container.style.left = '0';
    this._container.style.top = '0';

    this._layers = [
      new L.Line3.ShadowLayer(this),
      new L.Line3.FeatureLayer(this)
    ];

    if (geojson) {
      this.setData(geojson);
    }
  }

  onAdd (map) {
    this.map = map;

    this.map._panes.overlayPane.appendChild(this._container);
    
    const
      offset = this._getMapOffset(),
      origin = this._getMapOrigin();
    
    this._setSize(this.map._size.x, this.map._size.y);
    this._origin = [origin[0]-offset[0], origin[1]-offset[1]];
    this._setZoom(this.map._zoom);

    this._container.style.left = -offset[0] +'px';
    this._container.style.top  = -offset[1] +'px';

    this.map.on({
      move:      this._onMove,
      moveend:   this._onMoveEnd,
      zoomstart: this._onZoomStart,
      zoomend:   this._onZoomEnd,
      resize:    this._onResize,
      viewreset: this._onViewReset
    }, this);

    if (this.map.options.zoomAnimation) {
      this.map.on('zoomanim', this._onZoom, this);
    }

    this._prepareRenderData(this._data);
  }

  onRemove () {
    this.map.off({
      move:      this._onMove,
      moveend:   this._onMoveEnd,
      zoomstart: this._onZoomStart,
      zoomend:   this._onZoomEnd,
      resize:    this._onResize,
      viewreset: this._onViewReset
    }, this);

    if (this.map.options.zoomAnimation) {
      this.map.off('zoomanim', this._onZoom, this);
    }

    this._container.parentNode.removeChild(this._container);
    delete this.map;
  }

  setData (geojson) {
    this._data = this._readGeoJSON(geojson);
    this._prepareRenderData(this._data);
  }

  geoToPixel (point, scale = 1) {
    const
      lon = point[0]/360 + 0.5,
      lat = Math.min(1, Math.max(0, 0.5 - (Math.log(Math.tan(Math.PI / 4 + Math.PI / 2 * point[1] / 180)) / Math.PI) / 2));
    return [lon*scale <<0, lat*scale <<0];
  }

  _readGeoJSON (geojson) {
    if (!geojson || !geojson.features) {
      return [];
    }
    return geojson.features.map(feature => {
      const item = feature.properties;
      item.coordinates = feature.geometry.coordinates;
      if (feature.id || feature.properties.id) {
        item.id = feature.id || feature.properties.id;
      }
      return item;
    });
  }

  _scale (item) {
    const res = {};

    if (item.id) {
      res.id = item.id;
    }

    res.coordinates = item.coordinates.map(point => {
      const px = this.geoToPixel(point, this._worldPixels);
      px[2] = point[2]/this._zoomScale;
      return px;
    });

    const color = item.color ? Color.parse(item.color) : this._defaultColor;
    res.altColor = '' + color.lightness(0.7);
    res.color    = '' + color;

    return res;
  }

  _prepareRenderData (data) {
    if (this._zoom < L.Line3.MIN_ZOOM) {
      this._renderData = [];
      return;
    }
    this._renderData = data.map(item => this._scale(item));
    this._render();
  }

  _onMove (e) {
    const offset = this._getMapOffset();
    this._moveCam([this._offset[0]-offset[0], this._offset[1]-offset[1]]);
  }

  _onMoveEnd = function(e) {
    if (this._noMoveEnd) { // moveend is also fired after zoom
      this._noMoveEnd = false;
      return;
    }

    const origin = this._getMapOrigin();

    this._offset = this._getMapOffset();

    this._container.style.left = -this._offset[0] +'px';
    this._container.style.top  = -this._offset[1] +'px';

    this._moveCam([0, 0]);

    this._setSize(this.map._size.x, this.map._size.y); // in case this is triggered by resize
    this._origin = [origin[0]-this._offset[0], origin[1]-this._offset[1]];

    this._render();
    this._prepareRenderData(this._data);
  }

  _onZoom (e) {
    // var
    //   scale = this.map.getZoomScale(e.zoom),
    //   offset = this.map._getCenterOffset(e.center).divideBy(1 - 1/scale),
    //   viewportPos = this.map.containerPointToLayerPoint(map.getSize().multiplyBy(-1)),
    //   origin = viewportPos.add(offset).round();
    // this._container.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString((origin.multiplyBy(-1).add(this._getMapOffset().multiplyBy(-1)).multiplyBy(scale).add(origin))) + ' scale(' + scale + ') ';
    // this._isZooming = true;
  }

  _onZoomEnd (e) {
    const
      offset = this._getMapOffset(),
      origin = this._getMapOrigin();

    this._origin = [origin[0]-offset[0], origin[1]-offset[1]];
    
    this._isZooming = false;
    this._setZoom(this.map._zoom);
    this._prepareRenderData(this._data);
    this._render();

    this._noMoveEnd = true;
  }

  _onViewReset () {
    this._offset = this._getMapOffset();
    this._container.style.left = -this._offset[0] +'px';
    this._container.style.top  = -this._offset[1] +'px';
    this._moveCam([0, 0]);
  }

  _getMapOffset () {
    const offset = L.DomUtil.getPosition(this.map._mapPane);
    return [offset.x, offset.y];
  }

  _getMapOrigin () {
    const origin = this.map.getPixelOrigin();
    return [origin.x, origin.y];
  }

  _moveCam (pos) {
    this._cam = [this._center[0]+pos[0], this._height+pos[1], this._cam[2]];
    this._render();
  }

  _setSize (width, height) {
    this._width  = width;
    this._height = height;
    this._center = [this._width /2 <<0, this._height/2 <<0];
    this._cam    = [this._center[0], this._height, this._cam[2]];
    this._maxZ   = this._cam[2]-50;
    this._layers.forEach(layer => layer.setSize(this._width, this._height));
  }

  _setZoom (zoom) {
    this._zoom = zoom;
    this._worldPixels = 256 << this._zoom;
    this._zoomFactor = Math.pow(0.95, this._zoom-L.Line3.MIN_ZOOM);
    this._zoomColorStr = '' + this._defaultColor.alpha(this._zoomFactor);
    this._zoomScale = 6 / Math.pow(2, this._zoom-L.Line3.MIN_ZOOM);
  }

  _onResize (e) {
    this._setSize(e);
    this._render();
    this._prepareRenderData(this._data);
  }

  _onZoomStart (e) {
    this._isZooming = true;
// effectively clears because of _isZooming flag
// TODO: introduce explicit clear()
    this._render();
  }

  _render () {
    requestAnimationFrame(f => {
      this._layers.forEach(layer => layer.render());
    });
  }
};

L.Line3.MIN_ZOOM = 15;
L.Line3.DEFAULT_COLOR = 'rgba(200, 190, 180)';


L.Line3.FeatureLayer = class {

  constructor (controller) {
    this._controller = controller;

    this._canvas = document.createElement('CANVAS');
    this._canvas.style.transform = 'translate3d(0, 0, 0)'; // turn on hw acceleration
    this._canvas.style.imageRendering = 'optimizeSpeed';
    this._canvas.style.position = 'absolute';
    this._canvas.style.left = '0';
    this._canvas.style.top = '0';

    this._context = this._canvas.getContext('2d');
    this._context.lineCap = 'round';
    this._context.lineJoin = 'round';
    this._context.lineWidth = 1;

    this._context.imageSmoothingEnabled = true;

    this._controller._container.appendChild(this._canvas);
  }

  setSize (width, height) {
    this._canvas.width  = width;
    this._canvas.height = height;
  }

  render () {
    this._context.clearRect(0, 0, this._controller._width, this._controller._height);

    // show on high zoom levels only and avoid rendering during zoom
    if (this._controller._zoom < L.Line3.MIN_ZOOM || this._controller._isZooming) {
      return;
    }

    this._controller._renderData.forEach(item => this._draw(item));
  }

  _draw (item) {
    const coordinates = item.coordinates;

    if (!this._isVisible(coordinates)) {
      return;
    }

    const origin = this._controller._origin;
    const camZ = this._controller._cam[2];
    const a = [0, 0, 0];
    const b = [0, 0, 0];
    let _a, _b;

    for (let i = 0; i < coordinates.length-1; i++) {
      a[0] = coordinates[i][0]-origin[0];
      a[1] = coordinates[i][1]-origin[1];
      a[2] = coordinates[i][2];

      b[0] = coordinates[i+1][0]-origin[0];
      b[1] = coordinates[i+1][1]-origin[1];
      b[2] = coordinates[i+1][2];

      _a = this._project(a, camZ / (camZ-a[2]));
      _b = this._project(b, camZ / (camZ-b[2]));

      // depending on direction, set wall shading
      if ((a[0] < b[0] && a[1] < b[1]) || (a[0] > b[0] && a[1] > b[1])) {
        this._context.fillStyle = item.altColor;
      } else {
        this._context.fillStyle = item.color;
      }

      this._context.beginPath();
      this._polygon([b, a, _a, _b]);
      this._context.closePath();
      this._context.stroke();
      this._context.fill();
    }
  }

  _polygon (coordinates) {
    this._context.moveTo(coordinates[0][0], coordinates[0][1]);
    for (let i = 1; i < coordinates.length; i++) {
      this._context.lineTo(coordinates[i][0], coordinates[i][1]);
    }
  }

  _project (point, m) {
    return [
      (point[0]-this._controller._cam[0]) * m + this._controller._cam[0] <<0,
      (point[1]-this._controller._cam[1]) * m + this._controller._cam[1] <<0
    ];
  }

  _isVisible (coordinates) {
    const
      maxX = this._controller._width +this._controller._origin[0],
      maxY = this._controller._height+this._controller._origin[1];
    return coordinates.some(point => {
      // TODO: also check projected point
      return (point[0] > this._controller._origin[0] && point[0] < maxX && point[1] > this._controller._origin[1] && point[1] < maxY);
    });
  }
};


L.Line3.ShadowLayer = class extends L.Line3.FeatureLayer {

  constructor (controller) {
    super(controller);

    this._direction = [2, 2];
    this._context.fillStyle = '#000000';
  }

  render () {
    this._context.clearRect(0, 0, this._controller._width, this._controller._height);

    // show on high zoom levels only and avoid rendering during zoom
    if (this._controller._zoom < L.Line3.MIN_ZOOM || this._controller._isZooming) {
      return;
    }

    this._context.canvas.style.opacity = '' + (0.4 / (this._controller._zoomFactor * 2));

    // this._context.beginPath();
    this._controller._renderData.forEach(item => this._draw(item));
    // this._context.closePath();
    // this._context.fill();
  }

  _draw (item) {
    const coordinates = item.coordinates;

    if (!this._isVisible(coordinates)) {
      return;
    }

    const origin = this._controller._origin;
    const a = [0, 0, 0];
    const b = [0, 0, 0];
    let _a, _b;

    for (let i = 0; i < coordinates.length-1; i++) {
      a[0] = coordinates[i][0]-origin[0];
      a[1] = coordinates[i][1]-origin[1];
      a[2] = coordinates[i][2];

      b[0] = coordinates[i+1][0]-origin[0];
      b[1] = coordinates[i+1][1]-origin[1];
      b[2] = coordinates[i+1][2];

      _a = this._project(a, a[2]);
      _b = this._project(b, b[2]);

      this._context.beginPath();
      this._polygon([a, _a, _b, b]);
      this._context.closePath();
      this._context.fill();
    }
  }

  _project (point, m) {
    return [
      point[0] + this._direction[0]*m <<0,
      point[1] + this._direction[1]*m <<0
    ];
  }
};
