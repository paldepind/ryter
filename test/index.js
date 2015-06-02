var assert = require('assert');
var ryter = require('../ryter.js');

describe('ryter', function() {
  var apps = 0, blog = 0, news = 0, appsrecent = 0, calmon = 0;
  var desc, spec = {
    routes: {
      apps: function() { apps++; },
      'apps/recent': function() { appsrecent++; },
      blog: function() { blog++; },
      news: function() { news++; },
      'calendar/month': function() { calmon++; },
    },
  };
  beforeEach(function() {
    apps = blog = news = appsrecent = 0;
    desc = ryter.init(spec);
  });
  afterEach(function() {
    ryter.destroy(desc);
  });
  it('matches "apps"', function() {
    ryter.navigate(desc, 'apps');
    assert.equal(apps, 1);
  });
  it('matches prefix', function() {
    ryter.navigate(desc, 'news/today');
    assert.equal(news, 1);
  });
  it('invokes with params', function() {
    var result = [];
    var desc = ryter.init({
      routes: {
        'blog/*': function(id) { result.push(id); },
      },
    });
    ryter.navigate(desc, 'blog/12');
    assert.deepEqual(result, [12]);
    ryter.navigate(desc, '/');
    ryter.destroy(desc);
  });
  it('goes back', function(done) {
    ryter.navigate(desc, 'apps');
    setTimeout(function() {
      ryter.navigate(desc, 'blog');
      setTimeout(function() {
        history.back();
        setTimeout(function() {
          ryter.navigate(desc, '/');
          assert.equal(blog, 1);
          assert.equal(apps, 2);
          done();
        }, 20);
      }, 20);
    }, 20);
  });
  describe('hashes', function() {
    it('handles hash', function(done) {
      var spec2 = {
        history: false,
        routes: spec.routes,
      };
      var desc2 = ryter.init(spec2);
      ryter.navigate(desc2, '/apps/recent');
      setTimeout(function() {
        assert.equal(appsrecent, 1);
        ryter.navigate(desc2, '/');
        ryter.navigate(desc, '/');
        ryter.destroy(desc2);
        done();
      });
    });
    it('supports routes with leading and ending slashes', function(done) {
      var called = 0;
      var desc2 = ryter.init({
        history: false,
        routes: {
          '/books': function() { called++; },
          'people/': function() { called++; },
        }
      });
      ryter.navigate(desc2, '/books');
      setTimeout(function() {
        ryter.navigate(desc2, '/people');
        setTimeout(function() {
          assert.equal(called, 2);
          ryter.destroy(desc2);
          done();
        });
      });
    });
    it('can navigate without leading slashes', function(done) {
      var desc2 = ryter.init({
        history: false,
        routes: spec.routes,
      });
      ryter.navigate(desc2, 'apps/recent');
      setTimeout(function() {
        assert.equal(appsrecent, 1);
        ryter.navigate(desc2, '/');
        ryter.navigate(desc, '/');
        ryter.destroy(desc2);
        done();
      });
    });
  });
  describe('parameters', function() {
    it('passes parameter object', function() {
      var result = [];
      var desc = ryter.init({
        routes: {
          'blog': function(obj) { result.push(obj); },
        },
      });
      ryter.navigate(desc, 'blog?key=123&foo=bar');
      ryter.navigate(desc, '/');
      ryter.destroy(desc);
      assert.deepEqual(result[0], {key: '123', foo: 'bar'});
    });
  });
});
