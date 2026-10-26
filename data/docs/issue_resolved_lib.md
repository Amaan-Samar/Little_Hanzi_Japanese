Thanks, this corrects part of what I told you before. The paths are not absolute `/dict/...` as I assumed. With `Sr = true` they become relative (`./dict/base.dat.br`), which resolves correctly under `/Little_Hanzi_Japanese/`. You also confirmed the file downloads from the right URL. So the path is probably fine, and the wrapper I suggested isn't needed.

## What's likely going wrong

The loader does `fetch(url).then(r => r.arrayBuffer())` and passes the bytes straight into typed arrays. There is no Brotli decompression anywhere in that code. That only works if the server sends `Content-Encoding: br`, so the browser decompresses the file before JS sees it.

Your error fits that. The request succeeds (a 404 would be rejected by the `!e.ok` check), but the bytes are still compressed, so their length is arbitrary and `Int32Array` throws. GitHub Pages can't set custom headers, so it most likely serves `.br` files as plain binary. I haven't confirmed why local dev works, but I'd guess the dev server adds that header for `.br` files.

You can check this in two seconds:

```bash
curl -sI https://YOURNAME.github.io/Little_Hanzi_Japanese/dict/base.dat.br
```

If there's no `content-encoding: br` line, this is the cause. Compare with the Network tab on localhost, where I expect to see it.

## Fix: ship the files already decompressed

The library only reads bytes and never checks the extension, so you can keep the `.br` names but store raw data. It then works on any host with no headers.

Install the tool and convert in place (back up first):

```bash
sudo apt install brotli
cp -r public/dict /tmp/dict-backup
cd public/dict
rm -rf dict    # the nested leftover
for f in *.br; do brotli -d -c "$f" > "$f.raw" && mv "$f.raw" "$f"; done
ls -lh
```

Sizes should now be much larger (tens of MB in total).

**Then delete the "Copy Dictionary Files" step from your workflow.** It's essential, because it copies the original compressed files from `node_modules` over your converted ones and undoes the fix. Vite already copies `public/dict` into `dist/dict` during the build.

Commit `public/dict`, push, and let the action run. Hard-reload the site (the service worker from your PWA setup can cache old responses, so clear site data if the error persists).

## Trade-offs

- The first visit downloads the full uncompressed dictionary, roughly tens of MB. Browsers cache it afterwards.
- If that's too heavy, there's a smaller option: keep the files gzipped (`.gz`) and wrap `fetch` to decompress with `DecompressionStream('gzip')`. I can write that if you want it.
- Cloudflare Pages, Netlify and Vercel let you set headers like `Content-Encoding: br` for `/dict/*`, which would keep the small files. That would be the reason to switch, but it isn't required.

## Two smaller notes

- Relative paths resolve against the page URL. If you use `vue-router` in history mode and someone opens a deep link like `/Little_Hanzi_Japanese/reader`, `./dict/...` would break. Hash mode avoids that.
- The `import.meta.env.PROD` argument doesn't appear to affect these URLs, since `Sr` is hardcoded to `true`. I haven't seen `buildAndInitWithKuromoji` itself, so I won't rule it out fully.

Please send the `curl -sI` output. If `content-encoding` is missing, this fix applies. If it's present, tell me and we'll look elsewhere.