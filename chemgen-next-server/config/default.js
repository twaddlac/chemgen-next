var knex = {}
//This should only happen in the testing database
try {
  knex = require('knex')({
    client: 'mysql',
    connection: {
      host: process.env.CHEMGEN_HOST,
      user: process.env.CHEMGEN_USER,
      password: process.env.CHEMGEN_PASS,
      database: process.env.CHEMGEN_DB,
    },
    debug: true,
  })
} catch (error) {
  knex = {}
}

module.exports = {
  site: process.env.SITE,
  imageConversionHost: 'pyrite.abudhabi.nyu.edu',
  imageConversionPort: '3001',
  wpUrl: process.env.WP_SITE || 'http://onyx.abudhabi.nyu.edu/wordpress',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6380,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
  sites: {
    AD: {
      imageConversionHost: 'pyrite.abudhabi.nyu.edu',
      imageConversionPort: '3001',
      wpUrl: process.env.WP_SITE || 'http://onyx.abudhabi.nyu.edu/wordpress',
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: process.env.REDIS_PORT || 6379,
      baseImageSite: process.env.IMAGE_URL || 'http://onyx.abudhabi.nyu.edu/images',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
    },
    NY: {
      imageConversionHost: 'pyxis.nyu.edu',
      imageConversionPort: '3001',
      wpUrl: process.env.WP_SITE || 'http://onyx.abudhabi.nyu.edu/wordpress',
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: process.env.REDIS_PORT || 6379,
      baseImageSite: process.env.IMAGE_URL || 'http://pyxis.nyu.edu/images',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
    },
    DEV: {
      imageConversionHost: 'pyrite.abudhabi.nyu.edu',
      imageConversionPort: '3001',
      wpUrl: process.env.WP_SITE || 'http://localhost',
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: process.env.REDIS_PORT || 6379,
      baseImageSite: process.env.IMAGE_URL || 'http://onyx.abudhabi.nyu.edu/images',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6380',
      imageUrl: process.env.IMAGE_URL || 'http://10.230.9.227/microscope',
    }
  },
  knex: knex,
}
