[![Build Status](https://travis-ci.org/huseyinbabal/connect-hazelcast.svg?branch=master)](https://travis-ci.org/huseyinbabal/connect-hazelcast)

**connect-hazelcast** is a Hazelcast session store backed by Hazelcast 4.x.

Quick Setup
-----
```sh
npm install connect-hazelcast express-session
```

Pass the `express-session` to `connect-hazelcast` to create a `HazelcastStore` constructor.

```js
const session = require('express-session');
const HazelcastStore = require('connect-hazelcast')(session);

app.use(session({
    store: new HazelcastStore(options),
    secret: 'ssshhh'
}));
```

Options
-------

You can pass Hazelcast client directly (in `client` option) if you have an existing one, or else you can pass options to be used for the client initialization.

The following list contains all supported options:

- `client` An existing hazelcast client.
- `members` Hazelcast cluster members in a format `['address1:port1', 'address2:port2']`.
- `discoveryToken` If you are using [Hazelcast Cloud](https://cloud.hazelcast.com), you can pass token as described [here](https://docs.cloud.hazelcast.com/docs/nodejs-client).
- `clusterName` Name of the cluster.
- `customCredentials` Custom credentials for the cluster.
- `ttl` Default TTL in seconds to use when the session cookie does not have a `expires` value. Defaults to `86400` (one day).
- `disableTouch` When set to `true`, TTL is reset on each user interaction with the server. Defaults to `false`.
