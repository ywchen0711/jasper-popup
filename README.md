# Jasper 的立體書：熊貓寶寶在哪裡？ / Jasper's Pop-Up Panda Adventure

A pop-up book adventure for little readers. A big storybook lies open on the table. As each page turns, paper
trees, houses, mountains and characters fold up out of it. **Jasper** helps **Panda Mom** find her five lost
babies: 圓圓 Yuanyuan, 豆豆 Doudou, 毛毛 Maomao, 糖糖 Tangtang and 球球 Qiuqiu.

Play online: https://ywchen0711.github.io/jasper-popup/

Plain HTML and JavaScript with Three.js and no build step. Every picture is drawn in code: the paper cut-outs with
their white die-cut rims, the watercolor pages and the cover. The music box and sound effects are generated too.

## The book

| Page | | What to do |
|---|---|---|
| 1 | 竹林的家 The Bamboo Home | Lift the pile of leaves (a lift-the-flap) |
| 2 | 花花草原 The Flower Meadow | Pull the paper tab so a bridge folds down, then turn the flower wheel |
| 3 | 月光森林 The Moonlit Forest | It is night. Jasper carries a lantern. Catch three fireflies, and they light up a hollow log |
| 4 | 雪山 The Snowy Mountain | Find the snowman who keeps sneezing. Mind the slippery ice! |
| 5 | 熱鬧的市集 The Busy Market | Open the steamer that wiggles and munches |
| 6 | 回家囉 Home Again | Bring all five babies back to Panda Mom |

Every page also hides a **star** (shake a bush, tip a rock, touch a glowing mushroom, knock on the igloo, look at
the fruit stall).

## Controls

- **Walk**: arrow keys / WASD, a gamepad stick, or **tap the page** to walk there.
- **Use things**: Space / Enter / E, the gamepad A button, or **tap the thing**. A yellow sign shows what you can do.
- **Talking**: tap or press Space to go on.
- Esc or ☰ opens the menu: read aloud on/off, music on/off, 中文 / English, close the book.

The story can be read aloud by the browser's voice, in Chinese or English. The game saves at every page, so you
can continue where you stopped.

## Files

- `js/main.js`: the engine (Jasper, the babies following him, the fold-ups, talking, turning pages, the camera)
- `js/spreads.js`: the six pages and their story
- `js/book.js`: the book, the turning leaf, and the paper pieces
- `js/art.js`: all the characters and props, drawn as paper cut-outs
- `js/pages.js`: the printed watercolor pages and the cover
- `js/audio.js`: sounds, the music box, and reading aloud
