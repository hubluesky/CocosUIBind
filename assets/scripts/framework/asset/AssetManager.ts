import { Asset, AssetManager as CCAssetManager, Constructor, Node, Prefab, SpriteFrame, assetManager, warn } from "cc";
import { Action, Func } from "framework/utility/ActionEvent";

/**
 * 整个游戏的资源加载与缓存对象，通过封装，可以忽略bundle的存在，而使用bundleName:这样的方式来识别。
 */
export default class AssetManager {
    protected static nativeAssetMap = new Map<string, any>();
    protected static loadingAssetsMap = new Map<string, Promise<any>>();
    protected static nodePoolMap = new Map<Prefab | Node, Node[]>();

    public static initialize() { }

    public static finalize(): void {
        AssetManager.nativeAssetMap.clear();
        AssetManager.loadingAssetsMap.clear();
        AssetManager.nodePoolMap.clear();
    }

    /**
     * 直接获得已经加载并缓存的资源
     * @param assetPath 资源路径
     * @returns 资源对象
     */
    public static getAsset<T extends Asset>(assetPath: string): T {
        console.assert(!String.isEmptyOrNull(assetPath), "Asset path cannot be empty or null");
        return AssetManager.nativeAssetMap.get(assetPath);
    }

    /**
     * 设置要缓存的资源
     * @param assetsPath 资源路径
     * @param asset 资源对象
     * @param replace 是否强制替换原有的资源（如果原来已经有这个资源路径的资源了）
     */
    public static setAsset<T extends Asset>(assetsPath: string, asset: T, replace: boolean = false): void {
        if (!replace && AssetManager.nativeAssetMap.has(assetsPath)) warn("Set asset had exist!", assetsPath, asset);
        AssetManager.nativeAssetMap.set(assetsPath, asset);
    }

    /**
     * 加载资源，如果缓存中有这个资源，就返回缓存的资源，否则添加到加载资源队列加载。
     * @param assetPath 资源路径
     * @param type 资源类型
     * @param loadFunc 资源加载函数
     * @returns 异步资源对象
     */
    protected static async loadCache<T extends Asset>(assetPath: string, type: Constructor<T>, loadFunc: Func<Promise<T>, [string, Constructor<T>]>): Promise<T> {
        let asset = AssetManager.getAsset<T>(assetPath);
        if (asset != null) return asset;
        let promise = AssetManager.loadingAssetsMap.get(assetPath);
        if (promise == null) {
            promise = loadFunc(assetPath, type);
            AssetManager.loadingAssetsMap.set(assetPath, promise);
        }
        return promise;
    }

    protected static async loadUrlAsset<T extends Asset>(urlPath: string | { uuid?: string, url?: string, type?: string; }, type: Constructor<T>, translateRes?: Func<T, any>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            assetManager.loadAny(urlPath, (error, resource) => {
                if (urlPath instanceof Object) urlPath = urlPath.url ?? urlPath.uuid;
                AssetManager.onLoadAssetCompleted(urlPath, error, resource, translateRes, resolve, reject);
            });
        });
    }

    /**
     * 加载远程资源
     * @param urlPath 远程资源url
     * @param type 资源类型
     * @returns 异步资源对象
     */
    public static async loadUrl<T extends Asset>(urlPath: string, type: Constructor<T>): Promise<T> {
        return AssetManager.loadCache(urlPath, type, AssetManager.loadUrlAsset.bind(this));
    }

    public static getUrlType(urlPath: string): string {
        return urlPath.includes("jpg") ? "jpg" : "png";
    }

    // public async LoadTextureUrl(urlPath: string): Promise<SpriteFrame> {
    //     return AssetManager.LoadCache<SpriteFrame>(urlPath, SpriteFrame, async (path: string, type: Constructor<SpriteFrame>) => {
    //         return await new Promise(resolve => {
    //             textureUtil.loadImage(path, function (err, imageAsset) {
    //                 if (err) return resolve(null);
    //                 let spriteFrame = new SpriteFrame();
    //                 spriteFrame.texture = imageAsset._texture;
    //                 resolve(spriteFrame);
    //             })
    //         });
    //         // return AssetManager.LoadUrlAsset<SpriteFrame>({ url: path, type: AssetManager.GetUrlType(urlPath) }, type, (texture) => {
    //         //     let spriteFrame = new SpriteFrame();
    //         //     spriteFrame.texture = texture;
    //         //     return spriteFrame;
    //         // });
    //     });
    // }

    // public static async loadTextureRes(assetPath: string): Promise<SpriteFrame> {
    //     return AssetManager.loadRes<SpriteFrame>(assetPath, SpriteFrame);
    // }

    public static async loadSpriteFrameUrl(urlPath: string, sprite: { spriteFrame: SpriteFrame; }): Promise<SpriteFrame> {
        let spriteFrame = await AssetManager.loadUrl(urlPath, SpriteFrame);
        sprite.spriteFrame = spriteFrame;
        return spriteFrame;
    }

    public static async loadSpriteFrameRes(assetPath: string, sprite: { spriteFrame: SpriteFrame; }): Promise<SpriteFrame> {
        let spriteFrame = await AssetManager.loadRes<SpriteFrame>(assetPath, SpriteFrame);
        sprite.spriteFrame = spriteFrame;
        return spriteFrame;
    }

    /**
     * 获得资源bundle，路径示例：bundleName:prefabs/icons/hero
     * @param urlPath 
     */
    protected static async getBundle(urlPath: string): Promise<CCAssetManager.Bundle> {
        const pathes = urlPath.split(":", 2);
        if (pathes.length == 1) return assetManager.resources;
        const bundle = assetManager.getBundle(pathes.first);
        if (bundle != null)
            return bundle;
        return new Promise(resolve => assetManager.loadBundle(pathes.first, (error, bundle) => {
            resolve(bundle);
        }));
    }

    protected static async loadResAsset<T extends Asset>(urlPath: string, type: Constructor<T>, translateRes?: Func<T, [any]>): Promise<T> {
        const bundle = await AssetManager.getBundle(urlPath);
        console.assert(bundle != null, "Cannot find the bundle from path:", urlPath);
        return new Promise<T>((resolve, reject) => {
            bundle.load(urlPath, type, (error, resource) => AssetManager.onLoadAssetCompleted(urlPath, error, resource, translateRes, resolve, reject));
        });
    }

    /**
     * 加载本地资源
     * @param assetPath 资源路径
     * @param type 资源类型
     * @returns 异步资源对象
     */
    public static async loadRes<T extends Asset>(assetPath: string, type: Constructor<T>): Promise<T> {
        return AssetManager.loadCache(assetPath, type, AssetManager.loadResAsset.bind(this));
    }

    protected static onLoadAssetCompleted<T extends Asset>(assetPath: string, error: Error, resource: any, translateRes: Func<T, any>, resolve: Action<[T | PromiseLike<T>]>, reject: Action<[any]>): void {
        AssetManager.loadingAssetsMap.delete(assetPath);
        if (error) {
            // if (CC_DEBUG) return reject(`Load asset failed: ${error} :${assetPath}`);
            console.warn("Load asset failed: ", assetPath, error);
        } else {
            let asset: T = translateRes == null ? resource : translateRes(resource);
            AssetManager.setAsset<T>(assetPath, asset);
            resolve(asset);
        }
    }
}