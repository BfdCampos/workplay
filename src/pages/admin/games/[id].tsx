import ConfirmButton from '@/components/admin/ConfirmButton';
import type { EditableField } from '@/components/admin/Field/types';
import FlagsSwitch from '@/components/admin/FlagsSwitch';
import SettingsGroup from '@/components/admin/SettingsGroup';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import SEO from '@/components/shared/SEO';
import Settings from '@/components/shared/Settings';
import { GAME_FLAGS, WEBSITE_URL } from '@/constants';
import Admin from '@/layouts/Admin';
import type { PageWithLayout } from '@/layouts/types';
import { withDashboardAuth } from '@/lib/admin';
import type { GamePATCHAPIResponse, ValidGamePatchResponse } from '@/lib/api/handlers/game/patchGameHandler';
import { patchGameSchema } from '@/lib/api/schemas';
import useNavigationState from '@/lib/navigationHistory/useNavigationState';
import prisma from '@/lib/prisma';
import { toSlug } from '@/lib/slug';
import { Stack } from '@chakra-ui/react';
import type { Game, Office } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IoEyeOutline } from 'react-icons/io5';

type AdminPageProps = {
  game: NonNullable<Awaited<ReturnType<typeof getGame>>>;
  offices: Awaited<ReturnType<typeof getOffices>>;
};

export const getGameFields = ({
  officeSlug,
  offices,
}: {
  officeSlug?: string;
  offices: Pick<Office, 'id' | 'name'>[];
}) => {
  const editableFields: EditableField<Game>[] = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'icon', label: 'Icon', type: 'emoji' },
    {
      id: 'officeid',
      label: 'Office',
      type: 'select',
      options: offices.map(office => ({ label: office.name, value: office.id })),
    },
    {
      id: 'slug',
      label: 'Slug',
      type: 'text',
      prefix: WEBSITE_URL + `/${officeSlug || '[office]'}/`,
      format: toSlug,
    },
    { id: 'maxPlayersPerTeam', type: 'number', min: 1, label: 'Max Players Per Team' },
  ];
  return editableFields;
};

const getGame = (id: string) =>
  prisma.game.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      icon: true,
      slug: true,
      flags: true,
      maxPlayersPerTeam: true,
      officeid: true,
      office: { select: { slug: true, name: true, id: true } },
      seasons: { select: { id: true, name: true } },
    },
  });

const getOffices = () =>
  prisma.office.findMany({
    select: { id: true, name: true },
  });

const AdminPage: PageWithLayout<AdminPageProps> = ({ game, offices }) => {
  const [response, setResponse] = useState<ValidGamePatchResponse | undefined>();
  const { push } = useRouter();
  useNavigationState(response?.name || game?.name);

  const editableFields = getGameFields({ officeSlug: game.office.slug, offices });

  const handleSaveField = async ({
    id,
    value,
  }: {
    id: EditableField<Game>['id'];
    value: string | number | boolean;
  }) => {
    try {
      const res = await axios
        .patch<GamePATCHAPIResponse>(`/api/games/${game?.id}`, { [id]: value })
        .then(res => res.data);
      if (res.status === 'ok') {
        setResponse(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGame = async () => {
    await axios.delete(`/api/games/${game?.id}`);
    push(`/admin/offices/${game?.office.id}`);
  };

  return (
    <Stack spacing={8}>
      <SEO title={response?.name || game?.name} />
      <FloatingActionButton
        buttons={[
          {
            label: 'view',
            icon: <IoEyeOutline />,
            colorScheme: 'success',
            href: `/${game?.office.slug}/${game?.slug}`,
          },
        ]}
      />
      <Breadcrumbs
        px={2}
        levels={[
          { label: 'Admin', href: '/admin' },
          { label: 'Offices', href: '/admin/offices' },
          { label: game?.office.name || 'Office', href: `/admin/offices/${game?.office.id}` },
          { label: game?.name || 'Game', href: `/admin/games/${game.id}` },
        ]}
      />
      <SettingsGroup
        fieldSchema={patchGameSchema}
        fields={editableFields}
        saveEndpoint={`/api/games/${game?.id}`}
        data={game}
      />

      <FlagsSwitch
        onChange={async value => await handleSaveField({ id: 'flags', value })}
        label="Game features"
        flags={GAME_FLAGS}
        defaultValue={game?.flags ?? undefined}
      />

      <Settings.List label="Seasons">
        {game.seasons.map(season => (
          <Settings.Link href={`/admin/seasons/${season.id}`} key={season.id}>
            {season.name}
          </Settings.Link>
        ))}
        <Settings.Link href={`/admin/seasons/new?gameid=${game.id}`} showChevron={false} highlight>
          Create Season
        </Settings.Link>
      </Settings.List>

      <Settings.List>
        <Settings.Item label="Danger zone">
          <ConfirmButton keyword={game?.name.toLowerCase()} onConfirm={handleDeleteGame}>
            Delete Game
          </ConfirmButton>
        </Settings.Item>
      </Settings.List>
    </Stack>
  );
};

AdminPage.Layout = Admin;

export default AdminPage;

export const getServerSideProps = withDashboardAuth(async ({ params }) => {
  if (typeof params?.id !== 'string') {
    return { notFound: true };
  }

  const game = await getGame(params.id);
  if (!game) return { notFound: true };

  return {
    props: {
      game,
      offices: await getOffices(),
    },
  };
});
