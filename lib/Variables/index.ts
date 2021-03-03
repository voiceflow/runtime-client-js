import _isUndefined from 'lodash/isUndefined';

import { VFClientError } from '../Common';
import { ResponseContext } from '../types';
import { validateVarAssignment, validateVarMerge } from './utils';

class VariableManager<S extends Record<string, any>> {
  constructor(private _internalGetState: () => ResponseContext | null, private _internalSetVars: (newVars: Partial<S>) => void) {}

  get<K extends keyof S>(key: K): S[K] {
    const value = this.getVariables()[key];
    if (_isUndefined(value)) {
      throw new VFClientError(`variable "${key}" is undefined`);
    }
    return value;
  }

  getAll(): S {
    return this.getVariables();
  }

  getKeys(): Array<keyof S> {
    return Object.keys(this.getVariables());
  }

  set<K extends keyof S>(key: K, val: S[K]): void {
    validateVarAssignment<S>(key, val);
    this._internalSetVars({
      [key]: val,
    } as S);
  }

  setMany(newVars: Partial<S>): void {
    validateVarMerge(newVars);
    this._internalSetVars(newVars);
  }

  private getVariables(): S {
    const context = this._internalGetState();
    if (context === null) {
      throw new VFClientError('cannot access variables, app state was not initialized');
    }
    return context.state.variables as S;
  }
}

export default VariableManager;
