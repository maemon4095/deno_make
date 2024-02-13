import { NodeId } from "https://raw.githubusercontent.com/maemon4095/ts_components/main/graph/graphs.ts";
import { Commands, Dependencies, createExecutionPlan, executePlan } from "./core.ts";

export async function execute<C extends Commands, D extends Dependencies<C>>(commands: C, dependencies: D, targets: NodeId[]) {
    for (const cmd of targets) {
        if (!Object.hasOwn(commands, cmd)) {
            throw new UnknownCommandError(cmd);
        }
    }
    const ts = targets.length === 0 ? undefined : targets as (keyof C)[];
    const plan = createExecutionPlan(commands, dependencies, ts);
    await executePlan(plan, commands);
}

export class UnknownCommandError extends Error {
    #command;
    constructor(command: NodeId) {
        super();
        this.#command = command;
        this.message = `Unknown command \`${String(this.#command)}\``;
    }

    get command() {
        return this.#command;
    }
}

