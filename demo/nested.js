import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ContextMenu } from '../index.js';
import { formatSize, copy, paste, title } from './DemoIcons.js';

/** @typedef {import('../src/types').ContextMenuCommand} ContextMenuCommand */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    // this.initObservableProperties([
    //   'har'
    // ]);
    this.componentName = 'Nested menus';
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
        label: 'Font size',
        icon: formatSize,
        execute: (args) => {
          console.log('Selected option:', args.item.id);
        },
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
        icon: title,
        execute: (args) => {
          console.log('Selected font:', args.item.id);
        },
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
        label: 'Add',
        children: [
          {
            label: 'Event',
            children: [
              {
                label: 'Publish event',
                id: 'event-publish'
              },
              {
                label: 'Subscribe event',
                id: 'event-subscribe'
              }
            ],
          }
        ],
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
