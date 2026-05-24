require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('─────────────────────────────────────');
  console.log(`🎮  GameStore API`);
  console.log(`🚀  Running  → http://localhost:${PORT}`);
  console.log(`📦  Database → MySQL (Prisma)`);
  console.log('─────────────────────────────────────');
});