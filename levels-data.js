// Embedded level data to avoid CORS issues when running from file://
const LEVEL_DATA = {
    1: {
        "level": {
            "name": "Level 1 - Getting Started"
        },
        "background": {
            "image": null
        },
        "unicorns": {
            "unicorn1": {
                "x": 15,
                "y": null
            },
            "unicorn2": {
                "x": 45,
                "y": null
            }
        },
        "platforms": [
            {
                "x": 15,
                "y": 35,
                "width": 12,
                "height": 3,
                "color": [255, 0, 0],
                "alpha": 255
            },
            {
                "x": 30,
                "y": 55,
                "width": 12,
                "height": 3,
                "color": [0, 255, 0],
                "alpha": 180
            },
            {
                "x": 45,
                "y": 42,
                "width": 12,
                "height": 3,
                "color": [0, 0, 255],
                "alpha": 255
            },
            {
                "x": 60,
                "y": 70,
                "width": 12,
                "height": 3,
                "color": [255, 255, 0],
                "alpha": 120
            },
            {
                "x": 60,
                "y": 28,
                "width": 12,
                "height": 3,
                "color": [255, 0, 255],
                "alpha": 255
            },
            {
                "x": 60,
                "y": 10,
                "width": 12,
                "height": 3,
                "color": [0, 255, 255],
                "alpha": 150
            },
            {
                "x": 80,
                "y": 50,
                "width": 12,
                "height": 3,
                "color": [0, 255, 255],
                "alpha": 150
            }
        ],
        "trees": [
            {
                "x": 10,
                "y": 50,
                "width": 8,
                "height": 35
            },
            {
                "x": 55,
                "y": 60,
                "width": 6,
                "height": 40
            },
            {
                "x": 88,
                "y": 45,
                "width": 7,
                "height": 30
            }
        ],
        "clouds": [
            {
                "x": 25,
                "y": 85,
                "width": 15,
                "height": 20,
                "alpha": 150
            },
            {
                "x": 70,
                "y": 90,
                "width": 12,
                "height": 20,
                "alpha": 180
            },
            {
                "x": 15,
                "y": 65,
                "width": 10,
                "height": 20,
                "alpha": 120
            },
            {
                "x": 5,
                "y": 75,
                "width": 10,
                "height": 20,
                "alpha": 120
            }
        ],
        "white_items": [
            {
                "x": 20,
                "y": 42
            },
            {
                "x": 35,
                "y": 62
            },
            {
                "x": 50,
                "y": 49
            },
            {
                "x": 65,
                "y": 76
            },
            {
                "x": 23,
                "y": 21
            }
        ],
        "black_items": [
            {
                "x": 40,
                "y": 21
            },
            {
                "x": 55,
                "y": 28
            },
            {
                "x": 70,
                "y": 42
            },
            {
                "x": 85,
                "y": 35
            },
            {
                "x": 95,
                "y": 70
            }
        ],
        "triangles": [
            {
                "x": 35,
                "y": 60,
                "size": 4,
                "color": [255, 0, 0]
            },
            {
                "x": 75,
                "y": 65,
                "size": 5,
                "color": [255, 100, 0]
            }
        ],
        "swamps": [
            {
                "x": 25,
                "y": 75,
                "width": 15,
                "height": 8,
                "color": [139, 69, 19]
            }
        ],
        "rainbow": {
            "x": 15,
            "y": 3,
            "width": 505,
            "height": 205
        }
    },
    2: {
        "level": {
            "name": "Level 2 - Tower Challenge"
        },
        "background": {
            "image": null
        },
        "unicorns": {
            "unicorn1": {
                "x": 8,
                "y": null
            },
            "unicorn2": {
                "x": 92,
                "y": null
            }
        },
        "platforms": [
            {
                "x": 4,
                "y": 21,
                "width": 8,
                "height": 3,
                "color": [255, 100, 100],
                "alpha": 255
            },
            {
                "x": 4,
                "y": 35,
                "width": 8,
                "height": 3,
                "color": [255, 150, 150],
                "alpha": 200
            },
            {
                "x": 4,
                "y": 49,
                "width": 8,
                "height": 3,
                "color": [255, 200, 200],
                "alpha": 160
            },
            {
                "x": 30,
                "y": 42,
                "width": 15,
                "height": 3,
                "color": [100, 255, 100],
                "alpha": 255
            },
            {
                "x": 55,
                "y": 62,
                "width": 15,
                "height": 3,
                "color": [150, 255, 150],
                "alpha": 180
            },
            {
                "x": 88,
                "y": 21,
                "width": 8,
                "height": 3,
                "color": [100, 100, 255],
                "alpha": 255
            },
            {
                "x": 88,
                "y": 35,
                "width": 8,
                "height": 3,
                "color": [150, 150, 255],
                "alpha": 200
            },
            {
                "x": 88,
                "y": 49,
                "width": 8,
                "height": 3,
                "color": [200, 200, 255],
                "alpha": 160
            }
        ],
        "trees": [
            {
                "x": 20,
                "y": 70,
                "width": 8,
                "height": 45
            },
            {
                "x": 76,
                "y": 65,
                "width": 6,
                "height": 40
            }
        ],
        "clouds": [
            {
                "x": 45,
                "y": 85,
                "width": 18,
                "height": 10,
                "alpha": 160
            },
            {
                "x": 15,
                "y": 90,
                "width": 12,
                "height": 7,
                "alpha": 140
            },
            {
                "x": 85,
                "y": 80,
                "width": 10,
                "height": 6,
                "alpha": 170
            }
        ],
        "white_items": [
            {
                "x": 6,
                "y": 28
            },
            {
                "x": 6,
                "y": 42
            },
            {
                "x": 35,
                "y": 49
            },
            {
                "x": 60,
                "y": 70
            },
            {
                "x": 47,
                "y": 21
            }
        ],
        "black_items": [
            {
                "x": 90,
                "y": 28
            },
            {
                "x": 90,
                "y": 42
            },
            {
                "x": 40,
                "y": 49
            },
            {
                "x": 65,
                "y": 70
            },
            {
                "x": 70,
                "y": 21
            }
        ],
        "triangles": [
            {
                "x": 50,
                "y": 30,
                "size": 3,
                "color": [200, 0, 0]
            },
            {
                "x": 25,
                "y": 50,
                "size": 4,
                "color": [255, 50, 0]
            }
        ],
        "swamps": [
            {
                "x": 60,
                "y": 80,
                "width": 20,
                "height": 10,
                "color": [139, 69, 19]
            }
        ],
        "rainbow": {
            "x": 20,
            "y": 42,
            "width": 12,
            "height": 21
        }
    },
    3: {
        "level": {
            "name": "Level 3 - Maze Runner"
        },
        "background": {
            "image": null
        },
        "unicorns": {
            "unicorn1": {
                "x": 4,
                "y": null
            },
            "unicorn2": {
                "x": 4,
                "y": null
            }
        },
        "platforms": [
            {
                "x": 15,
                "y": 21,
                "width": 23,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 255
            },
            {
                "x": 47,
                "y": 28,
                "width": 2,
                "height": 28,
                "color": [255, 127, 0],
                "alpha": 180
            },
            {
                "x": 23,
                "y": 42,
                "width": 16,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 255
            },
            {
                "x": 55,
                "y": 49,
                "width": 23,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 200
            },
            {
                "x": 70,
                "y": 62,
                "width": 2,
                "height": 28,
                "color": [255, 127, 0],
                "alpha": 150
            },
            {
                "x": 86,
                "y": 35,
                "width": 16,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 255
            },
            {
                "x": 94,
                "y": 56,
                "width": 12,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 170
            }
        ],
        "trees": [
            {
                "x": 8,
                "y": 80,
                "width": 6,
                "height": 50
            },
            {
                "x": 45,
                "y": 85,
                "width": 5,
                "height": 45
            },
            {
                "x": 82,
                "y": 75,
                "width": 7,
                "height": 40
            }
        ],
        "clouds": [
            {
                "x": 30,
                "y": 95,
                "width": 20,
                "height": 8,
                "alpha": 150
            },
            {
                "x": 65,
                "y": 88,
                "width": 15,
                "height": 6,
                "alpha": 180
            },
            {
                "x": 10,
                "y": 92,
                "width": 12,
                "height": 5,
                "alpha": 130
            },
            {
                "x": 90,
                "y": 85,
                "width": 8,
                "height": 4,
                "alpha": 160
            }
        ],
        "white_items": [
            {
                "x": 20,
                "y": 28
            },
            {
                "x": 27,
                "y": 49
            },
            {
                "x": 59,
                "y": 56
            },
            {
                "x": 90,
                "y": 42
            },
            {
                "x": 98,
                "y": 62
            }
        ],
        "black_items": [
            {
                "x": 31,
                "y": 28
            },
            {
                "x": 35,
                "y": 49
            },
            {
                "x": 66,
                "y": 56
            },
            {
                "x": 94,
                "y": 42
            },
            {
                "x": 102,
                "y": 62
            }
        ],
        "swamps": [
            {
                "x": 40,
                "y": 85,
                "width": 18,
                "height": 8,
                "color": [139, 69, 19]
            }
        ],
        "rainbow": {
            "x": 16,
            "y": 76,
            "width": 14,
            "height": 25
        }
    },
    4: {
        "level": {
            "name": "Level 4 - Advanced Challenge"
        },
        "background": {
            "image": null
        },
        "unicorns": {
            "unicorn1": {
                "x": 100,
                "y": null
            },
            "unicorn2": {
                "x": 4,
                "y": null
            }
        },
        "platforms": [
            {
                "x": 15,
                "y": 21,
                "width": 2,
                "height": 30,
                "color": [255, 127, 0],
                "alpha": 55
            },
            {
                "x": 47,
                "y": 28,
                "width": 2,
                "height": 28,
                "color": [255, 127, 0],
                "alpha": 180
            },
            {
                "x": 23,
                "y": 42,
                "width": 2,
                "height": 30,
                "color": [255, 127, 0],
                "alpha": 255
            },
            {
                "x": 55,
                "y": 49,
                "width": 23,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 200
            },
            {
                "x": 70,
                "y": 62,
                "width": 2,
                "height": 28,
                "color": [255, 127, 0],
                "alpha": 150
            },
            {
                "x": 86,
                "y": 35,
                "width": 16,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 255
            },
            {
                "x": 94,
                "y": 56,
                "width": 12,
                "height": 3,
                "color": [255, 127, 0],
                "alpha": 170
            }
        ],
        "trees": [
            {
                "x": 8,
                "y": 80,
                "width": 6,
                "height": 50
            },
            {
                "x": 45,
                "y": 85,
                "width": 5,
                "height": 45
            },
            {
                "x": 82,
                "y": 75,
                "width": 7,
                "height": 40
            }
        ],
        "clouds": [
            {
                "x": 30,
                "y": 95,
                "width": 20,
                "height": 8,
                "alpha": 150
            },
            {
                "x": 65,
                "y": 88,
                "width": 15,
                "height": 6,
                "alpha": 180
            },
            {
                "x": 10,
                "y": 92,
                "width": 12,
                "height": 5,
                "alpha": 130
            },
            {
                "x": 90,
                "y": 85,
                "width": 8,
                "height": 4,
                "alpha": 160
            }
        ],
        "white_items": [
            {
                "x": 20,
                "y": 28
            },
            {
                "x": 27,
                "y": 49
            },
            {
                "x": 59,
                "y": 56
            },
            {
                "x": 90,
                "y": 42
            },
            {
                "x": 98,
                "y": 62
            }
        ],
        "black_items": [
            {
                "x": 31,
                "y": 28
            },
            {
                "x": 35,
                "y": 49
            },
            {
                "x": 66,
                "y": 56
            },
            {
                "x": 94,
                "y": 42
            },
            {
                "x": 102,
                "y": 62
            }
        ],
        "swamps": [
            {
                "x": 30,
                "y": 80,
                "width": 25,
                "height": 12,
                "color": [139, 69, 19]
            }
        ],
        "rainbow": {
            "x": 56,
            "y": 76,
            "width": 14,
            "height": 25
        }
    }
};