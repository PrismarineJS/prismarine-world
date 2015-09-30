# prismarine-world

[![NPM version](https://img.shields.io/npm/v/prismarine-world.svg)](http://npmjs.com/package/prismarine-world)

## Usage

See [example.js](example.js)

## API

### World

#### World()

Build a new world

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
