// src/modules/google-feeds/config/google-feeds.config.ts

export const GOOGLE_FEED_CONFIG = {
    // Feed generation settings
    DAYS_AHEAD: 180, // 6 months
    DEFAULT_ADULTS: 2,
    DEFAULT_CHILDREN: 0,
    DEFAULT_ROOMS: 1,
    DEFAULT_NIGHTS: 1,

    // XML Namespaces
    XML_VERSION: '1.0',
    XML_ENCODING: 'UTF-8',

    // ✅ NEW: Parallel processing settings
    BATCH_SIZE: 10, // Process 10 properties at a time
    CONCURRENT_DATE_REQUESTS: 30, // Fetch 30 dates in parallel per property
    DELAY_BETWEEN_BATCHES: 100, // 100ms delay between batches

    // Cache settings
    CACHE_TTL_MINUTES: 60,
};
