import { useState, useEffect } from 'react';
import { Role, Permission, userManagementService } from '../../services/userManagementService';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import CreateRoleModal from './CreateRoleModal';
import RolePermissionsModal from './RolePermissionsModal';

export default function RoleManagement() {
    const { can } = useAuth();
    const { toast, confirm } = useUI();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);
    const [permissionsModalRole, setPermissionsModalRole] = useState<Role | null>(null);

    const canWrite = can('rolemanagement.write');

    const loadData = async () => {
        setLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                userManagementService.getRoles(),
                userManagementService.getPermissions(),
            ]);
            setRoles(rolesData);
            setPermissions(permsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast('Gagal memuat data', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (role: Role) => {
        if (role.is_system) {
            toast('Role sistem tidak dapat dihapus', { type: 'warning' });
            return;
        }

        const confirmed = await confirm(
            `Apakah Anda yakin ingin menghapus role "${role.name}"? Semua user dengan role ini akan kehilangan akses terkait.`,
            { title: 'Hapus Role', variant: 'danger', confirmText: 'Ya, Hapus', cancelText: 'Batal' }
        );

        if (!confirmed) return;

        try {
            await userManagementService.deleteRole(role.id);
            toast('Role berhasil dihapus', { type: 'success' });
            loadData();
        } catch (error) {
            console.error('Failed to delete:', error);
            toast('Gagal menghapus role', { type: 'error' });
        }
    };

    const handleEdit = (role: Role) => {
        setEditRole(role);
        setCreateModalOpen(true);
    };

    const handleManagePermissions = async (role: Role) => {
        try {
            // Fetch role with permissions
            const roleWithPerms = await userManagementService.getRole(role.id);
            setPermissionsModalRole(roleWithPerms);
        } catch (error) {
            console.error('Failed to load role:', error);
            toast('Gagal memuat data role', { type: 'error' });
        }
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Manajemen Role
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Kelola role dan permission untuk sistem RBAC
                    </p>
                </div>
                {canWrite && (
                    <button
                        onClick={() => {
                            setEditRole(null);
                            setCreateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Role
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                    Nama Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                    Deskripsi
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                    Permissions
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                    Tipe
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {roles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Belum ada role
                                    </td>
                                </tr>
                            ) : (
                                roles.map(role => (
                                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {role.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {role.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                                                {role.permission_count ?? role.permissions?.length ?? 0} permissions
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {role.is_system ? (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Sistem
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                    Custom
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleManagePermissions(role)}
                                                    className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                                                    title="Kelola Permissions"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                    </svg>
                                                </button>
                                                {canWrite && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                                            title="Edit"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        {!role.is_system && (
                                                            <button
                                                                onClick={() => handleDelete(role)}
                                                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                                title="Hapus"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Permissions Summary */}
            <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
                    Daftar Permission ({permissions.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Object.entries(
                        permissions.reduce((acc, p) => {
                            if (!acc[p.domain]) acc[p.domain] = [];
                            acc[p.domain].push(p);
                            return acc;
                        }, {} as Record<string, Permission[]>)
                    ).map(([domain, perms]) => (
                        <div key={domain} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <h4 className="mb-2 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                                {domain}
                            </h4>
                            <ul className="space-y-1">
                                {perms.map(p => (
                                    <li key={p.id} className="text-sm text-gray-700 dark:text-gray-300">
                                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                                            {p.code}
                                        </code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <CreateRoleModal
                isOpen={createModalOpen}
                onClose={() => {
                    setCreateModalOpen(false);
                    setEditRole(null);
                }}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    setEditRole(null);
                    loadData();
                }}
                editRole={editRole}
            />

            <RolePermissionsModal
                isOpen={!!permissionsModalRole}
                onClose={() => setPermissionsModalRole(null)}
                onSuccess={() => {
                    setPermissionsModalRole(null);
                    loadData();
                }}
                role={permissionsModalRole}
                allPermissions={permissions}
            />
        </div>
    );
}
