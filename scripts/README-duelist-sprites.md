# Duelist sprite atlases

Run `node scripts/generate-duelist-sprites.mjs` after changing any source frame in
`public/images/duelist/{female,male}/{idle,twosteps,shoot}`. It regenerates the
six atlas PNGs and `public/images/duelist/sprites/metadata.json`.
The generator uses `sharp`, which is also the production image backend used by
Next.js in this project.

Each atlas has at most four columns and four rows, and every packed cell is
capped at 1024 px on either axis. The 2048×1024 female-idle frames are
area-downscaled with premultiplied alpha to 1024×512 before packing; all other
source frames are already 1024×512. This keeps every atlas at or below 4096 px
per dimension. Frame numbers in the metadata remain the original one-based
source-frame numbers, so the existing idle timer and scroll calculations can be
used unchanged.

`DuelistSprite` deliberately exposes `setFrame(animation, frame)` through its
ref rather than requiring React state updates. It replaces the current two
`HTMLImageElement` refs with `DuelistSpriteHandle` refs:

```tsx
const duelistRef = useRef<DuelistSpriteHandle>(null);
const maleDuelistRef = useRef<DuelistSpriteHandle>(null);

function setDuelistFrame(animation: DuelistAnimation, frame: number) {
  maleDuelistRef.current?.setFrame(animation, frame);
  duelistRef.current?.setFrame(animation, frame);
}
```

Render one `DuelistSprite` per character in place of each `m.img`, retaining
the existing Motion style (`x`, height, min/max height) and setting
`initialAnimation="idle"` and `initialFrame={1}`. Where the page currently
measures an image, use `duelistRef.current?.getElement()?.clientHeight`.

The existing string bookkeeping (`maleDuelistSrcRef`) should become an object
such as `{ animation: "idle", frame: 1 }`; this retains the current comparisons
without parsing a PNG URL. Importantly, do not replace it with React state: the
imperative handle keeps 8-FPS idle changes and scroll-frame changes off the
page's React render path.

The generated atlas files are 2,054,086 bytes total, versus 3,334,537 bytes for
the 80 individual source PNGs (about 38% less transfer before HTTP overhead).
Their exact dimensions are: female idle 4096×1024; female twosteps and shoot
4096×2048; male idle 4096×1024; male twosteps and shoot 4096×2048. They trade
six bounded textures for 80 frame resources; an atlas is requested only when
its animation first becomes active. Test the integrated presentation on target
mobile devices before removing the legacy frames.
