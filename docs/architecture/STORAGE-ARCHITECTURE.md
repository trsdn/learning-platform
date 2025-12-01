# Storage Architecture Documentation

## Overview

The MindForge Academy learning platform uses a **hybrid storage architecture** combining cloud database (Supabase) for learning data and browser storage for UI preferences and caching.

## Storage Layers

### 1. Supabase (Cloud Database) ☁️

**Purpose**: Primary data storage for all learning content and user progress

**What's Stored**:
- ✅ Topics and learning paths
- ✅ Tasks and questions
- ✅ Practice sessions and results
- ✅ User progress and statistics
- ✅ User authentication state

**Technology**: PostgreSQL database hosted on Supabase

**Location**: Cloud (https://knzjdckrtewoigosaxoh.supabase.co)

**Access**: Via Supabase client SDK

**Files**:
- `src/modules/storage/repositories/supabase-*.ts` - Repository implementations
- `src/modules/storage/supabase-client.ts` - Client configuration

---

### 2. localStorage (Browser Storage) 💾

**Purpose**: Store user preferences that persist across sessions

**What's Stored**:

#### `mindforge.app-settings.v1`
User interface preferences:
- Theme mode (light/dark/system)
- Font scale (small/medium/large/x-large)
- Animation preferences
- Reduced motion setting
- Audio autoplay preferences

#### `audioSettings` (Legacy)
Audio playback preferences:
- Auto-play enabled/disabled

**Technology**: Browser localStorage API

**Location**: Browser's local storage (typically in browser profile directory)

**Size Limit**: ~5-10MB per domain (browser-dependent)

**Files**:
- `src/modules/core/services/settings-service.ts` - Settings management
- `src/modules/storage/adapters/audio-settings-storage.ts` - Audio settings

**Clearing Data**:
```javascript
// Clear all settings
localStorage.removeItem('mindforge.app-settings.v1');
localStorage.removeItem('audioSettings');
```

---

### 3. IndexedDB (Browser Database) 🗄️

**Purpose**: Service Worker cache management for PWA functionality

**Database Name**: `mindforge-academy`

**Created By**: Workbox (Service Worker library)

**What's Stored**:

#### Cache Stores
1. **`workbox-precache-v2-...`**
   - Precached application assets
   - JavaScript bundles
   - CSS stylesheets
   - HTML files
   - Images and icons

2. **`api-cache-v2`**
   - Cached API responses
   - 5-minute TTL
   - Max 50 entries

3. **`google-fonts-stylesheets-v2`**
   - Google Fonts CSS
   - 1-year TTL
   - Max 10 entries

4. **`google-fonts-webfonts-v2`**
   - Font files (WOFF2)
   - 1-year TTL
   - Max 30 entries

5. **`images-cache-v2`**
   - Images (PNG, JPG, SVG, WebP, ICO)
   - 30-day TTL
   - Max 60 entries

6. **`static-resources-v2`**
   - JS, CSS, WOFF2 files
   - 7-day TTL
   - Max 100 entries
   - Stale-while-revalidate strategy

7. **`audio-pronunciations`**
   - Spanish/English pronunciation MP3 files
   - 30-day TTL
   - Max 200 entries

**Technology**: IndexedDB + Workbox

**Location**: Browser's IndexedDB storage

**Size**: Can grow to several hundred MB (depends on cached content)

**Files**:
- `vite.config.ts` - PWA configuration
- `dist/sw.js` - Generated service worker

**Cache Strategies**:
- **CacheFirst**: Serve from cache, fallback to network (fonts, audio, images)
- **NetworkFirst**: Try network first, fallback to cache (API calls)
- **StaleWhileRevalidate**: Serve from cache, update in background (static resources)

**Clearing Cache**:
```javascript
// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Or via DevTools:
// Application → Storage → Clear site data
```

---

## Storage Distribution

```
┌─────────────────────────────────────────────────────────┐
│                  MindForge Academy                       │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
    ☁️ Supabase                    🖥️ Browser Storage
    (Cloud Database)               (Local Storage)
        │                               │
        ├─ Topics                       ├─ localStorage
        ├─ Learning Paths               │  ├─ UI Settings
        ├─ Tasks                        │  └─ Audio Prefs
        ├─ Sessions                     │
        ├─ User Progress                └─ IndexedDB (PWA Cache)
        └─ Authentication                  ├─ JavaScript
                                          ├─ CSS
                                          ├─ Images
                                          ├─ Audio (MP3)
                                          └─ Fonts
```

---

## Data Flow

### On App Load
1. **Service Worker** activates and checks cache
2. **localStorage** loads user preferences (theme, font size)
3. **Supabase** fetches learning content (topics, paths)
4. UI renders with user preferences + cloud data

### During Practice Session
1. User answers questions
2. **Supabase** stores answers and progress in real-time
3. **IndexedDB** caches audio files for faster playback
4. **localStorage** maintains UI state (theme, etc.)

### Offline Behavior
1. **Service Worker** serves cached assets from IndexedDB
2. UI remains functional (read-only mode)
3. **Supabase** operations queue for later sync (when online)
4. User preferences work offline (localStorage)

---

## Storage Maintenance

### Automatic Cleanup
- **Service Worker**: Automatically removes old cache versions
- **Workbox**: Respects max entries and TTL settings
- **Supabase**: Server-managed, no client cleanup needed

### Manual Cleanup

#### Clear All Browser Storage
```bash
# Via Browser DevTools
Application → Storage → Clear site data
```

#### Clear Only Settings
```javascript
localStorage.removeItem('mindforge.app-settings.v1');
localStorage.removeItem('audioSettings');
window.location.reload();
```

#### Reset Service Worker Cache
```javascript
// Unregister service worker
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });

// Clear caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Reload
window.location.reload();
```

---

## Storage Sizes

| Storage Type | Typical Size | Max Size | Persistence |
|-------------|-------------|----------|-------------|
| localStorage | ~5-10 KB | 5-10 MB | Permanent |
| IndexedDB (PWA) | 50-500 MB | Browser-dependent | Persistent* |
| Supabase | N/A | Unlimited** | Permanent |

\* *May be cleared by browser if storage space is low*
\*\* *Subject to Supabase plan limits*

---

## Privacy & Security

### What Stays Local
- ✅ UI preferences (theme, font size, animations)
- ✅ Audio playback preferences
- ✅ Cached static assets (JS, CSS, images, audio)
- ✅ Temporary API response cache

### What's Synced to Cloud
- ☁️ User authentication (email, session token)
- ☁️ Learning progress and session results
- ☁️ All learning content (topics, paths, tasks)

### Data You Can See
Open browser DevTools to inspect:
1. **Application → Local Storage** - Settings data
2. **Application → IndexedDB → mindforge-academy** - PWA cache
3. **Network → Fetch/XHR** - Supabase API calls

---

## Troubleshooting

### Issue: "Stale content after update"
**Solution**: Clear service worker cache
```javascript
// In browser console
caches.keys().then(names => names.forEach(name => caches.delete(name)));
window.location.reload();
```

### Issue: "Settings not persisting"
**Solution**: Check localStorage quota
```javascript
// Check available storage
navigator.storage.estimate().then(estimate => {
  console.log(`Used: ${estimate.usage} bytes`);
  console.log(`Quota: ${estimate.quota} bytes`);
});
```

### Issue: "Large IndexedDB size"
**Solution**: Service Worker caches audio files aggressively
- This is intentional for offline support
- Max 200 audio files cached (~50MB typical)
- Auto-cleaned after 30 days

---

## Development Notes

### Disable Service Worker (Development)
```typescript
// In vite.config.ts, set devOptions.enabled to false
VitePWA({
  devOptions: {
    enabled: false, // Disable in dev
  }
})
```

### Test Without Cache
```bash
# Run in incognito mode
# Or disable cache in DevTools Network tab
```

### View Cache Contents
```javascript
// List all caches
caches.keys().then(console.log);

// View specific cache
caches.open('audio-pronunciations').then(cache => {
  cache.keys().then(console.log);
});
```

---

## Architecture Decisions

### Why localStorage for Settings?
- ✅ Fast synchronous access
- ✅ No network overhead
- ✅ Simple key-value storage
- ✅ Immediate availability
- ✅ Standard web practice

### Why IndexedDB for PWA?
- ✅ Large storage capacity (hundreds of MB)
- ✅ Structured data storage
- ✅ Service Worker compatibility
- ✅ Automatic cache management via Workbox
- ✅ Better performance than localStorage for large data

### Why Supabase for Learning Data?
- ✅ Real-time sync across devices
- ✅ Centralized data management
- ✅ Built-in authentication
- ✅ PostgreSQL reliability
- ✅ Scalable infrastructure

---

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Last Updated**: 2025-11-25
**Version**: 1.0.0
