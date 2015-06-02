function findMatch(string, routes) {
  string = string.split('?');
  var i, fn, part, parts = string[0].toLowerCase().split('/');
  var params = [], focus = routes, query = {};
  for (i = 0; i < parts.length; ++i) {
    part = parts[i];
    if (focus[part] !== undefined) {
      focus = focus[part];
    } else if (focus['*'] !== undefined) {
      focus = focus['*'];
      params.push(part);
    } else {
      break;
    }
    if (focus.fn !== undefined) fn = focus.fn;
  }
  if (string.length > 1) {
    parts = string[1].split('&');
    for (i = 0; i < parts.length; ++i) {
      part = parts[i].split('=');
      query[part[0]] = part[1];
    }
  }
  params.push(query);
  return [fn, params];
}

function createRoutes(routesObj) {
  var routes = {}, string, tring, parts, i, p;
  for (string in routesObj) {
    focus = routes;
    parts = normalize(string).toLowerCase().split('/');
    for (i = 0; i < parts.length; ++i) {
      p = parts[i];
      focus = (focus[p] = focus[p] || {});
    }
    focus.fn = routesObj[string];
  }
  return routes;
}

function match(string, routes) {
  var foundMatch = findMatch(string, routes);
  if (foundMatch[0] !== undefined) {
    foundMatch[0].apply(null, foundMatch[1]);
  }
}

function normalize(url) {
  var preSlash = url.charAt(0) === '/',
      postSlash = url.charAt(url.length - 1) === '/';
  return preSlash && postSlash ? url.slice(1, -1)
       : preSlash              ? url.slice(1)
       : postSlash             ? url.slice(0, -1)
                               : url;
}

function init(desc) {
  var routes = createRoutes(desc.routes);
  var ev, cb;
  if (desc.history === false) {
    ev = 'hashchange';
    cb = function(ev) {
      match(normalize(document.location.hash.slice(1)), routes);
    };
  } else {
    ev = 'popstate';
    cb = function(ev) {
      match(document.location.pathname.slice(1), routes);
    };
  }
  window.addEventListener(ev, cb);
  return {routes: routes, ev: ev, cb: cb, history: desc.history};
}

function destroy(desc) {
  window.removeEventListener(desc.ev, desc.cb);
}

function navigate(desc, url) {
  if (desc.history === false) {
    window.location.hash = '#' + url;
  } else {
    match(url, desc.routes);
    history.pushState(null, '', url);
  }
}

module.exports = {init: init, navigate: navigate, destroy: destroy};
