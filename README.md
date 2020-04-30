Just a little utility to help w/ SSH-ing into remote AWS servers by looking up their private IP addresses.

# .accounts.js

This file needs to be present and contain key/host/etc information with the account id as the key. This will use sts.getCallerIdentity().Account to retrieve which values to use.

```
module.exports = {
  '252838661961': {
    name: 'cit account',
    key: 'path/to/key',
  },
  '492273435069': {
    name: 'prod account',
    key: 'path/to/other/key',
  }
}
```

