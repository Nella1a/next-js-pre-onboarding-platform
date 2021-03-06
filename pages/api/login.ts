import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../util/auth';
import { createSerializedRegisterSessionTokenCookie } from '../../util/cookies';
import {
  createSession,
  getUserByUserWithPasswordHashByUsername,
  User,
} from '../../util/database';

// type LoginRequestBody = {
//   username: string;
//   password: string;
//   csrfToken: string;
// };

// type LoginNextApiRequest = Omit<NextApiRequest, 'body'> & {
//   body: LoginRequestBody;
// };

export type LoginResponseBody =
  | { errors: { message: string }[] }
  | { user: Pick<User, 'id'> };

export default async function loginHandler(
  request: NextApiRequest,
  response: NextApiResponse<LoginResponseBody>,
) {
  if (request.method === 'POST') {
    // validation: check if un or pw is not string or empty
    if (
      typeof request.body.username !== 'string' ||
      !request.body.username ||
      typeof request.body.password !== 'string' ||
      !request.body.password ||
      typeof request.body.csrfToken !== 'string' ||
      !request.body.csrfToken
    ) {
      response.status(400).json({
        errors: [{ message: 'Username, password or CSRF token not provided' }],
      });
      return;
    }

    // Verify CSRF Token
    const csrfTokenMatches = verifyCsrfToken(request.body.csrfToken);

    if (!csrfTokenMatches) {
      response.status(403).json({
        errors: [
          {
            message: 'Invalid CSRF token',
          },
        ],
      });
      return; // Important: will prevent "Headers already sent" error
    }

    // get user with password_hash from database
    const userWithPasswordHash = await getUserByUserWithPasswordHashByUsername(
      request.body.username,
    );

    // Error-Handling:  user or password doesn't exist
    if (!userWithPasswordHash) {
      response.status(401).json({
        errors: [{ message: 'Username or password does not match.' }],
      });
      return; // Always include a return in api route, important because it will prevent "Headers" already sent" error
    }

    // compare passwordHash
    const passwordMatches = await bcrypt.compare(
      request.body.password,
      userWithPasswordHash.passwordHash,
    );

    // Error-Handling: password does not match
    if (!passwordMatches) {
      response.status(401).json({
        errors: [{ message: 'Username or password does not match.' }],
      });
      return; // Always include a return in api route, important because it will prevent "Headers" already sent" error
    }

    // 1. Create a unique token (use node crypto)
    const sessionToken = crypto.randomBytes(64).toString('base64');

    // 2. Save token into sessions table
    const session = await createSession(sessionToken, userWithPasswordHash.id);
    console.log(session);

    // 3. Serialize the Cookie (we need to do serialize bc we are in the backend)
    const serializedCookie = await createSerializedRegisterSessionTokenCookie(
      session.token,
    );

    // Add user to the response body
    // 4. Add cookie to the header response
    response
      .status(201)
      .setHeader('Set-Cookie', serializedCookie)
      .json({
        user: {
          id: userWithPasswordHash.id,
        },
      });
    return;
  }
  response.status(405).json({
    errors: [{ message: 'Method not supported, try POST instead' }],
  });
}
