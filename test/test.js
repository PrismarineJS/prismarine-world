/* eslint-env jest */

const bufferEqual = require('buffer-equal')
const World = require('../')('1.8')
const Chunk = require('prismarine-chunk')('1.8')
const Vec3 = require('vec3').Vec3
const assert = require('assert')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

describe('saving and loading works', function () {
  function generateRandomChunk (chunkX, chunkZ) {
    const chunk = new Chunk()

    for (var x = 0; x < 16; x++) {
      for (var z = 0; z < 16; z++) {
        chunk.setBlockType(new Vec3(x, 50, z), Math.floor(Math.random() * 50))
        for (var y = 0; y < 256; y++) {
          chunk.setSkyLight(new Vec3(x, y, z), 15)
        }
      }
    }

    return chunk
  }

  const regionPath = 'world/testRegion'
  beforeAll((cb) => {
    mkdirp(regionPath, cb)
  })

  afterAll(cb => {
    rimraf(regionPath, cb)
  })

  let originalWorld
  const size = 3

  it('save the world', async () => {
    originalWorld = new World(generateRandomChunk, regionPath)
    await originalWorld.loadColumns(0, 0, size - 1, size - 1)
    await originalWorld.waitSaving()
  })

  it('load the world correctly', async () => {
    const loadedWorld = new World(null, regionPath)
    await loadedWorld.loadColumns(0, 0, size - 1, size - 1)
    for (let chunkZ = 0; chunkZ < size; chunkZ++) {
      for (let chunkX = 0; chunkX < size; chunkX++) {
        const originalChunk = originalWorld.getColumn(chunkX, chunkZ)
        const loadedChunk = loadedWorld.getColumn(chunkX, chunkZ)
        assert.strictEqual(originalChunk.getBlockType(new Vec3(0, 50, 0)), loadedChunk.getBlockType(new Vec3(0, 50, 0)), 'wrong block type at 0,50,0 of chunk ' + chunkX + ',' + chunkZ)
        assert(bufferEqual(originalChunk.dump(), loadedChunk.dump()))
      }
    }
  })

  it('setBlocks', async () => {
    const world = new World(null, regionPath)
    await world.loadColumns(0, 0, size - 1, size - 1)
    for (let i = 0; i < 10000; i++) {
      world.setBlockType(new Vec3(Math.random() * (16 * size - 1), Math.random() * 255, Math.random() * (16 * size - 1)), 0)
    }
    await world.waitSaving()
  })

  it('initialize', async () => {
    const world = new World(null, regionPath)
    await world.loadColumns(0, 0, size - 1, size - 1)
    world.initialize((x, y, z) => {
      return 0
    }, size * 16, size * 16, 256, new Vec3(0, 0, 0))
    await world.waitSaving()
  })
})
