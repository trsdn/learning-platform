# Deploy to Test Environment

Deploy the learning platform to a test environment at `/test` with isolated database.

## What this does

1. Creates a production build with test configuration
2. Deploys to GitHub Pages at `/learning-platform/test/`
3. Uses separate IndexedDB database name (`mindforge-test`)
4. Allows testing without affecting production

## Steps

1. Update test build configuration if needed
2. Run build with test environment variables
3. Deploy to test subdirectory on gh-pages branch
4. Verify deployment at https://trsdn.github.io/learning-platform/test/

## Commands to run

```bash
# Build for test environment
VITE_ENV=test npm run build

# Deploy to test path
npm run deploy:test
```

## Verification

After deployment, check:
- [ ] Test site loads at `/learning-platform/test/`
- [ ] Separate database is used (check IndexedDB in DevTools)
- [ ] Production site at `/learning-platform/` is unaffected
- [ ] All features work in test environment

## Notes

- Test environment uses same codebase but different base path
- Database name: `mindforge-academy-test` (vs `mindforge-academy` in prod)
- Service worker scope limited to `/test/`
