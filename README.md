# prismarine-world

[![NPM version](https://img.shields.io/npm/v/prismarine-world.svg)](http://npmjs.com/package/prismarine-world)

## Usage

See [example.js](example.js)

## API

### World

#### World([generateChunk])

Create a world instance, takes an optional `generateChunk(chunkX, chunkZ)` function that will get called when a chunk at 
`chunkX` and `chunkZ` need to be generated.

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

## History

### 0.2.0

* Add chunk generation to the API

### 0.1.0

* First version, basic functionality
