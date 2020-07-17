import "./styles.css";
import Phaser from "phaser";

import Boot from "./Boot.js";
import Play from "./Play.js";

const config = {
  type: Phaser.AUTO,
  scale: {
    parent: "game-container",
    zoom: 1,
    width: 640,
    height: 480,
    autoCenter: Phaser.DOM.CENTER_BOTH,
    mode: Phaser.Scale.NONE
  },
  backgroundColor: 0x444444,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: {
        y: 50
      }
    }
  },
  scene: [Boot, Play]
};

new Phaser.Game(config);
