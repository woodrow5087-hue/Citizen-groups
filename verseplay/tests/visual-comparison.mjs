import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

/** Compare decoded pixels at threshold zero; ignore only detected antialiasing. */
export function compareScreenshots(beforeBuffer, afterBuffer) {
  const before = PNG.sync.read(beforeBuffer);
  const after = PNG.sync.read(afterBuffer);
  const sameDimensions =
    before.width === after.width && before.height === after.height;
  if (!sameDimensions) {
    return {
      equal: false,
      byteIdentical: false,
      sameDimensions,
      beforeSize: [before.width, before.height],
      afterSize: [after.width, after.height],
    };
  }
  const options = { threshold: 0 };
  const rawDifferentPixels = pixelmatch(
    before.data,
    after.data,
    null,
    before.width,
    before.height,
    { ...options, includeAA: true },
  );
  const differentPixels = pixelmatch(
    before.data,
    after.data,
    null,
    before.width,
    before.height,
    { ...options, includeAA: false },
  );
  return {
    equal: differentPixels === 0,
    byteIdentical: beforeBuffer.equals(afterBuffer),
    sameDimensions,
    width: before.width,
    height: before.height,
    rawDifferentPixels,
    differentPixels,
    antiAliasPixels: rawDifferentPixels - differentPixels,
    comparison: { threshold: 0, includeAA: false },
  };
}
