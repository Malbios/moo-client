# moo-client-ts
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