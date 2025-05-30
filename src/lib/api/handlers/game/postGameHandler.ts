import { INITIAL_SEASON } from '@/constants';
import { postGameSchema } from '@/lib/api/schemas';
import prisma from '@/lib/prisma';
import revalidateStaticPages from '@/lib/revalidateStaticPages';
import { canViewDashboard } from '@/lib/roles';
import type { APIResponse } from '@/lib/types/api';
import { nextAuthOptions } from '@/pages/api/auth/[...nextauth]';
import { withSentry } from '@sentry/nextjs';
import type { NextApiHandler } from 'next';
import { unstable_getServerSession } from 'next-auth';
import type { InferType, ValidationError } from 'yup';

type PostGameBody = InferType<typeof postGameSchema>;
export type ValidGamePostResponse = Awaited<ReturnType<typeof createGame>>;
export type GamePOSTAPIResponse = APIResponse<ValidGamePostResponse>;

const createGame = async ({ officeid, ...body }: PostGameBody) =>
  await prisma.game.create({
    data: { ...body, office: { connect: { id: officeid } }, seasons: { create: INITIAL_SEASON } },
    include: {
      office: true,
    },
  });

const postGameHandler: NextApiHandler<GamePOSTAPIResponse> = async (req, res) => {
  await postGameSchema
    .validate(req.body, { abortEarly: true, stripUnknown: true })
    .then(async body => {
      const session = await unstable_getServerSession(req, res, nextAuthOptions);
      const canEdit = canViewDashboard(session?.user.roleId);

      if (!session || !canEdit) return res.status(401).json({ status: 'error', message: 'Unauthorised' });

      try {
        const game = await createGame(body);
        await revalidateStaticPages(['/', `/${game.office.slug}`, `/${game.office.slug}/${game.slug}`], res);
        res.status(200).json({ status: 'ok', data: game });
      } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
      }
    })
    .catch((err: ValidationError) => {
      console.error(err);
      const stack = err.inner.map(err => ({
        type: err.type,
        path: err.path as keyof ValidGamePostResponse,
        message: err.errors.join('; '),
      }));
      return res.status(400).json({ status: 'error', stack });
    });
};

export default withSentry(postGameHandler);
