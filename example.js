var World = require('./')('1.8')
var Chunk = require('prismarine-chunk')('1.8')
var Vec3 = require('vec3')

function generateSimpleChunk (chunkX, chunkZ) {
  var chunk = new Chunk()

  for (var x = 0; x < 16; x++) {
    for (var z = 0; z < 16; z++) {
      chunk.setBlockType(new Vec3(x, 50, z), 2)
      for (var y = 0; y < 256; y++) {
        chunk.setSkyLight(new Vec3(x, y, z), 15)
      }
    }
  }

  return chunk
}

if (process.argv.length > 5) {
  console.log('Usage : node example.js <regionPath> <noGeneration>')
  process.exit(1)
}

var regionPath = process.argv[2]
var noGeneration = process.argv[3] === 'yes'

var world2 = new World(noGeneration ? null : generateSimpleChunk, regionPath)

world2
  .getBlock(new Vec3(3, 50, 3))
  .then(function (block) {
    console.log(JSON.stringify(block, null, 2))
  })
  // .then(function(){return world2.setBlockType(new Vec3(3000,50,3),3)})
  .then(function () { return world2.getBlock(new Vec3(3000, 50, 3)) })
  .then(function (block) {
    console.log(JSON.stringify(block, null, 2))
  })
  .then(function () {
    world2.stopSaving()
  })
  .catch(function (err) {
    console.log(err.stack)
  })
