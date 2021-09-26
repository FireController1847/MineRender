import { MineRenderScene } from "../renderer/MineRenderScene";
import { Block } from "../model/block/Block";
import { BlockObject } from "../model/block/scene/BlockObject";
import { Vector3 } from "three";
import { isTripleArray, TripleArray } from "../model/Model";
import { isVector3, Maybe } from "../util/util";
import { Chunk } from "./Chunk";
import { BlockInfo } from "./BlockInfo";
import { MultiBlockBlock, MultiBlockStructure } from "../model/multiblock/MultiBlockStructure";
import { BatchedExecutor } from "../util/BatchedExecutor";
import * as stream from "stream";

export class MineRenderWorld {

    public readonly scene: MineRenderScene;

    private _size: number = 4; //TODO: expandable
    private readonly _chunks: Chunk[] = [];

    constructor(scene: MineRenderScene) {
        this.scene = scene;
    }

    public getBlockAt(x: number, y: number, z: number): Maybe<BlockInfo>;
    public getBlockAt(pos: Vector3): Maybe<BlockInfo>;
    public getBlockAt(pos: TripleArray): Maybe<BlockInfo>;
    public getBlockAt(posOrX: number | Vector3 | TripleArray, y?: number, z?: number): Maybe<BlockInfo> {
        if (typeof posOrX == "number") {
            return this.getBlockAt(new Vector3(posOrX, y, z));
        }
        if (isTripleArray(posOrX)) {
            return this.getBlockAt(new Vector3(posOrX[0], posOrX[1], posOrX[2]))
        }
        const chunk = this.getChunkAt(posOrX);
        if (typeof chunk === "undefined") {
            return undefined;
        }
        return chunk.getBlockAt(posOrX);
    }

    public async setBlockAt(x: number, y: number, z: number, block: Block): Promise<Maybe<BlockInfo>>;
    public async setBlockAt(pos: Vector3, block: Block): Promise<Maybe<BlockInfo>>;
    public async setBlockAt(pos: TripleArray, block: Block): Promise<Maybe<BlockInfo>>;
    public async setBlockAt(posOrX: number | Vector3 | TripleArray, yOrBlock?: number | Block, z?: number, block?: Block): Promise<Maybe<BlockInfo>> {
        if (typeof posOrX == "number") {
            return this.setBlockAt(new Vector3(posOrX, yOrBlock as number, z), block as Block);
        }
        if (isTripleArray(posOrX)) {
            return this.setBlockAt(new Vector3(posOrX[0], posOrX[1], posOrX[2]), yOrBlock as Block);
        }
        const chunk = this.getOrCreateChunkAt(posOrX);
        return chunk.setBlockAt(posOrX, yOrBlock as Block);
    }


    public async placeMultiBlock(multiblock: MultiBlockStructure, useBatches: boolean = true, executor: BatchedExecutor = new BatchedExecutor()): Promise<void> {
        const place = async (block: MultiBlockBlock) => {
            if (useBatches && typeof executor !== "undefined") {
                await new Promise((resolve,reject)=>{
                    executor.submit(() => {
                        this.setBlockAt(block.position, block).then(resolve).catch(reject)
                    })
                });
            } else {
                await this.setBlockAt(block.position, block);
            }
        }
        for (let block of multiblock.blocks) {
            await place(block);
        }
    }


    private getOrCreateChunkAt(pos: Vector3): Chunk {
        const index = this.worldPosToChunkIndex(pos);
        let chunk = this._chunks[index];
        if (typeof chunk === "undefined") {
            chunk = new Chunk(this.scene, Math.floor(pos.x / 16), Math.floor(pos.z / 16));
            this._chunks[index] = chunk;
        }
        return chunk;
    }

    public getChunkAt(pos: Vector3): Maybe<Chunk> {
        const index = this.worldPosToChunkIndex(pos);
        return this._chunks[index];
    }


    static worldToScenePosition(pos: Vector3): Vector3 {
        return new Vector3(
            pos.x * 16.0,
            pos.y * 16.0,
            pos.z * 16.0
        );
    }

    static sceneToWorldPosition(pos: Vector3): Vector3 {
        return new Vector3(
            pos.x / 16.0,
            pos.y / 16.0,
            pos.z / 16.0
        );
    }

    worldPosToChunkIndex(pos: Vector3): number {
        const chunkX = Math.floor(pos.x / 16);
        const chunkZ = Math.floor(pos.z / 16);
        return chunkZ * this._size + chunkX;
    }

}
