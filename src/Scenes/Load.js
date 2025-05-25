class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.audio('ambiance', 'ambiance.wav');
        this.load.audio('walksound', 'walk.wav');
        this.load.audio('yay', 'yay.wav');
        this.load.audio('jumpsound', 'jump.wav');
        this.load.audio('coinsound', 'coin.mp3');
        // Load characters spritesheet
        //this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.spritesheet("frog_sprite", "frog_sprite_sheet.png", {
        frameWidth: 32,   // Width of each frog frame
        frameHeight: 32   // Height of each frog frame
        });
        // Load tilemap information
        this.load.image("tilemap_tiles", "swamp.png");                     // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });


        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

    }

    create() {

        this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('frog_sprite', {
        frames: [16, 22, 5]  // Second row frames
        }),
        frameRate: 10,
        repeat: -1
        });

this.anims.create({
    key: 'idle',
    frames: [
        { key: 'frog_sprite', frame: 0 },
        { key: 'frog_sprite', frame: 6 },
        { key: 'frog_sprite', frame: 0 },
        { key: 'frog_sprite', frame: 1 },
        { key: 'frog_sprite', frame: 7 },
        { key: 'frog_sprite', frame: 13 },
        { key: 'frog_sprite', frame: 19 },
        { key: 'frog_sprite', frame: 19 },
        { key: 'frog_sprite', frame: 13 },
        { key: 'frog_sprite', frame: 7 },
        { key: 'frog_sprite', frame: 1 }
    ],
    frameRate: 5,  // Slower for idle (adjust as needed)
    repeat: -1
});

    this.anims.create({
        key: 'jump',
        frames: [{ key: 'frog_sprite', frame: 9 }],  // Jump frame
    });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {

    }
}