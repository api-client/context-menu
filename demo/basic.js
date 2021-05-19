import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ContextMenu } from '../index.js';

/** @typedef {import('../src/types').ContextMenuCommand} ContextMenuCommand */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    // this.initObservableProperties([
    //   'har'
    // ]);
    this.componentName = 'Basic context menu';
    this.renderViewControls = true;
  }

  firstRender() {
    super.firstRender();
    this.initContextMenu();
  }

  initContextMenu() {
    const container = /** @type HTMLElement */ (document.body.querySelector('#workspace'));
    const instance = new ContextMenu(container);
    const commands = /** @type ContextMenuCommand[] */ ([
      {
        target: 'all',
        label: 'test',
        title: 'test title',
        id: 'test-command',
        execute: (args) => {
          console.log(args);
        }
      },
      {
        target: 'all',
        label: 'visible',
        title: 'test visible title',
        execute: (args) => {
          console.log(args);
        },
        visible: () => false
      },
      {
        target: 'all',
        label: 'Not enabled',
        title: 'test enabled title',
        execute: (args) => {
          console.log(args);
        },
        enabled: () => false
      },
      {
        target: ['div.target', 'div.target.second'],
        type: 'separator',
      },
      {
        target: 'div.target',
        label: 'Target only',
        title: 'test title',
        id: 'target-command',
        execute: (args) => {
          console.log(args);
        }
      },
      {
        target: ['div.target', 'div.target.second'],
        label: 'Target and second only',
        title: 'test title',
        execute: (args) => {
          console.log(args);
        }
      },
      {
        target: 'custom',
        label: 'Custom action',
        title: 'Custom action title',
        execute: (args) => {
          console.log(args);
        }
      },
      {
        target: 'all',
        label: 'Uninitialized',
        beforeRender: (ctx) => {
          const { menu, target } = ctx;
          const label = `Clicked on a ${target.localName}`;
          menu.label = label;
        },
      }
    ]);
    instance.registerCommands(commands);
    instance.connect();
  }

  contentTemplate() {
    return html`
      <h2>Context menu</h2>
      ${this._demoTemplate()}
    `;
  }

  _demoTemplate() {
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <div id="workspace">
        <section class="target">Section</section>
        <aside class="target second">Aside</aside>
      </div>
      <p>This menu has a hidden item.</p>
    </section>
    `;
  }
}

const instance = new ComponentPage();
instance.render();
