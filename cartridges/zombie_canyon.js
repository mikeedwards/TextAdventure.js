// === Game Data ===
var gameData = {
	commandCounter : 0,
	gameOver : false,
	introText : 'You are at the bottom of the canyon. You have been at the bottom of this canyon for weeks.',
	outroText : 'Ok, so, that\'s it. See ya.',
	player : {
		currentLocation : 'Clouds',
		inventory : {},
		lightSource : false,
    currentWeapon: null
	},
	map : {
		'CanyonFloor' : {
			firstVisit : true,
			displayName : 'Canyon Floor',
			description : 'You are standing on the canyon floor. It is dusty and flat. You are surrounded by ledges that are out of reach. Also, there are zombies.',
			interactables : {
				zombies : { look : 'The usual zombies.' }
			},
			items : {
				pistol : {
					displayName : 'pistol',
					description : 'A pretty basic pistol. Like, the first pistol someone would ever have, number 1. A starter pistol. But it shoots bullets.',
					use : function(command){
					  return usePistol(command.object);
					  },
          wield : function(command){
					  gameData.player.currentWeapon = command.subject;
            return "You're holding the pistol";
          },
					quantity : 1,
					hidden : false,
				}
			},
			exits : {
        up: {
          displayName: 'up the stack of zombies to the ledge',
          destination: 'Ledge',
          reveal: function () {
            const bodyCount = gameData.map['CanyonFloor'].exits.up.bodyCount;
            if (bodyCount === 2) {
              gameData.map['CanyonFloor'].interactables.zombies.look = 'A bunch of moving zombies and some others stacked against the ledge.'
            }
            if (bodyCount === 1) {
              gameData.map['CanyonFloor'].interactables.zombies.look = 'A few moving zombies and a bunch stacked against the ledge.'
            }
            if (bodyCount === 0) {
              gameData.map['CanyonFloor'].interactables.zombies.look = 'A lot of zombies stacked all the way up to the top of the ledge.'
            }
          },
          bodyCount: 3,
          hidden: true
        }
      },
      updateLocation: function (command) {
        if (this.exits.up.bodyCount === 2) {
          this.description = 'You are standing on the canyon floor. The ledges are somewhat out of reach. There are some moving zombies and a few dead zombies up against the ledge.'
        }
        if (this.exits.up.bodyCount === 1) {
          this.description = 'You are standing on the canyon floor. The ledges are barely out of reach, if you stood on all the dead zombies.'
        }
        if (this.exits.up.bodyCount === 0 && this.exits.up.hidden) {
          this.exits.up.hidden = false;
          this.description = 'You are standing on the canyon floor.';
          return 'Hunh. It seems like there might finally be a way out of here.'
        }
      }
		},
		'Ledge' : {
			firstVisit : true,
			displayName : 'Ledge',
			description : 'The ledge is like the canyon floor. It is slightly higher, with a narrow path above your head. There are zombies here.',
      interactables : {
        zombies : { look : 'The usual zombies.' }
      },
			exits : {
        up : {
          displayName : 'up',
          destination : 'Ridge',
          hidden: true,
          bodyCount: 1,
        },
				down : {
					displayName : 'down',
					destination : 'CanyonFloor'
				}
			},
      updateLocation: function (command) {
        if (this.exits.up.bodyCount === 0 && this.exits.up.hidden) {
          this.exits.up.hidden = false;
          this.description = 'This ledge has a pile of inanimate highly-climbable zombies.';
          return 'Things are looking up.'
        }
      }
		},
    'Ridge' : {
      firstVisit : true,
      displayName: 'Narrow path',
      description : 'You are on a narrow path. Zombies shuffle in front of a deep gap ahead of you.',
      interactables : {
        zombies : { look : 'The usual zombies.' }
      },
      exits : {
        north : {
          displayName : 'north',
          destination : 'Wall',
          hidden: true,
          bodyCount: 2,
        },
        down : {
          displayName : 'down',
          destination : 'Ledge'
        }
      },
      updateLocation: function (command) {
        if (this.exits.north.bodyCount === 1) {
          this.description = 'You are on a narrow path. Zombies shuffle in front of a shallow gap ahead of you. Other zombies have fallen into the gap and remain motionless.'
        }
        if (this.exits.north.bodyCount === 0 && this.exits.north.hidden) {
          this.exits.north.hidden = false;
          this.description = 'You are on a narrow path. A once-deep gap ahead of you is stuffed with zombie bits.'
          return 'The way ahead is clear.'
        }
      }
    },
		'Wall' : {
			firstVisit : true,
      displayName: 'Wall',
			description : 'You are at the end of a path facing a wall. A wall made of writhing zombies all stuck in place. It feels damp here somehow.',
      interactables : {
        zombies : { look : 'The usual zombies, but in wall form.' }
      },
      items : {
        shotgun : {
          displayName : 'shotgun',
          description : 'A shotgun, no two ways about it. Double barreled. A good second weapon. Lots of shells are strapped to it.',
          use : function(command){
            return useShotgun(command.object);
          },
          wield : function(command){
            gameData.player.currentWeapon = command.subject;
            return "You're holding the shotgun";
          },
          quantity : 1,
          hidden : false,
          loaded: false,
        },
      },
      exits : {
        north : {
          displayName : 'north',
          destination : 'OffShore',
          hidden: true,
          bodyCount: 4,
        },
        south : {
          displayName : 'south',
          destination : 'Ridge',
          hidden: false,
        }
      },
      updateLocation: function (command) {
        if (this.exits.north.bodyCount < 4 && this.exits.north.bodyCount > 0 ) {
          this.description = 'You are at the end of a path facing a dam. A dam made of writhing zombies all mostly stuck in place. A trickle of water is flowing from it.'
        }
        if (this.exits.north.bodyCount < 4 && this.displayName === 'Wall') {
          this.displayName = 'Dam';
          return "This wall of zombies is now... leaking water. Maybe \"wall\" is a bad description. Dam? Yes, that's better. It's a dam. Leaky dam."
        }
        if (this.exits.north.bodyCount === 0 && this.exits.north.hidden) {
          this.displayName = 'Lake';
          this.interactables = {};
          this.exits.south.hidden = true;
          this.exits.north.hidden = false;
          this.description = 'You are floating in a lake. There used to be a dam here. You know what you did.';
          return "Water and zombie viscera flood past you. You float up, up, up until the water stops rushing."
        }
      }
    },
    'OffShore':{
      firstVisit : true,
      displayName: 'Off the Lake Shore',
      description : 'You are floating off the lake\'s shore, a strong current is pushing you back. There are zombies splashing around.',
      interactables : {
        zombies : { look : 'The usual aquatic zombies.' }
      },
      exits : {
        north : {
          displayName : 'north',
          destination : 'Shore',
          hidden: true,
          bodyCount: 6,
        },
        south : {
          displayName : 'south',
          destination : 'Lake',
          hidden: false,
        }
      },
      updateLocation: function (command) {
        if (this.exits.north.bodyCount < 6 && this.exits.north.bodyCount > 0 ) {
          this.description = 'You are floating off the lake\'s shore, a strong current is pushing you back. There are some zombies splashing and others bobbing together silently.'
        }
        if (this.exits.north.bodyCount === 0 && this.exits.north.hidden) {
          this.exits.north.hidden = false;
          this.description = 'You are standing on a dock made of zombies, just off the shore of the lake.';
          interactables = {
            zombies : { look : 'The usual zombies, in dock form.' }
          };
          return "The dispatched zombies are all floating up to the surface, neatly lining up all the way to the edge of the lake."
        }
      }
    },
    'Shore':{
      firstVisit : true,
      displayName: 'Lake Shore',
      description : 'You are on the lake\'s rough and rocky shore. Slippery boulders surround you on all sides. A large group of zombies is milling around something nearby.',
      interactables : {
        zombies : { look : 'The usual zombies, milling about something.' }
      },
      items : {
        launcher : {
          displayName : 'rocket launcher',
          description : 'A rocket launcher, you can triple check that. Three times the fun of lesser weapons. Lots of rockets are strapped to it.',
          use : function(command){
            return useLauncher(command.object);
          },
          wield : function(command){
            gameData.player.currentWeapon = command.subject;
            return "You're holding the launcher.";
          },
          quantity : 1,
          hidden : true,
          loaded: false,
          targeted: false,
        },
      },
      exits : {
        west : {
          displayName : 'west',
          destination : 'LakeHouse',
          hidden: true,
          bodyCount: 8,
        },
        east : {
          displayName : 'east',
          destination : 'LightHouse',
          hidden: true,
        },
        south : {
          displayName : 'south',
          destination : 'OffShore',
          hidden: false,
        }
      },
      updateLocation: function (command) {
        if (this.exits.west.bodyCount <=3 && this.exits.west.bodyCount > 0 && this.items.launcher.hidden ) {
          this.description = 'You are on the lake\'s rough and rocky shore. Slippery boulders conveniently interspersed with some less slippery zombie parts surround you on all sides.'
          this.items.launcher.hidden = false;
          interactables = {
            zombies : { look : 'The usual zombies.' }
          };
          return "The zombies have dispersed from the thing, whatever it is."
        }
        if (this.exits.west.bodyCount === 0 && this.exits.west.hidden) {
          this.exits.west.hidden = false;
          this.exits.east.hidden = false;
          this.description = 'Your are on the lake\'s shore. Rocks and zombie remnants form a walkable surface along the shoreline.';
          interactables = {
            zombies : { look : 'The usual zombies on the rocks.' }
          };
          return "Rocks and zombies have combined into a something you can actually get across."
        }
      }
    },
    'LightHouse': {
      firstVisit: true,
      displayName: 'Light House',
      description: 'You stand on a jetty under a light house. It\'s locked and boarded up. Don\'t bother. Zombies have crowded around the path back up the shore. They appear to be debating something.',
      interactables: {
        zombies: {
          look: function () {
            return 'The usual literate zombies.';
          }
        }
      },
      items: {
        book: {
          displayName: 'book',
          description: "Meaningful Choices by Cedric Emerson",
          quantity : 1,
          hidden : false,
          interactions: {
            read: function() {
              return "The author lists rules for playing games with people. He seems to be important.";
            }
          }
        }
      },
      exits : {
        west : {
          displayName : 'west',
          destination : 'Shore',
          bodyCount: 6,
          hidden: true,
        },
      },
      updateLocation: function (command) {
        if (this.exits.west.bodyCount < 6 && this.exits.west.bodyCount > 0 ) {
          this.description = 'You stand on a jetty under a light house that\'s not worth exploring. Zombies appear to be seriously debating something, even with the ones you have blasted apart.'
        }
        if (this.exits.west.bodyCount === 0 && this.exits.west.hidden) {
          this.exits.west.hidden = false;
          this.description = 'You stand on a jetty under a light house. There is no other point here. Extinguished zombies line the shore, frozen in fierce debate.';
          interactables = {
            zombies : { look : 'The usual retired zombies.' }
          };
        }
      }
    },
    'LakeHouse': {
      firstVisit: true,
      displayName: 'Lake House',
      description: 'You are in the driveway of a lake house undergoing renovations. A horde of zombies are perched on the railing of the deck above. You are standing on a wooden plank.',
      interactables: {
        zombies: {
          look: function () {
            return 'The usual zombies.';
          }
        },
        house: {
          look: function () {
            return "It's locked or boarded up or whatever. Look, just do the puzzle.";
          }
        },
        plank: {
          look: function () {
            return 'The plank is, however improbably, propped up at its midpoint by a stack of paint buckets. You stand on the low end.';
          }
        }
      },
      exits : {
        east : {
          displayName : 'east',
          destination : 'Shore',
          hidden: false,
        },
        up : {
          displayName : 'up',
          destination : 'Deck',
          hidden: true,
          bodyCount: 6,
        },
      },
      updateLocation: function (command) {
        if (this.exits.up.bodyCount < 6 && this.exits.up.bodyCount > 0 ) {
          this.description = 'You are slightly above the driveway of a lake house undergoing renovations. A diminished horde of zombies are perched on the railing of the deck above. You are standing on a wooden plank, opposite some fallen zombies.'
        }
        if (this.exits.up.bodyCount === 0 && this.exits.up.hidden) {
          this.exits.up.hidden = false;
          this.description = 'You are elevated halfway between the driveway and deck of a lake house undergoing renovations. You are standing on a wooden plank, opposite many fallen zombies.'
          interactables = {
            zombies : { look : 'The usual counterweighting zombies.' }
          };
        }
      }
    },
    'Deck': {
      firstVisit: true,
      displayName: 'Lake House Deck',
      description: 'You are on the deck. Zombies are lined up against the locked French doors.',
      interactables: {
        zombies: {
          look: function () {
            return 'The usual zombies.';
          }
        }
      },
      exits : {
        west : {
          displayName : 'west',
          destination : 'Den',
          hidden: true,
          bodyCount: 3,
        },
        down : {
          displayName : 'down',
          destination : 'LakeHouse',
          hidden: false,
        },
      },
      updateLocation: function (command) {
        if (this.exits.west.bodyCount < 3 && this.exits.west.bodyCount > 0 ) {
          this.description = 'You are on the deck. Some zombies are lined up against the locked but cracked French doors. Others are up against it in a pile. In pieces.'
        }
        if (this.exits.west.bodyCount === 0 && this.exits.west.hidden) {
          this.exits.west.hidden = false;
          this.description = 'You are on the deck. Zombie remains are up against the remnants of French doors.'
        }
      }
    },
    'Den': {
      firstVisit: true,
      displayName: 'Lake House Den',
      description: 'You are in the den. It is a beautiful, well-lit space. Usually. Zombies keep walking past the skylight above, blocking the natural light.',
      interactables: {
        zombies: {
          look: function () {
            return 'The usual zombies.';
          }
        }
      },
      exits : {
        up : {
          displayName : 'up',
          destination : 'WidowsWalk',
          hidden: true,
          bodyCount: 3,
        },
        east : {
          displayName : 'east',
          destination : 'Deck',
          hidden: false,
        },
      },
      updateLocation: function (command) {
        if (this.exits.up.bodyCount < 3 && this.exits.up.bodyCount > 0 ) {
          this.description = 'You are in the den. It is a somewhat beautiful, well-lit space, with a wrecked skylight. Zombies keep walking on the roof, except for those that crashed through down to the floor here.'
        }
        if (this.exits.up.bodyCount === 0 && this.exits.up.hidden) {
          this.exits.up.hidden = false;
          this.description = 'You are in the den. It was a beautiful, well-lit space, until all these zombie crashed through into a pile leading up to the wrecked skylight.'
        }
      }
    },
    'WidowsWalk': {
      firstVisit: true,
      displayName: "Widow's Walk",
      description: "You on the widow's walk along the house's roof line, looking out over a ton of spoilers. Never mind those. Zombies are whizzing past, dropping down from the sky.",
      interactables: {
        zombies: {
          look: function () {
            return 'The usual zombies.';
          }
        }
      },
      exits : {
        up : {
          displayName : 'up',
          destination : 'Clouds',
          hidden: true,
          bodyCount: 9,
        },
        down : {
          displayName : 'down',
          destination : 'Den',
          hidden: false,
        },
      },
      updateLocation: function (command) {
        if (this.exits.up.bodyCount < 9 && this.exits.up.bodyCount > 6 ) {
          this.description = "You on the widow's walk along the house's roof line, and the zombies are really starting to pile up. More are dropping down from the sky all the time.";
        }
        if (this.exits.up.bodyCount < 6 && this.exits.up.bodyCount > 3 ) {
          this.description = "You on the widow's walk along the house's roof line, and the zombies are in a huge pile, straining the rafters. More are dropping down from the sky all the time.";
        }
        if (this.exits.up.bodyCount < 3 && this.exits.up.bodyCount > 0 && !this.exits.down.hidden ) {
          this.exits.down.hidden = true;
          this.description = "You on the wreckage of the widow's walk along the house's former roof line, but it's now an enormous pile of zombies stretching up to the sky now. And yet more are dropping down from the sky all the time.";
          return "You hear a great creaking and then a rumbling beneath your feet.";
        }
        if (this.exits.up.bodyCount === 0 && this.exits.up.hidden) {
          this.exits.up.hidden = false;
          this.description = "You on the wreckage of the widow's walk along the house's former roof line, but it's now an enormous pile of zombies stretching up to the sky now and into the clouds.";
        }
      }
    },
    'Clouds': {
      firstVisit: true,
      displayName: "In the Clouds",
      description: "You in the clouds, standing on the summit of a pile of zombies. A few zombies are flying around in what appear to be spacesuits.",
      items: {
        nirph : {
          displayName : 'nirph',
          description : 'The label reads "Neuro-Intergalactic Recoilless Parametric Honker." NIRPH for short. Infinite ammo orbits around it.',
          use : function(command){
            return useNirph(command.object);
          },
          wield : function(command){
            gameData.player.currentWeapon = command.subject;
            return "You're holding the nirph. Or it's holding you. It's confusing.";
          },
          quantity : 1,
          hidden : true,
        },
        spacesuit : {
          displayName : 'spacesuit',
          description : 'The surprisingly intact spacesuit from a fallen zombie. Who knows how that thing got it.',
          quantity : 1,
          hidden : true,
        },
      },
      interactables: {
        zombies: {
          look: function () {
            return 'The usual flying zombies.';
          }
        },
        clouds: {
          look: function () {
            return 'Fluffy white aggregations of partially glaciated water particles.';
          }
        }
      },
      exits : {
        up : {
          displayName : 'up',
          destination : 'Clouds',
          hidden: true,
          bodyCount: 9,
        },
        down : {
          displayName : 'down',
          destination : 'Den',
          hidden: false,
        },
      },
      updateLocation: function (command) {
        if (this.exits.up.bodyCount < 9 && this.exits.up.bodyCount > 6 ) {
          this.description = "You on the widow's walk along the house's roof line, and the zombies are really starting to pile up. More are dropping down from the sky all the time.";
        }
        if (this.exits.up.bodyCount < 6 && this.exits.up.bodyCount > 3 ) {
          this.description = "You on the widow's walk along the house's roof line, and the zombies are in a huge pile, straining the rafters. More are dropping down from the sky all the time.";
        }
        if (this.exits.up.bodyCount < 3 && this.exits.up.bodyCount > 0 && !this.exits.down.hidden ) {
          this.exits.down.hidden = true;
          this.description = "You on the wreckage of the widow's walk along the house's former roof line, but it's now an enormous pile of zombies stretching up to the sky now. And yet more are dropping down from the sky all the time.";
          return "You hear a great creaking and then a rumbling beneath your feet.";
        }
        if (this.exits.up.bodyCount === 0 && this.exits.up.hidden) {
          this.exits.up.hidden = false;
          this.description = "You on the wreckage of the widow's walk along the house's former roof line, but it's now an enormous pile of zombies stretching up to the sky now and into the clouds.";
        }
      }
    },
  }
};

// === Game Actions ===
var gameActions = {
  help : function(game, command, consoleInterface){
    return "Shoot the zombies. That's the answer. That's always the answer.";
  },
  dance : function(game, command, consoleInterface){
    return "Dancing!";
  },
  shoot: function(game, command, consoleInterface) {
    if (!gameData.player.currentWeapon) {
      return "With what? A stern glance? You gotta draw a weapon. A shooty weapon."
    }
    return consoleInterface(game, {action: 'use', subject: gameData.player.currentWeapon, object: command.subject}).message;
  },
  load: function(game, command, consoleInterface) {
    if (!gameData.player.currentWeapon) {
      return "Draw a weapon first."
    }
    if (gameData.player.inventory[gameData.player.currentWeapon].loaded === undefined) {
      return "You don't need to load that."
    }
    gameData.player.inventory[gameData.player.currentWeapon].loaded = true;
    return "The " + gameData.player.currentWeapon + " is locked and loaded.";
  },
  target: function(game, command, consoleInterface) {
    if (!gameData.player.currentWeapon) {
      return "Draw a weapon first."
    }
    if (gameData.player.inventory[gameData.player.currentWeapon].targeted === undefined) {
      return "You don't need to target that. It's not very complicated."
    }
    gameData.player.inventory[gameData.player.currentWeapon].targeted = true;
    return "The " + gameData.player.currentWeapon + " has been carefully targeted. Don't look down the barrel.";
  },
  kiss: function(game, command, consoleInterface) {
    if (!gameData.player.currentWeapon) {
      return "Draw a weapon first."
    }
    if (gameData.player.inventory[gameData.player.currentWeapon].kissed === undefined) {
      return "You don't need to kiss that. It's not tempermental or affectionate."
    }
    gameData.player.inventory[gameData.player.currentWeapon].kissed = true;
    return "The " + gameData.player.currentWeapon + " appreciates the kiss and is ready to do your bidding.";
  },
  '1': function(game, command, consoleInterface) {
    return consoleInterface(game, {action: 'wield', subject:'pistol'}).message;
  },
  '2': function(game, command, consoleInterface) {
    return consoleInterface(game, {action: 'wield', subject:'shotgun'}).message;
  },
  '3': function(game, command, consoleInterface) {
    return consoleInterface(game, {action: 'wield', subject:'launcher'}).message;
  },
  '4': function(game, command, consoleInterface) {
    return consoleInterface(game, {action: 'wield', subject:'nirph'}).message;
  }
};

// === Necessary Exports ===
module.exports.gameData = gameData;
module.exports.gameActions = gameActions;

// === Helper Functions ===
function end(){
	if(gameData.player.lightSource){
		gameData.map['Heaven'].description = 'You found your way out.';
	} else {
		gameData.map['Heaven'].description = 'Okay, it\s over. Still dark, though.';
	}
	gameData.gameOver = true;
}

function usePistol(object){
  if (gameData.player.currentWeapon !== 'pistol') {
    return "Gotta draw that pistol, pardner."
  }
  if (!(object === 'zombies' || object === 'zombie')) {
    return "What, you just want to blast that pistol wherever? Do you have a real target?";
  }
  var response = 'You hear a load bang.';
  const location = gameData.map[gameData.player.currentLocation];
  Object.keys(location.exits).forEach(function(name) {
    const exit = location.exits[name];
    if (exit.bodyCount) {
      exit.bodyCount = Math.max(exit.bodyCount - 1, 0);
      response += ' You hear a squishy sound.';
      if (exit.reveal) {
        exit.reveal();
      }
    }
  });
  return response;
}

function useShotgun(object){
  if (gameData.player.currentWeapon !== 'shotgun') {
    return "Pull out the shottie if you wanna use it."
  }
  if (!gameData.player.inventory['shotgun'].loaded) {
    return "You have to load the shotgun. There are plenty of shells."
  }
  if (!(object === 'zombies' || object === 'zombie')) {
    return "Hey, this thing will make a mess like that. Try doing something useful.";
  }
  var response = 'You hear a very load bang.';
  gameData.player.inventory['shotgun'].loaded = false;
  const location = gameData.map[gameData.player.currentLocation];
  Object.keys(location.exits).forEach(function(name) {
    const exit = location.exits[name];
    if (exit.bodyCount) {
      exit.bodyCount = Math.max(exit.bodyCount - 2, 0);
      response += ' You hear a leaky gurgle.';
      if (exit.reveal) {
        exit.reveal();
      }
    }
  });
  return response;
}

function useLauncher(object){
  if (gameData.player.currentWeapon !== 'launcher') {
    return "You really are going to want to be holding that before you mess with it."
  }
  if (!gameData.player.inventory['launcher'].loaded) {
    return "You have to load the launcher. There are plenty of rockets."
  }
  if (!gameData.player.inventory['launcher'].targeted) {
    return "You have to target the launcher. You don't just blast things from hip."
  }
  if (!(object === 'zombies' || object === 'zombie')) {
    return "You need to be really specific with this thing. Don't just go blowing up whatever.";
  }
  var response = 'You hear a huge roar.';
  gameData.player.inventory['launcher'].loaded = false;
  gameData.player.inventory['launcher'].targeted = false;
  const location = gameData.map[gameData.player.currentLocation];
  Object.keys(location.exits).forEach(function(name) {
    const exit = location.exits[name];
    if (exit.bodyCount) {
      exit.bodyCount = Math.max(exit.bodyCount - 3, 0);
      response += ' You hear a violent splash.';
      if (exit.reveal) {
        exit.reveal();
      }
    }
  });
  return response;
}

function useNirph(object){
  if (gameData.player.currentWeapon !== 'nirph') {
    return "First, produce the nirph from its netherrealm. Wield the mighty whazzit!"
  }
  if (!gameData.player.inventory['nirph'].loaded) {
    return "You have to load the nirph. You can use the plentiful ammunition or you own soul."
  }
  if (!gameData.player.inventory['nirph'].targeted) {
    return "You have to target the nirph if you don't want to create a universe-ending singularity."
  }
  if (!gameData.player.inventory['nirph'].kissed) {
    return "You have to kiss the nirph. Like you mean it. Seriously. It'll know if you don't mean it."
  }
  if (!(object === 'zombies' || object === 'zombie')) {
    return "Don't fire the nirph at anything you don't want sent beyond the pale of consciousness and longing.";
  }
  var response = 'You hear an ethereal choir and the fritz of a bug zapper.';
  gameData.player.inventory['nirph'].loaded = false;
  gameData.player.inventory['nirph'].targeted = false;
  gameData.player.inventory['nirph'].kissed = false;
  const location = gameData.map[gameData.player.currentLocation];
  Object.keys(location.exits).forEach(function(name) {
    const exit = location.exits[name];
    if (exit.bodyCount) {
      exit.bodyCount = Math.max(exit.bodyCount - 4, 0);
      response += ' You also hear the reversal of matter, a pure voiding of timespace.';
      if (exit.reveal) {
        exit.reveal();
      }
    }
  });
  return response;
}
