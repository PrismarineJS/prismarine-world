var Vec3 = require("vec3");


function columnKeyXZ(chunkX, chunkZ) {
  return chunkX + ',' + chunkZ;
}

function posInChunk(pos)
{
  return pos.floored().modulus(new Vec3(16,256,16));
}

class World {

  constructor() {

    this.columns = {};
    this.columnsArray = [];
  }
  
  getColumnSync(chunkX, chunkZ) {
    var key = columnKeyXZ(chunkX, chunkZ);
    return this.columns[key];
  };

  async getColumn(chunkX, chunkZ) {
    await Promise.resolve();
    return this.getColumnSync(chunkX, chunkZ);
  };

  async setColumn(chunkX,chunkZ,chunk) {
    await Promise.resolve();
    this.setColumnSync(chunkX,chunkZ,chunk);
  };

  setColumnSync(chunkX,chunkZ,chunk) {
    var key=columnKeyXZ(chunkX,chunkZ);
    this.columnsArray.push({chunkX:chunkX,chunkZ:chunkZ,column:chunk});
    this.columns[key]=chunk;
  };

  getColumns() {
    return this.columnsArray;
  };

  getColumnAtSync(pos) {
    var chunkX=Math.floor(pos.x/16);
    var chunkZ=Math.floor(pos.z/16);
    return this.getColumnSync(chunkX,chunkZ);
  };

  async getColumnAt(pos) {
    var chunkX=Math.floor(pos.x/16);
    var chunkZ=Math.floor(pos.z/16);
    return this.getColumn(chunkX,chunkZ);
  };

  setBlockSync(pos,block) {
    this.getColumnAtSync(pos).setBlock(posInChunk(pos),block);
  };

  async setBlock(pos,block) {
    (await this.getColumnAt(pos)).setBlock(posInChunk(pos),block);
  };

  getBlockSync(pos)  {
    return this.getColumnAtSync(pos).getBlock(posInChunk(pos));
  };

  getBlockTypeSync(pos) {
    return this.getColumnAtSync(pos).getBlockType(posInChunk(pos));
  };

  getBlockDataSync(pos) {
    return this.getColumnAtSync(pos).getBlockData(posInChunk(pos));
  };

  getBlockLightSync(pos) {
    return this.getColumnAtSync(pos).getBlockLight(posInChunk(pos));
  };

  getSkyLightSync(pos) {
    return this.getColumnAtSync(pos).getSkyLight(posInChunk(pos));
  };

  getBiomeSync(pos) {
    return this.getColumnAtSync(pos).getBiome(posInChunk(pos));
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

  setBlockTypeSync(pos,blockType) {
    this.getColumnAtSync(pos).setBlockType(posInChunk(pos),blockType);
  };

  setBlockDataSync(pos, data) {
    this.getColumnAtSync(pos).setBlockData(posInChunk(pos),data);
  };

  setBlockLightSync(pos, light) {
    this.getColumnAtSync(pos).setBlockLight(posInChunk(pos),light);
  };

  setSkyLightSync(pos, light) {
    this.getColumnAtSync(pos).setSkyLight(posInChunk(pos),light);
  };

  setBiomeSync(pos, biome) {
    this.getColumnAtSync(pos).setBiome(posInChunk(pos),biome);
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