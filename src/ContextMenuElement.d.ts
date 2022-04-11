import { LitElement, TemplateResult, CSSResult, SVGTemplateResult } from 'lit';
import { AnypointIconItemElement, OverlayMixin } from '@anypoint-web-components/awc';
import { MenuItem } from './MenuItem';

export declare const menuItemTemplate: unique symbol;
export declare const separatorTemplate: unique symbol;
export declare const menuEntryTemplate: unique symbol;
export declare const menuEntryIconTemplate: unique symbol;
export declare const childrenIconTemplate: unique symbol;
export declare const selectedHandler: unique symbol;
export declare const mouseoverHandler: unique symbol;
export declare const findEventListItemTarget: unique symbol;
export declare const buildNested: unique symbol;
export declare const createNested: unique symbol;
export declare const nestedIdValue: unique symbol;
export declare const nestedTimeout: unique symbol;
export declare const removeNested: unique symbol;
export declare const clearNested: unique symbol;
export declare const removingTimeout: unique symbol;
export declare const keydownHandler: unique symbol;
export declare const moveRight: unique symbol;
export declare const moveLeft: unique symbol;
export declare const subClosedHandler: unique symbol;
export declare const subTriggerHandler: unique symbol;
export declare const labelTemplate: unique symbol;

/**
 * @fires trigger
 */
export class ContextMenuElement extends OverlayMixin(LitElement) {
  static get styles(): CSSResult;

  /** 
   * The list of commands to render.
   */
  commands: MenuItem[];
  /** 
  * The commands store.
  */
  store: Map<string, any>;
  /** 
  * The menu triggering click target
  */
  target: HTMLElement|SVGElement;
  /** 
  * The current workspace
  */
  workspace: HTMLElement;
  /** 
  * Any arbitrary data to pass to the lifecycle functions.
  */
  customData: unknown;
  /** 
   * The timeout after which the sub menu become visible or is removed from the menu.
   * @attribute
   */
  subMenuTimeout: number;
  /** 
  * The id of the parent command, in case when this menu is a sub-menu.
  * @attribute
  */
  parentCommand: string;
  [nestedIdValue]: string;

  constructor();

  /**
   * A handler for the list selection event.
   */
  [selectedHandler](e: Event): void;

  /**
   * Triggest nested menu when hovering an item that has a nested menu.
   */
  [mouseoverHandler](e: MouseEvent): void;

  [findEventListItemTarget](e: Event): AnypointIconItemElement;

  /**
   * Builds a nested menu for a command.
   * @param id The id of the command
   */
  [buildNested](id: string): void;

  /**
   * Adds the nested menu to the local DOM.
   */
  [createNested](): void;

  /**
   * Triggers the remove nested menu action.
   */
  [removeNested](): void;

  /**
   * Removes the nested menu from the DOM.
   */
  [clearNested](): void;

  [keydownHandler](e: KeyboardEvent): void;

  /**
   * Opens the menu when the current focused item has a sub menu.
   */
  [moveRight](): void;

  /**
   * Closes the menu when this is a sub menu.
   */
  [moveLeft](): void;

  /**
   * A handler for the close event dispatched by the sub menu.
   * @param {Event} e
   */
  [subClosedHandler](e: Event): void;

  /**
   * A handler for the sub-menu `trigger` event.
   * Retargets the event to the parent.
   * It adds `parent` to the detail, when the parent (currently selected command) has
   * the execute function.
   */
  [subTriggerHandler](e: Event): void;

  /**
   * Focuses on the list element
   */
  focus(): void;

  render(): TemplateResult;

  [menuItemTemplate](item: MenuItem): TemplateResult|string;

  [separatorTemplate](item: MenuItem): TemplateResult;
  
  [labelTemplate](item: MenuItem): TemplateResult;

  [menuEntryTemplate](item: MenuItem): TemplateResult;

  [menuEntryIconTemplate](icon?: SVGTemplateResult): TemplateResult;

  [childrenIconTemplate](): TemplateResult;
}
