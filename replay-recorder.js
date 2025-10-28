export default class ReplayRecorder {
    constructor(game) {
        this.game = game;
        this.frames = [];
        this.events = [];
        this.startTime = Date.now();
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

    getReplayData() {
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
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
            assets: {
                playerShip: `${baseUrl}player_ship.png`,
                weapon: `${baseUrl}weapon.png`,
                projectile: `${baseUrl}projectile.png`,
                barrelTexture: `${baseUrl}barrel_texture.png`, // Using the texture for the replay
                barrier: `${baseUrl}barrier.png`,
                enemy: `${baseUrl}enemy.png`,
                redEnemy: `${baseUrl}red_enemy.png`,
                rapidFire: `${baseUrl}rapid_fire.png`,
                bomb: `${baseUrl}bomb.png`
            },
            audio: {
                shoot: `${baseUrl}shoot.mp3`,
                hit: `${baseUrl}hit.mp3`,
                destroy: `${baseUrl}destroy.mp3`,
                shatter: `${baseUrl}shatter.mp3`,
                bomb_explosion: `${baseUrl}bomb_explosion.mp3`,
                bomb_pickup: `${baseUrl}bomb_pickup.mp3`
            }
        };
    }
}