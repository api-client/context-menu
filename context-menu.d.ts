import { ContextMenuElement } from './src/ContextMenuElement';

declare global {
  interface HTMLElementTagNameMap {
    "context-menu": ContextMenuElement;
  }
}
