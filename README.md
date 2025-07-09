# Lily Unicorns

A magical two-player platformer game where unicorns collect items and work together to reach the rainbow!

## Game Overview

Lily Unicorns is a cooperative 2D platformer featuring two unicorns with different abilities. Players must navigate through colorful levels, collect items, climb platforms, and ultimately meet at the rainbow to complete each level with a spectacular glitter celebration. The game runs in a 1280x720 window with a 16:9 aspect ratio and uses percentage-based positioning for scalable level design.

## Features

- **Two-Player Cooperative Gameplay**: Both players must work together to complete levels
- **Animated Unicorn Sprites**: Uses kaitlyn_unicorn.png sprite sheet with 15 animation frames
- **Physics-Based Movement**: Gravity, jumping, and climbing mechanics
- **Colorful Platforms**: Climbable platforms with distinct colors and transparency support
- **Interactive Trees**: Decorative trees that unicorns can stand on top of but pass through
- **Item Collection**: White items for Player 1, black items for Player 2
- **Rainbow Completion**: Level ends when both unicorns reach the rainbow
- **Glitter Effects**: Beautiful particle effects on level completion
- **YAML Level System**: Easily customizable levels through YAML configuration files
- **Background Images**: Support for custom background images per level
- **Transparent Platforms**: Platforms can have varying transparency levels
- **Multiple Levels**: Built-in levels with increasing difficulty (automatically detects all level files)

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
3. Ensure you have the `kaitlyn_unicorn.png` sprite file in the `assets/sprites/` directory
4. Run the game with `python main.py` - it will open in a 1280x720 window

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

# Background image (optional)
background:
  image: "background.png"  # Image filename (put in assets/backgrounds/ directory)
  # Set to null or omit this section if no background image

unicorns:
  unicorn1:
    x: 15       # Starting X position (percentage of screen width)
    y: null     # Starting Y position (null = screen center)
  unicorn2:
    x: 45       # Starting X position (percentage of screen width)
    y: null

platforms:
  - x: 15               # X position from left (percentage of screen width)
    y: 35               # Y position from bottom of screen (percentage of screen height)
    width: 12           # Platform width (percentage of screen width)
    height: 3           # Platform height (percentage of screen height)
    color: [255, 0, 0]  # RGB color [Red, Green, Blue]
    alpha: 255          # Transparency (0=invisible, 255=opaque) - optional, defaults to 255
  - x: 30
    y: 42
    width: 8
    height: 3
    color: [0, 255, 0]  # Green
    alpha: 128          # Semi-transparent platform
  # Add more platforms...

trees:
  - x: 10               # X position from left (percentage of screen width)
    y: 50               # Y position from bottom of screen (percentage of screen height)
    width: 8            # Tree width (percentage of screen width)
    height: 35          # Tree height (percentage of screen height)
  - x: 55
    y: 60
    width: 6
    height: 40
  # Add more trees...

white_items:
  - x: 20     # X position from left (percentage of screen width)
    y: 42     # Y position from bottom of screen (percentage of screen height)
  # Add more white items...

black_items:
  - x: 40     # X position from left (percentage of screen width)
    y: 28     # Y position from bottom of screen (percentage of screen height)
  # Add more black items...

rainbow:
  x: 25       # X position from RIGHT edge of screen (percentage of screen width)
  y: 42       # Y position from bottom of screen (percentage of screen height)
  width: 15   # Rainbow width (percentage of screen width)
  height: 28  # Rainbow height (percentage of screen height)
```

### Position System

**All coordinates are now percentage-based (0-100) for better scalability across different screen sizes.**

- **X coordinates**: Percentage of screen width from the left edge (0% = left edge, 100% = right edge)
- **Y coordinates**: Percentage of screen height from the bottom of the screen (0% = bottom, 100% = top)
- **Rainbow X coordinate**: Percentage of screen width from the RIGHT edge of the screen
- **Width and Height**: Percentage of screen dimensions (width as % of screen width, height as % of screen height)

#### Benefits of Percentage-Based Positioning:
- **Scalable**: Works perfectly across different screen sizes and resolutions
- **Consistent**: Maintains proportions regardless of window size
- **Easy to design**: Think in terms of screen portions rather than absolute pixels
- **Future-proof**: Adapts automatically to any screen resolution

### New Features

#### Background Images
- Add custom background images to any level by specifying the image filename in the `background` section
- Images should be placed in the `assets/backgrounds/` directory
- Supports common image formats (PNG, JPG, etc.)
- Images are automatically scaled to fit the screen

#### Transparent Platforms
- Use the `alpha` parameter to control platform transparency
- Values range from 0 (completely invisible) to 255 (fully opaque)
- If `alpha` is not specified, platforms default to fully opaque (255)
- Great for creating glass-like platforms or overlapping level elements

#### Interactive Trees
- Trees are decorative elements that add visual depth to levels
- Unicorns can **pass through** trees horizontally (no collision)
- Unicorns can **stand on top** of trees (top collision only)
- Trees are drawn with brown trunks and green foliage
- Use trees to create forest-like environments and additional platforms

#### Automatic Level Detection
- The game automatically detects all level files in the `levels/` directory
- No need to manually update level counts in the code
- Simply add new `levelX.yml` files and they'll be immediately available
- Level numbering can be non-sequential (e.g., level1.yml, level3.yml, level7.yml)

### Adding New Levels

1. Create a new YAML file in the `levels/` directory (e.g., `levels/level4.yml`)
2. Follow the format above
3. Add any background images to the `assets/backgrounds/` directory
4. Run the game - new levels are automatically detected and available!

## File Structure

```
lily_unicorns/
├── main.py              # Main game file
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── assets/             # Game assets
│   ├── sprites/        # Sprite files
│   │   └── kaitlyn_unicorn.png  # Unicorn sprite sheet
│   └── backgrounds/    # Background images
│       └── (place background images here)
└── levels/             # Level configuration files
    ├── level1.yml      # Level 1 configuration
    ├── level2.yml      # Level 2 configuration
    └── level3.yml      # Level 3 configuration
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
- Check that `kaitlyn_unicorn.png` is in the `assets/sprites/` directory
- Verify the `levels/` directory contains the level files

**Missing levels:**
- Verify YAML files are in the correct format
- Check that level files are in the `levels/` directory and named correctly (`level1.yml`, `level2.yml`, etc.)
- Ensure background images are in the `assets/backgrounds/` directory

**Performance issues:**
- The game runs at 60 FPS by default
- Ensure your system meets the minimum requirements

## License

This game is created for educational and entertainment purposes.

## Contributing

Feel free to create new levels, improve the code, or add new features! The YAML level system makes it easy to create and share custom levels.

Enjoy playing Lily Unicorns! 🦄✨