import ActionEvent from "framework/utility/ActionEvent";
import IViewController, { OnSetParamsName } from "./IViewController";
import ViewComponent from "./UIComponent";
import ViewConfig from "./ViewConfig";

export default class ViewUIComponent extends ViewComponent implements IViewController {
    public get onSetParamsEvent(): ActionEvent<[boolean, IViewController]> { return this.viewUI.onSetParamsEvent; }
    public get onSetParamsOnceEvent(): ActionEvent<[boolean, IViewController]> { return this.viewUI.onSetParamsOnceEvent; }
    public get onShowViewEvent(): ActionEvent<[boolean, IViewController]> { return this.viewUI.onShowViewEvent; }
    public get onShowViewOnceEvent(): ActionEvent<[IViewController]> { return this.viewUI.onShowViewOnceEvent; }
    public get onHideViewOnceEvent(): ActionEvent<[IViewController]> { return this.viewUI.onHideViewOnceEvent; }

    public InitViewUI(viewUI: IViewController): IViewController {
        viewUI.OnCreated = this.OnCreated.bind(this);
        viewUI.OnSetParams = this.OnSetParams.bind(this);
        viewUI.OnShowView = this.OnShowView.bind(this);
        viewUI.OnHideView = this.OnHideView.bind(this);
        viewUI.GetViewType = this.GetViewType.bind(this);

        this.SetViewConfig = viewUI.SetViewConfig.bind(viewUI);
        this.InternalShow = viewUI.InternalShow.bind(viewUI);
        this.InternalHide = viewUI.InternalHide.bind(viewUI);
        this.DestroyAsset = viewUI.DestroyAsset.bind(viewUI);
        // this.CreateAsset = viewUI.CreateAsset.bind(viewUI);
        this.ShowView = viewUI.ShowView.bind(viewUI);
        this.HideView = viewUI.HideView.bind(viewUI);
        super.InitViewUI(viewUI);
        return this;
    }

    public get viewConfig() { return this.viewUI.viewConfig; }
    public get viewNode() { return this.viewUI.viewNode; }
    public get isShowing() { return this.viewUI.isShowing; }
    public GetViewType() { return this.constructor; }
    public SetViewConfig(viewConfig: ViewConfig): void { }
    public async InternalShow(): Promise<void> { }
    public async InternalHide(): Promise<void> { }
    public DestroyAsset(): void { }
    public async CreateAsset(): Promise<void> { }
    public async ShowView<T extends IViewController>(...params: Parameters<T[OnSetParamsName]>): Promise<ReturnType<T[OnSetParamsName]>> { return null; }
    public async HideView(): Promise<void> { }
    public OnCreated(): Promise<void> | void { }
    public OnSetParams(...params: any[]): any { }
    public OnShowView(): void { }
    public OnHideView(): void { }
    public OnDestroyed(): void { }
}