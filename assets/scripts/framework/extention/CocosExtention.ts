import { IQuatLike } from "cc";
import { Camera, Component, director, game, instantiate, IVec2, IVec3, IVec3Like, IVec4Like, Node, Quat, UIOpacity, UIRenderer, Vec2, Vec3, Vec4 } from "cc";
import { EDITOR } from "cc/env";

/**
 * CocosCreator vesrsion 3.6.2
 */
declare module "cc" {
    interface UIRenderer {
        colorR: number;
        colorG: number;
        colorB: number;
        colorA: number;
        alpha: number;
    }

    interface UIOpacity {
        alpha: number;
    }

    interface Node {
        /** 2D节点的alpha[范围0~1]，实现原理，从当前节点获得UIRenderer对象，如果有就使用color.a，没有的话，就会获得UIOpacity，再修改UIOpacity的opacity */
        alpha: number;
        positionX: number;
        positionY: number;
        positionZ: number;
        worldPositionX: number;
        worldPositionY: number;
        worldPositionZ: number;
        eulerAngleX: number;
        eulerAngleY: number;
        eulerAngleZ: number;
        scaleX: number;
        scaleY: number;
        scaleZ: number;
        scaleXY: number;
        scaleXZ: number;
        scaleXYZ: number;

        getComponentInParents<T extends Component>(type: { prototype: T }): T;

        getOrAddComponent<T extends Component>(type: { prototype: T }): T;
        /**
         * 搜索子节点
         * @param name 子节点的名字 
         */
        searchChild(name: string): this | null;

        enabledAllChild(enabled: boolean, startIndex?: number): void;
        /**
         * 克隆一个子对象
         * @param indexClone 克隆子的索引，默认为0
         */
        instantiateChild(indexClone?: number): this | null;
        /**
         * 获得或者克隆一个子对象
         * @param index 获得子对象的索引
         * @param indexClone 克隆子的索引，默认为0
         */
        getOrCreateChild(index: number, indexClone?: number): this | null;
        /**
         * 获得或者克隆一个子对象，并且设置active为true
         * @param index 获得子对象的索引
         * @param indexClone 克隆子的索引，默认为0
         */
        getOrCreateAndActiveChild(index: number, indexClone?: number): this | null;
    }

    namespace Node {
        var UI_TO_WROLD_RATE: number;
        function uiDirectionToWorld(direction: Vec2, out?: Vec3): Vec3;
    }

    interface Component {
        getComponentInParents<T extends Component>(type: { prototype: T }): T;
        getOrAddComponent<T extends Component>(type: { prototype: T }): T;
        waitForTime(time: number): Promise<void>;
    }

    namespace Camera {
        var mainCamera: Camera;
        var canvasCamera: Camera;
    }

    interface Label {
        /**
         * 格式化多语言文本。例如：label.format("My name is {0}, and my age is {1}", "hubluesky", 18);
         * 大括号内的数字对应后面params参数对应的索引位置。
         * 此函数只在该节点有@see LocalizeLabel 的时候才有效果。
         * 
         * @param format 格式化的字符串
         * @param params 格式化参数
         */
        format(format: string, ...params: any[]): void;
        /**
         * 更新文本样式。
         * 此函数只在该节点有@see LocalizeLabel 的时候才有效果。
         * @param key 样式的key
         */
        updateStyle(key?: string): void;
        /** 当前使用的多语言的key */
        readonly localizeKey: string;
    }

    // interface ParticleSystem {
    //     stop2(): void;
    // }


    interface Vec2 {
        addAndScale(v: IVec2, s: number): Vec2;
    }

    namespace Vec3 {
        var BACK: Readonly<Vec3>;
        var LEFT: Readonly<Vec3>;
        var DOWN: Readonly<Vec3>;
        /**
         * 平滑插值
         * @param current 当前值
         * @param target 目标值
         * @param currentVelocity 当前速度，需要外部保存此变量
         * @param smoothTime 到达目标的大约时间，较小的值将快速到达目标，此值必须大于0
         * @param maxSpeed 最大速度，默认为Infinity
         * @param deltaTime 每帧的时长，默认为game.deltaTime
         */
        function smoothDamp(current: Vec3, target: IVec3, currentVelocity: Vec3, smoothTime: number, maxSpeed?: number, deltaTime?: number): Vec3;
        /**
         * 设置新的长度
         * @param length 新的长度
         */
        function setLength(vec: Vec3, length: number): Vec3;
        /**
         * 求向量交叉方向，即a向量是在b向量的左边还是右边
         * @param a 向量a
         * @param b 向量b
         */
        function crossDirection(a: IVec3Like, b: IVec3Like): number;

        function squaredDistanceXZ(a: IVec3Like, b: IVec3Like): number;
        function distanceXZ(a: IVec3Like, b: IVec3Like): number;
    }

    interface Vec3 {
        transformQuat(q: IQuatLike): this;
        /**
         * 平滑插值
         * @param target 目标值
         * @param currentVelocity 当前速度，需要外部保存此变量
         * @param smoothTime 到达目标的大约时间，较小的值将快速到达目标，此值必须大于0
         * @param maxSpeed 最大速度，默认为Infinity
         * @param deltaTime 每帧的时长，默认为game.deltaTime
         */
        smoothDamp(target: IVec3, currentVelocity: Vec3, smoothTime: number, maxSpeed?: number, deltaTime?: number): Vec3;
        /**
         * 设置新的长度
         * @param length 新的长度
         */
        setLength(length: number): Vec3;

        addAndScale(v: IVec3, s: number): Vec3;

        lengthXZSqr(): number;
        /** 水平面长度 */
        lengthXZ(): number;
        /** 有任意轴为nan */
        isNaN(): boolean;
    }

    interface Vec4 {
        project<Out extends IVec4Like>(out: Out, a: IVec4Like, b: IVec4Like): Out;
    }

    interface Quat {
        /**
         * 两个四元数的夹角
         * @param target 目标四元数
         * @returns 返回夹角的弧度
         */
        angle(target: Quat): number;
        /**
         * 平滑插值两个四元数
         * @param target 目标值
         * @param velocity 当前速度，需要外部保存此变量
         * @param smoothTime 到达目标的大约时间，较小的值将快速到达目标，此值必须大于0
         * @param maxSpeed 最大速度，默认为Infinity
         * @param deltaTime 每帧的时长，默认为game.deltaTime
         */
        smoothDamp(target: Quat, velocity: { current: number }, smoothTime: number, maxSpeed?: number, deltaTime?: number): Quat;
    }

    namespace Quat {
        /**
         * 两个四元数的夹角
         * @param source 起始四元数
         * @param target 目标四元数
         * @returns 返回夹角的弧度
         */
        function angle(source: Quat, target: Quat): number;
    }
}

Object.defineProperties(UIRenderer.prototype, {
    "colorR": {
        get: function () { return this.color.r; },
        set: function (v) {
            if (this.color.r == v) return;
            this.color.r = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorG": {
        get: function () { return this.color.g; },
        set: function (v) {
            if (this.color.g == v) return;
            this.color.g = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorB": {
        get: function () { return this.color.b; },
        set: function (v) {
            if (this.color.b == v) return;
            this.color.b = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "colorA": {
        get: function () { return this.color.a; },
        set: function (v) {
            if (this.color.a == v) return;
            this.color.a = v;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
    "alpha": {
        get: function () { return this.color.a / 255; },
        set: function (v) {
            this.color.a = v * 255;
            this._updateColor();
            if (EDITOR)
                this.node.emit(Node.EventType.COLOR_CHANGED, this.color.clone());
        },
        enumerable: true,
        configurable: true
    },
});

Object.defineProperties(UIOpacity.prototype, {
    "alpha": {
        get: function () { return this.opacity / 255; },
        set: function (v) {
            // if (this.opacity == v) return;
            this.opacity = v * 255;
        },
        enumerable: true,
        configurable: true
    },
});

Object.defineProperties(Node.prototype, {
    alpha: {
        get: function () {
            const self: Node = this;
            let uiRenderer = self.getComponent(UIRenderer);
            if (uiRenderer != null) return uiRenderer.alpha;
            let uiOpacity = self.getComponent(UIOpacity);
            return uiOpacity.alpha;
        },
        set: function (v) {
            const self: Node = this;
            let uiRenderer = self.getComponent(UIRenderer);
            if (uiRenderer != null) {
                if (uiRenderer.alpha != v)
                    uiRenderer.alpha = v;
            } else {
                let uiOpacity = self.getComponent(UIOpacity);
                if (uiOpacity.alpha != v)
                    uiOpacity.alpha = v;
            }
        },
        enumerable: true,
        configurable: true
    },
    positionX: {
        get: function () { return this.position.x; },
        set: function (v) {
            if (this.position.x == v) return;
            this.position.x = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    positionY: {
        get: function () { return this.position.y; },
        set: function (v) {
            if (this.position.y == v) return;
            this.position.y = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    positionZ: {
        get: function () { return this.position.z; },
        set: function (v) {
            if (this.position.z == v) return;
            this.position.z = v;
            this.setPosition(this.position);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionX: {
        get: function () { return this.worldPosition.x; },
        set: function (v) {
            if (this.worldPosition.x == v) return;
            this.worldPosition.x = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionY: {
        get: function () { return this.worldPosition.y; },
        set: function (v) {
            if (this.worldPosition.y == v) return;
            this.worldPosition.y = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    worldPositionZ: {
        get: function () { return this.worldPosition.z; },
        set: function (v) {
            if (this.worldPosition.z == v) return;
            this.worldPosition.z = v;
            this.setWorldPosition(this.worldPosition);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleX: {
        get: function () { return this.eulerAngles.x; },
        set: function (v) {
            if (this.eulerAngles.x == v) return;
            this.eulerAngles.x = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleY: {
        get: function () { return this.eulerAngles.y; },
        set: function (v) {
            if (this.eulerAngles.y == v) return;
            this.eulerAngles.y = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    eulerAngleZ: {
        get: function () { return this.eulerAngles.z; },
        set: function (v) {
            if (this.eulerAngles.z == v) return;
            this.eulerAngles.z = v;
            this.setRotationFromEuler(this.eulerAngles);
        },
        enumerable: true,
        configurable: true
    },
    scaleX: {
        get: function () { return this.scale.x; },
        set: function (v) {
            if (this.scale.x == v) return;
            this.scale.x = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleY: {
        get: function () { return this.scale.y; },
        set: function (v) {
            if (this.scale.y == v) return;
            this.scale.y = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleZ: {
        get: function () { return this.scale.z; },
        set: function (v) {
            if (this.scale.z == v) return;
            this.scale.z = v;
            this.setScale(this.scale);
        },
        enumerable: true,
        configurable: true
    },
    scaleXY: {
        get: function () { return this.scale.x; },
        set: function (v) {
            this.setScale(v, v);
        },
        enumerable: true,
        configurable: true
    },
    scaleXZ: {
        get: function () { return this.scale.x; },
        set: function (v) {
            this.setScale(v, this.scaleY, v);
        },
        enumerable: true,
        configurable: true
    },

    scaleXYZ: {
        get: function () { return this.scale.x; },
        set: function (v) {
            this.setScale(v, v, v);
        },
        enumerable: true,
        configurable: true
    },
});

Node.prototype.getComponentInParents = function <T extends Component>(this: Node, type: { prototype: T, new() }): T {
    let component = this.getComponent(type);
    if (component != null) return component;
    if (this.parent == null) return null;
    return this.parent.getComponentInParents(type);
}

Node.prototype.getOrAddComponent = function <T extends Component>(this: Node, type: { prototype: T, new() }): T {
    let component = this.getComponent(type);
    if (component != null) return component;
    return this.addComponent(type);
}

Node.prototype.searchChild = function (this: Node, name: string) {
    let ret = this.getChildByName(name);
    if (ret) return ret;
    for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        if (!child.isValid) continue;
        ret = child.searchChild(name);
        if (ret) return ret;
    }
    return null;
}

Node.prototype.enabledAllChild = function (this: Node, enabled: boolean, startIndex: number = 0): void {
    for (let i = startIndex; i < this.children.length; i++)
        this.children[i].active = enabled;
}

Node.prototype.instantiateChild = function (this: Node, indexClone: number = 0) {
    let child = instantiate(this.children[indexClone]);
    this.addChild(child);
    return child;
}

Node.prototype.getOrCreateChild = function (this: Node, index: number, indexClone: number = 0) {
    return index < this.children.length ? this.children[index] : this.instantiateChild(indexClone);
}

Node.prototype.getOrCreateAndActiveChild = function (this: Node, index: number, indexClone: number = 0) {
    let child = this.getOrCreateChild(index, indexClone);
    child.active = true;
    return child;
}

Node.UI_TO_WROLD_RATE = 3;

Node.uiDirectionToWorld = function (direction: Vec2, out: Vec3 = new Vec3()): Vec3 {
    return out.set(-direction.x, 0, direction.y);
}

Component.prototype.getComponentInParents = function <T extends Component>(this: T, type: { prototype: T, new() }): T {
    return this.node.getComponentInParents(type);
}

Component.prototype.getOrAddComponent = function <T extends Component>(this: T, type: { prototype: T, new() }): T {
    let component = this.getComponent(type);
    if (component != null) return component;
    return this.addComponent(type);
}

Component.prototype.waitForTime = async function <T extends Component>(this: T, time: number): Promise<void> {
    return new Promise<void>((resolve) => this.scheduleOnce(resolve, time));
}

let cameraComponent: Camera;
Object.defineProperty(Camera, "mainCamera", {
    configurable: true,
    get() {
        if (cameraComponent == null || !cameraComponent.isValid) {
            const cameras = director.root.mainWindow.cameras;
            for (const camera of cameras) {
                if (camera.node != null) {
                    cameraComponent = camera.node.getComponent(Camera);
                    break;
                }
            }
            if (cameraComponent == null)
                cameraComponent = director.getScene()?.getChildByName("Main Camera")?.getComponent(Camera);
        }
        return cameraComponent;
    },
    set(v) {
        cameraComponent = v;
    }
});
// ParticleSystem.prototype.stop2 = function (this: Node): void {
//     if (this["_isPlaying"]) {
//         this["_isPlaying"] = false;
//     }
//     if (this["_isPaused"]) {
//         this["_isPaused"] = false;
//     }

//     this["_time"] = 0.0;
//     this["_emitRateTimeCounter"] = 0.0;
//     this["_emitRateDistanceCounter"] = 0.0;

//     this["_isStopped"] = true;

//     // if stop emit modify the refresh flag to true
//     this["_needRefresh"] = true;
// }

Vec2.prototype.addAndScale = function (v: IVec2, s: number): Vec2 {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
}

Vec3.BACK = Object.freeze(new Vec3(0, 0, 1));
Vec3.LEFT = Object.freeze(new Vec3(-1, 0, 0));
Vec3.DOWN = Object.freeze(new Vec3(0, -1, 0));


Vec3.smoothDamp = function (current: Vec3, target: IVec3, currentVelocity: Vec3, smoothTime: number, maxSpeed: number, deltaTime: number): Vec3 {
    return current.smoothDamp(target, currentVelocity, smoothTime, maxSpeed, deltaTime);
}

Vec3.setLength = function (current: Vec3, length: number): Vec3 {
    return current.setLength(length);
}

Vec3.crossDirection = function (a: IVec3Like, b: IVec3Like): number {
    return a.z * b.x - a.x * b.z;
}

Vec3.squaredDistanceXZ = function (a: IVec3Like, b: IVec3Like): number {
    let x = a.x - b.x;
    let z = a.z - b.z;
    return x * x + z * z;
}

Vec3.distanceXZ = function (a: IVec3Like, b: IVec3Like): number {
    return Math.sqrt(Vec3.squaredDistanceXZ(a, b));
}

Vec3.prototype.transformQuat = function (this: Vec3, q: IQuatLike): Vec3 {
    return Vec3.transformQuat(this, this, q);
}

Vec3.prototype.smoothDamp = function (this: Vec3, target: IVec3, currentVelocity: Vec3, smoothTime: number, maxSpeed: number = Infinity, deltaTime: number = game.deltaTime): Vec3 {
    let current: IVec3 = this;
    let output_x = 0;
    let output_y = 0;
    let output_z = 0;

    // Based on Game Programming Gems 4 Chapter 1.10
    smoothTime = Math.max(0.0001, smoothTime);
    let omega = 2 / smoothTime;

    let x = omega * deltaTime;
    let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let change_x = current.x - target.x;
    let change_y = current.y - target.y;
    let change_z = current.z - target.z;
    let originalTo = target;

    // Clamp maximum speed
    let maxChange = maxSpeed * smoothTime;

    let maxChangeSq = maxChange * maxChange;
    let sqrmag = change_x * change_x + change_y * change_y + change_z * change_z;
    if (sqrmag > maxChangeSq) {
        let mag = Math.sqrt(sqrmag);
        change_x = change_x / mag * maxChange;
        change_y = change_y / mag * maxChange;
        change_z = change_z / mag * maxChange;
    }

    let tx = current.x - change_x;
    let ty = current.y - change_y;
    let tz = current.z - change_z;

    let temp_x = (currentVelocity.x + omega * change_x) * deltaTime;
    let temp_y = (currentVelocity.y + omega * change_y) * deltaTime;
    let temp_z = (currentVelocity.z + omega * change_z) * deltaTime;

    currentVelocity.x = (currentVelocity.x - omega * temp_x) * exp;
    currentVelocity.y = (currentVelocity.y - omega * temp_y) * exp;
    currentVelocity.z = (currentVelocity.z - omega * temp_z) * exp;

    output_x = tx + (change_x + temp_x) * exp;
    output_y = ty + (change_y + temp_y) * exp;
    output_z = tz + (change_z + temp_z) * exp;

    // Prevent overshooting
    let origMinusCurrent_x = originalTo.x - current.x;
    let origMinusCurrent_y = originalTo.y - current.y;
    let origMinusCurrent_z = originalTo.z - current.z;
    let outMinusOrig_x = output_x - originalTo.x;
    let outMinusOrig_y = output_y - originalTo.y;
    let outMinusOrig_z = output_z - originalTo.z;

    if (origMinusCurrent_x * outMinusOrig_x + origMinusCurrent_y * outMinusOrig_y + origMinusCurrent_z * outMinusOrig_z > 0) {
        output_x = originalTo.x;
        output_y = originalTo.y;
        output_z = originalTo.z;

        currentVelocity.x = (output_x - originalTo.x) / deltaTime;
        currentVelocity.y = (output_y - originalTo.y) / deltaTime;
        currentVelocity.z = (output_z - originalTo.z) / deltaTime;
    }

    return this.set(output_x, output_y, output_z);
}

Vec3.prototype.setLength = function (this: Vec3, length: number): Vec3 {
    return Vec3.multiplyScalar(this, this, length / this.length());
}

Vec3.prototype.addAndScale = function (this: Vec3, v: IVec3, s: number): Vec3 {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    return this;
}

Vec3.prototype.lengthXZSqr = function (this: Vec3): number {
    return this.x * this.x + this.z * this.z;
}

Vec3.prototype.lengthXZ = function (this: Vec3): number {
    return Math.sqrt(this.lengthXZSqr());
}

Vec3.prototype.isNaN = function (this: Vec3): boolean {
    return Number.isNaN(this.x) || Number.isNaN(this.y) || Number.isNaN(this.z);
}

Vec4.prototype.project = function <Out extends IVec4Like>(out: Out, a: IVec4Like, b: IVec4Like): Out {
    let d1 = Vec4.dot(a, b);
    let d2 = Vec4.dot(b, b);
    Vec4.multiplyScalar(out, b, d1 / d2);
    return out;
}

Quat.prototype.angle = function (this: Quat, target: Quat): number {
    let dot = Math.min(Math.abs(Quat.dot(this, target)), 1.0);
    let isEqualUsingDot = dot > 1.0 - Math.EPSILON;
    return isEqualUsingDot ? 0 : Math.acos(dot) * 2;
}

Quat.prototype.smoothDamp = function (this: Quat, target: Quat, velocity: { current: number }, smoothTime: number, maxSpeed: number, deltaTime: number): Quat {
    let delta = this.angle(target);
    if (delta <= 0) return target;
    let t = Math.smoothDampRadian(delta, 0.0, velocity, smoothTime, maxSpeed, deltaTime);
    t = 1.0 - t / delta;
    return Quat.slerp(this, this, target, t);
}

Quat.angle = function (source: Quat, target: Quat): number {
    return source.angle(target);
}

// 有些平台没有console.time和console.timeEnd这两个函数，会导致引擎异常无法正常启动，在这里模拟一下。
if (console.time == null) console.time = function (message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
}
if (console.timeEnd == null) console.timeEnd = function (message?: string, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
}