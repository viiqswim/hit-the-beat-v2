var Menu = {
  preload: function() {
      // Load all the needed resources for the menu.
      preload_jpg();
      preload_png();

      function preload_jpg() {
          game.load.image('background', 'assets/misc/dark_background_2.jpg');
      }

      function preload_png() {
          game.load.image('button_easy', 'assets/game_buttons/button_easy_2.png');
          game.load.image('button_medium', 'assets/game_buttons/button_medium_2.png');
          game.load.image('button_hard', 'assets/game_buttons/button_hard_2.png');
      }
  },

  create: function() {
      create_menu.initialize();
  },

  update: function() {
      // something
  },
};
