import { AreaComp, Comp, GameObj, KaboomCtx, PosComp, TimerComp, Vec2 } from "kaboom";

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

interface GrabbableComp extends Comp {
  setTarget (value: Vec2 | undefined): void;
}

export const grabbable = (k: KaboomCtx, game: GameObj<TimerComp>, manager: GrabbingManager): GrabbableComp => {
  let target: Vec2;
  let speed = 10;

  function setTarget (value: Vec2 | undefined): void {
    target = value;
  }

  return {
    id: "grabbable",
    require: ["pos", "area"],
    add () {
      target = undefined;

      this.use("grabbable");
      this.setTarget = setTarget;

      game.onTouchStart((pos, touch) => {
        if (this.hasPoint(pos) && manager.isGrabbing()) {
          manager.grab(this);
        }
      });
      
      game.onTouchMove((pos, touch) => {
        if (manager.isGrabbingThat(this)) {
          target = pos;
          this.collisionIgnore = ["slot"];
        }
      });
      
      game.onTouchEnd((pos, touch) => {
        if (!manager.isGrabbingThat(this)) {
          return
        }

        manager.release();
        this.collisionIgnore = []
        target = pos;
      });

      game.onUpdate(() => {
        if (target === undefined) {
          return;
        }
        const moved = k.lerp(this.pos, target, speed * k.dt());
        const diff: Vec2 = moved.sub(this.pos);
        this.moveBy(diff.x , diff.y)
      });
    },
    setTarget
  }
}

interface SlotComp extends Comp {}

export const slot = (k: KaboomCtx, game: GameObj<TimerComp>, manager: GrabbingManager): SlotComp => {
  let grabbed: GameObj;
  return {
    id: "slot",
    require: ["pos", "area"],
    add () {
      const that = this as GameObj<PosComp | AreaComp>

      that.use("slot");

      grabbed = undefined;

      that.onCollide("grabbable", (obj: GameObj<GrabbableComp>, collision) => {
        if (grabbed !== undefined) {
          return;
        }
        obj.setTarget(that.pos);
        grabbed = obj;
        that.trigger("placed", obj);
      });

      that.onCollideEnd("grabbable", (obj: GameObj<GrabbableComp>) => {
        if (grabbed !== undefined && grabbed.id === obj.id) {
          grabbed = undefined;
        }
      });
    }
  }
}
