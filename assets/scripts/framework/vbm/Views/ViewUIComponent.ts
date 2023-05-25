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

    public initViewUI(viewUI: IViewController): IViewController {
        viewUI.onCreated = this.onCreated.bind(this);
        viewUI.onSetParams = this.onSetParams.bind(this);
        viewUI.onShowView = this.onShowView.bind(this);
        viewUI.onHideView = this.onHideView.bind(this);
        viewUI.getViewType = this.getViewType.bind(this);

        this.setViewConfig = viewUI.setViewConfig.bind(viewUI);
        this.__internalShow = viewUI.__internalShow.bind(viewUI);
        this.__internalHide = viewUI.__internalHide.bind(viewUI);
        this.destroyAsset = viewUI.destroyAsset.bind(viewUI);
        // this.CreateAsset = viewUI.CreateAsset.bind(viewUI);
        this.showView = viewUI.showView.bind(viewUI);
        this.hideView = viewUI.hideView.bind(viewUI);
        super.initViewUI(viewUI);
        return this;
    }

    public get viewConfig() { return this.viewUI.viewConfig; }
    public get viewNode() { return this.viewUI.viewNode; }
    public get isShowing() { return this.viewUI.isShowing; }
    public getViewType() { return this.constructor; }
    public setViewConfig(viewConfig: ViewConfig): void { }
    public async __internalShow(): Promise<void> { }
    public async __internalHide(): Promise<void> { }
    public destroyAsset(): void { }
    public async createAsset(): Promise<void> { }
    public async showView<T extends IViewController>(...params: Parameters<T[OnSetParamsName]>): Promise<ReturnType<T[OnSetParamsName]>> { return null; }
    public async hideView(): Promise<void> { }
    public onCreated(): Promise<void> | void { }
    public onSetParams(...params: any[]): any { }
    public onShowView(): void { }
    public onHideView(): void { }
    public onDestroyed(): void { }
}