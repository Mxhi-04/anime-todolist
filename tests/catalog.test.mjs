import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectWorlds } from "../src/world-catalog.mjs";
const catalog = JSON.parse(
  readFileSync(new URL("../src/data/catalog.json", import.meta.url)),
);
const observed = JSON.parse(
  readFileSync(
    new URL(
      "../docs/research/crunchyroll-popular-observed.json",
      import.meta.url,
    ),
  ),
);
test("all 50 browser-observed popular entries resolve to the matching source URL in order", () => {
  const popular = selectWorlds(catalog, "", "Popular 50");
  assert.equal(popular.length, 50);
  assert.deepEqual(
    popular.map((world) => ({
      position: world.popularPosition,
      url: world.catalogSource,
    })),
    observed.entries.map(({ position, url }) => ({ position, url })),
  );
});
test("every world has its own sourced poster, scene, and playable loop path", () => {
  assert.equal(new Set(catalog.map((world) => world.id)).size, catalog.length);
  for (const world of catalog)
    for (const role of ["poster", "scene", "loop"]) {
      assert.ok(
        world[role].startsWith(`/media/anime/${world.id}/`),
        `${world.id}: ${role}`,
      );
      assert.ok(
        existsSync(new URL(`../public${world[role]}`, import.meta.url)),
      );
    }
});
test("popular filters compose with aliases and preserve the additional classics", () => {
  assert.equal(selectWorlds(catalog, "sousou", "Popular 50")[0].id, "frieren");
  assert.equal(selectWorlds(catalog, "shingeki", "Popular 50").length, 0);
  assert.equal(
    selectWorlds(catalog, "shingeki", "All")[0].id,
    "attack-on-titan",
  );
  assert.equal(
    selectWorlds(catalog, "Frieren: Beyond Journey's End")[0].id,
    "frieren",
  );
});
