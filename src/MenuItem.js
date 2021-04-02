/* eslint-disable class-methods-use-this */
/** @typedef {import('./types').CommandBase} CommandBase */
/** @typedef {import('./types').ContextMenuCommand} ContextMenuCommand */
/** @typedef {import('./types').Point} Point */

/**
 * An object representing a single menu item in the menu.
 */
export class MenuItem {
  /**
   * @param {CommandBase} init
   */
  constructor(init) {
    const { type='normal', target, visible, id } = init;
    this.type = type;
    this.target = target;
    this.visible = visible;
    this.id = id;
    
    if (type === 'normal') {
      const { label, children, enabled, execute, icon, title } = /** @type ContextMenuCommand */ (init);
      this.label = label;
      this.children = children;
      this.enabled = enabled;
      this.execute = execute;
      this.icon = icon;
      this.title = title;
    }
  }

  /**
   * @returns {boolean} Whether this command has a sub-command.
   */
  get hasChildren() {
    const { children } = this;
    return Array.isArray(children) && !!children.length
  }

  /**
   * Executes the `enabled()` function, when specified in the command options.
   * 
   * @param {Map<string, any>} store
   * @param {HTMLElement|SVGElement} target
   * @param {HTMLElement} workspace
   * @param {unknown} customData
   * @returns {boolean} `true` when the command should be active in the UI.
   */
  isEnabled(store, target, workspace, customData) {
    let result = true;
    const { enabled, id } = this;
    if (typeof enabled === 'boolean') {
      result = enabled;
    } else if (typeof enabled === 'function') {
      try {
        result = enabled({
          id,
          store,
          target, 
          root: workspace,
          customData,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    }
    return result;
  }

  /**
   * Executes the `visible()` function, when specified in the command options.
   * 
   * @param {Map<string, any>} store
   * @param {HTMLElement|SVGElement} target
   * @param {HTMLElement} workspace
   * @param {unknown} customData
   * @returns {boolean} `true` when the command should be rendered in the UI.
   */
  isVisible(store, target, workspace, customData) {
    let result = true;
    const { visible, id } = this;
    if (typeof visible === 'boolean') {
      result = visible;
    } else if (typeof visible === 'function') {
      try {
        result = visible({
          id,
          store,
          target, 
          root: workspace,
          customData,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    }
    return result;
  }

  /**
   * Executes the `execute()` function, when specified in the command options.
   * 
   * @param {MenuItem} item
   * @param {Map<string, any>} store
   * @param {HTMLElement|SVGElement} target
   * @param {HTMLElement} workspace
   * @param {Point} clickPoint
   * @param {unknown=} customData
   * @param {number=} selectedSubcommand
   */
  trigger(item, store, target, workspace, clickPoint, customData, selectedSubcommand) {
    const { execute, id } = this;
    if (typeof execute !== 'function') {
      return;
    }
    execute({
      id,
      store,
      target, 
      root: workspace, 
      clickPoint,
      customData,
      selectedSubcommand,
      item,
    });
  }
}
