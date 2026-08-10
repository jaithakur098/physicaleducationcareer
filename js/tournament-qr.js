/* Local QR code generation — no external API dependency */
(function (root) {
  'use strict';

  function build(text, size) {
    size = size || 180;
    if (!text || typeof qrcode === 'undefined') return null;
    try {
      var qr = qrcode(0, 'M');
      qr.addData(String(text));
      qr.make();
      var modules = qr.getModuleCount();
      var margin = 4;
      var cell = Math.max(2, Math.floor((size - margin * 2) / modules));
      return qr.createSvgTag(cell, margin);
    } catch (e) {
      return null;
    }
  }

  function dataUrl(text, size) {
    var svg = build(text, size);
    if (!svg) return '';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function svgHtml(text, size) {
    var svg = build(text, size);
    return svg || '';
  }

  root.TQR = { dataUrl: dataUrl, svgHtml: svgHtml, build: build };
})(window);
