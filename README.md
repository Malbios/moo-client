# moo-client-ts
![checks-badge-main](https://github.com/Malbios/moo-client-ts/actions/workflows/push-checks-main.yml/badge.svg)
![code-coverage-badge-main](https://malbios.github.io/moo-client-ts/main/coverage-badge.svg)

![checks-badge-dev](https://github.com/Malbios/moo-client-ts/actions/workflows/push-checks-dev.yml/badge.svg)
![code-coverage-badge-dev](https://malbios.github.io/moo-client-ts/dev/coverage-badge.svg)

This can be used to get (and eventually set) verb code in a MOO.

## Example (read verb code)
```typescript
import { MooClient } from 'moo-client-ts';

const client = new MooClient('my.moo.com', 7777, 'MyUser', 'MyPassword');

const verbData = await client.getVerbData('my-object', 'my-verb');

console.log(verbData);
```
=>
```TypeScript
VerbData {
  reference: '#131:test',
  name: 'MyUser:test',
  code: [ '"Usage: ;#131:test();";', 'player:tell("test");' ]
}
```

## Example (write verb code)
TODO