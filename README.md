# Prisma player

The `@prismamedia/player` package is available for external Prisma Media sites to implement a [Dailymotion video player](https://developers.dailymotion.com/sdk/player-sdk/web/) with monetization managed by CoreAds.

The following actions are performed by the package:

- Loading the Dailymotion SDK
- Creating the player and ad call in parallel

> [!NOTE]
> The player listens to the `AD_READYTOFETCH` event triggered by Dailymotion when an ad can be displayed. On each call, the monetization chain is retrieved from CoreAds and injected into the player

## Prerequisites

### CoreAds

The CoreAds script must be loaded and available on the page.

The line below initializes the CoreAds queue. It must be placed before the CoreAds script.

```js
window.coreAds.queue = window.coreAds.queue || [];
```

### Player types

Here are the available player types depending on their location on the page.

#### `Leader`

The `Leader` player is the main player of the page. It is generally located at the top of the page with autoplay enabled.

For monetization reasons, it must execute as early as possible. It should therefore not be lazy-loaded.

> [!NOTE]
> This type of player has the sound set to`0.01` by default.

#### `Widget` and `Others`

The `Widget` and `Other` players are secondary players, they can be lazy-loaded and initialized later according to your needs. Generally autoplay is disabled.

## Installation

> [!WARNING]
> The package is delivered in TypeScript only. Adapt your configuration to import `.ts` files ([see TypeScript with webpack](https://webpack.js.org/guides/typescript)).

### NPM

The `@prismamedia/player` package is hosted on the NPM public registry. Install the package on your project with the following command:

```bash
npm install @prismamedia/player --save-dev
```

```bash
yarn add @prismamedia/player --dev
```

> [!WARNING]
> Minimum Node.js version `20.18.0`

## Setup

### HTML

The video player requires an HTML `<div>` element with the following HTML attributes:

- `id`: Unique identifier
- `data-ads-core`: JSON configuration object for the player

```html
<div
  id="<unique_id>"
  data-ads-core='{
    "playerId": "<player_id>",
    "playerPosition":  "<player_position>",
    "playerVideoTitle": "<player_video_title>",
    "playerVertical": "false"
  }'
>
  <div id="<unique_id>"></div>
</div>
```

> [!IMPORTANT]
> Both HTML elements must have a **unique** `id` attribute

| Property           |               Type                | Description                           |
| ------------------ | :-------------------------------: | ------------------------------------- |
| `playerId`         |             `string`              | Dailymotion player identifier         |
| `playerPosition`   | `'Leader' \| 'Widget' \| 'Autre'` | Player position                       |
| `playerVideoTitle` |             `string`              | Video title                           |
| `playerVertical`   |             `boolean`             | Whether the player should be vertical |

### JavaScript

```js
import PrismaPlayer from '@prismamedia/player';
```

The constructor accepts the following parameters:

| Arguments       |     Type      | Default |  Required  | Description                            |
| --------------- | :-----------: | ------- | :--------: | :------------------------------------- |
| `playerElement` | `HTMLElement` | `null`  | `Required` | HTMLElement to target the player       |
| `config`        |   `Object`    | `{}`    | `Optional` | [Player configuration](#configuration) |

Initialize the library with the HTML element `[data-ads-core]`. Next, call the `init` method **after** user consent acceptance.

```js
const prismaPlayer = new PrismaPlayer(document.getElementById('playerWrapper-1'));
// Check consent before the next call
prismaPlayer.init();
```

## Configuration

The second arguments of the contructor is an optional object with the following parameters:

| Arguments      |   Type   | Default | Description                                                                                                                                  |
| -------------- | :------: | :-----: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `playerParams` | `Object` |  `{}`   | [Player parameters](https://developers.dailymotion.com/player/#player-runtime-parameters) for Dailymotion video player for all video players |
| `leaderVolume` | `number` | `0.01`  | Volume of the _leader_ player (between `0` and `1`)                                                                                          |

```javascript
const prismaPlayer = new PrismaPlayer(document.getElementById('playerWrapper-1'), {
  playerParams: {
    mute: true
  }
});
prismaPlayer.init();
```

## Events

The package exposes the following native events on the `[data-ads-core]` element. The event can expose additional data in the `e.detail` object.

| Event type          | Description                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `prismaPlayerReady` | Triggered when the Dailymotion player is ready. The player instance is passed in the event. |

Example of a listener when the player is ready.

```js
document.querySelector('#playerWrapper-1').addEventListener('prismaPlayerReady', (e) => {
  // The player instance is accessible in the `e.detail.instance` object
});
```

## Examples

### `Leader` Player

Initializing a `Leader` type player

```html
<div
  id="playerWrapper-1"
  data-ads-core='{
    "playerId": "<player_id>",
    "playerPosition": "Leader",
    "playerVertical": "false"
  }'
>
  <div id="<player-1"></div>
</div>
```

```js
const prismaPlayer = new PrismaPlayer(document.getElementById('playerWrapper-1'));
prismaPlayer.init();
```

### `Widget` Player

Initializing a `Widget` type player

```html
<div
  id="playerWrapper-1"
  data-ads-core='{
    "playerId": "<player_id>",
    "playerPosition":  "Widget",
    "playerVertical": "false"
  }'
>
  <div id="<player-1"></div>
</div>
```

```js
const player = new PrismaPlayer(document.getElementById('playerWrapper-1'));
player.init();
```

### Multiple players (`Leader` + `Widget`)

Initializing two players on the page, one `Leader` and one `Widget`

```html
<div
  id="playerWrapper-1"
  data-ads-core='{
    "playerId": "<player_id>",
    "playerPosition": "Leader",
    "playerVertical": "false"
  }'
>
  <div id="<player-1"></div>
</div>
<div
  id="playerWrapper-2"
  data-ads-core='{
    "playerId": "<player_id>",
    "playerPosition": "Widget",
    "playerVertical": "false"
  }'
>
  <div id="<player-2"></div>
</div>
```

```js
const playerLeader = new PrismaPlayer(document.getElementById('playerWrapper-1'));
playerLeader.init();

const playerWidget = new PrismaPlayer(document.getElementById('playerWrapper2'));
playerWidget.init();
```

## Package testing (`npm-pack` workflow)

> [!IMPORTANT]
> The local NPM package is intended for development only, not for production. Do not use TGZ in production.

An [npm-pack](.github/workflows/npm-pack.yml) workflow is available to test the package before its official publication on NPM.

Follow the steps below to use the workflow:

1. Trigger the workflow from the [GitHub Actions page](https://github.com/prismamedia/player/actions/workflows/npm-pack.yml)
   - Click on `Run workflow`
   - Select the branch: `<branch_name>`
   - Click on `Run workflow`

2. Retrieve the artifact
   - Click on the running job
   - Wait for the workflow to complete
   - Download the artifact (`prisma-player-pack.zip`)

3. Install the local package
   - Extract the ZIP file
   - The content contains a TGZ file (local NPM package)
   - Install the TGZ on your project:

   ```bash
   npm install <path_to_tgz_file>
   ```

4. Test and validate
   - Test the package and its features
   - If everything works correctly, the MR can be merged
   - Once merged, you can install the official version from NPM

> :bulb: More information on the [npm-pack](https://docs.npmjs.com/cli/v9/commands/npm-pack).
