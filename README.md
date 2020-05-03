# prismarine-world

[![NPM version](https://img.shields.io/npm/v/prismarine-world.svg)](http://npmjs.com/package/prismarine-world)

## Usage

See [example.js](example.js)

## API

### World

#### World([generateChunk,[regionDir]],[savingInterval])

Create a world instance, takes an optional `generateChunk(chunkX, chunkZ)` function that will get called when a chunk at 
`chunkX` and `chunkZ` need to be generated. Takes a second optional arguments : `regionDir` containing the anvil regions.
If provided, prismarine-world will first try to load the map from these regions, and then try to generate the world if 
the chunk isn't saved. `savingInterval` default to 50ms.

#### World.initialize(iniFunc,length,width,height=256,iniPos=new Vec3(0,0,0))

Initialize the world with a given blocks cube. Useful to load quickly a schematic.

* `iniFunc` is a function(x,y,z) that returns a prismarine-block
* `length`, `width` and `height` are the size to iterate on
* `iniPos` is the position where to start the iteration

Returns a promise containing an array of `{chunkX,chunkZ}`

#### World.getColumns()

Return all loaded columns


All the following methods are async and return a promise.

#### World.setColumn(chunkX,chunkZ,chunk)

Set `chunk` at `chunkX` and `chunkZ`

#### World.getColumn(chunkX,chunkZ)

Return the column at `chunkX` and `chunkZ`

#### World.getBlock(pos)

Get the [Block](https://github.com/PrismarineJS/prismarine-block) at [pos](https://github.com/andrewrk/node-vec3)

#### World.setBlock(pos,block)

Set the [Block](https://github.com/PrismarineJS/prismarine-block) at [pos](https://github.com/andrewrk/node-vec3)

#### World.getBlockStateId(pos)

Get the block state at `pos`

#### World.getBlockType(pos)

Get the block type at `pos`

#### World.getBlockData(pos)

Get the block data (metadata) at `pos`

#### World.getBlockLight(pos)

Get the block light at `pos`

#### World.getSkyLight(pos)

Get the block sky light at `pos`

#### World.getBiome(pos)

Get the block biome id at `pos`

#### World.setBlockStateId(pos, stateId)

Set the block state `stateId` at `pos`

#### World.setBlockType(pos, id)

Set the block type `id` at `pos`

#### World.setBlockData(pos, data)

Set the block `data` (metadata) at `pos`

#### World.setBlockLight(pos, light)

Set the block `light` at `pos`

#### World.setSkyLight(pos, light)

Set the block sky `light` at `pos`

#### World.setBiome(pos, biome)

Set the block `biome` id at `pos`

#### World.waitSaving()

Returns a promise that is resolved when all saving is done.

## History

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
