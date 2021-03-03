import _isUndefined from 'lodash/isUndefined';
import _isNumber from 'lodash/isNumber';
import _isString from 'lodash/isString';
import _isNull from 'lodash/isNull';
import _isBoolean from 'lodash/isBoolean';
import _isPlainObject from 'lodash/isPlainObject';
import _isArray from 'lodash/isArray'

import { VFTypeError } from '../Common';

export const isJSONSerializable = (data: unknown): boolean => {
  if (_isUndefined(data) || _isNumber(data) || _isString(data) || _isNull(data) || _isBoolean(data)) {
    return true;
  }
  if (!_isPlainObject(data) && !_isArray(data)) {
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
