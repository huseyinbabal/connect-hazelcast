[![Build Status](https://travis-ci.org/huseyinbabal/connect-hazelcast.svg?branch=master)](https://travis-ci.org/huseyinbabal/connect-hazelcast)

**connect-hazelcast** is a Hazelcast session store backed by Hazelcast.

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

You can pass hazelcast client directly if you have an existing one, or else see the following options to use;

- `client` An existing hazelcast client
- `members` Hazelcast cluster members in a format `[{host: "address1", port: "port1", host: "address2", port: "port2"}]`
- `discoveryEnabled` If you want to use [Hazelcast Cloud](https://cloud.hazelcast.com), you can set this one as `true`
- `token` If you are using [Hazelcast Cloud](https://cloud.hazelcast.com), you can pass token as described [here](https://docs.cloud.hazelcast.com/docs/nodejs-client)
- `groupName` Name of hazelcast cluster
- `groupPassword` Password of hazelcast cluster