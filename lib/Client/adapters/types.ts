import { GeneralTrace as DBGeneralTrace } from '@voiceflow/general-types';

import { ResponseContext } from '@/lib/types';

export type DBResponseContext = Omit<ResponseContext, 'trace'> & {
  trace: DBGeneralTrace[];
};
