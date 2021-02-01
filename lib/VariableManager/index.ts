import App from "@/lib/App";
import _ from 'lodash';
import { DeepReadonly } from "@/lib/Typings";

class VariableManager {
    constructor(private VFApp: App) {}

    get(key: string): DeepReadonly<any> {
        const value = this.getVariables()[key];
        if (_.isUndefined(value)) {
            throw new Error(`VFError: variable "${key}" is undefined`);
        }
        return value;
    }

    getAll(): DeepReadonly<Record<string, any>> {
        return this.getVariables();
    }

    getAllKeys(): DeepReadonly<string[]> {
        return Object.keys(this.getVariables());
    }

    set(key: string, val: any) {
        const variablesMap = this.getVariables();
        this.checkAssignmentTypeSafety(variablesMap, key, val);
        variablesMap[key] = val;
    }

    setMany(newMapping: Record<string, any>) {
        const variablesMap = this.getVariables();
        const keys = Object.keys(newMapping);
        keys.forEach((key) => {
            this.checkAssignmentTypeSafety(variablesMap, key, newMapping[key]);
        });
        keys.forEach((key) => {
            variablesMap[key] = newMapping[key];
        });
    }

    private getVariables(): Record<string, any> {
        const appState = this.VFApp.__internal__.getState();
        if (appState === null) {
            throw new Error("VFError: cannot access variables, appState was not initialized");
        }
        return appState.state.variables;
    }

    private checkAssignmentTypeSafety(variablesMap: Record<string, any>, key: string, val: any) {
        if (typeof val !== typeof variablesMap[key]) {
            throw new Error(`VError: type of new value for ${key} mismatches expected type`);
        }
    }
}

export default VariableManager;