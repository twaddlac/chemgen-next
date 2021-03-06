var knex = {}
//This should only happen in the testing database
try {
  knex = require('knex')({
    client: 'mysql',
    connection: {
      host: process.env.CHEMGEN_HOST || 'localhost',
      user: process.env.CHEMGEN_USER || 'chemgen',
      password: process.env.CHEMGEN_PASS || 'password',
      database: process.env.CHEMGEN_DB || 'chemgen-next-dev',
    },
    debug: true,
  })
} catch (error) {
  knex = {}
}

module.exports = {
  site: process.env.SITE || 'DEV',
  imageConversionHost: 'pyrite.abudhabi.nyu.edu',
  imageConversionPort: '3001',
  wpUrl: process.env.WP_SITE || 'http://onyx.abudhabi.nyu.edu/wordpress',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6380,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',
  imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
  sites: {
    AD: {
      imageConversionHost: 'pyrite.abudhabi.nyu.edu',
      imageConversionPort: '3001',
      wpUrl: process.env.WP_SITE || 'http://onyx.abudhabi.nyu.edu/chemgen-next',
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: process.env.REDIS_PORT || 6379,
      // baseImageSite: process.env.IMAGE_URL || 'http://onyx.abudhabi.nyu.edu/images',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
    },
    NY: {
      imageConversionHost: 'pyxis.nyu.edu',
      imageConversionPort: '3001',
      wpUrl: process.env.WP_SITE || 'http://onyx.abudhabi.nyu.edu/wordpress',
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: process.env.REDIS_PORT || 6379,
      imageUrl:  'http://eegi.bio.nyu.edu/image',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      // imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
    },
    DEV: {
      imageConversionHost: 'pyrite.abudhabi.nyu.edu',
      imageConversionPort: '3001',
      wpUrl: process.env.WP_SITE || 'http://localhost:8080',
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: process.env.REDIS_PORT || 6380,
      // baseImageSite: process.env.IMAGE_URL || 'http://onyx.abudhabi.nyu.edu/images',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',
      imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
    }
  },
  knex: knex,
}
