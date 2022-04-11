/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { OverlayMixin } from '@anypoint-web-components/awc';
import '@anypoint-web-components/awc/dist/define/anypoint-listbox.js';
import '@anypoint-web-components/awc/dist/define/anypoint-icon-item.js';
import { MenuElementStyles } from './styles/MenuElementStyles.js';
import { arrowRight, check } from './Icons.js';

/** @typedef {import('lit').TemplateResult} TemplateResult */
/** @typedef {import('lit').SVGTemplateResult} SVGTemplateResult */
/** @typedef {import('@anypoint-web-components/awc').AnypointListboxElement} AnypointListbox */
/** @typedef {import('@anypoint-web-components/awc').AnypointIconItemElement} AnypointIconItem */
/** @typedef {import('./MenuItem').MenuItem} MenuItem */

export const menuItemTemplate = Symbol('menuItemTemplate');
export const separatorTemplate = Symbol('separatorTemplate');
export const menuEntryTemplate = Symbol('menuEntryTemplate');
export const menuEntryIconTemplate = Symbol('menuEntryIconTemplate');
export const childrenIconTemplate = Symbol('childrenIconTemplate');
export const selectedHandler = Symbol('selectedHandler');
export const mouseoverHandler = Symbol('mouseoverHandler');
export const findEventListItemTarget = Symbol('findEventListItemTarget');
export const buildNested = Symbol('buildNested');
export const createNested = Symbol('createNested');
export const nestedIdValue = Symbol('nestedIdValue');
export const nestedTimeout = Symbol('nestedTimeout');
export const removeNested = Symbol('removeNested');
export const clearNested = Symbol('clearNested');
export const removingTimeout = Symbol('removingTimeout');
export const keydownHandler = Symbol('keydownHandler');
export const moveRight = Symbol('moveRight');
export const moveLeft = Symbol('moveLeft');
export const subClosedHandler = Symbol('subClosedHandler');
export const subTriggerHandler = Symbol('subTriggerHandler');
export const labelTemplate = Symbol('labelTemplate');
export const radioEntryTemplate = Symbol('radioEntryTemplate');
export const menuEntryCheckMarkTemplate = Symbol('menuEntryCheckMarkTemplate');

export class ContextMenuElement extends OverlayMixin(LitElement) {
  static get styles() {
    return MenuElementStyles;
  }

  static get properties() {
    return {
      /** 
       * The list of commands to render.
       */
      commands: { type: Array },
      /** 
       * The commands store.
       */
      store: { type: Object },
      /** 
       * The menu triggering click target
       */
      target: { type: Object }, 
      /** 
       * The current workspace
       */
      workspace: { type: Object },
      /** 
       * Any arbitrary data to pass to the lifecycle functions.
       */
      customData: {},
      /** 
       * The timeout after which the sub menu become visible or is removed from the menu.
       */
      subMenuTimeout: { type: Number },
      /** 
       * The id of the parent command, in case when this menu is a sub-menu.
       */
      parentCommand: { type: String },
    };
  }

  constructor() {
    super();
    /** 
     * @type {MenuItem[]}
     */
    this.commands = undefined;
    /** 
     * @type {Map<string, any>}
     */
    this.store = undefined;
    /** 
     * @type {HTMLElement|SVGElement}
     */
    this.target = undefined;
    /** 
     * @type {HTMLElement}
     */
    this.workspace = undefined;
    /** 
     * @type {unknown}
     */
    this.customData = undefined;
    /** 
     * @type {string}
     */
    this[nestedIdValue] = undefined;
    /** 
     * @type {string}
     */
    this.parentCommand = undefined;

    this.subMenuTimeout = 300;

    this[subClosedHandler] = this[subClosedHandler].bind(this);
    this[subTriggerHandler] = this[subTriggerHandler].bind(this);
  }

  /**
   * A handler for the list selection event.
   * @param {Event} e
   */
  [selectedHandler](e) {
    const list = /** @type AnypointListbox */ (e.target);
    const { selectedItem } = list;
    if (!selectedItem) {
      return;
    }
    const id = selectedItem.dataset.cmd;
    const index = this.commands.findIndex((item) => item.id === id);
    const cmd = this.commands[index];
    if (cmd.hasChildren) {
      this[buildNested](id);
    } else {
      const detail = {
        command: cmd,
        item: index,
      };
      this.dispatchEvent(new CustomEvent('trigger', {
        detail,
      }));
    }
  }

  /**
   * Triggest nested menu when hovering an item that has a nested menu.
   * @param {MouseEvent} e
   */
  [mouseoverHandler](e) {
    const target = this[findEventListItemTarget](e);
    if (!target) {
      return;
    }
    const { nested, cmd } = target.dataset;
    if (nested === 'true') {
      this[buildNested](cmd);
    } else if (this[nestedIdValue]) {
      this[removeNested]();
    }
  }

  /**
   * @param {Event} e
   * @returns {AnypointIconItem}
   */
  [findEventListItemTarget](e) {
    const path = e.composedPath();
    let current = /** @type HTMLElement */ (path.shift());
    let target;
    while (!target) {
      if (!current) {
        break;
      }
      if (current.localName === 'anypoint-icon-item') {
        target = current;
      } else {
        current = /** @type HTMLElement */ (path.shift());
      }
      if (current === this) {
        break;
      }
    }
    return /** @type AnypointIconItem */ (target);
  }

  /**
   * Builds a nested menu for a command.
   * @param {string} id The id of the command
   */
  [buildNested](id) {
    if (!id || id === this[nestedIdValue]) {
      return;
    }
    if (this[nestedIdValue]) {
      this[clearNested]();
    }
    const cmd = this.commands.find((item) => item.id === id);
    if (!cmd.hasChildren) {
      return;
    }
    this[nestedIdValue] = id;
    if (this[nestedTimeout]) {
      clearTimeout(this[nestedTimeout]);
    }
    this[nestedTimeout] = setTimeout(() => {
      this[nestedTimeout] = undefined;
      this[createNested]();
    }, this.subMenuTimeout);
  }

  /**
   * Adds the nested menu to the local DOM.
   */
  [createNested]() {
    const id = this[nestedIdValue];
    if (!id) {
      return;
    }
    const ref = /** @type HTMLElement */ (this.shadowRoot.querySelector(`[data-cmd="${id}"]`));
    const box = ref.getBoundingClientRect();
    const cmd = this.commands.find((item) => item.id === id);
    const { children } = cmd;
    const menu = new ContextMenuElement();
    // @ts-ignore TODO: create a type definition for processed internally menu items
    menu.commands = children;
    menu.store = this.store;
    menu.target = this.target;
    menu.workspace = this.workspace;
    menu.customData = this.customData;
    menu.positionTarget = ref;
    menu.horizontalAlign = 'left';
    menu.verticalAlign = 'top';
    menu.dynamicAlign = true;
    menu.horizontalOffset = box.width - 4;
    menu.opened = true;
    menu.noCancelOnOutsideClick = true;
    menu.parentCommand = id;
    menu.addEventListener('closed', this[subClosedHandler]);
    menu.addEventListener('trigger', this[subTriggerHandler]);
    this.shadowRoot.append(menu);
  }

  /**
   * Triggers the remove nested menu action.
   */
  [removeNested]() {
    if (this[removingTimeout]) {
      return;
    }
    this[removingTimeout] = setTimeout(() => {
      this[removingTimeout] = undefined;
      this[clearNested]();
    }, this.subMenuTimeout);
  }

  /**
   * Removes the nested menu from the DOM.
   */
  [clearNested]() {
    this[nestedIdValue] = undefined;
    const menu = this.shadowRoot.querySelector('context-menu');
    if (menu) {
      this.shadowRoot.removeChild(menu);
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keydownHandler](e) {
    switch (e.code) {
      case 'ArrowRight': this[moveRight](); break;
      case 'ArrowLeft': this[moveLeft](); break;
      default:
    }
  }

  /**
   * Opens the menu when the current focused item has a sub menu.
   */
  [moveRight]() {
    const list = this.shadowRoot.querySelector('anypoint-listbox');
    const { focusedItem } = list;
    if (!focusedItem) {
      return;
    }
    const { nested, cmd } = focusedItem.dataset;
    if (nested === 'true') {
      this[nestedIdValue] = cmd;
      this[createNested]();
    }
  }

  /**
   * Closes the menu when this is a sub menu.
   */
  [moveLeft]() {
    if (!this.parentCommand) {
      return;
    }
    this.opened = false;
  }

  /**
   * A handler for the close event dispatched by the sub menu.
   * @param {Event} e
   */
  [subClosedHandler](e) {
    e.stopPropagation();
    this[clearNested]();
    this.focus();
  }

  /**
   * A handler for the sub-menu `trigger` event.
   * Retargets the event to the parent.
   * It adds `parent` to the detail, when the parent (currently selected command) has
   * the execute function.
   */
  [subTriggerHandler](e) {
    if (!e.detail.parent) {
      const id = this[nestedIdValue];
      const cmd = this.commands.find((item) => item.id === id);
      if (typeof cmd.execute === 'function') {
        e.detail.parent = cmd;
      }
    }
    this.dispatchEvent(new CustomEvent('trigger', {
      detail: e.detail,
    }));
  }

  /**
   * Focuses on the list element
   */
  focus() {
    const list = this.shadowRoot.querySelector('anypoint-listbox');
    if (list) {
      list.focus();
    }
  }

  render() {
    const { commands } = this;
    if (!Array.isArray(commands) || !commands.length) {
      return html``;
    }
    return html`
    <anypoint-listbox
      selectable="anypoint-icon-item"
      class="listbox"
      @selected="${this[selectedHandler]}"
      @mouseover="${this[mouseoverHandler]}"
      @keydown="${this[keydownHandler]}"
      aria-label="Context menu"
      role="menu"
    >
      ${commands.map((item) => this[menuItemTemplate](item))}
    </anypoint-listbox>
    `;
  }

  /**
   * @param {MenuItem} item
   * @returns {TemplateResult|string}
   */
  [menuItemTemplate](item) {
    switch (item.type) {
      case 'normal': return this[menuEntryTemplate](item);
      case 'separator': return this[separatorTemplate](item);
      case 'label': return this[labelTemplate](item);
      case 'radio': return this[radioEntryTemplate](item);
      default: return '';
    }
  }

  /**
   * @param {MenuItem} item
   * @returns {TemplateResult}
   */
  [separatorTemplate](item) {
    const { store, target, workspace, customData } = this;
    const visible = item.isVisible(store, target, workspace, customData);
    const classes = {
      'menu-divider': true,
      hidden: !visible,
    };
    return html`
    <div class="${classMap(classes)}" data-cmd="${item.id}"></div>
    `;
  }

  /**
   * @param {MenuItem} item
   * @returns {TemplateResult}
   */
  [labelTemplate](item) {
    const { store, target, workspace, customData } = this;
    const visible = item.isVisible(store, target, workspace, customData);
    const classes = {
      'menu-section-label': true,
      hidden: !visible,
    };
    return html`
    <div class="${classMap(classes)}" data-cmd="${item.id}">${item.label}</div>
    `;
  }

  /**
   * @param {MenuItem} item
   * @returns {TemplateResult}
   */
  [menuEntryTemplate](item) {
    const { store, target, workspace, customData } = this;
    item.beforeRenderCallback(store, target, workspace, customData);
    const visible = item.isVisible(store, target, workspace, customData);
    const enabled = item.isEnabled(store, target, workspace, customData);
    const classes = {
      item: true,
      disabled: !enabled,
      hidden: !visible,
    };
    const { title, icon, label, id, hasChildren } = item;
    return html`
    <anypoint-icon-item 
      class="${classMap(classes)}" 
      ?disabled="${!visible || !enabled}"
      aria-hidden="${!visible}"
      title="${ifDefined(title)}"
      data-cmd="${id}"
      data-nested="${hasChildren}"
      aria-haspopup="${hasChildren}"
      role="menuitem"
    >
      ${this[menuEntryIconTemplate](icon)}
      <span class="menu-label">${label}</span>
      ${hasChildren ? this[childrenIconTemplate]() : ''}
    </anypoint-icon-item>
    `;
  }

  /**
   * @param {MenuItem} item
   * @returns {TemplateResult}
   */
  [radioEntryTemplate](item) {
    const { store, target, workspace, customData } = this;
    item.beforeRenderCallback(store, target, workspace, customData);
    const visible = item.isVisible(store, target, workspace, customData);
    const enabled = item.isEnabled(store, target, workspace, customData);
    const checked = item.isChecked(store, target, workspace, customData);
    const classes = {
      item: true,
      disabled: !enabled,
      hidden: !visible,
    };
    const { title, label, id, hasChildren } = item;
    return html`
    <anypoint-icon-item 
      class="${classMap(classes)}" 
      ?disabled="${!visible || !enabled}"
      aria-hidden="${!visible}"
      title="${ifDefined(title)}"
      data-cmd="${id}"
      data-nested="${hasChildren}"
      data-type="radio"
      aria-haspopup="${hasChildren}"
      role="menuitem"
    >
      ${this[menuEntryCheckMarkTemplate](checked)}
      <span class="menu-label">${label}</span>
      ${hasChildren ? this[childrenIconTemplate]() : ''}
    </anypoint-icon-item>
    `;
  }

  /**
   * @param {SVGTemplateResult=} icon The icon is not required.
   * @return {TemplateResult} 
   */
  [menuEntryIconTemplate](icon) {
    return html`
    <div class="menu-icon" slot="item-icon">${icon}</div>
    `;
  }

  /**
   * @return {TemplateResult} The template for sub-menu icon
   */
  [childrenIconTemplate]() {
    return html`
    <div class="sub-menu-icon">${arrowRight}</div>
    `;
  }

  /**
   * @param {boolean} checked
   * @return {TemplateResult|string} The template for the menu entry checked mark.
   */
  [menuEntryCheckMarkTemplate](checked) {
    if (!checked) {
      return '';
    }
    return html`
      <div class="menu-icon" data-state="checked" slot="item-icon">${check}</div>
    `;
  }
}
