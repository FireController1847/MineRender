import { CompatImage, createCanvas, createImage } from "../canvas/CanvasCompat";
import { serializeImageKey } from "../cache/CacheKey";
import { Caching } from "../cache/Caching";
import { AxiosResponse } from "axios";
import imageSize from "image-size";
import { Requests } from "../request/Requests";
import { SSAOPassOUTPUT } from "three/examples/jsm/postprocessing/SSAOPass";
import { WrappedImage } from "../WrappedImage";
import { ExtractableImageData } from "../ExtractableImageData";

export interface ImageInfo {
    src?: string;
    width: number;
    height: number;
    type?: string;
    data: Buffer;
}

export class ImageLoader {

    protected static _createImage(): CompatImage {
        //TODO: probably needs cross-origin stuff set for browser
        return createImage();
    }

    public static async loadAsync(src: string): Promise<CompatImage> {
        return new Promise<CompatImage>((resolve, reject) => {
            const image = this._createImage();
            image.src = src;
            image.onload = () => resolve(image);
            image.onerror = (err: Error) => reject(err);
        });
    }

    public static loadElement(src: string, onload?: () => void, onerr?: (err: Error) => void): CompatImage {
        const image = this._createImage();
        image.src = src;
        if (onload)
            image.onload = onload;
        if (onerr)
            image.onerror = onerr;
        return image;
    }

    public static async loadData(src: string): Promise<ImageData> {
        return await this.infoToData(await this.getInfo(src));
    }

    public static async loadCanvasData(src: string): Promise<ExtractableImageData> {
        return await this.infoToCanvasData(await this.getInfo(src));
    }

    public static async infoToCanvasData(info: ImageInfo): Promise<ExtractableImageData> {
        const image = await ImageLoader.loadAsync(info.src!);
        const canvas = createCanvas(info.width, info.height);
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;
        context.drawImage(image as CanvasImageSource, 0, 0);
        return {
            data: context,
            width: info.width,
            height: info.height
        }

        // return new ImageData(new Uint8ClampedArray(info.data), info.width, info.height)
    }


    public static async infoToData(info: ImageInfo): Promise<ImageData> {
        const image = await ImageLoader.loadAsync(info.src!);
        const canvas = createCanvas(info.width, info.height);
        const context = canvas.getContext("2d") as CanvasRenderingContext2D;
        context.drawImage(image as CanvasImageSource, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height);


        // return new ImageData(new Uint8ClampedArray(info.data), info.width, info.height)
    }

    public static async getData(src: string): Promise<ImageData> {
        const keyStr = serializeImageKey({ src });
        return (await Caching.imageDataCache.get(keyStr, k => {
            return ImageLoader.loadData(src);
        }))!;
    }

    public static async getCanvasData(src: string): Promise<ExtractableImageData> {
        const keyStr = serializeImageKey({ src });
        return (await Caching.canvasImageDataCache.get(keyStr, k => {
            return ImageLoader.loadCanvasData(src);
        }))!;
    }

    public static async processResponse(response: AxiosResponse): Promise<ImageInfo> {
        const src = response.config.url;
        const data = Buffer.from(response.data);
        const { width, height, type } = imageSize(data);
        return {
            src,
            width: width || 0,
            height: height || 0,
            type,
            data: data
        }
    }


    public static async loadInfo(src: string): Promise<ImageInfo> {
        return Requests.genericRequest({
            url: src,
            responseType: "arraybuffer"
        }).then(this.processResponse);
    }

    public static async getInfo(src: string): Promise<ImageInfo> {
        const keyStr = serializeImageKey({ src });
        return (await Caching.rawImageCache.get(keyStr, k => {
            return ImageLoader.loadInfo(src);
        }))!;
    }

    public static async loadWrapped(src: string): Promise<WrappedImage> {
        const data = await this.getCanvasData(src);
        return new WrappedImage(data);
    }

    public static async getWrapped(src: string): Promise<WrappedImage> {
        const keyStr = serializeImageKey({ src });
        return (await Caching.wrappedImageCache.get(keyStr, k => {
            return ImageLoader.loadWrapped(src);
        }))!;
    }


}
