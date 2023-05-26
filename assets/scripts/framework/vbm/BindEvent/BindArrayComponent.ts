import { Component, _decorator } from "cc";
import BindArrayHandler from "./BindArrayHandler";
import BindArrayItemComponent from "./BindArrayItemComponent";
import BindArrayEvent from "./BindArrayEvent";
import { BindArrayEventType } from "./BindBaseEvent";

const { ccclass, menu, property } = _decorator;
@ccclass
@menu("Framework/Bind/BindArrayComponent")
export default class BindArrayComponent extends Component implements BindArrayHandler {
    @property
    private indexOffset: number = 0;

    public readonly bindArrayEvent = new BindArrayEvent<any>();
    private bindArrayObject: any[] = null;

    onLoad(): void {
        this.bindArrayEvent.addArrayChanged((dataList, type, index: string | number, value, oldValue) => {
            switch (type) {
                case BindArrayEventType.Add:
                case BindArrayEventType.Update:
                    let i = typeof index === `string` ? parseInt(index) : index;
                    this.updateDataItem(i, value);
                    break;
                case BindArrayEventType.Resize:
                    this.resizeDataList();
                    break;
            }
        });
    }

    onEnable(): void {
        if (this.bindArrayObject != null) {
            this.bindArrayEvent.bindObject(this.bindArrayObject);
            this.node.enabledAllChild(false, this.indexOffset);
            this.updateDataList();
        }
    }

    onDisable(): void {
        if (this.bindArrayObject != null)
            this.bindArrayEvent.unbindObject(this.bindArrayObject);
    }

    public bindArray<T extends any>(array: T[]): T[] {
        this.node.enabledAllChild(false, this.indexOffset);
        this.unbindArray();
        if (array == null) return;
        const proxy = this.bindArrayEvent.bindObject(array);
        this.bindArrayObject = array;
        if (this.enabledInHierarchy)
            this.updateDataList();
        return proxy;
    }

    public unbindArray(): void {
        if (this.bindArrayObject != null) {
            this.bindArrayEvent.unbindObject(this.bindArrayObject);
            this.bindArrayObject = null;
        }
    }

    public onPropertyChanged(array: any[]): void {
        this.bindArray(array);
    }

    private resizeDataList(): void {
        if (this.bindArrayObject.length >= this.node.children.length) return;
        let count = this.node.children.length + this.indexOffset - this.bindArrayObject.length;
        for (let i = 0; i < count; i++) {
            let itemUINode = this.node.children[this.node.children.length - 1 - i];
            itemUINode.active = false;
        }
    }

    private updateDataList(): void {
        for (let i = 0; i < this.bindArrayObject.length; i++) {
            this.updateDataItem(i, this.bindArrayObject[i]);
        }
    }

    private updateDataItem(index: number, dataItem: any): void {
        let itemUINode = this.node.getOrCreateChild(index + this.indexOffset, this.indexOffset);
        let bindArrayItem = itemUINode.getComponent(BindArrayItemComponent);
        if (bindArrayItem != null) {
            bindArrayItem.setArrayItem(dataItem, index);
            bindArrayItem.removeFromArray = () => this.bindArrayObject.removeAt(index);
        }
        bindArrayItem.node.active = true;
    }
}