// VedikaFilterPanel - Filter controls for Index Workbench
// Includes: date range, status, jenis, search
// Fetch only on "Apply Filter" click (NOT auto-fetch)

import { useState } from 'react';
import type { ClaimStatus, JenisLayanan } from '../../../services/vedikaService';

export interface FilterValues {
    date_from: string;
    date_to: string;
    status: ClaimStatus;
    jenis: JenisLayanan;
    search: string;
}

interface VedikaFilterPanelProps {
    initialValues?: Partial<FilterValues>;
    onApplyFilter: (values: FilterValues) => void;
    isLoading?: boolean;
}

const STATUS_OPTIONS: { value: ClaimStatus; label: string; color: string }[] = [
    { value: 'RENCANA', label: 'Rencana', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'PENGAJUAN', label: 'Pengajuan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    { value: 'PERBAIKAN', label: 'Perbaikan', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    { value: 'LENGKAP', label: 'Lengkap', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    { value: 'SETUJU', label: 'Disetujui', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
];

const JENIS_OPTIONS: { value: JenisLayanan; label: string }[] = [
    { value: 'ralan', label: 'Rawat Jalan' },
    { value: 'ranap', label: 'Rawat Inap' },
];

// Get current month's first and last day as defaults
const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        date_from: firstDay.toISOString().split('T')[0],
        date_to: lastDay.toISOString().split('T')[0],
    };
};

export default function VedikaFilterPanel({
    initialValues,
    onApplyFilter,
    isLoading = false,
}: VedikaFilterPanelProps) {
    const defaultDates = getDefaultDates();

    const [filters, setFilters] = useState<FilterValues>({
        date_from: initialValues?.date_from || defaultDates.date_from,
        date_to: initialValues?.date_to || defaultDates.date_to,
        status: initialValues?.status || 'RENCANA',
        jenis: initialValues?.jenis || 'ralan',
        search: initialValues?.search || '',
    });

    const handleChange = (field: keyof FilterValues, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApplyFilter(filters);
    };

    const handleReset = () => {
        const resetValues: FilterValues = {
            date_from: defaultDates.date_from,
            date_to: defaultDates.date_to,
            status: 'RENCANA',
            jenis: 'ralan',
            search: '',
        };
        setFilters(resetValues);
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Filter Klaim
                        </h3>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Date From */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleChange('date_from', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleChange('date_to', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status Klaim
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Jenis */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Jenis Rawat
                            </label>
                            <select
                                value={filters.jenis}
                                onChange={(e) => handleChange('jenis', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                {JENIS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pencarian
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleChange('search', e.target.value)}
                                placeholder="Nama, No.RM, No.Rawat..."
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memuat...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Terapkan Filter
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

// Export status options for use in other components
export { STATUS_OPTIONS, JENIS_OPTIONS };
