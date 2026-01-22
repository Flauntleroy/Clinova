import React, { useEffect, useState } from 'react';
import { ClaimDetailFull } from '../../../types/claimDetail';
import { API_ENDPOINTS } from '../../../config/api';
import { TokenStorage } from '../../../services/authService';

interface ClaimDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    noRawat: string;
}

type TabId = 'pasien' | 'sep' | 'medis' | 'pemeriksaan' | 'tindakan' | 'penunjang' | 'obat' | 'billing';

interface TabItem {
    id: TabId;
    label: string;
    icon: string;
}

const tabs: TabItem[] = [
    { id: 'pasien', label: 'Pasien', icon: '👤' },
    { id: 'sep', label: 'SEP/BPJS', icon: '🏥' },
    { id: 'medis', label: 'Medis', icon: '📋' },
    { id: 'pemeriksaan', label: 'Pemeriksaan', icon: '🩺' },
    { id: 'tindakan', label: 'Tindakan', icon: '💉' },
    { id: 'penunjang', label: 'Penunjang', icon: '🔬' },
    { id: 'obat', label: 'Obat', icon: '💊' },
    { id: 'billing', label: 'Billing', icon: '💰' },
];

const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
    isOpen,
    onClose,
    noRawat,
}) => {
    const [data, setData] = useState<ClaimDetailFull | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('pasien');

    useEffect(() => {
        if (isOpen && noRawat) {
            fetchDetail();
        }
    }, [isOpen, noRawat]);

    const fetchDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = TokenStorage.getAccessToken();
            const response = await fetch(API_ENDPOINTS.VEDIKA.CLAIM(noRawat), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch claim detail');
            }

            const result = await response.json();
            setData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1">
                {title}
            </h4>
            {children}
        </div>
    );

    const renderField = (label: string, value: string | number | undefined | null) => (
        <div className="flex justify-between py-1 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-white font-medium">{value || '-'}</span>
        </div>
    );

    const renderPasienTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSection('Data Pasien', (
                <div className="space-y-1">
                    {renderField('No. RM', data?.patient?.no_rkm_medis)}
                    {renderField('Nama', data?.patient?.nama_pasien)}
                    {renderField('Jenis Kelamin', data?.patient?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan')}
                    {renderField('Tgl Lahir', data?.patient?.tgl_lahir)}
                    {renderField('Alamat', data?.patient?.alamat)}
                    {renderField('Kecamatan', data?.patient?.kecamatan)}
                    {renderField('Kabupaten', data?.patient?.kabupaten)}
                    {renderField('No. Telp', data?.patient?.no_tlp)}
                </div>
            ))}
            {renderSection('Data Registrasi', (
                <div className="space-y-1">
                    {renderField('No. Rawat', data?.registration?.no_rawat)}
                    {renderField('Tgl Registrasi', data?.registration?.tgl_registrasi)}
                    {renderField('Jam', data?.registration?.jam_reg)}
                    {renderField('Poli', data?.registration?.nama_poli)}
                    {renderField('Dokter', data?.registration?.nama_dokter)}
                    {renderField('Cara Bayar', data?.registration?.cara_bayar)}
                    {renderField('Status', data?.registration?.status)}
                </div>
            ))}
        </div>
    );

    const renderSEPTab = () => (
        <div className="space-y-4">
            {data?.sep ? (
                renderSection('Data SEP', (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            {renderField('No. SEP', data.sep.no_sep)}
                            {renderField('No. Kartu', data.sep.no_kartu)}
                            {renderField('Tgl SEP', data.sep.tgl_sep)}
                            {renderField('Kelas Rawat', data.sep.kelas_rawat)}
                        </div>
                        <div className="space-y-1">
                            {renderField('Tgl Rujukan', data.sep.tgl_rujukan)}
                            {renderField('Batas Rujukan', data.sep.batas_rujukan)}
                            {renderField('Diagnosa', data.sep.nm_diagnosa)}
                            {renderField('Catatan', data.sep.catatan)}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-center py-4">Tidak ada data SEP</p>
            )}

            {data?.prb && renderSection('Data PRB', (
                <div className="space-y-1">
                    {renderField('No. PRB', data.prb.no_prb)}
                    {renderField('Tgl Mulai', data.prb.tgl_mulai)}
                    {renderField('Tgl Akhir', data.prb.tgl_akhir)}
                    {renderField('Diagnosa', data.prb.nm_diagnosa)}
                </div>
            ))}
        </div>
    );

    const renderMedisTab = () => (
        <div className="space-y-4">
            {renderSection('Diagnosa', (
                data?.diagnoses && data.diagnoses.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-1 text-left">No</th>
                                <th className="px-2 py-1 text-left">Kode</th>
                                <th className="px-2 py-1 text-left">Nama</th>
                                <th className="px-2 py-1 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.diagnoses.map((dx, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="px-2 py-1">{dx.prioritas}</td>
                                    <td className="px-2 py-1 font-mono">{dx.kode_penyakit}</td>
                                    <td className="px-2 py-1">{dx.nama_penyakit}</td>
                                    <td className="px-2 py-1">{dx.status_dx}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500">Tidak ada diagnosa</p>
            ))}

            {renderSection('Prosedur', (
                data?.procedures && data.procedures.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-1 text-left">No</th>
                                <th className="px-2 py-1 text-left">Kode</th>
                                <th className="px-2 py-1 text-left">Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.procedures.map((proc, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="px-2 py-1">{proc.prioritas}</td>
                                    <td className="px-2 py-1 font-mono">{proc.kode}</td>
                                    <td className="px-2 py-1">{proc.deskripsi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500">Tidak ada prosedur</p>
            ))}

            {data?.resume && renderSection('Resume Medis', (
                <div className="space-y-2 text-sm">
                    <div><strong>Keluhan:</strong> {data.resume.keluhan_utama || '-'}</div>
                    <div><strong>Pemeriksaan:</strong> {data.resume.pemeriksaan_fisik || '-'}</div>
                    <div><strong>Diagnosa Akhir:</strong> {data.resume.diagnosa_akhir || '-'}</div>
                    <div><strong>Terapi:</strong> {data.resume.terapi || '-'}</div>
                    <div><strong>Anjuran:</strong> {data.resume.anjuran || '-'}</div>
                    <div><strong>Dokter:</strong> {data.resume.nm_dokter || '-'}</div>
                </div>
            ))}
        </div>
    );

    const renderPemeriksaanTab = () => (
        <div className="space-y-4">
            {renderSection('Catatan SOAP', (
                data?.examinations && data.examinations.length > 0 ? (
                    <div className="space-y-3">
                        {data.examinations.map((exam, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
                                <div className="font-medium mb-2">
                                    {exam.tgl_perawatan} {exam.jam_rawat}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                                    {exam.tensi && <span>Tensi: {exam.tensi}</span>}
                                    {exam.nadi && <span>Nadi: {exam.nadi}</span>}
                                    {exam.suhu_tubuh && <span>Suhu: {exam.suhu_tubuh}</span>}
                                    {exam.respirasi && <span>Respirasi: {exam.respirasi}</span>}
                                </div>
                                {exam.keluhan && <div><strong>S:</strong> {exam.keluhan}</div>}
                                {exam.pemeriksaan && <div><strong>O:</strong> {exam.pemeriksaan}</div>}
                                {exam.penilaian && <div><strong>A:</strong> {exam.penilaian}</div>}
                                {exam.rtl && <div><strong>P:</strong> {exam.rtl}</div>}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500">Tidak ada data pemeriksaan</p>
            ))}
        </div>
    );

    const renderTindakanTab = () => (
        <div className="space-y-4">
            {renderSection('Tindakan Rawat Jalan (Dokter)', (
                data?.treatments_ralan_dr && data.treatments_ralan_dr.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-1 text-left">Tanggal</th>
                                <th className="px-2 py-1 text-left">Tindakan</th>
                                <th className="px-2 py-1 text-left">Dokter</th>
                                <th className="px-2 py-1 text-right">Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.treatments_ralan_dr.map((t, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="px-2 py-1">{t.tgl_perawatan}</td>
                                    <td className="px-2 py-1">{t.nm_perawatan}</td>
                                    <td className="px-2 py-1">{t.nm_dokter}</td>
                                    <td className="px-2 py-1 text-right">{formatCurrency(t.biaya)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500">Tidak ada tindakan</p>
            ))}

            {data?.rooms && data.rooms.length > 0 && renderSection('Kamar Inap', (
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-2 py-1 text-left">Masuk</th>
                            <th className="px-2 py-1 text-left">Keluar</th>
                            <th className="px-2 py-1 text-left">Bangsal</th>
                            <th className="px-2 py-1 text-right">Lama</th>
                            <th className="px-2 py-1 text-right">Biaya</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rooms.map((r, i) => (
                            <tr key={i} className="border-b dark:border-gray-600">
                                <td className="px-2 py-1">{r.tgl_masuk}</td>
                                <td className="px-2 py-1">{r.tgl_keluar || '-'}</td>
                                <td className="px-2 py-1">{r.nm_bangsal}</td>
                                <td className="px-2 py-1 text-right">{r.lama_menginap} hari</td>
                                <td className="px-2 py-1 text-right">{formatCurrency(r.total_biaya)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}
        </div>
    );

    const renderPenunjangTab = () => (
        <div className="space-y-4">
            {renderSection('Radiologi', (
                data?.radiology && data.radiology.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-1 text-left">Tanggal</th>
                                <th className="px-2 py-1 text-left">Pemeriksaan</th>
                                <th className="px-2 py-1 text-left">Hasil</th>
                                <th className="px-2 py-1 text-right">Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.radiology.map((r, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="px-2 py-1">{r.tgl_periksa}</td>
                                    <td className="px-2 py-1">{r.nm_perawatan}</td>
                                    <td className="px-2 py-1">{r.hasil || '-'}</td>
                                    <td className="px-2 py-1 text-right">{formatCurrency(r.biaya)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500">Tidak ada radiologi</p>
            ))}

            {renderSection('Laboratorium', (
                data?.laboratory && data.laboratory.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-1 text-left">Tanggal</th>
                                <th className="px-2 py-1 text-left">Pemeriksaan</th>
                                <th className="px-2 py-1 text-right">Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.laboratory.map((l, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="px-2 py-1">{l.tgl_periksa}</td>
                                    <td className="px-2 py-1">{l.nm_perawatan}</td>
                                    <td className="px-2 py-1 text-right">{formatCurrency(l.biaya)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500">Tidak ada laboratorium</p>
            ))}
        </div>
    );

    const renderObatTab = () => (
        <div className="space-y-4">
            {renderSection('Pemberian Obat', (
                data?.medicines_given && data.medicines_given.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-1 text-left">Tanggal</th>
                                <th className="px-2 py-1 text-left">Nama Obat</th>
                                <th className="px-2 py-1 text-right">Jumlah</th>
                                <th className="px-2 py-1 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.medicines_given.map((m, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="px-2 py-1">{m.tgl_perawatan}</td>
                                    <td className="px-2 py-1">{m.nama_obat}</td>
                                    <td className="px-2 py-1 text-right">{m.jumlah} {m.satuan}</td>
                                    <td className="px-2 py-1 text-right">{formatCurrency(m.total_biaya || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500">Tidak ada obat</p>
            ))}

            {renderSection('Resep Pulang', (
                data?.medicines_home && data.medicines_home.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-2 py-1 text-left">Nama Obat</th>
                                <th className="px-2 py-1 text-left">Dosis</th>
                                <th className="px-2 py-1 text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.medicines_home.map((m, i) => (
                                <tr key={i} className="border-b dark:border-gray-600">
                                    <td className="px-2 py-1">{m.nama_obat}</td>
                                    <td className="px-2 py-1">{m.dosis || '-'}</td>
                                    <td className="px-2 py-1 text-right">{m.jumlah} {m.satuan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500">Tidak ada resep pulang</p>
            ))}
        </div>
    );

    const renderBillingTab = () => {
        const totalBilling = data?.billing?.reduce((sum, b) => sum + b.total_biaya, 0) || 0;

        return (
            <div className="space-y-4">
                {renderSection('Rincian Biaya', (
                    data?.billing && data.billing.length > 0 ? (
                        <>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-2 py-1 text-left">No</th>
                                        <th className="px-2 py-1 text-left">Keterangan</th>
                                        <th className="px-2 py-1 text-right">Biaya</th>
                                        <th className="px-2 py-1 text-right">Jml</th>
                                        <th className="px-2 py-1 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.billing.map((b, i) => (
                                        <tr key={i} className="border-b dark:border-gray-600">
                                            <td className="px-2 py-1">{b.no}</td>
                                            <td className="px-2 py-1">{b.nm_perawatan}</td>
                                            <td className="px-2 py-1 text-right">{formatCurrency(b.biaya)}</td>
                                            <td className="px-2 py-1 text-right">{b.jumlah}</td>
                                            <td className="px-2 py-1 text-right">{formatCurrency(b.total_biaya)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100 dark:bg-gray-600 font-bold">
                                    <tr>
                                        <td colSpan={4} className="px-2 py-2 text-right">TOTAL</td>
                                        <td className="px-2 py-2 text-right">{formatCurrency(totalBilling)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </>
                    ) : <p className="text-gray-500">Tidak ada billing</p>
                ))}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'pasien': return renderPasienTab();
            case 'sep': return renderSEPTab();
            case 'medis': return renderMedisTab();
            case 'pemeriksaan': return renderPemeriksaanTab();
            case 'tindakan': return renderTindakanTab();
            case 'penunjang': return renderPenunjangTab();
            case 'obat': return renderObatTab();
            case 'billing': return renderBillingTab();
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Detail Klaim
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {noRawat} • {data?.patient?.nama_pasien || 'Loading...'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b dark:border-gray-700 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-red-500">
                            <p>Error: {error}</p>
                        </div>
                    ) : data ? (
                        renderTabContent()
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-4 border-t dark:border-gray-700">
                    <div className="text-sm text-gray-500">
                        Status: <span className="font-medium text-gray-900 dark:text-white">{data?.status || '-'}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClaimDetailModal;
