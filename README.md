
Za testiranje aplikacije, hr korisnik
email: nedim.zec@gmail.com
pw: 123456

User
email: zec.nedim13@gmail.com
pw: 123456

Za registraciju unijeti pravi email, da bi se autentifikacija potvrdila preko istog.

## 📸 Screenshotovi aplikacije

### Dashboard – Kreiranje konkursa
![Dashboard](./Slike_projekta/Screenshot%202025-09-05%20222949.png)

### Profil korisnika
![Profil](./Slike_projekta/Screenshot%202025-09-05%20222505.png)

### CV Upload sekcija
![CV Upload](./Slike_projekta/Screenshot%202025-09-05%20222553.png)

### Home stranica
![Home](./Slike_projekta/Screenshot%202025-09-05%20222611.png)

### AI Analiza CV-a (pokretanje)
![AI analiza 1](./Slike_projekta/Screenshot%202025-09-05%20222657.png)

### Detalji posla + analiza
![AI analiza 2](./Slike_projekta/Screenshot%202025-09-05%20222714.png)

### AI analiza u toku
![AI analiza 3](./Slike_projekta/Screenshot%202025-09-05%20222739.png)

### AI preporučeni poslovi
![Preporuke](./Slike_projekta/Screenshot%202025-09-05%20222829.png)

### Lista preporučenih poslova
![Preporuke lista](./Slike_projekta/Screenshot%202025-09-05%20222844.png)

### Statistike
![Statistike](./Slike_projekta/Screenshot%202025-09-05%20222904.png)



## 🔧 Instalacija i Pokretanje

### Backend Setup

1. **Kloniraj repozitorij**
```bash
git clone <repository-url>
cd Ai-cv-2025/backend
```

2. **Instaliraj dependencies**
```bash
pip install -r requirements.txt
```

3. **Konfiguracija environment varijabli**
Kreiraj `.env` fajl u `backend/app/` direktoriju:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TOGETHER_API_KEY=your_together_api_key
GOOGLE_API_KEY=your_gemini_api_key
```

4. **Pokreni server**
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. **Idi u frontend direktorij**
```bash
cd ../frontend/my-next-app
```

2. **Instaliraj dependencies**
```bash
npm install
```

3. **Konfiguracija environment varijabli**
Kreiraj `.env.local` fajl:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

4. **Pokreni development server**
```bash
npm run dev
```

## 🗄️ Baza Podataka (Supabase)

### Tabele
- **users** - Korisnički podaci i CV informacije
- **jobs** - Poslovi i konkursi
- **application_analysis** - AI analize prijava
- **user-uploads** - Storage za CV fajlove

### RLS Policies
- Korisnici mogu vidjeti samo svoje podatke
- HR korisnici mogu vidjeti prijave za svoje poslove
- Javni pristup za pregled poslova

## 🤖 AI Integracija

### Google Gemini
- Analiza CV-a i preporuka poslova
- Detekcija kategorije i ključnih riječi
- Generisanje personalizovanih preporuka

### Together AI (Llama 3.3)
- Alternativni AI model za analizu
- Ocjena kompatibilnosti kandidata
- Detaljna analiza sa preporukama

## 📱 Korisnički Interface

### Glavne Stranice
- **Home** - Pregled poslova i preporučeni poslovi
- **Dashboard** - Kreiranje novih konkursa (HR)
- **Find My Job** - AI preporučeni poslovi
- **Job Description** - Detalji posla i AI analiza
- **Profile** - Korisnički profil i CV upload

### Komponente
- **JobForm** - Formular za kreiranje konkursa
- **SearchBar** - Pretraga i filtriranje poslova
- **MarkdownViewer** - Prikaz AI analize
- **Navbar** - Navigacija i autentifikacija

## �� Autentifikacija

- **Supabase Auth** - Registracija i prijava
- **Role-based access** - Različite dozvole za korisnike i HR
- **Protected routes** - Zaštićene stranice za autentifikovane korisnike

## 🚀 Deployment

### Frontend (Vercel)
1. Poveži GitHub repozitorij sa Vercel
2. Konfiguracija environment varijabli
3. Automatski deployment na push

### Backend (Render)
1. Poveži GitHub repozitorij sa Render
2. Konfiguracija environment varijabli
3. Automatski deployment iz `render.yaml`

## �� API Endpoints

### CV Analiza
- `POST /upload-cv` - Upload CV fajla
- `GET /user-job-analysis/{user_id}` - Preporučeni poslovi
- `POST /analyze-cv/{user_id}/{job_id}` - Analiza kompatibilnosti
- `GET /get-existing-analysis/{user_id}/{job_id}` - Dohvati postojeću analizu

### Poslovi
- `GET /applications/by_hr/{hr_id}` - Prijave za HR korisnika
- `GET /find-my-jobs/{user_id}` - AI preporučeni poslovi

## �� Ključne Funkcionalnosti

1. **Inteligentna Analiza**: AI analizira CV i opis posla, daje ocjenu i preporuke
2. **Personalizovane Preporuke**: Na osnovu CV-a, sistem preporučuje najbolje poslove
3. **Real-time Processing**: Background taskovi za AI analizu
4. **Responsive Design**: Optimizovano za sve uređaje
5. **Secure File Upload**: Sigurno čuvanje CV fajlova u Supabase Storage

## 🔮 Buduće Funkcionalnosti

- [ ] Email notifikacije za nove poslove
- [ ] Napredna pretraga sa AI
- [ ] Statistike i analytics
- [ ] Integracija sa LinkedIn
- [ ] Multi-language support
- [ ] Mobile aplikacija

## 📝 Licenca

Ovaj projekat je kreiran za edukacijske svrhe. Svi prava zadržana.

## 👥 Autori

Projekat je razvijen kao završni rad za AI CV analizu i preporuku poslova.

---

**Napomena**: Za pokretanje aplikacije potrebni su validni API ključevi za Supabase, Google Gemini i Together AI servise.
