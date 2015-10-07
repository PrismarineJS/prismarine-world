var Vec3 = require("vec3");


function columnKeyXZ(chunkX, chunkZ) {
  return chunkX + ',' + chunkZ;
}

function posInChunk(pos)
{
  return pos.floored().modulus(new Vec3(16,256,16));
}

class World {

  constructor(chunkGenerator) {
    this.columns = {};
    this.columnsArray = [];
    this.chunkGenerator = chunkGenerator;
  }

  async getColumn(chunkX, chunkZ) {
    await Promise.resolve();
    var key = columnKeyXZ(chunkX, chunkZ);

    if(!this.columns[key] && this.chunkGenerator) {
      await this.setColumn(chunkX, chunkZ, this.chunkGenerator(chunkX, chunkZ));
    }

    return this.columns[key];
  };

  async setColumn(chunkX,chunkZ,chunk) {
    await Promise.resolve();
    var key=columnKeyXZ(chunkX,chunkZ);
    this.columnsArray.push({chunkX:chunkX,chunkZ:chunkZ,column:chunk});
    this.columns[key]=chunk;
  };

  getColumns() {
    return this.columnsArray;
  };

  async getColumnAt(pos) {
    var chunkX=Math.floor(pos.x/16);
    var chunkZ=Math.floor(pos.z/16);
    return this.getColumn(chunkX,chunkZ);
  };

  async setBlock(pos,block) {
    (await this.getColumnAt(pos)).setBlock(posInChunk(pos),block);
  };

  async getBlock(pos)  {
    return (await this.getColumnAt(pos)).getBlock(posInChunk(pos));
  };

  async getBlockType(pos) {
    return (await this.getColumnAt(pos)).getBlockType(posInChunk(pos));
  };

  async getBlockData(pos) {
    return (await this.getColumnAt(pos)).getBlockType(posInChunk(pos));
  };

  async getBlockLight(pos) {
    return (await this.getColumnAt(pos)).getBlockLight(posInChunk(pos));
  };

  async getSkyLight(pos) {
    return (await this.getColumnAt(pos)).getSkyLight(posInChunk(pos));
  };

  async getBiome(pos) {
    return (await this.getColumnAt(pos)).getBiome(posInChunk(pos));
  };

  async setBlockType(pos,blockType) {
    (await this.getColumnAt(pos)).setBlockType(posInChunk(pos),blockType);
  };

  async setBlockData(pos, data) {
    (await this.getColumnAt(pos)).setBlockData(posInChunk(pos),data);
  };

  async setBlockLight(pos, light) {
    (await this.getColumnAt(pos)).setBlockLight(posInChunk(pos),light);
  };

  async setSkyLight(pos, light) {
    (await this.getColumnAt(pos)).setSkyLight(posInChunk(pos),light);
  };

  async setBiome(pos, biome) {
    (await this.getColumnAt(pos)).setBiome(posInChunk(pos),biome);
  };

}

module.exports = World;
