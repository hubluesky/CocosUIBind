import ViewController from "./ViewController";
import ViewUIManager from "./ViewUIManager";
import { ViewShowRule, ViewHideRule, ViewLayer } from "./ViewConfig";
import ViewUIComponent from "./ViewUIComponent";

/**
 * 注册View类型类型
 * @param assetName 资源名，不带Path，Path在ViewUIManager初化时传入。
 * @param layer 显示层
 * @param showRule 显示规则
 * @param hideRule 隐藏规则
 */
export function registerView(assetName: string, layer: number = ViewLayer.NormalLayer, showRule: ViewShowRule = ViewShowRule.None, hideRule: ViewHideRule = ViewHideRule.None): Function {
    return function (target: Function) {
        if (!ViewController.isPrototypeOf(target) && !ViewUIComponent.isPrototypeOf(target))
            throw new Error(`Register view can only be used on a ViewUI or ViewUIComponent class.`);
        ViewUIManager.registerType(target, assetName, layer, showRule, hideRule);
    }
}