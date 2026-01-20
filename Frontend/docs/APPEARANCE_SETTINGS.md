# 🎨 Appearance Settings - Panduan CSS Global

Dokumentasi ini menjelaskan sistem Appearance Settings yang memungkinkan pengguna mengkustomisasi tampilan aplikasi. **Semua modul baru WAJIB mengikuti panduan ini.**

---

## 📁 File Utama

| File | Fungsi |
|------|--------|
| `src/context/AppearanceContext.tsx` | State management & aplikasi setting ke DOM |
| `src/index.css` | CSS variables & global styles |
| `src/components/Appearance/` | UI komponen Settings Panel |

---

## 🔧 CSS Variables yang Tersedia

### Spacing & Density

```css
:root {
  --spacing-base: 1.25rem;      /* Base spacing unit */
  --spacing-xs: 0.375rem;       /* Extra small: 6px */
  --spacing-sm: 0.75rem;        /* Small: 12px */
  --spacing-md: 1.25rem;        /* Medium: 20px */
  --spacing-lg: 2rem;           /* Large: 32px */
  --spacing-xl: 2.5rem;         /* Extra large: 40px */
  --table-row-height: 3.5rem;   /* Table row height */
  --form-input-height: 3rem;    /* Form input height */
  --card-padding: 1.5rem;       /* Card padding */
  --section-gap: 1.5rem;        /* Gap antar section */
}
```

### Typography

```css
:root {
  --font-family: 'Public Sans', sans-serif;  /* Dynamic font - dioverride AppearanceContext */
}
```

**PENTING:** Font family diatur secara dinamis oleh `AppearanceContext`. Jangan hardcode font di komponen!

### Brand Colors

```css
:root {
  --color-brand-50: hsl(h, s%, 97%);
  --color-brand-100: hsl(h, s%, 94%);
  --color-brand-200: hsl(h, s%, 86%);
  --color-brand-300: hsl(h, s%, 76%);
  --color-brand-400: hsl(h, s%, 66%);
  --color-brand-500: hsl(h, s%, 50%);   /* Primary color */
  --color-brand-600: hsl(h, s%, 42%);
  --color-brand-700: hsl(h, s%, 35%);
  --color-brand-800: hsl(h, s%, 28%);
  --color-brand-900: hsl(h, s%, 20%);
}
```

---

## 📐 Density Modes

### Comfortable (Default)
- Full width layout tanpa max-width constraint
- Padding: `p-6 md:p-8`
- Spacing lebih lega untuk readability

### Compact
- Max-width constraint: `max-w-(--breakpoint-2xl)`
- Padding: `p-4 md:p-5`
- Spacing lebih rapat untuk information density

**CSS Class:** `.density-compact` ditambahkan ke `<html>` element saat compact mode aktif.

---

## 🧩 Cara Menggunakan di Komponen Baru

### 1. Menggunakan Spacing Variables

```tsx
// ❌ JANGAN hardcode spacing
<div className="p-4 gap-6">

// ✅ GUNAKAN responsive classes yang akan dioverride oleh density
<div className="p-4 md:p-6 gap-4 md:gap-6">
```

### 2. Menggunakan Brand Colors

```tsx
// ❌ JANGAN hardcode warna
<button className="bg-blue-500 hover:bg-blue-600">

// ✅ GUNAKAN brand colors
<button className="bg-brand-500 hover:bg-brand-600">
```

### 3. Menggunakan Font Family

```tsx
// ❌ JANGAN hardcode font
<p style={{ fontFamily: 'Inter' }}>

// ✅ BIARKAN inherit dari body (otomatis mengikuti --font-family)
<p className="text-base">
```

### 4. Mengakses Appearance State

```tsx
import { useAppearance } from '../context/AppearanceContext';

const MyComponent = () => {
  const { appearance } = useAppearance();
  const { density, theme, navLayout, primaryColor } = appearance;
  
  // Conditional styling berdasarkan density
  const cardPadding = density === 'compact' ? 'p-3' : 'p-5';
  
  return <div className={cardPadding}>...</div>;
};
```

---

## 🎯 Navigation Layouts

| Layout | Deskripsi |
|--------|-----------|
| `sidebar` | Sidebar penuh dengan expand/collapse |
| `minimal` | Sidebar icon-only (70px) |
| `top` | Horizontal navbar tanpa sidebar |

### Mengecek Layout

```tsx
const { appearance } = useAppearance();
const isTopLayout = appearance.navLayout === 'top';
```

---

## 🌓 Theme & Contrast

### Theme
- `light` - Light mode
- `dark` - Dark mode (class `dark` di `<html>`)

### Contrast
- `normal` - Normal contrast
- `high` - High contrast (class `high-contrast` di `<html>`)

---

## 📝 Checklist untuk Modul Baru

- [ ] **Tidak hardcode font-family** - Biarkan inherit dari body
- [ ] **Gunakan brand colors** - `bg-brand-500`, `text-brand-600`, dll
- [ ] **Responsive spacing** - `p-4 md:p-6` bukan nilai fixed
- [ ] **Test di kedua density modes** - Comfortable & Compact
- [ ] **Test di semua nav layouts** - Sidebar, Minimal, Top
- [ ] **Support dark mode** - Gunakan `dark:` prefix Tailwind
- [ ] **Gunakan CSS variables untuk custom styling**

---

## 🔄 Bagaimana AppearanceContext Bekerja

1. **Inisialisasi:** Membaca settings dari `localStorage`
2. **Apply ke DOM:**
   - Theme → class `dark` di `<html>`
   - Contrast → class `high-contrast` di `<html>`
   - Density → class `density-compact` di `<html>`
   - Primary Color → CSS variables `--color-brand-*` di `<html>`
   - Font Family → CSS variable `--font-family` di `<html>`
   - Font Size → `font-size` style di `<html>`
3. **Persist:** Menyimpan ke `localStorage` setiap perubahan

---

## 📚 File References

```
src/
├── context/
│   └── AppearanceContext.tsx    # State & DOM application
├── components/
│   └── Appearance/
│       ├── AppearanceSettings.tsx   # Settings Panel UI
│       └── ...                      # Sub-components
├── layout/
│   ├── AppLayout.tsx            # Uses density for padding
│   ├── AppHeader.tsx            # Conditional top navbar
│   └── TopNavbar.tsx            # Horizontal nav component
└── index.css                    # CSS variables definition
```

---

## ⚠️ Pitfalls yang Harus Dihindari

1. **Jangan gunakan `font-outfit` class** - Override oleh `--font-family`
2. **Jangan hardcode max-width** - Dikontrol oleh density mode
3. **Jangan override brand colors dengan fixed colors** - Gunakan `--color-brand-*`
4. **Jangan lupa test dark mode** - Selalu gunakan `dark:` prefix

---

*Dokumentasi ini dibuat pada 21 Januari 2026. Update jika ada perubahan pada sistem Appearance Settings.*
