export default class ReplayRecorder {
    constructor(game) {
        this.game = game;
        this.frames = [];
        this.events = [];
        this.startTime = Date.now();
        this._assetCache = new Map();
    }

    recordFrame() {
        const currentTime = Date.now() - this.startTime;
        
        const frame = {
            time: currentTime,
            player: {
                x: this.game.player.x,
                y: this.game.player.y,
                rotation: this.game.player.rotation,
                width: this.game.player.width,
                height: this.game.player.height
            },
            projectiles: this.game.projectiles.map(p => ({
                x: p.x,
                y: p.y
            })),
            barrels: this.game.barrels.map(b => ({
                x: b.x,
                y: b.y,
                health: b.health,
                rotation: b.meshRotation,
                width: b.width,
                height: b.height
            })),
            barriers: this.game.barriers.map(b => ({
                x: b.x,
                y: b.y,
                health: b.health,
                width: b.width,
                height: b.height
            })),
            enemies: this.game.enemies.map(e => ({
                x: e.x,
                y: e.y,
                health: e.health,
                scale: e.width / e.baseWidth,
                type: e.type,
            })),
            powerups: this.game.powerups.map(p => ({
                x: p.x,
                y: p.y,
                type: p.type
            })),
            // Particles are decorative and create a lot of data. Omitting from replay.
            // particles: this.game.particles.map(p => ({
            //     x: p.x,
            //     y: p.y,
            //     size: p.size,
            //     color: p.color
            // })),
            score: this.game.score,
            bombCount: this.game.player.bombCount
        };

        this.frames.push(frame);

        // No longer limiting duration, so the full replay is available.
    }

    recordEvent(type, data) {
        const currentTime = Date.now() - this.startTime;
        this.events.push({
            time: currentTime,
            type,
            data
        });
    }

    async _uploadAsset(path) {
        if (this._assetCache.has(path)) {
            return this._assetCache.get(path);
        }
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch asset: ${path}`);
            }
            const blob = await response.blob();
            const url = await websim.upload(new File([blob], path.split('/').pop()));
            this._assetCache.set(path, url);
            return url;
        } catch (error) {
            console.error(`Error uploading asset ${path}:`, error);
            return path; // Fallback to original path on error
        }
    }

    async getReplayData() {
        const assetPaths = {
            playerShip: 'player_ship.png',
            weapon: 'weapon.png',
            projectile: 'projectile.png',
            barrelTexture: 'barrel_texture.png',
            barrier: 'barrier.png',
            enemy: 'enemy.png',
            redEnemy: 'red_enemy.png',
            rapidFire: 'rapid_fire.png',
            bomb: 'bomb.png'
        };

        const audioPaths = {
            shoot: 'shoot.mp3',
            hit: 'hit.mp3',
            destroy: 'destroy.mp3',
            shatter: 'shatter.mp3',
            bomb_explosion: 'bomb_explosion.mp3',
            bomb_pickup: 'bomb_pickup.mp3'
        };
        
        const uploadedAssets = {};
        for (const key in assetPaths) {
            uploadedAssets[key] = await this._uploadAsset(assetPaths[key]);
        }
        
        const uploadedAudio = {};
        for (const key in audioPaths) {
            uploadedAudio[key] = await this._uploadAsset(audioPaths[key]);
        }

        return {
            config: {
                player: {
                    width: this.game.player.width,
                    height: this.game.player.height,
                },
                projectile: {
                    width: 10,
                    height: 20,
                },
                powerup: {
                    width: 40,
                    height: 40,
                },
                enemy: {
                    baseWidth: this.game.width * 0.08,
                    baseHeight: this.game.width * 0.08,
                }
            },
            frames: this.frames,
            events: this.events,
            width: this.game.width,
            height: this.game.height,
            assets: uploadedAssets,
            audio: uploadedAudio
        };
    }
}