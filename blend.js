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
	
  window.define = window.define || define;

  define.amd = {};

  var caches = {};
  var modules = {};
  var pending = {};
  var exported;

  caches['requires'] = requires;
  caches['exports'] = exports;

  function define (id, deps, fac) {

    if (typeof deps === 'function') {
      fac = deps;
      deps = [];
    }

    var _fac = function () {
      var _id = id;
      return function () {
        var args = Array.prototype.slice.call(arguments);
        args.push(exports);
        var o = fac.apply(this, args);
        if (typeof o === 'undefined') {
          o = exported;
          exported = null;
        }

        fulfill(_id, o);
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

    for (var i = 0, ii = deps.length; i < ii; i++) {
      if (!(deps[i] in caches)) {
        pending[deps[i]] = pending[deps[i]] || [];
        pending[deps[i]].push({
          id: id
        })
      }
    }

    modules[id] = {
      deps: deps,
      fulfilled: [],
      factory: _fac
    }
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

        if (q.fulfilled.length === q.deps.length) {
          caches[n.id] = q.factory.apply(this, q.fulfilled);
        }
      }
      pending[id] = null;
    }
  }

}(window));
