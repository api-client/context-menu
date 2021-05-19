import { html, fixture, assert, nextFrame, aTimeout, oneEvent } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';
import sinon from 'sinon';
import { MenuItem } from '../index.js';
import { copy } from '../demo/DemoIcons.js';
import '../context-menu.js';

/** @typedef {import('../index').ContextMenuElement} ContextMenuElement */
/** @typedef {import('../index').ContextMenuCommand} ContextMenuCommand */

describe('ContextMenuElement', () => {
  const store = new Map();
  const target = document.createElement('div');
  const workspace = document.createElement('div');
  const customData = Object.freeze({});

  before(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../demo/demo.css';
    document.head.append(link);
    document.body.classList.add('styled');
  });

  /**
   * @param {MenuItem[]} commands
   * @returns {Promise<ContextMenuElement>} 
   */
  async function dataFixture(commands) {
    return fixture(html`
    <context-menu 
      .commands="${commands}" 
      .store="${store}" 
      .target="${target}" 
      .workspace="${workspace}" 
      .customData="${customData}" 
      opened></context-menu>
    `);
  }

  describe('Menu rendering', () => {
    let menu = /** @type ContextMenuElement */ (null);
    const commands = [
      { 
        type: 'normal', 
        target: 'div',
        label: 'test 1',
        id: 't1',
      },
      { 
        type: 'separator', 
        id: 't2',
      },
      { 
        target: 'div',
        type: 'normal', 
        label: 'test 2',
        icon: copy,
        id: 't3',
      },
      { 
        target: 'div',
        label: 'test 3',
        enabled: false,
        id: 't4',
      },
      { 
        target: 'div',
        label: 'test 4',
        enabled: () => false,
        id: 't5',
      },
      { 
        target: 'div',
        label: 'test 5',
        visible: false,
        id: 't6',
      },
      { 
        target: 'div',
        label: 'test 6',
        visible: () => false,
        id: 't7',
      },
      { 
        target: 'div',
        label: 'test 7',
        title: 'test title',
        id: 't8',
      },
      {
        target: 'div',
        type: 'label',
        label: 'test label',
        id: 't9',
      },
    ];
    beforeEach(async () => { 
      // @ts-ignore
      const cmd = commands.map(item => new MenuItem(item));
      menu = await dataFixture(cmd); 
    });

    it('renders an item with a label', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t1"]'));
      const iconContainer = /** @type HTMLElement */ (item.querySelector('.menu-icon'));
      assert.ok(iconContainer, 'has the icon container');
      assert.isEmpty(iconContainer.innerText.trim(), 'the icon container is empty');
      const labelContainer = /** @type HTMLElement */ (item.querySelector('.menu-label'));
      assert.ok(labelContainer, 'has the label container');
      assert.equal(labelContainer.innerText.trim(), 'test 1', 'the label container has the value');
      const subContainer = /** @type HTMLElement */ (item.querySelector('.sub-menu-icon'));
      assert.notOk(subContainer, 'has no sub-menu icon');
    });

    it('renders a divider', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('div[data-cmd="t2"]'));
      assert.ok(item, 'has the divider');
      assert.isTrue(item.classList.contains('menu-divider'), 'has the class name');
    });

    it('renders a hidden divider', async () => {
      menu.commands[1].visible = false;
      await menu.requestUpdate();
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('div[data-cmd="t2"]'));
      assert.ok(item, 'has the divider');
      assert.isTrue(item.classList.contains('hidden'), 'has the hidden class name');
    });

    it('renders the icon', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t3"]'));
      const iconContainer = /** @type HTMLElement */ (item.querySelector('.menu-icon'));
      assert.ok(iconContainer, 'has the icon container');
      assert.include(iconContainer.innerHTML.trim(), '<svg', 'the icon container has content');
    });

    it('renders disabled item from the "enabled" property', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t4"]'));
      assert.isTrue(item.classList.contains('disabled'), 'has the disabled class name');
    });

    it('renders disabled item from the "enabled" function', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t5"]'));
      assert.isTrue(item.classList.contains('disabled'), 'has the disabled class name');
    });

    it('renders hidden item from the "visible" property', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t6"]'));
      assert.isTrue(item.classList.contains('hidden'), 'has the hidden class name');
    });

    it('renders hidden item from the "visible" function', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t7"]'));
      assert.isTrue(item.classList.contains('hidden'), 'has the hidden class name');
    });

    it('has the title attribute', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t8"]'));
      assert.equal(item.getAttribute('title'), 'test title');
    });

    it('dispatches the trigger event when selecting an item', () => {
      const spy = sinon.spy();
      menu.addEventListener('trigger', spy);
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="t8"]'));
      item.click();
      assert.isTrue(spy.calledOnce, 'The event is dispatched');
      const { detail } = spy.args[0][0];
      assert.isTrue(detail.command === menu.commands[7], 'has the command');
      assert.equal(detail.item, 7, 'has the index');
    });

    it('renders section title', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('div[data-cmd="t9"]'));
      assert.ok(item, 'has the item');
      assert.include(item.innerHTML.trim(), 'test label', 'has the provided label');
    });
  });

  describe('Nested menus', () => {
    before(async () => {
      await setViewport({ width: 1200, height: 800 });
    });

    let menu = /** @type ContextMenuElement */ (null);
    const commands = [
      {
        target: 'root',
        label: 'Font size',
        id: 'font-size',
        children: [
          {
            label: '0.75 rem',
            id: '0.75rem',
          },
          {
            label: '1 rem',
            id: '1rem',
          },
          {
            label: '1.25 rem',
            id: '1.25rem',
          },
          {
            label: '1.5 rem',
            id: '1.5rem',
          },
          {
            label: '2 rem',
            id: '2rem',
          },
        ],
      },
      {
        target: 'root',
        label: 'Font family',
        id: 'font-family',
        children: [
          {
            label: 'Arial',
            id: 'Arial',
          },
          {
            label: 'Calibri',
            id: 'Calibri',
          },
          {
            label: 'Consolas',
            id: 'Consolas',
          },
          {
            label: 'Courier New',
            id: 'Courier New',
          },
          {
            label: 'Open Sans',
            id: 'Open Sans',
          },
          {
            label: 'Roboto',
            id: 'Roboto',
          },
          {
            label: 'Times New Roman',
            id: 'Times New Roman',
          },
        ],
      },
      {
        target: 'root',
        label: 'Copy',
        id: 'copy',
      },
    ];

    beforeEach(async () => { 
      const cmd = commands.map((item) => {
        const result = new MenuItem(item);
        if (result.children) {
          // @ts-ignore
          result.children = result.children.map((child) => new MenuItem(child));
        }
        return result;
      });
      menu = await dataFixture(cmd); 
      menu.subMenuTimeout = 0;
      menu.style.top = '25px';
      menu.style.left = '25px';
    });

    /**
     * @param {ContextMenuElement} elm
     * @param {string} name
     * @returns {Promise<ContextMenuElement>} 
     */
    async function untilOpened(elm, name) {
      // make sure the menu is fully rendered
      await nextFrame();
      const item = /** @type HTMLElement */ (elm.shadowRoot.querySelector(`anypoint-icon-item[data-cmd="${name}"]`));
      item.dispatchEvent(new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: 0,
        clientY: 0,
      }));
      // for the menu debouncer
      await aTimeout(1);
      // for the menu to render
      await nextFrame();
      return elm.shadowRoot.querySelector('context-menu');
    }

    it('renders the sub-menu icon', () => {
      const icon = menu.shadowRoot.querySelector('.sub-menu-icon');
      assert.ok(icon);
    });

    it('does not render the sub-menu', () => {
      const sub = menu.shadowRoot.querySelector('context-menu');
      assert.notOk(sub);
    });

    it('items have data-nested attribute', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-size"]'));
      assert.equal(item.getAttribute('data-nested'), 'true');
    });

    it('items have aria-haspopup attribute', () => {
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-size"]'));
      assert.equal(item.getAttribute('aria-haspopup'), 'true');
    });

    it('opens the sub-menu', async () => {
      const sub = await untilOpened(menu, 'font-size');
      assert.ok(sub, 'sub menu is in the dom');
      assert.isTrue(sub.opened, 'sub menu is opened');
    });

    it('positions the sub-menu relative to the command', async () => {
      const sub = await untilOpened(menu, 'font-family');
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-family"]'));
      const subBox = sub.getBoundingClientRect();
      const itemBox = item.getBoundingClientRect();
      assert.isTrue(sub.positionTarget === item, 'position target is set')
      assert.approximately(itemBox.right - 4, subBox.x, 1, 'is positioned relatively x-axis');
      assert.approximately(itemBox.top, subBox.top, 1, 'is positioned to the top');
    });

    it('sets commands on the sub-menu', async () => {
      const sub = await untilOpened(menu, 'font-family');
      assert.typeOf(sub.commands, 'array');
      assert.lengthOf(sub.commands, 7);
    });

    it('passes the store to the sub-menu', async () => {
      const sub = await untilOpened(menu, 'font-family');
      assert.isTrue(sub.store === store);
    });

    it('passes the target to the sub-menu', async () => {
      const sub = await untilOpened(menu, 'font-family');
      assert.isTrue(sub.target === target);
    });

    it('passes the workspace to the sub-menu', async () => {
      const sub = await untilOpened(menu, 'font-family');
      assert.isTrue(sub.workspace === workspace);
    });

    it('passes the customData to the sub-menu', async () => {
      const sub = await untilOpened(menu, 'font-family');
      assert.isTrue(sub.customData === customData);
    });

    it('sets the parentCommand on the sub-menu', async () => {
      const sub = await untilOpened(menu, 'font-family');
      assert.equal(sub.parentCommand, 'font-family');
    });

    it('removes the sub-menu when closed', async () => {
      const sub = await untilOpened(menu, 'font-family');
      sub.close();
      await oneEvent(sub, 'closed');
      const element = menu.shadowRoot.querySelector('context-menu');
      assert.notOk(element);
    });

    it('dispatches "trigger" event when sub-menu item is selected', async () => {
      const sub = await untilOpened(menu, 'font-family');
      const spy = sinon.spy();
      menu.addEventListener('trigger', spy);
      const item = /** @type HTMLElement */ (sub.shadowRoot.querySelector('anypoint-icon-item'));
      item.click();
      assert.isTrue(spy.calledOnce, 'the event is dispatched');
      const { detail } = spy.args[0][0];
      assert.isTrue(detail.command === sub.commands[0], 'passes the command');
      assert.equal(detail.item, 0, 'passes the item');
      assert.isUndefined(detail.parent, 'parent is not set when parent has no execute function');
    });
    
    it('dispatches "trigger" event with "parent"', async () => {
      menu.commands[1].execute = () => {};
      const sub = await untilOpened(menu, 'font-family');
      const spy = sinon.spy();
      menu.addEventListener('trigger', spy);
      const item = /** @type HTMLElement */ (sub.shadowRoot.querySelector('anypoint-icon-item'));
      item.click();
      const { detail } = spy.args[0][0];
      assert.isTrue(detail.parent === menu.commands[1], 'passes the parent');
    });

    it('opens another sub-menu and closes previous one', async () => {
      const previous = await untilOpened(menu, 'font-family');
      const current = await untilOpened(menu, 'font-size');
      assert.notOk(previous.parentNode, 'previous menu is removed');
      assert.ok(current.parentNode, 'new menu is rendered');
    });

    it('closes the sub-menu when hovering another item', async () => {
      const sub = await untilOpened(menu, 'font-family');
      const item = /** @type HTMLElement */ (menu.shadowRoot.querySelector(`anypoint-icon-item[data-cmd="copy"]`));
      item.dispatchEvent(new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: 0,
        clientY: 0,
      }));
      await aTimeout(1);
      assert.notOk(sub.parentNode, 'previous menu is removed');
    });

    it('closes the sub-menu when arrow-left', async () => {
      const sub = await untilOpened(menu, 'font-family');
      const item = sub.shadowRoot.querySelector(`anypoint-icon-item`);
      item.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        composed: true,
        code: 'ArrowLeft',
      }));
      await oneEvent(sub, 'closed');
      assert.notOk(sub.parentNode, 'previous menu is removed');
    });

    it('opens the sub-menu when arrow-right', async () => {
      await nextFrame();
      const list = menu.shadowRoot.querySelector('anypoint-listbox');
      list.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        composed: true,
        code: 'ArrowRight',
      }));
      const sub = menu.shadowRoot.querySelector('context-menu');
      assert.ok(sub);
    });
  });

  describe('Radio menus', () => {
    before(async () => {
      await setViewport({ width: 1200, height: 800 });
    });

    let menu = /** @type ContextMenuElement */ (null);
    const commands = /** @type ContextMenuCommand[] */ ([
      {
        target: 'all',
        label: 'Font',
        title: 'Select a default font for the UI',
        id: 'font-size',
        execute: (ctx) => {
          const size = ctx.item.id.replace('font-', '');
          ctx.store.set('font-size', size);
        },
        children: [
          {
            type: 'radio',
            label: 'Small',
            id: 'font-small',
            checked: (ctx) => {
              const fs = ctx.store.get('font-size');
              return fs === 'small';
            },
          },
          {
            type: 'radio',
            label: 'Normal',
            id: 'font-normal',
            checked: (ctx) => {
              const fs = ctx.store.get('font-size');
              return !fs || fs === 'normal';
            },
          },
          {
            type: 'radio',
            label: 'Large',
            id: 'font-large',
            checked: (ctx) => {
              const fs = ctx.store.get('font-size');
              return fs === 'large';
            },
          },
        ],
      },
    ]);

    beforeEach(async () => { 
      const cmd = commands.map((item) => {
        const result = new MenuItem(item);
        if (result.children) {
          // @ts-ignore
          result.children = result.children.map((child) => new MenuItem(child));
        }
        return result;
      });
      menu = await dataFixture(cmd); 
      menu.subMenuTimeout = 0;
      menu.style.top = '25px';
      menu.style.left = '25px';
    });

    /**
     * @param {ContextMenuElement} elm
     * @param {string} name
     * @returns {Promise<ContextMenuElement>} 
     */
    async function untilOpened(elm, name) {
      // make sure the menu is fully rendered
      await nextFrame();
      const item = /** @type HTMLElement */ (elm.shadowRoot.querySelector(`anypoint-icon-item[data-cmd="${name}"]`));
      item.dispatchEvent(new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: 0,
        clientY: 0,
      }));
      // for the menu debouncer
      await aTimeout(1);
      // for the menu to render
      await nextFrame();
      return elm.shadowRoot.querySelector('context-menu');
    }

    it('has the selected item', async () => {
      const sub = await untilOpened(menu, 'font-size');
      const item = /** @type HTMLElement */ (sub.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-normal"]'));
      const checkIcon = item.querySelector('.menu-icon[data-state="checked"]');
      assert.ok(checkIcon);
    });

    it('has no selection when not set', async () => {
      const sub = await untilOpened(menu, 'font-size');
      const item1 = /** @type HTMLElement */ (sub.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-small"]'));
      const checkIcon1 = item1.querySelector('.menu-icon[data-state="checked"]');
      assert.notOk(checkIcon1, 'first item has no selection');

      const item2 = /** @type HTMLElement */ (sub.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-large"]'));
      const checkIcon2 = item2.querySelector('.menu-icon[data-state="checked"]');
      assert.notOk(checkIcon2, 'third item has no selection');
    });

    it('has the data-type property', async () => {
      const sub = await untilOpened(menu, 'font-size');
      const item = /** @type HTMLElement */ (sub.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-normal"]'));
      assert.equal(item.getAttribute('data-type'), 'radio');
    });

    it('uses the boolean checked value to determine the state', async () => {
      // @ts-ignore
      menu.commands[0].children[0].checked = true;
      const sub = await untilOpened(menu, 'font-size');
      const item = /** @type HTMLElement */ (sub.shadowRoot.querySelector('anypoint-icon-item[data-cmd="font-small"]'));
      const checkIcon = item.querySelector('.menu-icon[data-state="checked"]');
      assert.ok(checkIcon);
    });
  });
});
