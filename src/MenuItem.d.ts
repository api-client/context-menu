import { SVGTemplateResult } from 'lit';
import { CommandBase, ContextMenuCommand, Point, VisibleOptions, EnabledOptions, ExecuteOptions, CheckedOptions } from './types';

/**
 * An object representing a single menu item in the menu.
 */
export class MenuItem {
  type: string;
  id: string;
  target?: string | string[] | 'all' | 'root';
  visible?: boolean | ((args: VisibleOptions) => boolean);
  label?: string;
  title?: string;
  icon?: SVGTemplateResult;
  children?: (ContextMenuCommand | CommandBase)[];
  enabled?: boolean | ((args: EnabledOptions) => boolean);
  checked?: boolean | ((args: CheckedOptions) => boolean);
  execute?: ((args: ExecuteOptions) => void);

  constructor(init: CommandBase);

  /**
   * @returns Whether this command has a sub-command.
   */
  get hasChildren(): boolean;

  /**
   * Executes the `enabled()` function, when specified in the command options.
   * 
   * @returns `true` when the command should be active in the UI.
   */
  isEnabled(store: Map<string, any>, target: HTMLElement|SVGElement, workspace: HTMLElement, customData?: unknown): boolean;

  /**
   * Executes the `visible()` function, when specified in the command options.
   * 
   * @returns `true` when the command should be rendered in the UI.
   */
  isVisible(store: Map<string, any>, target: HTMLElement|SVGElement, workspace: HTMLElement, customData?: unknown): boolean;

  /**
   * Executes the `checked()` function, when specified in the command options.
   * 
   * @returns `true` when the command should be in the checked state
   */
  isChecked(store: Map<string, any>, target: HTMLElement|SVGElement, workspace: HTMLElement, customData?: unknown): boolean;

  /**
   * Executes the `beforeRender()` function, when specified in the command options.
   */
  beforeRenderCallback(store: Map<string, any>, target: HTMLElement|SVGElement, workspace: HTMLElement, customData?: unknown): void;

  /**
   * Executes the `execute()` function, when specified in the command options.
   */
  trigger(item: MenuItem, store: Map<string, any>, target: HTMLElement|SVGElement, workspace: HTMLElement, clickPoint: Point, customData?: unknown, selectedSubcommand?: number): void;
}
