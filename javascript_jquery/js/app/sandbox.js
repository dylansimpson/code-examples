(function(hb){
  var Sandbox = (function (Core) {
    var i, len,
        Public = {},
        Private = {};

    Private.methods = [
      'mergeTemplate',
      'docReady',
      'request',
      'notify',
      'listen',
      '$',
      'getUserInfo'
    ];

    Private.assign = function (method) {
      if (method in Core && typeof Core[method] === 'function') {
        Public[method] = Core[method];
      }
    }

    for (i = 0, len = Private.methods.length; i < len; i++) {
      Private.assign(Private.methods[i]);
    }

    return Public;
  }(hb.Core));

  hb.Sandbox = Sandbox;
}(window.hb));