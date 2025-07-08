# Lily Unicorns

A magical two-player platformer game where unicorns collect items and work together to reach the rainbow!

## Game Overview

Lily Unicorns is a cooperative 2D platformer featuring two unicorns with different abilities. Players must navigate through colorful levels, collect items, climb platforms, and ultimately meet at the rainbow to complete each level with a spectacular glitter celebration.

## Features

- **Two-Player Cooperative Gameplay**: Both players must work together to complete levels
- **Animated Unicorn Sprites**: Uses kaitlyn_unicorn.png sprite sheet with 15 animation frames
- **Physics-Based Movement**: Gravity, jumping, and climbing mechanics
- **Colorful Platforms**: Climbable platforms with distinct colors
- **Item Collection**: White items for Player 1, black items for Player 2
- **Rainbow Completion**: Level ends when both unicorns reach the rainbow
- **Glitter Effects**: Beautiful particle effects on level completion
- **YAML Level System**: Easily customizable levels through YAML configuration files
- **Multiple Levels**: Three built-in levels with increasing difficulty

## Requirements

- Python 3.7+
- pygame 2.6.0+
- PyYAML 6.0.0+

## Installation

1. Clone or download the game files
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure you have the `kaitlyn_unicorn.png` sprite file in the game directory

## How to Play

### Controls

**Player 1 (Original Unicorn):**
- Arrow Keys: Move left/right
- Up Arrow: Jump (when on ground) or climb up (when touching platform side)
- Down Arrow: Climb down (when touching platform side)

**Player 2 (Inverted Colors Unicorn):**
- WASD: Move left/right
- W: Jump (when on ground) or climb up (when touching platform side)
- S: Climb down (when touching platform side)

**Game Controls:**
- R: Reset current level
- N: Next level (only available when level is complete)
- ESC: Exit game

### Gameplay

1. **Movement**: Use your respective controls to move your unicorn around the screen
2. **Jumping**: Press jump to leap over obstacles or reach higher platforms
3. **Climbing**: When touching the side of a platform, use up/down to climb vertically
4. **Collecting Items**: 
   - Player 1 collects white items
   - Player 2 collects black items
   - Walk into items to collect them and increase your score
5. **Level Completion**: Both unicorns must stand in the rainbow simultaneously to complete the level
6. **Glitter Celebration**: Enjoy the beautiful glitter effects when you complete a level!

## Level System

The game uses YAML files to define levels. Each level specifies:
- Starting positions for both unicorns
- Platform locations, sizes, and colors
- White and black item positions
- Rainbow location and size

### Current Levels

1. **Level 1 - Getting Started**: Basic platform layout for learning the game
2. **Level 2 - Tower Challenge**: Vertical climbing challenges with tower structures
3. **Level 3 - Maze Runner**: Complex maze-like structure requiring coordination

## Creating Custom Levels

You can create your own levels by creating YAML files named `level4.yml`, `level5.yml`, etc.

### YAML Level Format

```yaml
level:
  name: "Your Level Name"
  
unicorns:
  unicorn1:
    x: 200      # Starting X position
    y: null     # Starting Y position (null = screen center)
  unicorn2:
    x: 600
    y: null

platforms:
  - x: 200              # X position from left
    y: 250              # Y position from bottom of screen
    width: 150          # Platform width
    height: 20          # Platform height
    color: [255, 0, 0]  # RGB color [Red, Green, Blue]
  # Add more platforms...

white_items:
  - x: 250    # X position from left
    y: 300    # Y position from bottom of screen
  # Add more white items...

black_items:
  - x: 500    # X position from left
    y: 200    # Y position from bottom of screen
  # Add more black items...

rainbow:
  x: 300      # X position from RIGHT edge of screen
  y: 300      # Y position from bottom of screen
  width: 200  # Rainbow width
  height: 200 # Rainbow height
```

### Position System

- **Y coordinates**: Measured from the bottom of the screen (0 = bottom, higher values = higher up)
- **Rainbow X coordinate**: Measured from the RIGHT edge of the screen
- **All other X coordinates**: Measured from the left edge of the screen

### Adding New Levels

1. Create a new YAML file (e.g., `level4.yml`)
2. Follow the format above
3. Update the `max_levels` variable in `main.py` to include your new level count
4. Run the game and your new level will be available!

## File Structure

```
lily_unicorns/
├── main.py              # Main game file
├── kaitlyn_unicorn.png  # Sprite sheet
├── level1.yml           # Level 1 configuration
├── level2.yml           # Level 2 configuration
├── level3.yml           # Level 3 configuration
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Game Mechanics

### Physics
- **Gravity**: Unicorns fall when not supported
- **Jumping**: Jump strength of -12 pixels with gravity of 0.5 pixels/frame
- **Ground Level**: 100 pixels from bottom of screen
- **Platform Collision**: Smart collision detection prevents falling through platforms

### Sprite Animation
- **15 Animation Frames**: Extracted from the sprite sheet in a 5x3 grid
- **Smooth Animation**: 0.15 frame advancement per update
- **Directional Flipping**: Sprites face the direction they're moving
- **Color Inversion**: Player 2 has inverted colors for distinction

### Items and Scoring
- **White Items**: 20x20 pixel squares for Player 1
- **Black Items**: 20x20 pixel squares for Player 2
- **Score Display**: Real-time score updates at top of screen
- **Item Removal**: Items disappear when collected

### Visual Effects
- **Glitter Particles**: Colorful particles with physics and fading
- **Rainbow Display**: Semi-transparent rainbow with 7 color bands
- **Level Complete Screen**: Celebration message with instructions

## Tips for Players

1. **Communication**: Talk to your partner to coordinate movements
2. **Teamwork**: Help each other reach difficult platforms
3. **Exploration**: Look for all items before heading to the rainbow
4. **Platform Strategy**: Use the climbing ability to reach high platforms
5. **Timing**: Both players need to be in the rainbow simultaneously

## Troubleshooting

**Game won't start:**
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check that `kaitlyn_unicorn.png` is in the same directory as `main.py`

**Missing levels:**
- Verify YAML files are in the correct format
- Check that level files are named correctly (`level1.yml`, `level2.yml`, etc.)

**Performance issues:**
- The game runs at 60 FPS by default
- Ensure your system meets the minimum requirements

## License

This game is created for educational and entertainment purposes.

## Contributing

Feel free to create new levels, improve the code, or add new features! The YAML level system makes it easy to create and share custom levels.

Enjoy playing Lily Unicorns! 🦄✨