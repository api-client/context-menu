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
    this.componentName = 'Radio items context menu';
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
        label: 'Font',
        title: 'Select a default font for the UI',
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
      </div>
    </section>
    `;
  }
}

const instance = new ComponentPage();
instance.render();
