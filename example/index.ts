import $ from "https://deno.land/x/dax@0.39.1/mod.ts";
import { Commands, Dependencies, utils } from "../mod.ts";

const cmds = {
    a: $`echo "a"`,
    b: $`echo "b"`,
    c: $`echo "c"`,
    d: $`echo "d"`,
    e: $`echo "e"`,
    f: $`echo "f"`,
    g: $`echo "g"`,
    h: $`echo "h"`,
} as const satisfies Commands;

const deps = {
    a: ["b", "c"],
    b: ["d"],
    c: ["d", "e"],
    f: ["c"],
    g: ["e"]
} as const satisfies Dependencies<typeof cmds>;

await utils.execute(cmds, deps, Deno.args);