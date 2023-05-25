import { Asset, AssetManager as CCAssetManager, Constructor, Node, Prefab, SpriteFrame, assetManager, warn } from "cc";
import { Action, Func } from "framework/utility/ActionEvent";

// const poolKey = "__poolKey";

export default class AssetManager {
    public static readonly RELEASE_EVENT = "ASSET_RELEASE_EVENT";
    protected static nativeAssetMap = new Map<string, any>();
    protected static loadingAssetsMap = new Map<string, Promise<any>>();
    protected static nodePoolMap = new Map<Prefab | Node, Node[]>();

    // protected _rootNode: Node;
    // public get rootNode() { return AssetManager._rootNode; }

    // public static CreateRootNode(parent?: Node): Node {
    //     let node = new Node("ObjectPool");
    //     director.addPersistRootNode(node);
    //     node.parent = parent;
    //     // node.y = 100000; // 改坐标是因为从池中取出后，物理会立即回调。
    //     node.active = false;
    //     return node;
    // }

    public static initialize(rootNode?: Node) {
        // AssetManager._rootNode = rootNode;
    }

    public static finalize(): void {
        // if (AssetManager.rootNode) {
        //     AssetManager.rootNode.destroy();
        // } else {
        //     for (let nodes of AssetManager.nodePoolMap.values()) {
        //         for (let node of nodes) if (node.isValid) node.destroy();
        //     }
        // }
        AssetManager.nativeAssetMap.clear();
        AssetManager.loadingAssetsMap.clear();
        AssetManager.nodePoolMap.clear();
    }

    public static getAsset<T extends Asset>(assetPath: string): T {
        console.assert(!String.isEmptyOrNull(assetPath), "Asset path cannot be empty or null");
        return AssetManager.nativeAssetMap.get(assetPath);
    }

    public static setAsset<T extends Asset>(assetsPath: string, asset: T, replace: boolean = false): void {
        if (!replace && AssetManager.nativeAssetMap.has(assetsPath)) warn("Set asset had exist!", assetsPath, asset);
        AssetManager.nativeAssetMap.set(assetsPath, asset);
    }

    public static async loadCache<T extends Asset>(assetPath: string, type: Constructor<T>, loadFunc: Func<Promise<T>, [string, Constructor<T>]>): Promise<T> {
        let asset = AssetManager.getAsset<T>(assetPath);
        if (asset != null) return asset;
        let promise = AssetManager.loadingAssetsMap.get(assetPath);
        if (promise == null) {
            promise = loadFunc(assetPath, type);
            AssetManager.loadingAssetsMap.set(assetPath, promise);
        }
        return promise;
    }

    public static async loadUrlAsset<T extends Asset>(urlPath: string | { uuid?: string, url?: string, type?: string }, type: Constructor<T>, translateRes?: Func<T, any>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            assetManager.loadAny(urlPath, (error, resource) => {
                if (urlPath instanceof Object) urlPath = urlPath.url ?? urlPath.uuid;
                AssetManager.onLoadAssetCompleted(urlPath, error, resource, translateRes, resolve, reject);
            });
        })
    }

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

    public static async loadTextureRes(assetPath: string): Promise<SpriteFrame> {
        return AssetManager.loadRes<SpriteFrame>(assetPath, SpriteFrame);
    }

    public static async loadSpriteFrameUrl(urlPath: string, sprite: { spriteFrame: SpriteFrame }): Promise<SpriteFrame> {
        let spriteFrame = await AssetManager.loadUrl(urlPath, SpriteFrame);
        sprite.spriteFrame = spriteFrame;
        return spriteFrame;
    }

    public static async loadSpriteFrameRes(assetPath: string, sprite: { spriteFrame: SpriteFrame }): Promise<SpriteFrame> {
        let spriteFrame = await AssetManager.loadRes<SpriteFrame>(assetPath, SpriteFrame);
        sprite.spriteFrame = spriteFrame;
        return spriteFrame;
    }

    /**
     * 获得资源bundle，路径示例：bundleName:prefabs/icons/hero
     * @param urlPath 
     */
    public static async getBundle(urlPath: string): Promise<CCAssetManager.Bundle> {
        const pathes = urlPath.split(":", 2);
        if (pathes.length == 1) return assetManager.resources;
        const bundle = assetManager.getBundle(pathes.first);
        if (bundle != null)
            return bundle;
        return new Promise(resolve => assetManager.loadBundle(pathes.first, (error, bundle) => {
            resolve(bundle);
        }));
    }

    public static async loadResAsset<T extends Asset>(urlPath: string, type: Constructor<T>, translateRes?: Func<T, [any]>): Promise<T> {
        const bundle = await AssetManager.getBundle(urlPath);
        console.assert(bundle != null, "Cannot find the bundle from path:", urlPath);
        return new Promise<T>((resolve, reject) => {
            bundle.load(urlPath, type, (error, resource) => AssetManager.onLoadAssetCompleted(urlPath, error, resource, translateRes, resolve, reject));
        });
    }

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

    // public async CreateNode(assetPath: string | Prefab | Node, parent: Node = null, position?: Vec3, rotation?: Quat, scale?: Vec3 | number): Promise<Node> {
    //     if (typeof assetPath === `string`)
    //         assetPath = await this.LoadRes<Prefab>(assetPath, Prefab);
    //     return this.InstantiateNode(assetPath, parent, position, rotation, scale);
    // }

    // public CreateNodeSync(assetPath: string | Prefab | Node, parent: Node = null, position?: Vec3, rotation?: Quat, scale?: Vec3 | number): Node {
    //     let asset: Prefab | Node;
    //     if (typeof assetPath === `string`) {
    //         asset = this.GetAsset<Prefab>(assetPath);
    //         if (asset == null) return null;
    //     } else {
    //         asset = assetPath;
    //     }
    //     return this.InstantiateNode(asset, parent, position, rotation, scale);
    // }

    // public DestroyNode(node: Node): void {
    //     if (node.isValid && !this.ReleaseNode(node))
    //         node.destroy();
    // }

    // public InstantiateNode(prefab: Prefab | Node, parent: Node = null, position?: Vec3, rotation?: Quat, scale?: Vec3 | number): Node {
    //     let objectList = this.nodePoolMap.get(prefab instanceof Prefab ? prefab : (prefab[poolKey] || prefab));
    //     if (objectList == null) {
    //         objectList = [];
    //         this.nodePoolMap.set(prefab, objectList);
    //     }

    //     let node: Node = objectList.length > 0 ? objectList.pop() : instantiate(prefab) as Node;
    //     node[poolKey] = prefab;
    //     if (parent != null && !parent.isValid) {
    //         console.warn("Load asset to set parent failed. parent is invalid.", node);
    //         parent = null;
    //     }
    //     if (position != null) node.setPosition(position);
    //     if (rotation != null) rotation instanceof Quat ? node.setRotation(rotation.x, rotation.y, rotation.z, rotation.w) : node.rotation = rotation;
    //     if (typeof scale === `number`)
    //         node.setScale(scale, scale, scale);
    //     else if (scale != null)
    //         node.setScale(scale);

    //     node.setParent(parent);
    //     return node;
    // }

    // public ReleaseNode(node: Node): boolean {
    //     if (node.parent == this.rootNode) return true;

    //     let objectList = this.nodePoolMap.get(node[poolKey]);
    //     if (objectList == null) return false;

    //     node[poolKey] = null;
    //     node.emit(AssetManager.RELEASE_EVENT);
    //     node.setParent(this.rootNode);
    //     objectList.push(node);
    //     return true;
    // }
}