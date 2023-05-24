import ViewComponent from "./UIComponent";
import ViewController from "./ViewController";

export default class ViewTController<T extends ViewComponent> extends ViewController {
    public get component(): T { return this._component as T; }
}