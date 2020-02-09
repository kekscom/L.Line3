
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
