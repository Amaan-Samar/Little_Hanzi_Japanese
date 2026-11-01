# Base-Path Prefix — Vite Is Telling You Exactly What to Do

That message is Vite's dev server saying: "Your `base` is `/Little_Hanzi_Japanese/`, so all routes must be under that prefix." When you visit `/share-handler?...` (without the prefix), Vite redirects you to `/Little_Hanzi_Japanese/share-handler?...` — which is **correct**. The menu appearing means the routing *and* the modal both worked once you landed on the proper URL.

So the "fix" is trivial: **always include `/Little_Hanzi_Japanese/` in your test URLs during dev.** This is expected behavior — nothing is broken.

---

## Corrected test URLs (with base prefix)

Assume dev server at `http://localhost:3000`. All test URLs prepend `/Little_Hanzi_Japanese`:

### 🧪 Test 1 — Pure Japanese (auto → JP)
```
http://localhost:3000/Little_Hanzi_Japanese/share-handler?text=%E5%90%BE%E8%BC%A9%E3%81%AF%E7%8C%AB%E3%81%A7%E3%81%82%E3%82%8B%E3%80%82%E5%90%8D%E5%89%8D%E3%81%AF%E3%81%BE%E3%81%A0%E7%84%A1%E3%81%84%E3%80%82&title=Wagahai
```

### 🧪 Test 2 — Pure English (auto → EN)
```
http://localhost:3000/Little_Hanzi_Japanese/share-handler?text=I%20am%20a%20cat.%20I%20have%20no%20name%20yet.%20I%20was%20born%20somewhere%20in%20a%20small%20town.&title=I+am+a+cat
```

### 🧪 Test 3 — Short JP (picker)
```
http://localhost:3000/Little_Hanzi_Japanese/share-handler?text=%E6%97%A5%E6%9C%AC%E8%AA%9E
```

### 🧪 Test 4 — Mixed (picker)
```
http://localhost:3000/Little_Hanzi_Japanese/share-handler?text=I%20read%20%E5%90%BE%E8%BC%A9%E3%81%AF%E7%8C%AB%E3%81%A7%E3%81%82%E3%82%8B%20yesterday
```

### 🧪 Test 5 — title+url only
```
http://localhost:3000/Little_Hanzi_Japanese/share-handler?title=Article+Title&url=https%3A%2F%2Fexample.com
```

### 🧪 Test 6 — Empty payload
```
http://localhost:3000/Little_Hanzi_Japanese/share-handler
```

---

## Why this happens — and why it's good

Vite's dev server sees `base: '/Little_Hanzi_Japanese/'` and treats that as the app root. Any request to a path outside that root gets a friendly "Did you mean to visit X instead?" redirect. This is **Vite protecting you from a class of SPA bugs** where relative asset paths break if the app is mounted at a sub-path but accessed at the root.

In production (GitHub Pages at `amaan-samar.github.io/Little_Hanzi_Japanese/`), the base prefix is also what the manifest `share_target.action` uses — and that's why we set it to `/Little_Hanzi_Japanese/share-handler`. The URL scheme is consistent between dev and prod. ✅

**Don't try to remove the base prefix.** It's load-bearing:
- The `manifest.webmanifest` is generated with `scope` and `start_url` on that prefix
- `createWebHistory(import.meta.env.BASE_URL)` uses it for the router
- The share target's `action` needs it
- Asset URLs in the built `index.html` are prefixed with it

Removing it just to make dev URLs "nicer" would break the production PWA install.

---

## What "I got to menu" tells us

The redirect from `/share-handler?...` → `/Little_Hanzi_Japanese/share-handler?...` is **Vite** (not Vue Router). Then Vue Router matched `/share-handler` correctly, `ShareHandler.vue` ran, and:

- **For Test 2 (English)** — you should have briefly seen "Loading…" then the editor with the English textarea pre-filled. If you saw the **picker** instead, that tells us the auto-detect didn't fire — please report what you saw.
- **For Test 3 (日本語)** — the picker with two buttons should have appeared. If it did, click either button and confirm the text lands in the correct field.
- **For Test 6 (empty)** — you should go straight to the editor with nothing in either field.

The word "menu" is ambiguous — could mean:
- **The picker** (two buttons — correct for Tests 3/4, incorrect for Test 2/5)
- **The main app menu** (header buttons — correct for all cases, means redirect completed)
- **Something else** — please describe or screenshot

Either way, it means the routing is working. The remaining question is just: **did the right field get the text?**

---

## Quick dev-vs-prod checklist

| Environment | URL prefix | Where `share_target.action` points |
|---|---|---|
| Dev (`npm run dev`) | `/Little_Hanzi_Japanese/` | N/A (manifest not used in dev for share) |
| Preview (`npm run preview`) | `/Little_Hanzi_Japanese/` | N/A (manifest served but browser cache may lag) |
| Production (GitHub Pages) | `/Little_Hanzi_Japanese/` | `/Little_Hanzi_Japanese/share-handler` ✅ |

You can confirm the built manifest is correct after `npm run build` by inspecting `dist/manifest.webmanifest` — it should contain the `share_target` block with the full path. If it doesn't, `vite-plugin-pwa` didn't pick up the field (unlikely, but if so, we'd need a small config tweak).

---

## The one thing that *is* worth verifying now

Please run **Test 2 (English)** with the corrected URL and tell me exactly what you see, in order:

1. A brief "Loading…" text? Or a picker with two buttons?
2. After redirect, does the English textarea contain `I am a cat. I have no name yet. I was born somewhere in a small town.`?
3. Any console errors?

If the answer to (2) is **yes** and (1) was **"Loading…"**, Strategy C is working perfectly — the base-path redirect was the only hiccup and it's already handled by Vite + router. You're done testing that scenario.

If (1) was the **picker** for pure English, the auto-detect threshold needs loosening for that input (or we're looking at a different bug). Paste what you see and I'll adjust.

If (2) is **no**, tell me whether the text landed in the Japanese field instead (auto-detect wrong target) or nowhere (sessionStorage lost) — each points to a different fix.

Then move on to Test 3 (picker for short JP) and Test 6 (empty) — those two together confirm the low-confidence fallback path and the "no payload → straight redirect" path.