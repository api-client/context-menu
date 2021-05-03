import { css } from 'lit-element';

export const MenuElementStyles = css`
:host {
  display: block;
  position: fixed;
  font-size: 1rem;
  color: var(--context-menu-color, #000);
  user-select: none;
  z-index: 100;
  --anypoint-item-icon-width: 32px;
  --anypoint-item-min-height: 32px;
}

.listbox {
  padding: 2px 0;
  min-width: 160px;
  border-radius: 4px;
  box-shadow: var(--context-menu-shadow, var(--anypoint-dropdown-shadow));
  background-color: var(--context-menu-background-color, var(--primary-background-color));
}

.item {
  margin: 8px 0;
}

.item.disabled {
  color: var(--context-menu-disabled-color, var(--disabled-text-color, #9E9E9E));
  pointer-events: none;
}

.hidden,
[hidden] {
  display: none;
}

.menu-divider {
  height: 1px;
  background-color: var(--context-menu-divider-color, rgba(0, 0, 0, 0.12));
  margin: 8px 0 8px 40px;
}

.menu-section-label {
  font-size: var(--context-menu-section-label-font-size, 0.9rem);
  font-weight: var(--context-menu-section-label-font-weight, 500);
  margin: 16px 8px 8px 44px;
  text-transform:  var(--context-menu-section-label-text-transform, uppercase);
}

.menu-icon {
  width: 20px;
  height: 20px;
}

.sub-menu-icon {
  margin-left: auto;
  padding-left: 12px;
  width: 24px;
  height: 24px;
}

.svg-wrapper {
  pointer-events: none; 
  display: block; 
  width: 100%; 
  height: 100%; 
  fill: currentColor;
}
`;
