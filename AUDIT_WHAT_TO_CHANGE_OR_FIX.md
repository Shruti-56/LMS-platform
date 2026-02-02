# App audit: what to change or fix

From a full pass over the app, here’s what stands out.

---

## Critical / should fix

### 1. **AdminRoute redirect for non-admin users**
- **Where:** `src/App.tsx` — `AdminRoute`
- **Issue:** When a non-admin (e.g. instructor) hits an admin URL, they are sent to `/student/dashboard`. Instructors should go to `/instructor/submissions`.
- **Fix:** Redirect by role: instructor → `/instructor/submissions`, student → `/student/dashboard`.

### 2. **AdminRoute and StudentRoute don’t wait for auth**
- **Where:** `src/App.tsx` — `AdminRoute`, `StudentRoute`
- **Issue:** They don’t use `isLoading` from `useAuth()`. If a user lands on a protected route before session restore finishes, they can briefly see the wrong layout or get redirected incorrectly. `InstructorRoute` already waits on `isLoading`.
- **Fix:** In `AdminRoute` and `StudentRoute`, if `isLoading` is true, show the same loading spinner as in `AppRoutes` / `InstructorRoute`, then do the existing checks.

### 3. **Debug console.logs in production**
- **Where:** `src/App.tsx` — `LoginRedirect`, `InstructorRoute`
- **Issue:** Several `console.log` calls run for every navigation. They clutter the console and can leak info in production.
- **Fix:** Remove them or wrap in `if (import.meta.env.DEV) { ... }`.

---

## High priority (quality / consistency)

### 4. **ESLint: 125 errors, 14 warnings**
- **Backend:** Many `error: Unexpected any` and a few `prefer-const`, `require()` imports, and `no-namespace` in `auth.ts`.
- **Frontend:** A few `any`, empty interfaces in `command.tsx` and `textarea.tsx`, React Hook dependency warnings, and `no-require-imports` in `tailwind.config.ts`.
- **Fix:** Run `npm run lint` and address errors (replace `any` with proper types, use `const` where required, fix empty interfaces, resolve hook deps or add eslint-disable with a short comment). Optionally exclude `backend` from the frontend ESLint config so each side has its own lint.

### 5. **Duplicate toast systems**
- **Where:** `App.tsx` renders both `<Toaster />` (shadcn) and `<Sonner />`. Many pages use `toast` from `@/hooks/use-toast`.
- **Issue:** Two global toast systems can lead to duplicate toasts or inconsistent UX.
- **Fix:** Standardize on one (e.g. keep Sonner or keep shadcn Toaster) and remove the other from `App.tsx` and update any usage that targets the removed one.

### 6. **useRazorpay imports toast from relative path**
- **Where:** `src/hooks/useRazorpay.ts` — `import { toast } from './use-toast'`
- **Issue:** Works but is inconsistent; rest of app uses `@/hooks/use-toast`.
- **Fix:** Use `import { toast } from '@/hooks/use-toast'` for consistency.

---

## Medium priority (maintainability / security)

### 7. **Backend: replace `catch (error: any)`**
- **Where:** All backend controllers and some services.
- **Issue:** Typing errors as `any` loses type safety and can hide bugs.
- **Fix:** Use `catch (error: unknown)` and narrow with `instanceof Error` or a small helper when logging/handling.

### 8. **Backend: `require()` in payment and admin**
- **Where:** e.g. `payment.controller.ts`, `admin.controller.ts` — `require('...')` for Razorpay or other libs.
- **Issue:** ESLint flags `no-require-imports`; also mixes CommonJS with ESM.
- **Fix:** Use `import` where possible. If the library only supports `require`, use a dedicated file that re-exports and add a targeted eslint-disable with a comment.

### 9. **Auth middleware namespace**
- **Where:** `backend/src/middleware/auth.ts` — `declare global { namespace Express { ... } }`
- **Issue:** ESLint `no-namespace`; some prefer module augmentation style.
- **Fix:** Keep the augmentation for `Request` but satisfy the linter (e.g. move to a `types` file and use `interface` extension, or add a minimal eslint-disable with a comment).

### 10. **Frontend API client `any`**
- **Where:** `src/lib/api.ts` — `post(..., body?: any, ...)`, `put`, `patch`.
- **Issue:** Request bodies are untyped.
- **Fix:** Use `body?: unknown` or a generic, e.g. `post<T = unknown>(..., body?: T, ...)`.

---

## Lower priority / nice to have

### 11. **Browserslist data**
- **Message:** “Browserslist: browsers data (caniuse-lite) is 7 months old.”
- **Fix:** Run `npx update-browserslist-db@latest` (or add to postinstall).

### 12. **npm “Unknown env config devdir”**
- **Message:** Shown when running npm scripts.
- **Fix:** Remove or fix custom `devdir` (or other unknown env) in npm config so the warning goes away.

### 13. **ErrorBoundary reset**
- **Where:** `src/components/ErrorBoundary.tsx` — “Go Home” calls `window.location.href = '/'`.
- **Issue:** Full page reload; React state is lost. Sometimes “Refresh Page” is enough.
- **Fix:** Optional: “Go Home” could use React Router `navigate('/')` and then clear error state so the user stays in the SPA. Keep “Refresh Page” for full reload.

### 14. **Login redirect with `window.location.href`**
- **Where:** `src/App.tsx` — `LoginRedirect` uses `window.location.href = decodedUrl` after login.
- **Issue:** Full page load; acceptable for cross-role redirects but different from in-app navigation.
- **Fix:** Optional: use `<Navigate to={decodedUrl} replace />` when `decodedUrl` is same-origin and a valid app route; otherwise keep `window.location` for external or full reload.

### 15. **StudentRoute: preserve query on login redirect**
- **Where:** `StudentRoute` builds `returnUrl = location.pathname + location.search`.
- **Issue:** Hash (`location.hash`) is not included, so deep links with hashes lose the hash after login.
- **Fix:** If you use hash-based anchors, include `location.hash` in `returnUrl`.

---

## Summary

| Priority   | Count | Action |
|-----------|-------|--------|
| Critical  | 3     | Fix AdminRoute redirect + loading, remove/guard console.logs |
| High      | 3     | Tackle lint errors, unify toasts, align useRazorpay import |
| Medium    | 4     | Type errors properly, replace require, fix auth types, type API body |
| Low       | 5     | Browserslist, npm config, ErrorBoundary/redirect behavior, hash in returnUrl |

**Build status:** Frontend and backend both build successfully. The main follow-ups are routing/UX (1–3), lint and types (4, 7–10), and consistency (5–6).
