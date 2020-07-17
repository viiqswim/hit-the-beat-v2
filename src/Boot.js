import Phaser from "phaser";

class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: "Boot"
    });
  }

  preload() {
    this.load.setBaseURL("http://labs.phaser.io");

    this.load.image("sky", "assets/skies/space3.png");
    this.load.image("logo", "assets/sprites/phaser3-logo.png");
    this.load.image("red", "assets/particles/red.png");

    // game.load.image('stars', 'assets/images/stars.jpg');
    // game.load.image('loading', 'assets/images/loading.png');
    // game.load.image('brand', 'assets/images/logo.png');
    // game.load.script('polyfill', 'lib/polyfill.js');
    // game.load.script('utils', 'lib/utils.js');
  }

  create() {
    this.scene.start("Play");
    // this.start_pointers();
    // game_state_manager.start_splash();
  }
}

// game_state_manager.initialize();

export default Boot;
