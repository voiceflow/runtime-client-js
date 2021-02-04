import sinon from 'sinon';
import { State } from '@voiceflow/runtime';
import { Gender, INTERNAL_APP_STATE, INTERNAL_VARIABLES_MAP, INTERNAL_VARIABLES_MAP_KEYS, NON_SERIALIZABLE_VARIABLE_MAP, StockOptions, VFAppVariablesSchema } from './fixture';
import { expect } from 'chai';
import VariableManager from '@/lib/Variables';
import { ResponseContext } from '@/lib/types';
import { validateVarMerge } from '@/lib/Variables/utils';

const createVariableManager = <S extends State['variables']>() => {
    const getState = sinon.stub<void[], ResponseContext | null>();
    const setState = sinon.stub();

    const varManager = new VariableManager<S>(getState, setState);

    return { varManager, getState, setState };
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

        const result = varManager.getKeys();

        expect(result).to.eql(INTERNAL_VARIABLES_MAP_KEYS);
    });

    it('getAllKeys, throws if appState is null', () => {
        const { varManager, getState } = createVariableManager<VFAppVariablesSchema>();
        getState.returns(null);

        const callback = () => varManager.getKeys();
        expect(callback).to.throw("VFError: cannot access variables, app state was not initialized");
    });

    it('setMany', () => {
        const { varManager, setState } = createVariableManager<VFAppVariablesSchema>()
        const newState = {
            name: 'Jesse Pinkman',
            age: 27
        };
  
        varManager.setMany(newState);

        expect(setState.callCount).to.eql(1);
        expect(setState.args[0]).to.eql([ newState ]);
    });

    it('validateVarMerge', () => {
        const callback = () => validateVarMerge(INTERNAL_VARIABLES_MAP);
        expect(callback).to.not.throw();
    });

    it('validateVarMerge', () => {
        const callback = () => validateVarMerge(NON_SERIALIZABLE_VARIABLE_MAP);
        expect(callback).to.throw(`VFError: assigned value for "nested" is not JSON serializable`);
    });
});