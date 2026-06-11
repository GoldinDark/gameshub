const prisma = require('../src/utils/prisma');

const RAWG_KEY = 'c5693e88f1c04f80972bc46cb5877aed';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Mapping title game → slug RAWG yang benar
const RAWG_SLUGS = {
  'Resident Evil 4 Remake':      'resident-evil-4',
  'Resident Evil Village':       'resident-evil-village',
  'Alan Wake 2':                 'alan-wake-2',
  'Alan Wake':                   'alan-wake',
  'God of War Ragnarök':         'god-of-war-ragnarok',
  'Devil May Cry 5':             'devil-may-cry-5',
  'Sekiro: Shadows Die Twice':   'sekiro-shadows-die-twice',
  'Batman: Arkham Knight':       'batman-arkham-knight',
  'Persona 5 Royal':             'persona-5-royal',
  'Elden Ring':                  'elden-ring',
  'Cyberpunk 2077':              'cyberpunk-2077',
  'The Witcher 3: Wild Hunt':    'the-witcher-3-wild-hunt',
  'Final Fantasy XVI':           'final-fantasy-xvi',
  'Dark Souls III':              'dark-souls-iii',
  'Monster Hunter: World':       'monster-hunter-world',
  'The Last of Us Part I':       'the-last-of-us-part-i',
  'Spider-Man: Miles Morales':   'spider-man-miles-morales',
  'Hogwarts Legacy':             'hogwarts-legacy',
  'Red Dead Redemption 2':       'red-dead-redemption-2',
  'Grand Theft Auto V':          'grand-theft-auto-v',
  "Assassin's Creed Odyssey":    'assassins-creed-odyssey',
  'Counter-Strike 2':            'counter-strike-2',
  'Apex Legends':                'apex-legends',
  'Deep Rock Galactic':          'deep-rock-galactic',
  'Mortal Kombat 1':             'mortal-kombat-1',
  'Street Fighter 6':            'street-fighter-6',
  'Tekken 8':                    'tekken-8',
  'Hades':                       'hades',
  'Hollow Knight':               'hollow-knight',
  'Stardew Valley':              'stardew-valley',
  'Celeste':                     'celeste',
  'Civilization VI':             'sid-meiers-civilization-vi',
  'The Sims 4':                  'the-sims-4',
  'EA Sports FC 25':             'ea-sports-fc-25',
  'Minecraft':                   'minecraft',
  'Metal Gear Solid V':          'metal-gear-solid-v-the-phantom-pain',
  'Nioh 2':                      'nioh-2',
  'Bloodborne':                  'bloodborne',
  'Ghost of Tsushima':           'ghost-of-tsushima-directors-cut',
  'Returnal':                    'returnal',
  'It Takes Two':                'it-takes-two',
  "Baldur's Gate 3":             'baldurs-gate-3',
  'Forza Horizon 5':             'forza-horizon-5',
  'Sea of Stars':                'sea-of-stars',
  'Lies of P':                   'lies-of-p',
  'Dave the Diver':              'dave-the-diver',
  'Armored Core VI':             'armored-core-vi-fires-of-rubicon',
  'Like a Dragon: Ishin':        'like-a-dragon-ishin',
  'Persona 3 Reload':            'persona-3-reload',
  'Cuphead':                     'cuphead',
};

async function fetchAndSaveScreenshots() {
  console.log('🔍 Mulai fetch screenshots dari RAWG.io...\n');

  const games = await prisma.game.findMany({
    select: { id: true, title: true, thumbnail: true },
  });

  let success = 0;
  let failed  = 0;

  for (const game of games) {
    const rawgSlug = RAWG_SLUGS[game.title];

    if (!rawgSlug) {
      console.log(`⚠️  Skip (no slug): ${game.title}`);
      continue;
    }

    try {
      // ── 1. Ambil data game dari RAWG (thumbnail) ──────
      const gameRes  = await fetch(
        `https://api.rawg.io/api/games/${rawgSlug}?key=${RAWG_KEY}`
      );
      const gameData = await gameRes.json();

      // Update thumbnail jika RAWG punya gambar yang bagus
      if (gameData.background_image && !game.thumbnail?.startsWith('https://cdn.cloudflare')) {
        await prisma.game.update({
          where: { id: game.id },
          data:  { thumbnail: gameData.background_image },
        });
        console.log(`🖼️  Thumbnail updated: ${game.title}`);
      }

      // ── 2. Ambil screenshots gameplay ─────────────────
      await delay(300);
      const ssRes  = await fetch(
        `https://api.rawg.io/api/games/${rawgSlug}/screenshots?key=${RAWG_KEY}`
      );
      const ssData = await ssRes.json();

      if (ssData.results && ssData.results.length > 0) {
        // Ambil 5 screenshot pertama
        const shots = ssData.results.slice(0, 5);

        // Hapus screenshot lama
        await prisma.screenshot.deleteMany({ where: { gameId: game.id } });

        // Simpan screenshot baru
        for (const shot of shots) {
          await prisma.screenshot.create({
            data: { url: shot.image, gameId: game.id },
          });
          await delay(50);
        }

        console.log(`✅ ${game.title} → ${shots.length} screenshots`);
        success++;
      } else {
        console.log(`❌ No screenshots: ${game.title}`);
        failed++;
      }

      await delay(500); // Rate limit — 5 req/detik RAWG free tier

    } catch (err) {
      console.log(`❌ Error ${game.title}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Selesai: ${success} berhasil, ${failed} gagal`);
}

fetchAndSaveScreenshots()
  .catch(console.error)
  .finally(() => prisma.$disconnect());