import { State } from '@voiceflow/runtime';
import _ from 'lodash';

import { InternalAppState } from '../App';

class VariableManager<S extends State['variables']> {
  constructor(private _internalGetState: () => InternalAppState | null) {}

  get<K extends keyof S>(key: K): S[K] {
    const value = this.getVariables()[key];
    if (_.isUndefined(value)) {
      throw new Error(`VFError: variable "${key}" is undefined`);
    }
    return value;
  }

  getAll(): S {
    return this.getVariables();
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
      throw new TypeError(`VError: assigned value for "${key}" is not JSON serializable`);
    }
  }

  private isJSONSerializable(data: unknown): boolean {
    if (_.isUndefined(data) || _.isNumber(data) || _.isString(data) || _.isNull(data) || _.isBoolean(data)) {
      return true;
    }
    if (!_.isPlainObject(data) && !_.isArray(data)) {
      return false;
    }

    const anyData = data as any;
    return Object.keys(anyData).every((key) => {
      return this.isJSONSerializable(anyData[key]);
    });
  }

  private getVariables(): S {
    const appState = this._internalGetState();
    if (appState === null) {
      throw new Error('VFError: cannot access variables, appState was not initialized');
    }
    return appState.state.variables as S;
  }
}

export default VariableManager;
