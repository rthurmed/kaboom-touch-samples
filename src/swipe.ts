import { GameObj, KaboomCtx, TimerComp, Vec2 } from "kaboom";

interface Swipe {
  start: Vec2;
  end: Vec2;
  direction: Vec2;
  duration: number;
  time: {
    start: number;
    end: number;
  },
  isUp: boolean;
  isDown: boolean;
  isLeft: boolean;
  isRight: boolean;
}

interface SwipeControllerConfig {
  maxTime: number,
  deadzone: number
}

export const onSwipe = (k: KaboomCtx, game: GameObj<TimerComp>, callback: (swipe: Swipe) => void, config: SwipeControllerConfig = {
  maxTime: 1,
  deadzone: .3
}) => {
  const swipes: Record<number, Swipe> = {};

  game.onTouchStart((pos, touch) => {
    swipes[touch.identifier] = {
      start: pos,
      end: pos,
      direction: k.vec2(),
      duration: 0,
      time: {
        start: k.time(),
        end: k.time()
      },
      isUp: false,
      isDown: false,
      isLeft: false,
      isRight: false
    }
  });

  game.onTouchMove((pos, touch) => {
    const swipe = swipes[touch.identifier];
    if (swipe === undefined) {
      return;
    }
    swipe.direction = k.Vec2.fromAngle(pos.angle(swipe.end));
    swipe.end = pos;
  });

  game.onTouchEnd((pos, touch) => {
    const swipe = swipes[touch.identifier];
    if (swipe === undefined) {
      return;
    }
    swipe.time.end = k.time();
    const diff = swipe.time.end - swipe.time.start;
    
    if (diff > config.maxTime) {
      return;
    }

    swipe.isUp = swipe.direction.y < config.deadzone * -1;
    swipe.isDown = swipe.direction.y > config.deadzone;
    swipe.isLeft = swipe.direction.x < config.deadzone * -1;
    swipe.isRight = swipe.direction.x > config.deadzone;

    callback(swipe);

    if (!k.debug.inspect) {
      return;
    }

    const slash = game.add([
      k.lifespan(1),
      k.color(k.RED),
      k.rect(100, 10),
      k.anchor("left"),
      k.pos(swipe.end),
      k.rotate(swipe.direction.angle(k.vec2())),
    ]);
    const tip = game.add([
      k.lifespan(1),
      k.color(k.BLUE),
      k.circle(16),
      k.pos(swipe.end)
    ]);
    const start = game.add([
      k.lifespan(1),
      k.color(k.BLUE),
      k.circle(16),
      k.pos(swipe.start)
    ]);
  });
}
