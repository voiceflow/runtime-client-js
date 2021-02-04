import sinon from 'sinon';
import { State } from '@voiceflow/runtime';
import { Gender, INTERNAL_APP_STATE, INTERNAL_VARIABLES_MAP, INTERNAL_VARIABLES_MAP_KEYS, NonSerializableSchema, NON_SERIALIZABLE_VARIABLE_MAP, StockOptions, VFAppVariablesSchema } from './fixture';
import { expect } from 'chai';
import VariableManager from '@/lib/Variables';
import { ResponseContext } from '@/lib/types';

const createVariableManager = <S extends State['variables']>() => {
    const getState = sinon.stub<void[], ResponseContext | null>();

    const varManager = new VariableManager<S>(getState);

    return { varManager, getState };
  };

describe('VariableManager', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('get', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(INTERNAL_APP_STATE);

        const age: number = varManager.get('age');
        const name: string = varManager.get('name');
        const gender: Gender = varManager.get('gender');
        const isRegistered: boolean = varManager.get('isRegistered');
        const options: StockOptions = varManager.get('options');
        const countries: string[] = varManager.get('countries');

        expect(age).to.eql(INTERNAL_VARIABLES_MAP.age);
        expect(name).to.eql(INTERNAL_VARIABLES_MAP.name);
        expect(gender).to.eql(INTERNAL_VARIABLES_MAP.gender);
        expect(isRegistered).to.eql(INTERNAL_VARIABLES_MAP.isRegistered);
        expect(options).to.eql(INTERNAL_VARIABLES_MAP.options);
        expect(countries).to.eql(INTERNAL_VARIABLES_MAP.countries);
    });

    it('get, accessed undefined property', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(INTERNAL_APP_STATE);

        const key = 'undefinedKey'
        const callback = () => varManager.get(key as keyof VFAppVariablesSchema);

        expect(callback).to.throw(`VFError: variable "${key}" is undefined`);
    });

    it('get, throws if appState is null', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(null);

        const callback = () => varManager.get('name');
        expect(callback).to.throw("VFError: cannot access variables, app state was not initialized");
    });

    it('getAll', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(INTERNAL_APP_STATE);

        const result: VFAppVariablesSchema = varManager.getAll();

        expect(result).to.eql(INTERNAL_VARIABLES_MAP);
    });

    it('getAll, throws if appState is null', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(null);

        const callback = () => varManager.getAll();
        expect(callback).to.throw("VFError: cannot access variables, app state was not initialized");
    });

    it('getAllKeys', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(INTERNAL_APP_STATE);

        const result = varManager.getAllKeys();

        expect(result).to.eql(INTERNAL_VARIABLES_MAP_KEYS);
    });

    it('getAllKeys, throws if appState is null', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(null);

        const callback = () => varManager.getAllKeys();
        expect(callback).to.throw("VFError: cannot access variables, app state was not initialized");
    });

    it('validateInitialVars', () => {
        const { varManager } = createVariableManager<VFAppVariablesSchema>();

        const callback = () => varManager.validateInitialVars(INTERNAL_VARIABLES_MAP);

        expect(callback).to.not.throw();
    });

    it('validateInitialVars, non-serializable data exception', () => {
        const { varManager } = createVariableManager<NonSerializableSchema>();

        const callback = () => varManager.validateInitialVars(NON_SERIALIZABLE_VARIABLE_MAP);

        expect(callback).to.throw(`VError: assigned value for "nested" is not JSON serializable`);
    });
});