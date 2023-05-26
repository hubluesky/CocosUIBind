import { Component, _decorator } from "cc";
import BindArrayEvent from "./BindArrayEvent";
import BindArrayItemComponent from "./BindArrayItemComponent";
import { BindArrayEventType } from "./BindBaseEvent";

const { ccclass, menu, property } = _decorator;
@ccclass
@menu("Framework/Bind/BindArrayComponent")
export default class BindArrayComponent extends Component {
    @property
    private indexOffset: number = 0;

    public readonly bindArrayEvent = new BindArrayEvent<any>();

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
        this.bindArrayEvent.onBindEvent.addEvent(this.onBindEvent, this);
        if (this.bindArrayEvent.bindSource != null) {
            this.node.enabledAllChild(false, this.indexOffset);
            this.updateDataList();
        }
    }

    onDisable(): void {
        this.bindArrayEvent.onBindEvent.removeEvent(this.onBindEvent, this);
    }

    private onBindEvent(): void {
        this.node.enabledAllChild(false, this.indexOffset);
        // this.unbindArray();
        if (this.bindArrayEvent.bindSource == null) return;
        // const proxy = this.bindArrayEvent.bindObject(array);
        // this.bindArrayObject = array;
        if (this.node.activeInHierarchy && this.enabledInHierarchy)
            this.updateDataList();
        // return proxy;
    }

    // public unbindArray(): void {
    //     if (this.bindArrayObject != null) {
    //         this.bindArrayEvent.unbindObject(this.bindArrayObject);
    //         this.bindArrayObject = null;
    //     }
    // }

    // public onPropertyChanged(array: any[]): void {
    //     this.bindArray(array);
    // }

    private resizeDataList(): void {
        const bindSource = this.bindArrayEvent.bindSource;
        if (bindSource.length >= this.node.children.length) return;
        let count = this.node.children.length + this.indexOffset - bindSource.length;
        for (let i = 0; i < count; i++) {
            let itemUINode = this.node.children[this.node.children.length - 1 - i];
            itemUINode.active = false;
        }
    }

    private updateDataList(): void {
        const bindSource = this.bindArrayEvent.bindSource;
        for (let i = 0; i < bindSource.length; i++) {
            this.updateDataItem(i, bindSource[i]);
        }
    }

    private updateDataItem(index: number, dataItem: any): void {
        let itemUINode = this.node.getOrCreateChild(index + this.indexOffset, this.indexOffset);
        let bindArrayItem = itemUINode.getComponent(BindArrayItemComponent);
        if (bindArrayItem != null) {
            bindArrayItem.setArrayItem(dataItem, index);
            bindArrayItem.removeFromArray = () => this.bindArrayEvent.bindSource.removeAt(index);
        }
        bindArrayItem.node.active = true;
    }
}