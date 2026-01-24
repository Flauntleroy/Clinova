---
description: how to implement paginated tables in Clinova
---

Semua tabel baru yang memiliki fitur paginasi wajib mengikuti standar berikut untuk menjaga konsistensi UI/UX:

### 1. State Filter
Pastikan state filter menyertakan `limit` dengan default value (misal: 10 atau 25).

```tsx
const [filter, setFilter] = useState<UserFilter>({
    page: 1,
    limit: 10, // Opsional: sesuaikan kebutuhan awal
});
```

### 2. Dropdown Limit (Page Size)
Tambahkan dropdown pemilihan limit dI area pagination dengan opsi **10, 25, 50, dan 100**.

```tsx
<div className="flex items-center gap-2">
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Data per halaman
    </label>
    <select
        value={filter.limit}
        onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
        className="px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
    </select>
</div>
```

### 3. Ikon Navigasi (SVG)
Gunakan ikon SVG untuk tombol navigasi halaman, bukan teks (Sebelumnya/Selanjutnya).

```tsx
<button onClick={prevPage} disabled={isFirstPage}>
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
</button>
```

### 4. Reset ke Halaman 1
Setiap kali `limit` diubah, pastikan halaman di-reset kembali ke **1**.

```tsx
const handleFilterChange = (key, value) => {
    setFilter(prev => ({
        ...prev,
        [key]: value,
        page: 1 // Selalu reset ke halaman 1 kecuali saat navigasi page itu sendiri
    }));
};
```
