import { Func } from "framework/utility/ActionEvent";
import Database, { Prototype } from "./Database";
// import { ZipCompress } from "../zip/ZipCompress";

export default abstract class ArrayDatabase<T extends Prototype> extends Database {
    protected _prototypeList: T[];
    /** 原型列表 */
    public get prototypeList(): ReadonlyArray<T> { return this._prototypeList; }
    public get length() { return this.prototypeList.length; }
    public get prototypeLength() { return this.prototypeList.length; }

    protected onLoad(): Promise<void> | void {
        let result = this.onLoadArray();
        if (result instanceof Promise)
            return this.waitForPrototypeList(result);
        this._prototypeList = result;
    }

    private async waitForPrototypeList(listPromise: Promise<T[]>): Promise<void> {
        this._prototypeList = await listPromise;
    }

    protected async onLoadJson(json: Object): Promise<void> {
        this._prototypeList = await this.OnLoadJsonArray(json);
    }

    protected async onLoadBinary(buffer: ArrayBuffer): Promise<void> {
        this._prototypeList = await this.OnLoadBinaryArray(buffer);
    }

    protected async onLoadZip(buffer: ArrayBuffer): Promise<void> {
        let utf8Buffer = await new Promise<Uint8Array>((resolve, reject) => {
            // ZipCompress.unzip(new Uint8Array(buffer), (array: Uint8Array, error: string) => {
            //     error != null ? reject(error) : resolve(array)
            // });
        });;
        this._prototypeList = await this.OnLoadBinaryArray(utf8Buffer);
    }

    /** 加载代码原型列表配置 */
    protected onLoadArray(): Promise<T[]> | T[] { return null; }
    /** 加载Json原型列表配置 */
    protected async OnLoadJsonArray(json: Object): Promise<T[]> { return null; }
    /** 加载二进制原型列表配置 */
    protected async OnLoadBinaryArray(buffer: ArrayBuffer): Promise<T[]> { return null; }

    public find(prototypeId: number): T;
    public find(predicate: Func<boolean, [T, number, ReadonlyArray<T>]>, thisArg?: any): T;

    public find(predicate: Func<boolean, [T, number, ReadonlyArray<T>]> | number, thisArg?: any): T {
        if (typeof predicate === `number`) return this.prototypeList.find((x) => x.prototypeId == predicate);
        return this.prototypeList.find(predicate, thisArg);
    }

    public findIndex(prototypeId: number): number {
        return this.prototypeList.findIndex((x) => x.prototypeId == prototypeId);
    }

    public get(index: number): T {
        return this.prototypeList[index];
    }

    public firstPrtotype(): T { return this._prototypeList.first; }
    public lastPrototype(): T { return this._prototypeList.last; }

    public randomPrototype(): T {
        return Math.randomArrayValue(this.prototypeList);
    }

    public randomPrototypeId(): number {
        return this.randomPrototype().prototypeId;
    }
}