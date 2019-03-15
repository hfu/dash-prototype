(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const tile02long = (x) => {
  return x * 360 - 180
}

const tile02lat = (y) => {
  let n = Math.PI - 2 * Math.PI * y
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

module.exports = {
  // the default board
  board: [
    [35, 32, 31, 17, 16, 6, 2, 1],
    [34, 33, 28, 18, 21, 15, 5, 3],
    [41, 40, null, 26, 25, 20, 7, 4],
    [42, 43, 44, 27, 29, 10, 9, 8],
    [46, 45, 37, 36, 23, 19, 11, 12],
    [47, 38, 39, 30, 24, 22, 14, 13]
  ],

  // default names
  names: {
    1: '北海道',
    2: '青森', 3: '岩手', 4: '宮城', 5: '秋田', 6: '山形', 7: '福島',
    8: '茨城', 9: '栃木', 10: '群馬', 11: '埼玉', 12: '千葉', 13: '東京', 14: '神奈川',
    15: '新潟', 16: '富山', 17: '石川', 18: '福井', 19: '山梨', 20: '長野',
    21: '岐阜', 22: '静岡', 23: '愛知', 24: '三重',
    25: '滋賀', 26: '京都', 27: '大阪', 28: '兵庫', 29: '奈良', 30: '和歌山',
    31: '鳥取', 32: '島根', 33: '岡山', 34: '広島', 35: '山口',
    36: '徳島', 37: '香川', 38: '愛媛', 39: '高知',
    40: '福岡', 41: '佐賀', 42: '長崎', 43: '熊本', 44: '大分', 45: '宮崎', 46: '鹿児島', 47: '沖縄'
  },

  // default thematic data table
  table: [
    [13, 14, 12, 11, 8, 9, 10, 19], 1
  ],

  // default title
  title: '首都圏整備法にいう首都圏',

  // default coloring function
  color: (v) => {
    if (v === 1) {
      return ['rgb', 0, 157, 220]
    } else {
      return ['rgb', 189, 188, 188]
    }
  },

  // default map div id
  map: 'map',

  // default spacing
  spacing: 0.005,

  // default margin
  margin: 0.2,

  // default attribution
  attribution: 'your attribution text here',

  createGeoJSON: () => {
    const maxy = module.exports.board.length
    const maxx = module.exports.board[0].length
    const max = maxy > maxx ? maxy : maxx
    const margin = module.exports.margin
    const span = (1.0 - 2 * margin) / max
    const paddingx = (1.0 - 2 * margin - maxx * span) / 2
    const paddingy = (1.0 - 2 * margin - maxy * span) / 2
    const spacing = module.exports.spacing
    let geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            tile02long(0.5),
            tile02lat(margin + paddingy * 0.75)
          ]
        },
        properties: {
          code: 'title',
          name: module.exports.title
        }
      }]
    }
    for (let y = 0; y < maxy; y++) {
      for (let x = 0; x < maxx; x++) {
        const code = module.exports.board[y][x]
        const name = module.exports.names[code]
        if (!code) continue
        const left = margin + paddingx + x * span
        const top = margin + paddingy + y * span
        const geometry = {
          type: 'Polygon',
          coordinates: [[
            [tile02long(left + spacing), tile02lat(top + spacing)],
            [tile02long(left + spacing), tile02lat(top + span - spacing)],
            [tile02long(left + span - spacing), tile02lat(top + span - spacing)],
            [tile02long(left + span - spacing), tile02lat(top + spacing)],
            [tile02long(left + spacing), tile02lat(top + spacing)]
          ]]
        }
        geojson.features.push({
          type: 'Feature',
          geometry: geometry,
          properties: {
            code: code,
            name: name
          }
        })
      }
    }
    return geojson
  },

  createMap: (options = {}) => {
    if (options.map) module.exports.map = options.map
    if (options.board) module.exports.board = options.board
    if (options.names) module.exports.names = options.names
    if (options.table) module.exports.table = options.table
    if (options.title) module.exports.title = options.title
    if (options.color) module.exports.color = options.color
    if (options.attribution) module.exports.attribution = options.attribution

    const geojson = module.exports.createGeoJSON()

    let fillColorExpression = [
      'match',
      [
        'get',
        'code'
      ]
    ]
    for (let i = 0; i < module.exports.table.length; i = i + 2) {
      fillColorExpression.push(module.exports.table[i])
      fillColorExpression.push(module.exports.color(module.exports.table[i + 1]))
    }
    fillColorExpression.push([
      'rgb', 189, 199, 188
    ])

    let style = {
      version: 8,
      attribution: module.exports.attribution,
      glyphs: 'https://vectortiles.xyz/fonts/{fontstack}/{range}.pbf',
      sources: {
        v: {
          type: 'geojson',
          data: geojson
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': [
              'rgb', 255, 255, 255
            ]
          }
        },
        {
          id: 'fill',
          type: 'fill',
          source: 'v',
          layout: {},
          paint: {
            'fill-color': fillColorExpression
          }
        },
        {
          id: 'symbol',
          type: 'symbol',
          source: 'v',
          layout: {
            'text-font': [
              'sans'
            ],
            'text-field': [
              'get',
              'name'
            ],
            'text-size': [
              'interpolate',
              [
                'exponential',
                2
              ],
              [
                'zoom'
              ],
              0,
              6,
              7,
              900
            ],
            'text-max-width': 120
          },
          paint: {
            'text-color': [
              'match',
              [
                'get',
                'code'
              ],
              [
                'title'
              ],
              [
                'rgb',
                0,
                0,
                0
              ],
              [
                'rgb',
                255,
                255,
                255
              ]
            ]
          }
        }
      ]
    }

    const map = new mapboxgl.Map({
      container: module.exports.map,
      style: style,
      attributionControl: true,
      bounds: [
        [tile02long(module.exports.margin), tile02lat(1 - module.exports.margin)],
        [tile02long(1 - module.exports.margin), tile02lat(module.exports.margin)]
      ],
      hash: true,
      localIdengraphFontFamily: 'sans',
      maxZoom: 4,
      renderWorldCopies: false
    })
    map.on('load', function () {
      // map.addControl(new mapboxgl.NavigationControl())
    })
  }
}

},{}],2:[function(require,module,exports){
(function (global){
const dash = require('./dash')

global.dash = dash

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./dash":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXNoLmpzIiwibWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZQQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IHRpbGUwMmxvbmcgPSAoeCkgPT4ge1xuICByZXR1cm4geCAqIDM2MCAtIDE4MFxufVxuXG5jb25zdCB0aWxlMDJsYXQgPSAoeSkgPT4ge1xuICBsZXQgbiA9IE1hdGguUEkgLSAyICogTWF0aC5QSSAqIHlcbiAgcmV0dXJuIDE4MCAvIE1hdGguUEkgKiBNYXRoLmF0YW4oMC41ICogKE1hdGguZXhwKG4pIC0gTWF0aC5leHAoLW4pKSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIHRoZSBkZWZhdWx0IGJvYXJkXG4gIGJvYXJkOiBbXG4gICAgWzM1LCAzMiwgMzEsIDE3LCAxNiwgNiwgMiwgMV0sXG4gICAgWzM0LCAzMywgMjgsIDE4LCAyMSwgMTUsIDUsIDNdLFxuICAgIFs0MSwgNDAsIG51bGwsIDI2LCAyNSwgMjAsIDcsIDRdLFxuICAgIFs0MiwgNDMsIDQ0LCAyNywgMjksIDEwLCA5LCA4XSxcbiAgICBbNDYsIDQ1LCAzNywgMzYsIDIzLCAxOSwgMTEsIDEyXSxcbiAgICBbNDcsIDM4LCAzOSwgMzAsIDI0LCAyMiwgMTQsIDEzXVxuICBdLFxuXG4gIC8vIGRlZmF1bHQgbmFtZXNcbiAgbmFtZXM6IHtcbiAgICAxOiAn5YyX5rW36YGTJyxcbiAgICAyOiAn6Z2S5qOuJywgMzogJ+WyqeaJiycsIDQ6ICflrq7ln44nLCA1OiAn56eL55SwJywgNjogJ+WxseW9oicsIDc6ICfnpo/ls7YnLFxuICAgIDg6ICfojKjln44nLCA5OiAn5qCD5pyoJywgMTA6ICfnvqTppqwnLCAxMTogJ+WfvOeOiScsIDEyOiAn5Y2D6JGJJywgMTM6ICfmnbHkuqwnLCAxNDogJ+elnuWliOW3nScsXG4gICAgMTU6ICfmlrDmvZ8nLCAxNjogJ+WvjOWxsScsIDE3OiAn55+z5bedJywgMTg6ICfnpo/kupUnLCAxOTogJ+WxseaiqCcsIDIwOiAn6ZW36YeOJyxcbiAgICAyMTogJ+WykOmYnCcsIDIyOiAn6Z2Z5bKhJywgMjM6ICfmhJvnn6UnLCAyNDogJ+S4iemHjScsXG4gICAgMjU6ICfmu4vos4AnLCAyNjogJ+S6rOmDvScsIDI3OiAn5aSn6ZiqJywgMjg6ICflhbXluqsnLCAyOTogJ+WliOiJrycsIDMwOiAn5ZKM5q2M5bGxJyxcbiAgICAzMTogJ+mzpeWPlicsIDMyOiAn5bO25qC5JywgMzM6ICflsqHlsbEnLCAzNDogJ+W6g+WzticsIDM1OiAn5bGx5Y+jJyxcbiAgICAzNjogJ+W+s+WzticsIDM3OiAn6aaZ5bedJywgMzg6ICfmhJvlqpsnLCAzOTogJ+mrmOefpScsXG4gICAgNDA6ICfnpo/lsqEnLCA0MTogJ+S9kOizgCcsIDQyOiAn6ZW35bSOJywgNDM6ICfnhormnKwnLCA0NDogJ+Wkp+WIhicsIDQ1OiAn5a6u5bSOJywgNDY6ICfpub/lhZDls7YnLCA0NzogJ+aylue4hCdcbiAgfSxcblxuICAvLyBkZWZhdWx0IHRoZW1hdGljIGRhdGEgdGFibGVcbiAgdGFibGU6IFtcbiAgICBbMTMsIDE0LCAxMiwgMTEsIDgsIDksIDEwLCAxOV0sIDFcbiAgXSxcblxuICAvLyBkZWZhdWx0IHRpdGxlXG4gIHRpdGxlOiAn6aaW6YO95ZyP5pW05YKZ5rOV44Gr44GE44GG6aaW6YO95ZyPJyxcblxuICAvLyBkZWZhdWx0IGNvbG9yaW5nIGZ1bmN0aW9uXG4gIGNvbG9yOiAodikgPT4ge1xuICAgIGlmICh2ID09PSAxKSB7XG4gICAgICByZXR1cm4gWydyZ2InLCAwLCAxNTcsIDIyMF1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFsncmdiJywgMTg5LCAxODgsIDE4OF1cbiAgICB9XG4gIH0sXG5cbiAgLy8gZGVmYXVsdCBtYXAgZGl2IGlkXG4gIG1hcDogJ21hcCcsXG5cbiAgLy8gZGVmYXVsdCBzcGFjaW5nXG4gIHNwYWNpbmc6IDAuMDA1LFxuXG4gIC8vIGRlZmF1bHQgbWFyZ2luXG4gIG1hcmdpbjogMC4yLFxuXG4gIC8vIGRlZmF1bHQgYXR0cmlidXRpb25cbiAgYXR0cmlidXRpb246ICd5b3VyIGF0dHJpYnV0aW9uIHRleHQgaGVyZScsXG5cbiAgY3JlYXRlR2VvSlNPTjogKCkgPT4ge1xuICAgIGNvbnN0IG1heHkgPSBtb2R1bGUuZXhwb3J0cy5ib2FyZC5sZW5ndGhcbiAgICBjb25zdCBtYXh4ID0gbW9kdWxlLmV4cG9ydHMuYm9hcmRbMF0ubGVuZ3RoXG4gICAgY29uc3QgbWF4ID0gbWF4eSA+IG1heHggPyBtYXh5IDogbWF4eFxuICAgIGNvbnN0IG1hcmdpbiA9IG1vZHVsZS5leHBvcnRzLm1hcmdpblxuICAgIGNvbnN0IHNwYW4gPSAoMS4wIC0gMiAqIG1hcmdpbikgLyBtYXhcbiAgICBjb25zdCBwYWRkaW5neCA9ICgxLjAgLSAyICogbWFyZ2luIC0gbWF4eCAqIHNwYW4pIC8gMlxuICAgIGNvbnN0IHBhZGRpbmd5ID0gKDEuMCAtIDIgKiBtYXJnaW4gLSBtYXh5ICogc3BhbikgLyAyXG4gICAgY29uc3Qgc3BhY2luZyA9IG1vZHVsZS5leHBvcnRzLnNwYWNpbmdcbiAgICBsZXQgZ2VvanNvbiA9IHtcbiAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICBmZWF0dXJlczogW3tcbiAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtcbiAgICAgICAgICAgIHRpbGUwMmxvbmcoMC41KSxcbiAgICAgICAgICAgIHRpbGUwMmxhdChtYXJnaW4gKyBwYWRkaW5neSAqIDAuNzUpXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgY29kZTogJ3RpdGxlJyxcbiAgICAgICAgICBuYW1lOiBtb2R1bGUuZXhwb3J0cy50aXRsZVxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH1cbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IG1heHk7IHkrKykge1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBtYXh4OyB4KyspIHtcbiAgICAgICAgY29uc3QgY29kZSA9IG1vZHVsZS5leHBvcnRzLmJvYXJkW3ldW3hdXG4gICAgICAgIGNvbnN0IG5hbWUgPSBtb2R1bGUuZXhwb3J0cy5uYW1lc1tjb2RlXVxuICAgICAgICBpZiAoIWNvZGUpIGNvbnRpbnVlXG4gICAgICAgIGNvbnN0IGxlZnQgPSBtYXJnaW4gKyBwYWRkaW5neCArIHggKiBzcGFuXG4gICAgICAgIGNvbnN0IHRvcCA9IG1hcmdpbiArIHBhZGRpbmd5ICsgeSAqIHNwYW5cbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgdHlwZTogJ1BvbHlnb24nLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBbW1xuICAgICAgICAgICAgW3RpbGUwMmxvbmcobGVmdCArIHNwYWNpbmcpLCB0aWxlMDJsYXQodG9wICsgc3BhY2luZyldLFxuICAgICAgICAgICAgW3RpbGUwMmxvbmcobGVmdCArIHNwYWNpbmcpLCB0aWxlMDJsYXQodG9wICsgc3BhbiAtIHNwYWNpbmcpXSxcbiAgICAgICAgICAgIFt0aWxlMDJsb25nKGxlZnQgKyBzcGFuIC0gc3BhY2luZyksIHRpbGUwMmxhdCh0b3AgKyBzcGFuIC0gc3BhY2luZyldLFxuICAgICAgICAgICAgW3RpbGUwMmxvbmcobGVmdCArIHNwYW4gLSBzcGFjaW5nKSwgdGlsZTAybGF0KHRvcCArIHNwYWNpbmcpXSxcbiAgICAgICAgICAgIFt0aWxlMDJsb25nKGxlZnQgKyBzcGFjaW5nKSwgdGlsZTAybGF0KHRvcCArIHNwYWNpbmcpXVxuICAgICAgICAgIF1dXG4gICAgICAgIH1cbiAgICAgICAgZ2VvanNvbi5mZWF0dXJlcy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgZ2VvbWV0cnk6IGdlb21ldHJ5LFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZ2VvanNvblxuICB9LFxuXG4gIGNyZWF0ZU1hcDogKG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGlmIChvcHRpb25zLm1hcCkgbW9kdWxlLmV4cG9ydHMubWFwID0gb3B0aW9ucy5tYXBcbiAgICBpZiAob3B0aW9ucy5ib2FyZCkgbW9kdWxlLmV4cG9ydHMuYm9hcmQgPSBvcHRpb25zLmJvYXJkXG4gICAgaWYgKG9wdGlvbnMubmFtZXMpIG1vZHVsZS5leHBvcnRzLm5hbWVzID0gb3B0aW9ucy5uYW1lc1xuICAgIGlmIChvcHRpb25zLnRhYmxlKSBtb2R1bGUuZXhwb3J0cy50YWJsZSA9IG9wdGlvbnMudGFibGVcbiAgICBpZiAob3B0aW9ucy50aXRsZSkgbW9kdWxlLmV4cG9ydHMudGl0bGUgPSBvcHRpb25zLnRpdGxlXG4gICAgaWYgKG9wdGlvbnMuY29sb3IpIG1vZHVsZS5leHBvcnRzLmNvbG9yID0gb3B0aW9ucy5jb2xvclxuICAgIGlmIChvcHRpb25zLmF0dHJpYnV0aW9uKSBtb2R1bGUuZXhwb3J0cy5hdHRyaWJ1dGlvbiA9IG9wdGlvbnMuYXR0cmlidXRpb25cblxuICAgIGNvbnN0IGdlb2pzb24gPSBtb2R1bGUuZXhwb3J0cy5jcmVhdGVHZW9KU09OKClcblxuICAgIGxldCBmaWxsQ29sb3JFeHByZXNzaW9uID0gW1xuICAgICAgJ21hdGNoJyxcbiAgICAgIFtcbiAgICAgICAgJ2dldCcsXG4gICAgICAgICdjb2RlJ1xuICAgICAgXVxuICAgIF1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1vZHVsZS5leHBvcnRzLnRhYmxlLmxlbmd0aDsgaSA9IGkgKyAyKSB7XG4gICAgICBmaWxsQ29sb3JFeHByZXNzaW9uLnB1c2gobW9kdWxlLmV4cG9ydHMudGFibGVbaV0pXG4gICAgICBmaWxsQ29sb3JFeHByZXNzaW9uLnB1c2gobW9kdWxlLmV4cG9ydHMuY29sb3IobW9kdWxlLmV4cG9ydHMudGFibGVbaSArIDFdKSlcbiAgICB9XG4gICAgZmlsbENvbG9yRXhwcmVzc2lvbi5wdXNoKFtcbiAgICAgICdyZ2InLCAxODksIDE5OSwgMTg4XG4gICAgXSlcblxuICAgIGxldCBzdHlsZSA9IHtcbiAgICAgIHZlcnNpb246IDgsXG4gICAgICBhdHRyaWJ1dGlvbjogbW9kdWxlLmV4cG9ydHMuYXR0cmlidXRpb24sXG4gICAgICBnbHlwaHM6ICdodHRwczovL3ZlY3RvcnRpbGVzLnh5ei9mb250cy97Zm9udHN0YWNrfS97cmFuZ2V9LnBiZicsXG4gICAgICBzb3VyY2VzOiB7XG4gICAgICAgIHY6IHtcbiAgICAgICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICAgICAgZGF0YTogZ2VvanNvblxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbGF5ZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogJ2JhY2tncm91bmQnLFxuICAgICAgICAgIHR5cGU6ICdiYWNrZ3JvdW5kJyxcbiAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiBbXG4gICAgICAgICAgICAgICdyZ2InLCAyNTUsIDI1NSwgMjU1XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6ICdmaWxsJyxcbiAgICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgICAgc291cmNlOiAndicsXG4gICAgICAgICAgbGF5b3V0OiB7fSxcbiAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiBmaWxsQ29sb3JFeHByZXNzaW9uXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6ICdzeW1ib2wnLFxuICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgIHNvdXJjZTogJ3YnLFxuICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgJ3RleHQtZm9udCc6IFtcbiAgICAgICAgICAgICAgJ3NhbnMnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3RleHQtZmllbGQnOiBbXG4gICAgICAgICAgICAgICdnZXQnLFxuICAgICAgICAgICAgICAnbmFtZSdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAndGV4dC1zaXplJzogW1xuICAgICAgICAgICAgICAnaW50ZXJwb2xhdGUnLFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgJ2V4cG9uZW50aWFsJyxcbiAgICAgICAgICAgICAgICAyXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAnem9vbSdcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgNixcbiAgICAgICAgICAgICAgNyxcbiAgICAgICAgICAgICAgOTAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ3RleHQtbWF4LXdpZHRoJzogMTIwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgJ3RleHQtY29sb3InOiBbXG4gICAgICAgICAgICAgICdtYXRjaCcsXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAnZ2V0JyxcbiAgICAgICAgICAgICAgICAnY29kZSdcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICd0aXRsZSdcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICdyZ2InLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAncmdiJyxcbiAgICAgICAgICAgICAgICAyNTUsXG4gICAgICAgICAgICAgICAgMjU1LFxuICAgICAgICAgICAgICAgIDI1NVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuXG4gICAgY29uc3QgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgICBjb250YWluZXI6IG1vZHVsZS5leHBvcnRzLm1hcCxcbiAgICAgIHN0eWxlOiBzdHlsZSxcbiAgICAgIGF0dHJpYnV0aW9uQ29udHJvbDogdHJ1ZSxcbiAgICAgIGJvdW5kczogW1xuICAgICAgICBbdGlsZTAybG9uZyhtb2R1bGUuZXhwb3J0cy5tYXJnaW4pLCB0aWxlMDJsYXQoMSAtIG1vZHVsZS5leHBvcnRzLm1hcmdpbildLFxuICAgICAgICBbdGlsZTAybG9uZygxIC0gbW9kdWxlLmV4cG9ydHMubWFyZ2luKSwgdGlsZTAybGF0KG1vZHVsZS5leHBvcnRzLm1hcmdpbildXG4gICAgICBdLFxuICAgICAgaGFzaDogdHJ1ZSxcbiAgICAgIGxvY2FsSWRlbmdyYXBoRm9udEZhbWlseTogJ3NhbnMnLFxuICAgICAgbWF4Wm9vbTogNCxcbiAgICAgIHJlbmRlcldvcmxkQ29waWVzOiBmYWxzZVxuICAgIH0pXG4gICAgbWFwLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLk5hdmlnYXRpb25Db250cm9sKCkpXG4gICAgfSlcbiAgfVxufVxuIiwiY29uc3QgZGFzaCA9IHJlcXVpcmUoJy4vZGFzaCcpXG5cbmdsb2JhbC5kYXNoID0gZGFzaFxuIl19
