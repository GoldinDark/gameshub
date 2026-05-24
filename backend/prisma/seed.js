const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Steam CDN URL helper
const steam = (appId) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

async function main() {

  // ── GENRE ──────────────────────────────────────────────
  const genres = await Promise.all([
    prisma.genre.upsert({ where: { slug: 'action' },      update: {}, create: { name: 'Action',      slug: 'action' } }),
    prisma.genre.upsert({ where: { slug: 'rpg' },         update: {}, create: { name: 'RPG',          slug: 'rpg' } }),
    prisma.genre.upsert({ where: { slug: 'horror' },      update: {}, create: { name: 'Horror',       slug: 'horror' } }),
    prisma.genre.upsert({ where: { slug: 'adventure' },   update: {}, create: { name: 'Adventure',    slug: 'adventure' } }),
    prisma.genre.upsert({ where: { slug: 'strategy' },    update: {}, create: { name: 'Strategy',     slug: 'strategy' } }),
    prisma.genre.upsert({ where: { slug: 'sports' },      update: {}, create: { name: 'Sports',       slug: 'sports' } }),
    prisma.genre.upsert({ where: { slug: 'fighting' },    update: {}, create: { name: 'Fighting',     slug: 'fighting' } }),
    prisma.genre.upsert({ where: { slug: 'simulation' },  update: {}, create: { name: 'Simulation',   slug: 'simulation' } }),
    prisma.genre.upsert({ where: { slug: 'shooter' },     update: {}, create: { name: 'Shooter',      slug: 'shooter' } }),
    prisma.genre.upsert({ where: { slug: 'open-world' },  update: {}, create: { name: 'Open World',   slug: 'open-world' } }),
    prisma.genre.upsert({ where: { slug: 'platformer' },  update: {}, create: { name: 'Platformer',   slug: 'platformer' } }),
    prisma.genre.upsert({ where: { slug: 'indie' },       update: {}, create: { name: 'Indie',        slug: 'indie' } }),
  ]);
  console.log('✅ Genres:', genres.length);

  // ── TAGS ───────────────────────────────────────────────
  const tagNames = [
  'Singleplayer', 'Multiplayer', 'Co-op', 'Open World',
  'Story Rich', 'Dark', 'Gore', 'Survival', 'Stealth',
  'Hack and Slash', 'Turn-Based', 'Third Person', 'First Person',
  'Online', 'Controller Support', 'Atmospheric', 'Horror',
  'Simulation', 'Roguelike', 'Pixel Art', 'Crafting', 'Sandbox',
  'Souls-like', 'Metroidvania', 'Puzzle', 'Racing', 'Platformer',
];
  for (const name of tagNames) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
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

  // ══════════════════════════════════════════════════════
  // DATA GAMES — 35 GAME
  // ══════════════════════════════════════════════════════
  const games = [

    // ── HORROR ─────────────────────────────────────────
    {
      data: {
        title:       'Resident Evil 4 Remake',
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
        title:       'Resident Evil Village',
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
        title:       'Alan Wake 2',
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

    // ── ACTION ─────────────────────────────────────────
    {
      data: {
        title:       'God of War Ragnarök',
        description: 'Fimbulwinter telah datang, pertanda Ragnarök semakin dekat. Kratos dan Atreus harus menjelajahi semua Sembilan Alam Norse untuk menemukan jawaban atas takdir yang telah diramalkan. Menghadapi Odin yang penuh siasat, Thor yang ganas, dan dewa-dewa lain yang berniat menghancurkan mereka. Sebuah perjalanan epik tentang ayah dan anak, pilihan sulit, dan harga dari kebebasan. Combat yang lebih brutal, dunia yang lebih luas, dan narasi yang mengharukan.',
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
        title:       'Devil May Cry 5',
        description: 'Lima tahun setelah kejadian di Fortuna, pohon iblis raksasa muncul di kota Redgrave dan mengancam peradaban manusia. Dante, Nero, dan misterius V bersatu untuk menghentikan ancaman terbesar yang pernah mereka hadapi. DMC5 adalah puncak dari seri action dengan sistem combat paling mendalam — combo meter yang meledak, weapon variety yang kaya, dan boss fight yang epik. Style meter S-SSS tidak pernah terasa sepuaskan ini.',
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
        title:       'Sekiro: Shadows Die Twice',
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
        title:       'Batman: Arkham Knight',
        description: 'Malam terakhir Batman di Gotham City. Scarecrow mengancam meracuni seluruh kota dengan toxin ketakutan, sementara musuh lama bersatu dalam Arkham Knight — sosok misterius yang tampaknya mengenal Bruce Wayne dari dalam. Kendarai Batmobile untuk pertama kalinya, hadapi teka-teki Riddler yang semakin gila, dan ungkap kebenaran yang mengguncang. Gotham yang indah namun gelap menanti untuk dijelajahi dari udara.',
        price: 149000, discount: 50, genreId: 1,
        developer: 'Rocksteady Studios', publisher: 'Warner Bros',
        releaseDate: new Date('2015-06-23'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.6, totalReviews: 0, isFeatured: false,
        thumbnail: steam(208650),
      },
      tags: ['Singleplayer', 'Open World', 'Stealth', 'Third Person', 'Story Rich'],
    },

    // ── RPG ────────────────────────────────────────────
    {
      data: {
        title:       'Persona 5 Royal',
        description: 'Ryuji Sakamoto dan kawan-kawan membentuk Phantom Thieves of Hearts — kelompok remaja yang masuk ke Metaverse, dimensi bawah sadar manusia, untuk mencuri hati orang-orang korup. Di dunia nyata, Joker menjalani kehidupan sebagai pelajar SMA biasa di Tokyo yang penuh tekanan akademis dan sosial. Persona 5 Royal menyempurnakan masterpiece dengan konten baru, karakter baru Kasumi Yoshizawa, semester ketiga yang mengubah segalanya, dan soundtrack jazz yang akan terus terngiang.',
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
        title:       'Elden Ring',
        description: 'George R.R. Martin dan Hidetaka Miyazaki berkolaborasi menciptakan dunia Lands Between yang luar biasa kaya — hancur setelah Elden Ring dipecahkan oleh para demigod serakah. Sebagai Tarnished yang bangkit dari kematian, kamu menjelajahi dunia open world masif penuh rahasia, dungeon tersembunyi, dan boss-boss legendaris yang akan menguji kesabaran dan skill sampai batasnya. Kebebasan eksplorasi bertemu dengan kedalaman lore yang tiada habisnya.',
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
        title:       'Cyberpunk 2077',
        description: 'Night City, 2077 — kota paling berbahaya dan paling memukau di Amerika. V, mercenary berbakat, mendapat pekerjaan yang seharusnya mudah berubah menjadi bencana. Terjebak dengan jiwa Johnny Silverhand — rocker legendaris yang sudah mati selama 50 tahun — di dalam kepalanya, V harus mencari cara bertahan sebelum identitasnya terhapus sepenuhnya. RPG open world dengan pilihan cerita yang benar-benar bermakna dan Night City yang hidup seperti kota nyata.',
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
        title:       'The Witcher 3: Wild Hunt',
        description: 'Geralt of Rivia, pemburu monster profesional dengan rambut putih dan mata kucing, mencari Ciri — putri angkatnya yang dikejar Wild Hunt, para pengendara hantu dari dimensi lain. Perjalanan melintasi Northern Kingdoms yang luas, dari padang rumput Velen yang suram hingga kota Novigrad yang ramai dan kepulauan Skellige yang bersalju. Lebih dari 200 jam konten dengan quest yang masing-masing berkualitas setara game penuh. Keputusan moral yang benar-benar berdampak pada ending.',
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
        title:       'Final Fantasy XVI',
        description: 'Di dunia Valisthea yang dikuasai kristal ajaib bernama Mothercrystals, kekuatan Eikon — dewa-dewa destruktif yang bersemayam dalam tubuh manusia — menjadi rebutan antar kerajaan. Clive Rosfield, putra Duke Rosaria, menyaksikan kehancuran hidupnya dalam satu malam kelam. Dimulai dari dendam pribadi, perjalanannya berkembang menjadi perjuangan membebaskan dunia dari siklus kematian yang telah berlangsung ribuan tahun. Action RPG dengan combat real-time yang memukau dan skala epik.',
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
        title:       'Dark Souls III',
        description: 'Api mulai padam untuk terakhir kalinya. Lima Lord of Cinder yang seharusnya mengumpan api malah bangkit dari takhta mereka. Sebagai Ashen One, kamu harus memaksa mereka kembali dan memutuskan nasib dunia. Dark Souls III adalah klimaks dari trilogi legendaris FromSoftware — tempo combat yang lebih cepat, lokasi yang lebih beragam, dan boss fight yang paling ikonik dalam sejarah genre. Tiap kematian adalah pelajaran, tiap kemenangan adalah pencapaian.',
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
        title:       'Monster Hunter: World',
        description: 'Bergabunglah dengan Fifth Fleet dan berlayar ke New World — daratan raksasa yang belum terpetakan, rumah bagi ekosistem monster yang belum pernah dilihat manusia. Sebagai Hunter, tugasmu bukan hanya membunuh — tapi memahami perilaku, kelemahan, dan habitat setiap monster untuk bertahan hidup dan membuat gear terkuat. Cooperative hunting untuk 4 orang, 14 jenis senjata dengan playstyle unik, dan dunia yang terasa hidup dengan interaksi antar monster yang terjadi secara real-time.',
        price: 249000, discount: 30, genreId: 1,
        developer: 'Capcom', publisher: 'Capcom',
        releaseDate: new Date('2018-08-09'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(582010),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Co-op', 'Online', 'Third Person', 'Controller Support'],
    },

    // ── ADVENTURE ──────────────────────────────────────
    {
      data: {
        title:       'The Last of Us Part I',
        description: 'Dua puluh tahun setelah pandemi jamur Cordyceps menghancurkan peradaban, Joel — seorang penyintas keras yang kehilangan segalanya — diperintahkan menyelundupkan Ellie melintasi Amerika yang sudah runtuh. Ellie bukan gadis biasa: ia kebal terhadap infeksi yang telah mengubah jutaan orang menjadi monster. Perjalanan mereka penuh bahaya dari manusia dan makhluk terinfeksi, namun yang paling berharga adalah ikatan yang tumbuh perlahan di antara keduanya. Remake dengan grafis memukau yang mendefinisikan ulang standar visual gaming.',
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
        title:       'Spider-Man: Miles Morales',
        description: 'Miles Morales masih belajar menjadi Spider-Man ketika Peter Parker pergi ke Eropa. Saat itu, perang antara korporasi energi raksasa Roxxon dan kelompok hacker Tinkerer mengancam menghancurkan Harlem — kampung halaman Miles. Dengan kekuatan bio-electric venom strike dan kemampuan kamuflase yang unik, Miles harus membuktikan dirinya layak menyandang nama Spider-Man. Kisah coming-of-age yang mengharukan dengan latar musim salju New York yang indah.',
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
        title:       'Hogwarts Legacy',
        description: 'Abad ke-19, dunia sihir tengah bergolak. Sebagai mahasiswa baru Hogwarts yang aneh — kamu bisa merasakan Ancient Magic kuno yang seharusnya sudah hilang ribuan tahun lalu — kamu terlibat dalam konspirasi yang mengancam seluruh komunitas penyihir. Jelajahi kastil Hogwarts yang megah hingga ke sudut-sudut tersembunyi, terbang dengan sapu, pelihara Hippogriff, dan kuasai ratusan mantra. Dunia Harry Potter yang paling imersif dan bebas yang pernah ada.',
        price: 549000, discount: 20, genreId: 4,
        developer: 'Avalanche Software', publisher: 'Warner Bros',
        releaseDate: new Date('2023-02-10'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.6, totalReviews: 0, isFeatured: false,
        thumbnail: steam(990080),
      },
      tags: ['Singleplayer', 'Open World', 'Story Rich', 'Third Person', 'Atmospheric'],
    },

    // ── OPEN WORLD ─────────────────────────────────────
    {
      data: {
        title:       'Red Dead Redemption 2',
        description: 'Amerika 1899. Era Wild West hampir berakhir, digantikan modernisasi yang menekan kaum outlaws ke sudut. Arthur Morgan, anggota setia geng Van der Linde, mulai mempertanyakan jalan hidup yang telah ia pilih ketika loyalitasnya diuji dari segala arah. Open world paling detail yang pernah dibuat — dari padang rumput luas hingga rawa Louisiana, dari salju Grizzly Mountains hingga kota St. Denis yang elegan. Setiap NPC punya rutinitas, setiap keputusan punya konsekuensi, setiap momen terasa nyata.',
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
        title:       'Grand Theft Auto V',
        description: 'Los Santos — kota impian California yang penuh dengan kemewahan palsu dan kriminalitas nyata. Tiga protagonist dengan kepribadian berbeda: Michael De Santa si mantan perampok bank yang bosan hidup teratur, Trevor Philips si psikopat genius yang tidak kenal batas, dan Franklin Clinton si pemuda dari Southside yang ingin lebih dari sekadar kehidupan jalanan. Tiga jalan hidup yang berpotongan dalam heist terbesar yang pernah dirancang. Plus GTA Online yang terus hidup dengan konten baru selama lebih dari satu dekade.',
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
        title:       'Assassin\'s Creed Odyssey',
        description: 'Yunani Kuno, 431 SM — saat Perang Peloponnesia antara Athena dan Sparta membakar seluruh negeri. Kamu adalah keturunan Leonidas, seorang misthios (tentara bayaran) yang terlempar ke tengah konflik terbesar zaman kuno. Pilih jalan sebagai Alexios atau Kassandra, jelajahi kepulauan Yunani yang luar biasa indah, selami mitologi dengan monster-monster legendaris, dan ungkap konspirasi kultus rahasia yang memanipulasi perang dari balik layar. RPG terbesar dalam sejarah Assassin\'s Creed.',
        price: 199000, discount: 60, genreId: 10,
        developer: 'Ubisoft Quebec', publisher: 'Ubisoft',
        releaseDate: new Date('2018-10-05'),
        platform: 'PC, PS4, Xbox One',
        rating: 4.5, totalReviews: 0, isFeatured: false,
        thumbnail: steam(812140),
      },
      tags: ['Singleplayer', 'Open World', 'Story Rich', 'Third Person', 'Controller Support'],
    },

    // ── SHOOTER ────────────────────────────────────────
    {
      data: {
        title:       'Counter-Strike 2',
        description: 'Game FPS kompetitif paling berpengaruh dalam sejarah gaming kini hadir dengan engine Source 2 yang sepenuhnya baru. CS2 membawa perubahan fundamental: smoke grenade yang kini bereaksi secara volumetrik dengan lingkungan sekitarnya, pencahayaan real-time yang mengubah visual secara dramatis, dan sistem subtick yang membuat setiap tembakan terasa lebih akurat dari sebelumnya. Komunitas terbesar, turnamen paling prestisius, dan skill gap yang mengharuskan ratusan jam latihan untuk benar-benar menguasainya.',
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
        title:       'Apex Legends',
        description: 'Di Outlands yang brutal, hanya yang terbaik yang bertahan dalam Apex Games — turnamen maut yang disiarkan ke seluruh galaksi. Pilih dari roster Legend yang terus berkembang, masing-masing dengan kemampuan taktis unik yang bisa dikombinasikan dalam squad 3 orang. Movement system yang fluid dengan bunny hop, wall bounce, dan zipline membuat setiap pertandingan terasa dinamis. Ping system revolusioner yang membuat komunikasi tanpa suara pun efektif. Free-to-play terbaik di genre battle royale.',
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
        title:       'Deep Rock Galactic',
        description: 'Space is never big enough when you\'re a dwarf with a gun! Bergabung dengan Deep Rock Galactic — perusahaan pertambangan antariksa yang mengirim tim Dwarf ke planet Hoxxes IV yang sangat berbahaya, dipenuhi serangga alien raksasa. Pilih kelas Driller, Scout, Gunner, atau Engineer — masing-masing dengan kemampuan unik yang saling melengkapi. Cave system yang di-generate secara prosedural memastikan tidak ada dua misi yang sama. Co-op terbaik yang pernah ada dengan komunitas paling friendly di gaming.',
        price: 149000, discount: 40, genreId: 9,
        developer: 'Ghost Ship Games', publisher: 'Coffee Stain Publishing',
        releaseDate: new Date('2020-05-13'),
        platform: 'PC, PS4, PS5, Xbox',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(548430),
      },
      tags: ['Multiplayer', 'Co-op', 'Online', 'First Person', 'Controller Support'],
    },

    // ── FIGHTING ───────────────────────────────────────
    {
      data: {
        title:       'Mortal Kombat 1',
        description: 'Liu Kang yang telah menjadi Fire God menciptakan New Era — timeline baru yang seharusnya damai. Namun kekacauan datang dari dimensi lain ketika Shang Tsung memulai rencana tergelapnya. MK1 merevolusi seri dengan sistem Kameo Fighter yang memungkinkan karakter pendukung dipanggil kapan saja untuk combo mematikan. Grafis paling realistis dalam sejarah series, Fatality yang semakin kreatif dan brutal, plus Invasions mode yang kaya konten untuk pemain solo.',
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
        title:       'Street Fighter 6',
        description: 'Era baru Street Fighter dimulai dengan sistem Drive yang menghadirkan lapisan strategi baru — setiap keputusan menggunakan Drive Gauge bisa menjadi penentu kemenangan atau kekalahan. World Tour Mode mengajak kamu menjelajahi Metro City ala RPG, belajar gaya bertarung dari setiap karakter, dan membangun avatar dengan kemampuan unik. Battle Hub sebagai lobby online interaktif. Roster yang beragam dari veteran Ryu dan Ken hingga pendatang baru yang segar. Definitif fighting game tahun ini.',
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
        title:       'Tekken 8',
        description: 'Pertarungan antara ayah dan anak mencapai puncaknya. Kazuya Mishima, kini mengendalikan G Corporation dan memicu perang dunia, berhadapan dengan Jin Kazama yang berjuang memutus kutukan Blood of Devil dalam tubuhnya. Tekken 8 memperkenalkan Heat System — mode agresif yang mendorong pemain untuk menyerang dan menciptakan momen-momen dramatis. 32 karakter dengan movesets yang diperdalam, grafis Unreal Engine 5 yang memukau, dan story mode sinematik berkualitas film aksi.',
        price: 549000, discount: 0, genreId: 7,
        developer: 'Bandai Namco', publisher: 'Bandai Namco',
        releaseDate: new Date('2024-01-26'),
        platform: 'PC, PS5, Xbox Series X',
        rating: 4.7, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1778820),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Online', 'Story Rich', 'Controller Support'],
    },

    // ── INDIE ──────────────────────────────────────────
    {
      data: {
        title:       'Hades',
        description: 'Zagreus, putra Hades yang pemberontak, berjuang melarikan diri dari Dunia Bawah untuk menemukan ibunya di permukaan bumi. Setiap upaya pelarian adalah roguelike run yang unik — kombinasi boon dari dewa Olympus, senjata dari Armory, dan rahasia yang terungkap perlahan membangun narasi yang semakin kaya. Kematian bukan akhir melainkan awal bab baru. Supergiant Games menciptakan roguelike dengan story paling komprehensif dan karakter paling berkesan.',
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
        title:       'Hollow Knight',
        description: 'Sebuah kerajaan serangga kuno terkubur jauh di bawah tanah, perlahan terlupakan oleh sejarah. Sebagai Knight kecil bertopeng, kamu menjelajahi Hallownest yang gelap dan indah — ribuan kamar yang saling terhubung, masing-masing dengan rahasia dan bahayanya sendiri. Metroidvania 2D dengan seni tangan yang memukau, soundtrack orkestral yang menghantui, dan tingkat kesulitan yang menantang tanpa pernah terasa tidak adil. 40+ jam konten dengan 4 DLC gratis. Capolavoro indie yang mendefinisikan genre.',
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
        title:       'Stardew Valley',
        description: 'Mewarisi ladang kakek di desa Pelican Town, kamu meninggalkan kehidupan korporat yang melelahkan untuk memulai hidup baru sebagai petani. Tanam sayuran, pelihara hewan ternak, perbaiki tambang yang rusak, jalin persahabatan dengan penduduk desa yang unik, dan mungkin temukan cinta. Stardew Valley dibuat sendirian oleh satu orang selama 4 tahun dan menjadi salah satu game paling dicintai sepanjang masa — bukti bahwa ketenangan dan kebahagiaan sederhana pun bisa menjadi pengalaman gaming yang luar biasa.',
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
        title:       'Celeste',
        description: 'Madeline, seorang gadis muda yang berjuang dengan kecemasan dan depresi, memutuskan mendaki Celeste Mountain — puncak misterius yang dikatakan mencerminkan jiwa para pendakinya. Platformer presisi 2D yang menantang namun selalu fair, dengan checkpoint yang sering sehingga frustrasi tidak pernah berlebihan. Namun di balik gameplay yang adiktif tersimpan narasi kesehatan mental yang tulus dan mengharukan. Salah satu game dengan pesan paling bermakna: "It\'s okay to struggle."',
        price: 99000, discount: 30, genreId: 11,
        developer: 'Maddy Makes Games', publisher: 'Maddy Makes Games',
        releaseDate: new Date('2018-01-25'),
        platform: 'PC, PS4, Xbox, Switch',
        rating: 4.9, totalReviews: 0, isFeatured: false,
        thumbnail: steam(504230),
      },
      tags: ['Singleplayer', 'Platformer', 'Story Rich', 'Pixel Art'],
    },

    // ── STRATEGY ───────────────────────────────────────
    {
      data: {
        title:       'Civilization VI',
        description: 'Mulai dari pemukiman kecil di tengah padang liar, bangun peradaban yang akan melampaui ujian ribuan tahun sejarah. Pilih pemimpin dari sejarah dunia nyata — dari Kleopatra hingga Gandhi, dari Napoleon hingga Soekarno — masing-masing dengan bonus dan agenda unik. Kembangkan teknologi, dirikan agama, bangun Wonder dunia, atau taklukkan musuh dengan kekuatan militer. Strategi 4X yang bisa dimainkan puluhan bahkan ratusan sesi tanpa pernah terasa sama karena world generation yang prosedural.',
        price: 149000, discount: 60, genreId: 5,
        developer: 'Firaxis Games', publisher: '2K Games',
        releaseDate: new Date('2016-10-21'),
        platform: 'PC, PS4, Xbox, Switch, iOS, Android',
        rating: 4.6, totalReviews: 0, isFeatured: false,
        thumbnail: steam(289070),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Turn-Based', 'Online'],
    },

    // ── SIMULATION ─────────────────────────────────────
    {
      data: {
        title:       'The Sims 4',
        description: 'Ciptakan karakter Sim dengan kepribadian unik, bangun rumah impian dari nol, dan jalani kehidupan yang kamu tentukan sendiri — karir sebagai astronaut, chef, musisi, atau bahkan penjahat. The Sims 4 kini gratis dimainkan, dengan ratusan expansion pack dan konten komunitas yang tersedia. Buat keluarga, bangun persahabatan, atau hancurkan segalanya dengan tangan tanpa kolam renang. Tidak ada game lain yang memberikan kebebasan bercerita seperti The Sims.',
        price: 0, discount: 0, genreId: 8,
        developer: 'Maxis', publisher: 'EA Games',
        releaseDate: new Date('2022-10-18'),
        platform: 'PC, PS4, PS5, Xbox',
        rating: 4.2, totalReviews: 0, isFeatured: false,
        thumbnail: steam(1222670),
      },
      tags: ['Singleplayer', 'Simulation', 'Controller Support'],
    },

    // ── SPORTS ─────────────────────────────────────────
    {
      data: {
        title:       'EA Sports FC 25',
        description: 'Era baru sepak bola virtual dimulai. FC 25 menghadirkan FC IQ — sistem taktis revolusioner yang memberikan pemahaman posisional mendalam kepada setiap pemain di lapangan, menciptakan pertandingan yang lebih realistis dan dinamis. Rush mode baru untuk 5v5 yang seru di Ultimate Team. Career Mode dengan fitur manajemen yang lebih kaya. Lebih dari 19.000 pemain berlisensi dari 700+ tim resmi. HyperMotion V memastikan setiap animasi terasa organik dan manusiawi.',
        price: 699000, discount: 0, genreId: 6,
        developer: 'EA Canada', publisher: 'EA Sports',
        releaseDate: new Date('2024-09-27'),
        platform: 'PC, PS5, Xbox Series X, Switch',
        rating: 4.1, totalReviews: 0, isFeatured: false,
        thumbnail: steam(2235270),
      },
      tags: ['Singleplayer', 'Multiplayer', 'Online', 'Controller Support'],
    },

    // ── SANDBOX/INDIE ──────────────────────────────────
    {
      data: {
        title:       'Minecraft',
        description: 'Dunia yang sepenuhnya terbuat dari balok — tidak ada batasan apa yang bisa kamu bangun, jelajahi, atau ciptakan. Di siang hari, tambang bijih, tebang pohon, dan bangun tempat berlindung. Di malam hari, bertahan dari creeper dan zombie yang mencari mangsa. Atau mainkan Creative Mode dan jadikan imajinasimu kenyataan — dari replika Eiffel Tower hingga komputer fungsional dalam game. Dengan lebih dari 300 juta kopi terjual, Minecraft adalah game paling laris sepanjang masa.',
        price: 299000, discount: 0, genreId: 12,
        developer: 'Mojang Studios', publisher: 'Xbox Game Studios',
        releaseDate: new Date('2011-11-18'),
        platform: 'PC, PS4, PS5, Xbox, Switch, Mobile',
        rating: 4.8, totalReviews: 0, isFeatured: false,
        thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2448590/header.jpg',
      },
      tags: ['Singleplayer', 'Multiplayer', 'Sandbox', 'Crafting', 'Online', 'Co-op'],
    },
  ];

  for (const { data, tags } of games) {
    await upsertGame(data, tags);
  }

  console.log(`\n✅ Selesai! Total: ${games.length} games`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });