import { AsyncLoadingCache, Caches, Loader, LoadingCache, SimpleCache } from "@inventivetalent/loading-cache";
import { BoxGeometryKey, CacheKey, serializeBoxGeometryKey, serializeImageKey, TextureKey } from "./CacheKey";
import { Time } from "@inventivetalent/time";
import { ImageInfo, ImageLoader } from "../image/ImageLoader";
import { BoxGeometry, Material, Mesh, PixelFormat, RGBAFormat, Texture } from "three";
import { TextureLoader } from "../texture/TextureLoader";
import { Geometry } from "three/examples/jsm/deprecated/Geometry";
import { Geometries } from "../Geometries";
import { Meshes } from "../Meshes";
import { Textures } from "../Textures";
import { Materials } from "../Materials";
import { CompatImage } from "../CanvasCompat";
import { Model, TextureAsset } from "../model/Model";
import { WrappedImage } from "../WrappedImage";

export class Caching {

    static readonly rawImageCache: AsyncLoadingCache<CacheKey, ImageInfo> = Caches.builder()
        .expireAfterWrite(Time.minutes(2))
        .expireAfterAccess(Time.seconds(20))
        .expirationInterval(Time.seconds(5))
        .buildAsync<CacheKey, ImageInfo>();
    static readonly imageDataCache: AsyncLoadingCache<CacheKey, ImageData> = Caches.builder()
        .expireAfterWrite(Time.minutes(5))
        .expireAfterAccess(Time.minutes(1))
        .expirationInterval(Time.seconds(10))
        .buildAsync<CacheKey, ImageData>();
    static readonly wrappedImageCache: AsyncLoadingCache<CacheKey, WrappedImage> = Caches.builder()
        .expireAfterWrite(Time.minutes(5))
        .expireAfterAccess(Time.minutes(1))
        .expirationInterval(Time.seconds(10))
        .buildAsync<CacheKey, WrappedImage>();

    static readonly boxGeometryCache: SimpleCache<CacheKey, BoxGeometry> = Caches.builder()
        .expireAfterWrite(Time.minutes(2))
        .expireAfterAccess(Time.minutes(1))
        .expirationInterval(Time.seconds(20))
        .build<CacheKey, BoxGeometry>();

    static readonly textureCache: SimpleCache<CacheKey, Texture> = Caches.builder()
        .expireAfterWrite(Time.minutes(10))
        .expireAfterAccess(Time.minutes(2))
        .expirationInterval(Time.seconds(30))
        .build<CacheKey, Texture>();

    static readonly materialCache: SimpleCache<CacheKey, Material> = Caches.builder()
        .expireAfterWrite(Time.minutes(10))
        .expireAfterAccess(Time.minutes(2))
        .expirationInterval(Time.seconds(30))
        .build<CacheKey, Material>();

    static readonly boxMeshCache: SimpleCache<CacheKey, Mesh> = Caches.builder()
        .expireAfterWrite(Time.minutes(10))
        .expireAfterAccess(Time.minutes(2))
        .expirationInterval(Time.seconds(30))
        .build<CacheKey, Mesh>();

    static readonly textureAssetCache: AsyncLoadingCache<CacheKey, TextureAsset> = Caches.builder()
        .expireAfterWrite(Time.minutes(4))
        .expireAfterAccess(Time.minutes(2))
        .expirationInterval(Time.seconds(30))
        .buildAsync<CacheKey, TextureAsset>();

    static readonly rawModelCache: AsyncLoadingCache<CacheKey, Model> = Caches.builder()
        .expireAfterWrite(Time.minutes(6))
        .expireAfterAccess(Time.minutes(3))
        .expirationInterval(Time.seconds(30))
        .buildAsync<CacheKey, Model>();
    static readonly mergedModelCache: AsyncLoadingCache<CacheKey, Model> = Caches.builder()
        .expireAfterWrite(Time.minutes(10))
        .expireAfterAccess(Time.minutes(5))
        .expirationInterval(Time.seconds(30))
        .buildAsync<CacheKey, Model>();


    public static clear() {
        this.rawImageCache.invalidateAll();
        this.textureCache.invalidateAll();
    }

    public static end() {
        this.clear();

        this.rawImageCache.end();
        this.textureCache.end();
    }

}
