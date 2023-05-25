import { Asset, JsonAsset } from "cc";
import AssetManager from "framework/asset/AssetManager";

export interface Prototype {
    /** 原型Id */
    readonly prototypeId: number;
}

export default abstract class Database {

    public initialize(assetPath: string): Promise<void> | void {
        if (assetPath == null) {
            return this.onLoad();
        } else {
            return this.loadAsync(assetPath);
        }
    }

    protected async loadAsync(assetPath: string): Promise<void> {
        let resource = await AssetManager.loadRes(assetPath, Asset);
        if (resource instanceof JsonAsset)
            await this.onLoadJson(resource.json);
        // else if (resource instanceof BufferAsset)
        //     await this.OnLoadBinary((<any>resource)._buffer);
    }

    /** 加载代码配置回调 */
    protected onLoad(): Promise<void> | void { return; }
    /** 加载Josn资源配置回调 */
    protected async onLoadJson(json: Object): Promise<void> { }
    /** 加载zip资源配置回调 */
    protected async onLoadZip(buffer: ArrayBuffer): Promise<void> { }
    /** 加载二进制资源配置回调 */
    protected async onLoadBinary(buffer: ArrayBuffer): Promise<void> { }
}