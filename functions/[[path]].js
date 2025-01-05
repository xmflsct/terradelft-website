import { createPagesFunctionHandler } from '@react-router/cloudflare'

import * as build from '../build/server'

export const onRequest = createPagesFunctionHandler({ build })
