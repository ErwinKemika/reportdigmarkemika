
# WhatsApp Reminder untuk Action Plan via WAHA

Reminder otomatis untuk task di halaman Action Plan, dikirim ke **1 grup WhatsApp tim** lewat WAHA (self-hosted), dengan mention PIC personal biar dapat notif personal.

## Cara Kerja Singkat

```
[pg_cron tiap hari 08:00 WIB]
        ↓
[Edge Function: send-task-reminders]
  • Baca semua task dari page_data (page_key = recommendations) periode aktif
  • Untuk tiap task: hitung selisih hari ke timeline.end (due date)
  • Jika H-1, Hari-H, atau Overdue → siapkan pesan
  • Skip kalau status = Done atau sudah pernah kirim hari ini (cek reminder_logs)
  • Lookup nomor PIC dari pic_contacts → format mention @628xxx
  • POST ke WAHA /api/sendText dengan chatId grup + mentions
        ↓
[Grup WA Tim] Pesan masuk, PIC ke-mention dapat notif personal
        ↓
[reminder_logs] Catat task_id + tanggal + tipe biar gak dobel
```

## Yang Perlu User Siapkan

1. **VPS** (Contabo/Hetzner/Biznet) dengan Docker
2. **Install WAHA**: `docker run -d -p 3000:3000 -e WAHA_API_KEY=xxx devlikeapro/waha`
3. **Scan QR code** dari nomor WA bisnis (sekali aja)
4. **Pastikan nomor WA tersebut anggota grup** target
5. **Ambil Group ID**: `GET /api/default/groups` → copy ID grup tim
6. Kasih saya 3 nilai untuk disimpan di Lovable secrets:
   - `WAHA_BASE_URL` (contoh: `https://waha.example.com`)
   - `WAHA_API_KEY`
   - `WAHA_GROUP_ID` (contoh: `120363012345678901@g.us`)

## Schema Database (Migration)

**Tabel `pic_contacts`** — master data PIC
- `name` (text, unique) — nama PIC, misal "Hilmi", "Erwin"
- `phone` (text) — format internasional tanpa +, misal `628123456789`
- RLS: public read, admin + 2 editor (ariefrzky/hilmi) bisa insert/update

**Tabel `reminder_logs`** — anti-dobel kirim
- `task_id` (text) — ID task dari JSON
- `period` (text) — periode task
- `reminder_type` (text) — `h_minus_1` / `h_day` / `overdue`
- `sent_date` (date) — tanggal kirim
- Unique constraint: (task_id, period, reminder_type, sent_date)
- RLS: admin only

## Edge Function: `send-task-reminders`

- Auth: pakai `verify_jwt = false` (dipanggil dari pg_cron pakai service role)
- Validasi `WAHA_*` env vars
- Loop semua row `page_data` periode aktif (current month + last month untuk overdue catch-up)
- Untuk tiap task dengan `timeline.end`:
  - Hitung `daysUntilDue = (dueDate - today)` dalam timezone Asia/Jakarta
  - Tentukan tipe reminder: 1 → `h_minus_1`, 0 → `h_day`, <0 & status≠Done → `overdue`
  - Cek `reminder_logs` — skip kalau sudah ada record hari ini
  - Format pesan + ambil phone PIC dari `pic_contacts`
  - POST ke `${WAHA_BASE_URL}/api/sendText` dengan body:
    ```json
    {
      "session": "default",
      "chatId": "120363xxx@g.us",
      "text": "🔔 *Reminder Action Plan*\n\nTask: *E-catalog B2B*\nPIC: @628123456789\n...",
      "mentions": ["628123456789@c.us"]
    }
    ```
  - Insert ke `reminder_logs`
- Return summary: `{ sent: 5, skipped: 12, failed: 0 }`

## Manual Trigger Endpoint

Edge function juga support body `{ test: true, taskId: "xxx" }` untuk dipanggil dari UI tombol "Test kirim WA sekarang" — kirim 1 task ke grup tanpa cek log.

## pg_cron Job

Dijadwalkan via `supabase--insert` (bukan migration karena ada URL/key project-specific):
```sql
select cron.schedule(
  'task-reminders-daily',
  '0 1 * * *',  -- 01:00 UTC = 08:00 WIB
  $$ select net.http_post(
    url:='https://qibscolybyldpzmqvjns.supabase.co/functions/v1/send-task-reminders',
    headers:='{"Content-Type":"application/json","apikey":"<anon>"}'::jsonb,
    body:='{}'::jsonb
  ); $$
);
```
Enable extensions `pg_cron` + `pg_net` lewat migration.

## Perubahan UI (Action Plan / `/recommendations`)

1. **Form edit task** (`pageEditSchemas.ts` — recommendations):
   - Field PIC diubah jadi **dropdown** dari `pic_contacts` (bukan text input)
   - Tombol **"+ Tambah PIC baru"** → dialog kecil isi nama + nomor → insert ke `pic_contacts`
2. **Card task**:
   - Badge kecil "🔔 WA aktif" kalau PIC punya nomor terdaftar
   - Tombol icon ⚡ "Kirim reminder sekarang" (hanya tampil untuk admin/editor) → trigger manual
3. **Halaman settings kecil** (opsional, di `/recommendations` atas):
   - Section "WhatsApp Reminder" → tampil status (active/inactive), Group ID terkonfigurasi, dan log 10 reminder terakhir

## Reminder yang Akan Dikirim

| Trigger | Kapan | Contoh |
|---|---|---|
| **H-1** | Sehari sebelum due date | "Deadline besok" |
| **Hari-H** | Tanggal due date | "Deadline hari ini" |
| **Overdue** | Setelah due date & status ≠ Done | "Task lewat deadline" (kirim sekali per hari sampai Done) |

Skip otomatis: status `Done` atau task tanpa `timeline.end`.

## Format Pesan ke Grup

```
🔔 *Reminder Action Plan*

📌 Task: *E-catalog B2B*
👤 PIC: @628123456789
📅 Deadline: *Besok (22 May 2026)*
📊 Status: Ongoing (70%)
🏷️ Tag: Editing | Priority: High
🔗 https://canva.link/egpb91qme8ma5xr

_Auto-reminder dari Dashboard Kemika_
```

## Detail Teknis

**Files baru:**
- `supabase/functions/send-task-reminders/index.ts` — main reminder logic
- `supabase/migrations/<timestamp>_pic_contacts_and_reminders.sql` — tabel + RLS + extensions
- `src/hooks/usePicContacts.ts` — query/mutation untuk pic_contacts
- `src/components/dashboard/PicSelectField.tsx` — dropdown PIC + tombol tambah baru
- `src/components/dashboard/ReminderTestButton.tsx` — tombol manual kirim WA per task

**Files diedit:**
- `src/components/dashboard/pageEditSchemas.ts` — schema recommendations: PIC field jadi dropdown
- `src/pages/RecommendationsPage.tsx` — render badge + tombol manual trigger di tiap card

**Secrets baru:** `WAHA_BASE_URL`, `WAHA_API_KEY`, `WAHA_GROUP_ID`

## Risiko & Catatan

- **WAHA tidak resmi** — risiko nomor banned WA tetap ada (lebih kecil kalau pesan formal & gak spam). Kalau banned, harus scan QR ulang dengan nomor lain.
- **VPS harus selalu nyala** — kalau down, reminder gak terkirim. Bisa dimitigasi pakai uptime monitor (UptimeRobot gratis).
- **Reset session WAHA** kalau HP utama logout WA Web — perlu scan QR ulang.
- Mention `@628xxx` di grup WA mengirim notif personal ke nomor itu walau dia mute grup, jadi PIC tetap dapat alert.
