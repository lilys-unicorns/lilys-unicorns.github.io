# Lily Unicorns - JavaScript Version

A magical two-player platformer game where unicorns collect items and work together to reach the rainbow!

## Running the Game

### Option 1: Local Web Server (Recommended)

To avoid CORS issues and enable JSON file loading, use the included Python server:

```bash
# Run the server
python3 server.py

# Or make it executable and run
chmod +x server.py
./server.py
```

The server will:
- Start on `http://localhost:8000`
- Automatically open your browser
- Serve files with proper no-cache headers
- Allow real-time JSON file editing

### Option 2: Direct File Opening

You can also open `index.html` directly in your browser, but:
- JSON files won't load due to CORS restrictions
- Game will use embedded level data from `levels-data.js`
- Changes to `.json` files won't be reflected

## Game Features

### Controls
- **Player 1**: Arrow keys to move, Up to jump/climb
- **Player 2**: WASD to move, W to jump/climb
- **R**: Reset level
- **N**: Next level (when complete)
- **ESC**: Return to menu
- **F5**: Reload level JSON (when using server)

### Gameplay
- Two-player cooperative platformer
- Collect white items (Player 1) and black items (Player 2)  
- Both players must reach the rainbow to complete the level
- Enjoy glitter effects on level completion!

## Level Editing

### Using the Server
1. Edit JSON files in the `levels/` directory
2. Press **F5** in the game to reload the level
3. Changes are reflected immediately

### Using Direct File Opening
1. Edit the `levels-data.js` file
2. Refresh the browser page
3. Changes are reflected on page reload

## File Structure

```
lily_unicorns/
├── index.html           # Main game page
├── game.js             # Game engine
├── levels-data.js      # Embedded level data (CORS fallback)
├── server.py           # Local development server
├── levels/             # JSON level files
│   ├── level1.json
│   ├── level2.json
│   └── level3.json
└── assets/
    └── sprites/
        └── kaitlyn_unicorn.png
```

## Level Format

Levels use percentage-based positioning (0-100) for scalability:

```json
{
  "level": {"name": "Level Name"},
  "unicorns": {
    "unicorn1": {"x": 15, "y": null},
    "unicorn2": {"x": 45, "y": null}
  },
  "platforms": [
    {
      "x": 15, "y": 35,
      "width": 12, "height": 3,
      "color": [255, 0, 0], "alpha": 255
    }
  ],
  "trees": [{"x": 10, "y": 50, "width": 8, "height": 35}],
  "clouds": [{"x": 25, "y": 85, "width": 15, "height": 20, "alpha": 150}],
  "white_items": [{"x": 20, "y": 42}],
  "black_items": [{"x": 40, "y": 21}],
  "rainbow": {"x": 15, "y": 30, "width": 25, "height": 25}
}
```

## Technical Details

- **Canvas**: 1280x720 (16:9 aspect ratio)
- **Sprite Animation**: 15 frames from sprite sheet
- **Physics**: Gravity, jumping, collision detection
- **Rendering**: HTML5 Canvas with 60 FPS
- **Level System**: JSON-based with embedded fallback

## Troubleshooting

**CORS Errors**: Use the Python server instead of opening the file directly

**Sprite Not Loading**: Ensure `assets/sprites/kaitlyn_unicorn.png` exists

**JSON Changes Not Reflected**: 
- With server: Press F5 in game
- Without server: Edit `levels-data.js` and refresh browser

**Port Already in Use**: The server will show an error if port 8000 is busy

## Development

The game automatically detects the environment:
1. First tries to load JSON files (server environment)
2. Falls back to embedded data (file:// environment)
3. Uses default level as last resort

Console logs show which data source is being used for debugging.

Enjoy playing Lily Unicorns! 🦄✨