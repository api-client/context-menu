/* eslint-disable class-methods-use-this */
import '../context-menu.js';
import { MenuItem } from './MenuItem.js';

/** @typedef {import('./types').ContextMenuCommand} ContextMenuCommand */
/** @typedef {import('./types').TriggerInfo} TriggerInfo */
/** @typedef {import('./types').CustomMenuEventDetail} CustomMenuEventDetail */
/** @typedef {import('./types').CommandBase} CommandBase */
/** @typedef {import('./types').Point} Point */

let index = 0;

export const contextHandler = Symbol('contextHandler');
export const clickHandler = Symbol('clickHandler');
export const keydownHandler = Symbol('keydownHandler');
export const menuTriggerHandler = Symbol('menuTriggerHandler');
export const customMenuHandler = Symbol('customMenuHandler');
export const normalizeMenuItem = Symbol('normalizeMenuItem');
export const prepareCommands = Symbol('prepareCommands');
export const connectedValue = Symbol('connectedValue');

/**
 * The base class for the context menu. It can be used as is but in some specific cases
 * you may want to extend this class to be able to find command target accurately.
 */
export class ContextMenu extends EventTarget {
  /**
   * @returns {boolean} true when the menu is connected to the `workspace`.
   */
  get connected() {
    return this[connectedValue];
  }

  /**
   * @param {HTMLElement} workspace The root element that is the click handler
   */
  constructor(workspace) {
    super();
    this.workspace = workspace;
    /** 
     * The store initialized with this context menu. Passed to the lifecycle functions.
     * @type {Map<string, any>}
     */
    this.store = new Map();
    /** 
     * The root level menu commands
     * @type {MenuItem[]}
     */
    this.commands = [];
    /** 
     * An information about the trigger that initialized this menu.
     * @type {TriggerInfo}
     */
    this.triggerInfo = undefined;
    
    this[connectedValue] = false;

    this[contextHandler] = this[contextHandler].bind(this);
    this[clickHandler] = this[clickHandler].bind(this);
    this[keydownHandler] = this[keydownHandler].bind(this);
    this[customMenuHandler] = this[customMenuHandler].bind(this);
    this[menuTriggerHandler] = this[menuTriggerHandler].bind(this);
  }

  /**
   * Starts listening on user events
   */
  connect() {
    this.workspace.addEventListener('contextmenu', this[contextHandler]);
    this.workspace.addEventListener('custommenu', this[customMenuHandler]);
    window.addEventListener('click', this[clickHandler]);
    window.addEventListener('keydown', this[keydownHandler]);
    this[connectedValue] = true;
  }

  /**
   * Cleans up the listeners
   */
  disconnect() {
    this.workspace.removeEventListener('contextmenu', this[contextHandler]);
    this.workspace.removeEventListener('custommenu', this[customMenuHandler]);
    window.removeEventListener('click', this[clickHandler]);
    window.removeEventListener('keydown', this[keydownHandler]);
    this[connectedValue] = false;
  }

  /**
   * Reads {x,y} point of the click from the pointer event.
   * 
   * Override this method to customize position reading.
   * 
   * @param {MouseEvent} e
   * @returns {Point}
   */
  readTargetClickPosition(e) {
    return {
      x: e.clientX, 
      y: e.clientY,
    }
  }

  /**
   * Override this method to customize finding event click target.
   * @param {MouseEvent} e Finds the click target from the event
   * @returns {HTMLElement|SVGElement|undefined}
   */
  findTarget(e) {
    return /** @type HTMLElement|SVGElement|undefined */ (e.target);
  }

  /**
   * Maps an element to the target name used by the commands.
   * By default it returns `root` when the click target element is the `workspace` or
   * a combination of element name and list of all classes otherwise.
   * 
   * Override this method to customize target name reading.
   *
   * @param {HTMLElement|SVGElement} element The context click target
   * @returns {string|undefined} The target name.
   */
  elementToTarget(element) {
    if (element === this.workspace) {
      return 'root';
    }
    if (!element.localName) {
      return undefined;
    }
    let name = element.localName;
    const cls = Array.from(element.classList).join('.');
    if (cls) {
      name += `.${cls}`;
    }
    return name;
  }

  /**
   * Handler for the context menu event.
   * @param {MouseEvent} e
   */
  [contextHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    this.destroy();
    const target = this.findTarget(e);
    if (!target) {
      return;
    }
    const name = this.elementToTarget(target);
    if (!name) {
      return;
    }
    // since the context menu has fixed position it doesn't matter what the context 
    // is as the menu is rendered over all elements.
    // The `readTargetClickPosition()` is used to determine click target for the commands.
    const clickPoint = {
      x: e.clientX, 
      y: e.clientY,
    }
    const targetPoint = this.readTargetClickPosition(e);
    this.build(target, name, clickPoint, targetPoint);
  }

  /**
   * A handler for the `custommenu` event handler to trigger the menu without the user interaction.
   * @param {CustomEvent<CustomMenuEventDetail>} e
   */
  [customMenuHandler](e) {
    e.preventDefault();
    e.stopPropagation();
    const { name, x=0, y=0, actionTarget=this.workspace, clickEvent, customData } = e.detail;
    const clickPoint = {
      x, 
      y,
    };
    const targetPoint = clickEvent ? this.readTargetClickPosition(clickEvent) : clickPoint;
    this.build(actionTarget, name, clickPoint, targetPoint, customData);
  }

  /**
   * Handles the click event on the document to close the menu is the click
   * is outside the menu.
   * @param {MouseEvent} e
   */
  [clickHandler](e) {
    if (!this.currentMenu || e.defaultPrevented) {
      return;
    }
    const elm = /** @type Element */ (e.target);
    const inside = this.currentMenu.contains(elm);
    if (!inside) {
      this.destroy();
    }
  }

  /**
   * Closes the menu when ESC is pressed
   * @param {KeyboardEvent} e
   */
  [keydownHandler](e) {
    if (e.key === 'Escape' && this.currentMenu) {
      this.destroy();
    }
  }

  /**
   * Register a list of commands to be rendered in the menu when triggered.
   * This overrides previously registered commands.
   * @param {CommandBase[]} commands
   */
  registerCommands(commands) {
    if (!Array.isArray(commands) || !commands.length) {
      return;
    }
    this.commands = this[prepareCommands](commands);
  }

  /**
   * Adds a single command to the menu.
   * 
   * @param {CommandBase} command
   */
  addCommand(command) {
    if (!this.commands) {
      this.commands = [];
    }
    const item = this[prepareCommands]([command])[0];
    this.commands.push(item);
  }

  /**
   * Prepares incoming commands for the internal use.
   * @param {CommandBase[]} commands The commands to process.
   * @returns {MenuItem[]}
   */
  [prepareCommands](commands) {
    const result = /** @type MenuItem[] */ ([]);
    commands.forEach((item) => {
      if (!item) {
        return;
      }
      const { type='normal' } = item;
      switch (type) {
        case 'separator': result.push(new MenuItem(item)); break;
        case 'normal':
          {
            const normalized = this[normalizeMenuItem](/** @type ContextMenuCommand */ (item));
            result.push(new MenuItem(normalized));
          }
          break;
        default: 
      }
    });
    return result;
  }

  /**
   * @param {ContextMenuCommand} item
   * @returns {ContextMenuCommand}
   */
  [normalizeMenuItem](item) {
    const cp = { ...item };
    if (!cp.id) {
      index += 1;
      cp.id = `${index}`;
    }
    if (Array.isArray(cp.children) && cp.children.length) {
      cp.children = this[prepareCommands](cp.children);
    } else if (cp.children) {
      cp.children = undefined;
    }
    return cp;
  }

  /**
   * Builds the menu for the target.
   *
   * @param {HTMLElement|SVGElement} target The element that triggered the menu
   * @param {string} name The `target` name declared in the commands.
   * @param {Point} placementPoint The workspace position of where to place the menu.
   * @param {Point} targetPoint The workspace position of the click target
   * @param {unknown=} customData Any data to set on the instance to pass to the `execute` and `enabled` functions.
   */
  build(target, name, placementPoint, targetPoint, customData) {
    this.triggerInfo = undefined;
    const commands = this.listCommands(name);
    if (!commands.length) {
      return;
    }
    this.triggerInfo = /** @type TriggerInfo */({
      point: targetPoint,
      customData,
      target,
    });
    this.render(placementPoint, commands);
    target.setAttribute('active', '');
  }

  /**
   * @param {Point} placementPoint The workspace position of where to place the menu.
   * @param {MenuItem[]} commands The commands render
   */
  render(placementPoint, commands) {
    const { workspace } = this;
    const menu = document.createElement('context-menu');
    menu.store = this.store;
    menu.target = this.triggerInfo.target;
    menu.customData = this.triggerInfo.customData;
    menu.workspace = workspace;
    menu.classList.add('context-menu');
    menu.commands = commands;
    menu.dynamicAlign = true;
    menu.style.top = `${placementPoint.y}px`;
    menu.style.left = `${placementPoint.x}px`;
    
    if (workspace.shadowRoot) {
      workspace.shadowRoot.append(menu);
    } else {
      this.workspace.append(menu);
    }
    menu.opened = true;
    this.currentMenu = menu;
    menu.focus();
    menu.addEventListener('trigger', this[menuTriggerHandler]);
  }

  /**
   * Lists all commands that matches the target.
   *
   * @param {string} target The build target
   * @returns {MenuItem[]}
   */
  listCommands(target) {
    const { commands=[] } = this;
    const result = /** @type MenuItem[] */ ([]);
    const filter = ['all', target];
    commands.forEach((cmd) => {
      if (Array.isArray(cmd.target)) {
        const hasTarget = cmd.target.some((item) => filter.includes(item));
        if (hasTarget) {
          result.push(cmd);
        }
      } else if (filter.includes(cmd.target)) {
        result.push(cmd);
      }
    });
    return result;
  }

  /**
   * Removes the currently rendered menu.
   */
  destroy() {
    if (!this.currentMenu) {
      return;
    }
    this.triggerInfo.target.removeAttribute('active');
    this.triggerInfo = undefined;
    const { workspace } = this;
    if (workspace.shadowRoot) {
      workspace.shadowRoot.removeChild(this.currentMenu);
    } else {
      workspace.removeChild(this.currentMenu);
    }
    this.currentMenu.removeEventListener('trigger', this[menuTriggerHandler]);
    this.currentMenu = undefined;
  }

  /**
   * Handler for the `trigger` event dispatched by the menu
   * @param {CustomEvent} e
   */
  [menuTriggerHandler](e) {
    const { item, command, parent } = e.detail;
    const cmd = /** @type MenuItem */ (command);
    const parentCommand = /** @type MenuItem */ (parent);
    const { triggerInfo, workspace, store } = this;
    const { point, target, customData } = triggerInfo;
    this.destroy();
    if (parentCommand && parentCommand.execute && !cmd.execute) {
      parentCommand.trigger(cmd, store, target, workspace, point, customData, item);
    } else if (cmd.execute) {
      cmd.trigger(cmd, store, target, workspace, point, customData);
    } else {
      this.dispatchEvent(new CustomEvent('execute', {
        detail: {
          id: cmd.id,
          store,
          target, 
          root: workspace, 
          clickPoint: point,
          customData,
          selectedSubcommand: item,
          item: cmd,
        }
      }));
    }
  }
}
