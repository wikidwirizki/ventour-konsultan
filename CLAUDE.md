# Konsultan Umroh Ventour Travel

Situs statis (HTML/CSS/JS tanpa build). Konfigurasi di `assets/js/config.js`, data paket di `assets/js/packages.js`
(dihasilkan oleh `tools/update_packages.py`, jangan diedit manual). Arah desain ada di `DESIGN.md`.

## Deploy (wajib dipatuhi)
Setiap push ke `main` memicu deploy production Netlify, dan paket Free hanya cukup untuk sekitar 20 deploy per bulan.
- Jangan memicu deploy Netlify tanpa konfirmasi eksplisit dari pemilik (Rizki).
- Perubahan situs dikerjakan di branch terpisah, lalu digabung ke `main` hanya setelah pemilik menyetujui deploy.
- Commit ke `main` yang tidak perlu tayang (workflow, dokumentasi) wajib memuat `[skip netlify]` di pesan commit.
- Satu-satunya deploy otomatis yang disetujui: update data paket mingguan dari GitHub Actions (Senin 12:00 WIB),
  yang sengaja tidak memakai `[skip netlify]`.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `.claude/skills/antislop/SKILL.md` (core) and then the skill for the task:
- UI / visual: `.claude/skills/antislop-ui/SKILL.md`
- Copy & text: `.claude/skills/antislop-copywriting/SKILL.md`
- People: `.claude/skills/antislop-human/SKILL.md`
- Mobile / responsive: `.claude/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `.claude/skills/antislop-code/SKILL.md`
Design direction lives in `DESIGN.md`; antislop is the filter on top of it.
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask.
To update antislop later: run `npx antislop-ai --update`, or copy the newer skill folders from https://github.com/miqdadbadjuber/anti-slop into `.claude/skills/`.
<!-- antislop:end -->
