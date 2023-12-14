/**
 * DEBUG MARKERS TOOLS
 */
const debugMarkerTool = {

  oldScrollPosition: 0,
  scrollDirection: '',
  scrollTop: 0,
  scrollTopCenter: 0,
  scrollBottom: 0,

  markerParameters: {
    textColor: 'black',
    list: [
      {
        class: 'scrollTop',
        bgColor: 'blue',
      },
      {
        class: 'scrollTopCenter',
        bgColor: 'red',
      },
      {
        class: 'scrollBottom',
        bgColor: 'blue',
      },
    ],
  },

  init: function (info) {
    // Show in console: App in Debug Mode.
    console.debug('DebugMarkerTool: ' + info);
    this.initStyles();
    this.initMarkers(this.markerParameters.list);
    this.handlers();
  },

  initMarkers: function (list) {
    for (let idx in list) {
      let $marker = $(`<div class='debug-marker-${list[idx].class}'> <p>debug-marker-${list[idx].class}</p></div>`);
      $marker
        .css({
          borderTop: '1px solid ' + list[idx].bgColor,
          color: this.markerParameters.textColor,
        });
      $marker.appendTo('body');
    }
  },

  initStyles: function () {
    const styles = '' +
      '<style>body>[class^="debug-marker-"]{position:absolute;top:0;left:0%;width:100%;font-size:10px;z-index:9999;}' +
      'body>[class^="debug-marker-"] p{display:inline-block;position:absolute;padding:4px 10px;background-color:black;color:white;border-radius:0px 0px 4px 0px;}' +
      'body>[class^="debug-marker-scrollBottom"] p{top: -23px;border-radius:0px 4px 0px 0px;}' +
      '</style>';

    $(styles).appendTo('body');
  },

  handlers: function () {
    let self = this;
    $(window).on('scroll', function () {
      let additionalHeight = ($('#header-menu-wrapper').outerHeight() || 0) + ($('.section.navigation.fixedNavigation').outerHeight() || 0) + ($('#wpadminbar').outerHeight() || 0);
      self.scrollTop = ($(window).scrollTop() + additionalHeight);
      self.scrollTopCenter = ((self.scrollTop + (($(window).height() - additionalHeight) / 2)));
      self.scrollDirection = (self.oldScrollPosition > self.scrollTop) ? 'up' : 'down';
      self.scrollBottom = (($(window).scrollTop() + $(window).height()) - 1);
      self.oldScrollPosition = self.scrollTop;

      self.updateMarkers({
        scrollTop: {
          css: {top: self.scrollTop + 'px'},
          html: ' [ <span style="color: yellow;">' + self.scrollDirection.toUpperCase() + '</span> ]',
        },
        scrollTopCenter: {css: {top: self.scrollTopCenter + 'px', zIndex: '99999'}},
        scrollBottom: {
          css: {
            top: self.scrollBottom + 'px', zIndex: '99999',
            borderTop: 'none',
            borderBottom: '1px solid blue',
          },
        },
      });
    })
  },

  updateMarkers: function (params) {
    for (let key in params) {
      this.updateMarker({
        markerName: key,
        css: params[key].css,
        html: params[key].html,
        left: params[key].left || 0,
      });
    }
  },
  updateMarker: function (params) {
    if (!$('.debug-marker-' + params.markerName).length) {
      this.initMarkers([
        {
          class: params.markerName,
          bgColor: 'purple',
        },
      ]);
    }

    let $marker = $('.debug-marker-' + params.markerName);
    if ((typeof params.css !== undefined) && Object.keys(params.css).length > 0) {
      $marker.css(params.css);
    }
    if ((typeof params.html !== undefined) && params.html !== '') {
      let $html = '<p>debug-marker-' + params.markerName + ': <span style="color: yellow;">[Top: ' + params.css.top + ']</span> <span class="left" style="color: mediumpurple; position: relative;">[Left: ' + (params.left || 0) + ']</span>' + (params.html || '') + '</p>';

      if (params.left) {
        $html += ' <div style="position: absolute; top: 0; left: ' + params.left + '; width: 1px; height: ' + $('body').outerHeight() + 'px; z-index: 9999;background-color: #d33333;">' +
          '<span style="position: absolute; top: 0; left: 0; color: white; background-color:#333333;">Left: ' + params.left + '</span>' +
          '</div>';
      }
      
      $marker.html($html);
    }
  },
  removeMarkers: function (list) {
    if (Array.isArray(list)) {
      $.each(list, (idx, markerName) => this.removeMarker(markerName));
    }
  },
  removeMarker: function (markerName) {
    $('body > [class^="debug-marker-' + markerName + '"]').remove();
  },

  getDirection: function () {
    return this.scrollDirection;
  },
};

export default {
  init: info => debugMarkerTool.init(info),
  updateMarkers: params => debugMarkerTool.updateMarkers(params),
  updateMarker: params => debugMarkerTool.updateMarker(params),
  removeMarkers: list => debugMarkerTool.removeMarkers(list),
  removeMarker: markerName => debugMarkerTool.removeMarker(markerName),
  getDirection: () => debugMarkerTool.getDirection(),
};

/*
  Feature note: Need refactoring Vertical line code
*/
//------------------------------
/**
Use:

import debugMarkerTool from "./partials/debugMarkerTools";

if (this.data.debug) {
  debugMarkerTool.init('StickySplash in Debugging Mode.');
}
//------------------------------
if (this.data.debug) {
  const debugData = {},
    list = [
      'scrollTopCurrent',
      'targetTop',
      'targetBottom',
      'targetHeight',
      'splashHeight',
      'endBlockOffset',
    ];

  // Horizontal Line
  $.each(list, function (idx, item) {
    debugData[item] = {css: {top: ds[item] + 'px'}};
  });

  // Vertical Line
  debugData['targetLeftOffset'] = {css: {top: ds.targetTop + 'px'}, left: ds.targetLeftOffset + 'px'};

  debugMarkerTool.updateMarkers(debugData);
}
*/














