import BindUIComponent from "../BindEvent/BindUIComponent";
import IViewController from "./IViewController";

export default class ViewComponent extends BindUIComponent {
    protected _viewUI: IViewController;
    public get viewUI(): IViewController { return this._viewUI; }

    public initViewUI(viewUI: IViewController): IViewController {
        this._viewUI = viewUI;
        return viewUI;
    }

    public hideView(): void {
        this.viewUI.hideView();
    }
}