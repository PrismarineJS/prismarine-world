const Vec3 = require('vec3')
let Anvil
const fifo = require('fifo')
const EventEmitter = require('events').EventEmitter
const once = require('event-promise')

function columnKeyXZ (chunkX, chunkZ) {
  return chunkX + ',' + chunkZ
}

function posInChunk (pos) {
  return pos.floored().modulus(new Vec3(16, 256, 16))
}

class World extends EventEmitter {
  constructor (chunkGenerator, regionFolder, savingInterval = 100) {
    super()
    this.savingQueue = fifo()
    this.finishedSaving = Promise.resolve()
    this.columns = {}
    this.columnsArray = []
    this.chunkGenerator = chunkGenerator
    this.anvil = regionFolder ? new Anvil(regionFolder) : null
    this.savingInterval = savingInterval
    if (regionFolder && savingInterval !== 0) this.startSaving()
  }

  initialize (iniFunc, length, width, height = 256, iniPos = new Vec3(0, 0, 0)) {
    function modulus (a, b) {
      const m = a % b
      if (m < 0) { return b + m }
      return m
    }

    function inZone (x, y, z) {
      if (x >= width || x < 0) { return false }
      if (z >= length || z < 0) {
        return false
      }
      if (y >= height || y < 0) { return false }
      return true
    }
    const ps = []
    const chunkLength = Math.ceil((length + modulus(iniPos.z, 16)) / 16)
    const chunkWidth = Math.ceil((width + modulus(iniPos.x, 16)) / 16)
    for (let chunkZ = 0; chunkZ < chunkLength; chunkZ++) {
      const actualChunkZ = chunkZ + Math.floor(iniPos.z / 16)
      for (let chunkX = 0; chunkX < chunkWidth; chunkX++) {
        const actualChunkX = chunkX + Math.floor(iniPos.x / 16)
        ps.push(this.getColumn(actualChunkX, actualChunkZ)
          .then(chunk => {
            const offsetX = chunkX * 16 - modulus(iniPos.x, 16)
            const offsetZ = chunkZ * 16 - modulus(iniPos.z, 16)
            chunk.initialize((x, y, z) => inZone(x + offsetX, y - iniPos.y, z + offsetZ) ? iniFunc(x + offsetX, y - iniPos.y, z + offsetZ) : null)
            return this.setColumn(actualChunkX, actualChunkZ, chunk)
          })
          .then(() => ({chunkX: actualChunkX, chunkZ: actualChunkZ})))
      }
    }
    return Promise.all(ps)
  };

  async getColumn (chunkX, chunkZ) {
    await Promise.resolve()
    var key = columnKeyXZ(chunkX, chunkZ)

    if (!this.columns[key]) {
      var chunk = null
      if (this.anvil != null) {
        var data = await this.anvil.load(chunkX, chunkZ)
        if (data != null) { chunk = data }
      }
      const loaded = chunk != null
      if (!loaded && this.chunkGenerator) {
        chunk = this.chunkGenerator(chunkX, chunkZ)
      }
      if (chunk != null) { await this.setColumn(chunkX, chunkZ, chunk, !loaded) }
    }

    return this.columns[key]
  };

  async setColumn (chunkX, chunkZ, chunk, save = true) {
    await Promise.resolve()
    var key = columnKeyXZ(chunkX, chunkZ)
    this.columnsArray.push({chunkX: chunkX, chunkZ: chunkZ, column: chunk})
    this.columns[key] = chunk

    if (this.anvil && save) { this.queueSaving(chunkX, chunkZ) }
  };

  startSaving () {
    this.savingInt = setInterval(async () => {
      if (this.savingQueue.length === 0) {
        this.emit('doneSaving')
        return
      }
      const {chunkX, chunkZ} = this.savingQueue.pop()
      this.finishedSaving = Promise.all([this.finishedSaving,
        this.anvil.save(chunkX, chunkZ, this.columns[columnKeyXZ(chunkX, chunkZ)])])
    }, this.savingInterval)
  }

  async waitSaving () {
    await once(this, 'doneSaving')
    await this.finishedSaving
  }

  stopSaving () {
    clearInterval(this.savingInt)
  }

  queueSaving (chunkX, chunkZ) {
    this.savingQueue.push({chunkX, chunkZ})
  }

  async saveAt (pos) {
    var chunkX = Math.floor(pos.x / 16)
    var chunkZ = Math.floor(pos.z / 16)
    if (this.anvil) { this.queueSaving(chunkX, chunkZ) }
  }

  getColumns () {
    return this.columnsArray
  };

  async getColumnAt (pos) {
    var chunkX = Math.floor(pos.x / 16)
    var chunkZ = Math.floor(pos.z / 16)
    return this.getColumn(chunkX, chunkZ)
  };

  async setBlock (pos, block) {
    (await this.getColumnAt(pos)).setBlock(posInChunk(pos), block)
    this.saveAt(pos)
  };

  async getBlock (pos) {
    return (await this.getColumnAt(pos)).getBlock(posInChunk(pos))
  };

  async getBlockType (pos) {
    return (await this.getColumnAt(pos)).getBlockType(posInChunk(pos))
  };

  async getBlockData (pos) {
    return (await this.getColumnAt(pos)).getBlockData(posInChunk(pos))
  };

  async getBlockLight (pos) {
    return (await this.getColumnAt(pos)).getBlockLight(posInChunk(pos))
  };

  async getSkyLight (pos) {
    return (await this.getColumnAt(pos)).getSkyLight(posInChunk(pos))
  };

  async getBiome (pos) {
    return (await this.getColumnAt(pos)).getBiome(posInChunk(pos))
  };

  async setBlockType (pos, blockType) {
    (await this.getColumnAt(pos)).setBlockType(posInChunk(pos), blockType)
    this.saveAt(pos)
  };

  async setBlockData (pos, data) {
    (await this.getColumnAt(pos)).setBlockData(posInChunk(pos), data)
    this.saveAt(pos)
  };

  async setBlockLight (pos, light) {
    (await this.getColumnAt(pos)).setBlockLight(posInChunk(pos), light)
    this.saveAt(pos)
  };

  async setSkyLight (pos, light) {
    (await this.getColumnAt(pos)).setSkyLight(posInChunk(pos), light)
    this.saveAt(pos)
  };

  async setBiome (pos, biome) {
    (await this.getColumnAt(pos)).setBiome(posInChunk(pos), biome)
    this.saveAt(pos)
  };
}

function loader (mcVersion) {
  Anvil = require('prismarine-provider-anvil').Anvil(mcVersion)
  return World
}

module.exports = loader
