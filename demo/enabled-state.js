import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ContextMenu } from '../index.js';
import { copy, paste } from './DemoIcons.js';

/** @typedef {import('../src/types').ContextMenuCommand} ContextMenuCommand */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    // this.initObservableProperties([
    //   'har'
    // ]);
    this.componentName = 'Enabled state';
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
        target: 'root',
        label: 'Paste',
        title: 'Paste the value',
        icon: paste,
        execute: (args) => {
          console.log(args);
          const copyId = args.store.get('copy');
          console.log('Copying ', copyId);
          args.store.delete('copy');
        },
        enabled: (args) => {
          const copyId = args.store.get('copy');
          return !!copyId;
        },
      },
      {
        target: 'div.target',
        label: 'Copy',
        title: 'Copies the object',
        icon: copy,
        execute: (args) => {
          const { id } = args.target.dataset;
          args.store.set('copy', id);
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
      <p>The "paste" command is enabled after the "copy" command on the target box is executed.</p>
    </section>
    `;
  }
}

const instance = new ComponentPage();
instance.render();
