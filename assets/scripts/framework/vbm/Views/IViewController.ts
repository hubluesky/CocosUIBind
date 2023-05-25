import { Node } from "cc";
import ActionEvent from "framework/utility/ActionEvent";
import ViewConfig from "./ViewConfig";

export type OnSetParamsName = "onSetParams";
export default interface IViewController {
  readonly onSetParamsEvent: ActionEvent<[boolean, IViewController]>;
  readonly onSetParamsOnceEvent: ActionEvent<[boolean, IViewController]>;
  readonly onShowViewEvent: ActionEvent<[boolean, IViewController]>;
  readonly onShowViewOnceEvent: ActionEvent<[IViewController]>;
  readonly onHideViewOnceEvent: ActionEvent<[IViewController]>;

  /** View配置信息，通过@RegisterView 来注册信息 */
  readonly viewConfig: ViewConfig;
  /** View对应的UI资源 */
  readonly viewNode: Node;
  /** 当前View资源是否显示中 */
  readonly isShowing: boolean;
  /** 获得View注册的类型 */
  getViewType(): Function | string;
  /** View设置配置函数 */
  setViewConfig(viewConfig: ViewConfig): void;
  /** 销毁View的UI资源 */
  destroyAsset(): void;
  /** 创建View的UI资源回调 */
  createAsset(): Promise<void>;
  /** 显示View，参数会被调用传递给OnSetParams函数 */
  showView<T extends IViewController>(...params: Parameters<T[OnSetParamsName]>): Promise<ReturnType<T[OnSetParamsName]>>;
  /** 隐藏View */
  hideView(): Promise<void>;
  /** 内部调用显示，外部请勿使用。 */
  __internalShow(): Promise<void>;
  /** 内部调用隐藏，外部请勿使用。 */
  __internalHide(): Promise<void>;
  /** View的UI资源创建回调，只会回调一次。支持async */
  onCreated(): Promise<void> | void;
  /** View在被外部调用Show的时候回调，传入的参数在在此回调。支持async */
  onSetParams(...params: any[]): any;
  /** View在显示的时候会回调，包含外部调用显示和被UI管理器从后台调用显示都会回调 */
  onShowView(): void;
  /** View在隐藏的时候，回调，包含外部调用隐藏和被UI管理器从后台调用隐藏都会回调 */
  onHideView(): void;
  /** View对象销毁回调 */
  onDestroyed(): void;
}