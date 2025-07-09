import pygame
import sys
import random
import math
import yaml
import os
import glob

pygame.init()


def invert_surface_colors(surface):
    """Create a new surface with inverted colors"""
    inverted = surface.copy()

    # Get dimensions
    width, height = inverted.get_size()

    # Lock the surface for pixel access
    inverted.lock()

    # Invert each pixel
    for x in range(width):
        for y in range(height):
            # Get the pixel color
            r, g, b, a = inverted.get_at((x, y))

            # Invert RGB values (keep alpha unchanged)
            new_r = 255 - r
            new_g = 255 - g
            new_b = 255 - b

            # Set the new color
            inverted.set_at((x, y), (new_r, new_g, new_b, a))

    # Unlock the surface
    inverted.unlock()

    return inverted


def get_max_levels():
    """Automatically detect the number of level files in the levels folder"""
    try:
        # Get all level*.yml files in the levels directory
        level_files = glob.glob("levels/level*.yml")
        
        # Extract level numbers and find the maximum
        level_numbers = []
        for file_path in level_files:
            # Extract filename without path and extension
            filename = os.path.basename(file_path)
            # Extract number from filename (e.g., "level3.yml" -> "3")
            if filename.startswith("level") and filename.endswith(".yml"):
                try:
                    level_num = int(filename[5:-4])  # Remove "level" and ".yml"
                    level_numbers.append(level_num)
                except ValueError:
                    continue
        
        # Return the highest level number, or 1 if no levels found
        return max(level_numbers) if level_numbers else 1
    except Exception as e:
        print(f"Error detecting level files: {e}")
        return 3  # Fallback to default


def load_level(level_file):
    """Load level configuration from YAML file"""
    try:
        with open(level_file, "r") as f:
            level_data = yaml.safe_load(f)
        return level_data
    except FileNotFoundError:
        print(f"Level file {level_file} not found!")
        return None
    except yaml.YAMLError as e:
        print(f"Error parsing YAML file: {e}")
        return None


def load_background_image(image_path):
    """Load and scale background image to fit screen"""
    global background_image
    if image_path:
        # Check if it's a full path or just a filename
        if not os.path.dirname(image_path):
            # Just a filename, prepend assets/backgrounds/
            full_path = os.path.join("assets", "backgrounds", image_path)
        else:
            full_path = image_path
        
        if os.path.exists(full_path):
            try:
                background_image = pygame.image.load(full_path).convert()
                background_image = pygame.transform.scale(background_image, (screen_width, screen_height))
                return True
            except pygame.error as e:
                print(f"Error loading background image {full_path}: {e}")
                background_image = None
                return False
    
    background_image = None
    return False


def draw_ground(screen):
    """Draw the ground at the bottom of the screen"""
    ground_height_pixels = percentage_to_pixels(GROUND_HEIGHT_PERCENT, screen_height)
    ground_rect = pygame.Rect(0, screen_height - ground_height_pixels, screen_width, ground_height_pixels)
    pygame.draw.rect(screen, GROUND_COLOR, ground_rect)


def percentage_to_pixels(percentage_value, screen_dimension):
    """Convert percentage value to pixel coordinates"""
    if isinstance(percentage_value, (int, float)) and 0 <= percentage_value <= 100:
        return int((percentage_value / 100.0) * screen_dimension)
    else:
        # If it's not a percentage, assume it's already pixels (backwards compatibility)
        return int(percentage_value)


def create_level_objects(level_data, screen_width, screen_height):
    """Create game objects from level data"""
    objects = {
        "platforms": pygame.sprite.Group(),
        "trees": pygame.sprite.Group(),
        "clouds": pygame.sprite.Group(),
        "white_items": pygame.sprite.Group(),
        "black_items": pygame.sprite.Group(),
        "rainbow": None,
        "unicorn1_start": None,
        "unicorn2_start": None,
    }

    # Load background image if specified
    if "background" in level_data:
        background_path = level_data["background"].get("image", None)
        if background_path:
            load_background_image(background_path)

    # Create platforms
    if "platforms" in level_data:
        for platform_data in level_data["platforms"]:
            alpha = platform_data.get("alpha", 255)  # Default to fully opaque
            
            # Convert percentage-based positioning to pixels
            x_pos = percentage_to_pixels(platform_data["x"], screen_width)
            y_pos = percentage_to_pixels(platform_data["y"], screen_height)
            width = percentage_to_pixels(platform_data["width"], screen_width)
            height = percentage_to_pixels(platform_data["height"], screen_height)
            
            platform = Platform(
                x_pos,
                screen_height - y_pos,  # Convert from bottom-relative to top-relative
                width,
                height,
                tuple(platform_data["color"]),
                alpha,
            )
            objects["platforms"].add(platform)

    # Create trees
    if "trees" in level_data:
        for tree_data in level_data["trees"]:
            # Convert percentage-based positioning to pixels
            x_pos = percentage_to_pixels(tree_data["x"], screen_width)
            y_pos = percentage_to_pixels(tree_data["y"], screen_height)
            width = percentage_to_pixels(tree_data["width"], screen_width)
            height = percentage_to_pixels(tree_data["height"], screen_height)
            
            tree = Tree(
                x_pos,
                screen_height - y_pos,  # Convert from bottom-relative to top-relative
                width,
                height,
            )
            objects["trees"].add(tree)

    # Create clouds
    if "clouds" in level_data:
        for cloud_data in level_data["clouds"]:
            # Convert percentage-based positioning to pixels
            x_pos = percentage_to_pixels(cloud_data["x"], screen_width)
            y_pos = percentage_to_pixels(cloud_data["y"], screen_height)
            width = percentage_to_pixels(cloud_data["width"], screen_width)
            height = percentage_to_pixels(cloud_data["height"], screen_height)
            
            # Get optional alpha value
            alpha = cloud_data.get("alpha", 180)  # Default to semi-transparent
            
            cloud = Cloud(
                x_pos,
                screen_height - y_pos,  # Convert from bottom-relative to top-relative
                width,
                height,
                alpha,
            )
            objects["clouds"].add(cloud)

    # Create white items
    if "white_items" in level_data:
        for item_data in level_data["white_items"]:
            x_pos = percentage_to_pixels(item_data["x"], screen_width)
            y_pos = percentage_to_pixels(item_data["y"], screen_height)
            
            item = Item(
                x_pos,
                screen_height - y_pos,  # Convert from bottom-relative to top-relative
                (255, 255, 255),
            )
            objects["white_items"].add(item)

    # Create black items
    if "black_items" in level_data:
        for item_data in level_data["black_items"]:
            x_pos = percentage_to_pixels(item_data["x"], screen_width)
            y_pos = percentage_to_pixels(item_data["y"], screen_height)
            
            item = Item(
                x_pos,
                screen_height - y_pos,  # Convert from bottom-relative to top-relative
                (0, 0, 0),
            )
            objects["black_items"].add(item)

    # Create rainbow
    if "rainbow" in level_data:
        rainbow_data = level_data["rainbow"]
        
        # Convert percentage-based positioning to pixels
        x_pos = percentage_to_pixels(rainbow_data["x"], screen_width)
        y_pos = percentage_to_pixels(rainbow_data["y"], screen_height)
        width = percentage_to_pixels(rainbow_data["width"], screen_width)
        height = percentage_to_pixels(rainbow_data["height"], screen_height)
        
        objects["rainbow"] = Rainbow(
            screen_width - x_pos,  # Convert from right-relative to left-relative
            screen_height - y_pos,  # Convert from bottom-relative to top-relative
            width,
            height,
        )

    # Get unicorn starting positions
    if "unicorns" in level_data:
        unicorns_data = level_data["unicorns"]
        if "unicorn1" in unicorns_data:
            u1_data = unicorns_data["unicorn1"]
            x_pos = percentage_to_pixels(u1_data["x"], screen_width)
            y_pos = (
                screen_height // 2
                if u1_data["y"] is None
                else screen_height - percentage_to_pixels(u1_data["y"], screen_height)
            )
            objects["unicorn1_start"] = (x_pos, y_pos)
            
        if "unicorn2" in unicorns_data:
            u2_data = unicorns_data["unicorn2"]
            x_pos = percentage_to_pixels(u2_data["x"], screen_width)
            y_pos = (
                screen_height // 2
                if u2_data["y"] is None
                else screen_height - percentage_to_pixels(u2_data["y"], screen_height)
            )
            objects["unicorn2_start"] = (x_pos, y_pos)

    return objects


# Set window size with 16:9 aspect ratio
WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720  # 1280/720 = 16:9 ratio

# Ground configuration
GROUND_HEIGHT_PERCENT = 14  # Height of ground as percentage of screen height
GROUND_COLOR = (139, 69, 19)  # Brown color (RGB)

screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
screen_width, screen_height = WINDOW_WIDTH, WINDOW_HEIGHT
pygame.display.set_caption("Lily Unicorns")

clock = pygame.time.Clock()

# Initialize fonts for different uses
font = pygame.font.Font(None, 36)
title_font = pygame.font.Font(None, 96)  # Large pixelized font for title
menu_font = pygame.font.Font(None, 48)   # Medium font for menu items

# Global background image
background_image = None

# Game states
MENU = 0
PLAYING = 1
game_state = MENU

class MenuSystem:
    def __init__(self):
        self.selected_option = 0
        self.menu_options = ["PLAY", "EXIT"]
        self.title = "LILY'S UNICORNS"
        
        # Colors
        self.bg_color = (50, 150, 50)  # Same as game background
        self.title_color = (255, 100, 255)  # Bright magenta
        self.selected_color = (255, 255, 100)  # Bright yellow
        self.normal_color = (255, 255, 255)  # White
        
        # Animation for title
        self.title_pulse_timer = 0
        
    def draw_pixelized_text(self, surface, text, font, color, x, y, center=False):
        """Draw text with pixelized effect"""
        # Create the text surface
        text_surface = font.render(text, False, color)  # False = no antialiasing for pixelized look
        
        # Add pixelized border effect
        border_color = (0, 0, 0)  # Black border
        border_surface = font.render(text, False, border_color)
        
        # Get text rectangle
        text_rect = text_surface.get_rect()
        if center:
            text_rect.center = (x, y)
        else:
            text_rect.x = x
            text_rect.y = y
        
        # Draw border (slightly offset)
        for dx in [-2, -1, 0, 1, 2]:
            for dy in [-2, -1, 0, 1, 2]:
                if dx != 0 or dy != 0:
                    border_rect = text_rect.copy()
                    border_rect.x += dx
                    border_rect.y += dy
                    surface.blit(border_surface, border_rect)
        
        # Draw main text
        surface.blit(text_surface, text_rect)
        
        return text_rect
    
    def update(self):
        """Update menu animations"""
        self.title_pulse_timer += 0.1
    
    def handle_input(self, event):
        """Handle menu input"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP:
                self.selected_option = (self.selected_option - 1) % len(self.menu_options)
            elif event.key == pygame.K_DOWN:
                self.selected_option = (self.selected_option + 1) % len(self.menu_options)
            elif event.key == pygame.K_RETURN or event.key == pygame.K_SPACE:
                if self.selected_option == 0:  # PLAY
                    return "PLAY"
                elif self.selected_option == 1:  # EXIT
                    return "EXIT"
        return None
    
    def draw(self, surface):
        """Draw the menu"""
        # Clear screen
        surface.fill(self.bg_color)
        
        # Draw background clouds for atmosphere
        self.draw_background_clouds(surface)
        
        # Draw title with pulsing effect
        title_scale = 1.0 + 0.1 * math.sin(self.title_pulse_timer)
        title_color = (
            int(255 * (0.8 + 0.2 * math.sin(self.title_pulse_timer * 0.7))),
            int(100 * (0.8 + 0.2 * math.sin(self.title_pulse_timer * 0.5))),
            int(255 * (0.8 + 0.2 * math.sin(self.title_pulse_timer * 0.3)))
        )
        
        # Scale title font
        scaled_font = pygame.font.Font(None, int(96 * title_scale))
        
        self.draw_pixelized_text(
            surface, 
            self.title, 
            scaled_font, 
            title_color,
            screen_width // 2, 
            screen_height // 3,
            center=True
        )
        
        # Draw menu options
        menu_y_start = screen_height // 2 + 50
        for i, option in enumerate(self.menu_options):
            color = self.selected_color if i == self.selected_option else self.normal_color
            
            # Add selection indicator
            if i == self.selected_option:
                indicator = ">> " + option + " <<"
            else:
                indicator = option
            
            self.draw_pixelized_text(
                surface,
                indicator,
                menu_font,
                color,
                screen_width // 2,
                menu_y_start + i * 80,
                center=True
            )
        
        # Draw instructions
        instruction_text = "USE ARROW KEYS TO NAVIGATE, ENTER TO SELECT"
        self.draw_pixelized_text(
            surface,
            instruction_text,
            font,
            (200, 200, 200),
            screen_width // 2,
            screen_height - 80,
            center=True
        )
    
    def draw_background_clouds(self, surface):
        """Draw some background clouds for atmosphere"""
        # Create a few static clouds for the menu background
        cloud_positions = [
            (screen_width * 0.15, screen_height * 0.2, screen_width * 0.2, screen_height * 0.1),
            (screen_width * 0.7, screen_height * 0.15, screen_width * 0.15, screen_height * 0.08),
            (screen_width * 0.1, screen_height * 0.7, screen_width * 0.18, screen_height * 0.09),
            (screen_width * 0.8, screen_height * 0.75, screen_width * 0.12, screen_height * 0.06),
        ]
        
        for x, y, w, h in cloud_positions:
            # Create a simple cloud for menu background
            cloud = Cloud(int(x), int(y), int(w), int(h), 100)  # More transparent
            surface.blit(cloud.image, (x, y))

# Initialize menu system
menu_system = MenuSystem()


class Platform(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height, color, alpha=255):
        super().__init__()
        self.image = pygame.Surface((width, height), pygame.SRCALPHA)
        self.image.fill((*color, alpha))
        self.rect = pygame.Rect(x, y, width, height)
        self.color = color
        self.alpha = alpha


class Tree(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height):
        super().__init__()
        self.image = pygame.Surface((width, height), pygame.SRCALPHA)
        self.rect = pygame.Rect(x, y, width, height)
        
        # Calculate trunk dimensions and position
        trunk_width = int(width * 0.2)
        trunk_height = int(height * 0.6)  # Taller trunk
        trunk_x = (width - trunk_width) // 2
        trunk_y = height - trunk_height
        
        # Calculate foliage dimensions and position
        crown_radius = int(width * 0.4)
        crown_color = (34, 139, 34)
        trunk_color = (101, 67, 33)
        
        # Position foliage to connect with trunk top
        foliage_center_x = width // 2
        foliage_center_y = trunk_y + crown_radius // 2  # Connect to trunk top
        
        # Draw tree trunk (brown) - draw first so foliage overlaps
        pygame.draw.rect(self.image, trunk_color, (trunk_x, trunk_y, trunk_width, trunk_height))
        
        # Draw tree crown (green circles for foliage) - overlapping for natural look
        # Main foliage circle
        pygame.draw.circle(self.image, crown_color, (foliage_center_x, foliage_center_y), crown_radius)
        
        # Additional smaller circles for fuller, more natural look
        pygame.draw.circle(self.image, crown_color, 
                         (foliage_center_x - crown_radius // 2, foliage_center_y + crown_radius // 3), 
                         crown_radius // 2)
        pygame.draw.circle(self.image, crown_color, 
                         (foliage_center_x + crown_radius // 2, foliage_center_y + crown_radius // 3), 
                         crown_radius // 2)
        
        # Top small circle for tree top
        top_circle_y = foliage_center_y - crown_radius // 2
        pygame.draw.circle(self.image, crown_color, 
                         (foliage_center_x, top_circle_y), 
                         crown_radius // 3)
        
        # Calculate the actual visual top of the tree
        # The highest point is the top of the top circle minus its radius
        visual_tree_top_y = top_circle_y - crown_radius // 3
        
        # Top collision area (positioned at the actual visual tree top)
        self.top_collision_height = int(height * 0.15)  # Small collision area at the very top
        # Position collision rect at the visual tree top
        collision_rect_y = y + visual_tree_top_y
        self.top_collision_rect = pygame.Rect(x, collision_rect_y, width, self.top_collision_height)
        
        # Store the actual tree top position for collision detection
        self.visual_tree_top = y + visual_tree_top_y


class Cloud(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height, alpha=180):
        super().__init__()
        self.image = pygame.Surface((width, height), pygame.SRCALPHA)
        self.rect = pygame.Rect(x, y, width, height)
        
        # Generate realistic cloud using noise-based approach
        self.generate_realistic_cloud(width, height, alpha)
    
    def simple_noise(self, x, y, seed=1):
        """Simple pseudo-noise function for cloud generation"""
        # Create a pseudo-random value based on position and seed
        n = int(x) * 374761393 + int(y) * 668265263 + seed * 1013904223
        n = (n << 13) ^ n
        return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0)
    
    def fractal_noise(self, x, y, octaves=4, persistence=0.5, scale=0.01):
        """Generate fractal noise by combining multiple octaves"""
        value = 0.0
        amplitude = 1.0
        frequency = scale
        max_value = 0.0
        
        for i in range(octaves):
            value += self.simple_noise(x * frequency, y * frequency, i + 1) * amplitude
            max_value += amplitude
            amplitude *= persistence
            frequency *= 2.0
        
        return value / max_value
    
    def generate_realistic_cloud(self, width, height, alpha):
        """Generate a realistic cloud using noise-based techniques"""
        # Create a pixel array for the cloud
        cloud_data = []
        
        # Base cloud shape using noise
        for py in range(height):
            row = []
            for px in range(width):
                # Normalize coordinates to cloud center
                nx = (px - width/2) / (width/2)
                ny = (py - height/2) / (height/2)
                
                # Create elliptical falloff for cloud shape
                distance = math.sqrt(nx*nx + ny*ny)
                falloff = max(0, 1 - distance)
                
                # Generate noise value
                noise_value = self.fractal_noise(px, py, octaves=3, persistence=0.6, scale=0.03)
                
                # Combine noise with falloff for cloud density
                cloud_density = (noise_value * 0.5 + 0.5) * falloff
                
                # Create wispy edges
                if cloud_density > 0.3:
                    cloud_density = min(1.0, cloud_density * 1.5)
                else:
                    cloud_density *= 0.5
                
                row.append(cloud_density)
            cloud_data.append(row)
        
        # Render the cloud to the surface
        for py in range(height):
            for px in range(width):
                density = cloud_data[py][px]
                if density > 0.1:  # Only draw pixels with sufficient density
                    # Create varying shades of white/gray for depth
                    color_intensity = int(255 * (0.85 + 0.15 * density))
                    
                    # Add slight color variations for realism
                    base_color = min(255, color_intensity + random.randint(-10, 10))
                    
                    # Calculate alpha based on density
                    pixel_alpha = int(alpha * density)
                    
                    if pixel_alpha > 0:
                        color = (base_color, base_color, base_color, pixel_alpha)
                        self.image.set_at((px, py), color)
        
        # Add some additional wispy details
        self.add_wispy_details(width, height, alpha)
    
    def add_wispy_details(self, width, height, alpha):
        """Add wispy details to make clouds more realistic"""
        # Add some streaky details
        for _ in range(width // 20):
            # Random starting point
            start_x = random.randint(0, width - 1)
            start_y = random.randint(0, height - 1)
            
            # Create wispy streaks
            streak_length = random.randint(width // 8, width // 4)
            angle = random.uniform(0, 2 * math.pi)
            
            for i in range(streak_length):
                x = int(start_x + i * math.cos(angle) * 0.5)
                y = int(start_y + i * math.sin(angle) * 0.3)
                
                if 0 <= x < width and 0 <= y < height:
                    # Get current pixel
                    current_color = self.image.get_at((x, y))
                    if current_color[3] > 0:  # If pixel has alpha
                        # Add wispy effect
                        intensity = max(0, 1 - i / streak_length)
                        wispy_alpha = int(alpha * 0.3 * intensity)
                        
                        if wispy_alpha > 0:
                            color = (250, 250, 250, wispy_alpha)
                            self.image.set_at((x, y), color)


class Item(pygame.sprite.Sprite):
    def __init__(self, x, y, color):
        super().__init__()
        self.image = pygame.Surface((20, 20))
        self.image.fill(color)
        self.rect = pygame.Rect(x, y, 20, 20)
        self.color = color


class Rainbow(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height):
        super().__init__()
        self.image = pygame.Surface((width, height), pygame.SRCALPHA)
        self.rect = pygame.Rect(x, y, width, height)

        # Draw rainbow bands
        colors = [
            (255, 0, 0),  # Red
            (255, 127, 0),  # Orange
            (255, 255, 0),  # Yellow
            (0, 255, 0),  # Green
            (0, 0, 255),  # Blue
            (75, 0, 130),  # Indigo
            (148, 0, 211),  # Violet
        ]

        band_height = height // len(colors)
        for i, color in enumerate(colors):
            band_rect = pygame.Rect(0, i * band_height, width, band_height)
            pygame.draw.rect(self.image, color, band_rect)

        # Make rainbow semi-transparent
        self.image.set_alpha(150)


class Glitter:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vel_x = random.uniform(-3, 3)
        self.vel_y = random.uniform(-3, 3)
        self.size = random.randint(3, 8)
        self.color = random.choice(
            [
                (255, 255, 255),
                (255, 255, 0),
                (255, 0, 255),
                (0, 255, 255),
                (255, 192, 203),
                (255, 215, 0),
            ]
        )
        self.lifetime = random.randint(60, 120)
        self.age = 0

    def update(self):
        self.x += self.vel_x
        self.y += self.vel_y
        self.age += 1

        # Fade out over time
        alpha = int(255 * (1 - self.age / self.lifetime))
        self.color = (*self.color[:3], max(0, alpha))

        return self.age < self.lifetime

    def draw(self, screen):
        if self.age < self.lifetime:
            pygame.draw.circle(
                screen, self.color[:3], (int(self.x), int(self.y)), self.size
            )


class Unicorn(pygame.sprite.Sprite):
    def __init__(self, invert_colors=False, start_x=None):
        super().__init__()

        # Load the sprite sheet
        self.sprite_sheet = pygame.image.load("assets/sprites/kaitlyn_unicorn.png").convert_alpha()

        # Extract individual frames for animation
        # 80x48 image with 15 parts in 5x3 grid = 16x16 per frame
        self.frame_width = 16
        self.frame_height = 16
        self.cols = 5
        self.rows = 3

        self.frames = []
        for row in range(self.rows):
            for col in range(self.cols):
                frame = pygame.Surface(
                    (self.frame_width, self.frame_height), pygame.SRCALPHA
                )
                frame.blit(
                    self.sprite_sheet,
                    (0, 0),
                    (
                        col * self.frame_width,
                        row * self.frame_height,
                        self.frame_width,
                        self.frame_height,
                    ),
                )

                # Invert colors if requested
                if invert_colors:
                    frame = invert_surface_colors(frame)

                self.frames.append(frame)

        # Animation setup
        self.current_frame = 0
        self.animation_speed = 0.15
        self.image = self.frames[self.current_frame]

        # Scale up the sprite for better visibility
        self.image = pygame.transform.scale(self.image, (64, 64))

        self.rect = self.image.get_rect()
        if start_x is not None:
            self.rect.center = (start_x, screen_height // 2)
        else:
            self.rect.center = (screen_width // 2, screen_height // 2)

        # Movement
        self.speed = 5
        self.vel_x = 0
        self.vel_y = 0
        self.facing_right = True

        # Physics
        self.gravity = 0.5
        self.jump_strength = -12
        self.on_ground = False
        self.ground_y = screen_height - percentage_to_pixels(GROUND_HEIGHT_PERCENT, screen_height)
        self.can_climb = False

        # Score
        self.score = 0

    def update(self):
        # Animate through frames
        self.current_frame += self.animation_speed
        if self.current_frame >= len(self.frames):
            self.current_frame = 0

        # Update image
        self.image = self.frames[int(self.current_frame)]
        self.image = pygame.transform.scale(self.image, (64, 64))

        # Flip sprite based on movement direction
        if not self.facing_right:
            self.image = pygame.transform.flip(self.image, True, False)

        # Apply gravity
        if not self.on_ground:
            self.vel_y += self.gravity

        # Move
        self.rect.x += self.vel_x
        self.rect.y += self.vel_y

        # Keep on screen horizontally
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > screen_width:
            self.rect.right = screen_width
        if self.rect.top < 0:
            self.rect.top = 0

    def check_collisions(self, platforms, trees=None):
        self.on_ground = False
        self.can_climb = False

        # Check platform collisions
        for platform in platforms:
            if self.rect.colliderect(platform.rect):
                # Calculate overlap amounts
                overlap_left = self.rect.right - platform.rect.left
                overlap_right = platform.rect.right - self.rect.left
                overlap_top = self.rect.bottom - platform.rect.top
                overlap_bottom = platform.rect.bottom - self.rect.top

                # Find the smallest overlap (most likely collision direction)
                min_overlap = min(
                    overlap_left, overlap_right, overlap_top, overlap_bottom
                )

                # Landing on top of platform (falling down)
                if min_overlap == overlap_top and self.vel_y > 0:
                    self.rect.bottom = platform.rect.top
                    self.vel_y = 0
                    self.on_ground = True
                # Hitting platform from below (jumping up)
                elif min_overlap == overlap_bottom and self.vel_y < 0:
                    self.rect.top = platform.rect.bottom
                    self.vel_y = 0
                # Hitting platform from the left (moving right)
                elif min_overlap == overlap_left and self.vel_x > 0:
                    self.rect.right = platform.rect.left
                    self.can_climb = True
                # Hitting platform from the right (moving left)
                elif min_overlap == overlap_right and self.vel_x < 0:
                    self.rect.left = platform.rect.right
                    self.can_climb = True

        # Check tree collisions (top-only)
        if trees:
            for tree in trees:
                # Only check collision with the top part of the tree
                if self.rect.colliderect(tree.top_collision_rect) and self.vel_y > 0:
                    # Landing on top of tree (falling down)
                    # Place unicorn directly on the visual tree top
                    self.rect.bottom = tree.visual_tree_top
                    self.vel_y = 0
                    self.on_ground = True

        # Check ground collision
        if self.rect.bottom >= self.ground_y:
            self.rect.bottom = self.ground_y
            self.vel_y = 0
            self.on_ground = True

    def handle_input(self, keys, use_wasd=False):
        self.vel_x = 0

        if use_wasd:
            # WASD controls for player 2
            if keys[pygame.K_a]:
                self.vel_x = -self.speed
                self.facing_right = False
            if keys[pygame.K_d]:
                self.vel_x = self.speed
                self.facing_right = True
            if keys[pygame.K_w]:
                if self.on_ground:
                    self.vel_y = self.jump_strength
                    self.on_ground = False
                elif self.can_climb:
                    self.vel_y = -self.speed
            if keys[pygame.K_s]:
                if self.can_climb:
                    self.vel_y = self.speed
        else:
            # Arrow keys for player 1
            if keys[pygame.K_LEFT]:
                self.vel_x = -self.speed
                self.facing_right = False
            if keys[pygame.K_RIGHT]:
                self.vel_x = self.speed
                self.facing_right = True
            if keys[pygame.K_UP]:
                if self.on_ground:
                    self.vel_y = self.jump_strength
                    self.on_ground = False
                elif self.can_climb:
                    self.vel_y = -self.speed
            if keys[pygame.K_DOWN]:
                if self.can_climb:
                    self.vel_y = self.speed

    def collect_item(self, item):
        """Check if unicorn can collect the item and collect it"""
        if self.rect.colliderect(item.rect):
            # Original unicorn (unicorn1) collects white items
            # Inverted unicorn (unicorn2) collects black items
            return True
        return False


# Level management
current_level = 1
max_levels = get_max_levels()  # Automatically detect number of level files


def load_current_level():
    """Load the current level"""
    level_file = f"levels/level{current_level}.yml"
    level_data = load_level(level_file)

    if level_data is None:
        # Fallback to default level if file not found
        print(f"Could not load {level_file}, using default level")
        level_data = {
            "level": {"name": "Default Level"},
            "unicorns": {
                "unicorn1": {"x": screen_width // 4, "y": None},
                "unicorn2": {"x": 3 * screen_width // 4, "y": None},
            },
            "platforms": [
                {"x": 200, "y": 250, "width": 150, "height": 20, "color": [255, 0, 0]},
                {"x": 400, "y": 400, "width": 150, "height": 20, "color": [0, 255, 0]},
                {"x": 600, "y": 300, "width": 150, "height": 20, "color": [0, 0, 255]},
            ],
            "white_items": [
                {"x": 250, "y": 300},
                {"x": 450, "y": 450},
                {"x": 650, "y": 350},
            ],
            "black_items": [
                {"x": 500, "y": 150},
                {"x": 700, "y": 200},
                {"x": 900, "y": 300},
            ],
            "rainbow": {"x": 300, "y": 300, "width": 200, "height": 200},
        }

    return level_data


def reset_level():
    """Reset the current level"""
    global level_complete, glitters, unicorn1, unicorn2, platforms, trees, clouds, white_items, black_items, rainbow, all_sprites

    level_complete = False
    glitters = []

    # Load level data
    level_data = load_current_level()
    level_objects = create_level_objects(level_data, screen_width, screen_height)

    # Create unicorns with starting positions
    unicorn1_start = level_objects["unicorn1_start"] or (
        screen_width // 4,
        screen_height // 2,
    )
    unicorn2_start = level_objects["unicorn2_start"] or (
        3 * screen_width // 4,
        screen_height // 2,
    )

    unicorn1 = Unicorn(invert_colors=False, start_x=unicorn1_start[0])
    unicorn2 = Unicorn(invert_colors=True, start_x=unicorn2_start[0])

    # Set Y positions
    unicorn1.rect.centery = unicorn1_start[1]
    unicorn2.rect.centery = unicorn2_start[1]

    # Get level objects
    platforms = level_objects["platforms"]
    trees = level_objects["trees"]
    clouds = level_objects["clouds"]
    white_items = level_objects["white_items"]
    black_items = level_objects["black_items"]
    rainbow = level_objects["rainbow"]

    # Create sprite groups
    all_sprites = pygame.sprite.Group()
    all_sprites.add(unicorn1)
    all_sprites.add(unicorn2)
    all_sprites.add(platforms)
    all_sprites.add(trees)
    all_sprites.add(clouds)
    all_sprites.add(white_items)
    all_sprites.add(black_items)
    if rainbow:
        all_sprites.add(rainbow)

    return level_data


# Load initial level
level_data = reset_level()

# Game loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                if game_state == PLAYING:
                    game_state = MENU  # Return to menu instead of exiting
                else:
                    running = False
        
        # Handle menu input
        if game_state == MENU:
            menu_result = menu_system.handle_input(event)
            if menu_result == "PLAY":
                game_state = PLAYING
                # Reset to level 1 when starting game
                current_level = 1
                level_data = reset_level()
            elif menu_result == "EXIT":
                running = False
        
        # Handle game input
        elif game_state == PLAYING:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    # Reset current level
                    level_data = reset_level()
                elif event.key == pygame.K_n and level_complete:
                    # Next level
                    if current_level < max_levels:
                        current_level += 1
                        level_data = reset_level()
                    else:
                        # All levels completed - return to menu
                        game_state = MENU

    # Update and draw based on game state
    if game_state == MENU:
        # Update menu
        menu_system.update()
        
        # Draw menu
        menu_system.draw(screen)
        
    elif game_state == PLAYING:
        if not level_complete:
            keys = pygame.key.get_pressed()
            unicorn1.handle_input(keys, use_wasd=False)  # Arrow keys
            unicorn2.handle_input(keys, use_wasd=True)  # WASD

            # Update sprites
            unicorn1.update()
            unicorn2.update()

            # Check collisions
            unicorn1.check_collisions(platforms, trees)
            unicorn2.check_collisions(platforms, trees)

            # Check item collections
            # Unicorn1 collects white items
            for item in white_items:
                if unicorn1.collect_item(item):
                    unicorn1.score += 1
                    item.kill()

            # Unicorn2 collects black items
            for item in black_items:
                if unicorn2.collect_item(item):
                    unicorn2.score += 1
                    item.kill()

            # Check if both unicorns are fully inside the rainbow (not just touching border)
            def is_fully_inside_rainbow(unicorn, rainbow):
                if rainbow is None:
                    return False
                # Check if unicorn is completely within rainbow boundaries
                return (
                    unicorn.rect.left >= rainbow.rect.left
                    and unicorn.rect.right <= rainbow.rect.right
                    and unicorn.rect.top >= rainbow.rect.top
                    and unicorn.rect.bottom <= rainbow.rect.bottom
                )

            unicorn1_in_rainbow = is_fully_inside_rainbow(unicorn1, rainbow)
            unicorn2_in_rainbow = is_fully_inside_rainbow(unicorn2, rainbow)

            if unicorn1_in_rainbow and unicorn2_in_rainbow:
                level_complete = True
                # Create initial burst of glitters
                for _ in range(100):
                    glitters.append(
                        Glitter(
                            random.randint(0, screen_width),
                            random.randint(0, screen_height),
                        )
                    )

        # Update glitters
        glitters = [g for g in glitters if g.update()]

        # Add more glitters during level complete
        if level_complete and len(glitters) < 200:
            for _ in range(5):
                glitters.append(
                    Glitter(
                        random.randint(0, screen_width), random.randint(0, screen_height)
                    )
                )

        # Draw background
        if background_image:
            screen.blit(background_image, (0, 0))
        else:
            screen.fill((50, 150, 50))
        
        # Draw ground
        draw_ground(screen)
        
        all_sprites.draw(screen)

        # Draw glitters
        for glitter in glitters:
            glitter.draw(screen)

        # Draw score counters and level info
        level_name = level_data.get("level", {}).get("name", f"Level {current_level}")
        level_text = font.render(f"{level_name}", True, (255, 255, 255))
        score1_text = font.render(
            f"Player 1 (White): {unicorn1.score}", True, (255, 255, 255)
        )
        score2_text = font.render(
            f"Player 2 (Black): {unicorn2.score}", True, (255, 255, 255)
        )

        screen.blit(level_text, (20, 20))
        screen.blit(score1_text, (20, 60))
        screen.blit(score2_text, (20, 100))

        # Draw level complete message
        if level_complete:
            complete_text = font.render("LEVEL COMPLETE!", True, (255, 255, 255))
            text_rect = complete_text.get_rect(
                center=(screen_width // 2, screen_height // 2)
            )

            # Draw background for text
            background_rect = text_rect.inflate(40, 20)
            pygame.draw.rect(screen, (0, 0, 0, 128), background_rect)
            pygame.draw.rect(screen, (255, 255, 255), background_rect, 3)

            screen.blit(complete_text, text_rect)

            # Draw instructions
            if current_level < max_levels:
                instruction_text = font.render(
                    "Press N for next level or ESC for menu", True, (255, 255, 255)
                )
            else:
                instruction_text = font.render(
                    "All levels completed! Press ESC for menu", True, (255, 255, 255)
                )
            instruction_rect = instruction_text.get_rect(
                center=(screen_width // 2, screen_height // 2 + 50)
            )
            screen.blit(instruction_text, instruction_rect)

            # Draw reset instruction
            reset_text = font.render("Press R to reset level", True, (255, 255, 255))
            reset_rect = reset_text.get_rect(
                center=(screen_width // 2, screen_height // 2 + 90)
            )
            screen.blit(reset_text, reset_rect)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()
