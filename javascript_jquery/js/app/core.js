/**
 * @fileOverview Javascript Application Core (Layer 2)
 * -------------------------------------
 * For anyone who's curios, Layer 1 would be our base library (jQuery in this case).
 *
 * References:
 * @see Nicholas Zakas' <a href="http://www.youtube.com/watch?v=vXjVFPosQHw">Scalable Javascript Architecture Video</a>
 * @see Nicholas Zakas' <a href="http://http://www.slideshare.net/nzakas/scalable-javascript-application-architecture">Slideshare to follow along with.</a>
 * @see Andreas Goebel's <a href="https://github.com/jAndreas/BarFoos">BarFoos Architecture Framework</a> from which I took a lot of ideas from.
 *
 * @author <a href="https://github.com/overthemike">Mike Sweeney</a>
 * @version 0
 */
(function(win, doc, $, m){
  /** @see <a href="https://developer.mozilla.org/en/JavaScript/Strict_mode">Strict mode</a> */
  "use strict";

  /** @namespace */
  win.hb = win.hb || {};

  /**
   * Our Application Core object
   * @returns {object} Returns our application's core object's public methods
   */
  var Core = (function () {
    var modules = {},
        Public = {},
        Private = {
          templateDir: '/templates/',
          apiBase: '',
          apiKey: '',
          sid: '',
          eventPool: {}
        };

    Public.register = function (moduleName, templateNames, creator) {
      modules[moduleName] = {
        create: creator,
        templates:templateNames,
        instance: null
      };
    };

    Public.start = function (moduleName) {
      var module = modules[moduleName],
          templateArray = [];

      module.instance = module.create(hb.Sandbox);

      if (module.templates) {
        if (module.templates instanceof Array) {
          templateArray = module.templates;
        } else {
          templateArray = [module.templates];
        }


        Private.getTemplates(templateArray, function(templates){
          module.instance.init(templates);
        });
      } else {
        module.instance.init(null);
      }
    };

    Public.stop = function (moduleName) {
      var module = modules[moduleName];
      if (module) {
        module.instance.destroy();
        module.instance = null;
      }
    };

    Public.startAll = function () {
      for (var moduleName in modules) {
        if (modules.hasOwnProperty(moduleName)) {
          Public.start(moduleName);
        }
      }
    };

    Public.stopAll = function () {
      for (var moduleName in modules) {
        if (modules.hasOwnProperty(moduleName)) {
          Public.stop(moduleName);
        }
      }
    };

    Public.request = function (options) {
      return $.ajax({
        url: Private.apiBase + options.url,
        type: options.type || 'get',
        dataType: options.dataType || 'json',
        beforeSend: options.beforeSend || $.noop,
        statusCode: options.statusCode || null,
        timeout: options.timeout || 5000,
        traditional: options.traditional || true,
        data: (function () {
          var authObj = {};
          if (Private.sid) {authObj.sid = Private.sid;}
          if (Private.apiKey) {authObj.key = Private.key;}
          return $.extend(authObj, options.data || {});
        }()),
        success: options.success || $.noop,
        error: options.error || $.noop,
        complete: options.complete || $.noop
      });
    };

    Public.notify = function (eventInfo) {
      // the setTimeout is here to make sure that the listeners all get a chance
      // to 'listen' for an event before notify is executed
      win.setTimeout(function(){
        var listenerCount = 0;

        if (eventInfo.name in Private.eventPool) {
          Private.eventPool[eventInfo.name].some(function(listener, index) {
            listener.callback.apply(listener.scope, [eventInfo]);
            listenerCount++;

            return eventInfo.stopPropagation;
          });
        }

        if (typeof eventInfo.callback === 'function') {
          eventInfo.callback(listenerCount, eventInfo.response);
        }
      }, 0);
    };

    Public.listen = function (eventName, callback, scope) {
      var i, len, eventPool;

      if (!(eventName instanceof Array)) {
        eventName = [eventName];
      }

      for (i = 0, len = eventName.length; i < len; i++) {
        eventPool = Private.eventPool;
        if (typeof eventPool[eventName[i]] === 'undefined') {
          eventPool[eventName[i]] = [];
        }
        eventPool[eventName[i]].push({callback: callback, scope:scope || null});
      }
    };

    Public.getUserInfo = function(){
      var  i, rawUserInfo, userInfo = {}, rawUserInfoString = $.cookie('ideabox');

      rawUserInfo=rawUserInfoString.split("&");
          
      //Read the cookie into userInfo
      for (i = 0; i < rawUserInfo.length; i += 2) {
          userInfo[rawUserInfo[i]] = rawUserInfo[i + 1]
      }
      return userInfo;
    };


    Public.docReady = function (callback) {
      $(document).ready(callback);
    };

    Public.$ = $;

    Public.mergeTemplate = function (template, data) {
      return m.to_html(template, data);
    };

    // our badass recursion f'er
    Private.getTemplates = function (templateArray, callback, templateObj) {
      var templateObj = templateObj || {};

      if (templateArray.length > 0) {
        var tmpl = Private.retrieve(templateArray[0]);

        if (tmpl) {
          templateObj[templateArray[0]] = tmpl;
          templateArray.splice(0,1);
          Private.getTemplates(templateArray, callback, templateObj);
        } else {
          $.get(Private.templateDir + templateArray[0] + '.html', function(template){
            Private.store(templateArray[0], template);
            templateObj[templateArray[0]] = template;
            templateArray.splice(0,1);
            Private.getTemplates(templateArray, callback, templateObj);
          });
        }
      } else {
        callback(templateObj);
      }
    };

    Private.store = function(key, value){
      try {
        win.localStorage.setItem(key, value);
      } catch(e) {}
    };

    Private.retrieve = function(key){
      try {
        win.localStorage.setItem('test','data');
        win.localStorage.removeItem('test');
        return win.localStorage.getItem(key);
      } catch(e){
        return false;
      }
    };

    return Public;
  }());

  win.hb.Core = Core;
}(window, document, jQuery, Mustache));