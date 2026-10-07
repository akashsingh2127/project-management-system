import { auth } from 'express-oauth2-jwt-bearer';
import { env } from './env';

export const checkJwt = auth({
  audience: env.AUTH0_AUDIENCE,
  issuerBaseURL: env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});
