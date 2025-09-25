# Prisma player

Le package `@prismamedia/player` est à disposition des sites Prisma Media externe souhaitant implémenter un player vidéo [Dailymotion](https://developers.dailymotion.com/sdk/player-sdk/web/) avec la monétisation géré par CoreAds.

Les actions ci-dessous sont réalisés par le package :

- Chargement du SDK Dailymotion
- Création du player et appel publicitaire en parallèle

> [!NOTE]
> Le player écoute l'événement `AD_READYTOFETCH` déclenché par Dailymotion quand une publicité peut être affichée. A chaque appel, la chaine de monétisation est récupérée auprès de CoreAds et injecté dans le player

## Pré-requis

### CoreAds

Le script CoreAds doit est chargé et disponible sur la page.

La ligne ci-dessous initialise la file d'attente de CoreAds. Elle doit être placé en amont de l'appel au script CoreAds.

```js
window.coreAds.queue = window.coreAds.queue || [];
```

### Types de player

Voici les types de player disponible en fonction de leur emplacement sur la page.

#### `Leader`

Le player `Leader` est le player principal de la page. Il est généralement situé en haut de la page avec la lecture automatique activé (`autoplay`).

Pour des raisons de monétisation celui-ci doit s'exécuter le plus tôt possible. Il ne doit donc pas être lazyloadé.

#### `Widget` et `Autres`

Les players `Widget` et `Autre` sont des players secondaires, ils peuvent être lazyloadés et initialisés plus tard en fonction de vos besoins. Généralement la lecture automatique est désactivée.

## Installation

> [!WARNING]
> Le package est livré en TypeScript uniquement. Adaptez votre configuration pour importer des fichiers `.ts` ([voir TypeScript avec webpack](https://webpack.js.org/guides/typescript)).

### NPM

Le package `@prismamedia/player` est hébergé sur le registre NPM. Installez le package sur votre projet avec la commande suivante :

```bash
npm install @prismamedia/player --save-dev
```

```bash
yarn add @prismamedia/player --dev
```

> [!WARNING]
> Version minimale de Node.js `20.18.0`

## Mise en place

### HTML

Le player vidéo nécessite un élément HTML `<div>` avec les attributs HTML ci-dessous :

- `id`: Identifiant unique
- `data-ads-core`: Objet JSON de configuration du player

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
> Les deux éléments HTML doivent avoir un attribut `id` **unique**

| Propriété          |               Type                | Description                       |
| ------------------ | :-------------------------------: | --------------------------------- |
| `playerId`         |             `string`              | Identifiant du player Dailymotion |
| `playerPosition`   | `'Leader' \| 'Widget' \| 'Autre'` | Position du player                |
| `playerVideoTitle` |             `string`              | Titre de la vidéo                 |
| `playerVertical`   |             `boolean`             | Si le player doit être vertical   |

### JavaScript

L'initialisation d'un player Dailymotion avec la monétisation géré par CoreAds implique les actions suivantes :

- Chargement du SDK Dailymotion
- Une fois le SDK disponible, les étapes ci-dessous sont réalisées en parallèle pour optimiser les performances
  - Récupération de la chaine de monétisation auprès de CoreAds
  - Création du player Dailymotion
- Au succès de l'étape précédente, la chaine de monétisation est injectée dans le player
- Le player écoute l'événement `AD_READYTOFETCH` déclenché par Dailymotion quand une publicité peut être affichée. A chaque appel, la chaine de monétisation est récupérée auprès de CoreAds et injecté dans le player
- Lors de la récupération de la chaine de monétisation, plusieurs informations sur l'emplacement publicitaire sont transmis à CoreAds

```js
import PrismaPlayer from '@prismamedia/player';

const prismaPlayer = new PrismaPlayer(document.getElementById('playerWrapper-1'));
prismaPlayer.init();
```

## Evénements

Le package expose les événements natifs ci-dessous sur l'élément `[data-ads-core]`. L'événement peut exposer des données additionnelles dans l'objet `e.detail`.

| Type de l'événement | Description                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| `prismaPlayerReady` | Déclenché lorsque le player Dailymotion est prêt. L'instance du player est transmise dans l'événement. |

Exemple d'un écouteur quand le player est prêt.

```js
document.querySelector('#playerWrapper-1').addEventListener('prismaPlayerReady', (e) => {
  // L'instance du player est accessible dans l'objet `e.detail.instance`
});
```

## Exemples

### Player `Leader`

Initialisation d'un player de type `Leader`

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

### Player `Widget`

Initialisation d'un player de type `Widget`

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

### Plusieurs player (`Leader` + `Widget`)

Initialisation de deux players sur la page, un `Leader` et un `Widget`

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
