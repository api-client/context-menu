import { html } from 'lit';
import { DemoPage } from './DemoPage.js';
import { ContextMenu } from '../index.js';
import { copy, paste, flag } from './DemoIcons.js';

/** @typedef {import('../src/types').ContextMenuCommand} ContextMenuCommand */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.componentName = 'Icons example';
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
        target: 'root',
        label: 'Paste',
        title: 'Paste the value',
        icon: paste,
        execute: (args) => {
          console.log(args);
        },
      },
      {
        target: 'root',
        label: 'Copy',
        title: 'Copies the object',
        icon: copy,
        execute: (args) => {
          console.log(args);
        }
      },
      {
        target: 'root',
        label: 'Flag',
        icon: flag,
        execute: (args) => {
          console.log(args);
        }
      },
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
        <div class="target" data-id="test-value"></div>
      </div>
    </section>
    `;
  }
}

const instance = new ComponentPage();
instance.render();
