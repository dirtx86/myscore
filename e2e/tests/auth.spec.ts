import { test, expect, request } from '@playwright/test';

const API = process.env.API_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@myscore.local';
const ADMIN_PASSWORD = 'xae6vodqMc2!';

async function getAdminToken(): Promise<string> {
  const ctx = await request.newContext();
  const res = await ctx.post(`${API}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const body = await res.json();
  return body.accessToken as string;
}

// ── Login page ────────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows MySCORE branding', async ({ page }) => {
    await expect(page.locator('text=MySCORE').first()).toBeVisible();
  });

  test('shows email and password fields', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('shows Sign in with Google button', async ({ page }) => {
    const googleBtn = page.locator('a', { hasText: 'Sign in with Google' });
    await expect(googleBtn).toBeVisible();
  });

  test('Google button href points to API auth/google endpoint', async ({ page }) => {
    const googleBtn = page.locator('a', { hasText: 'Sign in with Google' });
    const href = await googleBtn.getAttribute('href');
    expect(href).toContain('/auth/google');
  });

  test('shows environment badge when VITE_ENVIRONMENT is set', async ({ page }) => {
    const badge = page.locator('[data-testid="env-badge"]');
    // Badge only shows for known envs (production/staging) — in local dev it won't be present
    const env = process.env.VITE_ENVIRONMENT;
    if (env === 'production' || env === 'staging') {
      await expect(badge).toBeVisible();
      await expect(badge).toHaveText(env);
    } else {
      await expect(badge).not.toBeAttached();
    }
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('logs in with valid credentials and lands on dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
  });
});

// ── Google OAuth callback ─────────────────────────────────────────────────────

test.describe('Google OAuth callback page', () => {
  test('stores token and redirects to dashboard when token is present', async ({ page }) => {
    const token = await getAdminToken();
    await page.goto(`/auth/callback?token=${token}`);
    // Should redirect to dashboard automatically
    await expect(page).toHaveURL('/', { timeout: 5000 });
    // Verify user is authenticated by checking a protected element
    await expect(page.locator('[role="banner"]')).toBeVisible();
  });

  test('redirects to login when no token is in URL', async ({ page }) => {
    await page.goto('/auth/callback');
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('redirects to login when token is invalid', async ({ page }) => {
    await page.goto('/auth/callback?token=not.a.valid.jwt');
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});

// ── Google auth initiation ────────────────────────────────────────────────────

test.describe('Google OAuth initiation', () => {
  test('Google button href points to the /auth/google endpoint', async ({ page }) => {
    await page.goto('/login');
    const googleBtn = page.locator('a', { hasText: 'Sign in with Google' });
    await expect(googleBtn).toBeVisible();
    const href = await googleBtn.getAttribute('href');
    // Href should be the full API URL ending in /auth/google
    expect(href).toMatch(/\/auth\/google$/);
  });
});

// ── Protected route redirect ──────────────────────────────────────────────────

test.describe('Route protection', () => {
  test('unauthenticated user is redirected from / to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('unauthenticated user is redirected from /admin to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });
});
