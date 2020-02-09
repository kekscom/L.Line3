
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
