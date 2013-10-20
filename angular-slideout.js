(function (window, angular, undefined) {
'use strict';

/** (this is an early concept)
  * The slideout directives encapsulate an experience like the one here:
  * http://startbootstrap.com/templates/simple-sidebar
  * Example usage:
  * <slideout-container>
  *   <!-- the content slideout goes inside the slideout-sidebar tag -->
  *   <slideout-sidebar></slideout-sidebar>
  *   <!-- the content of the page goes into the slideout-main-content tag -->
  *   <slideout-main-content></slideout-main-content>
  * </slideout-container>
  */
angular.module('ngSlideout', ['ng'])
  .directive('slideoutContainer', ['SlideoutRegistryService',
    function (SlideoutRegistryService) {
    return {
      template: '<div class="{{ slideoutClass }}" ng-transclude></div>',
      transclude: true,
      replace: true,
      restrict: 'AE',
      scope: {
        slideoutClass: '@',
        name : '@slideoutName',
        visibleClass: '@',
        visible: '@',
        sidebar: '@'
      },
      link: function postLink(scope, element, attrs) {
        scope.element = element;

        attrs.$observe('slideoutClass', function observeClass(cssClass) {
          scope.slideoutClass = cssClass || 'slideout-container';
        });

        attrs.$observe('slideoutName', function observeName(name) {
          SlideoutRegistryService.register(name || '', scope);
        });

        attrs.$observe('slideoutVisibleClass', function (visibleClass) {
          scope.visibleClass = visibleClass || 'active';
        });

        attrs.$observe('slideoutVisible', function observeVisible(visible) {
          var shouldBeVisible = isFlagAttributeOn(visible);
          scope.visible = shouldBeVisible;
        });

        scope.$watch('visible', function watchVisible(shouldBeVisible) {
          if (! scope.element || ! scope.visibleClass) { return false; }
          
          var isCurrentlyVisible = scope.element.hasClass(scope.visibleClass);
          if (shouldBeVisible && ! isCurrentlyVisible) {
            scope.element.addClass(scope.visibleClass);
          }

          if (! shouldBeVisible && isCurrentlyVisible) {
            scope.element.removeClass(scope.visibleClass);
          }

          return false;
        });

        function isFlagAttributeOn(attr) {
          return (typeof attr !== 'undefined' && attr !== null);
        }
      }
    };
  }])
  .directive('slideoutSidebar', ['SlideoutRegistryService',
    function (SlideoutRegistryService) {
    return {
      template: '<div class="{{ slideoutClass }}" ng-transclude></div>',
      transclude: true,
      replace: true,
      restrict: 'AE',
      scope: {
        slideoutClass: '@',
        name : '@'
      },
      link: function postLink(scope, element, attrs) {
        scope.element = element;

        attrs.$observe('slideoutClass', function observeClass(cssClass) {
          scope.slideoutClass = cssClass || 'slideout-sidebar';
        });

        attrs.$observe('name', function observeName(name) {
          SlideoutRegistryService.locate(name || '',
            function onSlideoutLocate(error, $slideoutScope) {
            // TODO: this is future-proofing... take it out?
            $slideoutScope.sidebar = scope;
          });
        });
      }
    };
  }])
  .directive('slideoutToggle', ['SlideoutRegistryService',
    function (SlideoutRegistryService) {
    return {
      template: '<div class="{{ slideoutClass }}" ng-transclude></div>',
      transclude: true,
      replace: true,
      restrict: 'AE',
      scope: {
        name : '@slideoutName'
      },
      link: function postLink(scope, element, attrs) {
        attrs.$observe('slideoutClass', function observeClass(cssClass) {
          scope.slideoutClass = cssClass || 'slideout-toggle';
        });

        attrs.$observe('slideoutName', function observeName(name) {
          SlideoutRegistryService.locate(name || '',
            function onSlideoutLocate(error, $slideoutScope) {
            element.click(function clickSlideoutToggle(e) {
              e.preventDefault();
              $slideoutScope.$apply(function toggleVisibility() {
                $slideoutScope.visible = ! $slideoutScope.visible;
              });
            });
          });
        });
      }
    };
  }])
  .directive('slideoutMainContent', ['SlideoutRegistryService',
    function (SlideoutRegistryService) {
    return {
      template: '<div class="{{ slideoutClass }}" ng-transclude></div>',
      transclude: true,
      replace: true,
      restrict: 'AE',
      scope: {
        name : '@slideoutName'
      },
      link: function postLink(scope, element, attrs) {
        scope.element = element;
        attrs.$observe('slideoutClass', function observeClass(cssClass) {
          scope.slideoutClass = cssClass || 'slideout-main-content';
        });

        attrs.$observe('slideoutName', function observeName(name) {
          SlideoutRegistryService.locate(name,
            function onSlideoutLocate(error, $slideoutScope) {
            // TODO: this is future-proofing... take it out?
            $slideoutScope.content = scope;
          });
        });
      }
    };
  }])
  .service('SlideoutRegistryService', [function SlideoutRegistryService() {
    var slideouts = { };
    var locateRequests = { };

    this.locate = function locateSlideout(name, callback) {
      var slideout = slideouts[name];
      if (! slideout) { // not yet registered, queue the request
        return queueLocateRequest(name, callback);
      } else { // registered, dispatch immediately
        return dispatchLocateRequest(slideout, callback);
      }
    };

    this.register = function registerSlideout(name, slideout) {
      if (name in slideouts) { return false; }
      slideouts[name] = slideout;
      return dispatchAllLocateRequests(name, slideout);
    };

    this.unregister = function unregisterSlideout(name) {
      var slideout = slideouts[name];
      if (!! slideout) { delete slideouts[name]; }
      return slideout;
    };


    function dispatchAllLocateRequests(name, slideout) {
      var callback, requests = locateRequests[name] || [ ];

      while ((callback = requests.shift())) {
        dispatchLocateRequest(slideout, callback);
      }

      return true;
    }

    function dispatchLocateRequest(slideout, callback) {
      return callback(null, slideout);
    }

    function queueLocateRequest(name, callback) {
      if (! (name in locateRequests)) { locateRequests[name] = [ ]; }
      locateRequests[name].push(callback);
      return true;
    }
  }]);
})(window, window.angular);
