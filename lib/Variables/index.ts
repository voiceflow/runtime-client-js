import { State } from '@voiceflow/runtime';
import _ from 'lodash';
import { VFClientError, VFTypeError } from '../Common';

import { ResponseContext } from '../types';

class VariableManager<S extends State['variables']> {
  constructor(private _internalGetState: () => ResponseContext | null) {}

  get<K extends keyof S>(key: K): S[K] {
    const value = this.getVariables()[key];
    if (_.isUndefined(value)) {
      throw new VFClientError(`variable "${key}" is undefined`);
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
      throw new VFTypeError(`assigned value for "${key}" is not JSON serializable`);
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
      throw new VFClientError('cannot access variables, app state was not initialized');
    }
    return appState.state.variables as S;
  }
}

export default VariableManager;
