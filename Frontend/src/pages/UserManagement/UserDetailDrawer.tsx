import { useState } from 'react';
import { User, userManagementService } from '../../services/userManagementService';
import { useUI } from '../../context/UIContext';
import AssignRolesModal from './AssignRolesModal';
import PermissionOverrideModal from './PermissionOverrideModal';
import CopyAccessModal from './CopyAccessModal';

interface Props {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void;
    canWrite: boolean;
}

export default function UserDetailDrawer({ user, isOpen, onClose, onAction, canWrite }: Props) {
    const { toast } = useUI();
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [permModalOpen, setPermModalOpen] = useState(false);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleResetPassword = async () => {
        if (!newPassword) return;
        setLoading(true);
        try {
            await userManagementService.resetPassword(user.id, { new_password: newPassword });
            setResetPasswordOpen(false);
            setNewPassword('');
            toast('Password berhasil direset', { type: 'success' });
        } catch (error) {
            console.error('Failed to reset password:', error);
            toast('Gagal mereset password', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            if (user.is_active) {
                await userManagementService.deactivateUser(user.id);
            } else {
                await userManagementService.activateUser(user.id);
            }
            onAction();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/50"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Detail Pengguna
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Basic Info */}
                    <section>
                        <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                            Informasi Dasar
                        </h3>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Username</dt>
                                    <dd className="text-sm font-medium text-gray-800 dark:text-white">{user.username}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                                    <dd className="text-sm font-medium text-gray-800 dark:text-white">{user.email}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                                    <dd>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                        >
                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Login Terakhir</dt>
                                    <dd className="text-sm font-medium text-gray-800 dark:text-white">
                                        {formatDate(user.last_login_at)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    {/* Roles */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                                Role
                            </h3>
                            {canWrite && (
                                <button
                                    onClick={() => setRoleModalOpen(true)}
                                    className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                >
                                    Ubah Role
                                </button>
                            )}
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            {user.roles && user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role.id}
                                            className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                                        >
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Tidak ada role yang ditetapkan</p>
                            )}
                        </div>
                    </section>

                    {/* Permission Overrides */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                                Permission Override
                            </h3>
                            {canWrite && (
                                <button
                                    onClick={() => setPermModalOpen(true)}
                                    className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                >
                                    Kelola
                                </button>
                            )}
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            {user.permission_overrides && user.permission_overrides.length > 0 ? (
                                <div className="space-y-2">
                                    {user.permission_overrides.map((override, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-800 dark:text-white">
                                                {override.permission_code}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${override.effect === 'grant'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {override.effect === 'grant' ? 'GRANT' : 'REVOKE'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Tidak ada permission override</p>
                            )}
                        </div>
                    </section>

                    {/* Actions */}
                    {canWrite && (
                        <section>
                            <h3 className="mb-3 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                                Aksi
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setResetPasswordOpen(!resetPasswordOpen)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Reset Password
                                </button>

                                {resetPasswordOpen && (
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                        <input
                                            type="password"
                                            placeholder="Password baru..."
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                        <button
                                            onClick={handleResetPassword}
                                            disabled={loading || !newPassword}
                                            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                                        >
                                            {loading ? 'Menyimpan...' : 'Simpan Password'}
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setCopyModalOpen(true)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Salin Akses dari User Lain
                                </button>

                                <button
                                    onClick={handleToggleStatus}
                                    disabled={loading}
                                    className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${user.is_active
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                        } disabled:opacity-50`}
                                >
                                    {loading ? 'Memproses...' : user.is_active ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AssignRolesModal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                onSuccess={() => {
                    setRoleModalOpen(false);
                    onAction();
                }}
                userId={user.id}
                currentRoles={user.roles || []}
            />

            <PermissionOverrideModal
                isOpen={permModalOpen}
                onClose={() => setPermModalOpen(false)}
                onSuccess={() => {
                    setPermModalOpen(false);
                    onAction();
                }}
                userId={user.id}
                currentOverrides={user.permission_overrides || []}
            />

            <CopyAccessModal
                isOpen={copyModalOpen}
                onClose={() => setCopyModalOpen(false)}
                onSuccess={() => {
                    setCopyModalOpen(false);
                    onAction();
                }}
                userId={user.id}
                username={user.username}
            />
        </>
    );
}
