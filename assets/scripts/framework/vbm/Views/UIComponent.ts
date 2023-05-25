import BindUIComponent from "../BindEvent/BindUIComponent";
import IViewController from "./IViewController";

export default class ViewComponent extends BindUIComponent {
    protected _viewUI: IViewController;
    public get viewUI(): IViewController { return this._viewUI; }

    public InitViewUI(viewUI: IViewController): IViewController {
        this._viewUI = viewUI;
        return viewUI;
    }

    public HideView(): void {
        this.viewUI.HideView();
    }
}