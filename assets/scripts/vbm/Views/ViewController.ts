import { Node } from "cc";
import ActionEvent from "common/utility/ActionEvent";
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

    public GetViewType(): Function | string {
        return this.constructor;
    }

    public SetViewConfig(viewConfig: ViewConfig): void {
        if (viewConfig == null) throw new Error(`Set view config failed! ${this.constructor.name} has not register.`);
        this._viewConfig = viewConfig;
    }

    public DestroyAsset(): void {
        if (this.viewNode != null) {
            this.viewNode.destroy();
            this._viewNode = null;
        }
    }

    public async CreateAsset(): Promise<void> {
        if (this.viewNode != null) return;
        const loadedAsset = "loadedAsset";
        if (this[loadedAsset] != null) return this[loadedAsset];
        this[loadedAsset] = this.CreateViewAsset();
        await this[loadedAsset];
        this[loadedAsset] = undefined;
    }

    /** 创建View的UI资源回调 */
    protected async CreateViewAsset(): Promise<void> {
        await this.OnCreateViewNodeAsset();
        this.uiAnimation = this.viewNode.getComponent(ViewUIAnimation);
        this._component = this.viewNode.getComponent(ViewComponent);
        if (this.component != null) {
            let viewUI = this.component.InitViewUI(this);
            if (viewUI != this)
                ViewUIManager.SetView(this.component.constructor, viewUI);
        }
        return this.OnCreated();
    }

    protected async OnCreateViewNodeAsset(): Promise<void> {
        this._viewNode = await ViewUIManager.CreateAsset(this.viewConfig);
    }

    public async ShowView<T extends IViewController>(...params: Parameters<T[OnSetParamsName]>): Promise<ReturnType<T[OnSetParamsName]>> {
        if (this._isShowing) return;
        this._isShowing = true;
        if (this.viewNode == null) {
            await this.CreateAsset();
            if (!this._isShowing) {
                this.viewNode.active = false;
                return;
            }
        }

        ViewUIManager.ExecuteShowRule(this)
        let result = this.OnSetParams(...params);
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
        await ViewUIManager.InternalShowView(this);
        return result;
    }

    public async HideView(): Promise<void> {
        if (!this._isShowing) return;
        return ViewUIManager.InternalHideView(this);
    }

    public async InternalShow(): Promise<void> {
        this._isShowing = true;
        this.ActiveNode(true);

        if (this.uiAnimation != null && this.uiAnimation.hasShowAnimation)
            await this.uiAnimation.ShowAnimation();

        this.OnShowView();

        ViewUIManager.onShowViewEvent.dispatchAction(this, true);
        this.onShowViewEvent.dispatchAction(true, this);
        this.onShowViewOnceEvent.dispatchAction(this);
        this.onShowViewOnceEvent.clearEvents();
    }

    public async InternalHide(): Promise<void> {
        this._isShowing = false;
        this.OnHideView();

        ViewUIManager.onShowViewEvent.dispatchAction(this, false);
        this.onShowViewEvent.dispatchAction(false, this);
        this.onHideViewOnceEvent.dispatchAction(this);
        this.onHideViewOnceEvent.clearEvents();

        if (this.viewNode != null && !this.isShowing) {
            if (this.uiAnimation != null && this.uiAnimation.hasHideAnimation)
                await this.uiAnimation.HideAnimation();
            if (this._isShowing) return;
            this.ActiveNode(false);
        }
    }

    protected ActiveNode(active: boolean) {
        this.viewNode.active = active;
    }

    public OnCreated(): Promise<void> | void { }
    public OnSetParams(...params: any[]): any { }
    public OnShowView(): void { }
    public OnHideView(): void { }
    public OnDestroyed(): void { }
}