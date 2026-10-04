/* eslint-env mocha */

const flatMap = require('flatmap')
const range = require('range').range
const bufferEqual = require('buffer-equal')
const World = require('../')('1.8')
const Chunk = require('prismarine-chunk')('1.8')
const Vec3 = require('vec3').Vec3
const assert = require('assert')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const Anvil = require('prismarine-provider-anvil').Anvil('1.8')

describe('saving and loading works', function () {
  function generateRandomChunk (chunkX, chunkZ) {
    const chunk = new Chunk()

    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        chunk.setBlockType(new Vec3(x, 50, z), Math.floor(Math.random() * 50))
        for (let y = 0; y < 256; y++) {
          chunk.setSkyLight(new Vec3(x, y, z), 15)
        }
      }
    }

    return chunk
  }

  const regionPath = 'world/testRegion'
  before((cb) => {
    mkdirp(regionPath, cb)
  })

  after(cb => {
    rimraf(regionPath, cb)
  })

  let originalWorld
  const size = 3

  it('save the world', async () => {
    originalWorld = new World(generateRandomChunk, new Anvil(regionPath))
    await Promise.all(
      flatMap(range(0, size), (chunkX) => range(0, size).map(chunkZ => ({ chunkX, chunkZ })))
        .map(({ chunkX, chunkZ }) => originalWorld.getColumn(chunkX, chunkZ))
    )
    await originalWorld.waitSaving()
  })

  it('load the world correctly', async () => {
    const loadedWorld = new World(null, new Anvil(regionPath))
    await Promise.all(
      flatMap(range(0, size), (chunkX) => range(0, size).map(chunkZ => ({ chunkX, chunkZ })))
        .map(async ({ chunkX, chunkZ }) => {
          const originalChunk = await originalWorld.getColumn(chunkX, chunkZ)
          const loadedChunk = await loadedWorld.getColumn(chunkX, chunkZ)
          assert.strictEqual(originalChunk.getBlockType(new Vec3(0, 50, 0)), loadedChunk.getBlockType(new Vec3(0, 50, 0)), 'wrong block type at 0,50,0 of chunk ' + chunkX + ',' + chunkZ)
          assert(bufferEqual(originalChunk.dump(), loadedChunk.dump()))
        })
    )
  })

  it('setBlocks', async () => {
    const world = new World(null, new Anvil(regionPath))
    for (let i = 0; i < 10000; i++) {
      await world.setBlockType(new Vec3(Math.random() * (16 * size - 1), Math.random() * 255, Math.random() * (16 * size - 1)), 0)
    }
    await world.waitSaving()
  })
})

describe('block entity access', function () {
  const Vec3 = require('vec3').Vec3
  const Chunk = require('prismarine-chunk')('1.8')

  function generateChunk () {
    return new Chunk()
  }

  it('accesses raw block entities using world coordinates', async () => {
    const world = new World(generateChunk)
    const pos = new Vec3(-1, 42, 16)
    const nbt = { id: 'Chest', Items: [{ Slot: 0, id: 'minecraft:stone', Count: 1 }] }

    await world.setBlockEntity(pos, nbt)
    assert.strictEqual(await world.getBlockEntity(pos), nbt)
    assert.strictEqual(world.sync.getBlockEntity(pos), nbt)

    await world.removeBlockEntity(pos)
    assert.strictEqual(await world.getBlockEntity(pos), undefined)
  })

  it('does not bypass unloaded-column semantics in the sync view', () => {
    const world = new World(null)
    const pos = new Vec3(0, 42, 0)
    const nbt = { id: 'Chest' }

    assert.strictEqual(world.sync.getBlockEntity(pos), undefined)
    world.sync.setBlockEntity(pos, nbt)
    assert.strictEqual(world.sync.getBlockEntity(pos), undefined)
  })

  it('defensively copies memory-only observations and preserves data values', async () => {
    const world = new World(generateChunk)
    const pos = new Vec3(1, 42, 2)
    const bigIntValue = typeof BigInt === 'function' ? BigInt(3) : 3
    const protoData = JSON.parse('{"__proto__":{"x":1}}')
    const observation = {
      kind: 'chest',
      slots: [{ type: 1, count: 2, nbt: { value: bigIntValue, protoData }, bytes: Buffer.from([1, 2]), components: new Map([['foo', { value: 4 }]]) }],
      stale: false,
      observedAt: 123
    }

    await world.setObservedBlockInventory(pos, observation, 'copy-test')
    observation.slots[0].count = 99
    const stored = await world.getObservedBlockInventory(pos)
    assert.strictEqual(stored.slots[0].count, 2)
    assert.strictEqual(stored.slots[0].nbt.value, bigIntValue)
    assert.ok(Object.prototype.hasOwnProperty.call(stored.slots[0].nbt.protoData, '__proto__'))
    assert.deepStrictEqual(Object.getOwnPropertyDescriptor(stored.slots[0].nbt.protoData, '__proto__').value, { x: 1 })
    assert.strictEqual(Object.getPrototypeOf(stored.slots[0].nbt.protoData), Object.prototype)
    assert.deepStrictEqual(Array.from(stored.slots[0].bytes), [1, 2])
    assert.deepStrictEqual(stored.slots[0].components.get('foo'), { value: 4 })
    stored.slots[0].count = 100
    assert.strictEqual((await world.getObservedBlockInventory(pos)).slots[0].count, 2)
    world.sync.removeObservedBlockInventory(pos, 'copy-test')
    assert.strictEqual(await world.getObservedBlockInventory(pos), null)
  })

  it('rejects observations without the public snapshot fields', async () => {
    const world = new World(generateChunk)
    await assert.rejects(world.setObservedBlockInventory(new Vec3(0, 0, 0), { slots: [] }, 'validation-test'), /kind, slots, stale, and observedAt/)
  })

  it('keeps observer ownership separate while exposing a shared aggregate', async () => {
    const world = new World(generateChunk)
    const pos = new Vec3(3, 42, 4)
    const observerA = { kind: 'chest', slots: [{ id: 'stone', count: 1 }], stale: false, observedAt: 1 }
    const observerB = { kind: 'chest', slots: [{ id: 'dirt', count: 2 }], stale: false, observedAt: 2 }

    await world.setObservedBlockInventory(pos, observerA, 'a')
    await world.setObservedBlockInventory(pos, observerB, 'b')
    assert.deepStrictEqual((await world.getObservedBlockInventory(pos)).slots[0], { id: 'dirt', count: 2 })
    await world.removeObservedBlockInventory(pos, 'a')
    assert.deepStrictEqual(await world.getObservedBlockInventory(pos, 'a'), null)
    assert.deepStrictEqual((await world.getObservedBlockInventory(pos, 'b')).slots[0], { id: 'dirt', count: 2 })

    await world.setObservedBlockInventory(pos, observerA, 'a')
    await world.removeObservedBlockInventory(pos, 'b')
    assert.deepStrictEqual(await world.getObservedBlockInventory(pos, 'b'), null)
    assert.deepStrictEqual((await world.getObservedBlockInventory(pos, 'a')).slots[0], { id: 'stone', count: 1 })

    await world.setObservedBlockInventory(pos, observerB, 'b')
    await world.removeObservedBlockInventory(pos, 'a')
    assert.deepStrictEqual((await world.getObservedBlockInventory(pos, 'b')).slots[0], { id: 'dirt', count: 2 })
    await assert.rejects(world.removeObservedBlockInventory(pos, null), /observer must be a string or symbol/)
  })

  it('keeps publish order when only stale status changes', async () => {
    const world = new World(generateChunk)
    const pos = new Vec3(3, 42, 4)
    const old = { kind: 'chest', slots: [{ id: 'stone', count: 1 }], stale: false, observedAt: 1 }
    const current = { kind: 'chest', slots: [{ id: 'diamond', count: 3 }], stale: false, observedAt: 2 }

    await world.setObservedBlockInventory(pos, old, 'a')
    await world.setObservedBlockInventory(pos, current, 'b')
    old.stale = true
    await world.setObservedBlockInventory(pos, old, 'a')
    assert.deepStrictEqual((await world.getObservedBlockInventory(pos)).slots[0], { id: 'diamond', count: 3 })
    current.stale = true
    await world.setObservedBlockInventory(pos, current, 'b')
    assert.deepStrictEqual((await world.getObservedBlockInventory(pos)).slots[0], { id: 'diamond', count: 3 })
  })

  it('emits aggregate updates for owner changes and invalidation with defensive payloads', async () => {
    const world = new World(generateChunk)
    const pos = new Vec3(3, 42, 4)
    const updates = []
    const syncUpdates = []
    world.on('observedBlockInventoryUpdate', (position, next, previous) => updates.push({ position, next, previous }))
    world.sync.on('observedBlockInventoryUpdate', (position, next, previous) => syncUpdates.push({ position, next, previous }))
    const observation = { kind: 'chest', slots: [{ id: 'stone', count: 1 }], stale: false, observedAt: 1 }

    await world.setObservedBlockInventory(pos, observation, 'a')
    await world.setObservedBlockInventory(pos, observation, 'b')
    assert.strictEqual(updates.length, 2)
    assert.strictEqual(syncUpdates.length, 2)
    assert.deepStrictEqual(updates[1].next, observation)
    assert.deepStrictEqual(updates[1].previous, observation)
    updates[1].next.slots[0].count = 99
    assert.strictEqual((await world.getObservedBlockInventory(pos)).slots[0].count, 1)
    assert.strictEqual(syncUpdates[1].next.slots[0].count, 1)

    updates.length = 0
    syncUpdates.length = 0
    await world.getColumn(0, 0)
    world.sync.setBlockType(pos, 1)
    assert.strictEqual(updates.length, 1)
    assert.strictEqual(syncUpdates.length, 1)
    assert.strictEqual(updates[0].next, null)
    assert.deepStrictEqual(updates[0].previous, observation)
    assert.strictEqual(syncUpdates[0].next, null)
    assert.deepStrictEqual(syncUpdates[0].previous, observation)
  })

  it('clears observations on block and column invalidation without cross-column leakage', async () => {
    const world = new World(generateChunk)
    const first = new Vec3(1, 42, 2)
    const second = new Vec3(17, 42, 2)
    const observation = { kind: 'chest', slots: [], stale: false, observedAt: 1 }

    await world.setObservedBlockInventory(first, observation, 'column-test')
    await world.setObservedBlockInventory(second, observation, 'column-test')
    world.unloadColumn(0, 0)
    assert.strictEqual(await world.getObservedBlockInventory(first), null)
    assert.deepStrictEqual(await world.getObservedBlockInventory(second), observation)

    await world.getColumn(0, 0)
    world.sync.setObservedBlockInventory(first, observation, 'column-test')
    world.sync.setBlockType(first, 1)
    assert.strictEqual(world.sync.getObservedBlockInventory(first), null)

    await world.setObservedBlockInventory(first, observation, 'column-test')
    world.setLoadedColumn(0, 0, new Chunk(), false)
    assert.strictEqual(await world.getObservedBlockInventory(first), null)

    await world.setObservedBlockInventory(first, observation, 'column-test')
    await world.setBlockEntity(first, { id: 'Chest', Items: [] })
    assert.strictEqual(await world.getObservedBlockInventory(first), null)

    await world.setObservedBlockInventory(first, observation, 'column-test')
    await world.removeBlockEntity(first)
    assert.strictEqual(await world.getObservedBlockInventory(first), null)
  })
})

describe('Synchronous saving and loading works', function () {
  function generateRandomChunk (chunkX, chunkZ) {
    const chunk = new Chunk()

    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        chunk.setBlockType(new Vec3(x, 50, z), Math.floor(Math.random() * 50))
        for (let y = 0; y < 256; y++) {
          chunk.setSkyLight(new Vec3(x, y, z), 15)
        }
      }
    }

    return chunk
  }

  const regionPath = 'world/testRegionSync'
  before((cb) => {
    mkdirp(regionPath, cb)
  })

  after(cb => {
    rimraf(regionPath, cb)
  })

  let originalWorld
  const size = 3

  it('saving the world', async () => {
    originalWorld = new World(generateRandomChunk, new Anvil(regionPath))
    await Promise.all(
      flatMap(range(0, size), (chunkX) => range(0, size).map(chunkZ => ({ chunkX, chunkZ })))
        .map(({ chunkX, chunkZ }) => originalWorld.getColumn(chunkX, chunkZ))
    )
    await originalWorld.waitSaving()
  })

  it('load the world correctly', async () => {
    const loadedWorld = new World(null, new Anvil(regionPath))
    await Promise.all(
      flatMap(range(0, size), (chunkX) => range(0, size).map(chunkZ => ({ chunkX, chunkZ })))
        .map(async ({ chunkX, chunkZ }) => {
          await loadedWorld.getColumn(chunkX, chunkZ)
          const originalChunk = originalWorld.sync.getColumn(chunkX, chunkZ)
          const loadedChunk = loadedWorld.sync.getColumn(chunkX, chunkZ)
          assert.strictEqual(originalChunk.getBlockType(new Vec3(0, 50, 0)), loadedChunk.getBlockType(new Vec3(0, 50, 0)), 'wrong block type at 0,50,0 of chunk ' + chunkX + ',' + chunkZ)
          assert(bufferEqual(originalChunk.dump(), loadedChunk.dump()))
        })
    )
  })

  it('setBlocks', async () => {
    const world = new World(null, new Anvil(regionPath))
    for (let i = 0; i < 10000; i++) {
      world.sync.setBlockType(new Vec3(Math.random() * (16 * size - 1), Math.random() * 255, Math.random() * (16 * size - 1)), 0)
    }
    await world.waitSaving()
  })
})
