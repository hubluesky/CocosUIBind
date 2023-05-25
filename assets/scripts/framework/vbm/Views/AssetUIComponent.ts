import { Component, Enum, _decorator } from "cc";
import { ViewHideRule, ViewLayer, ViewShowRule } from "./ViewConfig";
import ViewUIManager from "./ViewUIManager";

const { ccclass, property, menu } = _decorator;
@ccclass
@menu("Framework/UI/AssetUIComponent")
export default class AssetUIComponent extends Component {
    @property
    public readonly assetName: string = "";
    @property({ type: Enum(ViewLayer) })
    public readonly layer: ViewLayer = ViewLayer.NormalLayer;
    @property({ type: Enum(ViewShowRule) })
    public readonly showRule: ViewShowRule = ViewShowRule.None;
    @property({ type: Enum(ViewHideRule) })
    public readonly hideRule: ViewHideRule = ViewHideRule.None;

    HideView(): void {
        let assetName = String.isEmptyOrNull(this.assetName) ? this.node.name : this.assetName;
        ViewUIManager.hideView(assetName);
    }

    ShowAssetView(assetName: string): void {
        ViewUIManager.showView(assetName);
    }

    HideAssetView(assetName: string): void {
        ViewUIManager.hideView(assetName);
    }
}