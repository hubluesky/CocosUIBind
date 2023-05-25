import { Node } from "cc";
import ActionEvent from "framework/utility/ActionEvent";
import ViewConfig from "./ViewConfig";

export type OnSetParamsName = "OnSetParams";
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
  GetViewType(): Function | string;
  /** View设置配置函数 */
  SetViewConfig(viewConfig: ViewConfig): void;
  /** 销毁View的UI资源 */
  DestroyAsset(): void;
  /** 创建View的UI资源回调 */
  CreateAsset(): Promise<void>;
  /** 显示View，参数会被调用传递给OnSetParams函数 */
  ShowView<T extends IViewController>(...params: Parameters<T[OnSetParamsName]>): Promise<ReturnType<T[OnSetParamsName]>>;
  /** 隐藏View */
  HideView(): Promise<void>;
  /** 内部调用显示，外部请勿使用。 */
  InternalShow(): Promise<void>;
  /** 内部调用隐藏，外部请勿使用。 */
  InternalHide(): Promise<void>;
  /** View的UI资源创建回调，只会回调一次。支持async */
  OnCreated(): Promise<void> | void;
  /** View在被外部调用Show的时候回调，传入的参数在在此回调。支持async */
  OnSetParams(...params: any[]): any;
  /** View在显示的时候会回调，包含外部调用显示和被UI管理器从后台调用显示都会回调 */
  OnShowView(): void;
  /** View在隐藏的时候，回调，包含外部调用隐藏和被UI管理器从后台调用隐藏都会回调 */
  OnHideView(): void;
  /** View对象销毁回调 */
  OnDestroyed(): void;
}