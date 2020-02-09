
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
