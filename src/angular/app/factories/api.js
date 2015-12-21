app.factory('API', ['$rootScope', function($rootScope) {

  function copyAdd(obj, field, value) {

    var newObj = {};
    value && (newObj[field] = value);

    Object.keys(obj).forEach(function(k) {
      newObj[k] = obj[k];
    });

    return newObj;

  }

  function serializeParameters(obj) {

    var fnConvert = function(keys, isArray, v) {
      isArray = ['', '[]'][isArray | 0];
      return (keys.length < 2) ? (
        [keys[0], isArray, '=', v].join('')
      ) : (
        [keys[0], '[' + keys.slice(1).join(']['), ']', isArray, '=', v].join('')
      );
    };

    var fnSerialize = function(keys, key, i) {

      keys = keys.concat([key]);
      var datum = obj;

      keys.forEach(function(key) {
        datum = datum[key];
      });

      if (datum instanceof Date) {

        datum = [datum.getFullYear(), datum.getMonth() + 1, datum.getDate()].join('-');

      }

      if (datum instanceof Array) {

        return datum.map(fnConvert.bind(null, keys, true)).join('&');

      } else if (typeof(datum) === 'object' && datum !== null) {

        return Object.keys(datum).map(fnSerialize.bind(null, keys)).join('&');

      }

      return fnConvert(keys, false, datum);

    };

    return Object.keys(obj).map(fnSerialize.bind(null, [])).join('&');

  }

  function APIConnect(domain) {

    if (domain[domain.length - 1] === '/') {
      domain = domain.substr(0, domain.length - 1);
    }

    this._domain = domain;
    this._accessToken = localStorage.getItem(this._domain + ':accessToken') || undefined;

  }

  APIConnect.prototype.request = function(path) {

    if (path[0] === '/') {
      path = path.substr(1);
    }

    return new APIRequest(this._domain, path, this._accessToken);

  };

  APIConnect.prototype.open = function(path, params) {

    window.location = [
      [this._domain, path].join('/'),
      '?',
      serializeParameters(copyAdd(params, 'access_token', this._accessToken))
    ].join('');

  };

  APIConnect.prototype.setAccessToken = function(accessToken) {
    if (accessToken) {
      localStorage.setItem(this._domain + ':accessToken', accessToken);
      this._accessToken = accessToken
    } else {
      this.clearAccessToken();
    }
  };

  APIConnect.prototype.clearAccessToken = function() {
    localStorage.removeItem(this._domain + ':accessToken');
    this._accessToken = undefined;
  };

  function APIRequest(domain, path, accessToken) {
    this._url = [domain, path].join('/');
    this._accessToken = accessToken || undefined;
  }

  APIRequest.prototype.addAccessToken = function(obj) {

    return copyAdd(obj, 'access_token', this._accessToken);

  };

  APIRequest.prototype.addAccessTokenQueryString = function() {

    return (this._accessToken ? '?access_token=' + this._accessToken : '');

  };

  APIRequest.prototype.index = function(params, callback) {

    return new APIXHR(this._url, callback).get(this.addAccessToken(params));

  };

  APIRequest.prototype.show = function(id, params, callback) {

    return new APIXHR(this._url + (id ? '/' + id : ''), callback).get(this.addAccessToken(params));

  };

  APIRequest.prototype.destroy = function(id, params, callback) {

    return new APIXHR(this._url + (id ? '/' + id : ''), callback).del(this.addAccessToken(params));

  };

  APIRequest.prototype.create = function(params, callback) {

    return new APIXHR(this._url + this.addAccessTokenQueryString(), callback).post(params);

  };

  APIRequest.prototype.update = function(id, params, callback) {

    return new APIXHR(this._url + (id ? '/' + id : '') + this.addAccessTokenQueryString(), callback).put(params);

  };

  APIRequest.prototype.upload = function(file, callback) {

    return new APIXHR(this._url + this.addAccessTokenQueryString(), callback).upload(file);

  };

  function APIXHR(url, callback) {

    this._url = url;
    this._active = false;
    this._complete = false;

    var self = this;
    var xhr = new XMLHttpRequest();
    this._xhr = xhr;

    var cb = callback;
    callback = function() {

      self._complete = true;
      cb.apply(this, arguments);
      $rootScope.$digest();

    };

    this._callback = callback;

    xhr.addEventListener('readystatechange', function() {

      var obj;

      if (xhr.readyState === 0) {
        callback.call(self, new Error('Request aborted'), null, []);
        return;
      }

      if (xhr.readyState === 4) {

        if (xhr.status === 0) {
          callback.call(self, new Error('Request aborted'), null, []);
          return;
        }

        try {
          obj = JSON.parse(xhr.responseText);
        } catch(e) {
          callback.call(self, new Error('Expected JSON, could not parse response'), null, []);
          return;
        }

        if (obj.meta && obj.meta.error) {
          callback.call(self, obj.meta.error, obj, obj.data || []);
          return;
        }

        callback.call(self, null, obj, obj.data || []);
        return;

      }

    });

    xhr.addEventListener('error', function(err) {

      callback.call(self, err, null, []);

    });

    return this;

  }

  APIXHR.prototype.__checkActiveState__ = function() {
    if (this._active) {
      throw new Error('APIXHR is already active, can only be aborted.');
    }
    return true;
  };

  APIXHR.prototype.__setActiveState__ = function() {
    this._active = true;
  };

  APIXHR.prototype.abort = function() {

    if (!this._active) {
      throw new Error('Cannot abort APIXHR that is not active');
    }

    if (!this._complete) {
      this._xhr.abort();
    }

    return this;

  };

  APIXHR.prototype.get = function(params) {
    this.__checkActiveState__();
    var xhr = this._xhr;
    xhr.open('GET', [this._url, serializeParameters(params)].join('?'));
    xhr.send();
    this.__setActiveState__();
    return this;
  };

  APIXHR.prototype.del = function(params) {
    this.__checkActiveState__();
    var xhr = this._xhr;
    xhr.open('DELETE', [this._url, serializeParameters(params)].join('?'));
    xhr.send();
    this.__setActiveState__();
    return this;
  };

  APIXHR.prototype.post = function(params) {
    this.__checkActiveState__();
    var xhr = this._xhr;
    xhr.open('POST', this._url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(params));
    this.__setActiveState__();
    return this;
  };

  APIXHR.prototype.put = function(params) {
    this.__checkActiveState__();
    var xhr = this._xhr;
    xhr.open('PUT', this._url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(params));
    this.__setActiveState__();
    return this;
  };

  APIXHR.prototype.upload = function(file) {
    this.__checkActiveState__();
    var xhr = this._xhr;
    xhr.open('POST', this._url);
    xhr.send(file);
    this.__setActiveState__();
    return this;
  };

  return new APIConnect((window.globals && window.globals.api_url) || '');

}]);
