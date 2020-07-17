var Create = function() {
  this.initialize = function initialize(self) {
      song.initialize(song.current_song, function() {
          preload_game_creation(play_game);
      });

      continue_game_even_if_focus_away(self);
  };

  function preload_game_creation(callback) {
      layout();

      user_input.register_keys();
      user_input.handle_mobile_events();
      pause.create_pause_click_area();
      emitters.initialize();

      statistics.initialize();

      callback();
  };

  function play_game() {
      song.play_song();
      song_generator.initialize(song.current_song);
      song_generator.play_next_song_note();
  };

  function continue_game_even_if_focus_away(self) {
      // the game actually stops some parts of it when
      // a player focuses away from it. It's pretty annoying
      // for this kind of game
      self.stage.disableVisibilityChange = true;
  };
};

var Emitters = function() {
	var emitter;

    this.initialize = function() {
        // Particles used when a note is hit
        emitter = game.add.emitter(0, 0, 200);
        emitter.makeParticles('small_particle');
    }

    this.particleBurst = function particleBurst(coordinates) {
        emitter.x = coordinates['x'];
        emitter.y = coordinates['y'];

        emitter.gravity = 200;
        emitter.start(true, 300, 0, 15);
    }
}

var Game = {
  preload: function() {
      preload.initialize();
  },

  create: function() {
      create.initialize(this);
  },

  update: function() {
      update.initialize();
  },

  startGame: function() {
      // Change the state to the actual game.
      this.state.start('Game');
  },
};

/******
 *
 * layout.js begin
 *
 */

function layout() {
  var number_of_splits = 3;
  var split_dimensions = get_vertical_screen_splits(number_of_splits);
  var split_middle_offset = ((split_dimensions[0]['split_end_coordinate']) / 2);
  var world_dimensions = {
      w: game.world.bounds['width'],
      h: game.world.bounds['height']
  };
  var button_dimensions = {
      'w': 85,
      'h': 75,
  };
  var tappers_vertical_position = world_dimensions['h'] - (world_dimensions['h'] / 7);

  game.physics.startSystem(Phaser.Physics.ARCADE);

  set_full_screen();

  set_background(world_dimensions);

  statistics.create_display_text();

  button_positions = calculate_button_positions(tappers_vertical_position, button_dimensions);

  tappers = create_tappers(number_of_splits, button_positions);
  invisible_tappers = create_invisible_tappers(number_of_splits, button_positions);

  adjust_button_dimensions(tappers, button_dimensions);
}

function set_full_screen() {
  const SAFE_ZONE_WIDTH = 2048;
  const SAFE_ZONE_HEIGHT = 1365;
  var lGameScale = Math.round(10000 * Math.min(game.width / SAFE_ZONE_WIDTH, game.height / SAFE_ZONE_HEIGHT)) / 10000;
  var world = game.add.group();
  world.scale.setTo(lGameScale, lGameScale);
  world.x = (game.width - SAFE_ZONE_WIDTH * lGameScale) / 2;
  world.y = (game.height - SAFE_ZONE_HEIGHT * lGameScale) / 2;
}

function set_background(world_dimensions) {
  game.stage.backgroundColor = '#182d3b';
  var background = game.add.tileSprite(0, 0, world_dimensions['w'], world_dimensions['h'], 'background');
  garbage_collector.add_object(background);
}

function get_vertical_screen_splits(number_of_splits) {
  var world_bounds = game.world.bounds;
  var split_width = world_bounds['width'] / number_of_splits;
  var splits = [];

  if (split_width > 200) {
      return get_vertical_big_screen_splits(number_of_splits);
  }

  for (var i = 0; i < number_of_splits; i++) {
      var split = {
          split_end_coordinate: (i + 1) * split_width
      };
      splits.push(split);
  }

  return splits;
}

function get_vertical_big_screen_splits() {
  var world_bounds = game.world.bounds;
  var middle_split = world_bounds['width'] / 2;
  var split_width = 150;
  var splits = [];

  splits[0] = {
      split_end_coordinate: middle_split - split_width
  };
  splits[1] = {
      split_end_coordinate: middle_split
  };
  splits[2] = {
      split_end_coordinate: middle_split + split_width
  };

  return splits;
}

function calculate_button_positions(tappers_vertical_position, button_dimensions) {
  var world_bounds = game.world.bounds;
  var middle_split = world_bounds['width'] / 2;
  var offset = button_dimensions['w'] + (button_dimensions['w'] / 3);
  var button_positions = [];

  button_positions[0] = {
      'w': middle_split - offset,
      'h': tappers_vertical_position
  }

  button_positions[1] = {
      'w': middle_split,
      'h': tappers_vertical_position
  }

  button_positions[2] = {
      'w': middle_split + offset,
      'h': tappers_vertical_position
  }

  return button_positions;
}

function create_tappers(number_of_splits, button_positions) {
  var tappers = [];

  tappers.push(
      game.add.button(button_positions[0]['w'], button_positions[0]['h'],
          'tapper_white', null, this)
  );
  tappers.push(
      game.add.button(button_positions[1]['w'], button_positions[1]['h'],
          'tapper_white', null, this)
  );
  tappers.push(
      game.add.button(button_positions[2]['w'], button_positions[2]['h'],
          'tapper_white', null, this)
  );

  for (var i = 0; i < tappers.length; i++) {
      tappers[i].anchor.set(0.5);
      tappers[i].tint = colors['white'];
      garbage_collector.add_object(tappers[i]);
  }

  return tappers;
}

function create_invisible_tappers(number_of_splits, button_positions) {
  var invisible_tappers = [];

  invisible_tappers.push(
      game.add.sprite(button_positions[0]['w'], button_positions[0]['h'])
  );
  invisible_tappers.push(
      game.add.sprite(button_positions[1]['w'], button_positions[1]['h'])
  );
  invisible_tappers.push(
      game.add.sprite(button_positions[2]['w'], button_positions[2]['h'])
  );

  for (var i = 0; i < tappers.length; i++) {
      invisible_tappers[i].anchor.set(0.5);
      // tapper radius should be bigger than the target so that
      // people don't miss it so easily
      invisible_tappers[i].width = 120;
      invisible_tappers[i].height = 150;
      garbage_collector.add_object(invisible_tappers[i]);
  }

  return invisible_tappers;
}

function adjust_button_dimensions(tappers, button_dimensions) {
  for (var i = 0; i < tappers.length; i++) {
      tappers[i].width = button_dimensions['w'];
      tappers[i].height = button_dimensions['h'];
  }
}

/******
 *
 * layout.js end
 *
 */

var NoteLanes = function() {
  var lane_1 = [];
  var lane_2 = [];
  var lane_3 = [];

  this.initialize = function initialize() {
      lane_1 = [];
      lane_2 = [];
      lane_3 = [];
  }

  this.get_lane_1 = function() {
      return lane_1;
  };

  this.get_lane_2 = function() {
      return lane_2;
  };

  this.get_lane_3 = function() {
      return lane_3;
  };

  this.set_lane_1 = function(_lane) {
      lane_1 = _lane;
  };

  this.set_lane_2 = function(_lane) {
      lane_2 = _lane;
  };

  this.set_lane_3 = function(_lane) {
      lane_3 = _lane;
  };

  this.change_note_regular_color = function change_note_regular_color() {
      change_lane_notes_color(lane_1, colors['note_colors']['green']);
      change_lane_notes_color(lane_2, colors['note_colors']['red']);
      change_lane_notes_color(lane_3, colors['note_colors']['blue']);
  };

  this.change_note_big_streak_color = function change_note_big_streak_color() {
      change_lane_notes_color(lane_1, colors['gold']);
      change_lane_notes_color(lane_2, colors['gold']);
      change_lane_notes_color(lane_3, colors['gold']);
  };

  function change_lane_notes_color(lane_balls, color) {
      _.each(lane_balls, function(ball) {
          ball.get_note().tint = color;
      });
  };
};

var Note = function() {
  var note;

  this.initialize = function initialize(lane_number) {
      var note_color = get_note_color();
      note = create_note(lane_number, button_positions);

      return this;
  };

  this.get_note = function get_note() {
      return note;
  };

  this.note_hit = function note_hit(hit_type) {
      statistics.update_statistics(true, hit_type);
  };

  this.note_miss = function note_miss() {
      note_lanes.change_note_regular_color();
      statistics.update_statistics(false);
  };

  this.destroy = function destroy() {
      var note_coords = get_center_coords(note.getBounds());
      note.destroy();
      emitters.particleBurst(note_coords);
  };

  function get_note_color(lane_number) {
      if (statistics.get_user_has_big_streak()) {
          return colors['gold'];
      } else if (lane_number == 0) {
          return colors['note_colors']['green'];
      } else if (lane_number == 1) {
          return colors['note_colors']['red'];
      } else if (lane_number == 2) {
          return colors['note_colors']['blue'];
      }
  };

  function create_note(lane_number, lane_positions) {
      var button_coordinates = get_center_coords(tappers[0].getBounds());
      var note_color = get_note_color(lane_number);
      var note = game.add.sprite(
          lane_positions[lane_number]['w'],
          button_coordinates['y'] - 600,
          'football'
      );

      garbage_collector.add_object(note);

      note.anchor.set(0.5);
      note.tint = note_color;

      game.physics.enable(note, Phaser.Physics.ARCADE);
      note.body.velocity.y = 500;
      note.body.checkCollision.down = true;

      return note;
  };
}

var Pause = function() {
  var resume_label;
  var pause_click_area;
  var quit_label;

  this.initialize = function initialize() {
      paused_label = null;
      resume_label = null;
      pause_click_area = null;
  }

  this.create_pause_click_area = function create_pause_click_area() {
      _create_pause_click_area();
  };

  function _create_pause_click_area() {
      pause_click_area = game.add.sprite(0, 0);
      pause_click_area.width = game.world.bounds['width'];
      pause_click_area.height = game.world.bounds['height'] * 0.66;
      pause_click_area.inputEnabled = true;
      pause_click_area.events.onInputUp.add(pause);

      garbage_collector.add_object(pause_click_area);
  }

  function pause() {
      var self = this;

      if (game.paused) {
          return;
      }

      pause_click_area.destroy();
      game.paused = true;
      song.pause_song();

      add_resume_button();
      add_quit_button();
      game.input.onDown.add(pause_menu_events, self);
  };

  // And finally the method that handels the pause menu
  function pause_menu_events(event, self) {
      var device_width = game.world.bounds['width'];
      var device_height = game.world.bounds['height'];
      // Only act if paused
      if (!game.paused) {
          return;
      }

      if (is_in_range(event.position, quit_label)) {
          quit_game();
      } else if (is_in_range(event.position, resume_label)) {
          resume_game();
      }
  };

  function quit_game() {
      game.paused = false;
      game_state_manager.start_menu();
  }

  function resume_game() {
      destroy_paused_menu();

      // Unpause the game
      game.paused = false;
      song.resume_song();
      _create_pause_click_area();
  }

  function add_resume_button() {
      var device_width = game.world.bounds['width'];
      var device_height = game.world.bounds['height'];
      var text_width;

      if (device_width < 500) {
          text_width = (device_width / 2);
      } else {
          text_width = 500;
      }

      var style = { font: '30px Arial', fill: '#fff' };
      resume_label = game.add.text(device_width / 2, (device_height / 2) - 40, 'Resume', style);
      resume_label.anchor.setTo(0.5, 0.5);
      resume_label.width = text_width;
      garbage_collector.add_object(resume_label);
  };

  function add_quit_button() {
      var device_width = game.world.bounds['width'];
      var device_height = game.world.bounds['height'];
      var text_width;

      if (device_width < 500) {
          text_width = device_width / 2;
      } else {
          text_width = 500;
      }

      var style = { font: '30px Arial', fill: '#fff' };
      quit_label = game.add.text(device_width / 2, (device_height / 2) + 20, 'Quit Song', style);
      quit_label.anchor.set(0.5);
      quit_label.width = text_width;
      garbage_collector.add_object(quit_label);
  };

  function destroy_paused_menu() {
      resume_label.destroy();
      quit_label.destroy();
  }
};

var Preload = function() {
  this.initialize = function initialize() {
      preload.preload_jpg();
      preload.preload_gif();
      preload.preload_png();
      preload.preload_audio();
  };

  this.preload_jpg = function preload_jpg() {
      game.load.image('background', 'assets/misc/starfield.jpg');
  };

  this.preload_gif = function preload_gif() {
      game.load.image('loading', 'assets/misc/loading_please_wait.gif');
  };

  this.preload_png = function preload_png() {
      game.load.image('football', 'assets/misc/football.png');
      game.load.spritesheet('button', 'assets/buttons/button_sprite_sheet.png', 193, 71);
      game.load.image('tapper', 'assets/misc/tapper.png');
      game.load.image('tapper_white', 'assets/misc/tapper_white.png');
      game.load.image('small_particle', 'assets/misc/particle_smallest.png');
  };

  this.preload_audio = function preload_audio() {
      var directory = 'songs/'

      // Need to load these conditionally - in mobile devices,
      // the game starts jerking if it tries to load all the music.
      // Jerking in a rythm game where timing is of utter importance is BAD!

      //  Firefox doesn't support mp3 files, so use ogg
      if (song.current_song == 'avicii-the_nights') {
          game.load.audio('avicii-the_nights', [directory + 'avicii-the_nights.mp3', directory + 'avicii-the_nights.ogg']);
      } else if (song.current_song == 'passenger-let_her_go') {
          game.load.audio('passenger-let_her_go', [directory + 'passenger-let_her_go.mp3', directory + 'passenger-let_her_go.ogg']);
      } else if (song.current_song == 'justin-bieber-sorry') {
          game.load.audio('justin-bieber-sorry', [directory + 'justin-bieber-sorry.mp3', directory + 'justin-bieber-sorry.ogg']);
      } else if (song.current_song == 'the-script-breakeven') {
          game.load.audio('the-script-breakeven', [directory + 'the-script-breakeven.mp3', directory + 'the-script-breakeven.ogg']);
      }
  };
};

var SongGenerator = function() {
  var song_data = [];

  this.initialize = function initialize(song_code) {
      song_data = init_song_data(song_code);
  };

  this.play_next_song_note = function play_next_song_note() {
      if (song_data.length == 0) {
          return;
      }

      var self = this;
      var current_note = song_data[0];
      var timing_offset = 0.27;
      game.time.events.add(current_note['timing'] + timing_offset, handle_note_creation, this, current_note);
  };

  function remove_top_note() {
      song_data.splice(0, 1);
  };

  function init_song_data(song_code) {
      var raw_notes = song_library.retrieve_song(song_code);
      var processed_notes = [];

      _.each(raw_notes, function(note) {
          processed_notes.push({
              scale: scale(note['scale']),
              timing: note['timing']
          });
      });

      return processed_notes;
  };

  function scale(index) {
      var scale = [
          [1],
          [2],
          [3],
          [1, 2],
          [1, 3],
          [2, 3],
          [1, 2, 3]
      ];

      return scale[index];
  };

  function handle_note_creation(current_note) {
      create_note_in_correct_lane(current_note);
      remove_top_note();
      this.play_next_song_note();
  };

  function create_note_in_correct_lane(current_note) {
      var self = this;
      var scales = current_note['scale'];
      _.each(scales, function(scale, index) {
          var note = new Note();
          if (scale == 1) {
              note_lanes.get_lane_1().push(note.initialize(0));
          } else if (scale == 2) {
              note_lanes.get_lane_2().push(note.initialize(1));
          } else if (scale == 3) {
              note_lanes.get_lane_3().push(note.initialize(2));
          }
      });
  };
};

var Song = function() {
  var music;
  this.current_song;

  this.initialize = function initialize(song_name, callback) {
      music = game.add.audio(song_name);
      garbage_collector.add_object(music);
      game.sound.setDecodedCallback([music], callback, this);
  };

  this.play_song = function play() {
      music.play();
  };

  this.pause_song = function pause() {
      music.pause();
  };

  this.stop_song = function stop() {
      if (music !== undefined) {
        music.stop();
      }
  };

  this.resume_song = function resume() {
      music.resume();
  };
}

var Statistics = function() {
  // numerical statistics
  var note_streak;
  var score_multiplier;
  var score;
  var granular_statistics;

  var user_has_big_streak = false;

  // labels
  var score_number_label;
  var streak_text_label;
  var streak_number_label;
  var accuracy_text_label;
  var accuracy_number_label;
  var multiplier_number_label;
  var multiplier_text_label;

  this.initialize = function initialize(options) {
      init_variables();
  };

  this.get_user_has_big_streak = function() {
      return user_has_big_streak;
  };

  function init_variables(options) {
      note_streak = 0;
      user_has_big_streak = false;
      score_multiplier = get_streak_multiplier();
      score = 0;
      granular_statistics = {
          perfect_notes: 0,
          good_notes: 0,
          bad_notes: 0,
          missed_notes: 0
      };
  };

  function get_accuracy() {
      var perfect_notes = granular_statistics['perfect_notes'];
      var good_notes = granular_statistics['good_notes'];
      var bad_notes = granular_statistics['bad_notes'];
      var missed_notes = granular_statistics['missed_notes'];
      var total = perfect_notes + good_notes + bad_notes + missed_notes;

      if (total == 0) {
          return '0';
      }

      var notes_hit = perfect_notes + good_notes + bad_notes;
      var preliminary_percentage = (notes_hit / total) * 100
      var true_percentage = preliminary_percentage.toFixed(0);

      return true_percentage;
  };

  function check_boo_message(note_streak) {
      if (note_streak >= 50) {
          display_encouraging_message("Ouch", "");
      }
  };

  function display_encouraging_message(big_message, small_message) {
      var coords = {
          x: game.world.bounds['width'] / 2,
          y: game.world.bounds['height'] / 4,
      }
      var big_style = { font: '46px Arial', fill: '#fff' }
      var small_style = { font: '12px Arial', fill: '#fff' }

      var big_encourage = game.add.text(coords['x'], coords['y'], big_message, big_style);
      var small_encourage = game.add.text(coords['x'], coords['y'] + 30, small_message, small_style);
      garbage_collector.add_object(big_encourage);
      garbage_collector.add_object(small_encourage);

      big_encourage.anchor.setTo(0.5, 0.5);
      small_encourage.anchor.setTo(0.5, 0.5);

      game.time.events.add(2000, function() {
          game.add.tween(big_encourage).to({ y: 0 }, 1000, Phaser.Easing.Linear.None, true);
          game.add.tween(big_encourage).to({ alpha: 0 }, 250, Phaser.Easing.Linear.None, true);
          game.add.tween(small_encourage).to({ y: 0 }, 1000, Phaser.Easing.Linear.None, true);
          game.add.tween(small_encourage).to({ alpha: 0 }, 250, Phaser.Easing.Linear.None, true);
      }, this);

  };

  function increase_score(hit_type) {
      score += (100 * hit_type) * get_streak_multiplier();
  };

  function get_streak_multiplier() {
      var _note_streak = note_streak;
      if (_note_streak < 20) {
          return 1;
      } else if (_note_streak < 30) {
          return 2;
      } else if (_note_streak < 40) {
          return 3;
      } else if (_note_streak < 50) {
          return 4;
      } else if (_note_streak >= 50) {
          return 8;
      } else {
          return 1;
      }
  };

  function check_display_encouraging_message(note_streak) {
      if (note_streak == 20) {
          // display_encouraging_message("2X", "That all you got?");
      } else if (note_streak == 30) {
          display_encouraging_message("3X", "Not bad");
      } else if (note_streak == 40) {
          display_encouraging_message("4X", "Killing it");
      } else if (note_streak == 50) {
          user_has_big_streak = true;
          note_lanes.change_note_big_streak_color();
          display_encouraging_message("8X", "You're on fire!");
      }
  };

  function interpret_hit_type() {
      switch (last_hit_type) {
          case 0:
              granular_statistics['missed_notes']++;
              return "Miss";
              break;
          case 1:
              granular_statistics['bad_notes']++;
              return "Bad";
              break;
          case 2:
              granular_statistics['good_notes']++;
              return "Good";
              break;
          case 3:
              granular_statistics['perfect_notes']++;
              return "Perfect";
              break;
          case 4:
              return "Godly";
              break;
          default:
              return "?"
              break;
      }
  };

  this.update_statistics = function update_statistics(user_hit_note, hit_type) {
      update_statistics_data(user_hit_note, hit_type);
      update_statistics_text_labels();
  };

  function update_statistics_data(user_hit_note, hit_type) {
      if (user_hit_note) {
          check_display_encouraging_message(note_streak);
          note_streak += 1;
          increase_score(hit_type);
          last_hit_type = hit_type;
      } else {
          check_boo_message(note_streak);
          user_has_big_streak = false;
          note_streak = 0;
          last_hit_type = 0;
      }
  };

  function update_statistics_text_labels() {
      var _note_streak = note_streak.toString();
      var _multiplier = get_streak_multiplier().toString();
      var _score = score.toString();
      var _last_hit_type = interpret_hit_type();
      var _perfect_notes = granular_statistics['perfect_notes'].toString();
      var _good_notes = granular_statistics['good_notes'].toString();
      var _bad_notes = granular_statistics['bad_notes'].toString();
      var _missed_notes = granular_statistics['missed_notes'].toString();
      var _accuracy = get_accuracy().toString();


      score_number_label.setText(_score);
      streak_number_label.setText(_note_streak);
      accuracy_number_label.setText(_accuracy + "");
      multiplier_number_label.setText(_multiplier + "x");
  };

  this.create_display_text = function create_display_text() {
      var coords = {
          x: game.world.bounds['width'] / 2,
          y: 25
      }
      var text_space = 18;
      var side_scores_space = 20;
      var space = (game.world.bounds['width'] / 2) - 30;
      var main_score_style = { font: '32px Arial', fill: '#fff' }
      var side_score_style = { font: '20px Arial', fill: '#fff' }
      var side_text_style = { font: '11px Arial', fill: '#fff' }

      score_number_label = game.add.text(coords['x'], coords['y'], '0', main_score_style);

      streak_number_label = game.add.text(coords['x'] - space, side_scores_space, '0', side_score_style);
      streak_text_label = game.add.text(coords['x'] - space, side_scores_space + text_space, 'Streak', side_text_style);


      accuracy_number_label = game.add.text(coords['x'] + space, side_scores_space, '0', side_score_style);
      accuracy_text_label = game.add.text(coords['x'] + space, side_scores_space + text_space, 'Accuracy', side_text_style);

      multiplier_number_label = game.add.text(coords['x'] - space, side_scores_space + 100, '1x', side_score_style);
      multiplier_text_label = game.add.text(coords['x'] - space, side_scores_space + 100 + text_space, 'Multiplier', side_text_style);

      garbage_collector.add_object(score_number_label);
      garbage_collector.add_object(streak_number_label);
      garbage_collector.add_object(streak_text_label);
      garbage_collector.add_object(accuracy_number_label);
      garbage_collector.add_object(accuracy_text_label);
      garbage_collector.add_object(multiplier_number_label);
      garbage_collector.add_object(multiplier_text_label);


      score_number_label.anchor.setTo(0.5, 0.5);
      streak_text_label.anchor.setTo(0.5, 0.5);
      streak_number_label.anchor.setTo(0.5, 0.5);
      accuracy_text_label.anchor.setTo(0.5, 0.5);
      accuracy_number_label.anchor.setTo(0.5, 0.5);
      multiplier_number_label.anchor.setTo(0.5, 0.5);
      multiplier_text_label.anchor.setTo(0.5, 0.5);
  };
}

var Tapper = function() {
  this.lane_1_button_press = function lane_1_button_press() {
      handle_tapper_press(note_lanes.get_lane_1(), tappers[0]);
  };

  this.lane_2_button_press = function lane_2_button_press() {
      handle_tapper_press(note_lanes.get_lane_2(), tappers[1]);
  };

  this.lane_3_button_press = function lane_3_button_press() {
      handle_tapper_press(note_lanes.get_lane_3(), tappers[2]);
  };

  function handle_tapper_press(lane_notes, tapper) {
      var tapper_coords = get_center_coords(tapper.getBounds());
      var note_index = 0;
      var note;
      var note_coords;

      if (lane_notes.length == 0) {
          handle_missed_note(null, tapper);
          return;
      }

      note = lane_notes[note_index];
      note_coords = get_center_coords(note.get_note().getBounds());

      var hit_type = get_hit_type(note_coords, tapper_coords, tapper);
      if (hit_type !== 0) {
          note.note_hit(hit_type);
          note.destroy();
          lane_notes.splice(0, 1);
      } else {
          handle_missed_note(note, tapper);
      }
  };

  this.remove_missed_notes = function remove_missed_notes(lane_notes, tapper) {
      var tapper_coords = get_center_coords(tapper.getBounds());

      _.each(lane_notes, function(note) {
          if (note === null || note === undefined) {
              return;
          }

          note_coords = get_center_coords(note.get_note().getBounds());

          exeeds_boundary = exeeds_possible_hit_boundary(note_coords, tapper_coords);
          if (exeeds_boundary) {
              handle_missed_note(note, tapper);
              lane_notes.splice(0, 1);
          } else {
              return;
          }
      });
  };

  function exeeds_possible_hit_boundary(note_coords, tapper_coords) {
      if (note_coords['y'] > (tapper_coords['y'] + 56)) {
          return true;
      }

      return false;
  };

  function get_hit_type(note_coords, tapper_coords, tapper) {
      if (note_coords['y'] >= (tapper_coords['y'] - 15) && note_coords['y'] <= (tapper_coords['y'] + 15)) {
          change_tapper_color(colors['green'], tapper);
          return 3;
      } else if (note_coords['y'] >= (tapper_coords['y'] - 36) && note_coords['y'] <= (tapper_coords['y'] + 36)) {
          change_tapper_color(colors['yellow'], tapper);
          return 2;
      } else if (note_coords['y'] >= (tapper_coords['y'] - 56) && note_coords['y'] <= (tapper_coords['y'] + 56)) {
          change_tapper_color(colors['orange'], tapper);
          return 1;
      } else {
          return 0
      }
  };

  function handle_missed_note(note, tapper) {
      if(note === null || note === undefined) {
          statistics.update_statistics(false);
          return;
      }

      note.note_miss();
      change_tapper_color(colors['red'], tapper);
  };

  function change_tapper_color(color, tapper) {
      tapper.tint = color;
  };
};

var Update = function() {

  this.initialize = function initialize() {
      remove_missed_notes();
  };
};

var UserInput = function() {
  this.register_keys = function register_keys() {
      //  Register the keys.
      this.a_key = game.input.keyboard.addKey(Phaser.Keyboard.A);
      this.s_key = game.input.keyboard.addKey(Phaser.Keyboard.S);
      this.d_key = game.input.keyboard.addKey(Phaser.Keyboard.D);
      this.j_key = game.input.keyboard.addKey(Phaser.Keyboard.J);
      this.k_key = game.input.keyboard.addKey(Phaser.Keyboard.K);
      this.l_key = game.input.keyboard.addKey(Phaser.Keyboard.L);
      this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      // Attach methods to key events
      this.a_key.onDown.add(tapper.lane_1_button_press, this);
      this.s_key.onDown.add(tapper.lane_2_button_press, this);
      this.d_key.onDown.add(tapper.lane_3_button_press, this);
      this.j_key.onDown.add(tapper.lane_1_button_press, this);
      this.k_key.onDown.add(tapper.lane_2_button_press, this);
      this.l_key.onDown.add(tapper.lane_3_button_press, this);

      // Stop the following keys from propagating up to the browser
      game.input.keyboard.addKeyCapture([
          Phaser.Keyboard.A,
          Phaser.Keyboard.S,
          Phaser.Keyboard.D,
          Phaser.Keyboard.J,
          Phaser.Keyboard.K,
          Phaser.Keyboard.L,
          Phaser.Keyboard.SPACEBAR,
          Phaser.Keyboard.LEFT,
          Phaser.Keyboard.RIGHT
      ]);
  };

  this.handle_mobile_events = function handle_mobile_events() {
      game.input.onDown.add(handle_tap_event, this);
  };

  function handle_tap_event(pointer) {
      if (is_in_range(pointer.position, invisible_tappers[0])) {
          tapper.lane_1_button_press();
      } else if (is_in_range(pointer.position, invisible_tappers[1])) {
          tapper.lane_2_button_press();
      } else if (is_in_range(pointer.position, invisible_tappers[2])) {
          tapper.lane_3_button_press();
      }
  };
};

var GameStateManager = function() {
  this.initialize = function() {
      game.state.add('main', Main);
      game.state.add('loading_screen', LoadingScreen);
      game.state.add('menu', Menu);
      game.state.add('game', Game);
      this.start_main();
  };

  this.start_splash = function start_splash() {
      state_change_actions();
      game.state.start('loading_screen');
  };

  this.start_main = function start_main() {
      state_change_actions();
      game.state.start('main');
  };

  this.start_menu = function start_menu() {
      remove_missed_notes();
      song.stop_song();
      state_change_actions();
      game.state.start('menu');
  };

  this.start_game = function start_game() {
      state_change_actions();
      game.state.start('game');
  };

  function state_change_actions() {
      reset_variables();
      garbage_collector.trash_objects();
  };

  function reset_variables() {
      tappers = [];
      invisible_tappers = [];

      note_lanes.initialize();
      pause.initialize();
  }
};

var GarbageCollector = function() {
  var created_objects = [];

  this.initialize = function() {
      created_objects = [];
  };

  this.add_object = function add_object(object) {
      // created_objects.push(object)
  };

  this.trash_objects = function trash_objects() {
      // for(var index = 0; index < created_objects.length; index++) {
      //     var object = created_objects[index];
      //     if (object !== null && object !== undefined) {
      //         object.destroy();
      //         created_objects.splice(1, index);
      //     }
      // }
      // _.each(created_objects, function(object, index) {
      //     if (object !== null && object !== undefined) {
      //         object.destroy();
      //         created_objects.splice(1, index);
      //     }
      // });
  };
};

var colors = {
  black: 0x000000,
  white: 0xFFFFFF,
  green: 0x4cff00,
  yellow: 0xccff00,
  orange: 0xffb300,
  red: 0xff3300,
  gold: 0xFFD700,
  note_colors: {
      green: 0x009933,
      red: 0xFF3300,
      blue: 0x0099ff,
  }
};

var tappers = [];
var invisible_tappers = [];

var create = new Create();
var pause = new Pause();
var preload = new Preload();
var song = new Song();
var song_generator = new SongGenerator();
var song_library = new SongLibrary();
var statistics = new Statistics();
var tapper = new Tapper();
var update = new Update();
var user_input = new UserInput();
var note_lanes = new NoteLanes();
var emitters = new Emitters();
var game_state_manager = new GameStateManager();
var garbage_collector = new GarbageCollector();
var create_menu = new CreateMenu();