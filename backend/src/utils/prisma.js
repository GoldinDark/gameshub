const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=3&pool_timeout=10',
    },
  },
});

module.exports = prisma;