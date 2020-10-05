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

The following list contains all supported options:

- `client` An existing hazelcast client. Required option.
- `prefix` IMap name to use for storing sessions. Defaults to `sessions`.
- `ttl` Default TTL in seconds to use when the session cookie does not have a `expires` value. Defaults to `86400` (one day).
- `disableTouch` When set to `true`, TTL is reset on each user interaction with the server. Defaults to `false`.
