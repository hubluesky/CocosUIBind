import { Component, _decorator } from "cc";
import BindArrayEvent, { BindArrayEventType } from "./BindArrayEvent";
import BindArrayHandler from "./BindArrayHandler";
import BindArrayItemComponent from "./BindArrayItemComponent";

const { ccclass, menu, property } = _decorator;
@ccclass
@menu("Framework/Bind/BindArrayComponent")
export default class BindArrayComponent extends Component implements BindArrayHandler {
    @property
    private indexOffset: number = 0;

    private bindEvent = new BindArrayEvent<any>();
    private bindArray: any[] = null;

    onLoad(): void {
        this.bindEvent.addArrayChanged((dataList, type, index: string | number, value, oldValue) => {
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
        if (this.bindArray != null) {
            this.bindEvent.bindObject(this.bindArray);
            this.node.enabledAllChild(false, this.indexOffset);
            this.updateDataList();
        }
    }

    onDisable(): void {
        if (this.bindArray != null)
            this.bindEvent.unbindObject(this.bindArray);
    }

    private unBindTarget(): void {
        if (this.bindArray != null) {
            this.bindEvent.unbindObject(this.bindArray);
            this.bindArray = null;
        }
    }

    public setBindArray(array: any[]): void {
        this.onPropertyChanged(array);
    }

    public onPropertyChanged(array: any[]): void {
        this.node.enabledAllChild(false, this.indexOffset);
        this.unBindTarget();
        if (array == null) return;
        this.bindEvent.bindObject(array);
        this.bindArray = array;
        if (this.enabledInHierarchy)
            this.updateDataList();
    }

    private resizeDataList(): void {
        if (this.bindArray.length >= this.node.children.length) return;
        let count = this.node.children.length + this.indexOffset - this.bindArray.length;
        for (let i = 0; i < count; i++) {
            let itemUINode = this.node.children[this.node.children.length - 1 - i];
            itemUINode.active = false;
        }
    }

    private updateDataList(): void {
        for (let i = 0; i < this.bindArray.length; i++) {
            this.updateDataItem(i, this.bindArray[i]);
        }
    }

    private updateDataItem(index: number, dataItem: any): void {
        let itemUINode = this.node.getOrCreateChild(index + this.indexOffset, this.indexOffset);
        let bindArrayItem = itemUINode.getComponent(BindArrayItemComponent);
        if (bindArrayItem != null) {
            bindArrayItem.setArrayItem(dataItem, index);
            bindArrayItem.removeFromArray = () => this.bindArray.removeAt(index);
        }
        bindArrayItem.node.active = true;
    }
}