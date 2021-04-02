# Context menu for web apps

Accessible and highly customizable context menu for web apps

[![Published on NPM](https://img.shields.io/npm/v/@api-client/context-menu.svg)](https://www.npmjs.com/package/@api-client/context-menu)

[![Tests and publishing](https://github.com/api-client/context-menu/actions/workflows/deployment.yml/badge.svg)](https://github.com/api-client/context-menu/actions/workflows/deployment.yml)

Features:

- Executing logic per command (via the `execute` lifecycle function)
- Enabling and disabling a command (via the `enabled` property or a lifecycle function)
- Hiding a command (via the `visible` property or a lifecycle function)
- Dynamic control of the `enabled` and `visible` values
- Nesting menus
- Positioning menu(s) according to the screen position
- a11y - all keyboard shortcuts are available and announced
- Simplified DOM events interface for actions handling

## Usage

### Installation

```sh
npm install --save @api-client/context-menu
```

### Using the menu

The best way to explore what's supported and possible is to check out the demo pages prepared for various use cases.

To initialize the library you provide a reference to the element that is the root of the event handlers. It can be also the document.body or window if you are building a context menu for the entire application.

The second step is to define commands that are rendered in the menu.

### Registering commands

Use the `registerCommands()` function to register commands to be rendered in the menu. Previously registered commands are removed from the menu after calling this function.

```javascript
const instance = new ContextMenu(document.body);
instance.registerCommands([...]);
```

### Specifying command target

Command target defined in which context the command should be included into the menu. All commands are required to define a target (or a list of targets). Simply put, the `target` property on the command definition is the HTML/SVG node name (lowercase) combined with all CSS class names, separated by the period `.` sign. For example `div.menu-item.selected`.
The ContextMenu support two special targets: `all` amd `root`. All means the command is always rendered regardless of the click context. The `root` keyword means that the click ocurred on the `workspace` element passed as the argument in the constructor.

### Defining commands

The simples command definition would be the following:

```javascript
const command = {
  target: 'all',
  label: 'Choose me!',
};
```

Each command must have the `target` and the `label` properties defined. Label is rendered as is (after basic sanitization, so no HTML tags inside).

#### Command item title

When you specify the `title` property it is used in the `title` attribute of the menu list item.

```javascript
const command = {
  target: 'all',
  label: 'Choose me!',
  title: 'Does extra cool things when selected.',
};
```

#### Command id

By default the library generates an `id` for each passed command. Ids are used internally to recognize the command.
You may pass your own id, which is any string, to create own logic around selection. The id is reported back in the lifecycle callbacks and the final execute function/event.

```javascript
const command = {
  target: 'span.menu-item.quit',
  label: 'Quit',
  id: 'application:quit', // this can be any string
};
```

#### Command icon

To pass an icon you need to create an instance of `SVGTemplateResult` from the `lit-html` library which contains the full definition of the SVG element with the icon. See `src/Icons.js` for an example of creating such an icon.
You can use our helper function `iconWrapper()` to create such an icon.

```javascript
import { iconWrapper } from '@api-client/context-menu';
import { svg } from 'lit-html';

const command = {
  target: 'span.text',
  label: 'Copy',
  // icon by Material Design
  icon: iconWrapper(svg`<path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>`),
};
```

#### Executing the command

Simplest way to execute a command when selection occurs is to define the `execute` lifecycle function in the configuration object. This function is called only once per menu instance. At the moment of execution of this function
the menu is already destroyed.

```javascript
const command = {
  target: 'button.paste',
  label: 'Paste',
  execute: (ctx) => {
    // ctx.id - the id of the command.
    // ctx.store - instance of a Map shared between all lifecycle functions. Store here any arbitrary data.
    // ctx.target - the click event target
    // ctx.root - the `workspace` argument used to initialize the library
    // ctx.clickPoint - the {x,y} position of the original click that triggered the context menu.
    // ctx.item - The instance of the MenuItem corresponding to user selection. In nested menus this is the finally accepted option by the user.
    // ctx.selectedSubcommand - Only set when this action was triggered by the sub-menu. It is the index of the MenuItem that was selected. Note, separators are included in the index.
    // ctx.customData - only when the menu was initialized through a custom event, see below
    return true;
  },
};
```

#### Controlling menu entry visibility

You can configure a menu item to be always invisible by setting the `visible` property to `false`. Then you can programmatically change this value when needed by accessing the `commands` property on the instance of `ContextMenu` class.

Note, you need to call `requestUpdate()` on the currently rendered menu to update the visibility. You can access the element via the `currentMenu` property of the instance of `ContextMenu` class.

```javascript
const command = {
  target: 'span.menu-item.install',
  label: 'Install update',
  visible: false,
};

// ...
contextMenu.commands[1].visible = true;
contextMenu.currentMenu.requestUpdate();
```

You can also declare a function as the `visible` property to dynamically set the visibility of the menu command when the menu is created. The `visible` function sets the context argument with few properties allowing you to determine whether the item should be visible. This function should returns boolean value and `true` when the command should be rendered in the menu.

Note, this function is called each time the menu element is updated, meaning when it state change. This function can be called multiple times for the item.

```javascript
const command = {
  target: 'span.menu-item.install',
  label: 'Install update',
  visible: (ctx) => {
    // ctx.id - the id of the command.
    // ctx.store - instance of a Map shared between all lifecycle functions. Store here any arbitrary data.
    // ctx.target - the click event target
    // ctx.root - the `workspace` argument used to initialize the library
    // ctx.customData - only when the menu was initialized through a custom event, see below
    return true;
  },
};
```

#### Disabling an item

For a better usability sometimes it is better to disable an item instead of hiding it. You should control visibility when the command would never be rendered in some specific context, not controlled by the `target` property. Instead prefer to disable the item. An example of such use case is the `Paste` command. It should always be rendered, even when there is no item in the "memory" to paste. You would use the `enabled` property to control this behavior.

The `enabled` property can be a boolean value (default it is set to `true`) or a function called when the menu entry is rendered. Note, this function is called each time the menu element is updated, meaning when it state change. This function can be called multiple times for the item.

```javascript
const command = {
  target: 'button.paste',
  label: 'Paste',
  enabled: (ctx) => {
    // ctx.id - the id of the command.
    // ctx.store - instance of a Map shared between all lifecycle functions. Store here any arbitrary data.
    // ctx.target - the click event target
    // ctx.root - the `workspace` argument used to initialize the library
    // ctx.customData - only when the menu was initialized through a custom event, see below
    return true;
  },
};
```

##### Copy and paste example

```javascript
const commands = [
  {
    target: 'div.target',
    label: 'Copy',
    title: 'Copy the object',
    execute: (args) => {
      const { id } = args.target.dataset; // assuming the `div.target` element has `data-id` attribute.
      args.store.set('copy', id); // keep the copy info in the menu's store.
    }
  },
  {
    target: 'root',
    label: 'Paste',
    title: 'Paste the value',
    execute: (args) => {
      const copyId = args.store.get('copy'); // retrieve the value from the store
      args.store.delete('copy'); // clean up after yourself
    },
    enabled: (args) => {
      const copyId = args.store.get('copy'); // retrieve the value from the store
      return !!copyId; // only enabled when there is a copy value.
    },
  },
];
```

#### Nested menus

You can nest another menu by declaring a list of `children` inside a command. The `children` property is the same definition of commands as when initializing the menu. When `children` property is declared then when the user click or hover over the menu item a sub-menu is rendered with the declared children.

You can pass the `execute` function to each child but sometimes it is not practical. In this case set the `execute` callback function on the parent menu item. This function will be called whenever a child item is selected. You can use the `id` property (manually declared in the configuration) to differentiate between the items. You can also use the `selectedSubcommand` property to use command index instead.

```javascript
const commands = [
  {
    target: 'root',
    label: 'Font size',
    execute: (ctx) => {
      // ctx.item is the MenuItem related to the user selection.
      console.log('Selected font size:', ctx.item.id);
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
];
```

#### DOM event selection

You may not declare `execute` function at all on any of the menu items. In such case you can listen to the `execute` custom event dispatched by the library. The detail object contains the same arguments as the `execute`'s function argument. This event is dispatched each time a selection is made.

```javascript
const instance = new ContextMenu(document.body);
instance.registerCommands([...]);
instance.addEventListener('execute', (e) => {
  const ctx = e.detail;
  // ctx.id - the id of the command.
  // ctx.store - instance of a Map shared between all lifecycle functions. Store here any arbitrary data.
  // ctx.target - the click event target
  // ctx.root - the `workspace` argument used to initialize the library
  // ctx.clickPoint - the {x,y} position of the original click that triggered the context menu.
  // ctx.item - The instance of the MenuItem corresponding to user selection. In nested menus this is the finally accepted option by the user.
  // ctx.selectedSubcommand - Only set when this action was triggered by the sub-menu. It is the index of the MenuItem that was selected. Note, separators are included in the index.
  // ctx.customData - only when the menu was initialized through a custom event, see below
});
```

#### Triggering the menu and custom data

To trigger the menu at any given position on the screen, dispatch the `custommenu` custom event on the `workspace`. Set the parameters on the `detail` object:

```javascript
const workspace = document.body;
const instance = new ContextMenu(workspace);
instance.registerCommands([...]);

// ...

workspace.dispatchEvent(new CustomEvent('custommenu', {
  detail: {
    name: 'custom', // this is the target property set on the commands.
    x: workspace.offsetLeft + 100, // position the menu 100px to the right of the beginning of the workspace
    y: workspace.offsetTop + 100, // position the menu 100px lower than the top of the workspace
    customData: { test: true, }, // any data, optional.
  },
}));
```

## Development

```sh
git clone https://github.com/@api-client/har
cd arc-har
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```

## License

<!-- API Components © 2021 by Pawel Psztyc is licensed under CC BY 4.0. -->

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><span property="dct:title">API Components</span> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/jarrodek">Pawel Psztyc</a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"></a></p>
