import prisma, { getErrorStack } from '@/lib/prisma';
import { canViewDashboard } from '@/lib/roles';
import type { APIResponse } from '@/lib/types/api';
import { nextAuthOptions } from '@/pages/api/auth/[...nextauth]';
import type { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { withSentry } from '@sentry/nextjs';
import type { NextApiHandler } from 'next';
import { unstable_getServerSession } from 'next-auth';

export type SessionsDELETEAPIResponse = APIResponse;

const deleteSessionsHandler: NextApiHandler<SessionsDELETEAPIResponse> = async (req, res) => {
  const session = await unstable_getServerSession(req, res, nextAuthOptions);
  const canEdit = canViewDashboard(session?.user.roleId);
  if (!session || !canEdit) return res.status(401).json({ status: 'error', message: 'Unauthorised' });

  return await prisma.session
    .deleteMany()
    .then(() => res.status(200).json({ status: 'ok' }))
    .catch((error: PrismaClientKnownRequestError) => {
      const stack = getErrorStack(error);
      return res.status(400).json({ status: 'error', stack });
    });
};

export default withSentry(deleteSessionsHandler);
