import App from "@/lib/App";
import _ from 'lodash';
import { State } from "@voiceflow/runtime";

class VariableManager<S extends State['variables']> {
    constructor(private VFApp: App<S>) {}

    get<K extends keyof S>(key: K): S[K] {
        const value = (this.getVariables() as S)[key];
        if (_.isUndefined(value)) {
            throw new Error(`VFError: variable "${key}" is undefined`);
        }
        return value;
    }

    getAll(): S {
        return this.getVariables() as S;
    }

    getAllKeys(): Array<keyof S> {
        return Object.keys(this.getVariables());
    }

    validateInitialVars(initVars: Partial<S>) {
        Object.keys(initVars).forEach((key) => {
            this.validateVarAssignment(key, initVars[key]);
        });
    }

    private validateVarAssignment(key: keyof S, val: unknown) {
        if (!this.isJSONSerializable(val)) {
            throw new TypeError(`VError: assigned value for ${key} is not JSON serializable`);
        }
    }

    private isJSONSerializable(data: unknown) {
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

    private getVariables(): State['variables'] {
        const appState = this.VFApp.__internal__.getState();
        if (appState === null) {
            throw new Error("VFError: cannot access variables, appState was not initialized");
        }
        return appState.state.variables;
    }
}

export default VariableManager;