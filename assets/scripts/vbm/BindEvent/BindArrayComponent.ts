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
        this.bindEvent.AddArrayChanged((dataList, type, index: string | number, value, oldValue) => {
            switch (type) {
                case BindArrayEventType.Add:
                case BindArrayEventType.Update:
                    let i = typeof index === `string` ? parseInt(index) : index;
                    this.UpdateDataItem(i, value);
                    break;
                case BindArrayEventType.Resize:
                    this.ResizeDataList();
                    break;
            }
        });
    }

    onEnable(): void {
        if (this.bindArray != null) {
            this.bindEvent.BindObject(this.bindArray);
            this.node.enabledAllChild(false, this.indexOffset);
            this.UpdateDataList();
        }
    }

    onDisable(): void {
        if (this.bindArray != null)
            this.bindEvent.UnbindObject(this.bindArray);
    }

    private UnBindTarget(): void {
        if (this.bindArray != null) {
            this.bindEvent.UnbindObject(this.bindArray);
            this.bindArray = null;
        }
    }

    public SetBindArray(array: any[]): void {
        this.OnPropertyChanged(array);
    }

    public OnPropertyChanged(array: any[]): void {
        this.node.enabledAllChild(false, this.indexOffset);
        this.UnBindTarget();
        if (array == null) return;
        this.bindEvent.BindObject(array);
        this.bindArray = array;
        if (this.enabledInHierarchy)
            this.UpdateDataList();
    }

    private ResizeDataList(): void {
        if (this.bindArray.length >= this.node.children.length) return;
        let count = this.node.children.length + this.indexOffset - this.bindArray.length;
        for (let i = 0; i < count; i++) {
            let itemUINode = this.node.children[this.node.children.length - 1 - i];
            itemUINode.active = false;
        }
    }

    private UpdateDataList(): void {
        for (let i = 0; i < this.bindArray.length; i++) {
            this.UpdateDataItem(i, this.bindArray[i]);
        }
    }

    private UpdateDataItem(index: number, dataItem: any): void {
        let itemUINode = this.node.getOrCreateChild(index + this.indexOffset, this.indexOffset);
        let bindArrayItem = itemUINode.getComponent(BindArrayItemComponent);
        if (bindArrayItem != null) {
            bindArrayItem.SetArrayItem(dataItem, index);
            bindArrayItem.RemoveFromArray = () => this.bindArray.removeAt(index);
        }
        bindArrayItem.node.active = true;
    }
}