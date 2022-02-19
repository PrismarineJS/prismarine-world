import type { Block } from "prismarine-block";
import type { Vec3 } from "vec3";


type BlockFace= -999 |  0 |  1 |  2 |  3 |  4 | 5;

type RaycastMatcher = (block: Block | null) => boolean; // type for null since it is often used w/o null checks.
type RaycastBlock = { x: number; y: number; z: number; face: number };
type RaycastIntersection = {pos: Vec3, face: BlockFace}



export declare namespace iterators {
    
    export class ManhattanIterator {
        public readonly maxDistance;
        public startx: number;
        public starty: number;
        public x: number;
        public y: number;
        public layer: number;
        public leg: number;


        constructor(x: number, y: number, maxDistance: number);

        /**
         * @returns {Vec3 | null} The current position of the iterator OR null if exceeded maxDistance.
         */
        next(): Vec3 | null;
    }


    export class OctahedronIterator {
        public start: Vec3;
        public maxDistance: number;
        public apothem: number;
        public x: number;
        public y: number;
        public z: number;
        public L: number;
        public R: number;

        constructor(start: Vec3, maxDistance: number);

        /**
         * @returns {Vec3 | null} The current position of the iterator OR null if exceeded maxDistance.
         */
        next(): Vec3 | null;

    }

    export class RaycastIterator {
        public block: RaycastBlock;
        public readonly pos: Vec3;
        public readonly dir: Vec3;
        private invDirX: number;
        private invDirY: number;
        private invDirZ: number;
        private stepX: number;
        private stepY: number;
        private stepZ: number;
        private tDeltaX: number;
        private tDeltaY: number;
        private tDeltaZ: number;
        private tMaxX: number;
        private tMaxY: number;
        private tMaxZ: number;
        public readonly maxDistance: number;
        constructor(pos: Vec3, dir: Vec3, distance: number);

        /**
         * @param {number[][]} shapes Takes shapes from block.shapes.
         * @param {Vec3} offset Offset from original position to start the intersect calculation from.
         * @returns {RaycastIntersection | null} A possible intersection.
         */
        intersect(shapes: number[][], offset: Vec3): RaycastIntersection | null;

        /**
         * @returns {RaycastBlock | null} The block the raycast is currently passing through (not hit detection, just the general AABB of a block if it were there).
         */
        next(): RaycastBlock | null;


    }


    /**
     * Spiral outwards from a central position in growing squares.
     * Every point has a constant distance to its previous and following position of 1. First point returned is the starting position.
     * Generates positions like this:
     * ```text
     * 16 15 14 13 12
     * 17  4  3  2 11
     * 18  5  0  1 10
     * 19  6  7  8  9
     * 20 21 22 23 24
     * (maxDistance = 2; points returned = 25)
     * ```
     */
    export class SpiralIterator2d {
        public start: Vec3;
        public maxDistance: number;
        public di: number;
        public dj: number;
        public i: number;
        public j: number;
        public k: number;
        public segment_passed: number;
        public segment_length: number;
        public NUMBER_OF_POINTS: number;

        /**
         * Copy and past warrior source: https://stackoverflow.com/questions/3706219/algorithm-for-iterating-over-an-outward-spiral-on-a-discrete-2d-grid-from-the-or
         * @param {Vec3} pos Starting position
         * @param {number} maxDistance Max distance from starting position
         */
        constructor(pos: Vec3, maxDistance: number);


        /**
         * @returns {RaycastBlock | null} The block the raycast is currently passing through (not hit detection, just the general AABB of a block if it were there).
         */
        next(): RaycastBlock | null;
    }



    export const ManathanIterator: ManhattanIterator
}
