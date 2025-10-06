require('dotenv').config({
    path:
      process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
  });
  
  const { SitemapStream, streamToPromise } = require('sitemap');
  const { createWriteStream } = require('fs');
  const path = require('path');
const db = require('./db');
  
  (async () => {
    try {
      const hostname = process.env.HOSTNAME || 'http://localhost:3000';
      const result = await db.query('SELECT satellite_id FROM satellites');
      const satelliteIds = result.rows.map((row) => row.satellite_id);
  
      const links = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        ...satelliteIds.map((id) => ({
          url: `/satellite/${id}`,
          changefreq: 'monthly',
          priority: 0.8,
        })),
      ];
  
      const sitemapStream = new SitemapStream({ hostname });
      const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');  
      const writeStream = createWriteStream(sitemapPath);
      sitemapStream.pipe(writeStream);
  
      for (const link of links) {
        sitemapStream.write(link);
      }
      sitemapStream.end();
  
      await streamToPromise(sitemapStream);
  
      console.log('Sitemap generated successfully.');
    } catch (error) {
      console.error('Error generating sitemap:', error);
  } finally {
      await db.close();
  }
})();
  
