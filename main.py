import pygame
import sys
import random
import math
import yaml
import os

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


def create_level_objects(level_data, screen_width, screen_height):
    """Create game objects from level data"""
    objects = {
        "platforms": pygame.sprite.Group(),
        "white_items": pygame.sprite.Group(),
        "black_items": pygame.sprite.Group(),
        "rainbow": None,
        "unicorn1_start": None,
        "unicorn2_start": None,
    }

    # Create platforms
    if "platforms" in level_data:
        for platform_data in level_data["platforms"]:
            platform = Platform(
                platform_data["x"],
                screen_height
                - platform_data["y"],  # Convert from bottom-relative to top-relative
                platform_data["width"],
                platform_data["height"],
                tuple(platform_data["color"]),
            )
            objects["platforms"].add(platform)

    # Create white items
    if "white_items" in level_data:
        for item_data in level_data["white_items"]:
            item = Item(
                item_data["x"],
                screen_height
                - item_data["y"],  # Convert from bottom-relative to top-relative
                (255, 255, 255),
            )
            objects["white_items"].add(item)

    # Create black items
    if "black_items" in level_data:
        for item_data in level_data["black_items"]:
            item = Item(
                item_data["x"],
                screen_height
                - item_data["y"],  # Convert from bottom-relative to top-relative
                (0, 0, 0),
            )
            objects["black_items"].add(item)

    # Create rainbow
    if "rainbow" in level_data:
        rainbow_data = level_data["rainbow"]
        objects["rainbow"] = Rainbow(
            screen_width
            - rainbow_data["x"],  # Convert from right-relative to left-relative
            screen_height
            - rainbow_data["y"],  # Convert from bottom-relative to top-relative
            rainbow_data["width"],
            rainbow_data["height"],
        )

    # Get unicorn starting positions
    if "unicorns" in level_data:
        unicorns_data = level_data["unicorns"]
        if "unicorn1" in unicorns_data:
            u1_data = unicorns_data["unicorn1"]
            objects["unicorn1_start"] = (
                u1_data["x"],
                (
                    screen_height // 2
                    if u1_data["y"] is None
                    else screen_height - u1_data["y"]
                ),
            )
        if "unicorn2" in unicorns_data:
            u2_data = unicorns_data["unicorn2"]
            objects["unicorn2_start"] = (
                u2_data["x"],
                (
                    screen_height // 2
                    if u2_data["y"] is None
                    else screen_height - u2_data["y"]
                ),
            )

    return objects


screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
screen_width, screen_height = screen.get_size()
pygame.display.set_caption("Lily Unicorns")

clock = pygame.time.Clock()

# Initialize font for score display
font = pygame.font.Font(None, 36)


class Platform(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height, color):
        super().__init__()
        self.image = pygame.Surface((width, height))
        self.image.fill(color)
        self.rect = pygame.Rect(x, y, width, height)
        self.color = color


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
        self.sprite_sheet = pygame.image.load("kaitlyn_unicorn.png").convert_alpha()

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
        self.ground_y = screen_height - 100
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

    def check_collisions(self, platforms):
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
max_levels = 3


def load_current_level():
    """Load the current level"""
    level_file = f"level{current_level}.yml"
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
    global level_complete, glitters, unicorn1, unicorn2, platforms, white_items, black_items, rainbow, all_sprites

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
    white_items = level_objects["white_items"]
    black_items = level_objects["black_items"]
    rainbow = level_objects["rainbow"]

    # Create sprite groups
    all_sprites = pygame.sprite.Group()
    all_sprites.add(unicorn1)
    all_sprites.add(unicorn2)
    all_sprites.add(platforms)
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
                running = False
            elif event.key == pygame.K_r:
                # Reset current level
                level_data = reset_level()
            elif event.key == pygame.K_n and level_complete:
                # Next level
                if current_level < max_levels:
                    current_level += 1
                    level_data = reset_level()
                else:
                    # All levels completed
                    running = False

    if not level_complete:
        keys = pygame.key.get_pressed()
        unicorn1.handle_input(keys, use_wasd=False)  # Arrow keys
        unicorn2.handle_input(keys, use_wasd=True)  # WASD

        # Update sprites
        unicorn1.update()
        unicorn2.update()

        # Check collisions
        unicorn1.check_collisions(platforms)
        unicorn2.check_collisions(platforms)

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

    screen.fill((50, 150, 50))
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
                "Press N for next level or ESC to exit", True, (255, 255, 255)
            )
        else:
            instruction_text = font.render(
                "All levels completed! Press ESC to exit", True, (255, 255, 255)
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
