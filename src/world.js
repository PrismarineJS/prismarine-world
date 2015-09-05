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

  
  getColumn(chunkX, chunkZ) {
    var key = columnKeyXZ(chunkX, chunkZ);
    return this.columns[key];
  };

  setColumn(chunkX,chunkZ,chunk) {
    var key=columnKeyXZ(chunkX,chunkZ);
    this.columnsArray.push({chunkX:chunkX,chunkZ:chunkZ,column:chunk});
    this.columns[key]=chunk;
  };

  getColumns() {
    return this.columnsArray;
  };

  getColumnAt(pos) {
    var chunkX=Math.floor(pos.x/16);
    var chunkZ=Math.floor(pos.z/16);
    return this.getColumn(chunkX,chunkZ);
  };

  setBlock(pos,block) {
    this.getColumnAt(pos).setBlock(posInChunk(pos),block);
  };

  getBlock(pos)
  {
    return this.getColumnAt(pos).getBlock(posInChunk(pos));
  };

  getBlockType(pos) {
    return this.getColumnAt(pos).getBlockType(posInChunk(pos));
  };

  getBlockData(pos) {
    return this.getColumnAt(pos).getBlockData(posInChunk(pos));
  };

  getBlockLight(pos) {
    return this.getColumnAt(pos).getBlockLight(posInChunk(pos));
  };

  getSkyLight(pos) {
    return this.getColumnAt(pos).getSkyLight(posInChunk(pos));
  };

  getBiome(pos) {
    return this.getColumnAt(pos).getBiome(posInChunk(pos));
  };

  setBlockType(pos,blockType) {
    this.getColumnAt(pos).setBlockType(posInChunk(pos),blockType);
  };

  setBlockData(pos, data) {
    this.getColumnAt(pos).setBlockData(posInChunk(pos),data);
  };

  setBlockLight(pos, light) {
    this.getColumnAt(pos).setBlockLight(posInChunk(pos),light);
  };

  setSkyLight(pos, light) {
    this.getColumnAt(pos).setSkyLight(posInChunk(pos),light);
  };

  setBiome(pos, biome) {
    this.getColumnAt(pos).setBiome(posInChunk(pos),biome);
  };

}

module.exports = World;