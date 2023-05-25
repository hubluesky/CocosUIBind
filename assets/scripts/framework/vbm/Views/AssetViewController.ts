import { Action } from "framework/utility/ActionEvent";
import AssetUIComponent from "./AssetUIComponent";
import ViewConfig from "./ViewConfig";
import ViewController from "./ViewController";
import ViewUIManager from "./ViewUIManager";

export default class AssetViewController extends ViewController {
    public readonly assetName: string;
    private onCompleted: Action;

    public constructor(assetName: string) {
        super();
        this.assetName = assetName;
    }

    protected async onCreateViewNodeAsset(): Promise<void> {
        this._viewNode = await ViewUIManager.createNodeAsset(this.assetName, null);
        let assetUI = this.viewNode.getComponent(AssetUIComponent);
        ViewUIManager.registerType(this.assetName, this.assetName, assetUI.layer, assetUI.showRule, assetUI.hideRule);
        super.setViewConfig(ViewUIManager.getViewConfig(this.assetName));
        this.viewNode.setParent(ViewUIManager.getLayerNode(assetUI.layer));
    }

    public onSetParams(onCompleted?: Action): void {
        this.onCompleted = onCompleted;
    }

    public onHideView(): void {
        if (this.onCompleted) this.onCompleted();
    }

    public getViewType(): Function | string {
        return this.assetName;
    }

    public setViewConfig(viewConfig: ViewConfig): void {
        // Do nothing.
    }
}