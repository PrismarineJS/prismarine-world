/* eslint-env mocha */

const assert = require('assert')
const { Vec3 } = require('vec3')
const { RaycastIterator, BlockFace } = require('../src/iterators')

describe('ray intersection parallel to a box face', () => {
  const shape = [[0, 0, 0, 1, 1, 1]]
  for (const axis of [0, 1, 2]) {
    for (const sign of [-1, 1]) {
      for (const edge of [0, 1]) {
        it(`hits at boundary ${edge} along axis ${axis}, direction ${sign}`, () => {
          const start = [edge, edge, edge]
          start[axis] = sign > 0 ? -2 : 3
          const direction = [0, 0, 0]
          direction[axis] = sign
          const ray = new RaycastIterator(new Vec3(...start), new Vec3(...direction), 5)
          const hit = ray.intersect(shape, new Vec3(0, 0, 0))
          assert.ok(hit)
          const expected = [...start]
          expected[axis] = sign > 0 ? 0 : 1
          assert.deepStrictEqual(hit.pos, new Vec3(...expected))
          const faces = [[BlockFace.WEST, BlockFace.EAST], [BlockFace.BOTTOM, BlockFace.TOP], [BlockFace.NORTH, BlockFace.SOUTH]]
          assert.strictEqual(hit.face, faces[axis][sign > 0 ? 0 : 1])
        })
      }
      it(`misses outside the parallel slab along axis ${axis}, direction ${sign}`, () => {
        const start = [0.5, 0.5, 0.5]
        start[axis] = sign > 0 ? -2 : 3
        start[(axis + 1) % 3] = 1.0001
        const direction = [0, 0, 0]
        direction[axis] = sign
        const ray = new RaycastIterator(new Vec3(...start), new Vec3(...direction), 5)
        assert.strictEqual(ray.intersect(shape, new Vec3(0, 0, 0)), null)
      })
    }
  }
  it('does not return nonfinite coordinates for a zero direction', () => {
    const ray = new RaycastIterator(new Vec3(0.5, 0.5, 0.5), new Vec3(0, 0, 0), 5)
    assert.strictEqual(ray.intersect(shape, new Vec3(0, 0, 0)), null)
  })

  it('hits the top edge of a translated crop-sized box with a negative zero direction', () => {
    const offset = new Vec3(-17, 100, -13)
    const ray = new RaycastIterator(offset.offset(0.5, 0.1875, 2), new Vec3(-0, -0, -1), 5)
    const hit = ray.intersect([[0, 0, 0, 1, 0.1875, 1]], offset)
    assert.deepStrictEqual(hit.pos, offset.offset(0.5, 0.1875, 1))
    assert.strictEqual(hit.face, BlockFace.SOUTH)
  })

  it('selects the nearest box independent of shape order', () => {
    const boxes = [[0, 0, 0, 1, 0.5, 0.25], [0, 0, 0.75, 1, 0.5, 1]]
    const ray = new RaycastIterator(new Vec3(0.5, 0.5, 2), new Vec3(0, 0, -1), 5)
    for (const shapes of [boxes, [...boxes].reverse()]) {
      const hit = ray.intersect(shapes, new Vec3(0, 0, 0))
      assert.deepStrictEqual(hit.pos, new Vec3(0.5, 0.5, 1))
      assert.strictEqual(hit.face, BlockFace.SOUTH)
    }
  })

  it('keeps diagonal intersections on a parallel boundary', () => {
    const ray = new RaycastIterator(new Vec3(-1, 1, -2), new Vec3(1, 0, 1), 5)
    const hit = ray.intersect(shape, new Vec3(0, 0, 0))
    assert.deepStrictEqual(hit.pos, new Vec3(1, 1, 0))
    assert.strictEqual(hit.face, BlockFace.NORTH)
  })

  it('misses an empty shape list', () => {
    const ray = new RaycastIterator(new Vec3(0.5, 1, 2), new Vec3(0, 0, -1), 5)
    assert.strictEqual(ray.intersect([], new Vec3(0, 0, 0)), null)
  })
})
