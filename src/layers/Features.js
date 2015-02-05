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
