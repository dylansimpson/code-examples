(function(Module){
  /**
   * Defines a Module "filter"
   *
   * @param {string} The name of the Module
   * @param {string|array} The name(s) of our template file (without .html extension)
   * @param {function} The Module Creator (callback to Core)
   */
  Module.register("moduleName", "templateName(s)", function(Sandbox){
    var Public = {},
        Private = {};

    /**
     * Our Module Initialization function - called when Core calls .start('filter') or .startAll()
     *
     * @param {object} Our templates object which has a property assigned to it for each template name passed in during register()
     */
    Public.init = function(templates) {

    };

    /**
     * Our Module's destroy method - called when Core calls .stop('filter') or .stopAll()
     */
    Public.destroy = function(){};

    return Public;
}(hb.Core));