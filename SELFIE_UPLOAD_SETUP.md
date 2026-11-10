# Selfie upload deployment

The GitHub token must stay in Cloudflare Worker secrets, never in browser JavaScript.

1. In Cloudflare, create a Turnstile widget for `skboysandeep0-byte.github.io` and copy its site key and secret.
2. Create a Cloudflare Worker (for example `birthday-selfie-upload`). Paste the contents of `worker.js` into its editor and deploy.
3. In Worker Settings → Variables and Secrets, add secrets `GITHUB_TOKEN` (fine-grained token restricted to this repository with **Contents: Read and write** only) and `TURNSTILE_SECRET`.
4. Add plain text variables `GITHUB_OWNER=skboysandeep0-byte` and `GITHUB_REPO=Birthday_-mirit-bhai`.
5. In `index.html`, replace `YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY` with the Turnstile site key.
6. In `script.js`, replace `https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/upload` with your deployed Worker URL plus `/upload`. Commit both changes to main.

Uploaded PNGs are public in this repository's `selfies/` folder. Anyone can view them. The Worker verifies Turnstile, accepts PNG only, limits files to 5 MB, and only permits the GitHub Pages origin. Review the folder and delete photos you do not want to retain.
