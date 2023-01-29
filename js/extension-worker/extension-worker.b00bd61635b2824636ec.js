/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../../node_modules/ts-loader/index.js!../../node_modules/scratch-vm/src/extension-support/extension-worker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../node_modules/microee/index.js":
/*!*********************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/microee/index.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function M() { this._events = {}; }
M.prototype = {
  on: function(ev, cb) {
    this._events || (this._events = {});
    var e = this._events;
    (e[ev] || (e[ev] = [])).push(cb);
    return this;
  },
  removeListener: function(ev, cb) {
    var e = this._events[ev] || [], i;
    for(i = e.length-1; i >= 0 && e[i]; i--){
      if(e[i] === cb || e[i].cb === cb) { e.splice(i, 1); }
    }
  },
  removeAllListeners: function(ev) {
    if(!ev) { this._events = {}; }
    else { this._events[ev] && (this._events[ev] = []); }
  },
  listeners: function(ev) {
    return (this._events ? this._events[ev] || [] : []);
  },
  emit: function(ev) {
    this._events || (this._events = {});
    var args = Array.prototype.slice.call(arguments, 1), i, e = this._events[ev] || [];
    for(i = e.length-1; i >= 0 && e[i]; i--){
      e[i].apply(this, args);
    }
    return this;
  },
  when: function(ev, cb) {
    return this.once(ev, cb, true);
  },
  once: function(ev, cb, when) {
    if(!cb) return this;
    function c() {
      if(!when) this.removeListener(ev, c);
      if(cb.apply(this, arguments) && when) this.removeListener(ev, c);
    }
    c.cb = cb;
    this.on(ev, c);
    return this;
  }
};
M.mixin = function(dest) {
  var o = M.prototype, k;
  for (k in o) {
    o.hasOwnProperty(k) && (dest.prototype[k] = o[k]);
  }
};
module.exports = M;


/***/ }),

/***/ "../../node_modules/minilog/lib/common/filter.js":
/*!*********************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/common/filter.js ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// default filter
var Transform = __webpack_require__(/*! ./transform.js */ "../../node_modules/minilog/lib/common/transform.js");

var levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

function Filter() {
  this.enabled = true;
  this.defaultResult = true;
  this.clear();
}

Transform.mixin(Filter);

// allow all matching, with level >= given level
Filter.prototype.allow = function(name, level) {
  this._white.push({ n: name, l: levelMap[level] });
  return this;
};

// deny all matching, with level <= given level
Filter.prototype.deny = function(name, level) {
  this._black.push({ n: name, l: levelMap[level] });
  return this;
};

Filter.prototype.clear = function() {
  this._white = [];
  this._black = [];
  return this;
};

function test(rule, name) {
  // use .test for RegExps
  return (rule.n.test ? rule.n.test(name) : rule.n == name);
};

Filter.prototype.test = function(name, level) {
  var i, len = Math.max(this._white.length, this._black.length);
  for(i = 0; i < len; i++) {
    if(this._white[i] && test(this._white[i], name) && levelMap[level] >= this._white[i].l) {
      return true;
    }
    if(this._black[i] && test(this._black[i], name) && levelMap[level] <= this._black[i].l) {
      return false;
    }
  }
  return this.defaultResult;
};

Filter.prototype.write = function(name, level, args) {
  if(!this.enabled || this.test(name, level)) {
    return this.emit('item', name, level, args);
  }
};

module.exports = Filter;


/***/ }),

/***/ "../../node_modules/minilog/lib/common/minilog.js":
/*!**********************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/common/minilog.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(/*! ./transform.js */ "../../node_modules/minilog/lib/common/transform.js"),
    Filter = __webpack_require__(/*! ./filter.js */ "../../node_modules/minilog/lib/common/filter.js");

var log = new Transform(),
    slice = Array.prototype.slice;

exports = module.exports = function create(name) {
  var o   = function() { log.write(name, undefined, slice.call(arguments)); return o; };
  o.debug = function() { log.write(name, 'debug', slice.call(arguments)); return o; };
  o.info  = function() { log.write(name, 'info',  slice.call(arguments)); return o; };
  o.warn  = function() { log.write(name, 'warn',  slice.call(arguments)); return o; };
  o.error = function() { log.write(name, 'error', slice.call(arguments)); return o; };
  o.log   = o.debug; // for interface compliance with Node and browser consoles
  o.suggest = exports.suggest;
  o.format = log.format;
  return o;
};

// filled in separately
exports.defaultBackend = exports.defaultFormatter = null;

exports.pipe = function(dest) {
  return log.pipe(dest);
};

exports.end = exports.unpipe = exports.disable = function(from) {
  return log.unpipe(from);
};

exports.Transform = Transform;
exports.Filter = Filter;
// this is the default filter that's applied when .enable() is called normally
// you can bypass it completely and set up your own pipes
exports.suggest = new Filter();

exports.enable = function() {
  if(exports.defaultFormatter) {
    return log.pipe(exports.suggest) // filter
              .pipe(exports.defaultFormatter) // formatter
              .pipe(exports.defaultBackend); // backend
  }
  return log.pipe(exports.suggest) // filter
            .pipe(exports.defaultBackend); // formatter
};



/***/ }),

/***/ "../../node_modules/minilog/lib/common/transform.js":
/*!************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/common/transform.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var microee = __webpack_require__(/*! microee */ "../../node_modules/microee/index.js");

// Implements a subset of Node's stream.Transform - in a cross-platform manner.
function Transform() {}

microee.mixin(Transform);

// The write() signature is different from Node's
// --> makes it much easier to work with objects in logs.
// One of the lessons from v1 was that it's better to target
// a good browser rather than the lowest common denominator
// internally.
// If you want to use external streams, pipe() to ./stringify.js first.
Transform.prototype.write = function(name, level, args) {
  this.emit('item', name, level, args);
};

Transform.prototype.end = function() {
  this.emit('end');
  this.removeAllListeners();
};

Transform.prototype.pipe = function(dest) {
  var s = this;
  // prevent double piping
  s.emit('unpipe', dest);
  // tell the dest that it's being piped to
  dest.emit('pipe', s);

  function onItem() {
    dest.write.apply(dest, Array.prototype.slice.call(arguments));
  }
  function onEnd() { !dest._isStdio && dest.end(); }

  s.on('item', onItem);
  s.on('end', onEnd);

  s.when('unpipe', function(from) {
    var match = (from === dest) || typeof from == 'undefined';
    if(match) {
      s.removeListener('item', onItem);
      s.removeListener('end', onEnd);
      dest.emit('unpipe');
    }
    return match;
  });

  return dest;
};

Transform.prototype.unpipe = function(from) {
  this.emit('unpipe', from);
  return this;
};

Transform.prototype.format = function(dest) {
  throw new Error([
    'Warning: .format() is deprecated in Minilog v2! Use .pipe() instead. For example:',
    'var Minilog = require(\'minilog\');',
    'Minilog',
    '  .pipe(Minilog.backends.console.formatClean)',
    '  .pipe(Minilog.backends.console);'].join('\n'));
};

Transform.mixin = function(dest) {
  var o = Transform.prototype, k;
  for (k in o) {
    o.hasOwnProperty(k) && (dest.prototype[k] = o[k]);
  }
};

module.exports = Transform;


/***/ }),

/***/ "../../node_modules/minilog/lib/web/array.js":
/*!*****************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/array.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(/*! ../common/transform.js */ "../../node_modules/minilog/lib/common/transform.js"),
    cache = [ ];

var logger = new Transform();

logger.write = function(name, level, args) {
  cache.push([ name, level, args ]);
};

// utility functions
logger.get = function() { return cache; };
logger.empty = function() { cache = []; };

module.exports = logger;


/***/ }),

/***/ "../../node_modules/minilog/lib/web/console.js":
/*!*******************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/console.js ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(/*! ../common/transform.js */ "../../node_modules/minilog/lib/common/transform.js");

var newlines = /\n+$/,
    logger = new Transform();

logger.write = function(name, level, args) {
  var i = args.length-1;
  if (typeof console === 'undefined' || !console.log) {
    return;
  }
  if(console.log.apply) {
    return console.log.apply(console, [name, level].concat(args));
  } else if(JSON && JSON.stringify) {
    // console.log.apply is undefined in IE8 and IE9
    // for IE8/9: make console.log at least a bit less awful
    if(args[i] && typeof args[i] == 'string') {
      args[i] = args[i].replace(newlines, '');
    }
    try {
      for(i = 0; i < args.length; i++) {
        args[i] = JSON.stringify(args[i]);
      }
    } catch(e) {}
    console.log(args.join(' '));
  }
};

logger.formatters = ['color', 'minilog'];
logger.color = __webpack_require__(/*! ./formatters/color.js */ "../../node_modules/minilog/lib/web/formatters/color.js");
logger.minilog = __webpack_require__(/*! ./formatters/minilog.js */ "../../node_modules/minilog/lib/web/formatters/minilog.js");

module.exports = logger;


/***/ }),

/***/ "../../node_modules/minilog/lib/web/formatters/color.js":
/*!****************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/formatters/color.js ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(/*! ../../common/transform.js */ "../../node_modules/minilog/lib/common/transform.js"),
    color = __webpack_require__(/*! ./util.js */ "../../node_modules/minilog/lib/web/formatters/util.js");

var colors = { debug: ['cyan'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] },
    logger = new Transform();

logger.write = function(name, level, args) {
  var fn = console.log;
  if(console[level] && console[level].apply) {
    fn = console[level];
    fn.apply(console, [ '%c'+name+' %c'+level, color('gray'), color.apply(color, colors[level])].concat(args));
  }
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;


/***/ }),

/***/ "../../node_modules/minilog/lib/web/formatters/minilog.js":
/*!******************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/formatters/minilog.js ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(/*! ../../common/transform.js */ "../../node_modules/minilog/lib/common/transform.js"),
    color = __webpack_require__(/*! ./util.js */ "../../node_modules/minilog/lib/web/formatters/util.js"),
    colors = { debug: ['gray'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] },
    logger = new Transform();

logger.write = function(name, level, args) {
  var fn = console.log;
  if(level != 'debug' && console[level]) {
    fn = console[level];
  }

  var subset = [], i = 0;
  if(level != 'info') {
    for(; i < args.length; i++) {
      if(typeof args[i] != 'string') break;
    }
    fn.apply(console, [ '%c'+name +' '+ args.slice(0, i).join(' '), color.apply(color, colors[level]) ].concat(args.slice(i)));
  } else {
    fn.apply(console, [ '%c'+name, color.apply(color, colors[level]) ].concat(args));
  }
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;


/***/ }),

/***/ "../../node_modules/minilog/lib/web/formatters/util.js":
/*!***************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/formatters/util.js ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var hex = {
  black: '#000',
  red: '#c23621',
  green: '#25bc26',
  yellow: '#bbbb00',
  blue:  '#492ee1',
  magenta: '#d338d3',
  cyan: '#33bbc8',
  gray: '#808080',
  purple: '#708'
};
function color(fg, isInverse) {
  if(isInverse) {
    return 'color: #fff; background: '+hex[fg]+';';
  } else {
    return 'color: '+hex[fg]+';';
  }
}

module.exports = color;


/***/ }),

/***/ "../../node_modules/minilog/lib/web/index.js":
/*!*****************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/index.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Minilog = __webpack_require__(/*! ../common/minilog.js */ "../../node_modules/minilog/lib/common/minilog.js");

var oldEnable = Minilog.enable,
    oldDisable = Minilog.disable,
    isChrome = (typeof navigator != 'undefined' && /chrome/i.test(navigator.userAgent)),
    console = __webpack_require__(/*! ./console.js */ "../../node_modules/minilog/lib/web/console.js");

// Use a more capable logging backend if on Chrome
Minilog.defaultBackend = (isChrome ? console.minilog : console);

// apply enable inputs from localStorage and from the URL
if(typeof window != 'undefined') {
  try {
    Minilog.enable(JSON.parse(window.localStorage['minilogSettings']));
  } catch(e) {}
  if(window.location && window.location.search) {
    var match = RegExp('[?&]minilog=([^&]*)').exec(window.location.search);
    match && Minilog.enable(decodeURIComponent(match[1]));
  }
}

// Make enable also add to localStorage
Minilog.enable = function() {
  oldEnable.call(Minilog, true);
  try { window.localStorage['minilogSettings'] = JSON.stringify(true); } catch(e) {}
  return this;
};

Minilog.disable = function() {
  oldDisable.call(Minilog);
  try { delete window.localStorage.minilogSettings; } catch(e) {}
  return this;
};

exports = module.exports = Minilog;

exports.backends = {
  array: __webpack_require__(/*! ./array.js */ "../../node_modules/minilog/lib/web/array.js"),
  browser: Minilog.defaultBackend,
  localStorage: __webpack_require__(/*! ./localstorage.js */ "../../node_modules/minilog/lib/web/localstorage.js"),
  jQuery: __webpack_require__(/*! ./jquery_simple.js */ "../../node_modules/minilog/lib/web/jquery_simple.js")
};


/***/ }),

/***/ "../../node_modules/minilog/lib/web/jquery_simple.js":
/*!*************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/jquery_simple.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(/*! ../common/transform.js */ "../../node_modules/minilog/lib/common/transform.js");

var cid = new Date().valueOf().toString(36);

function AjaxLogger(options) {
  this.url = options.url || '';
  this.cache = [];
  this.timer = null;
  this.interval = options.interval || 30*1000;
  this.enabled = true;
  this.jQuery = window.jQuery;
  this.extras = {};
}

Transform.mixin(AjaxLogger);

AjaxLogger.prototype.write = function(name, level, args) {
  if(!this.timer) { this.init(); }
  this.cache.push([name, level].concat(args));
};

AjaxLogger.prototype.init = function() {
  if(!this.enabled || !this.jQuery) return;
  var self = this;
  this.timer = setTimeout(function() {
    var i, logs = [], ajaxData, url = self.url;
    if(self.cache.length == 0) return self.init();
    // Test each log line and only log the ones that are valid (e.g. don't have circular references).
    // Slight performance hit but benefit is we log all valid lines.
    for(i = 0; i < self.cache.length; i++) {
      try {
        JSON.stringify(self.cache[i]);
        logs.push(self.cache[i]);
      } catch(e) { }
    }
    if(self.jQuery.isEmptyObject(self.extras)) {
        ajaxData = JSON.stringify({ logs: logs });
        url = self.url + '?client_id=' + cid;
    } else {
        ajaxData = JSON.stringify(self.jQuery.extend({logs: logs}, self.extras));
    }

    self.jQuery.ajax(url, {
      type: 'POST',
      cache: false,
      processData: false,
      data: ajaxData,
      contentType: 'application/json',
      timeout: 10000
    }).success(function(data, status, jqxhr) {
      if(data.interval) {
        self.interval = Math.max(1000, data.interval);
      }
    }).error(function() {
      self.interval = 30000;
    }).always(function() {
      self.init();
    });
    self.cache = [];
  }, this.interval);
};

AjaxLogger.prototype.end = function() {};

// wait until jQuery is defined. Useful if you don't control the load order.
AjaxLogger.jQueryWait = function(onDone) {
  if(typeof window !== 'undefined' && (window.jQuery || window.$)) {
    return onDone(window.jQuery || window.$);
  } else if (typeof window !== 'undefined') {
    setTimeout(function() { AjaxLogger.jQueryWait(onDone); }, 200);
  }
};

module.exports = AjaxLogger;


/***/ }),

/***/ "../../node_modules/minilog/lib/web/localstorage.js":
/*!************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/minilog/lib/web/localstorage.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Transform = __webpack_require__(/*! ../common/transform.js */ "../../node_modules/minilog/lib/common/transform.js"),
    cache = false;

var logger = new Transform();

logger.write = function(name, level, args) {
  if(typeof window == 'undefined' || typeof JSON == 'undefined' || !JSON.stringify || !JSON.parse) return;
  try {
    if(!cache) { cache = (window.localStorage.minilog ? JSON.parse(window.localStorage.minilog) : []); }
    cache.push([ new Date().toString(), name, level, args ]);
    window.localStorage.minilog = JSON.stringify(cache);
  } catch(e) {}
};

module.exports = logger;

/***/ }),

/***/ "../../node_modules/scratch-vm/src/dispatch/shared-dispatch.ts":
/*!***********************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/dispatch/shared-dispatch.ts ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __importDefault(__webpack_require__(/*! ../util/log */ "../../node_modules/scratch-vm/src/util/log.ts"));
/**
 * @typedef {DispatchCallMessage|DispatchResponseMessage} DispatchMessage
 * Any message to the dispatch system.
 */
/**
 * The SharedDispatch class is responsible for dispatch features shared by
 * {@link CentralDispatch} and {@link WorkerDispatch}.
 */
class SharedDispatch {
    constructor() {
        /**
         * List of callback registrations for promises waiting for a response from a call to a service on another
         * worker. A callback registration is an array of [resolve,reject] Promise functions.
         * Calls to local services don't enter this list.
         * @type {Array.<Function[]>}
         */
        this.callbacks = [];
        /**
         * The next response ID to be used.
         * @type {int}
         */
        this.nextResponseId = 0;
    }
    /**
     * Call a particular method on a particular service, regardless of whether that service is provided locally or on
     * a worker. If the service is provided by a worker, the `args` will be copied using the Structured Clone
     * algorithm, except for any items which are also in the `transfer` list. Ownership of those items will be
     * transferred to the worker, and they should not be used after this call.
     * @example
     *      dispatcher.call('vm', 'setData', 'cat', 42);
     *      // this finds the worker for the 'vm' service, then on that worker calls:
     *      vm.setData('cat', 42);
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    call(service, method, ...args) {
        return this.transferCall(service, method, null, ...args);
    }
    /**
     * Call a particular method on a particular service, regardless of whether that service is provided locally or on
     * a worker. If the service is provided by a worker, the `args` will be copied using the Structured Clone
     * algorithm, except for any items which are also in the `transfer` list. Ownership of those items will be
     * transferred to the worker, and they should not be used after this call.
     * @example
     *      dispatcher.transferCall('vm', 'setData', [myArrayBuffer], 'cat', myArrayBuffer);
     *      // this finds the worker for the 'vm' service, transfers `myArrayBuffer` to it, then on that worker calls:
     *      vm.setData('cat', myArrayBuffer);
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {Array} [transfer] - objects to be transferred instead of copied. Must be present in `args` to be useful.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    transferCall(service, method, transfer, ...args) {
        try {
            // @ts-expect-error TS(2339): Property 'provider' does not exist on type 'void'.
            const { provider, isRemote } = this._getServiceProvider(service);
            if (provider) {
                if (isRemote) {
                    return this._remoteTransferCall(provider, service, method, transfer, ...args);
                }
                const result = provider[method].apply(provider, args);
                return Promise.resolve(result);
            }
            return Promise.reject(new Error(`Service not found: ${service}`));
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    /**
     * Check if a particular service lives on another worker.
     * @param {string} service - the service to check.
     * @returns {boolean} - true if the service is remote (calls must cross a Worker boundary), false otherwise.
     * @private
     */
    _isRemoteService(service) {
        // @ts-expect-error TS(2339): Property 'isRemote' does not exist on type 'void'.
        return this._getServiceProvider(service).isRemote;
    }
    /**
     * Like {@link call}, but force the call to be posted through a particular communication channel.
     * @param {object} provider - send the call through this object's `postMessage` function.
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    _remoteCall(provider, service, method, ...args) {
        return this._remoteTransferCall(provider, service, method, null, ...args);
    }
    /**
     * Like {@link transferCall}, but force the call to be posted through a particular communication channel.
     * @param {object} provider - send the call through this object's `postMessage` function.
     * @param {string} service - the name of the service.
     * @param {string} method - the name of the method.
     * @param {Array} [transfer] - objects to be transferred instead of copied. Must be present in `args` to be useful.
     * @param {*} [args] - the arguments to be copied to the method, if any.
     * @returns {Promise} - a promise for the return value of the service method.
     */
    _remoteTransferCall(provider, service, method, transfer, ...args) {
        return new Promise((resolve, reject) => {
            const responseId = this._storeCallbacks(resolve, reject);
            /** @TODO: remove this hack! this is just here so we don't try to send `util` to a worker */
            // tw: upstream's logic is broken
            // Args is actually a 3 length list of [args, util, real block info]
            // We only want to send args. The others will throw errors when they try to be cloned
            if ((args.length > 0) && (typeof args[args.length - 1].func === 'function')) {
                args.pop();
                args.pop();
            }
            if (transfer) {
                provider.postMessage({ service, method, responseId, args }, transfer);
            }
            else {
                provider.postMessage({ service, method, responseId, args });
            }
        });
    }
    /**
     * Store callback functions pending a response message.
     * @param {Function} resolve - function to call if the service method returns.
     * @param {Function} reject - function to call if the service method throws.
     * @returns {*} - a unique response ID for this set of callbacks. See {@link _deliverResponse}.
     * @protected
     */
    _storeCallbacks(resolve, reject) {
        const responseId = this.nextResponseId++;
        this.callbacks[responseId] = [resolve, reject];
        return responseId;
    }
    /**
     * Deliver call response from a worker. This should only be called as the result of a message from a worker.
     * @param {int} responseId - the response ID of the callback set to call.
     * @param {DispatchResponseMessage} message - the message containing the response value(s).
     * @protected
     */
    _deliverResponse(responseId, message) {
        try {
            const [resolve, reject] = this.callbacks[responseId];
            delete this.callbacks[responseId];
            if (message.error) {
                reject(message.error);
            }
            else {
                resolve(message.result);
            }
        }
        catch (e) {
            log_1.default.error(`Dispatch callback failed: ${e}`);
        }
    }
    /**
     * Handle a message event received from a connected worker.
     * @param {Worker} worker - the worker which sent the message, or the global object if running in a worker.
     * @param {MessageEvent} event - the message event to be handled.
     * @protected
     */
    _onMessage(worker, event) {
        /** @type {DispatchMessage} */
        const message = event.data;
        message.args = message.args || [];
        let promise;
        if (message.service) {
            if (message.service === 'dispatch') {
                promise = this._onDispatchMessage(worker, message);
            }
            else {
                promise = this.call(message.service, message.method, ...message.args);
            }
        }
        else if (typeof message.responseId === 'undefined') {
            log_1.default.error(`Dispatch caught malformed message from a worker: ${JSON.stringify(event)}`);
        }
        else {
            this._deliverResponse(message.responseId, message);
        }
        if (promise) {
            if (typeof message.responseId === 'undefined') {
                log_1.default.error(`Dispatch message missing required response ID: ${JSON.stringify(event)}`);
            }
            else {
                promise.then(result => worker.postMessage({ responseId: message.responseId, result }), error => worker.postMessage({ responseId: message.responseId, error: `${error}` }));
            }
        }
    }
    /**
     * Fetch the service provider object for a particular service name.
     * @abstract
     * @param {string} service - the name of the service to look up
     * @returns {{provider:(object|Worker), isRemote:boolean}} - the means to contact the service, if found
     * @protected
     */
    _getServiceProvider(service) {
        throw new Error(`Could not get provider for ${service}: _getServiceProvider not implemented`);
    }
    /**
     * Handle a call message sent to the dispatch service itself
     * @abstract
     * @param {Worker} worker - the worker which sent the message.
     * @param {DispatchCallMessage} message - the message to be handled.
     * @returns {Promise|undefined} - a promise for the results of this operation, if appropriate
     * @private
     */
    _onDispatchMessage(worker, message) {
        throw new Error(`Unimplemented dispatch message handler cannot handle ${message.method} method`);
    }
}
exports.default = SharedDispatch;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/dispatch/worker-dispatch.ts":
/*!***********************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/dispatch/worker-dispatch.ts ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shared_dispatch_1 = __importDefault(__webpack_require__(/*! ./shared-dispatch */ "../../node_modules/scratch-vm/src/dispatch/shared-dispatch.ts"));
const log_1 = __importDefault(__webpack_require__(/*! ../util/log */ "../../node_modules/scratch-vm/src/util/log.ts"));
const tw_extension_worker_context_1 = __webpack_require__(/*! ../extension-support/tw-extension-worker-context */ "../../node_modules/scratch-vm/src/extension-support/tw-extension-worker-context.ts");
/**
 * This class provides a Worker with the means to participate in the message dispatch system managed by CentralDispatch.
 * From any context in the messaging system, the dispatcher's "call" method can call any method on any "service"
 * provided in any participating context. The dispatch system will forward function arguments and return values across
 * worker boundaries as needed.
 * @see {CentralDispatch}
 */
class WorkerDispatch extends shared_dispatch_1.default {
    constructor() {
        super();
        /**
         * Map of service name to local service provider.
         * If a service is not listed here, it is assumed to be provided by another context (another Worker or the main
         * thread).
         * @see {setService}
         * @type {object}
         */
        this.services = {};
        this._connectionPromise = new Promise(resolve => {
            this._onConnect = resolve;
        });
        // @ts-expect-error
        this._onMessage = this._onMessage.bind(this, tw_extension_worker_context_1.centralDispatchService);
        if (typeof self !== 'undefined') {
            // @ts-expect-error
            self.onmessage = this._onMessage;
        }
    }
    /**
     * @returns {Promise} a promise which will resolve upon connection to central dispatch. If you need to make a call
     * immediately on "startup" you can attach a 'then' to this promise.
     * @example
     *      dispatch.waitForConnection.then(() => {
     *          dispatch.call('myService', 'hello');
     *      })
     */
    get waitForConnection() {
        return this._connectionPromise;
    }
    /**
     * Set a local object as the global provider of the specified service.
     * WARNING: Any method on the provider can be called from any worker within the dispatch system.
     * @param {string} service - a globally unique string identifying this service. Examples: 'vm', 'gui', 'extension9'.
     * @param {object} provider - a local object which provides this service.
     * @returns {Promise} - a promise which will resolve once the service is registered.
     */
    setService(service, provider) {
        if (this.services.hasOwnProperty(service)) {
            log_1.default.warn(`Worker dispatch replacing existing service provider for ${service}`);
        }
        this.services[service] = provider;
        return this.waitForConnection.then(() => this._remoteCall(tw_extension_worker_context_1.centralDispatchService, 'dispatch', 'setService', service));
    }
    /**
     * Fetch the service provider object for a particular service name.
     * @override
     * @param {string} service - the name of the service to look up
     * @returns {{provider:(object|Worker), isRemote:boolean}} - the means to contact the service, if found
     * @protected
     */
    _getServiceProvider(service) {
        // if we don't have a local service by this name, contact central dispatch by calling `postMessage` on self
        const provider = this.services[service];
        return {
            provider: provider || tw_extension_worker_context_1.centralDispatchService,
            isRemote: !provider
        };
    }
    /**
     * Handle a call message sent to the dispatch service itself
     * @override
     * @param {Worker} worker - the worker which sent the message.
     * @param {DispatchCallMessage} message - the message to be handled.
     * @returns {Promise|undefined} - a promise for the results of this operation, if appropriate
     * @protected
     */
    _onDispatchMessage(worker, message) {
        let promise;
        switch (message.method) {
            case 'handshake':
                promise = this._onConnect();
                break;
            case 'terminate':
                // Don't close until next tick, after sending confirmation back
                setTimeout(() => self.close(), 0);
                promise = Promise.resolve();
                break;
            default:
                log_1.default.error(`Worker dispatch received message for unknown method: ${message.method}`);
        }
        return promise;
    }
}
exports.default = new WorkerDispatch();


/***/ }),

/***/ "../../node_modules/scratch-vm/src/extension-support/argument-type.ts":
/*!******************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/argument-type.ts ***!
  \******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Block argument types
 * @enum {string}
 */
var ArgumentType;
(function (ArgumentType) {
    /**
     * Numeric value with angle picker
     */
    ArgumentType["ANGLE"] = "angle";
    /**
     * Boolean value with hexagonal placeholder
     */
    ArgumentType["BOOLEAN"] = "Boolean";
    /**
     * Numeric value with color picker
     */
    ArgumentType["COLOR"] = "color";
    /**
     * Numeric value with text field
     */
    ArgumentType["NUMBER"] = "number";
    /**
     * String value with text field
     */
    ArgumentType["STRING"] = "string";
    /**
     * String value with matrix field
     */
    ArgumentType["MATRIX"] = "matrix";
    /**
     * MIDI note number with note picker (piano) field
     */
    ArgumentType["NOTE"] = "note";
    /**
     * Inline image on block (as part of the label)
     */
    ArgumentType["IMAGE"] = "image";
})(ArgumentType || (ArgumentType = {}));
;
exports.default = ArgumentType;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/extension-support/block-type.ts":
/*!***************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/block-type.ts ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Types of block
 * @enum {string}
 */
var BlockType;
(function (BlockType) {
    /**
     * Boolean reporter with hexagonal shape
     */
    BlockType["BOOLEAN"] = "Boolean";
    /**
     * A button (not an actual block) for some special action, like making a variable
     */
    BlockType["BUTTON"] = "button";
    /**
     * Command block
     */
    BlockType["COMMAND"] = "command";
    /**
     * Specialized command block which may or may not run a child branch
     * The thread continues with the next block whether or not a child branch ran.
     */
    BlockType["CONDITIONAL"] = "conditional";
    /**
     * Specialized hat block with no implementation function
     * This stack only runs if the corresponding event is emitted by other code.
     */
    BlockType["EVENT"] = "event";
    /**
     * Hat block which conditionally starts a block stack
     */
    BlockType["HAT"] = "hat";
    /**
     * Specialized command block which may or may not run a child branch
     * If a child branch runs, the thread evaluates the loop block again.
     */
    BlockType["LOOP"] = "loop";
    /**
     * General reporter with numeric or string value
     */
    BlockType["REPORTER"] = "reporter";
})(BlockType || (BlockType = {}));
;
exports.default = BlockType;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/extension-support/target-type.ts":
/*!****************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/target-type.ts ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default types of Target supported by the VM
 * @enum {string}
 */
var TargetType;
(function (TargetType) {
    /**
     * Rendered target which can move, change costumes, etc.
     */
    TargetType["SPRITE"] = "sprite";
    /**
     * Rendered target which cannot move but can change backdrops
     */
    TargetType["STAGE"] = "stage";
})(TargetType || (TargetType = {}));
;
exports.default = TargetType;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/extension-support/tw-extension-api-common.ts":
/*!****************************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/tw-extension-api-common.ts ***!
  \****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argument_type_1 = __importDefault(__webpack_require__(/*! ./argument-type */ "../../node_modules/scratch-vm/src/extension-support/argument-type.ts"));
const block_type_1 = __importDefault(__webpack_require__(/*! ./block-type */ "../../node_modules/scratch-vm/src/extension-support/block-type.ts"));
const target_type_1 = __importDefault(__webpack_require__(/*! ./target-type */ "../../node_modules/scratch-vm/src/extension-support/target-type.ts"));
const cast_1 = __importDefault(__webpack_require__(/*! ../util/cast */ "../../node_modules/scratch-vm/src/util/cast.ts"));
const Scratch = {
    ArgumentType: argument_type_1.default,
    BlockType: block_type_1.default,
    TargetType: target_type_1.default,
    Cast: cast_1.default
};
exports.default = Scratch;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/extension-support/tw-extension-worker-context.ts":
/*!********************************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/tw-extension-worker-context.ts ***!
  \********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.centralDispatchService = exports.isWorker = void 0;
exports.isWorker = true;
// centralDispatchService is the object to call postMessage() on to send a message to parent.
exports.centralDispatchService = self;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/extension-support/tw-scratchx-compatibility-layer.ts":
/*!************************************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/tw-scratchx-compatibility-layer.ts ***!
  \************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.getStatus = exports.register = void 0;
const argument_type_1 = __importDefault(__webpack_require__(/*! ./argument-type */ "../../node_modules/scratch-vm/src/extension-support/argument-type.ts"));
const block_type_1 = __importDefault(__webpack_require__(/*! ./block-type */ "../../node_modules/scratch-vm/src/extension-support/block-type.ts"));
const tw_scratchx_utilities_1 = __webpack_require__(/*! ./tw-scratchx-utilities */ "../../node_modules/scratch-vm/src/extension-support/tw-scratchx-utilities.ts");
/**
 * @typedef ScratchXDescriptor
 * @property {unknown[][]} blocks
 * @property {Record<string, unknown[]>} [menus]
 * @property {string} [url]
 * @property {string} [displayName]
 */
/**
 * @typedef ScratchXStatus
 * @property {0|1|2} status 0 is red/error, 1 is yellow/not ready, 2 is green/ready
 * @property {string} msg
 */
const parseScratchXBlockType = (type) => {
    if (type === '' || type === ' ' || type === 'w') {
        return {
            type: block_type_1.default.COMMAND,
            async: type === 'w'
        };
    }
    if (type === 'r' || type === 'R') {
        return {
            type: block_type_1.default.REPORTER,
            async: type === 'R'
        };
    }
    if (type === 'b') {
        return {
            type: block_type_1.default.BOOLEAN,
            // ScratchX docs don't seem to mention boolean reporters that wait
            async: false
        };
    }
    if (type === 'h') {
        return {
            type: block_type_1.default.HAT,
            async: false
        };
    }
    throw new Error(`Unknown ScratchX block type: ${type}`);
};
const isScratchCompatibleValue = (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
/**
 * @param {string} argument ScratchX argument with leading % removed.
 * @param {unknown} defaultValue Default value, if any
 */
const parseScratchXArgument = (argument, defaultValue) => {
    const result = {};
    const hasDefaultValue = isScratchCompatibleValue(defaultValue);
    if (hasDefaultValue) {
        // @ts-expect-error TS(2339): Property 'defaultValue' does not exist on type '{}... Remove this comment to see the full error message
        result.defaultValue = defaultValue;
    }
    // TODO: ScratchX docs don't mention support for boolean arguments?
    if (argument === 's') {
        // @ts-expect-error TS(2339): Property 'type' does not exist on type '{}'.
        result.type = argument_type_1.default.STRING;
        if (!hasDefaultValue) {
            // @ts-expect-error TS(2339): Property 'defaultValue' does not exist on type '{}... Remove this comment to see the full error message
            result.defaultValue = '';
        }
    }
    else if (argument === 'n') {
        // @ts-expect-error TS(2339): Property 'type' does not exist on type '{}'.
        result.type = argument_type_1.default.NUMBER;
        if (!hasDefaultValue) {
            // @ts-expect-error TS(2339): Property 'defaultValue' does not exist on type '{}... Remove this comment to see the full error message
            result.defaultValue = 0;
        }
    }
    else if (argument[0] === 'm') {
        // @ts-expect-error TS(2339): Property 'type' does not exist on type '{}'.
        result.type = argument_type_1.default.STRING;
        const split = argument.split(/\.|:/);
        const menuName = split[1];
        // @ts-expect-error TS(2339): Property 'menu' does not exist on type '{}'.
        result.menu = menuName;
    }
    else {
        throw new Error(`Unknown ScratchX argument type: ${argument}`);
    }
    return result;
};
const wrapScratchXFunction = (originalFunction, argumentCount, async) => (args) => {
    // Convert Scratch 3's argument object to an argument list expected by ScratchX
    const argumentList = [];
    for (let i = 0; i < argumentCount; i++) {
        argumentList.push(args[(0, tw_scratchx_utilities_1.argumentIndexToId)(i)]);
    }
    if (async) {
        return new Promise(resolve => {
            originalFunction(...argumentList, resolve);
        });
    }
    return originalFunction(...argumentList);
};
/**
 * @param {string} name
 * @param {ScratchXDescriptor} descriptor
 * @param {Record<string, () => unknown>} functions
 */
const convert = (name, descriptor, functions) => {
    const extensionId = (0, tw_scratchx_utilities_1.generateExtensionId)(name);
    const info = {
        id: extensionId,
        name: descriptor.displayName || name,
        blocks: [],
        color1: '#4a4a5e',
        color2: '#31323f',
        color3: '#191a21'
    };
    const scratch3Extension = {
        getInfo: () => info,
        _getStatus: functions._getStatus
    };
    if (descriptor.url) {
        // @ts-expect-error TS(2339): Property 'docsURI' does not exist on type '{ id: s... Remove this comment to see the full error message
        info.docsURI = descriptor.url;
    }
    for (const blockDescriptor of descriptor.blocks) {
        if (blockDescriptor.length === 1) {
            // Separator
            // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
            info.blocks.push('---');
            continue;
        }
        const scratchXBlockType = blockDescriptor[0];
        const blockText = blockDescriptor[1];
        const functionName = blockDescriptor[2];
        const defaultArgumentValues = blockDescriptor.slice(3);
        let scratchText = '';
        const argumentInfo = [];
        const blockTextParts = blockText.split(/%([\w.:]+)/g);
        for (let i = 0; i < blockTextParts.length; i++) {
            const part = blockTextParts[i];
            const isArgument = i % 2 === 1;
            if (isArgument) {
                // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
                parseScratchXArgument(part);
                const argumentIndex = Math.floor(i / 2).toString();
                const argumentDefaultValue = defaultArgumentValues[argumentIndex];
                const argumentId = (0, tw_scratchx_utilities_1.argumentIndexToId)(argumentIndex);
                argumentInfo[argumentId] = parseScratchXArgument(part, argumentDefaultValue);
                scratchText += `[${argumentId}]`;
            }
            else {
                scratchText += part;
            }
        }
        const scratch3BlockType = parseScratchXBlockType(scratchXBlockType);
        const blockInfo = {
            opcode: functionName,
            blockType: scratch3BlockType.type,
            text: scratchText,
            arguments: argumentInfo
        };
        // @ts-expect-error TS(2345): Argument of type '{ opcode: any; blockType: string... Remove this comment to see the full error message
        info.blocks.push(blockInfo);
        const originalFunction = functions[functionName];
        const argumentCount = argumentInfo.length;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        scratch3Extension[functionName] = wrapScratchXFunction(originalFunction, argumentCount, scratch3BlockType.async);
    }
    const menus = descriptor.menus;
    if (menus) {
        const scratch3Menus = {};
        for (const menuName of Object.keys(menus) || {}) {
            const menuItems = menus[menuName];
            const menuInfo = {
                items: menuItems
            };
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            scratch3Menus[menuName] = menuInfo;
        }
        // @ts-expect-error TS(2339): Property 'menus' does not exist on type '{ id: str... Remove this comment to see the full error message
        info.menus = scratch3Menus;
    }
    return scratch3Extension;
};
exports.convert = convert;
const extensionNameToExtension = new Map();
const register = (name, descriptor, functions) => {
    const scratch3Extension = convert(name, descriptor, functions);
    extensionNameToExtension.set(name, scratch3Extension);
    // @ts-expect-error
    Scratch.extensions.register(scratch3Extension);
};
exports.register = register;
/**
 * @param {string} extensionName
 * @returns {ScratchXStatus}
 */
const getStatus = (extensionName) => {
    const extension = extensionNameToExtension.get(extensionName);
    if (extension) {
        return extension._getStatus();
    }
    return {
        status: 0,
        msg: 'does not exist'
    };
};
exports.getStatus = getStatus;
exports.default = {
    register,
    getStatus,
    convert
};


/***/ }),

/***/ "../../node_modules/scratch-vm/src/extension-support/tw-scratchx-utilities.ts":
/*!**************************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/tw-scratchx-utilities.ts ***!
  \**************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.argumentIndexToId = exports.generateExtensionId = void 0;
/**
 * @fileoverview
 * General ScratchX-related utilities used in multiple places.
 * Changing these functions may break projects.
 */
/**
 * @param {string} scratchXName
 * @returns {string}
 */
const generateExtensionId = (scratchXName) => {
    const sanitizedName = scratchXName.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return `sbx${sanitizedName}`;
};
exports.generateExtensionId = generateExtensionId;
/**
 * @param {number} i 0-indexed index of argument in list
 * @returns {string} Scratch 3 argument name
 */
const argumentIndexToId = (i) => i.toString();
exports.argumentIndexToId = argumentIndexToId;
exports.default = {
    generateExtensionId,
    argumentIndexToId
};


/***/ }),

/***/ "../../node_modules/scratch-vm/src/util/cast.ts":
/*!********************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/util/cast.ts ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = __importDefault(__webpack_require__(/*! ../util/color */ "../../node_modules/scratch-vm/src/util/color.ts"));
/**
 * Used internally by compare()
 * @param {*} val A value that evaluates to 0 in JS string-to-number conversation such as empty string, 0, or tab.
 * @returns {boolean} True if the value should not be treated as the number zero.
 */
const isNotActuallyZero = (val) => {
    if (typeof val !== 'string')
        return false;
    for (let i = 0; i < val.length; i++) {
        const code = val.charCodeAt(i);
        // '0'.charCodeAt(0) === 48
        // '\t'.charCodeAt(0) === 9
        // We include tab for compatibility with scratch-www's broken trim() polyfill.
        // https://github.com/TurboWarp/scratch-vm/issues/115
        // https://scratch.mit.edu/projects/788261699/
        if (code === 48 || code === 9) {
            return false;
        }
    }
    return true;
};
class Cast {
    /**
     * Scratch cast to number.
     * Treats NaN as 0.
     * In Scratch 2.0, this is captured by `interp.numArg.`
     * @param {*} value Value to cast to number.
     * @return {number} The Scratch-casted number value.
     */
    static toNumber(value) {
        // If value is already a number we don't need to coerce it with
        // Number().
        if (typeof value === 'number') {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            if (Number.isNaN(value)) {
                return 0;
            }
            return value;
        }
        const n = Number(value);
        if (Number.isNaN(n)) {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            return 0;
        }
        return n;
    }
    /**
     * Scratch cast to boolean.
     * In Scratch 2.0, this is captured by `interp.boolArg.`
     * Treats some string values differently from JavaScript.
     * @param {*} value Value to cast to boolean.
     * @return {boolean} The Scratch-casted boolean value.
     */
    static toBoolean(value) {
        // Already a boolean?
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            // These specific strings are treated as false in Scratch.
            if ((value === '') ||
                (value === '0') ||
                (value.toLowerCase() === 'false')) {
                return false;
            }
            // All other strings treated as true.
            return true;
        }
        // Coerce other values and numbers.
        return Boolean(value);
    }
    /**
     * Scratch cast to string.
     * @param {*} value Value to cast to string.
     * @return {string} The Scratch-casted string value.
     */
    static toString(value) {
        return String(value);
    }
    /**
     * Cast any Scratch argument to an RGB color array to be used for the renderer.
     * @param {*} value Value to convert to RGB color array.
     * @return {Array.<number>} [r,g,b], values between 0-255.
     */
    static toRgbColorList(value) {
        const color = Cast.toRgbColorObject(value);
        return [color.r, color.g, color.b];
    }
    /**
     * Cast any Scratch argument to an RGB color object to be used for the renderer.
     * @param {*} value Value to convert to RGB color object.
     * @return {RGBObject} [r,g,b], values between 0-255.
     */
    static toRgbColorObject(value) {
        let color;
        if (typeof value === 'string' && value.substring(0, 1) === '#') {
            color = color_1.default.hexToRgb(value);
            // If the color wasn't *actually* a hex color, cast to black
            if (!color)
                color = { r: 0, g: 0, b: 0, a: 255 };
        }
        else {
            color = color_1.default.decimalToRgb(Cast.toNumber(value));
        }
        return color;
    }
    /**
     * Determine if a Scratch argument is a white space string (or null / empty).
     * @param {*} val value to check.
     * @return {boolean} True if the argument is all white spaces or null / empty.
     */
    static isWhiteSpace(val) {
        return val === null || (typeof val === 'string' && val.trim().length === 0);
    }
    /**
     * Compare two values, using Scratch cast, case-insensitive string compare, etc.
     * In Scratch 2.0, this is captured by `interp.compare.`
     * @param {*} v1 First value to compare.
     * @param {*} v2 Second value to compare.
     * @returns {number} Negative number if v1 < v2; 0 if equal; positive otherwise.
     */
    static compare(v1, v2) {
        let n1 = Number(v1);
        let n2 = Number(v2);
        if (n1 === 0 && isNotActuallyZero(v1)) {
            n1 = NaN;
        }
        else if (n2 === 0 && isNotActuallyZero(v2)) {
            n2 = NaN;
        }
        if (isNaN(n1) || isNaN(n2)) {
            // At least one argument can't be converted to a number.
            // Scratch compares strings as case insensitive.
            const s1 = String(v1).toLowerCase();
            const s2 = String(v2).toLowerCase();
            if (s1 < s2) {
                return -1;
            }
            else if (s1 > s2) {
                return 1;
            }
            return 0;
        }
        // Handle the special case of Infinity
        if ((n1 === Infinity && n2 === Infinity) ||
            (n1 === -Infinity && n2 === -Infinity)) {
            return 0;
        }
        // Compare as numbers.
        return n1 - n2;
    }
    /**
     * Determine if a Scratch argument number represents a round integer.
     * @param {*} val Value to check.
     * @return {boolean} True if number looks like an integer.
     */
    static isInt(val) {
        // Values that are already numbers.
        if (typeof val === 'number') {
            if (isNaN(val)) { // NaN is considered an integer.
                return true;
            }
            // True if it's "round" (e.g., 2.0 and 2).
            return val === Math.floor(val);
        }
        else if (typeof val === 'boolean') {
            // `True` and `false` always represent integer after Scratch cast.
            return true;
        }
        else if (typeof val === 'string') {
            // If it contains a decimal point, don't consider it an int.
            return val.indexOf('.') < 0;
        }
        return false;
    }
    static get LIST_INVALID() {
        return 'INVALID';
    }
    static get LIST_ALL() {
        return 'ALL';
    }
    /**
     * Compute a 1-based index into a list, based on a Scratch argument.
     * Two special cases may be returned:
     * LIST_ALL: if the block is referring to all of the items in the list.
     * LIST_INVALID: if the index was invalid in any way.
     * @param {*} index Scratch arg, including 1-based numbers or special cases.
     * @param {number} length Length of the list.
     * @param {boolean} acceptAll Whether it should accept "all" or not.
     * @return {(number|string)} 1-based index for list, LIST_ALL, or LIST_INVALID.
     */
    static toListIndex(index, length, acceptAll) {
        if (typeof index !== 'number') {
            if (index === 'all') {
                return acceptAll ? Cast.LIST_ALL : Cast.LIST_INVALID;
            }
            if (index === 'last') {
                if (length > 0) {
                    return length;
                }
                return Cast.LIST_INVALID;
            }
            else if (index === 'random' || index === 'any') {
                if (length > 0) {
                    return 1 + Math.floor(Math.random() * length);
                }
                return Cast.LIST_INVALID;
            }
        }
        index = Math.floor(Cast.toNumber(index));
        if (index < 1 || index > length) {
            return Cast.LIST_INVALID;
        }
        return index;
    }
}
exports.default = Cast;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/util/color.ts":
/*!*********************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/util/color.ts ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Color {
    /**
     * @typedef {object} RGBObject - An object representing a color in RGB format.
     * @property {number} r - the red component, in the range [0, 255].
     * @property {number} g - the green component, in the range [0, 255].
     * @property {number} b - the blue component, in the range [0, 255].
     */
    /**
     * @typedef {object} HSVObject - An object representing a color in HSV format.
     * @property {number} h - hue, in the range [0-359).
     * @property {number} s - saturation, in the range [0,1].
     * @property {number} v - value, in the range [0,1].
     */
    /** @type {RGBObject} */
    static get RGB_BLACK() {
        return { r: 0, g: 0, b: 0 };
    }
    /** @type {RGBObject} */
    static get RGB_WHITE() {
        return { r: 255, g: 255, b: 255 };
    }
    /**
     * Convert a Scratch decimal color to a hex string, #RRGGBB.
     * @param {number} decimal RGB color as a decimal.
     * @return {string} RGB color as #RRGGBB hex string.
     */
    static decimalToHex(decimal) {
        if (decimal < 0) {
            decimal += 0xFFFFFF + 1;
        }
        let hex = Number(decimal).toString(16);
        hex = `#${'000000'.substr(0, 6 - hex.length)}${hex}`;
        return hex;
    }
    /**
     * Convert a Scratch decimal color to an RGB color object.
     * @param {number} decimal RGB color as decimal.
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static decimalToRgb(decimal) {
        const a = (decimal >> 24) & 0xFF;
        const r = (decimal >> 16) & 0xFF;
        const g = (decimal >> 8) & 0xFF;
        const b = decimal & 0xFF;
        return { r: r, g: g, b: b, a: a > 0 ? a : 255 };
    }
    /**
     * Convert a hex color (e.g., F00, #03F, #0033FF) to an RGB color object.
     * @param {!string} hex Hex representation of the color.
     * @return {RGBObject | null} null on failure, or rgb: {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hexToRgb(hex) {
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        const parsed = parseInt(hex, 16);
        if (isNaN(parsed)) {
            return null;
        }
        if (hex.length === 6) {
            return {
                r: (parsed >> 16) & 0xff,
                g: (parsed >> 8) & 0xff,
                b: parsed & 0xff
            };
        }
        else if (hex.length === 3) {
            const r = ((parsed >> 8) & 0xf);
            const g = ((parsed >> 4) & 0xf);
            const b = parsed & 0xf;
            return {
                r: (r << 4) | r,
                g: (g << 4) | g,
                b: (b << 4) | b
            };
        }
        return null;
    }
    /**
     * Convert an RGB color object to a hex color.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!string} Hex representation of the color.
     */
    static rgbToHex(rgb) {
        return Color.decimalToHex(Color.rgbToDecimal(rgb));
    }
    /**
     * Convert an RGB color object to a Scratch decimal color.
     * @param {RGBObject | null} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!number} Number representing the color.
     */
    static rgbToDecimal(rgb) {
        if (rgb === null)
            throw new Error('rgb must be an RGBObject');
        return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
    }
    /**
    * Convert a hex color (e.g., F00, #03F, #0033FF) to a decimal color number.
    * @param {!string} hex Hex representation of the color.
    * @return {!number} Number representing the color.
    */
    static hexToDecimal(hex) {
        return Color.rgbToDecimal(Color.hexToRgb(hex));
    }
    /**
     * Convert an HSV color to RGB format.
     * @param {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hsvToRgb(hsv) {
        let h = hsv.h % 360;
        if (h < 0)
            h += 360;
        const s = Math.max(0, Math.min(hsv.s, 1));
        const v = Math.max(0, Math.min(hsv.v, 1));
        const i = Math.floor(h / 60);
        const f = (h / 60) - i;
        const p = v * (1 - s);
        const q = v * (1 - (s * f));
        const t = v * (1 - (s * (1 - f)));
        let r;
        let g;
        let b;
        switch (i) {
            default:
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }
        return {
            r: Math.floor(r * 255),
            g: Math.floor(g * 255),
            b: Math.floor(b * 255)
        };
    }
    /**
     * Convert an RGB color to HSV format.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     */
    static rgbToHsv(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const x = Math.min(Math.min(r, g), b);
        const v = Math.max(Math.max(r, g), b);
        // For grays, hue will be arbitrarily reported as zero. Otherwise, calculate
        let h = 0;
        let s = 0;
        if (x !== v) {
            const f = (r === x) ? g - b : ((g === x) ? b - r : r - g);
            const i = (r === x) ? 3 : ((g === x) ? 5 : 1);
            h = ((i - (f / (v - x))) * 60) % 360;
            s = (v - x) / v;
        }
        return { h: h, s: s, v: v };
    }
    /**
     * Linear interpolation between rgb0 and rgb1.
     * @param {RGBObject} rgb0 - the color corresponding to fraction1 <= 0.
     * @param {RGBObject} rgb1 - the color corresponding to fraction1 >= 1.
     * @param {number} fraction1 - the interpolation parameter. If this is 0.5, for example, mix the two colors equally.
     * @return {RGBObject} the interpolated color.
     */
    static mixRgb(rgb0, rgb1, fraction1) {
        if (fraction1 <= 0)
            return rgb0;
        if (fraction1 >= 1)
            return rgb1;
        const fraction0 = 1 - fraction1;
        return {
            r: (fraction0 * rgb0.r) + (fraction1 * rgb1.r),
            g: (fraction0 * rgb0.g) + (fraction1 * rgb1.g),
            b: (fraction0 * rgb0.b) + (fraction1 * rgb1.b)
        };
    }
}
exports.default = Color;


/***/ }),

/***/ "../../node_modules/scratch-vm/src/util/log.ts":
/*!*******************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/scratch-vm/src/util/log.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-expect-error TS(7016): Could not find a declaration file for module 'mini... Remove this comment to see the full error message
const minilog = __importStar(__webpack_require__(/*! minilog */ "../../node_modules/minilog/lib/web/index.js"));
minilog.enable();
exports.default = minilog.default('vm');


/***/ }),

/***/ "../../node_modules/ts-loader/index.js!../../node_modules/scratch-vm/src/extension-support/extension-worker.ts":
/*!****************************************************************************************************************************************************************!*\
  !*** /home/runner/work/editor/editor/node_modules/ts-loader!/home/runner/work/editor/editor/node_modules/scratch-vm/src/extension-support/extension-worker.ts ***!
  \****************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
/* eslint-env worker */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tw_extension_api_common_1 = __importDefault(__webpack_require__(/*! ./tw-extension-api-common */ "../../node_modules/scratch-vm/src/extension-support/tw-extension-api-common.ts"));
const worker_dispatch_1 = __importDefault(__webpack_require__(/*! ../dispatch/worker-dispatch */ "../../node_modules/scratch-vm/src/dispatch/worker-dispatch.ts"));
const log_1 = __importDefault(__webpack_require__(/*! ../util/log */ "../../node_modules/scratch-vm/src/util/log.ts"));
const tw_extension_worker_context_1 = __webpack_require__(/*! ./tw-extension-worker-context */ "../../node_modules/scratch-vm/src/extension-support/tw-extension-worker-context.ts");
const loadScripts = (url) => {
    if (tw_extension_worker_context_1.isWorker) {
        importScripts(url);
    }
    else {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // @ts-expect-error TS(2794): Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
            script.onload = () => resolve();
            script.onerror = () => {
                reject(new Error(`Error in sandboxed script: ${url}. Check the console for more information.`));
            };
            script.src = url;
            document.body.appendChild(script);
        });
    }
};
class ExtensionWorker {
    constructor() {
        this.nextExtensionId = 0;
        this.initialRegistrations = [];
        this.firstRegistrationPromise = new Promise(resolve => {
            this.firstRegistrationCallback = resolve;
        });
        worker_dispatch_1.default.waitForConnection.then(() => {
            worker_dispatch_1.default.call('extensions', 'allocateWorker').then((x) => __awaiter(this, void 0, void 0, function* () {
                const [id, extension] = x;
                this.workerId = id;
                try {
                    yield loadScripts(extension);
                    yield this.firstRegistrationPromise;
                    const initialRegistrations = this.initialRegistrations;
                    this.initialRegistrations = null;
                    Promise.all(initialRegistrations).then(() => worker_dispatch_1.default.call('extensions', 'onWorkerInit', id));
                }
                catch (e) {
                    log_1.default.error(e);
                    worker_dispatch_1.default.call('extensions', 'onWorkerInit', id, `${e}`);
                }
            }));
        });
        this.extensions = [];
    }
    register(extensionObject) {
        const extensionId = this.nextExtensionId++;
        this.extensions.push(extensionObject);
        const serviceName = `extension.${this.workerId}.${extensionId}`;
        const promise = worker_dispatch_1.default.setService(serviceName, extensionObject)
            .then(() => worker_dispatch_1.default.call('extensions', 'registerExtensionService', serviceName));
        if (this.initialRegistrations) {
            this.firstRegistrationCallback();
            this.initialRegistrations.push(promise);
        }
        return promise;
    }
}
// @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
global.Scratch = global.Scratch || {};
// @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
Object.assign(global.Scratch, tw_extension_api_common_1.default);
/**
 * Expose only specific parts of the worker to extensions.
 */
const extensionWorker = new ExtensionWorker();
// @ts-expect-error TS(2339): Property 'Scratch' does not exist on type 'typeof ... Remove this comment to see the full error message
global.Scratch.extensions = {
    register: extensionWorker.register.bind(extensionWorker)
};
// @ts-expect-error TS(7017): Element implicitly has an 'any' type because type ... Remove this comment to see the full error message
global.ScratchExtensions = __webpack_require__(/*! ./tw-scratchx-compatibility-layer */ "../../node_modules/scratch-vm/src/extension-support/tw-scratchx-compatibility-layer.ts");

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../webpack/buildin/global.js */ "../../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../../node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })

/******/ });
//# sourceMappingURL=extension-worker.b00bd61635b2824636ec.js.map