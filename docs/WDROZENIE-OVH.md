# Wdrożenie aplikacji OSP na app.r-osp.pl (OVH)

Instrukcja krok po kroku dla osoby, która nie jest informatykiem. Kolejność ma znaczenie — idź po
kolei. Gdzie polecenie wygląda strasznie: nie musisz go rozumieć, wystarczy skopiować i wkleić.

> **Ważne:** hasła (do poczty, do bazy, do serwera) wpisujesz **tylko** w pliku `.env` na serwerze
> albo w panelu OVH. Nie wklejaj ich do czatu, maili ani na GitHuba.

---

## 0. Co jest potrzebne i co już masz

| Co | Po co | Uwagi |
|---|---|---|
| Domena `r-osp.pl` w OVH | adres aplikacji | masz |
| Skrzynka e-mail na tej domenie | stąd i tu będą szły raporty i meldunki | masz (jedna) |
| **Serwer VPS** w OVH | tu działa aplikacja | **trzeba sprawdzić / dokupić** (krok 0.1) |

### 0.1 Sprawdź, jaki produkt OVH masz

Zaloguj się na <https://www.ovh.com/manager/> i sprawdź listę usług.

- **Jest pozycja „VPS”** (np. `vps-xxxxxxxx.vps.ovh.net`) → masz serwer, przejdź do kroku 1.
- **Jest tylko „Hosting” / „Hébergement web”** (strona WWW, PHP, FTP, bazy MySQL) → to **nie
  wystarczy**. Zwykły hosting WWW nie uruchomi tej aplikacji (potrzebuje własnego serwera
  z Node.js i LibreOffice). Zostaw go tak, jak jest (może na nim stać Twoja obecna strona), a
  **dokup najtańszy VPS**:
  - system: **Ubuntu 24.04**,
  - pamięć: **co najmniej 2 GB RAM** (LibreOffice do PDF-ów jest zasobożerny; przy 1 GB jest za
    ciasno),
  - lokalizacja: dowolna w Europie.
  Aktualne ceny i nazwy planów sprawdź w ofercie OVH — zmieniają się.

> „Hosting ma 100 megabit” — jeśli to **100 MB miejsca na dysku**, to jest to najmniejszy
> pakiet WWW i aplikacja się tam nie zmieści. Jeśli to **100 Mb/s łącze** serwera — w zupełności
> wystarczy, aplikacja jest lekka.

Po zakupie OVH przyśle e-mailem **adres IP serwera** (np. `51.77.xxx.xxx`) oraz dane do pierwszego
logowania. Zapisz adres IP — będzie potrzebny w krokach 1 i 2.

---

## 1. DNS: adres app.r-osp.pl

Dzięki temu aplikacja będzie pod `https://app.r-osp.pl`, a **Twoja obecna strona i poczta na
r-osp.pl zostają nietknięte**.

1. W panelu OVH: **Web Cloud → Nazwy domen → r-osp.pl → Strefa DNS**.
2. **Dodaj wpis**:
   - typ: **A**
   - poddomena: **app**
   - cel: **adres IP Twojego VPS** (z kroku 0)
3. Zapisz. Rozpropagowanie trwa od kilku minut do kilku godzin.

**Nie zmieniaj ani nie usuwaj** żadnych innych wpisów (zwłaszcza **MX**, **TXT/SPF**, **DKIM** —
odpowiadają za Twoją pocztę).

Sprawdzenie (w PowerShellu na Twoim komputerze): `nslookup app.r-osp.pl` — ma pokazać IP serwera.

---

## 2. Pierwsze połączenie z serwerem

Na Windows otwórz **PowerShell** i wpisz (użytkownik zwykle `ubuntu` — dokładny login i hasło są
w mailu od OVH):

```bash
ssh ubuntu@ADRES_IP_SERWERA
```

Przy pierwszym połączeniu odpowiedz `yes`. Poniższe polecenia wykonujesz **już na serwerze**.

Aktualizacja i zapora (otwieramy tylko SSH, HTTP i HTTPS):

```bash
sudo apt update && sudo apt -y upgrade
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw --force enable
```

Jeśli serwer ma tylko 1 GB RAM, dodaj pamięć wymiany (inaczej budowanie aplikacji może się wywrócić):

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 3. Instalacja potrzebnych programów

```bash
sudo apt -y install nginx git sqlite3 curl ca-certificates certbot python3-certbot-nginx \
  libreoffice-writer fonts-liberation fonts-noto-core
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs
node --version      # ma pokazać v22.x
```

Osobny użytkownik, na którym działa aplikacja (bezpieczniej niż root):

```bash
sudo adduser --disabled-password --gecos "" osp
sudo mkdir -p /home/osp/data/uploads /home/osp/backups && sudo chown -R osp:osp /home/osp
```

---

## 4. Pobranie aplikacji i konfiguracja

Przełącz się na użytkownika `osp` i pobierz kod z GitHuba:

```bash
sudo -iu osp
git clone https://github.com/dawlis20-ctrl/osp-app.git
cd osp-app
```

> Jeśli repozytorium jest **prywatne**, `git clone` poprosi o login. Jako hasło podaj **token
> dostępu** (GitHub → Settings → Developer settings → Personal access tokens, uprawnienie
> „Contents: read”).

Instalacja i przygotowanie bazy:

```bash
npm ci
npx prisma generate
```

### 4.1 Plik `.env` (ustawienia i hasła)

```bash
cp .env.example .env
nano .env
```

Uzupełnij (strzałkami przesuwasz kursor; zapis: `Ctrl+O`, `Enter`; wyjście: `Ctrl+X`):

| Ustawienie | Wartość |
|---|---|
| `DATABASE_URL` | `"file:/home/osp/data/osp.db"` |
| `AUTH_SECRET` | wygeneruj: `openssl rand -base64 32` i wklej wynik |
| `AUTH_URL` | `"https://app.r-osp.pl"` |
| `AUTH_TRUST_HOST` | `"true"` |
| `UPLOADS_DIR` | `"/home/osp/data/uploads"` |
| `SMTP_HOST` | serwer poczty OVH — patrz niżej |
| `SMTP_PORT` | `"465"` |
| `SMTP_USER` | pełny adres skrzynki, np. `biuro@r-osp.pl` |
| `SMTP_PASS` | hasło tej skrzynki |
| `MAIL_FROM` | `"OSP Skawina II <biuro@r-osp.pl>"` |
| `OSP_EMAIL_TO` | adres, na który mają przychodzić raporty (może być ta sama skrzynka) |
| `SEED_ADMIN_EMAIL` | Twój e-mail (login administratora) |
| `SEED_ADMIN_NAME` | Twoje imię i nazwisko |
| `SEED_ADMIN_PASSWORD` | silne hasło, min. 10 znaków (tylko na czas kroku 4.2) |

**Serwer poczty (`SMTP_HOST`)** zależy od rodzaju skrzynki — dokładną nazwę zobaczysz w panelu OVH
(**Web Cloud → E-maile → Twoja domena → skrzynka → „Konfiguracja”**):

- zwykła skrzynka „MX Plan”: najczęściej `ssl0.ovh.net`,
- „Email Pro”: najczęściej `pro1.mail.ovh.net`,
- „Exchange”: najczęściej `ex.mail.ovh.net`.

### 4.2 Baza, konto administratora, budowa

```bash
npx prisma migrate deploy
npm run db:seed          # tworzy TYLKO Twoje konto administratora i 3 pojazdy
npm run build
```

Teraz **usuń hasło startowe z pliku**: `nano .env` → skasuj linię `SEED_ADMIN_PASSWORD=...` → zapisz.
Hasło zmienisz też później w aplikacji (Mój profil → Zmiana hasła).

Wróć na zwykłego użytkownika serwera: `exit`.

---

## 5. Uruchomienie jako usługa (startuje sama po restarcie serwera)

```bash
sudo nano /etc/systemd/system/osp.service
```

Wklej:

```ini
[Unit]
Description=Aplikacja OSP
After=network.target

[Service]
User=osp
WorkingDirectory=/home/osp/osp-app
EnvironmentFile=/home/osp/osp-app/.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start -- -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now osp
sudo systemctl status osp        # ma być "active (running)"; wyjście: q
```

---

## 6. Adres i HTTPS (nginx + certyfikat)

```bash
sudo nano /etc/nginx/sites-available/osp
```

Wklej:

```nginx
server {
    listen 80;
    server_name app.r-osp.pl;
    client_max_body_size 25m;   # zdjęcia z raportów

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;  # generowanie PDF chwilę trwa
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/osp /etc/nginx/sites-enabled/osp
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d app.r-osp.pl
```

Certbot zapyta o e-mail (powiadomienia o certyfikacie) i zgodę — odpowiedz i wybierz przekierowanie
na HTTPS. Certyfikat odnawia się sam.

Gotowe: otwórz **https://app.r-osp.pl** i zaloguj się kontem z kroku 4.

---

## 7. Pierwsze uruchomienie — lista kontrolna

1. Zaloguj się jako administrator → **Mój profil → Zmiana hasła** (ustaw własne).
2. **Ustawienia → Dodaj konto** — załóż konta druhom i naczelnikowi.
3. Dodaj testowy raport ze zdjęciem → **Pobierz PDF** (pierwsze generowanie trwa kilkanaście sekund).
4. Kliknij **Wyślij na e-mail OSP** i sprawdź skrzynkę. Jeśli wyskoczy błąd — patrz „Problemy”.
5. Usuń testowy raport (lub zostaw — w razie potrzeby numerację można zmienić na ekranie raportu).

---

## 8. Kopie zapasowe (ważne!)

Wszystkie dane to jeden plik bazy i katalog zdjęć. Skrypt robi codzienną kopię na 14 dni:

```bash
sudo -iu osp
nano /home/osp/backup.sh
```

```bash
#!/bin/bash
set -e
D=/home/osp/backups/$(date +%F)
mkdir -p "$D"
sqlite3 /home/osp/data/osp.db ".backup '$D/osp.db'"
cp -r /home/osp/data/uploads "$D/"
find /home/osp/backups -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
```

```bash
chmod +x /home/osp/backup.sh
crontab -e        # wybierz nano i dopisz na końcu:
0 3 * * * /home/osp/backup.sh
```

Kopie na tym samym serwerze nie uchronią przed awarią serwera. Dodatkowo włącz w panelu OVH
**automatyczną kopię zapasową / snapshot VPS** albo raz w tygodniu pobieraj folder
`/home/osp/backups` na swój komputer (np. programem WinSCP).

---

## 9. Aktualizacja aplikacji (gdy pojawi się nowa wersja)

```bash
sudo -iu osp
cd osp-app
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
exit
sudo systemctl restart osp
```

---

## 10. Problemy

| Objaw | Co sprawdzić |
|---|---|
| Strona się nie otwiera | `sudo systemctl status osp` oraz `sudo journalctl -u osp -n 50`; czy DNS już wskazuje na IP (`nslookup app.r-osp.pl`) |
| „Nie udało się wygenerować PDF” | `which soffice` (ma pokazać ścieżkę); jeśli pusto: `sudo apt -y install libreoffice-writer` |
| „Nie wysłano: …” przy wysyłce | zły `SMTP_HOST`/hasło w `.env` (po zmianie: `sudo systemctl restart osp`); sprawdź te dane w panelu OVH przy skrzynce |
| Błąd przy wgrywaniu zdjęć | w nginx musi być `client_max_body_size 25m;` (krok 6) |
| Po zmianie `.env` nic się nie dzieje | `sudo systemctl restart osp` |
| Zapomniane hasło administratora | wejdź na serwer, dopisz do `.env` `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` **innego** adresu, `npm run db:seed`, zaloguj się nowym kontem i usuń te linie |

---

## Co dalej (opcjonalnie)

- **Przypomnienia e-mail o terminach ważności** (miesiąc / 2 tygodnie / tydzień przed) — korzystają
  z tej samej poczty, którą właśnie skonfigurowałeś; to osobny, kolejny krok rozwoju aplikacji.
- Wymuszanie kluczy SSH zamiast hasła do serwera i automatyczne aktualizacje bezpieczeństwa
  (`sudo apt -y install unattended-upgrades`).
