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

    set<T>(key: string, val: T) {
        const variablesMap = this.getVariables();
        this.checkAssignmentValidity(key, val);
        variablesMap[key] = val;
    }

    setMany(newMapping: Record<string, any>) {
        const variablesMap = this.getVariables();
        const keys = Object.keys(newMapping);
        keys.forEach((key) => {
            this.checkAssignmentValidity(key, newMapping[key]);
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

    private checkAssignmentValidity(key: string, val: any) {
        if (!this.isJSONSerializable(val)) {
            throw new Error(`VError: new value for ${key} is not JSON serializable`);
        }
    }

    private isJSONSerializable(data: any) {
        if (_.isUndefined(data) || _.isNumber(data) || _.isString(data) || _.isNull(data) || _.isBoolean(data)) {
            return true;
        } else if (!_.isPlainObject(data) || !_.isArray(data)) {
            return false;
        }

        for (const key in data) {
            if (!this.isJSONSerializable(data[key])) {
                return false;
            }
        }
        return true;
    }
}

export default VariableManager;