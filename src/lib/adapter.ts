import { USER_ROLE_ID } from '@/constants';
import type { PrismaClient } from '@prisma/client';
import type { Adapter } from 'next-auth/adapters';
import notifyNewcomer from './slack/notifyNewcomer';
import { hasProp } from './types/utils';

const PrismaAdapter = (prisma: PrismaClient): Adapter => ({
  createUser: (user: any) => prisma.user.create({ data: { ...user, role: { connect: { id: USER_ROLE_ID } } } }),
  getUser: (id: string) => prisma.user.findUnique({ where: { id } }),
  getUserByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  async getUserByAccount(provider_providerAccountId: any) {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId },
      select: { user: true },
    });
    return account?.user || null;
  },
  updateUser: data => prisma.user.update({ where: { id: data.id }, data }),
  deleteUser: id => prisma.user.delete({ where: { id } }),
  linkAccount: async (account: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { state, ok, ...data } = account;
    await prisma.account.create({ data });
    // Only notify Slack for Slack users
    if (account.provider === 'slack') {
      const user = await prisma.user.findUnique({ where: { id: account.userId }, select: { name: true, image: true } });
      notifyNewcomer({ providerAccountId: account.providerAccountId, name: user?.name, image: user?.image });
    }
  },
  unlinkAccount: async (provider_providerAccountId: any) => {
    await prisma.account.delete({ where: { provider_providerAccountId } });
  },
  async getSessionAndUser(sessionToken) {
    const userAndSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    if (!userAndSession) return null;
    const { user, ...session } = userAndSession;
    return { user, session };
  },
  createSession: data => prisma.session.create({ data }),
  updateSession: data => prisma.session.update({ data, where: { sessionToken: data.sessionToken } }),
  deleteSession: sessionToken => prisma.session.delete({ where: { sessionToken } }),
  createVerificationToken: data => prisma.verificationToken.create({ data }),
  async useVerificationToken(identifier_token) {
    try {
      return await prisma.verificationToken.delete({ where: { identifier_token } });
    } catch (error) {
      // If token already used/deleted, just return null
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if (typeof error === 'object' && error && hasProp(error, 'code') && error.code === 'P2025') return null;
      throw error;
    }
  },
});

export default PrismaAdapter;
