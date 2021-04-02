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
    this.componentName = 'Custom data';
    this.renderViewControls = true;

    this.customTriggerHandler = this.customTriggerHandler.bind(this);
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
        target: 'custom',
        label: 'Custom action',
        title: 'Custom action title',
        execute: (args) => {
          console.log(args);
        }
      },
    ]);
    instance.registerCommands(commands);
    instance.connect();
  }

  customTriggerHandler(e) {
    e.preventDefault();
    const container = /** @type HTMLElement */ (document.body.querySelector('#workspace'));
    container.dispatchEvent(new CustomEvent('custommenu', {
      detail: {
        name: 'custom',
        x: container.offsetLeft + 100,
        y: container.offsetTop + 100,
        customData: { test: true, },
      },
    }));
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
      <div id="workspace"></div>
      <button id="customTrigger" @click="${this.customTriggerHandler}">Trigger custom</button>
      <p>The menu is only triggered via the custom event.</p>
    </section>
    `;
  }
}

const instance = new ComponentPage();
instance.render();
