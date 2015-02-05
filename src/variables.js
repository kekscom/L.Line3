var
  VERSION      = /*<version=*/'0.1.0'/*>*/,

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
