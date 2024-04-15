import { Comp, GameObj, KaboomCtx, TimerComp, Vec2 } from "kaboom";

interface GrabbingManager {
  grabbed?: GameObj;
  grabbing: boolean;
  grab(obj: GameObj): void;
  release(): void;
  isGrabbing(): boolean;
  isGrabbingThat(obj: GameObj): boolean;
}

export const createGrabbingManager = (): GrabbingManager => {
  return {
    grabbed: undefined,
    grabbing: false,
    grab (obj: GameObj) {
      this.grabbed = obj;
      this.grabbing = true;
    },
    release () {
      this.grabbed = undefined;
      this.grabbing = false;
    },
    isGrabbing () {
      return !this.grabbing;
    },
    isGrabbingThat (obj: GameObj) {
      return this.grabbed !== undefined && obj.id === this.grabbed.id;
    }
  }
}

export const grabbable = (k: KaboomCtx, game: GameObj<TimerComp>, manager: GrabbingManager): Comp => {
  let target = k.vec2();
  let speed = 10;

  return {
    id: "grabbable",
    require: ["pos", "area"],
    add () {
      target = this.pos

      game.onTouchStart((pos, touch) => {
        if (this.hasPoint(pos) && manager.isGrabbing()) {
          manager.grab(this);
        }
      });
      
      game.onTouchMove((pos, touch) => {
        if (manager.isGrabbingThat(this)) {
          target = pos;
        }
      });
      
      game.onTouchEnd((pos, touch) => {
        if (!manager.isGrabbingThat(this)) {
          return
        }

        manager.release();
        target = pos;
    
        const collisions = this.getCollisions();
        if (collisions.length < 1) {
          return;
        }
    
        let closest: Vec2 = undefined;
        let closestDistance = 1_000_000_000;
    
        for (let i = 0; i < collisions.length; i++) {
          const collision = collisions[i];
          if (!collision.target.is("slot")) {
            continue;
          }
          const distance = collision.source.pos.dist(collision.target.pos);
          if (distance < closestDistance) {
            closest = collision.target.pos;
            closestDistance = distance;
          }
        }

        if (closest !== undefined) {
          target = closest;
        }
      });
      
      game.onUpdate(() => {
        this.pos = k.lerp(this.pos, target, speed * k.dt());
      });
    }
  }
}

export const slot = (k: KaboomCtx, game: GameObj<TimerComp>): Comp => {
  // TODO: store which grabbable is occupying
  return {
    id: "slot",
    require: ["pos", "area"],
    add () {
      this.use("slot")
    }
  }
}
