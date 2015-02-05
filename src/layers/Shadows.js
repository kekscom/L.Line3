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
