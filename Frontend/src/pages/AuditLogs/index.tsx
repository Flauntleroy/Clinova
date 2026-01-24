import { useState, useEffect, useCallback } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import { auditLogService, AuditLogEntry, AuditLogFilter } from '../../services/auditLogService';
import AuditLogDetailDrawer from './AuditLogDetailDrawer';

// Action badge colors
const actionColors: Record<string, string> = {
    INSERT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modules, setModules] = useState<string[]>([]);

    // Filter state
    const [filter, setFilter] = useState<AuditLogFilter>({
        page: 1,
        limit: 25,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await auditLogService.getAuditLogs(filter);
            setLogs(data.logs || []);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        auditLogService.getModules().then(setModules).catch(console.error);
    }, []);

    const handleFilterChange = (key: keyof AuditLogFilter, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilter((prev) => ({ ...prev, page: newPage }));
    };

    const handleViewDetail = async (log: AuditLogEntry) => {
        setSelectedLog(log);
        setDrawerOpen(true);
    };

    const totalPages = Math.ceil(total / (filter.limit || 25));

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <PageMeta title="Audit Log | SIMRS" description="Riwayat aktivitas dan perubahan data sistem" />
            <PageBreadCrumb pageTitle="Audit Log" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 lg:p-6">
                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Audit Log</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Riwayat aktivitas dan perubahan data sistem
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                    {/* Date From */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            value={filter.from || ''}
                            onChange={(e) => handleFilterChange('from', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            value={filter.to || ''}
                            onChange={(e) => handleFilterChange('to', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Module */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Modul
                        </label>
                        <select
                            value={filter.module || ''}
                            onChange={(e) => handleFilterChange('module', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Semua Modul</option>
                            {modules.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Aksi
                        </label>
                        <select
                            value={filter.action || ''}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Semua Aksi</option>
                            <option value="INSERT">INSERT</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>

                    {/* User */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            User
                        </label>
                        <input
                            type="text"
                            placeholder="Cari user..."
                            value={filter.user || ''}
                            onChange={(e) => handleFilterChange('user', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Business Key */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Business Key
                        </label>
                        <input
                            type="text"
                            placeholder="Cari key..."
                            value={filter.business_key || ''}
                            onChange={(e) => handleFilterChange('business_key', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Waktu
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Modul
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Aksi
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Ringkasan
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Tidak ada data audit log
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDate(log.ts)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                                            {log.actor?.username || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {log.module}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="max-w-md truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {log.summary}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <button
                                                onClick={() => handleViewDetail(log)}
                                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-700 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Data per halaman
                            </label>
                            <select
                                value={filter.limit || 25}
                                onChange={(e) => handleFilterChange('limit', e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan {logs.length} dari {total} data
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange((filter.page || 1) - 1)}
                            disabled={(filter.page || 1) <= 1}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white">
                            {filter.page} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => handlePageChange((filter.page || 1) + 1)}
                            disabled={(filter.page || 1) >= totalPages}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Drawer */}
            <AuditLogDetailDrawer
                log={selectedLog}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
}
