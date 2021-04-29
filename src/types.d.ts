import { SVGTemplateResult } from "lit-html";
import { MenuItem } from "./MenuItem";

export declare interface Point {
  x: number;
  y: number;
}

declare interface LifecycleContext {
  /**
   * The id of the command.
   */
  id: string;
  /**
   * The object store to be used to store menu item data.
   */
  store: Map<string, any>;
  /**
   * An instance of the element that triggered the command.
   */
  target: HTMLElement | SVGElement;
  /**
   * The element with which this context menu was initialized with.
   */
  root: HTMLElement;
  /**
   * Any data passed to the command through a custom event.
   */
  customData?: unknown;
}

export declare interface EnabledOptions extends LifecycleContext {
}

/**
 * Options passed to the `visible()` callback function.
 */
export type VisibleOptions = EnabledOptions;

export declare interface ExecuteOptions extends LifecycleContext {
  /**
   * The point of the original click.
   */
  clickPoint: Point;
  /**
   * This is only passed to the execute function when a sub-menu has triggered a menu item
   * that has no `execute` function defined. This is the index of the command.
   * Note, the index includes separators.
   */
  selectedSubcommand?: number;
  /**
   * The menu item that triggered the selection.
   */
  item: MenuItem;
}

export declare interface BeforeRenderOptions extends LifecycleContext {
  /**
   * The menu item that triggered the selection. Changing this item will affects the rendering of it.
   */
  menu: MenuItem;
}

export declare interface CommandBase {
  /**
   * The identifier of the command. Can be used to declare ids manually. The command is passed 
   * to the lifecycle callbacks so you can use it to identify a command. 
   * When not set the Menu generates a random value.
   */
  id?: string;
  /**
   * The type of the command. By default the command is `normal`. `separator` draws a line between menu items.
   * The `label` renders a title over other list items.
   */
  type?: 'normal' | 'separator' | 'label';
  /**
   * The target object that activates this item.
   * The `ContextMenu` class uses `findTarget(mouseEvent)` to find the event target and `elementToTarget(targetElement)`
   * to find the target. By default the "elementTarget" is the event's target, and the target is the elementTarget's 
   * `localName` with list of class names (period separated). When the target is the same as the `workspace` then the target
   * is `root`.
   * Override this two methods to customize this behavior and support custom use cases.
   * 
   * By default the constructed target from an element is something like this: `div.item.target-item`.
   * 
   * This must be provided for the top level menu items only. This is ignored in sub-menus.
   */
  target?: string | string[] | 'all' | 'root';
  /**
   * Determines whether the menu item is visible in the rendered menu.
   * The item is always inserted into the DOM but when this value is false or the result of calling the function 
   * is false then the item is hidden. You can still access the menu item via DOM apis.
   */
  visible?: boolean | ((args: VisibleOptions) => boolean);
}

export declare interface ContextMenuCommand extends CommandBase {
  /**
   * The label to render.
   */
  label: string;
  /**
   * Optional title of the element. Do not use it for elements that represent a sub-menu.
   */
  title?: string;
  /**
   * The icon to render. It should be full definition of an SVG image wrapped into 
   * the svg`...` template, from the `lit-html` library.
   */
  icon?: SVGTemplateResult;
  /**
   * A children of this command. When set and not empty then it renders a nested sub-menu
   * for this entry. In this case the `execute()` lifecycle method won't be executed and a new menu is rendered
   * positioned relative to this entry.
   * 
   * Note, sub entries of the menu are not rendered until the user hover over the menu. When the user hover over 
   * another menu entry the child menu is destroyed.
   */
  children?: (ContextMenuCommand | CommandBase)[];
  /**
   * Whether the command is enabled or not.
   * When set to a boolean value, this value is used to determine whether the item should be rendered.
   * When set to a function, it must return a value indicating whether the command is enabled.
   */
  enabled?: boolean | ((args: EnabledOptions) => boolean);
  /**
   * The action to be executed when this command is activated.
   * This is ignored when the command has children. When the command has no children then
   * when this is set to a function, this function is called when a menu item is triggered.
   * You may not set this value and use the `activate` event to listen for command activation.
   */
  execute?: ((args: ExecuteOptions) => void);
  /**
   * A function that is executed before the item is rendered.
   * This way you can customize the rendered values like the icon, label, or title.
   */
  beforeRender?: ((ctx: BeforeRenderOptions) => void);
}

export declare interface TriggerInfo {
  /**
   * The element that triggered the context menu.
   */
  target: HTMLElement | SVGElement;
  /**
   * The location where the click relative position is.
   * This can be customized by overriding the `readTargetClickPosition()`.
   */
  point: Point;
  /**
   * A custom data to be passed to the lifecycle methods.
   */
  customData?: any;
}

export interface CustomMenuEventDetail {
  /**
   * The name of the command target. It is used to render commands group. It corresponds to ContextMenuCommand.target.
   */
  name: string;
  /**
   * The x coordinate of the click. Default to 0.
   */
  x?: number;
  /**
   * The y coordinate of the click. Default to 0.
   */
  y?: number;
  /**
   * The click target passed back to the command execute function. Default to the workspace.
   */
  actionTarget?: HTMLElement | SVGElement;
  /**
   * The original click event associated with the action. Optional.
   */
  clickEvent?: PointerEvent;
  /**
   * Any data to be passed to the enabled and execute function.
   */
  customData?: unknown;
}
