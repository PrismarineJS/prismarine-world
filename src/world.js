var Vec3 = require("vec3");
var Anvil = require("prismarine-provider-anvil").Anvil;


function columnKeyXZ(chunkX, chunkZ) {
  return chunkX + ',' + chunkZ;
}

function posInChunk(pos)
{
  return pos.floored().modulus(new Vec3(16,256,16));
}

class World {

  constructor(chunkGenerator,regionFolder) {
    this.columns = {};
    this.columnsArray = [];
    this.chunkGenerator = chunkGenerator;
    this.anvil = regionFolder ? new Anvil(regionFolder) : null;
  }

  async getColumn(chunkX, chunkZ) {
    await Promise.resolve();
    var key = columnKeyXZ(chunkX, chunkZ);

    if(!this.columns[key]) {
      var chunk=null;
      if(this.anvil!=null) {
        var data=await this.anvil.load(chunkX,chunkZ);
        if(data!=null)
          chunk=data;
      }
      const loaded=chunk!=null;
      if(!loaded && this.chunkGenerator) {
        chunk = this.chunkGenerator(chunkX, chunkZ);
      }
      if(chunk!=null)
        await this.setColumn(chunkX, chunkZ, chunk,!loaded);
    }

    return this.columns[key];
  };

  async setColumn(chunkX,chunkZ,chunk,save=true) {
    await Promise.resolve();
    var key=columnKeyXZ(chunkX,chunkZ);
    this.columnsArray.push({chunkX:chunkX,chunkZ:chunkZ,column:chunk});
    this.columns[key]=chunk;
    if(this.anvil && save)
      await this.anvil.save(chunkX, chunkZ, chunk);
  };

  async saveAt(pos)
  {
    var chunkX=Math.floor(pos.x/16);
    var chunkZ=Math.floor(pos.z/16);
    const chunk=await this.getColumn(chunkX,chunkZ);
    if(this.anvil)
      await this.anvil.save(chunkX, chunkZ, chunk);
  }

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
    this.saveAt(pos);
  };

  async getBlock(pos)  {
    return (await this.getColumnAt(pos)).getBlock(posInChunk(pos));
  };

  async getBlockType(pos) {
    return (await this.getColumnAt(pos)).getBlockType(posInChunk(pos));
  };

  async getBlockData(pos) {
    return (await this.getColumnAt(pos)).getBlockData(posInChunk(pos));
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
    await this.saveAt(pos);
  };

  async setBlockData(pos, data) {
    (await this.getColumnAt(pos)).setBlockData(posInChunk(pos),data);
    await this.saveAt(pos);
  };

  async setBlockLight(pos, light) {
    (await this.getColumnAt(pos)).setBlockLight(posInChunk(pos),light);
    await this.saveAt(pos);
  };

  async setSkyLight(pos, light) {
    (await this.getColumnAt(pos)).setSkyLight(posInChunk(pos),light);
    await this.saveAt(pos);
  };

  async setBiome(pos, biome) {
    (await this.getColumnAt(pos)).setBiome(posInChunk(pos),biome);
    await this.saveAt(pos);
  };

}

module.exports = World;
