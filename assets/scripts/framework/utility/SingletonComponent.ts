import { Component, _decorator } from "cc";

const { disallowMultiple } = _decorator;
@disallowMultiple
export class SingletonComponent extends Component {

    public static getInstance<T extends { prototype: any; } = any>(this: T): T["prototype"] {
        return this.prototype._instance;
    }

    protected __preload(): void {
        this.constructor.prototype._instance = this;
    }
}
