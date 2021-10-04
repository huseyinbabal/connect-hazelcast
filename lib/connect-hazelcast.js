'use strict';

const Util = require('util');

module.exports = (session) => {

    const Store = session.Store;

    function HazelcastStore(options) {
        if (!(this instanceof HazelcastStore)) {
            throw new TypeError('Cannot call HazelcastStore constructor as a function');
        }

        options = options || {};
        Store.call(this, options);

        if (options.client === undefined) {
            throw new Error('A client is not provided');
        }
        this.client = options.client;
        this.prefix = options.prefix == null? 'sessions': options.prefix;
        this.ttl = options.ttl || 86400; // one day (seconds)
        this.disableTouch = options.disableTouch || false;
    }

    Util.inherits(HazelcastStore, Store);

    HazelcastStore.prototype.get = function (sid, cb) {
        this.client.getMap(this.prefix).then(map => {
            map.get(sid).then(value => {
                cb(null, value);
            }).catch(cb);
        });
    };

    HazelcastStore.prototype.set = function (sid, session, cb) {
        this.client.getMap(this.prefix).then(map => {
            map.set(sid, session, this._extractTTL(session)).then(() => {
                cb(null, 'OK');
            }).catch(cb);
        });
    };

    HazelcastStore.prototype.destroy = function (sid, cb) {
        this.client.getMap(this.prefix).then(map => {
            map.remove(sid).then(() => {
                cb(null, 'OK');
            }).catch(cb);
        });
    };

    HazelcastStore.prototype.touch = function (sid, session, cb) {
        if (this.disableTouch) {
            return cb();
        }

        this.client.getMap(this.prefix).then(map => {
            map.setTtl(sid, this._extractTTL(session)).then(result => {
                if (result) {
                    cb(null, 'OK');
                } else {
                    cb(null, 'EXPIRED');
                }
            }).catch(cb);
        });
    };

    HazelcastStore.prototype._extractTTL = function (session) {
        if (session && session.cookie && session.cookie.expires) {
            const ms = Number(new Date(session.cookie.expires)) - Date.now();
            // default to 1 ms when the session is expired
            return ms > 0 ? ms : 1;
        }
        return this.ttl * 1000;
    };

    return HazelcastStore;
};
