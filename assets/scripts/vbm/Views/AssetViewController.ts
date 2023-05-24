import { Action } from "common/utility/ActionEvent";
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

    protected async OnCreateViewNodeAsset(): Promise<void> {
        this._viewNode = await ViewUIManager.CreateNodeAsset(this.assetName, null);
        let assetUI = this.viewNode.getComponent(AssetUIComponent);
        ViewUIManager.RegisterType(this.assetName, this.assetName, assetUI.layer, assetUI.showRule, assetUI.hideRule);
        super.SetViewConfig(ViewUIManager.GetViewConfig(this.assetName));
        this.viewNode.setParent(ViewUIManager.GetLayerNode(assetUI.layer));
    }

    public OnSetParams(onCompleted?: Action): void {
        this.onCompleted = onCompleted;
    }

    public OnHideView(): void {
        if (this.onCompleted) this.onCompleted();
    }

    public GetViewType(): Function | string {
        return this.assetName;
    }

    public SetViewConfig(viewConfig: ViewConfig): void {
        // Do nothing.
    }
}