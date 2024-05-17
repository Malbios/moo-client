# moo-client-ts
![automated-checks-badge](https://github.com/Malbios/moo-client-ts/actions/workflows/pull-request-on-main.yml/badge.svg)
![code-coverage-badge](https://malbios.github.io/moo-client-ts/coverage-badge.svg)

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