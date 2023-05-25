import BindUIComponent from "./BindUIComponent";

export default class BindArrayItemComponent extends BindUIComponent {
    /**
     * 增加绑定数值的Item对象
     * @param item 数值的条目对象
     */
    public setArrayItem(item: any, index: number): void {
        this.addBindObject(item);
    }

    public removeFromArray(): void {
    }
}