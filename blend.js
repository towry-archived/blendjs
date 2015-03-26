/*!
 * Lightweight Asynchronous Module Definition(AMD) library.
 *
 * @author Towry Wang (http://towry.me)
 * @license MIT (http://towry.me/mit-license)
 */

(function (window, undefined) {

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (el) {
      var l = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0) ? Math.ceil(from) : Math.floor(from);
      if (from < 0) from += len;

      for (; from < len; from++) {
        if (from in this && this[from] === el)
          return from;
      }
      return -1;
    }
  }

  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  if (!Object.keys) {
    Object.keys = (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
      var dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ];
      var dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) 
          throw new TypeError('Object.keys called on non-object');

        var result = [];

        for (var p in obj) {
          if (hasOwnProperty.call(obj, p)) result.push(p);
        }

        if (hasDontEnumBug) {
          for (var i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
          }
        }

        return result;
      }
    }());
  }
	
  window.define = window.define || define;

  define.amd = {};

  var caches = {};
  var modules = {};
  var pending = {};
  var exported;
  var pender = null;

  caches['requires'] = requires;
  caches['exports'] = exports;

  function define (id, deps, fac) {

    if (pender !== null) {
      clearTimeout(pender);
      pender = null;
    }

    if (typeof deps === 'function') {
      fac = deps;
      deps = [];
    }

    var _fac = function () {
      var _id = id;
      return function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length === 0) {
          args.push(exports);
        }
        var o = fac.apply(this, args);
        if (typeof o === 'undefined') {
          o = exported;
          exported = null;
        }

        fulfill(_id, o);

        return o;
      }
    }.call(this);

    if (deps.length === 0) {
      caches[id] = _fac.apply(this);
      return;
    }

    var _deps = satisfy(deps);
    if (_deps.length === deps.length) {
      caches[id] = _fac.apply(this, _deps);

      return;
    }

    var unfulfilled = 0;
    var fulfilled = [];
    for (var i = 0, ii = deps.length; i < ii; i++) {
      if (!(deps[i] in caches)) {
        unfulfilled++;
        pending[deps[i]] = pending[deps[i]] || [];
        pending[deps[i]].push({
          id: id
        })
      } else {
        fulfilled[i] = caches[deps[i]];
      }
    }

    modules[id] = {
      deps: deps,
      fulfilled: fulfilled,
      factory: _fac,
      unfulfilled: unfulfilled
    }

    pender = setTimeout(function () {
      if (!pending) return;
      if (!Object.keys(pending).length) return;

      unfulfilled = Object.keys(pending);

      throw new Error("Those modules are not fulfilled: " + unfulfilled.join(', '));
    }, 1);
  }

  function satisfy (deps) {
    var ret = [];

    for (var i = 0, ii = deps.length; i < ii; i++) {
      if (deps[i] in caches) {
        ret.push(caches[deps[i]]);
      }
    }

    return ret;
  }

  function exports (o) {
    exported = o;
  }

  function requires (id) {
    if (id in caches) {
      return caches[id];
    }

    return null;
  }

  function fulfill (id, o) {
    if (id in pending) {
      var m, n, q, p;
      m = pending[id];
      for (var i = 0, ii = m.length; i < ii; i++) {
        n = m[i];
        q = modules[n.id];
        p = q.deps.indexOf(id);
        if (p == -1) continue;

        q.fulfilled[p] = o;
        q.unfulfilled--;

        if (q.fulfilled.length === q.deps.length && q.unfulfilled === 0) {
          caches[n.id] = q.factory.apply(this, q.fulfilled);
        }
      }
      pending[id] = null;
      delete pending[id];
    }
  }

}(window));
