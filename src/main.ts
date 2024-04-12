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
  const SWIPE_MAX_TIME = 2;
  
  let start: number | undefined;
  let lastPos = k.vec2();
  let direction = k.vec2();

  const getCurrentTime = () => {
    return (new Date()).getTime()
  }

  game.onTouchStart((pos, touch) => {
    console.log(touch.identifier);
    start = getCurrentTime()
  });

  game.onTouchMove((pos, touch) => {
    direction = k.Vec2.fromAngle(lastPos.angle(pos));
    lastPos = pos;
  });

  game.onTouchEnd((pos, touch) => {
    const currentTime = getCurrentTime();
    const timeDiff = (currentTime - start) / 1000;
    if (timeDiff <= SWIPE_MAX_TIME) {
      console.log(`Swiped to ${direction.toString()}`);
    }
  });
}

const main = () => {
  testGrab();
  testSwipe();
}

main();
