# 📝 Blog Platform

## 📖 Leírás

Egy böngészőben futó blog alkalmazás, amely TypeScript + Vite használatával készült.
A frontend saját (framework nélküli) SPA, hash-alapú routinggal.
A backend egy json-server alapú REST API.

---

## ⚙️ Technológiák

* TypeScript
* Vite
* fetch API
* localStorage
* json-server (backend)

---

## 🚀 Indítás

### Backend

```bash
cd blog-backend
npm install
npm start
```

### Frontend

```bash
npm install
npm run dev
```

---

## 🔐 Teszt felhasználók

* admin / admin123 (admin)
* adminisztrator / jelszo123 (adminisztrátor)

---

## 🧭 Funkciók

* Bejegyzések listázása (lapozás, keresés, szűrés)
* Egyedi bejegyzés oldal
* Bejelentkezés (token alapú)
* Dashboard (CRUD műveletek)
* Jogosultságkezelés (admin törölhet)

---

## 🔄 Routing

* `#/` – főoldal
* `#/blog/:id` – bejegyzés
* `#/login` – login
* `#/dashboard` – dashboard

---

## 💾 Állapotkezelés

localStorage-ben tárolva:

* token
* felhasználó adatai

---

## 🗂️ Struktúra

```
src/
  main.ts
  router.ts
  api.ts
  store.ts
  types.ts
  pages/
  components/
```

---

## 📌 Megjegyzés

* SPA alkalmazás (nincs újratöltés)
* Saját router
* UI framework nem használható

---
