const Mocha = require('mocha');
const describe = Mocha.describe;
const expect = require('chai').expect;
const TestContainers = require('testcontainers');
const GenericContainer = TestContainers.GenericContainer;
const expressSession = require('express-session');
const HazelcastStore = require('../')(expressSession);

let Client = require('hazelcast-client').Client;
let Config = require('hazelcast-client').Config;
let config = new Config.ClientConfig();

describe('HazelcastStore', () => {

    let container;
    let hazelcastClient;

    before(async () => {
        console.info("Starting Hazelcast Cluster...");
        container = await new GenericContainer("hazelcast/hazelcast", "3.12.8")
            .withExposedPorts(5701)
            .start();
        config.networkConfig.addresses.push(`127.0.0.1:${container.getMappedPort(5701)}`);
        await Client.newHazelcastClient(config).then(function(client) {
            hazelcastClient = client
        });
    });

    after(async () => {
        console.info("Stopping Hazelcast Cluster...");
        await hazelcastClient.shutdown();
        await container.stop();
    });

    it('should set', async () => {
        let store = new HazelcastStore({client: hazelcastClient});
        store.set('key', 'val', (data, error) => {
            expect(data).to.equal(null);
            expect(error).to.equal(undefined);
        });
    });

    it('should get', async () => {
        let store = new HazelcastStore({client: hazelcastClient});
        store.set('key1', 'val1', (data, error) => {
            store.get('key1', (data, error) => {
                expect(data).to.equal('val1');
                expect(error).to.equal(undefined);
            });
        });
    });

    it('should destroy', async () => {
        let store = new HazelcastStore({client: hazelcastClient});
        store.set('key2', 'val2', (data, error) => {
            store.destroy('key2', (data, error) => {
                store.get('key2', (data, error) => {
                    expect(data).to.equal(null);
                    expect(error).to.equal(undefined);
                });
            });
        });
    });
});