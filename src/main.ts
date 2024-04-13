import kaboom, { Vec2 } from "kaboom";

const k = kaboom({
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  width: 800,
  height: 1000,
  debug: true
});

k.debug.inspect = true;

k.loadSprite("bean", "./sprites/bean.png");

const game = k.add([
  k.timer()
]);

const testGrab = () => {
  const entity = game.add([
    "grabbable",
    k.sprite("bean"),
    k.scale(2, 2),
    k.pos(k.center()),
    k.area(),
    k.anchor("center"),
    {
      target: k.vec2(k.center()),
      grabbed: false,
      speed: 10
    }
  ]);
  
  game.onTouchStart((pos, touch) => {
    if (entity.hasPoint(pos)) {
      entity.grabbed = true;
    }
  });
  
  game.onTouchMove((pos, touch) => {
    if (entity.grabbed) {
      entity.target = pos;
    }
  });
  
  game.onTouchEnd((pos, touch) => {
    if (entity.grabbed) {
      entity.grabbed = false;
      entity.target = pos;
    }
  });
  
  game.onUpdate(() => {
    entity.pos = k.lerp(entity.pos, entity.target, entity.speed * k.dt());
  });
}

const testSwipe = () => {
  const SWIPE_MAX_TIME = 1;

  interface Swipe {
    start: Vec2;
    end: Vec2;
    direction: Vec2;
    duration: number;
    time: {
      start: number;
      end: number;
    }
  }

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
      }
    }
  });

  game.onTouchMove((pos, touch) => {
    const swipe = swipes[touch.identifier];
    swipe.direction = k.Vec2.fromAngle(swipe.end.angle(pos));
    swipe.end = pos;
  });

  game.onTouchEnd((pos, touch) => {
    const swipe = swipes[touch.identifier];
    swipe.time.end = k.time();
    const diff = swipe.time.end - swipe.time.start;
    
    if (diff > SWIPE_MAX_TIME) {
      return;
    }

    // k.debug.log(`Swiped ${touch.identifier} to ${swipe.direction.toString()}`);
    // console.log(`Swiped ${touch.identifier} to ${swipe.direction} ${swipe.direction.angle(k.vec2())}º`);

    // TODO: swipe callback??

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

const testSwipeParticles = () => {
  game.onTouchMove((pos, touch) => {
    const marker = game.add([
      k.circle(32),
      k.pos(pos),
      k.scale(),
      k.lifespan(.5),
      k.area({
        shape: new k.Rect(k.vec2(), 96, 96)
      }),
      k.anchor("center")
    ]);
    marker.onUpdate(() => {
      marker.scale = marker.scale.scale(.9);
    });
  });
}

const main = () => {
  testGrab();
  testSwipe();
  testSwipeParticles();
}

main();
