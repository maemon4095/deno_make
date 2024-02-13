import $ from "https://deno.land/x/dax@0.39.1/mod.ts";
import { utils } from "../mod.ts";

async function a() {
    await $`echo "a"`;
}

const cmds = {
    a: a,
    b: () => $`echo "b"`,
    c: () => $`echo "c"`,
    d: () => $`echo "d"`,
    e: () => $`echo "e"`,
    f: () => $`echo "f"`,
    g: () => $`echo "g"`,
    h: () => $`echo "h"`,
};

const deps = {
    a: ["b", "c"],
    b: ["d"],
    c: ["d", "e"],
    f: ["c"],
    g: ["e"]
} as const;

await utils.execute(cmds, deps, Deno.args);