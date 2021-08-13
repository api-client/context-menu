import { ContextMenuElement } from './ContextMenuElement.js';
import { MenuItem } from './MenuItem.js';
import { ContextMenuCommand, TriggerInfo, CustomMenuEventDetail, CommandBase, Point, MenuOptions } from './types';

export declare const contextHandler: unique symbol;
export declare const clickHandler: unique symbol;
export declare const keydownHandler: unique symbol;
export declare const menuTriggerHandler: unique symbol;
export declare const customMenuHandler: unique symbol;
export declare const normalizeMenuItem: unique symbol;
export declare const prepareCommands: unique symbol;
export declare const connectedValue: unique symbol;

/**
 * The base class for the context menu. It can be used as is but in some specific cases
 * you may want to extend this class to be able to find command target accurately.
 */
export class ContextMenu extends EventTarget {
  /**
   * @returns} true when the menu is connected to the `workspace`.
   */
  get connected(): boolean;
  [connectedValue]: boolean;
  
  workspace: HTMLElement;
  /** 
   * The store initialized with this context menu. Passed to the lifecycle functions.
   */
  store: Map<string, any>;
  /** 
  * The root level menu commands
  */
  commands: MenuItem[];
  /** 
  * An information about the trigger that initialized this menu.
  */
  triggerInfo: TriggerInfo;
  /**
   * Currently rendered context menu.
   */
  currentMenu?: ContextMenuElement;
  /** 
   * The Menu configuration options.
   */
  options: MenuOptions;

  /**
   * @param workspace The root element that is the click handler
   * @param opts The Menu configuration options.
   */
  constructor(workspace: HTMLElement, opts?: MenuOptions);

  /**
   * Starts listening on user events
   */
  connect(): void;

  /**
   * Cleans up the listeners
   */
  disconnect(): void;

  /**
   * Reads {x,y} point of the click from the pointer event.
   * 
   * Override this method to customize position reading.
   */
  readTargetClickPosition(e: MouseEvent): Point;

  /**
   * Finds the click target from the event
   * Override this method to customize finding event click target.
   */
  findTarget(e: MouseEvent): HTMLElement | SVGElement | undefined;

  /**
   * Maps an element to the target name used by the commands.
   * By default it returns `root` when the click target element is the `workspace` or
   * a combination of element name and list of all classes otherwise.
   * 
   * Override this method to customize target name reading.
   *
   * @param element The context click target
   * @returns} The target name.
   */
  elementToTarget(element: HTMLElement | SVGElement): string | undefined;

  /**
   * Handler for the context menu event.
   */
  [contextHandler](e: MouseEvent): void;

  /**
   * A handler for the `custommenu` event handler to trigger the menu without the user interaction.
   */
  [customMenuHandler](e: CustomEvent<CustomMenuEventDetail>): void;

  /**
   * Handles the click event on the document to close the menu is the click
   * is outside the menu.
   */
  [clickHandler](e: MouseEvent): void;

  /**
   * Closes the menu when ESC is pressed
   */
  [keydownHandler](e: KeyboardEvent): void;

  /**
   * Register a list of commands to be rendered in the menu when triggered.
   * This overrides previously registered commands.
   */
  registerCommands(commands: CommandBase[]): void;

  /**
   * Adds a single command to the menu.
   */
  addCommand(command: CommandBase): void;

  /**
   * Prepares incoming commands for the internal use.
   * @param commands The commands to process.
   */
  [prepareCommands](commands: CommandBase[]): MenuItem[];

  [normalizeMenuItem](item: ContextMenuCommand): ContextMenuCommand;

  /**
   * Builds the menu for the target.
   *
   * @param target The element that triggered the menu
   * @param name The `target` name declared in the commands.
   * @param placementPoint The workspace position of where to place the menu.
   * @param targetPoint The workspace position of the click target
   * @param customData Any data to set on the instance to pass to the `execute` and `enabled` functions.
   */
  build(target: HTMLElement | SVGElement, name: string, placementPoint: Point, targetPoint: Point, customData?: unknown): void;

  /**
   * @param placementPoint The workspace position of where to place the menu.
   * @param commands The commands render
   */
  render(placementPoint: Point, commands: MenuItem[]): void;

  /**
   * Lists all commands that matches the target.
   *
   * @param targetName The build target
   * @param targetElement The element that triggered the menu
   */
  listCommands(targetName: string, targetElement: HTMLElement|SVGElement): MenuItem[];

  /**
   * Removes the currently rendered menu.
   */
  destroy(): void;

  /**
   * Handler for the `trigger` event dispatched by the menu
   */
  [menuTriggerHandler](e: CustomEvent): void;
}
