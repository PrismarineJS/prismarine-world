## History

### 3.7.0
* [Update CI to Node 24 (#160)](https://github.com/PrismarineJS/prismarine-world/commit/3dea527a5ce2c37f771496470172ce3f64587418) (thanks @rom1504)
* [Fix publish condition for npm-publish v4 (#159)](https://github.com/PrismarineJS/prismarine-world/commit/b0c44b621d3318601e9ec11bf3a87b741e19346f) (thanks @rom1504)
* [Switch to trusted publishing via OIDC (#158)](https://github.com/PrismarineJS/prismarine-world/commit/515219a59b7319689d206eadcd897f1f1389bb7c) (thanks @rom1504)
* [Bump expect from 29.7.0 to 30.1.2 (#156)](https://github.com/PrismarineJS/prismarine-world/commit/17752af927b24d7b09d22c43974aaa34af48b093) (thanks @dependabot[bot])
* [node 22 (#147)](https://github.com/PrismarineJS/prismarine-world/commit/67836a58eebcc28d13d19f62023756a4e639bc0a) (thanks @rom1504)
* [fix: The raycast was skipping the block that the client is inside. (#145)](https://github.com/PrismarineJS/prismarine-world/commit/63b6489c12a35abc9abf466c6644f51cef136a32) (thanks @zardoy)
* [Bump mocha from 10.8.2 to 11.0.1 (#146)](https://github.com/PrismarineJS/prismarine-world/commit/1d588910d7241821d357c326bfa951cbd4f604d7) (thanks @dependabot[bot])
* [Add missing RaycastResult Import (#142)](https://github.com/PrismarineJS/prismarine-world/commit/e46d026985b28f4c3f4cfe825ba15e743958e026) (thanks @Ell1ott)

### 3.6.3

* Add intersect property to raycast result type [#137](https://github.com/PrismarineJS/prismarine-world/pull/137)
* Update workflow templates
* Update to Node 18

### 3.6.2

* Fix chunk saving reference errors (@kf106 & @moonborrow) [#100](https://github.com/PrismarineJS/prismarine-world/pull/100)
* Fix typo in README.md (@takeru) [#108](https://github.com/PrismarineJS/prismarine-world/pull/108)
* Improved types (@TRCYX) [#99](https://github.com/PrismarineJS/prismarine-world/pull/99)
* Fix ManhattanIterator [#101](https://github.com/PrismarineJS/prismarine-world/pull/101) (@IceTank)

### 3.6.1

* Update mcdata

### 3.6.0

* Added match while check intersect (@sefirosweb)

### 3.5.0

* fix getBlock not setting the position of the block

### 3.4.0

* add block update events

### 3.3.1

* Fix raycasting when ray is axis aligned

### 3.3.0

* Add exact raycasting

### 3.2.0

* add iterators

### 3.1.1

* fix world.sync.getChunks()

### 3.1.0

* implement unload column

### 3.0.0

* BREAKING: regionFolder is now a provider (for example an Anvil instance)

### 2.3.0

* add .sync

### 2.2.0

* add get/set block state id
* perf improvement of saving (thanks @Karang)

### 2.1.0

* disable saving if savingInterval is 0
* standardjs
* no gulp

### 2.0.0

* cross version support

### 1.0.2

* update dependencies, fix issue with provider anvil

### 1.0.1

* update to babel6

### 1.0.0

* bump dependencies

### 0.5.5

* bump prismarine-provider-anvil

### 0.5.4

* fix negative iniPos in initialize

### 0.5.3

* fix initialize

### 0.5.2

* bump prismarine-chunk

### 0.5.1

* fix initialize for iniPos%16 !=0

### 0.5.0

* add World.initialize

### 0.4.0

* use prismarine-provide-anvil 0.1.0 to implement anvil loading and saving

### 0.3.3

* fix minecraft-chunk bug

### 0.3.2

* fix getBlockData

### 0.3.1

* check if the region is available in the anvil files

### 0.3.0

* Add anvil loading

### 0.2.0

* Add chunk generation to the API

### 0.1.0

* First version, basic functionality
