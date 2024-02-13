import { createPlan, assertAcyclic, DirectedGraph, extractPart } from "https://raw.githubusercontent.com/maemon4095/ts_components/main/graph/mod.ts";
import { Plan } from "https://raw.githubusercontent.com/maemon4095/ts_components/main/graph/mod.ts";


export type Commands = { [name: string]: () => PromiseLike<unknown> | unknown; };
export type Dependencies<C extends Commands> = { [name in keyof C]?: readonly (keyof C)[] };

export function createDependencyGraph<C extends Commands, D extends Dependencies<C>>(commands: C, dependencies: D) {
    const dependencyGraph: { [task in keyof C]?: Set<keyof C> } = {};
    for (const task in commands) {
        const t = task as keyof C;
        dependencyGraph[t] = new Set(dependencies[t] ?? []);
    }
    return dependencyGraph as DirectedGraph<keyof C>;
}

export function createExecutionPlan<C extends Commands, D extends Dependencies<C>>(commands: C, dependencies: D, targets?: (keyof C)[]) {
    const dependencyGraph = createDependencyGraph(commands, dependencies);
    const graph =
        targets !== undefined
            ? extractPart(targets, dependencyGraph)
            : dependencyGraph;

    assertAcyclic(graph);
    return createPlan(graph);
}

export async function executePlan<C extends Commands>(plan: Plan<keyof C>, commands: C) {
    await new Promise<void>((resolve, reject) => {
        step(undefined);

        function step(task: (keyof C) | undefined) {
            const { done, value } = plan.next(task);
            if (done) {
                resolve();
                return;
            }

            for (const k of value) {
                eventify(commands[k], () => step(k), reject);
            }
        }
    });

    function eventify(cmd: () => PromiseLike<unknown> | unknown, callback: () => void, reject: (reason: unknown) => void) {
        (async () => await cmd())().then(callback, reject);
    }
}
