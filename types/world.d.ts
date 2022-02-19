import type { EventEmitter } from "events";
import type { Vec3 } from "vec3";
import type {Block} from "prismarine-block"
import {Chunk} from "../../prismarine-chunk"
import {RaycastBlock, RaycastMatcher} from "./raycast";


type ChunkGenerator = (chunkX: number, chunkZ: number) => Chunk;
type ChunkCoordinates = {chunkX: number, chunkZ: number}
type ChunkCoordsAndColumn = {chunkX: number, chunkZ: number, column: Chunk};


export declare class World extends EventEmitter {

    public savingQueue: Map<String, ChunkCoordinates>;
    public finishedSaving: Promise<unknown>;
    public columns: {[key: string]: Chunk};
    public chunkGenerator: ChunkGenerator;
    public storageProvider: any | null;
    public savingInterval: number;
    public sync: WorldSync;

    /**
     * @param {ChunkGenerator} chunkGenerator A generator that requires X and Z coordinates of lower left of chunk. Returns a {Chunk} chunk object.
     * @param {any} storageProvider The provider the world uses to save chunks. See "prismarine-provider-anvil" or "prismarine-provider-raw".
     * @param {number} savingInterval The duration in milliseconds between saves.
     */
    constructor(chunkGenerator: ChunkGenerator | null, storageProvider?: any | null, savingInterval?: number);


    public initialize(iniFunc: any, length: number, width: number, height?: number, iniPos?: Vec3): Promise<ChunkCoordinates[]>;

    /**
     * 
     * @param {Vec3} from Position to start raycasting from.
     * @param {Vec3} direction Normalized vector, direction of raycast.
     * @param {number} range Maximum range to raycast.
     * @param {RaycastMatcher | null} matcher Matching function, if specified only blocks that meet the matcher's requirements are returned.
     */
    public raycast(from: Vec3, direction: Vec3, range: number, matcher?: RaycastMatcher | null): RaycastBlock | null; //Promise<ReturnType<iterators.RaycastIterator["next"]>>;

    public getLoadedColumn(chunkX: number, chunkZ: number): Chunk;

    public getColumn(chunkX: number, chunkZ: number): Promise<Chunk>;

    private _emitBlockUpdate (oldBlock: Block | null, newBlock: Block | null, position: Vec3): void;

    public setLoadedColumn(chunkX: number, chunkZ: number, chunk: Chunk, save?: boolean): void;

    public setColumn(chunkX: number, chunkZ: number, chunk: Chunk, save?: boolean): Promise<void>;

    public unloadColumn(chunkX: number, chunkZ: number): void;

    public saveNow(): Promise<void>;

    public startSaving(): void;

    public waitSaving(): Promise<void>;

    public stopSaving(): void;

    public queueSaving(chunkX: number, chunkZ: number): void;

    public saveAt(pos: Vec3): void;

    public getColumns(): ChunkCoordsAndColumn;

    public getLoadedColumnAt(pos: Vec3): Chunk;//ReturnType<this["getLoadedColumn"]>

    public getColumnAt(pos: Vec3): Promise<Chunk>; //ReturnType<this["getColumn"]>

    public setBlock(pos: Vec3, block: Block): Promise<void>;

    public getBlock(pos: Vec3): Promise<Block>;

    public getBlockStateId(pos: Vec3): Promise<number>;

    public getBlockType (pos: Vec3): Promise<number>;
    
    public getBlockData (pos: Vec3): Promise<any>;
    
    public getBlockLight (pos: Vec3): Promise<number>;
    
    public getSkyLight (pos: Vec3): Promise<number>;
    
    public getBiome (pos: Vec3): Promise<number>;
    
    public setBlockStateId (pos: Vec3,stateId: number): Promise<void>;
    
    public setBlockType (pos: Vec3,blockType: number): Promise<void>;
    
    public setBlockData (pos: Vec3,data: any): Promise<void>;
    
    public setBlockLight (pos: Vec3,light: number): Promise<void>;
    
    public setSkyLight (pos: Vec3,light: number): Promise<void>;
    
    public setBiome (pos: Vec3,biome: number): Promise<void>;
    

}

export declare class WorldSync extends EventEmitter {

    public async: World;

    /**
     * @param {World} world Async representation of the World object.
     */
    constructor(world: World);


    public initialize(iniFunc: any, length: number, width: number, height?: number, iniPos?: Vec3): ChunkCoordinates[];

    /**
     * 
     * @param {Vec3} from Position to start raycasting from.
     * @param {Vec3} direction Normalized vector, direction of raycast.
     * @param {number} range Maximum range to raycast.
     * @param {RaycastMatcher | null} matcher Matching function, if specified only blocks that meet the matcher's requirements are returned.
     */
    public raycast(from: Vec3, direction: Vec3, range: number, matcher?: RaycastMatcher | null): RaycastBlock | null; //ReturnType<iterators.RaycastIterator["next"]>>;

    private _emitBlockUpdate (oldBlock: Block | null, newBlock: Block | null, position: Vec3): void;

    public getColumns(): ChunkCoordsAndColumn;

    public getColumn(chunkX: number, chunkZ: number): Chunk;

    public getColumnAt(pos: Vec3): Chunk; //ReturnType<this["getColumn"]>

    public setColumn(chunkX: number, chunkZ: number, chunk: Chunk, save?: boolean): void;

    public unloadColumn(chunkX: number, chunkZ: number): void;

    public getBlock(pos: Vec3): Block;

    public getBlockStateId(pos: Vec3): number;

    public getBlockType (pos: Vec3): number;
    
    public getBlockData (pos: Vec3): any;
    
    public getBlockLight (pos: Vec3): number;
    
    public getSkyLight (pos: Vec3): number;
    
    public getBiome (pos: Vec3): number;

    public setBlock(pos: Vec3, block: Block): void;
    
    public setBlockStateId (pos: Vec3,stateId: number): void;
    
    public setBlockType (pos: Vec3,blockType: number): void;
    
    public setBlockData (pos: Vec3,data: any): void;
    
    public setBlockLight (pos: Vec3,light: number): void;
    
    public setSkyLight (pos: Vec3,light: number): void;
    
    public setBiome (pos: Vec3,biome: number): void;
}