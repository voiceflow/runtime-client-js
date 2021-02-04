import _ from 'lodash';

import { VFTypeError } from '../Common';

export const isJSONSerializable = (data: unknown): boolean => {
  if (_.isUndefined(data) || _.isNumber(data) || _.isString(data) || _.isNull(data) || _.isBoolean(data)) {
    return true;
  }
  if (!_.isPlainObject(data) && !_.isArray(data)) {
    return false;
  }

  const anyData = data as any;
  return Object.keys(anyData).every((key) => {
    return isJSONSerializable(anyData[key]);
  });
};

export const validateVarAssignment = <S extends Record<string, any>>(key: keyof S, val: unknown) => {
  if (!isJSONSerializable(val)) {
    throw new VFTypeError(`assigned value for "${key}" is not JSON serializable`);
  }
};

export const validateVarMerge = <S extends Record<string, any>>(initVars: Partial<S>) => {
  Object.keys(initVars).forEach((key) => {
    validateVarAssignment<S>(key, initVars[key]);
  });
};
