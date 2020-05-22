const Vec3 = require('vec3').Vec3
let Anvil
const EventEmitter = require('events').EventEmitter

function columnKeyXZ (chunkX, chunkZ) {
  return chunkX + ',' + chunkZ
}

function posInChunk (pos) {
  return new Vec3(Math.floor(pos.x) & 15, Math.floor(pos.y), Math.floor(pos.z) & 15)
}

class World extends EventEmitter {
  constructor (chunkGenerator, regionFolder, savingInterval = 1000) {
    super()
    this.savingQueue = new Map()
    this.finishedSaving = Promise.resolve()
    this.columns = {}
    this.columnsArray = []
    this.chunkGenerator = chunkGenerator
    this.anvil = regionFolder ? new Anvil(regionFolder) : null
    this.savingInterval = savingInterval
    if (regionFolder && savingInterval !== 0) this.startSaving()
  }

  initialize (iniFunc, length, width, height = 256, iniPos = new Vec3(0, 0, 0)) {
    function inZone (x, y, z) {
      if (x >= width || x < 0) { return false }
      if (z >= length || z < 0) {
        return false
      }
      if (y >= height || y < 0) { return false }
      return true
    }
    const iniPosInChunk = posInChunk(iniPos)
    const chunkLength = Math.ceil((length + iniPosInChunk.z) / 16)
    const chunkWidth = Math.ceil((width + iniPosInChunk.x) / 16)
    for (let chunkZ = 0; chunkZ < chunkLength; chunkZ++) {
      const actualChunkZ = chunkZ + Math.floor(iniPos.z / 16)
      for (let chunkX = 0; chunkX < chunkWidth; chunkX++) {
        const actualChunkX = chunkX + Math.floor(iniPos.x / 16)
        const chunk = this.getColumn(actualChunkX, actualChunkZ)
        const offsetX = chunkX * 16 - iniPosInChunk.x
        const offsetZ = chunkZ * 16 - iniPosInChunk.z
        chunk.initialize((x, y, z) => inZone(x + offsetX, y - iniPos.y, z + offsetZ) ? iniFunc(x + offsetX, y - iniPos.y, z + offsetZ) : null)
        this.setColumn(actualChunkX, actualChunkZ, chunk)
      }
    }
  };

  // Load all columns in the rectangular area (in column coordinates)
  async loadColumns (x0, z0, x1, z1) {
    const ps = []
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        ps.push(this.loadColumn(x, z))
      }
    }
    return Promise.all(ps)
  }

  // Load a single column from storage or generate it
  async loadColumn (chunkX, chunkZ) {
    const key = columnKeyXZ(chunkX, chunkZ)
    if (this.columns[key]) return // already loaded

    let chunk = null
    if (this.anvil != null) {
      const data = await this.anvil.load(chunkX, chunkZ)
      if (data != null) { chunk = data }
    }

    const loaded = chunk != null
    if (!loaded && this.chunkGenerator) {
      chunk = this.chunkGenerator(chunkX, chunkZ)
    }

    if (chunk != null) { this.setColumn(chunkX, chunkZ, chunk, !loaded) }
  }

  getColumn (chunkX, chunkZ) {
    const key = columnKeyXZ(chunkX, chunkZ)
    return this.columns[key]
  }

  setColumn (chunkX, chunkZ, chunk, save = true) {
    const key = columnKeyXZ(chunkX, chunkZ)
    this.columnsArray.push({ chunkX: chunkX, chunkZ: chunkZ, column: chunk })
    this.columns[key] = chunk

    if (this.anvil && save) { this.queueSaving(chunkX, chunkZ) }
  }

  saveNow () {
    if (this.savingQueue.size === 0) {
      return
    }
    // We could set a limit on the number of chunks to save at each
    // interval. The set structure is maintaining the order of insertion
    for (const [key, { chunkX, chunkZ }] of this.savingQueue.entries()) {
      this.finishedSaving = Promise.all([this.finishedSaving,
        this.anvil.save(chunkX, chunkZ, this.columns[key])])
    }
    this.savingQueue.clear()
    this.emit('doneSaving')
  }

  startSaving () {
    this.savingInt = setInterval(async () => {
      this.saveNow()
    }, this.savingInterval)
  }

  async waitSaving () {
    this.saveNow()
    await this.finishedSaving
  }

  stopSaving () {
    clearInterval(this.savingInt)
  }

  queueSaving (chunkX, chunkZ) {
    this.savingQueue.set(columnKeyXZ(chunkX, chunkZ), { chunkX, chunkZ })
  }

  saveAt (pos) {
    const chunkX = Math.floor(pos.x / 16)
    const chunkZ = Math.floor(pos.z / 16)
    if (this.anvil) { this.queueSaving(chunkX, chunkZ) }
  }

  getColumns () {
    return this.columnsArray
  }

  getColumnAt (pos) {
    const chunkX = Math.floor(pos.x / 16)
    const chunkZ = Math.floor(pos.z / 16)
    return this.getColumn(chunkX, chunkZ)
  }

  // Block accessors:

  getBlock (pos) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return null
    return chunk.getBlock(posInChunk(pos))
  }

  getBlockStateId (pos) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return 0
    return chunk.getBlockStateId(posInChunk(pos))
  }

  getBlockType (pos) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return 0
    return chunk.getBlockType(posInChunk(pos))
  }

  getBlockData (pos) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return 0
    return chunk.getBlockData(posInChunk(pos))
  }

  getBlockLight (pos) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return 0
    return chunk.getBlockLight(posInChunk(pos))
  }

  getSkyLight (pos) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return 0
    return chunk.getSkyLight(posInChunk(pos))
  }

  getBiome (pos) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return 0
    return chunk.getBiome(posInChunk(pos))
  }

  setBlock (pos, block) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return
    chunk.setBlock(posInChunk(pos), block)
    this.saveAt(pos)
  }

  setBlockStateId (pos, stateId) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return
    chunk.setBlockStateId(posInChunk(pos), stateId)
    this.saveAt(pos)
  }

  setBlockType (pos, blockType) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return
    chunk.setBlockType(posInChunk(pos), blockType)
    this.saveAt(pos)
  }

  setBlockData (pos, data) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return
    chunk.setBlockData(posInChunk(pos), data)
    this.saveAt(pos)
  }

  setBlockLight (pos, light) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return
    chunk.setBlockLight(posInChunk(pos), light)
    this.saveAt(pos)
  }

  setSkyLight (pos, light) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return
    chunk.setSkyLight(posInChunk(pos), light)
    this.saveAt(pos)
  }

  setBiome (pos, biome) {
    const chunk = this.getColumnAt(pos)
    if (!chunk) return
    chunk.setBiome(posInChunk(pos), biome)
    this.saveAt(pos)
  }
}

function loader (mcVersion) {
  Anvil = require('prismarine-provider-anvil').Anvil(mcVersion)
  return World
}

module.exports = loader
