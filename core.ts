import { createPlan, assertAcyclic, DirectedGraph, extractPart } from "https://raw.githubusercontent.com/maemon4095/ts_components/main/graph/mod.ts";
import { Plan } from "https://raw.githubusercontent.com/maemon4095/ts_components/main/graph/mod.ts";

// awaitable value interface
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenable
type Thenable<T> = {
    then(onFulfilled: (value: T) => unknown, onRejected: (reason?: unknown) => unknown): void;
};

export type Commands = { [name: string]: Thenable<unknown>; };
export type Dependencies<C extends Commands> = { [name in keyof C]?: (keyof C)[] };

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
    await new Promise<void>(resolve => {
        step(undefined);

        function step(task: (keyof C) | undefined) {
            const { done, value } = plan.next(task);
            if (done) {
                resolve();
                return;
            }

            for (const k of value) {
                eventify(commands[k], () => step(k));
            }
        }
    });

    function eventify(cmd: Thenable<unknown>, callback: () => void) {
        (async () => await cmd)().then(callback);
    }
}
