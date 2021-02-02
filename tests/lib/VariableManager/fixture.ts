import { InternalAppState } from "@/lib/App";

export type Gender = 'M' | 'F' | 'Other';
export type StockOptions = {
    TSLA: number;
    GME: number;
    AMC: number;
}
export type VFAppVariablesSchema = {
    age: number | 0;
    name: string;
    gender: Gender;
    isRegistered: boolean;
    options: StockOptions;
    countries: string[];
};

export const INTERNAL_VARIABLES_MAP: VFAppVariablesSchema = {
    age: 37,
    name: 'Elon Musk',
    gender: 'M',
    isRegistered: true,
    options: {
        TSLA: 722,
        GME: 1234567890,
        AMC: 1234567890
    },
    countries: ['SA']
}

export const INTERNAL_VARIABLES_MAP_KEYS: string[] = Object.keys(INTERNAL_VARIABLES_MAP);

export const INTERNAL_APP_STATE: InternalAppState = {
    state: {
        stack: [],
        storage: {},
        variables: INTERNAL_VARIABLES_MAP
    },
    trace: []
}

export type NonSerializableSchema = {
    nested: {
        map: InstanceType<typeof Map>;
    }
};

export const NON_SERIALIZABLE_VARIABLE_MAP: NonSerializableSchema = {
    nested: {
        map: new Map()
    }
};