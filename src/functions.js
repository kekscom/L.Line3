
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
