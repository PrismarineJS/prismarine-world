/* eslint-env mocha */

const flatMap = require('flatmap')
const range = require('range').range
const bufferEqual = require('buffer-equal')
const World = require('../')('1.8')
const Chunk = require('prismarine-chunk')('1.8')
const Vec3 = require('vec3')
const assert = require('assert')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

describe('saving and loading works', function () {
  this.timeout(60 * 1000)

  function generateRandomChunk (chunkX, chunkZ) {
    var chunk = new Chunk()

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

  let regionPath = 'world/testRegion'
  before((cb) => {
    mkdirp(regionPath, cb)
  })

  after(cb => {
    rimraf(regionPath, cb)
  })

  let originalWorld
  let size = 3

  it('save the world', async () => {
    originalWorld = new World(generateRandomChunk, regionPath)
    await Promise.all(
      flatMap(range(0, size), (chunkX) => range(0, size).map(chunkZ => ({chunkX, chunkZ})))
        .map(({chunkX, chunkZ}) => originalWorld.getColumn(chunkX, chunkZ))
    )
    await originalWorld.waitSaving()
  })

  it('load the world correctly', async () => {
    const loadedWorld = new World(null, regionPath)
    await Promise.all(
      flatMap(range(0, size), (chunkX) => range(0, size).map(chunkZ => ({chunkX, chunkZ})))
        .map(async ({chunkX, chunkZ}) => {
          const originalChunk = await originalWorld.getColumn(chunkX, chunkZ)
          const loadedChunk = await loadedWorld.getColumn(chunkX, chunkZ)
          assert.equal(originalChunk.getBlockType(new Vec3(0, 50, 0)), loadedChunk.getBlockType(new Vec3(0, 50, 0)), 'wrong block type at 0,50,0 of chunk ' + chunkX + ',' + chunkZ)
          assert(bufferEqual(originalChunk.dump(), loadedChunk.dump()))
        })
    )
  })
})
