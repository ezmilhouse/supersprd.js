var supersprd = function (exports) {

    // Current version of the `superbone` library. Keep in sync with
    // `package.json`.
    var version = '0.0.1';

    // Save a reference to the global object (`window` in the browser,
    // `global` on the server).
    var root = this;

    // Save the previous value of the `superbone` variable, so that it can be,
    // restored later on, if `noConflict` is used.
    var previous_superbone = root.superbone;

    /**
     * @function log()
     *
     * Inject browser-safe logging function, makes use of `history` API
     * if available, wraps `console.log`
     *
     */
    var log = root.log = function () {
        root.log.history = root.log.history || [];
        root.log.history.push(arguments);
        if (this.console) {
            console.log(Array.prototype.slice.call(arguments));
        }
    };


    /**
     * @function noConflict()
     * @helper
     * Runs superbone in *noConflict* mode, returning the `superbone` variable
     * to its previous owner. Returns a reference to this superbone object.
     */
    function noConflict() {
        root.superbone = previous_superbone;
        return this;
    }

    /**
     * @function noop()
     * @helper
     *
     * This is the `no callback` function that you wish to pass around as a
     * function that will do nothing. Useful if `callback` is optional.
     *
     */
    function noop() {
    }

    /**
     * @function isFunction(obj)
     * @helper
     * @param mixed
     *
     * Checks if incoming `mixed` is actually of type function.
     *
     */
    function isFunction(mixed) {
        return typeof(mixed) == 'function';
    }

    /**
     * @function isObject(obj)
     * @helper
     * @param mixed
     *
     * Checks if incoming `mixed` is actually of type object (and not empty)
     *
     */
    function isObject(mixed) {
        var res = mixed !== null && typeof mixed == 'object';
        if (res) res = !_.isEmpty(mixed);
        return res;
    }

    /**
     * @function isArray(arr)
     * @helper
     * @param mixed
     *
     * Checks if incoming `mixed` is actually of type array (and not empty)
     *
     */
    function isArray(mixed) {
        return mixed instanceof Array && mixed.length > 0;

    }

    /**
     * @function isCollection(mixed)
     * @param mixed
     *
     * Checks whether incoming obj is Backbone `collection` or not. Return true
     * if so, otherwise false.
     * TODO: find a better way to check that?
     *
     */
    function isCollection(mixed) {
        return (mixed.toJSON)
            ? true
            : false
    }

    /**
     * @function getCollection(name, [debug])
     * Warpper of `collectionGet`, for consistency reasons.
     * // TODO: make this obsolet
     * @param name
     * @param debug
     */
    function getCollection(name, debug) {
        return collectionGet(name, debug);
    }

    /**
     * @function inArray(value, array, [i])
     * @helper
     * @param value
     * @param array
     * @param i
     *
     * Checks if incoming `value` is in `array`, returns index if so , otherwise -1
     *
     */
    function inArray(value, array, i) {
        var len;
        if (array) {
            if (array.indexOf) {
                return array.indexOf.call(array, value, i);
            }
            len = array.length;
            i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
            for (; i < len; i++) {
                // Skip accessing in sparse arrays
                if (i in array && array[ i ] === value) {
                    return i;
                }
            }
        }
        return -1;
    }

    function sortAndStringify(obj) {

        var sorted = {},
            stringified = '',
            key,
            arr = [],
            results;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(key);
            }
        }
        arr.sort();

        for (key = 0; key < arr.length; key++) {
            sorted[arr[key]] = obj[arr[key]];
            if (stringified !== '') {
                stringified += '&';
            }
            stringified += arr[key] + '=' + obj[arr[key]];
        }

        results = {
            obj : sorted,
            str : stringified
        };

        return results;

    }


    var _sdks = {};

    function sdkCreate(name) {
        return new Sdk(name);
    }

    function sdkGet(name, debug) {

        function getIt(name, debug) {

            if (name) {
                if (debug) return _sdks[name];
                return _sdks[name].sdk;
            } else {
                var obj = {};
                _.each(_sdks, function (value, key) {
                    if (debug) {
                        obj[key] = _sdks[key]
                    } else {
                        obj[key] = _sdks[key].sdk
                    }
                });
                return obj;
            }

        }

        if (isArray(name)) {

            // If name is of type array loop through array, call `getIt()`
            // with `debug` param and collects returns.
            var obj = {};
            _.each(name, function (value, key) {
                obj[value] = getIt(value, debug);
            });
            return obj;

        } else {
            return getIt(name, debug);
        }

    }

    function Sdk(name) {

        this._name = name || 'SP';

        // ---

        this._access = {
            key : null
        };

        this._setup = {

            context  : 'all',
            locale   : 'en_US',
            platform : 'NA',
            proxy    : '/proxy/sprd',
            type     : 'json'

        };

        this._auth = {

            id       : null,
            username : null,
            password : null,
            session  : null

        };

        // ---

        this._query = {

            apiKey    : this._access.key,
            locale    : this._setup.locale,
            mediaType : this._setup.type

        };

        // ---

        this._resources = {};

        // ---

        this._endpoint = this._setup.proxy + '/' + this._setup.platform + '/api/v1';

        // ---

        this._api = function (method, uri, data, options, callback) {

            var query = this.query
                , endpoint;

            // ---

            if (isFunction(data)) {
                // no data
                // no options
                callback = data;
                data = null;
                options = null;
            } else {
                if (isFunction(options)) {
                    //no options
                    callback = options;
                    options = null;
                }
            }

            // ---

            // overwrite default query with incoming options
            if (options) _.extend(query, options);

            // add sessionId in case of user context
            if (this.setup.context === 'user') _.extend(query, {
                sessionId : this.auth.session
            });

            // ---

            switch (this.setup.context) {
                case 'shop' :
                    endpoint = this.endpoint + '/shops/' + this.auth.id + uri;
                    break;
                case 'user' :
                    endpoint = this.endpoint + '/users/' + this.auth.id + uri;
                    break;
                default :
                    endpoint = this.endpoint + uri;
                    break;
            }

            // ---

            query = sortAndStringify(query).str;
            endpoint += '?' + query;

            // ---

            switch (method) {
                case 'POST' :

                    superagent
                        .post(endpoint)
                        .send(data)
                        .end(function (res) {
                            if (res.ok) {
                                callback(null, res.body.response, res.status);
                            } else {
                                callback(res.error, res.status);
                            }
                        });

                    break;
                case 'PUT' :

                    superagent
                        .put(endpoint)
                        .send(data)
                        .end(function (res) {
                            if (res.ok) {
                                callback(null, res.body.response, res.status);
                            } else {
                                callback(res.error, res.status);
                            }
                        });

                    break;
                case 'DELETE' :

                    superagent
                        .del(endpoint)
                        .end(function (res) {
                            if (res.ok) {
                                callback(null, res.body.response, res.status);
                            } else {
                                callback(res.error, res.status);
                            }
                        });

                    break;
                default : // GET

                    superagent
                        .get(endpoint)
                        .end(function (res) {
                            if (res.ok) {
                                callback(null, res.body.response, res.status);
                            } else {
                                callback(res.error, res.status);
                            }
                        });

                    break;
            }

        };

        // ---

        this._get = function (uri, data, options, callback) {
            this.api('GET', uri, data, options, callback);
        };

        this._post = function (uri, data, options, callback) {
            this.api('POST', uri, data, options, callback);
        };

        this._put = function (uri, data, options, callback) {
            this.api('PUT', uri, data, options, callback);
        };

        this._delete = function (uri, data, options, callback) {
            this.api('DELETE', uri, data, options, callback);
        };

        // ---

        this._init = function (callback) {

            var that = this;

            switch (this.setup.context) {

                case 'shop' :

                    // skip!
                    if (this._resources) return callback(null, this._resources);

                    this.api('GET', '', function (err, res) {
                        if (err) return log('[error][GET] Not found.');
                        that._resources = res;
                        callback(null, that._resources);
                    });

                    break;

                case 'user' :

                    // skip!
                    if (this._resources) return callback(null, this._resources);

	               	// ---

                    superflow
                        .seq('session', function (cb) {

                        // skip!
                        if (that.auth.session) return cb(null, that.auth.session);

                        superagent
                            .post(that.endpoint + '/sessions?' + sortAndStringify(that.query).str)
                            .send({
                                username : that.auth.username,
                                password : that.auth.password
                            })
                            .end(function (res) {

                                if (res.ok && res.body.response.location) {
                                    cb(null, res.body.response.location.split('sessions/')[1]);
                                } else {
                                    log('[error][GET] Not found.');
	                                res.status = '404'; // TODO: better place? better solution?
                                    res.error = true;
	                                callback(res.error, res.status);
                                }
                            });

                        })
                        .seq('session', function (cb) {

                            superagent
                                .get(that.endpoint + '/sessions/' + this.vars.session + '?' + sortAndStringify(that.query).str)
                                .end(function (res) {
                                    if (res.ok) {
                                        cb(null, res.body.response);
                                    } else {
                                        log('[error][GET] Not found.');
                                        callback(res.error, res.status);
                                    }
                                });

                        })
                        .seq('user', function (cb) {

                            that.auth.id = this.vars.session.user.id;

                            that.api('GET', '', function (err, res) {
	                            if (err) return log('[error][GET] Not found.');
	                            that._resources = res;
	                            cb(null, that._resources);
                            });




                        })
                        .end(function () {

		                    delete that.auth.username;
		                    delete that.auth.password;

		                    // ---

                            that.auth.session = this.vars.session.id;

		                    // ---

                            callback(null, that.auth);

                        });

                    break;

                default :
                    callback();
                    break;

            }

            return this;

        };

        // ---

        _sdks[this._name] = this;

        return this;

    }

    Sdk.prototype.end = function (callback) {

        this._endpoint = this._setup.proxy + '/' + this._setup.platform + '/api/v1';

        // ---

        this._query = {

            apiKey    : this._access.key,
            locale    : this._setup.locale,
            mediaType : this._setup.type

        };

        // ---

        // save internal representation for internal reference
        _sdks[this._name] = this;

        // save callbacks for public reference via `sdks.get()`
        _.extend(_sdks[this._name], {

            sdk : {

                name     : this._name,
                access   : this._access,
                setup    : this._setup,
                auth     : this._auth,
                query    : this._query,
                endpoint : this._endpoint,
                api      : this._api,
                init     : this._init,
                get      : this._get,
                post     : this._post,
                put      : this._put,
                del      : this._delete
            }

        });

        if (callback) callback(null, _sdks[this._name].sdk);

        // return fresh instance
        return _sdks[this._name].sdk;

    };

    Sdk.prototype.id = function (id) {
        this._access.key = id;
        return this;
    };

    Sdk.prototype.is = function (mixed, value) {

        var that = this;

        if (isArray(mixed)) {

            // If first param `mixed` is array it might hold a lot of things:
            // objects, key/value, key/functions, key/strings. Best way to find
            // out is looping throgh array and calling `.is()` recursively.
            _.each(mixed, function (value, key) {
                that.is(value);
            });

        } else if (isObject(mixed)) {

            // If first param `mixed` is an object it could be a single key/
            // function pair or an object of key/function pairs or the same with
            // controller strings instead of functions. To find out loop through
            // object keys and call `.is()` recursively.
            _.each(mixed, function (value, key) {
                that.is(key, value);
            });

        } else {

            // Check if incoming attribute name is allowed, just check if attribute
            // name is key in default `_FB_options` object.
            if (!this._setup.hasOwnProperty(mixed)) return this;

            // If first param `mixed` is string, next steps depend on type of
            // 2nd param `value`. This might be either a `function` or  something
            // else If it is of type `function`, functions result will be saved
            // as attibute's value.
            if (isFunction(value)) {
                this._setup[mixed] = value();
            } else {
                this._setup[mixed] = value;
            }

        }

        return this;

    };

    Sdk.prototype.of = function (id, username, password) {
        this._auth.id = id || null;
        if (this._setup.context === 'user') {
            this._auth.username = username;
            this._auth.password = password;
        }
        return this;
    };


    var _uses = {};

    function useCreate(name, callback) {
        return new Use(name, callback);
    }

    function Use(name, callback) {

        var that = this;

        this._sdk = _sdks[name].sdk;

	    if (callback) {

		    // ---

	        this._sdk.init(function (err, resources) {

	            callback(err, {

	                api  : that._sdk.api,
	                get  : that._sdk.get,
	                post : that._sdk.post,
	                put  : that._sdk.put,
	                del  : that._sdk.del,

	                // ---

	                setup    : that._sdk.setup,
	                auth     : that._sdk.auth,
	                query    : that._sdk.query,
	                endpoint : that._sdk.endpoint

	            }, resources);

	        });

	    } else {

	        return this;

	    }

    }

    Use.prototype.end = function(callback) {

	    var that = this;

	    // ---

	    that._sdk.endpoint = that._sdk.setup.proxy + '/' + that._sdk.setup.platform + '/api/v1';

	    // ---

	    that._sdk.query = {

		    apiKey    : that._sdk.access.key,
		    locale    : that._sdk.setup.locale,
		    mediaType : that._sdk.setup.type

	    };

	    // ---

	    this._sdk.init(function (err, resources) {

		    if (callback) {

			    callback(err, {

				    api  : that._sdk.api,
				    get  : that._sdk.get,
				    post : that._sdk.post,
				    put  : that._sdk.put,
				    del  : that._sdk.del,

				    // ---

				    setup    : that._sdk.setup,
				    auth     : that._sdk.auth,
				    query    : that._sdk.query,
				    endpoint : that._sdk.endpoint

			    }, resources);

		    }

	    });

    };

	// ---

	Use.prototype.is = function(mixed, value) {

		var that = this;

		// ---

		var sdk = that._sdk;

		// ---

		if (isArray(mixed)) {
			_.each(mixed, function(value) {
				that.is(value);
			});
			return that;
		}

		if (isObject(mixed)) {
			_.each(mixed, function(value, key) {
				that.is(key, value);
			});
			return that;
		}

		that._sdk.setup[mixed] = value || null;

		// ---

		return that;

	};
	Use.prototype.of = function(id, username, password) {

		this._sdk.auth.id = id || null;
		this._sdk.auth.username = username || null;
		this._sdk.auth.password = password || null;

		return this;

	};


    exports = {

        version    : version,
        noConflict : noConflict,

        // ---

        sdks   : {
            get : sdkGet
        },
        SDK    : {
            create : sdkCreate
        },

        // --- Shortcuts

        //connect : connectCreate,
        create : sdkCreate,
        get    : sdkGet,
        use    : useCreate

    };

    return exports;


}({});
