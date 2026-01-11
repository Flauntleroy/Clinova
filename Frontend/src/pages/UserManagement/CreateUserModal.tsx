import { useState } from 'react';
import { User, userManagementService, CreateUserRequest, UpdateUserRequest } from '../../services/userManagementService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editUser: User | null;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess, editUser }: Props) {
    const [username, setUsername] = useState(editUser?.username || '');
    const [email, setEmail] = useState(editUser?.email || '');
    const [password, setPassword] = useState('');
    const [isActive, setIsActive] = useState(editUser?.is_active ?? true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEdit = !!editUser;

    // Reset form when modal opens
    useState(() => {
        if (isOpen) {
            setUsername(editUser?.username || '');
            setEmail(editUser?.email || '');
            setPassword('');
            setIsActive(editUser?.is_active ?? true);
            setError('');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isEdit) {
                const data: UpdateUserRequest = {
                    username,
                    email,
                    is_active: isActive,
                };
                await userManagementService.updateUser(editUser.id, data);
            } else {
                if (!password) {
                    setError('Password wajib diisi');
                    setLoading(false);
                    return;
                }
                const data: CreateUserRequest = {
                    username,
                    email,
                    password,
                    is_active: isActive,
                };
                await userManagementService.createUser(data);
            }
            onSuccess();
        } catch (err: any) {
            // ApiError has structure: {success: false, error: {code, message}}
            const message = err?.error?.message || err?.message || 'Terjadi kesalahan';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
                </h2>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="contoh: admin"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="contoh@email.com"
                        />
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                required={!isEdit}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="Minimal 8 karakter"
                                minLength={8}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                            Aktif
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
