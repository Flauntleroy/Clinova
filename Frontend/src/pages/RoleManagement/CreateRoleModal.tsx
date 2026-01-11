import { useState, useEffect } from 'react';
import { Role, userManagementService } from '../../services/userManagementService';
import { useUI } from '../../context/UIContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editRole: Role | null;
}

export default function CreateRoleModal({ isOpen, onClose, onSuccess, editRole }: Props) {
    const { toast } = useUI();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEdit = !!editRole;

    useEffect(() => {
        if (isOpen && editRole) {
            setName(editRole.name);
            setDescription(editRole.description || '');
        } else if (isOpen) {
            setName('');
            setDescription('');
        }
        setError('');
    }, [isOpen, editRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Nama role wajib diisi');
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                await userManagementService.updateRole(editRole.id, { name, description });
                toast('Role berhasil diperbarui', { type: 'success' });
            } else {
                await userManagementService.createRole({ name, description });
                toast('Role berhasil dibuat', { type: 'success' });
            }
            onSuccess();
        } catch (err: unknown) {
            console.error('Failed to save role:', err);
            const message = (err as { error?: { message?: string } })?.error?.message || 'Gagal menyimpan role';
            setError(message);
            toast(message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                    {isEdit ? 'Edit Role' : 'Tambah Role Baru'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nama Role <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: kasir, dokter, perawat"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            disabled={editRole?.is_system}
                        />
                        {editRole?.is_system && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                Nama role sistem tidak dapat diubah
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Deskripsi
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Deskripsi singkat tentang role ini..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
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
                            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Role'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
