import IViewController from "./IViewController";
import AssetViewController from "./AssetViewController";
import ViewController from "./ViewController";

export default class ViewControllerFactory {
    public static create<T extends IViewController>(type: { prototype: T, new() } | string): T {
        return typeof type === 'string' ? new AssetViewController(type) : ViewController.isPrototypeOf(type) ? new type() : new ViewController();
    }
}