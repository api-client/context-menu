import { html, render } from 'lit';

/** @typedef {import('lit').TemplateResult} TemplateResult */

export const renderingValue = Symbol('renderingValue');
export const renderPage = Symbol('renderPage');
export const setUpdatePromise = Symbol('setUpdatePromise');
export const updateResolver = Symbol('updateResolver');
export const hasPendingUpdatePromise = Symbol('hasPendingUpdatePromise');
export const resolveUpdatePromise = Symbol('resolveUpdatePromise');

export class DemoPage {
  componentName = '';

  /**
   * Determines whether the initial render had run and the `firstRender()`
   * function was called.
   */
  firstRendered = false;

  /** 
   * @type {Promise<boolean>} A promise resolved when the render finished.
   */
  updateComplete = undefined;

  /** 
   * True when rendering debouncer is running.
   * @returns {boolean}
   */
  get rendering() {
    return this[renderingValue];
  }

  [renderingValue] = false;

  [hasPendingUpdatePromise] = false;

  /**
   * @type {(value?: any) => void}
   */
  [updateResolver] = undefined;

  /**
   * Helper function to be overridden by child classes. It is called when the view
   * is rendered for the first time.
   */
  firstRender() {
  }

  /**
   * A function called when the template has been rendered
   */
  updated() {}

  /**
   * The page render function. Usually you don't need to use it.
   * It renders the header template, main section, and the content.
   * @returns {TemplateResult}
   */
  pageTemplate() {
    return html`
    ${this.headerTemplate()}
    <main>
      ${this.contentTemplate()}
    </main>`;
  }

  /**
   * Call this on the top of the `render()` method to render demo navigation
   * @returns HTML template for demo header
   */
  headerTemplate() {
    const { componentName } = this;
    return html`
    <header>
      ${componentName ? html`<h1>${componentName}</h1>` : ''}
    </header>`;
  }

  contentTemplate() {
    return html``;
  }

  /**
   * The main render function. Sub classes should not override this method.
   * Override `[renderPage]()` instead.
   *
   * The function calls `[renderPage]()` in a micro task so it is safe to call this
   * multiple time in the same event loop.
   * @returns {TemplateResult | undefined}
   */
  render() {
    if (this.rendering) {
      return;
    }
    this[renderingValue] = true;
    if (!this[hasPendingUpdatePromise]) {
      this[setUpdatePromise]();
    }
    requestAnimationFrame(() => {
      this[renderingValue] = false;
      this[renderPage]();
    });
  }

  [renderPage]() {
    const root = /** @type HTMLElement */ (document.querySelector('#demo'));
    if (!root) {
      // eslint-disable-next-line no-console
      console.warn(`The <div id="demo"></div> is not in the document.`);
      return;
    }
    if (!this.firstRendered) {
      this.firstRendered = true;
      // cleanup any pre-existing content.
      Array.from(root.childNodes).forEach(node => node.parentNode?.removeChild(node));
      setTimeout(() => this.firstRender());
    }
    render(this.pageTemplate(), root, {  host: this, });
    this[resolveUpdatePromise]();
    this.updated();
  }

  [setUpdatePromise]() {
    this.updateComplete = new Promise((resolve) => {
      this[updateResolver] = resolve;
      this[hasPendingUpdatePromise] = true;
    });
  }

  [resolveUpdatePromise]() {
    if (!this[hasPendingUpdatePromise]) {
      return;
    }
    this[hasPendingUpdatePromise] = false;
    this[updateResolver]();
  }
}
