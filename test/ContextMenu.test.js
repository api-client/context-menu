/* eslint-disable no-unused-vars */
import { html, fixture, assert, nextFrame } from '@open-wc/testing';
import { ContextMenu } from '../index.js';

const commands = [
  {
    target: 'all',
    label: 'test',
    title: 'test-title',
    execute: () => {
      // ..
    },
  },
  {
    target: 'all',
    label: 'disabled',
    title: 'disabled-title',
    enabled: false,
    execute: () => { 
      // ..
    },
  },
  {
    target: 'target',
    label: 'Target only',
    title: 'test title',
    execute: () => {
      // console.log(args);
    }
  },
  {
    target: 'custom',
    label: 'Custom only',
    title: 'custom title',
    execute: () => {
      // console.log(args);
    }
  },
  {
    target: 'all',
    label: 'visible',
    title: 'visible-title',
    visible: () => false,
    execute: () => { 
      // ..
    },
  },
];

describe('ContextMenu', () => {
  describe('constructor()', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    beforeEach(async () => {
      workspace = await fixture(html`<div></div>`);
    });

    it('sets the "workspace" property', async () => {
      const menu = new ContextMenu(workspace);
      assert.isTrue(menu.workspace === workspace);
    });

    it('initializes the store', async () => {
      const menu = new ContextMenu(workspace);
      assert.typeOf(menu.store, 'map');
    });

    it('has empty commands', async () => {
      const menu = new ContextMenu(workspace);
      assert.deepEqual(menu.commands, []);
    });

    it('is not "connected"', async () => {
      const menu = new ContextMenu(workspace);
      assert.isFalse(menu.connected);
    });
  });

  describe('elementToTarget()', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    let menu = /** @type ContextMenu */ (null);
    before(async () => {
      workspace = await fixture(html`<div></div>`);
      menu = new ContextMenu(workspace);
    });

    it('returns "root" for the workspace', () => {
      const result = menu.elementToTarget(workspace);
      assert.equal(result, 'root');
    });

    it('returns the local name of the element only', () => {
      const node = document.createElement('div');
      const result = menu.elementToTarget(node);
      assert.equal(result, 'div');
    });

    it('returns the local name and the classes', () => {
      const node = document.createElement('div');
      node.className = 'a b c';
      const result = menu.elementToTarget(node);
      assert.equal(result, 'div.a.b.c');
    });

    it('ignores non-elements', () => {
      const node = document.createTextNode('test');
      // @ts-ignore
      const result = menu.elementToTarget(node);
      assert.isUndefined(result);
    });
  });

  describe('triggering the menu', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    let menu = /** @type ContextMenu */ (null);
    beforeEach(async () => {
      workspace = await fixture(html`<div><span></span></div>`);
      menu = new ContextMenu(workspace);
      menu.connect();
    });

    afterEach(() => {
      menu.disconnect();
    });

    it('adds the menu on the root click', () => {
      const [cmd] = commands;
      menu.registerCommands([cmd]);
      workspace.dispatchEvent(new MouseEvent('contextmenu', {
        clientX: 1,
        clientY: 1,
      }));
      const instance = workspace.querySelector('.context-menu');
      assert.ok(instance);
    });

    it('does not add the menu when no commands', () => {
      workspace.dispatchEvent(new MouseEvent('contextmenu', {
        clientX: 1,
        clientY: 1,
      }));
      const instance = workspace.querySelector('.context-menu');
      assert.notOk(instance);
    });

    it('does not add the menu when no target', () => {
      const cmd = commands[2];
      menu.registerCommands([cmd]);
      workspace.dispatchEvent(new MouseEvent('contextmenu', {
        clientX: 1,
        clientY: 1,
      }));
      const instance = workspace.querySelector('.context-menu');
      assert.notOk(instance);
    });

    it('renders menu for a target', () => {
      menu.registerCommands([...commands]);
      menu.elementToTarget = (elm) => 'target';
      const span = workspace.querySelector('span');
      span.dispatchEvent(new MouseEvent('contextmenu', {
        clientX: 1,
        clientY: 1,
        bubbles: true,
        cancelable: true,
      }));
      const instance = workspace.querySelector('.context-menu');
      assert.ok(instance);
    });

    it('has all target commands', async () => {
      menu.registerCommands([...commands]);
      menu.elementToTarget = (elm) => 'target';
      const span = workspace.querySelector('span');
      span.dispatchEvent(new MouseEvent('contextmenu', {
        clientX: 1,
        clientY: 1,
        bubbles: true,
        cancelable: true,
      }));
      await nextFrame();
      const menuElement = workspace.querySelector('context-menu');
      const instances = menuElement.shadowRoot.querySelectorAll('anypoint-listbox > *');
      assert.lengthOf(instances, 4);
    });
  });

  describe('disabled command', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    let menu = /** @type ContextMenu */ (null);
    beforeEach(async () => {
      workspace = await fixture(html`<div></div>`);
      menu = new ContextMenu(workspace);
      menu.connect();
    });

    it('renders command disabled', async () => {
      menu.registerCommands([...commands]);
      workspace.dispatchEvent(new MouseEvent('contextmenu', {
        clientX: 1,
        clientY: 1,
      }));
      await nextFrame();
      const menuElement = workspace.querySelector('context-menu');
      const item = menuElement.shadowRoot.querySelector('.disabled');
      assert.isTrue(item.classList.contains('disabled'));
    });
  });

  describe('visible command', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    let menu = /** @type ContextMenu */ (null);
    beforeEach(async () => {
      workspace = await fixture(html`<div></div>`);
      menu = new ContextMenu(workspace);
      menu.connect();
    });

    it('renders command hidden', async () => {
      menu.registerCommands([...commands]);
      workspace.dispatchEvent(new MouseEvent('contextmenu', {
        clientX: 1,
        clientY: 1,
      }));
      await nextFrame();
      const menuElement = workspace.querySelector('context-menu');
      const item = menuElement.shadowRoot.querySelector('.hidden');
      assert.isTrue(item.hasAttribute('disabled'));
    });
  });

  describe('triggering the menu from the custom event', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    let menu = /** @type ContextMenu */ (null);
    beforeEach(async () => {
      workspace = await fixture(html`<div><span></span></div>`);
      menu = new ContextMenu(workspace);
      menu.connect();
      menu.registerCommands(commands);
    });

    it('renders the menu with the default values', () => {
      workspace.dispatchEvent(new CustomEvent('custommenu', {
        detail: {
          name: 'custom',
        },
      }));
      const instance = workspace.querySelector('.context-menu');
      assert.ok(instance);
      const styles = getComputedStyle(instance);
      assert.equal(styles.top, '0px', 'has default y position');
      assert.equal(styles.left, '0px', 'has default x position');
    });

    it('renders the menu with the passed coordinates', () => {
      workspace.dispatchEvent(new CustomEvent('custommenu', {
        detail: {
          name: 'custom',
          x: 20,
          y: 40,
        },
      }));
      const instance = workspace.querySelector('.context-menu');
      const styles = getComputedStyle(instance);
      assert.equal(styles.top, '40px', 'has default y position');
      assert.equal(styles.left, '20px', 'has default x position');
    });

    it('passes the custom data to the execute function', async () => {
      const customData = {
        test: true,
      };
      let args = {};
      const cmd = {
        target: 'custom',
        label: 'Custom 2',
        execute: (arg) => {
          args = arg;
        }
      };
      menu.addCommand(cmd);
      workspace.dispatchEvent(new CustomEvent('custommenu', {
        detail: {
          name: 'custom',
          customData,
        },
      }));
      await nextFrame();
      const menuElement = workspace.querySelector('context-menu');
      const items = menuElement.shadowRoot.querySelectorAll('anypoint-icon-item');
      const item = items[items.length - 1];
      item.click();
      assert.deepEqual(args.customData, customData);
    });

    it('passes the custom data to the enabled function', async () => {
      const customData = {
        test: true,
      };
      let args = {};
      const cmd = {
        target: 'custom',
        label: 'Custom 2',
        execute: (arg) => {
          // ...
        },
        enabled: (arg) => {
          args = arg;
          return true;
        },
      };
      menu.addCommand(cmd);
      workspace.dispatchEvent(new CustomEvent('custommenu', {
        detail: {
          name: 'custom',
          customData,
        },
      }));
      await nextFrame();
      const menuElement = workspace.querySelector('context-menu');
      const items = menuElement.shadowRoot.querySelectorAll('anypoint-icon-item');
      const item = items[3];
      item.click();
      assert.deepEqual(args.customData, customData);
    });
  });

  describe('closing the menu via click', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    let menu = /** @type ContextMenu */ (null);
    beforeEach(async () => {
      workspace = await fixture(html`<div><span></span></div>`);
      menu = new ContextMenu(workspace);
      menu.registerCommands(commands);
      menu.connect();
      workspace.dispatchEvent(new CustomEvent('custommenu', {
        detail: {
          name: 'custom',
          x: 1,
          y: 1,
        },
      }));
      await nextFrame();
      assert.ok(menu.currentMenu, 'has the menu');
    });

    it('destroys the menu when clicking outside the menu', () => {
      document.body.click();
      assert.isUndefined(menu.currentMenu);
    });

    it('ignores when clicking inside the menu', () => {
      const menuElement = workspace.querySelector('context-menu');
      const list = menuElement.shadowRoot.querySelector('anypoint-listbox');
      list.click();
      assert.ok(menu.currentMenu);
    });

    it('ignores when menu does not exist', () => {
      menu.destroy();
      document.body.click();
      assert.isUndefined(menu.currentMenu);
    });
  });

  describe('closing the menu via keyboard events', () => {
    let workspace = /** @type HTMLDivElement */ (null);
    let menu = /** @type ContextMenu */ (null);
    beforeEach(async () => {
      workspace = await fixture(html`<div><span></span></div>`);
      menu = new ContextMenu(workspace);
      menu.registerCommands(commands);
      menu.connect();
      workspace.dispatchEvent(new CustomEvent('custommenu', {
        detail: {
          name: 'custom',
          x: 1,
          y: 1,
        },
      }));
      await nextFrame();
      assert.ok(menu.currentMenu, 'has the menu');
    });

    it('destroys the menu when Escape key', () => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        key: 'Escape',
      }));
      assert.isUndefined(menu.currentMenu);
    });

    it('ignores other keys', () => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        key: 'Enter',
      }));
      assert.ok(menu.currentMenu);
    });

    it('ignores when no menu', () => {
      menu.destroy();
      document.body.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        composed: true,
        key: 'Escape',
      }));
      assert.isUndefined(menu.currentMenu);
    });
  });
});
