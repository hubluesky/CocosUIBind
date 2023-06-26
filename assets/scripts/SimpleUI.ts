import { _decorator } from "cc";
import { registerView } from "framework/vbm/views/RegisterView";
import { ViewHideRule, ViewLayer, ViewShowRule } from "framework/vbm/views/ViewConfig";
import ViewUIComponent from "framework/vbm/views/ViewUIComponent";

const { ccclass, property } = _decorator;

@ccclass('SimpleUI')
@registerView("SimpleUI", ViewLayer.NormalLayer, ViewShowRule.None, ViewHideRule.None)
export class SimpleUI extends ViewUIComponent {
    onCreated(): void {
        console.log("当前组件被创建的时候回调");
    }

    onSetParams(result: boolean): void {
        console.log("当外部调用showView的时候回调");
    }

    onShowView(): void {
        console.log("当UI被显示的回调，有可能是显示/隐藏规则显示出来的UI");
    }

    onHideView(): void {
        console.log("当UI被隐藏时回调");
    }
}