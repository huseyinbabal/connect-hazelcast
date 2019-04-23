const HazelcastClient = require('hazelcast-client');
const Util = require('util');

const Client = HazelcastClient.Client;
const Config = HazelcastClient.Config;

module.exports = (session) => {

    const Store = session.Store;

    function HazelcastStore(options) {
        if (!(this instanceof HazelcastStore)) {
            throw new TypeError('Cannot call HazelcastStore constructor as a function');
        }

        options = options || {};
        Store.call(this, options);

        this.prefix = options.prefix == null? 'sessions': options.prefix;

        if (typeof options.client === 'undefined') {
            let clientConfig = new Config.ClientConfig();
            if (options.discoveryToken) {
                clientConfig.networkConfig.cloudConfig.enabled = options.discoveryEnabled;
                clientConfig.networkConfig.cloudConfig.discoveryToken = options.discoveryToken;
            }
            clientConfig.properties['hazelcast.client.statistics.enabled'] = true;
            clientConfig.networkConfig.redoOperation = true;
            clientConfig.networkConfig.connectionAttemptLimit = 10;
            clientConfig.groupConfig.name = options.groupName;
            clientConfig.groupConfig.password = options.groupPassword;
            Client.newHazelcastClient(clientConfig).then(client => {
                this.client = client;
            }).catch(error => {
                throw new Error(`Error occurred while connecting hazelcast instance. ${error}`);
            })
        } else {
            this.client = options.client;
        }
    }

    Util.inherits(HazelcastStore, Store);

    HazelcastStore.prototype.get = function get(sid, fn) {
        this.client.getMap(this.prefix).then(map => {
            map.get(sid).then(value => {
                fn(null, value);
            }).catch(error => {
                fn(error);
            })
        })
    };

    HazelcastStore.prototype.set = function get(sid, session, fn) {
        let store = this;
        store.client.getMap(store.prefix).then(map => {
            map.set(sid, session).then(value => {
                fn(null, value);
            }).catch(error => {
                fn(error);
            })
        })
    };

    HazelcastStore.prototype.destroy = function get(sid, fn) {
        this.client.getMap(this.prefix).then(map => {
            map.remove(sid).then(value => {
                fn(null, value);
            }).catch(error => {
                fn(error);
            })
        })
    };

    return HazelcastStore
};