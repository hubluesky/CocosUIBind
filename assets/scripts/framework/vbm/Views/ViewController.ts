import { Node } from "cc";
import ActionEvent from "framework/utility/ActionEvent";
import IViewController, { OnSetParamsName } from "./IViewController";
import ViewComponent from "./UIComponent";
import ViewConfig from "./ViewConfig";
import ViewUIAnimation from "./ViewUIAnimation";
import ViewUIManager from "./ViewUIManager";

/** ViewUI，这是一个包含UI资源对象的View对象，View可以在还没有加载UI资源的时候，就可以被立即创建。View与UI是分离。 */
export default class ViewController implements IViewController {
    public readonly onSetParamsEvent = new ActionEvent<[boolean, IViewController]>();
    public readonly onSetParamsOnceEvent = new ActionEvent<[boolean, IViewController]>();
    public readonly onShowViewEvent = new ActionEvent<[boolean, IViewController]>();
    public readonly onShowViewOnceEvent = new ActionEvent<[IViewController]>();
    public readonly onHideViewOnceEvent = new ActionEvent<[IViewController]>();

    protected _viewConfig: ViewConfig;
    public get viewConfig() { return this._viewConfig; }
    protected _viewNode: Node;
    public get viewNode() { return this._viewNode; }
    protected _isShowing: boolean = false;
    public get isShowing() { return this._isShowing && this.viewNode != null; }
    protected _component: ViewComponent;
    public get component(): ViewComponent { return this._component; }
    private uiAnimation: ViewUIAnimation;

    public getViewType(): Function | string {
        return this.constructor;
    }

    public setViewConfig(viewConfig: ViewConfig): void {
        if (viewConfig == null) throw new Error(`Set view config failed! ${this.constructor.name} has not register.`);
        this._viewConfig = viewConfig;
    }

    public destroyAsset(): void {
        if (this.viewNode != null) {
            this.viewNode.destroy();
            this._viewNode = null;
        }
    }

    public async createAsset(): Promise<void> {
        if (this.viewNode != null) return;
        const loadedAsset = "loadedAsset";
        if (this[loadedAsset] != null) return this[loadedAsset];
        this[loadedAsset] = this.createViewAsset();
        await this[loadedAsset];
        this[loadedAsset] = undefined;
    }

    /** 创建View的UI资源回调 */
    protected async createViewAsset(): Promise<void> {
        await this.onCreateViewNodeAsset();
        this.uiAnimation = this.viewNode.getComponent(ViewUIAnimation);
        this._component = this.viewNode.getComponent(ViewComponent);
        if (this.component != null) {
            let viewUI = this.component.initViewUI(this);
            if (viewUI != this)
                ViewUIManager.setView(this.component.constructor, viewUI);
        }
        return this.onCreated();
    }

    protected async onCreateViewNodeAsset(): Promise<void> {
        this._viewNode = await ViewUIManager.createAsset(this.viewConfig);
    }

    public async showView<T extends IViewController>(...params: Parameters<T[OnSetParamsName]>): Promise<ReturnType<T[OnSetParamsName]>> {
        if (this._isShowing) return;
        this._isShowing = true;
        if (this.viewNode == null) {
            await this.createAsset();
            if (!this._isShowing) {
                this.viewNode.active = false;
                return;
            }
        }

        ViewUIManager.executeShowRule(this)
        let result = this.onSetParams(...params);
        if (result instanceof Promise) {
            await result;
            if (!this._isShowing) {
                this.viewNode.active = false;
                return;
            }
        }
        this.onSetParamsEvent.dispatchAction(true, this);
        this.onSetParamsOnceEvent.dispatchAction(true, this);
        this.onSetParamsOnceEvent.clearEvents();
        await ViewUIManager.__internalShowView(this);
        return result;
    }

    public async hideView(): Promise<void> {
        if (!this._isShowing) return;
        return ViewUIManager.__internalHideView(this);
    }

    public async __internalShow(): Promise<void> {
        this._isShowing = true;
        this.activeNode(true);

        if (this.uiAnimation != null && this.uiAnimation.hasShowAnimation)
            await this.uiAnimation.showAnimation();

        this.onShowView();

        ViewUIManager.onShowViewEvent.dispatchAction(this, true);
        this.onShowViewEvent.dispatchAction(true, this);
        this.onShowViewOnceEvent.dispatchAction(this);
        this.onShowViewOnceEvent.clearEvents();
    }

    public async __internalHide(): Promise<void> {
        this._isShowing = false;
        this.onHideView();

        ViewUIManager.onShowViewEvent.dispatchAction(this, false);
        this.onShowViewEvent.dispatchAction(false, this);
        this.onHideViewOnceEvent.dispatchAction(this);
        this.onHideViewOnceEvent.clearEvents();

        if (this.viewNode != null && !this.isShowing) {
            if (this.uiAnimation != null && this.uiAnimation.hasHideAnimation)
                await this.uiAnimation.hideAnimation();
            if (this._isShowing) return;
            this.activeNode(false);
        }
    }

    protected activeNode(active: boolean) {
        this.viewNode.active = active;
    }

    public onCreated(): Promise<void> | void { }
    public onSetParams(...params: any[]): any { }
    public onShowView(): void { }
    public onHideView(): void { }
    public onDestroyed(): void { }
}