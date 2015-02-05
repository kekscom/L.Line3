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
