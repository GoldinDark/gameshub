const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  log: ['error'],
});

const steam = (appId) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {

  // ── GENRE (sequential, bukan Promise.all) ─────────────
  const genreData = [
    { name: 'Action',     slug: 'action' },
    { name: 'RPG',        slug: 'rpg' },
    { name: 'Horror',     slug: 'horror' },
    { name: 'Adventure',  slug: 'adventure' },
    { name: 'Strategy',   slug: 'strategy' },
    { name: 'Sports',     slug: 'sports' },
    { name: 'Fighting',   slug: 'fighting' },
    { name: 'Simulation', slug: 'simulation' },
    { name: 'Shooter',    slug: 'shooter' },
    { name: 'Open World', slug: 'open-world' },
    { name: 'Platformer', slug: 'platformer' },
    { name: 'Indie',      slug: 'indie' },
  ];

  for (const g of genreData) {
    await prisma.genre.upsert({
      where:  { slug: g.slug },
      update: {},
      create: { name: g.name, slug: g.slug },
    });
    await delay(150);
  }
  console.log('✅ Genres seeded');

  // ── TAGS (sequential) ──────────────────────────────────
  const tagNames = [
    'Singleplayer', 'Multiplayer', 'Co-op', 'Open World',
    'Story Rich', 'Dark', 'Gore', 'Survival', 'Stealth',
    'Hack and Slash', 'Turn-Based', 'Third Person', 'First Person',
    'Online', 'Controller Support', 'Atmospheric', 'Horror',
    'Simulation', 'Roguelike', 'Pixel Art', 'Crafting', 'Sandbox',
    'Souls-like', 'Metroidvania', 'Puzzle', 'Racing', 'Platformer',
  ];

  for (const name of tagNames) {
    await prisma.tag.upsert({
      where:  { name },
      update: {},
      create: { name },
    });
    await delay(100);
  }
  console.log('✅ Tags seeded');

  // ── HELPER ─────────────────────────────────────────────
  const makeSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  const upsertGame = async (data, tagList = []) => {
    const slug = makeSlug(data.title);
    const existing = await prisma.game.findUnique({ where: { slug } });

    if (existing) {
      await prisma.game.update({
        where: { slug },
        data: {
          thumbnail:   data.thumbnail,
          description: data.description,
          price:       data.price,
          discount:    data.discount,
          rating:      data.rating,
          isFeatured:  data.isFeatured,
        },
      });
      console.log(`🔄 Updated: ${data.title}`);
      return;
    }

    await prisma.game.create({
      data: {
        ...data,
        slug,
        tags: {
          create: tagList.map((name) => ({ tag: { connect: { name } } })),
        },
      },
    });
    console.log(`🎮 Created: ${data.title}`);
  };

  // ── GAMES DATA ─────────────────────────────────────────
  const games = [
    {
      data: {
        title: 'Resident Evil 4 Remake',
        description: 'Agen Leon S. Kennedy mendapat misi berbahaya: menyelamatkan putri Presiden Amerika yang diculik di sebuah desa terpencil Eropa. Menghadapi penduduk desa yang terinfeksi parasit Los Illuminados, Leon harus bertahan hidup dengan sumber daya terbatas sambil memecahkan teka-teki dan menghadapi musuh yang jauh lebih pintar dari zombie biasa. Remake legendaris ini menyajikan grafis fotorealistik, combat yang lebih responsif, dan atmosfer teror yang tak tertandingi.',
        price: 349000, discount: 10, genreId: 3,
        developer: 'Capcom', publisher: 'Capcom',
        releaseDate: new Date('2023-03-24'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.9, totalReviews: 0, isFeatured: true,
        thumbnail: steam(2050650),
      },
      tags: ['Singleplayer', 'Horror', 'Survival', 'Third Person', 'Story Rich', 'Controller Support'],
    },
    {
      data: {
        title: 'Resident Evil Village',
        description: 'Ethan Winters kembali ke dalam mimpi buruk yang lebih gelap dari sebelumnya. Putrinya Rose diculik ke sebuah desa Eropa misterius yang dikuasai empat Lord supranatural di bawah komando Mother Miranda. Bertemu dengan Lady Dimitrescu yang menjulang tinggi, boneka-boneka hidup Donna Beneviento, dan makhluk air Moreau yang mengerikan. Survival horror first-person dengan intensitas yang mencekam dari awal hingga akhir.',
        price: 299000, discount: 25, genreId: 3,
        developer: 'Capcom', publisher: 'Capcom',
        releaseDate: new Date('2021-05-07'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1196590),
      },
      tags: ['Singleplayer', 'Horror', 'First Person', 'Survival', 'Story Rich'],
    },
    {
      data: {
        title: 'Alan Wake 2',
        description: 'Penulis horor Alan Wake telah terjebak selama 13 tahun di dimensi gelap bernama Dark Place — dunia yang dibentuk oleh tulisannya sendiri. Sementara itu, agen FBI Saga Anderson menginvestigasi serangkaian pembunuhan ritual di kota Bright Falls. Dua narasi berbeda yang saling terhubung secara misterius. Remedy Entertainment menghadirkan survival horror paling ambisius — memadukan gameplay dengan sinematografi tingkat tinggi.',
        price: 449000, discount: 0, genreId: 3,
        developer: 'Remedy Entertainment', publisher: 'Epic Games Publishing',
        releaseDate: new Date('2023-10-27'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.8, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1903840),
      },
      tags: ['Singleplayer', 'Horror', 'Story Rich', 'Atmospheric', 'Third Person'],
    },
    {
      data: {
        title: 'God of War Ragnarök',
        description: 'Fimbulwinter telah datang, pertanda Ragnarök semakin dekat. Kratos dan Atreus harus menjelajahi semua Sembilan Alam Norse untuk menemukan jawaban atas takdir yang telah diramalkan. Menghadapi Odin yang penuh siasat, Thor yang ganas, dan dewa-dewa lain yang berniat menghancurkan mereka. Sebuah perjalanan epik tentang ayah dan anak, pilihan sulit, dan harga dari kebebasan.',
        price: 599000, discount: 0, genreId: 1,
        developer: 'Santa Monica Studio', publisher: 'PlayStation Studios',
        releaseDate: new Date('2022-11-09'),
        platform: 'PC, PS4, PS5',
        rating: 4.9, totalReviews: 0, isFeatured: true,
        thumbnail: steam(2322010),
      },
      tags: ['Singleplayer', 'Story Rich', 'Third Person', 'Hack and Slash', 'Atmospheric', 'Controller Support'],
    },
    {
      data: {
        title: 'Devil May Cry 5',
        description: 'Lima tahun setelah kejadian di Fortuna, pohon iblis raksasa muncul di kota Redgrave dan mengancam peradaban manusia. Dante, Nero, dan misterius V bersatu untuk menghentikan ancaman terbesar yang pernah mereka hadapi. DMC5 adalah puncak dari seri action dengan sistem combat paling mendalam — combo meter yang meledak, weapon variety yang kaya, dan boss fight yang epik.',
        price: 199000, discount: 50, genreId: 1,
        developer: 'Capcom', publisher: 'Capcom',
        releaseDate: new Date('2019-03-08'),
        platform: 'PC, PS4, PS5, Xbox',
        rating: 4.8, totalReviews: 0, isFeatured: false,
        thumbnail: steam(601150),
      },
      tags: ['Singleplayer', 'Hack and Slash', 'Story Rich', 'Third Person', 'Controller Support'],
    },
    {
      data: {
        title: 'Sekiro: Shadows Die Twice',
        description: 'Jepang era Sengoku yang gelap menjadi latar kisah Wolf — shinobi muda yang kehilangan tuannya dan lengan kirinya dalam satu malam. Bangkit dengan prostetik senjata canggih, Wolf memulai perjalanan balas dendam yang membawanya menghadapi samurai terkuat, monster mitologi Jepang, dan rintangan yang menguji batas kemampuan. Sistem parry yang revolusioner membuat setiap duel terasa seperti pertarungan jiwa.',
        price: 399000, discount: 20, genreId: 1,
        developer: 'FromSoftware', publisher: 'Activision',
        releaseDate: new Date('2019-03-22'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.8, totalReviews: 0, isFeatured: false,
        thumbnail: steam(814380),
      },
      tags: ['Singleplayer', 'Souls-like', 'Stealth', 'Story Rich', 'Dark', 'Third Person'],
    },
    {
      data: {
        title: 'Batman: Arkham Knight',
        description: 'Malam terakhir Batman di Gotham City. Scarecrow mengancam meracuni seluruh kota dengan toxin ketakutan, sementara musuh lama bersatu dalam Arkham Knight — sosok misterius yang tampaknya mengenal Bruce Wayne dari dalam. Kendarai Batmobile untuk pertama kalinya, hadapi teka-teki Riddler yang semakin gila, dan ungkap kebenaran yang mengguncang.',
        price: 149000, discount: 50, genreId: 1,
        developer: 'Rocksteady Studios', publisher: 'Warner Bros',
        releaseDate: new Date('2015-06-23'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.6, totalReviews: 0, isFeatured: false,
        thumbnail: steam(208650),
      },
      tags: ['Singleplayer', 'Open World', 'Stealth', 'Third Person', 'Story Rich'],
    },
    {
      data: {
        title: 'Persona 5 Royal',
        description: 'Ryuji Sakamoto dan kawan-kawan membentuk Phantom Thieves of Hearts — kelompok remaja yang masuk ke Metaverse, dimensi bawah sadar manusia, untuk mencuri hati orang-orang korup. Persona 5 Royal menyempurnakan masterpiece dengan konten baru, karakter baru Kasumi Yoshizawa, semester ketiga yang mengubah segalanya, dan soundtrack jazz yang akan terus terngiang.',
        price: 399000, discount: 20, genreId: 2,
        developer: 'Atlus', publisher: 'Atlus',
        releaseDate: new Date('2022-10-21'),
        platform: 'PC, PS4, Switch, Xbox',
        rating: 4.9, totalReviews: 0, isFeatured: true,
        thumbnail: steam(1687950),
      },
      tags: ['Singleplayer', 'Turn-Based', 'Story Rich', 'Atmospheric', 'Controller Support'],
    },
    {
      data: {
        title: 'Elden Ring',
        description: 'George R.R. Martin dan Hidetaka Miyazaki berkolaborasi menciptakan dunia Lands Between yang luar biasa kaya. Sebagai Tarnished yang bangkit dari kematian, kamu menjelajahi dunia open world masif penuh rahasia, dungeon tersembunyi, dan boss-boss legendaris yang akan menguji kesabaran dan skill sampai batasnya.',
        price: 599000, discount: 10, genreId: 2,
        developer: 'FromSoftware', publisher: 'Bandai Namco',
        releaseDate: new Date('2022-02-25'),
        platform: 'PC, PS4, PS5, Xbox',
        rating: 4.9, totalReviews: 0, isFeatured: true,
        thumbnail: steam(1245620),
      },
      tags: ['Singleplayer', 'Open World', 'Dark', 'Atmospheric', 'Third Person', 'Souls-like'],
    },
    {
      data: {
        title: 'Cyberpunk 2077',
        description: 'Night City, 2077 — kota paling berbahaya dan paling memukau di Amerika. V, mercenary berbakat, terjebak dengan jiwa Johnny Silverhand di dalam kepalanya dan harus mencari cara bertahan sebelum identitasnya terhapus sepenuhnya. RPG open world dengan pilihan cerita yang benar-benar bermakna.',
        price: 299000, discount: 40, genreId: 2,
        developer: 'CD Projekt Red', publisher: 'CD Projekt',
        releaseDate: new Date('2020-12-10'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.5, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1091500),
      },
      tags: ['Singleplayer', 'Open World', 'Story Rich', 'First Person', 'Atmospheric'],
    },
    {
      data: {
        title: 'The Witcher 3: Wild Hunt',
        description: 'Geralt of Rivia mencari Ciri — putri angkatnya yang dikejar Wild Hunt. Perjalanan melintasi Northern Kingdoms yang luas dengan lebih dari 200 jam konten berkualitas tinggi. Keputusan moral yang benar-benar berdampak pada ending.',
        price: 99000, discount: 80, genreId: 2,
        developer: 'CD Projekt Red', publisher: 'CD Projekt',
        releaseDate: new Date('2015-05-19'),
        platform: 'PC, PS4, PS5, Xbox, Switch',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(292030),
      },
      tags: ['Singleplayer', 'Open World', 'Story Rich', 'Dark', 'Third Person'],
    },
    {
      data: {
        title: 'Final Fantasy XVI',
        description: 'Di dunia Valisthea yang dikuasai kristal ajaib, Clive Rosfield menyaksikan kehancuran hidupnya dalam satu malam kelam. Perjalanannya berkembang menjadi perjuangan membebaskan dunia dari siklus kematian yang telah berlangsung ribuan tahun. Action RPG dengan combat real-time yang memukau dan skala epik.',
        price: 499000, discount: 15, genreId: 2,
        developer: 'Square Enix', publisher: 'Square Enix',
        releaseDate: new Date('2023-06-22'),
        platform: 'PC, PS5',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1839144),
      },
      tags: ['Singleplayer', 'Story Rich', 'Hack and Slash', 'Atmospheric', 'Controller Support'],
    },
    {
      data: {
        title: 'Dark Souls III',
        description: 'Api mulai padam untuk terakhir kalinya. Sebagai Ashen One, kamu harus memaksa Lord of Cinder kembali ke takhta mereka. Dark Souls III adalah klimaks dari trilogi legendaris FromSoftware dengan tempo combat yang lebih cepat dan boss fight paling ikonik dalam sejarah genre.',
        price: 199000, discount: 60, genreId: 2,
        developer: 'FromSoftware', publisher: 'Bandai Namco',
        releaseDate: new Date('2016-04-12'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.8, totalReviews: 0, isFeatured: false,
        thumbnail: steam(374320),
      },
      tags: ['Singleplayer', 'Souls-like', 'Dark', 'Atmospheric', 'Third Person', 'Co-op'],
    },
    {
      data: {
        title: 'Monster Hunter: World',
        description: 'Bergabunglah dengan Fifth Fleet ke New World — daratan raksasa yang belum terpetakan. Sebagai Hunter, pahami perilaku dan kelemahan setiap monster untuk bertahan hidup. Cooperative hunting untuk 4 orang dengan 14 jenis senjata unik.',
        price: 249000, discount: 30, genreId: 1,
        developer: 'Capcom', publisher: 'Capcom',
        releaseDate: new Date('2018-08-09'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(582010),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Co-op', 'Online', 'Third Person', 'Controller Support'],
    },
    {
      data: {
        title: 'The Last of Us Part I',
        description: 'Dua puluh tahun setelah pandemi jamur Cordyceps, Joel diperintahkan menyelundupkan Ellie melintasi Amerika yang sudah runtuh. Ellie kebal terhadap infeksi yang telah mengubah jutaan orang menjadi monster. Remake dengan grafis memukau yang mendefinisikan ulang standar visual gaming.',
        price: 499000, discount: 0, genreId: 4,
        developer: 'Naughty Dog', publisher: 'PlayStation Studios',
        releaseDate: new Date('2023-03-28'),
        platform: 'PC, PS5',
        rating: 4.9, totalReviews: 0, isFeatured: true,
        thumbnail: steam(1888930),
      },
      tags: ['Singleplayer', 'Story Rich', 'Third Person', 'Survival', 'Atmospheric', 'Dark'],
    },
    {
      data: {
        title: 'Spider-Man: Miles Morales',
        description: 'Miles Morales belajar menjadi Spider-Man ketika perang antara korporasi Roxxon dan kelompok hacker Tinkerer mengancam menghancurkan Harlem. Dengan kekuatan bio-electric venom strike dan kemampuan kamuflase unik, Miles membuktikan dirinya layak menyandang nama Spider-Man.',
        price: 349000, discount: 20, genreId: 4,
        developer: 'Insomniac Games', publisher: 'PlayStation Studios',
        releaseDate: new Date('2022-11-18'),
        platform: 'PC, PS4, PS5',
        rating: 4.8, totalReviews: 0, isFeatured: false,
        thumbnail: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png',
      },
      tags: ['Singleplayer', 'Open World', 'Third Person', 'Story Rich', 'Controller Support'],
    },
    {
      data: {
        title: 'Hogwarts Legacy',
        description: 'Abad ke-19, sebagai mahasiswa baru Hogwarts dengan kemampuan Ancient Magic kuno, kamu terlibat konspirasi yang mengancam komunitas penyihir. Jelajahi kastil Hogwarts, terbang dengan sapu, pelihara Hippogriff, dan kuasai ratusan mantra di dunia Harry Potter paling imersif.',
        price: 549000, discount: 20, genreId: 4,
        developer: 'Avalanche Software', publisher: 'Warner Bros',
        releaseDate: new Date('2023-02-10'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.6, totalReviews: 0, isFeatured: false,
        thumbnail: steam(990080),
      },
      tags: ['Singleplayer', 'Open World', 'Story Rich', 'Third Person', 'Atmospheric'],
    },
    {
      data: {
        title: 'Red Dead Redemption 2',
        description: 'Amerika 1899. Arthur Morgan mempertanyakan jalan hidup yang telah ia pilih ketika loyalitasnya diuji dari segala arah. Open world paling detail yang pernah dibuat — setiap NPC punya rutinitas, setiap keputusan punya konsekuensi, setiap momen terasa nyata.',
        price: 249000, discount: 30, genreId: 10,
        developer: 'Rockstar Games', publisher: 'Rockstar Games',
        releaseDate: new Date('2019-11-05'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.9, totalReviews: 0, isFeatured: true,
        thumbnail: steam(1174180),
      },
      tags: ['Singleplayer', 'Open World', 'Story Rich', 'Third Person', 'Atmospheric'],
    },
    {
      data: {
        title: 'Grand Theft Auto V',
        description: 'Tiga protagonist berbeda — Michael, Trevor, dan Franklin — menjalani kehidupan kriminal di Los Santos. Campaign singleplayer epik dengan tiga sudut pandang yang saling bersilangan, ditambah GTA Online yang terus diperbarui lebih dari satu dekade.',
        price: 149000, discount: 35, genreId: 10,
        developer: 'Rockstar North', publisher: 'Rockstar Games',
        releaseDate: new Date('2015-04-14'),
        platform: 'PC, PS4, PS5, Xbox',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(271590),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Open World', 'Online', 'Third Person'],
    },
    {
      data: {
        title: "Assassin's Creed Odyssey",
        description: 'Yunani Kuno 431 SM — sebagai keturunan Leonidas, jelajahi kepulauan Yunani yang indah, selami mitologi dengan monster legendaris, dan ungkap konspirasi kultus rahasia. RPG terbesar dalam sejarah Assassin\'s Creed.',
        price: 199000, discount: 60, genreId: 10,
        developer: 'Ubisoft Quebec', publisher: 'Ubisoft',
        releaseDate: new Date('2018-10-05'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.5, totalReviews: 0, isFeatured: false,
        thumbnail: steam(812140),
      },
      tags: ['Singleplayer', 'Open World', 'Story Rich', 'Third Person', 'Controller Support'],
    },
    {
      data: {
        title: 'Counter-Strike 2',
        description: 'Game FPS kompetitif paling berpengaruh hadir dengan engine Source 2. CS2 membawa smoke grenade yang bereaksi volumetrik, pencahayaan real-time dramatis, dan sistem subtick yang lebih akurat. Komunitas terbesar dan turnamen paling prestisius di dunia gaming.',
        price: 0, discount: 0, genreId: 9,
        developer: 'Valve', publisher: 'Valve',
        releaseDate: new Date('2023-09-27'),
        platform: 'PC',
        rating: 4.4, totalReviews: 0, isFeatured: true,
        thumbnail: steam(730),
      },
      tags: ['Multiplayer', 'First Person', 'Online', 'Controller Support'],
    },
    {
      data: {
        title: 'Apex Legends',
        description: 'Battle royale dengan Legend berkemampuan unik. Movement system fluid dengan bunny hop dan wall bounce. Ping system revolusioner untuk komunikasi efektif tanpa suara. Free-to-play terbaik di genre battle royale.',
        price: 0, discount: 0, genreId: 9,
        developer: 'Respawn Entertainment', publisher: 'EA Games',
        releaseDate: new Date('2019-02-04'),
        platform: 'PC, PS4, PS5, Xbox, Switch',
        rating: 4.3, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1172470),
      },
      tags: ['Multiplayer', 'First Person', 'Online', 'Co-op', 'Controller Support'],
    },
    {
      data: {
        title: 'Deep Rock Galactic',
        description: 'Bergabung dengan tim Dwarf ke planet Hoxxes IV yang berbahaya, dipenuhi serangga alien raksasa. Pilih kelas Driller, Scout, Gunner, atau Engineer — saling melengkapi. Cave system prosedural memastikan tidak ada dua misi yang sama. Co-op terbaik dengan komunitas paling friendly.',
        price: 149000, discount: 40, genreId: 9,
        developer: 'Ghost Ship Games', publisher: 'Coffee Stain Publishing',
        releaseDate: new Date('2020-05-13'),
        platform: 'PC, PS4, PS5, Xbox',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(548430),
      },
      tags: ['Multiplayer', 'Co-op', 'Online', 'First Person', 'Controller Support'],
    },
    {
      data: {
        title: 'Mortal Kombat 1',
        description: 'Liu Kang menciptakan New Era yang seharusnya damai, namun kekacauan datang dari dimensi lain. MK1 merevolusi seri dengan sistem Kameo Fighter, grafis paling realistis, Fatality semakin brutal, plus Invasions mode kaya konten.',
        price: 599000, discount: 0, genreId: 7,
        developer: 'NetherRealm Studios', publisher: 'Warner Bros',
        releaseDate: new Date('2023-09-19'),
        platform: 'PC, PS5, Xbox Series X, Switch',
        rating: 4.5, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1971870),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Online', 'Story Rich', 'Gore', 'Controller Support'],
    },
    {
      data: {
        title: 'Street Fighter 6',
        description: 'Era baru Street Fighter dengan sistem Drive yang menghadirkan lapisan strategi baru. World Tour Mode RPG, Battle Hub online interaktif, dan roster beragam dari veteran hingga pendatang baru segar. Definitif fighting game.',
        price: 499000, discount: 10, genreId: 7,
        developer: 'Capcom', publisher: 'Capcom',
        releaseDate: new Date('2023-06-02'),
        platform: 'PC, PS4, PS5, Xbox Series X',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1794680),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Online', 'Story Rich', 'Controller Support'],
    },
    {
      data: {
        title: 'Tekken 8',
        description: 'Kazuya Mishima berhadapan dengan Jin Kazama dalam pertarungan ayah dan anak yang mencapai puncaknya. Heat System mendorong gaya bermain agresif. 32 karakter dengan grafis Unreal Engine 5 memukau dan story mode berkualitas film aksi.',
        price: 549000, discount: 0, genreId: 7,
        developer: 'Bandai Namco', publisher: 'Bandai Namco',
        releaseDate: new Date('2024-01-26'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1778820),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Online', 'Story Rich', 'Controller Support'],
    },
    {
      data: {
        title: 'Hades',
        description: 'Zagreus berjuang melarikan diri dari Dunia Bawah untuk menemukan ibunya. Setiap run unik dengan kombinasi boon dari dewa Olympus. Kematian bukan akhir melainkan awal bab baru. Roguelike dengan story paling komprehensif yang pernah ada.',
        price: 149000, discount: 25, genreId: 12,
        developer: 'Supergiant Games', publisher: 'Supergiant Games',
        releaseDate: new Date('2020-09-17'),
        platform: 'PC, PS4, PS5, Xbox, Switch',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1145360),
      },
      tags: ['Singleplayer', 'Roguelike', 'Hack and Slash', 'Story Rich', 'Controller Support'],
    },
    {
      data: {
        title: 'Hollow Knight',
        description: 'Sebagai Knight kecil bertopeng, jelajahi Hallownest yang gelap dan indah — ribuan kamar saling terhubung dengan rahasia dan bahayanya sendiri. Metroidvania 2D dengan seni tangan memukau dan soundtrack orkestral yang menghantui.',
        price: 99000, discount: 0, genreId: 12,
        developer: 'Team Cherry', publisher: 'Team Cherry',
        releaseDate: new Date('2017-02-24'),
        platform: 'PC, PS4, Xbox, Switch',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(367520),
      },
      tags: ['Singleplayer', 'Metroidvania', 'Atmospheric', 'Dark', 'Story Rich'],
    },
    {
      data: {
        title: 'Stardew Valley',
        description: 'Mewarisi ladang kakek di Pelican Town, kamu meninggalkan kehidupan korporat untuk memulai hidup baru sebagai petani. Dibuat sendirian oleh satu orang selama 4 tahun — bukti bahwa ketenangan sederhana pun bisa menjadi pengalaman gaming luar biasa.',
        price: 99000, discount: 0, genreId: 8,
        developer: 'ConcernedApe', publisher: 'ConcernedApe',
        releaseDate: new Date('2016-02-26'),
        platform: 'PC, PS4, Xbox, Switch, iOS, Android',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(413150),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Simulation', 'Crafting', 'Pixel Art', 'Co-op'],
    },
    {
      data: {
        title: 'Celeste',
        description: 'Madeline mendaki Celeste Mountain yang mencerminkan jiwa para pendakinya. Platformer presisi 2D yang menantang namun selalu fair. Di balik gameplay adiktif tersimpan narasi kesehatan mental yang tulus: "It\'s okay to struggle."',
        price: 99000, discount: 30, genreId: 11,
        developer: 'Maddy Makes Games', publisher: 'Maddy Makes Games',
        releaseDate: new Date('2018-01-25'),
        platform: 'PC, PS4, Xbox, Switch',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(504230),
      },
      tags: ['Singleplayer', 'Platformer', 'Story Rich', 'Pixel Art'],
    },
    {
      data: {
        title: 'Civilization VI',
        description: 'Mulai dari pemukiman kecil, bangun peradaban yang melampaui ujian ribuan tahun. Pilih pemimpin bersejarah, kembangkan teknologi, dan taklukkan dunia. Strategi 4X yang bisa dimainkan ratusan sesi tanpa pernah terasa sama.',
        price: 149000, discount: 60, genreId: 5,
        developer: 'Firaxis Games', publisher: '2K Games',
        releaseDate: new Date('2016-10-21'),
        platform: 'PC, PS4, Xbox, Switch',
        rating: 4.6, totalReviews: 0, isFeatured: false,
        thumbnail: steam(289070),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Turn-Based', 'Online'],
    },
    {
      data: {
        title: 'The Sims 4',
        description: 'Ciptakan karakter Sim dengan kepribadian unik, bangun rumah impian, dan jalani kehidupan yang kamu tentukan sendiri. Kini gratis dimainkan dengan ratusan expansion pack dan konten komunitas tersedia.',
        price: 0, discount: 0, genreId: 8,
        developer: 'Maxis', publisher: 'EA Games',
        releaseDate: new Date('2022-10-18'),
        platform: 'PC, PS4, PS5, Xbox',
        rating: 4.2, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1222670),
      },
      tags: ['Singleplayer', 'Simulation', 'Controller Support'],
    },
    {
      data: {
        title: 'EA Sports FC 25',
        description: 'Era baru sepak bola virtual dengan FC IQ — sistem taktis revolusioner. Rush mode 5v5 baru di Ultimate Team, Career Mode lebih kaya, dan lebih dari 19.000 pemain berlisensi dari 700+ tim resmi.',
        price: 699000, discount: 0, genreId: 6,
        developer: 'EA Canada', publisher: 'EA Sports',
        releaseDate: new Date('2024-09-27'),
        platform: 'PC, PS5, Xbox Series X, Switch',
        rating: 4.1, totalReviews: 0, isFeatured: false,
        thumbnail: steam(2235270),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Online', 'Controller Support'],
    },
    {
      data: {
        title: 'Minecraft',
        description: 'Dunia yang sepenuhnya terbuat dari balok — tidak ada batasan apa yang bisa kamu bangun, jelajahi, atau ciptakan. Dengan lebih dari 300 juta kopi terjual, Minecraft adalah game paling laris sepanjang masa.',
        price: 299000, discount: 0, genreId: 12,
        developer: 'Mojang Studios', publisher: 'Xbox Game Studios',
        releaseDate: new Date('2011-11-18'),
        platform: 'PC, PS4, PS5, Xbox, Switch, Mobile',
        rating: 4.8, totalReviews: 0, isFeatured: false,
        thumbnail: steam(2448590),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Sandbox', 'Crafting', 'Online', 'Co-op'],
    },
    // ── TAMBAHAN GAME ─────────────────────────────────────
{
  data: {
    title: 'Metal Gear Solid V',
    description: 'Venom Snake bangun kembali setelah 9 tahun koma untuk membalas dendam pada mereka yang menghancurkan Mother Base. Open world stealth action terbaik yang pernah dibuat Hideo Kojima — kebebasan taktis tanpa batas, AI musuh yang cerdas, dan sistem misi yang bisa diselesaikan ratusan cara berbeda.',
    price: 149000, discount: 70, genreId: 1,
    developer: 'Kojima Productions', publisher: 'Konami',
    releaseDate: new Date('2015-09-01'),
    platform: 'PC, PS4, Xbox One',
    rating: 4.7, totalReviews: 0, isFeatured: false,
    thumbnail: steam(287700),
  },
  tags: ['Singleplayer', 'Stealth', 'Open World', 'Third Person', 'Story Rich'],
},
{
  data: {
    title: 'Nioh 2',
    description: 'Jepang era Sengoku penuh dengan yokai ganas. Kamu adalah half-human half-yokai yang berjuang membantu menyatukan Jepang. Souls-like dengan sistem combat paling dalam — stance system, guardian spirit, dan burst counter membuat setiap pertarungan terasa seperti seni pertempuran.',
    price: 299000, discount: 40, genreId: 1,
    developer: 'Team Ninja', publisher: 'Koei Tecmo',
    releaseDate: new Date('2021-02-05'),
    platform: 'PC, PS4, PS5',
    rating: 4.7, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1325200),
  },
  tags: ['Singleplayer', 'Souls-like', 'Dark', 'Third Person', 'Co-op'],
},
{
  data: {
    title: 'Bloodborne',
    description: 'Kota Yharnam diselimuti wabah misterius yang mengubah penduduknya menjadi monster. Sebagai Hunter, selidiki misteri kota Gothic ini sambil menghadapi boss-boss yang mengerikan. Fastest-paced Souls-like dari FromSoftware dengan atmosfer Lovecraftian yang tak tertandingi.',
    price: 299000, discount: 0, genreId: 3,
    developer: 'FromSoftware', publisher: 'PlayStation Studios',
    releaseDate: new Date('2015-03-24'),
    platform: 'PS4, PS5',
    rating: 4.9, totalReviews: 0, isFeatured: false,
    thumbnail: 'https://image.api.playstation.com/cdn/EP9000/CUSA00207_00/bkyzHRFLbHpBPCCHxIJtNKmwUFnLkjqg.png',
  },
  tags: ['Singleplayer', 'Souls-like', 'Dark', 'Horror', 'Atmospheric'],
},
{
  data: {
    title: 'Ghost of Tsushima',
    description: 'Tahun 1274. Pulau Tsushima diserang pasukan Mongol. Samurai Jin Sakai harus memilih antara kode kehormatan bushido atau menjadi bayangan — Ghost — untuk melindungi rakyatnya. Open world Jepang feudal yang indah bak lukisan, dengan combat katana yang memuaskan.',
    price: 499000, discount: 10, genreId: 4,
    developer: 'Sucker Punch Productions', publisher: 'PlayStation Studios',
    releaseDate: new Date('2021-08-20'),
    platform: 'PC, PS4, PS5',
    rating: 4.8, totalReviews: 0, isFeatured: false,
    thumbnail: steam(2215430),
  },
  tags: ['Singleplayer', 'Open World', 'Story Rich', 'Third Person', 'Atmospheric'],
},
{
  data: {
    title: 'Returnal',
    description: 'Astronaut Selene terjebak dalam loop waktu di planet alien yang penuh bahaya. Setiap kematian membawanya kembali ke awal dengan semua item hilang — tapi lore terungkap lebih dalam setiap run. Bullet hell roguelike third-person yang menantang dengan presentasi AAA.',
    price: 449000, discount: 0, genreId: 3,
    developer: 'Housemarque', publisher: 'PlayStation Studios',
    releaseDate: new Date('2023-02-15'),
    platform: 'PC, PS5',
    rating: 4.6, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1649240),
  },
  tags: ['Singleplayer', 'Roguelike', 'Horror', 'Third Person', 'Atmospheric'],
},
{
  data: {
    title: 'It Takes Two',
    description: 'Cody dan May, pasangan yang akan bercerai, secara ajaib dikecilkan menjadi boneka oleh sihir putri mereka. Mereka harus bekerja sama melewati dunia yang penuh keajaiban untuk kembali ke tubuh asli. Co-op terbaik yang pernah ada — setiap level punya mechanic unik yang terus mengejutkan.',
    price: 249000, discount: 30, genreId: 4,
    developer: 'Hazelight Studios', publisher: 'EA Games',
    releaseDate: new Date('2021-03-26'),
    platform: 'PC, PS4, PS5, Xbox',
    rating: 4.9, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1426210),
  },
  tags: ['Multiplayer', 'Co-op', 'Story Rich', 'Third Person'],
},
{
  data: {
    title: 'Baldur\'s Gate 3',
    description: 'Diserang dan terinfeksi parasit Mind Flayer yang mengancam mengubahmu menjadi monster, kamu menjelajahi Faerûn bersama companions yang kompleks. RPG turn-based terbaik yang pernah dibuat — kebebasan pilihan yang belum pernah ada sebelumnya, dengan konsekuensi yang benar-benar terasa.',
    price: 599000, discount: 0, genreId: 2,
    developer: 'Larian Studios', publisher: 'Larian Studios',
    releaseDate: new Date('2023-08-03'),
    platform: 'PC, PS5, Xbox Series X',
    rating: 4.9, totalReviews: 0, isFeatured: true,
    thumbnail: steam(1086940),
  },
  tags: ['Singleplayer', 'Multiplayer', 'Turn-Based', 'Story Rich', 'Co-op'],
},
{
  data: {
    title: 'Forza Horizon 5',
    description: 'Mexico menjadi playground terbesar dalam sejarah Forza Horizon — dari hutan tropis, gunung berapi aktif, padang pasir, hingga kota bersejarah. Ratusan mobil lisensi resmi, cuaca dinamis yang mengubah jalanan secara real-time, dan open world yang bisa dieksplorasi tanpa batas.',
    price: 349000, discount: 20, genreId: 6,
    developer: 'Playground Games', publisher: 'Xbox Game Studios',
    releaseDate: new Date('2021-11-09'),
    platform: 'PC, Xbox Series X, Xbox One',
    rating: 4.7, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1551360),
  },
  tags: ['Singleplayer', 'Multiplayer', 'Online', 'Racing', 'Controller Support'],
},
{
  data: {
    title: 'Sea of Stars',
    description: 'Dua anak yang lahir saat solstice memiliki kekuatan sinar matahari dan bulan untuk melawan kegelapan. Turn-based RPG yang merayakan era SNES dengan pixel art modern yang memukau, battle system yang dinamis, dan narasi yang menyentuh hati. Salah satu indie RPG terbaik dekade ini.',
    price: 199000, discount: 0, genreId: 2,
    developer: 'Sabotage Studio', publisher: 'Sabotage Studio',
    releaseDate: new Date('2023-08-29'),
    platform: 'PC, PS4, PS5, Xbox, Switch',
    rating: 4.7, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1244090),
  },
  tags: ['Singleplayer', 'Turn-Based', 'Story Rich', 'Pixel Art', 'Co-op'],
},
{
  data: {
    title: 'Lies of P',
    description: 'Pinocchio dalam versi dark souls — di kota Krat yang dilanda kegilaan, boneka-boneka yang seharusnya melayani manusia kini membantai mereka. Lies of P mengambil cerita klasik dan memutarnya menjadi souls-like yang brutal dengan sistem kebohongan yang mempengaruhi cerita.',
    price: 349000, discount: 25, genreId: 2,
    developer: 'Round8 Studio', publisher: 'Neowiz',
    releaseDate: new Date('2023-09-19'),
    platform: 'PC, PS4, PS5, Xbox',
    rating: 4.5, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1627720),
  },
  tags: ['Singleplayer', 'Souls-like', 'Dark', 'Story Rich', 'Third Person'],
},
{
  data: {
    title: 'Dave the Diver',
    description: 'Di siang hari Dave menyelam ke Blue Hole yang misterius untuk menangkap ikan. Di malam hari ia mengelola restoran sushi. Perpaduan action RPG menyelam, management sim, dan petualangan cerita yang tidak pernah kehabisan kejutan. Indie gem yang tidak bisa berhenti dimainkan.',
    price: 149000, discount: 0, genreId: 12,
    developer: 'MINTROCKET', publisher: 'MINTROCKET',
    releaseDate: new Date('2023-06-28'),
    platform: 'PC, PS4, PS5, Switch',
    rating: 4.8, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1868140),
  },
  tags: ['Singleplayer', 'Simulation', 'Story Rich', 'Pixel Art'],
},
{
  data: {
    title: 'Armored Core VI',
    description: 'Kembalinya seri mecha action legendaris dari FromSoftware setelah 10 tahun absen. Pilot mecha bernama C4-621 dikirim ke planet Rubicon 3 yang kaya energi. Kustomisasi mecha yang mendalam, pertempuran vertikal yang intens, dan narasi yang kompleks tentang korporasi vs kebebasan.',
    price: 499000, discount: 15, genreId: 1,
    developer: 'FromSoftware', publisher: 'Bandai Namco',
    releaseDate: new Date('2023-08-25'),
    platform: 'PC, PS4, PS5, Xbox',
    rating: 4.6, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1888160),
  },
  tags: ['Singleplayer', 'Third Person', 'Story Rich', 'Controller Support'],
},
{
  data: {
    title: 'Like a Dragon: Ishin',
    description: 'Remake dari game Yakuza yang tidak pernah dirilis di luar Jepang. Kiryu Kazuma reinkarnasi sebagai Sakamoto Ryoma di Jepang era Bakumatsu — pedang samurai bertemu dengan senjata api dalam aksi yang mendebarkan. Perpaduan drama sejarah dan humor absurd yang khas seri Yakuza.',
    price: 349000, discount: 30, genreId: 1,
    developer: 'Ryu Ga Gotoku Studio', publisher: 'Sega',
    releaseDate: new Date('2023-02-22'),
    platform: 'PC, PS4, PS5, Xbox',
    rating: 4.5, totalReviews: 0, isFeatured: false,
    thumbnail: steam(1842520),
  },
  tags: ['Singleplayer', 'Story Rich', 'Third Person', 'Hack and Slash'],
},
  ];

  // ── Jalankan sequential dengan delay ──────────────────
  for (const { data, tags } of games) {
    await upsertGame(data, tags);
    await delay(200);
  }

  console.log(`\n✅ Selesai! Total: ${games.length} games`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
  });