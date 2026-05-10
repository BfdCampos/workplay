import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STARTING_POINTS = 100;
const BASE_MATCH_POINTS = 10;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'brunofdcampos@gmail.com';

const OFFICES = [
  { name: 'London', icon: '🇬🇧', slug: 'london' },
  { name: 'New York City', icon: '🗽', slug: 'new-york-city' },
  { name: 'Tokyo', icon: '🗼', slug: 'tokyo' },
  { name: 'São Paulo', icon: '🇧🇷', slug: 'sao-paulo' },
  { name: 'Singapore', icon: '🇸🇬', slug: 'singapore' },
  { name: 'Sydney', icon: '🇦🇺', slug: 'sydney' },
];

const GAMES = [
  { name: 'Pool', slug: 'pool', icon: '🎱', maxPlayersPerTeam: 2 },
  { name: 'Ping Pong', slug: 'ping-pong', icon: '🏓', maxPlayersPerTeam: 1 },
  { name: 'Foosball', slug: 'foosball', icon: '⚽', maxPlayersPerTeam: 2 },
];

const FAKE_USER_COUNT = 60;
const MATCHES_PER_GAME = 22;

const dicebearAvatar = seed => `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(seed)}`;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};

async function wipe() {
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.playerScore.deleteMany();
  await prisma.match.deleteMany();
  await prisma.medal.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.season.deleteMany();
  await prisma.game.deleteMany();
  await prisma.office.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.demoState.deleteMany();
}

async function seedRoles() {
  await prisma.role.createMany({
    data: [
      { id: 0, name: 'admin' },
      { id: 1, name: 'user' },
      { id: 2, name: 'guest' },
      { id: 3, name: 'banned' },
    ],
  });
}

async function seedAdmin() {
  return prisma.user.create({
    data: {
      name: 'Bruno Campos',
      email: ADMIN_EMAIL,
      image: dicebearAvatar('Bruno Campos'),
      roleId: 0,
      isFake: false,
    },
  });
}

async function seedFakeUsers() {
  const users = [];
  const seenEmails = new Set();
  while (users.length < FAKE_USER_COUNT) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const name = `${first} ${last}`;
    const email = `${first}.${last}.${users.length}`.toLowerCase().replace(/[^a-z0-9.]/g, '') + '@workplay.demo';
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);
    users.push({
      name,
      email,
      image: dicebearAvatar(name),
      roleId: 1,
      isFake: true,
    });
  }
  await prisma.user.createMany({ data: users });
  return prisma.user.findMany({ where: { isFake: true } });
}

async function seedOfficesAndGames() {
  const officeRecords = [];
  for (const office of OFFICES) {
    const created = await prisma.office.create({ data: office });
    officeRecords.push(created);
  }
  const gameRecords = [];
  for (const office of officeRecords) {
    for (const game of GAMES) {
      const created = await prisma.game.create({
        data: {
          name: game.name,
          slug: game.slug,
          icon: game.icon,
          maxPlayersPerTeam: game.maxPlayersPerTeam,
          officeid: office.id,
        },
      });
      gameRecords.push({ ...created, maxPlayersPerTeam: game.maxPlayersPerTeam });
    }
  }
  return { offices: officeRecords, games: gameRecords };
}

async function seedSeasons(games) {
  const now = new Date();
  const seasonsByGame = new Map();
  for (const game of games) {
    const closedStart = new Date(now);
    closedStart.setDate(closedStart.getDate() - 90);
    const closedEnd = new Date(now);
    closedEnd.setDate(closedEnd.getDate() - 31);
    const activeStart = new Date(now);
    activeStart.setDate(activeStart.getDate() - 30);
    const activeEnd = new Date(now);
    activeEnd.setDate(activeEnd.getDate() + 60);

    const closed = await prisma.season.create({
      data: {
        name: 'Spring 2026',
        slug: 'spring-2026',
        startDate: closedStart,
        endDate: closedEnd,
        gameid: game.id,
        colour: '#9c8cff',
      },
    });
    const active = await prisma.season.create({
      data: {
        name: 'Summer 2026',
        slug: 'summer-2026',
        startDate: activeStart,
        endDate: activeEnd,
        gameid: game.id,
        colour: '#ffb454',
      },
    });
    seasonsByGame.set(game.id, { closed, active });
  }
  return seasonsByGame;
}

function dateBetween(start, end) {
  const s = start.getTime();
  const e = end.getTime();
  return new Date(s + Math.random() * (e - s));
}

async function seedMatches({ games, seasonsByGame, fakeUsers }) {
  const now = new Date();
  const playerScoresByKey = new Map();
  const ensureScore = (gameid, playerid, seasonid) => {
    const key = `${gameid}|${playerid}|${seasonid}`;
    if (!playerScoresByKey.has(key)) {
      playerScoresByKey.set(key, { gameid, playerid, seasonid, points: STARTING_POINTS });
    }
    return playerScoresByKey.get(key);
  };

  const matchData = [];
  for (const game of games) {
    const seasons = seasonsByGame.get(game.id);
    for (let i = 0; i < MATCHES_PER_GAME; i++) {
      const useClosedSeason = i < Math.floor(MATCHES_PER_GAME / 3);
      const season = useClosedSeason ? seasons.closed : seasons.active;
      const seasonStart = season.startDate;
      const seasonEnd = season.endDate || now;
      const createdAt = dateBetween(seasonStart, seasonEnd > now ? now : seasonEnd);

      const teamSize = randomInt(1, game.maxPlayersPerTeam || 1);
      const players = pickN(fakeUsers, teamSize * 2);
      if (players.length < teamSize * 2) continue;
      const left = players.slice(0, teamSize);
      const right = players.slice(teamSize, teamSize * 2);

      const leftWins = Math.random() < 0.5;
      const winnerScore = randomInt(7, 11);
      const loserScore = randomInt(0, winnerScore - 1);
      const leftscore = leftWins ? winnerScore : loserScore;
      const rightscore = leftWins ? loserScore : winnerScore;

      matchData.push({
        createdAt,
        leftscore,
        rightscore,
        gameid: game.id,
        seasonid: season.id,
        points: BASE_MATCH_POINTS,
        left: left.map(u => ({ id: u.id })),
        right: right.map(u => ({ id: u.id })),
      });

      const pointsPerWinner = Math.round(BASE_MATCH_POINTS / teamSize);
      const pointsPerLoser = Math.round(BASE_MATCH_POINTS / teamSize);
      for (const player of leftWins ? left : right) {
        const ps = ensureScore(game.id, player.id, season.id);
        ps.points += pointsPerWinner;
      }
      for (const player of leftWins ? right : left) {
        const ps = ensureScore(game.id, player.id, season.id);
        ps.points -= pointsPerLoser;
      }
    }
  }

  // Create matches one by one because of M2M player connect
  for (const m of matchData) {
    await prisma.match.create({
      data: {
        createdAt: m.createdAt,
        leftscore: m.leftscore,
        rightscore: m.rightscore,
        gameid: m.gameid,
        seasonid: m.seasonid,
        points: m.points,
        left: { connect: m.left },
        right: { connect: m.right },
      },
    });
  }

  // Bulk-create PlayerScores
  const scoreRows = [...playerScoresByKey.values()];
  if (scoreRows.length > 0) {
    await prisma.playerScore.createMany({ data: scoreRows });
  }
  return { matchCount: matchData.length, scoreCount: scoreRows.length };
}

async function seed() {
  console.log('🧹 Wiping existing data...');
  await wipe();
  console.log('🪪 Seeding roles...');
  await seedRoles();
  console.log('👑 Seeding admin...');
  const admin = await seedAdmin();
  console.log(`👥 Seeding ${FAKE_USER_COUNT} fake users...`);
  const fakeUsers = await seedFakeUsers();
  console.log('🏢 Seeding offices and games...');
  const { offices, games } = await seedOfficesAndGames();
  console.log('📅 Seeding seasons...');
  const seasonsByGame = await seedSeasons(games);
  console.log('🎮 Seeding matches...');
  const { matchCount, scoreCount } = await seedMatches({ games, seasonsByGame, fakeUsers });
  console.log('🔄 Initialising demo state...');
  await prisma.demoState.create({ data: { id: 0, signupCount: 0 } });

  console.log(`\nDatabase seeded:`);
  console.log(`  Admin:    ${admin.email}`);
  console.log(`  Offices:  ${offices.length}`);
  console.log(`  Games:    ${games.length}`);
  console.log(`  Users:    ${fakeUsers.length} fake + 1 admin`);
  console.log(`  Matches:  ${matchCount}`);
  console.log(`  Scores:   ${scoreCount}`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
