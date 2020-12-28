# API

## World

The API is split in 2 :
* the World which is async 
* the World.sync which is sync

The characteristics of the async world is that it will always return something when getting a block, but as a promise. To achieve this it 
may load columns from anvil files or other storage. On the other hand the sync world will not always return blocks and may return null, 
but it will return the block directly with no promise.

The set operations have similar characteristics : the async world will always set the blocks and return a promise, whereas the sync world will 
not always set the blocks, but do the action now and not return a promise.

The 2 world are linked and stay in sync together.

The async world may be more natural for servers (although the sync world can also be used there)
The sync world makes more sense for clients as there is not necessarily somewhere to load more data from (but in some cases this may be incorrect too, think 
multi player clients)

### World([generateChunk,[storageProvider]],[savingInterval])

Create a world instance, takes an optional `generateChunk(chunkX, chunkZ)` function that will get called when a chunk at 
`chunkX` and `chunkZ` need to be generated. Takes a second optional arguments : `storageProvider` containing the regions.
If provided, prismarine-world will first try to load the map from these regions, and then try to generate the world if 
the chunk isn't saved. `savingInterval` default to 50ms.

### World.initialize(iniFunc,length,width,height=256,iniPos=new Vec3(0,0,0))

Initialize the world with a given blocks cube. Useful to load quickly a schematic.

* `iniFunc` is a function(x,y,z) that returns a prismarine-block
* `length`, `width` and `height` are the size to iterate on
* `iniPos` is the position where to start the iteration

Returns a promise containing an array of `{chunkX,chunkZ}`

### World.getColumns()

Return all loaded columns

### World.unloadColumn(chunkX,chunkZ)

Unload column from memory

All the following methods are async and return a promise.

### World.setColumn(chunkX,chunkZ,chunk)

Set `chunk` at `chunkX` and `chunkZ`

### World.getColumn(chunkX,chunkZ)

Return the column at `chunkX` and `chunkZ`

### World.getBlock(pos)

Get the [Block](https://github.com/PrismarineJS/prismarine-block) at [pos](https://github.com/andrewrk/node-vec3)

### World.setBlock(pos,block)

Set the [Block](https://github.com/PrismarineJS/prismarine-block) at [pos](https://github.com/andrewrk/node-vec3)

### World.getBlockStateId(pos)

Get the block state at `pos`

### World.getBlockType(pos)

Get the block type at `pos`

### World.getBlockData(pos)

Get the block data (metadata) at `pos`

### World.getBlockLight(pos)

Get the block light at `pos`

### World.getSkyLight(pos)

Get the block sky light at `pos`

### World.getBiome(pos)

Get the block biome id at `pos`

### World.setBlockStateId(pos, stateId)

Set the block state `stateId` at `pos`

### World.setBlockType(pos, id)

Set the block type `id` at `pos`

### World.setBlockData(pos, data)

Set the block `data` (metadata) at `pos`

### World.setBlockLight(pos, light)

Set the block `light` at `pos`

### World.setSkyLight(pos, light)

Set the block sky `light` at `pos`

### World.setBiome(pos, biome)

Set the block `biome` id at `pos`

### World.waitSaving()

Returns a promise that is resolved when all saving is done.

### World.sync(asyncWorld)

Build a sync world, will delegate all the saving work to the async one

### World.initialize(iniFunc,length,width,height=256,iniPos=new Vec3(0,0,0))

Initialize the world with a given blocks cube. Useful to load quickly a schematic.

* `iniFunc` is a function(x,y,z) that returns a prismarine-block
* `length`, `width` and `height` are the size to iterate on
* `iniPos` is the position where to start the iteration

Returns an array of `{chunkX,chunkZ}`

This works only on loaded columns.

### World.sync.getColumns()

Return all loaded columns

All the following methods are sync.

### World.sync.unloadColumn(chunkX,chunkZ)

Unload column from memory

### World.sync.setColumn(chunkX,chunkZ,chunk)

Set `chunk` at `chunkX` and `chunkZ`

### World.sync.getColumn(chunkX,chunkZ)

Return the column at `chunkX` and `chunkZ`

### World.sync.getBlock(pos)

Get the [Block](https://github.com/PrismarineJS/prismarine-block) at [pos](https://github.com/andrewrk/node-vec3)

### World.sync.setBlock(pos,block)

Set the [Block](https://github.com/PrismarineJS/prismarine-block) at [pos](https://github.com/andrewrk/node-vec3)

### World.sync.getBlockStateId(pos)

Get the block state at `pos`

### World.sync.getBlockType(pos)

Get the block type at `pos`

### World.sync.getBlockData(pos)

Get the block data (metadata) at `pos`

### World.sync.getBlockLight(pos)

Get the block light at `pos`

### World.sync.getSkyLight(pos)

Get the block sky light at `pos`

### World.sync.getBiome(pos)

Get the block biome id at `pos`

### World.sync.setBlockStateId(pos, stateId)

Set the block state `stateId` at `pos`

### World.sync.setBlockType(pos, id)

Set the block type `id` at `pos`

### World.sync.setBlockData(pos, data)

Set the block `data` (metadata) at `pos`

### World.sync.setBlockLight(pos, light)

Set the block `light` at `pos`

### World.sync.setSkyLight(pos, light)

Set the block sky `light` at `pos`

### World.sync.setBiome(pos, biome)

Set the block `biome` id at `pos`

## Iterators

Iterators are used to iterate over blocks. Use cases include finding specific blocks quickly and computing a ray cast.

### ManathanIterator (x, y, maxDistance)

2D spiral iterator, useful to iterate on columns that are centered on bot position

#### next()

return null or the next position (Vec3)

### OctahedronIterator (start, maxDistance) 

start is a Vec3

#### next()

return null or the next position (Vec3)

### RaycastIterator (pos, dir, maxDistance) 

pos and dir are Vec3

RaycastIterator iterates along a ray starting at `pos` in `dir` direction. 
It steps exactly 1 block at a time, returning the block coordinates and the face by which the ray entered the block.

#### next()

return null or the next position (Vec3)