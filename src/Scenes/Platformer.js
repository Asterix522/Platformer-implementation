class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        //variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 500;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.collectedCoins = 27;
        
    }

    create() {

        this.map = this.add.tilemap("platformer-level-1", 32, 32, 16, 32);
        this.tileset = this.map.addTilesetImage("swampalicious", "tilemap_tiles");
        this.backLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.ambianceSound = this.sound.add('ambiance', {
            loop: true,
            volume: .10  
        });

        this.yaySound = this.sound.add('yay', {
            loop: false,
            volume: 1  
        });

        this.jumpSound = this.sound.add('jumpsound', {
            loop: false,
            volume: .25  
        });

        this.walkSound = this.sound.add('walksound', {
            loop: false,
            volume: 1  
        });

         this.coinSound = this.sound.add('coinsound', {
            loop: false,
            volume: .25  
        });
        
       
        if (!this.ambianceSound.isPlaying) {
            this.ambianceSound.play();
        }

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 32);
       
        //animate coins
        this.coinGroup = this.add.group(this.coins);
        this.coinGroup.getChildren().forEach(coin => {
        coin.anims.create({
        key: 'spin',
        frames: [
            { key: 'tilemap_sheet', frame: 151 },
            { key: 'tilemap_sheet', frame: 152 }
        ],
        frameRate: 5,
        repeat: -1
        });
        coin.anims.play('spin');
        });

        //Find water tiles
        this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.slow == true;
        });

        console.log(`Found ${this.waterTiles.length} water tiles`);
        
        this.waterTiles.forEach(tile => {
            const x = tile.getCenterX();
            const y = tile.getCenterY();
            const tileWidth = tile.width;
            const tileHeight = tile.height;
        
    //this adds bubble effects
    this.add.particles(x, y, 'kenny-particles', {
        frame: 'circle_01.png',  //Fixed typo (was 'fframe')
        scale: { start: 0.01, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 1000,
        speed: { min: 4, max: 10 },
        angle: { min: -90, max: -70 },
        frequency: 40,
        blendMode: 'NORMAL',
        gravityY: -30,
        emitZone: {
            type: 'random',
            source: new Phaser.Geom.Rectangle(
                -tileWidth/2,  //Left bound
                -tileHeight/1.5,  //Top bound
                tileWidth,      //Width
                tileHeight      //Height
            )
        }
    });
    

        });

        //set up player avatar
        my.sprite.player = this.physics.add.sprite(40, 100, "platformer_characters");
        my.sprite.player.setCollideWorldBounds(true);
        
        //Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);


        my.sprite.player.body.setSize(
    15,    //Width (narrower than sprite if needed)
    15,    //Height (shorter to avoid hovering)
    true   //Centers the hitbox
);
        
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
        my.vfx.coinCollect.emitParticleAt(obj2.x, obj2.y);
            this.coinSound.play();
            obj2.destroy(); //remove coin on overlap
            this.collectedCoins -= 1
            this.coinText.text = `${this.collectedCoins}`
            console.log(this.collectedCoins)
        
        });

        //set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        //debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            scale: {start: 0.01, end: 0.05},
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -400,
            alpha: {start: .75, end: 0.1}, 
        });

        my.vfx.walking.stop();

         my.vfx.coinCollect = this.add.particles(0, 0, 'kenny-particles', {
        frame: 'star_06.png',
        scale: { start: 0.1, end: 0 },
        lifespan: 500,
        speed: { min: 50, max: 100 },
        angle: { min: 0, max: 360 },
        gravityY: 100,
        quantity: 5,
        blendMode: 'ADD'
        });
        my.vfx.coinCollect.stop(); //Start stopped

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); //(target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        
        const cam = this.cameras.main;
    
    //Position text relative to camera viewport
    this.coinText = this.add.text(
        cam.worldView.x + 20,  //20px from left edge of camera
        cam.worldView.y + 20,  //20px from top edge of camera
        `${this.collectedCoins}`,
        { /* style object */ }
    );

    this.instructions = this.add.text(
        cam.worldView.x + 10,  //20px from left edge of camera
        cam.worldView.y + 250,  //20px from top edge of camera
        `Collect All \nCoins to Win`,
        { fontSize: '15px',
            color: '#FFFF00'
         }
    );
    
    //Update position each frame
    this.events.on('update', () => {
        this.coinText.setPosition(
             my.sprite.player.x - 10,
             my.sprite.player.y - 30
        );
    });

    this.winText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'YOU WIN!',
            { 
                fontSize: '64px',
                fontFamily: 'Arial',
                color: '#FFFF00',
                stroke: '#000000',
                strokeThickness: 6,
                shadow: { blur: 0, stroke: false, fill: false }
            }
        ).setOrigin(0.5).setScrollFactor(0).setVisible(false);

        //Add restart instruction text
        this.restartText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 70,
            'Press R to restart',
            { 
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setVisible(false);


    }

    update() {


        if (this.collectedCoins <= 0 && !this.gameWon) {
            this.gameWon = true;
            this.playerWins();
        }
        
        let isOverWater = false;
    const playerX = my.sprite.player.x;
    const playerY = my.sprite.player.y;

    if (playerY > this.map.heightInPixels){
        //restart game
         location.reload();
    }
    
    this.waterTiles.forEach(waterTile => {
        const waterX = waterTile.getCenterX();
        const waterY = waterTile.getCenterY();
        
        //Check if player is within water tile bounds
        if (Math.abs(playerX - waterX) < 16 && 
            Math.abs(playerY - waterY) < 16) {
            isOverWater = true;
        }
    });

    //Apply Y offset only
    if (isOverWater) {
        my.sprite.player.y -= 4; //Move up 4 pixels when in water
    }



        if(cursors.left.isDown) {

            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            //Only play smoke effect if touching the ground

            if ((my.sprite.player.body.blocked.down) && !(isOverWater)) {

                my.vfx.walking.start();
                if (!(this.walkSound.isPlaying)) {
                    this.walkSound.play();
                }
                

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            //Only play smoke effect if touching the ground

            if ((my.sprite.player.body.blocked.down) && !(isOverWater)) {

                my.vfx.walking.start();
                if (!(this.walkSound.isPlaying)) {
                    this.walkSound.play();
                }

            }

        } else {
            //Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle', true);
            my.vfx.walking.stop();
            this.walkSound.stop();
        }

        //player jump
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            if (!(this.jumpSound.isPlaying)) {
                    this.jumpSound.play();
                }
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            location.reload();
        }



}


playerWins() {
        //Stop player movement
        my.sprite.player.setAccelerationX(0);
        my.sprite.player.setVelocityX(0);
        my.sprite.player.body.allowGravity = false;
        
        //Show win text
        this.winText.setVisible(true);
        this.yaySound.play();
        this.restartText.setVisible(true);
        this.coinText.setVisible(false);
        
        //Create celebration particles
        this.add.particles(
            this.cameras.main.centerX/2,
            this.cameras.main.centerY/2,
            'kenny-particles',
            {
                frame: ['star_04.png', 'circle_05.png', 'star_03.png'],
                scale: { start: 0.2, end: 0 },
                lifespan: 2000,
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                gravityY: 100,
                quantity: 10,
                blendMode: 'ADD',
                emitting: false
            }
        ).explode(50);
        
        //Play victory sound if you have one
        //this.sound.play('win-sound');
        
        //Disable controls
        cursors.left.isDown = false;
        cursors.right.isDown = false;
        cursors.up.isDown = false;
        
        //You could also add a timer to automatically go to a new scene after delay
        //this.time.delayedCall(3000, () => { this.scene.start('menuScene'); });
    }
}