# Jasper 的立體書：熊貓寶寶在哪裡？ / Jasper's Pop-Up Panda Adventure

A pop-up book adventure for little readers. A big storybook lies open on the table. As each page turns, paper
trees, houses, mountains and characters fold up out of it. **Jasper** helps **Panda Mom** find her five lost
babies: 圓圓 Yuanyuan, 豆豆 Doudou, 毛毛 Maomao, 糖糖 Tangtang and 球球 Qiuqiu.

Play online: https://ywchen0711.github.io/jasper-popup/

Plain HTML and JavaScript with Three.js and no build step. Every picture is drawn in code: the paper cut-outs with
their white die-cut rims, the watercolor pages and the cover. The music box and sound effects are generated too.

## The book

| Page | | The puzzle |
|---|---|---|
| 1 | 竹林的家 The Bamboo Home | Hide-and-seek: Yuanyuan hides in one of four places. Her place rustles, but only when you are near, and every wrong guess makes her sneak somewhere else. Once found she runs away: corner her and catch her. |
| 2 | 花花草原 The Flower Meadow | Three pull tabs (● ▲ ■) each flip a different set of bridge boards; get all three down. Then the big flower sings a tune on four petals: step on them in the same order, three tunes, longer each time. |
| 3 | 月光森林 The Moonlit Forest | Night, by lantern light. Catch four shy fireflies (they dart off if you rush them, then rest). Two soot sprites wander the paths: touch one and a firefly flies away. |
| 4 | 雪山 The Snowy Mountain | A sliding-ice puzzle: once on the ice you slide until a rock stops you, and you can only get on and off from the left and the bottom. Stop next to the sneezing snowman (seven slides at the least). |
| 5 | 熱鬧的市集 The Busy Market | A shell game: Mr. Rabbit hides Qiuqiu under a steamer and shuffles. Win three rounds, each faster. |
| 6 | 回家囉 Home Again | Bring all five babies back to Panda Mom |

**Stars** are for doing it well: the hide-and-seek spot that isn't Yuanyuan's, the flower tune with no mistake,
the fireflies without a single soot-sprite touch, a hard-to-reach square on the ice, and the shuffle without a wrong
guess. Stuck? The 💡 button next to the goal shows where to go.

Jasper has a small mole just to the right of his philtrum (his right), and it stays on that side when he turns.

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
