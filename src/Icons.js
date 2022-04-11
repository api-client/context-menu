import { svg } from 'lit';

/** @typedef {import('lit').SVGTemplateResult} SVGTemplateResult */

/**
 * Wraps icon into an SVG container.
 * @param {SVGTemplateResult} tpl Icon definition
 * @param {number=} width The icon view box width
 * @param {number=} height The icon view box height
 * @return {SVGTemplateResult} Complete SVG icon definition
 */
export const iconWrapper = (tpl, width=24, height=24) => svg`<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" focusable="false" class="svg-wrapper">${tpl}</svg>`;
export const arrowRight = iconWrapper(svg`<path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 17l5-5-5-5v10z"/>`);
export const check = iconWrapper(svg`<path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>`);
