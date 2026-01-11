import { useState, useEffect, useCallback } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';
import { userManagementService, User, UserFilter, Role } from '../../services/userManagementService';
import UserDetailDrawer from './UserDetailDrawer';
import CreateUserModal from './CreateUserModal';

// Status badge colors
const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function UserManagement() {
    const { can } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);

    // Filter state
    const [filter, setFilter] = useState<UserFilter>({
        page: 1,
        limit: 25,
    });

    const canWrite = can('usermanagement.write');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userManagementService.getUsers(filter);
            setUsers(data.users || []);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        userManagementService.getRoles().then(setRoles).catch(console.error);
    }, []);

    const handleFilterChange = (key: keyof UserFilter, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilter((prev) => ({ ...prev, page: newPage }));
    };

    const handleViewDetail = async (user: User) => {
        try {
            const fullUser = await userManagementService.getUser(user.id);
            setSelectedUser(fullUser);
            setDrawerOpen(true);
        } catch (error) {
            console.error('Failed to fetch user detail:', error);
        }
    };

    const handleEdit = (user: User) => {
        setEditUser(user);
        setCreateModalOpen(true);
    };

    const handleToggleStatus = async (user: User) => {
        if (!canWrite) return;
        try {
            if (user.is_active) {
                await userManagementService.deactivateUser(user.id);
            } else {
                await userManagementService.activateUser(user.id);
            }
            fetchUsers();
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const handleCreateSuccess = () => {
        setCreateModalOpen(false);
        setEditUser(null);
        fetchUsers();
    };

    const handleDrawerAction = () => {
        fetchUsers();
        setDrawerOpen(false);
    };

    const totalPages = Math.ceil(total / (filter.limit || 25));

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
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
            <PageMeta title="Manajemen Pengguna | SIMRS" description="Kelola akun pengguna, role, dan hak akses sistem" />
            <PageBreadCrumb pageTitle="Manajemen Pengguna" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 lg:p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Manajemen Pengguna</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola akun pengguna, role, dan hak akses sistem
                        </p>
                    </div>
                    {canWrite && (
                        <button
                            onClick={() => {
                                setEditUser(null);
                                setCreateModalOpen(true);
                            }}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                        >
                            + Tambah Pengguna
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cari
                        </label>
                        <input
                            type="text"
                            placeholder="Username atau email..."
                            value={filter.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <select
                            value={filter.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Role
                        </label>
                        <select
                            value={filter.role || ''}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Semua Role</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Username
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Login Terakhir
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
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Tidak ada data pengguna
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                                            {user.username}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {user.email}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.is_active ? statusColors.active : statusColors.inactive
                                                    }`}
                                            >
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {user.roles?.map((r) => r.name).join(', ') || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDate(user.last_login_at)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(user)}
                                                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                                                >
                                                    Detail
                                                </button>
                                                {canWrite && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${user.is_active
                                                                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                                                                    : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                                                                }`}
                                                        >
                                                            {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Menampilkan {users.length} dari {total} data
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Page Size */}
                        <select
                            value={filter.limit || 25}
                            onChange={(e) => handleFilterChange('limit', e.target.value)}
                            className="h-9 rounded-lg border border-gray-300 bg-transparent px-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>

                        {/* Prev/Next */}
                        <button
                            onClick={() => handlePageChange((filter.page || 1) - 1)}
                            disabled={(filter.page || 1) <= 1}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
                        >
                            ←
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {filter.page} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => handlePageChange((filter.page || 1) + 1)}
                            disabled={(filter.page || 1) >= totalPages}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Drawer */}
            <UserDetailDrawer
                user={selectedUser}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onAction={handleDrawerAction}
                canWrite={canWrite}
            />

            {/* Create/Edit Modal */}
            <CreateUserModal
                isOpen={createModalOpen}
                onClose={() => {
                    setCreateModalOpen(false);
                    setEditUser(null);
                }}
                onSuccess={handleCreateSuccess}
                editUser={editUser}
            />
        </>
    );
}
