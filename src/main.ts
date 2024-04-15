import kaboom, { GameObj, TimerComp, Vec2 } from "kaboom";
import { onSwipe } from "./swipe";
import { createGrabbingManager, grabbable, slot } from "./grab";

const k = kaboom({
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  width: 800,
  height: 1000,
  debug: true
});

k.debug.inspect = true;

k.loadSprite("bean", "./sprites/bean.png");

const addNavMenu = (game: GameObj<TimerComp>, currentScene: string) => {
  const SIZE = 64;

  game.add([
    k.text("1. grabbing", {
      size: SIZE
    }),
    k.pos(0, k.height() - SIZE * 2),
    k.area(),
    k.anchor("botleft"),
    k.color(currentScene === "grabbing" ? k.RED : k.WHITE)
  ]).onClick(() => {
    k.go("grabbing")
  });

  game.add([
    k.text("2. swipe directional", {
      size: SIZE
    }),
    k.pos(0, k.height() - SIZE),
    k.area(),
    k.anchor("botleft"),
    k.color(currentScene === "swipe-directional" ? k.RED : k.WHITE)
  ]).onClick(() => {
    k.go("swipe-directional")
  });

  game.add([
    k.text("3. swipe particles", {
      size: SIZE
    }),
    k.pos(0, k.height()),
    k.area(),
    k.anchor("botleft"),
    k.color(currentScene === "swipe-particles" ? k.RED : k.WHITE)
  ]).onClick(() => {
    k.go("swipe-particles")
  });
}

k.scene("grabbing", () => {
  const game = k.add([
    k.timer()
  ]);

  addNavMenu(game, "grabbing");

  const slotPositions = [
    k.center().add(0, -300),
    k.center().add((128 + 64) * -1, -300),
    k.center().add((128 + 64), -300),
  ]

  for (let i = 0; i < slotPositions.length; i++) {
    const slotPosition = slotPositions[i];
    game.add([
      k.rect(80, 80),
      k.pos(slotPosition),
      k.outline(4, k.BLACK),
      k.scale(2),
      k.anchor("center"),
      k.area(),
      slot(k, game)
    ]);
  }

  const manager = createGrabbingManager();

  const entity = game.add([
    k.sprite("bean"),
    k.pos(k.center()),
    k.scale(2),
    k.z(10),
    k.anchor("center"),
    k.area(),
    grabbable(k, game, manager)
  ]);

  const entityRed = game.add([
    k.sprite("bean"),
    k.pos(k.center().add(k.vec2(160, 0))),
    k.color(k.RED),
    k.scale(2),
    k.z(10),
    k.anchor("center"),
    k.area(),
    grabbable(k, game, manager)
  ]);
});

k.scene("swipe-directional", () => {
  const game = k.add([
    k.timer()
  ]);

  addNavMenu(game, "swipe-directional");

  const entity = game.add([
    k.sprite("bean"),
    k.pos(k.center()),
    k.scale(2),
    k.z(10),
    k.anchor("center"),
    k.area(),
    {
      target: k.vec2(k.center()),
      speed: 10
    }
  ]);

  onSwipe(k, game, (swipe) => {
    const ENTITY_MOVEMENT = 128;
    if (swipe.isLeft) {
      entity.target = entity.pos.add(k.LEFT.scale(ENTITY_MOVEMENT));
    }
    if (swipe.isRight) {
      entity.target = entity.pos.add(k.RIGHT.scale(ENTITY_MOVEMENT));
    }
    if (swipe.isDown) {
      k.shake(10);
    }
  });

  game.onUpdate(() => {
    entity.pos = k.lerp(entity.pos, entity.target, entity.speed * k.dt());
  });
});

k.scene("swipe-particles", () => {
  const game = k.add([
    k.timer()
  ]);

  addNavMenu(game, "swipe-particles");

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
      marker.scale = marker.scale.scale(1 - k.dt() * 4);
    });
  });
});

k.go("grabbing");
