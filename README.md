# Blend.js

A lightweight asynchronous module definition(AMD) library

## Usage

```javascript
// module `a` depend on `b`
define('a', ['b'], function (b) {
	b();
})

// module `b` depend on `c` and `d`
define('b', ['c', 'd'], function (c, d) {
	return function () {
		console.log(c + d);
	}
})

// module `c` depend on nothing
define('c', function () {
	return 2;
})

// module `d` depend on nothing
define('d', function (e) {
	e(3);
})
```

The output is 

>>> 5

*Note*: you can define the modules in any order.

## License

MIT license (http://towry.me/mit-license)

---

Copyright 2015 by Towry Wang
