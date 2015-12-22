/*
 ngprogress 1.1.2 - slim, site-wide progressbar for AngularJS
 (C) 2013 - Victor Bjelkholm
 License: MIT
 Source: https://github.com/VictorBjelkholm/ngProgress
 Date Compiled: 2015-07-27
 */
angular.module('ngProgress.provider', ['ngProgress.directive'])
  .service('ngProgress', function () {
    'use strict';
    return ['$document', '$window', '$compile', '$rootScope', '$timeout', function($document, $window, $compile, $rootScope, $timeout) {
      this.autoStyle = true;
      this.count = 0;
      this.height = '2px';
      this.$scope = $rootScope.$new();
      this.color = 'firebrick';
      this.parent = $document.find('body')[0];
      this.count = 0;

      // Compile the directive
      this.progressbarEl = $compile('<ng-progress></ng-progress>')(this.$scope);
      // Add the element to body
      this.parent.appendChild(this.progressbarEl[0]);
      // Set the initial height
      this.$scope.count = this.count;
      // If height or color isn't undefined, set the height, background-color and color.
      if (this.height !== undefined) {
        this.progressbarEl.eq(0).children().css('height', this.height);
      }
      if (this.color !== undefined) {
        this.progressbarEl.eq(0).children().css('background-color', this.color);
        this.progressbarEl.eq(0).children().css('color', this.color);
      }
      // The ID for the interval controlling start()
      this.intervalCounterId = 0;

      // Starts the animation and adds between 0 - 5 percent to loading
      // each 400 milliseconds. Should always be finished with progressbar.complete()
      // to hide it
      this.start = function () {
        // TODO Use requestAnimationFrame instead of setInterval
        // https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
        this.show();
        var self = this;
        clearInterval(this.intervalCounterId);
        this.intervalCounterId = setInterval(function () {
          if (isNaN(self.count)) {
            clearInterval(self.intervalCounterId);
            self.count = 0;
            self.hide();
          } else {
            self.remaining = 100 - self.count;
            self.count = self.count + (0.15 * Math.pow(1 - Math.sqrt(self.remaining), 2));
            self.updateCount(self.count);
          }
        }, 200);
      };
      this.updateCount = function (new_count) {
        this.$scope.count = new_count;
        if(!this.$scope.$$phase) {
          this.$scope.$apply();
        }
      };
      // Sets the height of the progressbar. Use any valid CSS value
      // Eg '10px', '1em' or '1%'
      this.setHeight = function (new_height) {
        if (new_height !== undefined) {
          this.height = new_height;
          this.$scope.height = this.height;
          if(!this.$scope.$$phase) {
            this.$scope.$apply();
          }
        }
        return this.height;
      };
      // Sets the color of the progressbar and it's shadow. Use any valid HTML
      // color
      this.setColor = function(new_color) {
        if (new_color !== undefined) {
          this.color = new_color;
          this.$scope.color = this.color;
          if(!this.$scope.$$phase) {
            this.$scope.$apply();
          }
        }
        return this.color;
      };
      this.hide = function() {
        this.progressbarEl.children().css('opacity', '0');
        var self = this;
        self.animate(function () {
          self.progressbarEl.children().css('width', '0%');
          self.animate(function () {
            self.show();
          }, 500);
        }, 500);
      };
      this.show = function () {
        var self = this;
        self.animate(function () {
          self.progressbarEl.children().css('opacity', '1');
        }, 100);
      };
      // Cancel any prior animations before running new ones.
      // Multiple simultaneous animations just look weird.
      this.animate = function(fn, time) {
        if(this.animation !== undefined) { $timeout.cancel(this.animation); }
        this.animation = $timeout(fn, time);
      };
      // Returns on how many percent the progressbar is at. Should'nt be needed
      this.status = function () {
        return this.count;
      };
      // Stops the progressbar at it's current location
      this.stop = function () {
        clearInterval(this.intervalCounterId);
      };
      // Set's the progressbar percentage. Use a number between 0 - 100.
      // If 100 is provided, complete will be called.
      this.set = function (new_count) {
        this.show();
        this.updateCount(new_count);
        this.count = new_count;
        clearInterval(this.intervalCounterId);
        return this.count;
      };
      this.css = function (args) {
        return this.progressbarEl.children().css(args);
      };
      // Resets the progressbar to percetage 0 and therefore will be hided after
      // it's rollbacked
      this.reset = function () {
        clearInterval(this.intervalCounterId);
        this.count = 0;
        this.updateCount(this.count);
        return 0;
      };
      // Jumps to 100% progress and fades away progressbar.
      this.complete = function () {
        this.count = 100;
        this.updateCount(this.count);
        var self = this;
        clearInterval(this.intervalCounterId);
        $timeout(function () {
          self.hide();
          $timeout(function () {
            self.count = 0;
            self.updateCount(self.count);
          }, 500);
        }, 1000);
        return this.count;
      };
      // Set the parent of the directive, sometimes body is not sufficient
      this.setParent = function(newParent) {
        if(newParent === null || newParent === undefined) {
          throw new Error('Provide a valid parent of type HTMLElement');
        }

        if(this.parent !== null && this.parent !== undefined) {
          this.parent.removeChild(this.progressbarEl[0]);
        }

        this.parent = newParent;
        this.parent.appendChild(this.progressbarEl[0]);
      };
      // Gets the current element the progressbar is attached to
      this.getDomElement = function () {
        return this.progressbarEl;
      };
      this.setAbsolute = function() {
        this.progressbarEl.css('position', 'absolute');
      };
    }];
  })
  .factory('ngProgressFactory', ['$injector', 'ngProgress', function($injector, ngProgress) {
    var service = {
      createInstance: function () {
        return $injector.instantiate(ngProgress);
      }
    };
    return service;
  }]);
angular.module('ngProgress.directive', [])
  .directive('ngProgress', ["$window", "$rootScope", function ($window, $rootScope) {
    var directiveObj = {
      // Replace the directive
      replace: true,
      // Only use as a element
      restrict: 'E',
      link: function ($scope, $element, $attrs, $controller) {
        // Watch the count on the $rootScope. As soon as count changes to something that
        // isn't undefined or null, change the counter on $scope and also the width of
        // the progressbar. The same goes for color and height on the $rootScope
        $scope.$watch('count', function (newVal) {
          if (newVal !== undefined || newVal !== null) {
            $scope.counter = newVal;
            $element.eq(0).children().css('width', newVal + '%');
          }
        });
        $scope.$watch('color', function (newVal) {
          if (newVal !== undefined || newVal !== null) {
            $scope.color = newVal;
            $element.eq(0).children().css('background-color', newVal);
            $element.eq(0).children().css('color', newVal);
          }
        });
        $scope.$watch('height', function (newVal) {
          if (newVal !== undefined || newVal !== null) {
            $scope.height = newVal;
            $element.eq(0).children().css('height', newVal);
          }
        });
      },
      // The actual html that will be used
      template: '<div id="ngProgress-container"><div id="ngProgress"></div></div>'
    };
    return directiveObj;
  }]);

angular.module('ngProgress', ['ngProgress.directive', 'ngProgress.provider']);

/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */

;(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.NProgress = factory();
  }

})(this, function() {
  var NProgress = {};

  NProgress.version = '0.2.0';

  var Settings = NProgress.settings = {
    minimum: 0.08,
    easing: 'ease',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleRate: 0.02,
    trickleSpeed: 800,
    showSpinner: true,
    barSelector: '[role="bar"]',
    spinnerSelector: '[role="spinner"]',
    parent: 'body',
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
  };

  /**
   * Updates configuration.
   *
   *     NProgress.configure({
   *       minimum: 0.1
   *     });
   */
  NProgress.configure = function(options) {
    var key, value;
    for (key in options) {
      value = options[key];
      if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
    }

    return this;
  };

  /**
   * Last number.
   */

  NProgress.status = null;

  /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set = function(n) {
    var started = NProgress.isStarted();

    n = clamp(n, Settings.minimum, 1);
    NProgress.status = (n === 1 ? null : n);

    var progress = NProgress.render(!started),
      bar      = progress.querySelector(Settings.barSelector),
      speed    = Settings.speed,
      ease     = Settings.easing;

    progress.offsetWidth; /* Repaint */

    queue(function(next) {
      // Set positionUsing if it hasn't already been set
      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

      // Add transition
      css(bar, barPositionCSS(n, speed, ease));

      if (n === 1) {
        // Fade out
        css(progress, {
          transition: 'none',
          opacity: 1
        });
        progress.offsetWidth; /* Repaint */

        setTimeout(function() {
          css(progress, {
            transition: 'all ' + speed + 'ms linear',
            opacity: 0
          });
          setTimeout(function() {
            NProgress.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  };

  NProgress.isStarted = function() {
    return typeof NProgress.status === 'number';
  };

  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {
    if (!NProgress.status) NProgress.set(0);

    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return;
        NProgress.trickle();
        work();
      }, Settings.trickleSpeed);
    };

    if (Settings.trickle) work();

    return this;
  };

  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   *
   *     NProgress.done(true);
   */

  NProgress.done = function(force) {
    if (!force && !NProgress.status) return this;

    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };

  /**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;

    if (!n) {
      return NProgress.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return NProgress.set(n);
    }
  };

  NProgress.trickle = function() {
    return NProgress.inc(Math.random() * Settings.trickleRate);
  };

  /**
   * Waits for all supplied jQuery promises and
   * increases the progress as the promises resolve.
   *
   * @param $promise jQUery Promise
   */
  (function() {
    var initial = 0, current = 0;

    NProgress.promise = function($promise) {
      if (!$promise || $promise.state() === "resolved") {
        return this;
      }

      if (current === 0) {
        NProgress.start();
      }

      initial++;
      current++;

      $promise.always(function() {
        current--;
        if (current === 0) {
          initial = 0;
          NProgress.done();
        } else {
          NProgress.set((initial - current) / initial);
        }
      });

      return this;
    };

  })();

  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function(fromStart) {
    if (NProgress.isRendered()) return document.getElementById('nprogress');

    addClass(document.documentElement, 'nprogress-busy');

    var progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = Settings.template;

    var bar      = progress.querySelector(Settings.barSelector),
      perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
      parent   = document.querySelector(Settings.parent),
      spinner;

    css(bar, {
      transition: 'all 0 linear',
      transform: 'translate3d(' + perc + '%,0,0)'
    });

    if (!Settings.showSpinner) {
      spinner = progress.querySelector(Settings.spinnerSelector);
      spinner && removeElement(spinner);
    }

    if (parent != document.body) {
      addClass(parent, 'nprogress-custom-parent');
    }

    parent.appendChild(progress);
    return progress;
  };

  /**
   * Removes the element. Opposite of render().
   */

  NProgress.remove = function() {
    removeClass(document.documentElement, 'nprogress-busy');
    removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent');
    var progress = document.getElementById('nprogress');
    progress && removeElement(progress);
  };

  /**
   * Checks if the progress bar is rendered.
   */

  NProgress.isRendered = function() {
    return !!document.getElementById('nprogress');
  };

  /**
   * Determine which positioning CSS rule to use.
   */

  NProgress.getPositioningCSS = function() {
    // Sniff on document.body.style
    var bodyStyle = document.body.style;

    // Sniff prefixes
    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
      ('MozTransform' in bodyStyle) ? 'Moz' :
        ('msTransform' in bodyStyle) ? 'ms' :
          ('OTransform' in bodyStyle) ? 'O' : '';

    if (vendorPrefix + 'Perspective' in bodyStyle) {
      // Modern browsers with 3D support, e.g. Webkit, IE10
      return 'translate3d';
    } else if (vendorPrefix + 'Transform' in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return 'translate';
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return 'margin';
    }
  };

  /**
   * Helpers
   */

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */

  function toBarPerc(n) {
    return (-1 + n) * 100;
  }


  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */

  function barPositionCSS(n, speed, ease) {
    var barCSS;

    if (Settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (Settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }

  /**
   * (Internal) Queues a function to be executed.
   */

  var queue = (function() {
    var pending = [];

    function next() {
      var fn = pending.shift();
      if (fn) {
        fn(next);
      }
    }

    return function(fn) {
      pending.push(fn);
      if (pending.length == 1) next();
    };
  })();

  /**
   * (Internal) Applies css properties to an element, similar to the jQuery
   * css method.
   *
   * While this helper does assist with vendor prefixed property names, it
   * does not perform any manipulation of values prior to setting styles.
   */

  var css = (function() {
    var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
      cssProps    = {};

    function camelCase(string) {
      return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
        return letter.toUpperCase();
      });
    }

    function getVendorProp(name) {
      var style = document.body.style;
      if (name in style) return name;

      var i = cssPrefixes.length,
        capName = name.charAt(0).toUpperCase() + name.slice(1),
        vendorName;
      while (i--) {
        vendorName = cssPrefixes[i] + capName;
        if (vendorName in style) return vendorName;
      }

      return name;
    }

    function getStyleProp(name) {
      name = camelCase(name);
      return cssProps[name] || (cssProps[name] = getVendorProp(name));
    }

    function applyCss(element, prop, value) {
      prop = getStyleProp(prop);
      element.style[prop] = value;
    }

    return function(element, properties) {
      var args = arguments,
        prop,
        value;

      if (args.length == 2) {
        for (prop in properties) {
          value = properties[prop];
          if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
        }
      } else {
        applyCss(element, args[1], args[2]);
      }
    }
  })();

  /**
   * (Internal) Determines if an element or space separated list of class names contains a class name.
   */

  function hasClass(element, name) {
    var list = typeof element == 'string' ? element : classList(element);
    return list.indexOf(' ' + name + ' ') >= 0;
  }

  /**
   * (Internal) Adds a class to an element.
   */

  function addClass(element, name) {
    var oldList = classList(element),
      newList = oldList + name;

    if (hasClass(oldList, name)) return;

    // Trim the opening space.
    element.className = newList.substring(1);
  }

  /**
   * (Internal) Removes a class from an element.
   */

  function removeClass(element, name) {
    var oldList = classList(element),
      newList;

    if (!hasClass(element, name)) return;

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }

  /**
   * (Internal) Gets a space separated list of the class names on the element.
   * The list is wrapped with a single space on each end to facilitate finding
   * matches within the list.
   */

  function classList(element) {
    return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  /**
   * (Internal) Removes an element from the DOM.
   */

  function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
  }

  return NProgress;
});
