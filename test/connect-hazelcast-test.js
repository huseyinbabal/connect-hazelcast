'use strict';

const Mocha = require('mocha');
const describe = Mocha.describe;
const expect = require('chai').expect;
const TestContainers = require('testcontainers');
const GenericContainer = TestContainers.GenericContainer;
const expressSession = require('express-session');
const HazelcastStore = require('../')(expressSession);

const { Client } = require('hazelcast-client');

describe('HazelcastStore', () => {

    let container;
    let hazelcastClient;

    before(async () => {
        console.info('Starting Hazelcast Cluster...');
        container = await new GenericContainer('hazelcast/hazelcast', '4.0.3')
            .withExposedPorts(5701)
            .start();
        hazelcastClient = await Client.newHazelcastClient({
            network: {
                clusterMembers: [ `127.0.0.1:${container.getMappedPort(5701)}` ]
            }
        });
    });

    after(async () => {
        console.info('Stopping Hazelcast Cluster...');
        await hazelcastClient.shutdown();
        await container.stop();
    });

    it('set: should store session', (done) => {
        const store = new HazelcastStore({client: hazelcastClient});
        store.set('keySet', 'val', (error, data) => {
            if (error) {
                return done(error);
            }
            expect(data).to.equal('OK');
            expect(error).to.equal(null);
            done();
        });
    });

    it('set: should respect ttl option', (done) => {
        const store = new HazelcastStore({client: hazelcastClient, ttl: 1});
        store.set('keySetWithTTL1', 'val', (error) => {
            if (error) {
                return done(error);
            }
            // check that session expires
            setTimeout(() => {
                store.get('keySetWithTTL1', (error, data) => {
                    if (error) {
                        return done(error);
                    }
                    expect(data).to.equal(null);
                    expect(error).to.equal(null);
                    done();
                });
            }, 2000);
        });
    });

    it('set: should respect ttl cookie', (done) => {
        const store = new HazelcastStore({client: hazelcastClient, ttl: Number.MAX_SAFE_INTEGER});
        const session = {
            cookie: {
                // already expired session
                expires: (new Date(Date.now() - 3000)).toUTCString()
            }
        };
        store.set('keySetWithTTL2', session, (error) => {
            if (error) {
                return done(error);
            }
            // check that session expired
            setTimeout(() => {
                store.get('keySetWithTTL2', (error, data) => {
                    if (error) {
                        return done(error);
                    }
                    expect(data).to.equal(null);
                    expect(error).to.equal(null);
                    done();
                });
            }, 1000);
        });
    });

    it('get: should retrieve existing session', (done) => {
        const store = new HazelcastStore({client: hazelcastClient});
        store.set('keyGet1', 'val', (error) => {
            if (error) {
                return done(error);
            }
            store.get('keyGet1', (error, data) => {
                if (error) {
                    return done(error);
                }
                expect(data).to.equal('val');
                expect(error).to.equal(null);
                done();
            });
        });
    });

    it('get: should return null for non-existing session', (done) => {
        const store = new HazelcastStore({client: hazelcastClient});
        store.get('keyGet2', (error, data) => {
            if (error) {
                return done(error);
            }
            expect(data).to.equal(null);
            expect(error).to.equal(null);
            done();
        });
    });

    it('destroy: should clear sessions', (done) => {
        const store = new HazelcastStore({client: hazelcastClient});
        store.set('keyDestroy', 'val', (error) => {
            if (error) {
                return done(error);
            }
            store.destroy('keyDestroy', (error) => {
                if (error) {
                    return done(error);
                }
                store.get('keyDestroy', (error, data) => {
                    if (error) {
                        return done(error);
                    }
                    expect(data).to.equal(null);
                    expect(error).to.equal(null);
                    done();
                });
            });
        });
    });

    it('touch: should update ttl when disableTouch=false', (done) => {
        const store = new HazelcastStore({client: hazelcastClient, ttl: 3});
        store.set('keyTouch1', 'val', (error) => {
            if (error) {
                return done(error);
            }
            setTimeout(() => {
                store.touch('keyTouch1', 'val', (error) => {
                    if (error) {
                        return done(error);
                    }
                    setTimeout(() => {
                        // the session should be still present after 4 seconds
                        store.get('keyTouch1', (error, data) => {
                            if (error) {
                                return done(error);
                            }
                            expect(data).to.equal('val');
                            expect(error).to.equal(null);
                            done();
                        });
                    }, 2000);
                });
            }, 2000);
        });
    });

    it('touch: should not update ttl when disableTouch=true', (done) => {
        const store = new HazelcastStore({client: hazelcastClient, ttl: 3, disableTouch: true});
        store.set('keyTouch2', 'val', (error) => {
            if (error) {
                return done(error);
            }
            setTimeout(() => {
                store.touch('keyTouch2', 'val', (error) => {
                    if (error) {
                        return done(error);
                    }
                    setTimeout(() => {
                        // the session should be gone after 4 seconds
                        store.get('keyTouch2', (error, data) => {
                            if (error) {
                                return done(error);
                            }
                            expect(data).to.equal(null);
                            expect(error).to.equal(null);
                            done();
                        });
                    }, 2000);
                });
            }, 2000);
        });
    });
});
