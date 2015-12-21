# nodal-angular

Welcome to the Angular SPA plugin for [Nodal](https://github.com/keithwhor/nodal)!

This module contains some simple CLI tools for working with a new Angular project,
as well as an initializer that compiles your Angular SPA for you.

## Installation

Installation is simple.

1. Begin a new Nodal project with `nodal new`
2. In your new project directory, type `npm install nodal-angular --save`
3. Now type `nodal-angular init`
4. Next, go to `app/app.js` and find the following line:

```javascript
/* Import Initializers */
const StaticAssetInitializer = Nodal.require('initializers/static_asset_initializer.js');
```

Add the following line:

```javascript
const AngularInitializer = require('nodal-angular').Initializer;
```

5. In the same file, find:

```javascript
/* Initializers */
this.initializers.use(StaticAssetInitializer);
```

And change it to:

```javascript
/* Initializers */
this.initializers.use(AngularInitializer);
this.initializers.use(StaticAssetInitializer);
```

Make sure you assign your AngularInitializer *first*! It copies files to be
served by your StaticAssetInitializer.

All Done!
