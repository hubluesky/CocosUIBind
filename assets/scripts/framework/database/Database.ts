import { Asset, JsonAsset } from "cc";
import AssetManager from "framework/asset/AssetManager";

export interface Prototype {
    /** 原型Id */
    readonly prototypeId: number;
}

export default abstract class Database {

    public Initialize(assetPath: string): Promise<void> | void {
        if (assetPath == null) {
            return this.OnLoad();
        } else {
            return this.LoadAsync(assetPath);
        }
    }

    protected async LoadAsync(assetPath: string): Promise<void> {
        let resource = await AssetManager.Default.LoadRes(assetPath, Asset);
        if (resource instanceof JsonAsset)
            await this.OnLoadJson(resource.json);
        // else if (resource instanceof BufferAsset)
        //     await this.OnLoadBinary((<any>resource)._buffer);
    }

    /** 加载代码配置回调 */
    protected OnLoad(): Promise<void> | void { return; }
    /** 加载Josn资源配置回调 */
    protected async OnLoadJson(json: Object): Promise<void> { }
    /** 加载zip资源配置回调 */
    protected async OnLoadZip(buffer: ArrayBuffer): Promise<void> { }
    /** 加载二进制资源配置回调 */
    protected async OnLoadBinary(buffer: ArrayBuffer): Promise<void> { }
}