import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ClaimDetailFull } from '../../types/claimDetail';
import { API_ENDPOINTS } from '../../config/api';
import { TokenStorage } from '../../services/authService';

const ClaimDetailPage: React.FC = () => {
    const { '*': noRawatParam } = useParams();
    const noRawat = noRawatParam || '';

    const [data, setData] = useState<ClaimDetailFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (noRawat) {
            fetchDetail();
        }
    }, [noRawat]);

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Memuat data klaim...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-red-500">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Detail Klaim Vedika
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                No. Rawat: <span className="font-mono font-medium">{noRawat}</span>
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${data?.status === 'LENGKAP' ? 'bg-green-100 text-green-800' :
                                data?.status === 'SETUJU' ? 'bg-blue-100 text-blue-800' :
                                    data?.status === 'PERBAIKAN' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                            {data?.status || 'RENCANA'}
                        </span>
                    </div>
                </div>

                {/* Patient & Registration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Patient Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            👤 Data Pasien
                        </h2>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">No. RM</dt>
                                <dd className="font-medium">{data?.patient?.no_rkm_medis}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Nama</dt>
                                <dd className="font-medium">{data?.patient?.nama_pasien}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Jenis Kelamin</dt>
                                <dd>{data?.patient?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Tgl Lahir</dt>
                                <dd>{data?.patient?.tgl_lahir}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Alamat</dt>
                                <dd className="text-right max-w-[200px]">{data?.patient?.alamat}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">No. Telp</dt>
                                <dd>{data?.patient?.no_tlp}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Registration Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            📋 Data Registrasi
                        </h2>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Tgl Registrasi</dt>
                                <dd className="font-medium">{data?.registration?.tgl_registrasi}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Jam</dt>
                                <dd>{data?.registration?.jam_reg}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Poli</dt>
                                <dd>{data?.registration?.nama_poli}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Dokter</dt>
                                <dd className="text-right max-w-[200px]">{data?.registration?.nama_dokter}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Cara Bayar</dt>
                                <dd>{data?.registration?.cara_bayar}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Status</dt>
                                <dd>{data?.registration?.status}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* SEP Info */}
                {data?.sep && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            🏥 Data SEP/BPJS
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-500">No. SEP</dt>
                                <dd className="font-mono font-medium">{data.sep.no_sep}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">No. Kartu</dt>
                                <dd className="font-mono">{data.sep.no_kartu}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Tgl SEP</dt>
                                <dd>{data.sep.tgl_sep}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Kelas Rawat</dt>
                                <dd>{data.sep.kelas_rawat}</dd>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diagnoses */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                        🩺 Diagnosa
                    </h2>
                    {data?.diagnoses && data.diagnoses.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">No</th>
                                    <th className="px-3 py-2 text-left">Kode ICD-10</th>
                                    <th className="px-3 py-2 text-left">Nama Penyakit</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.diagnoses.map((dx, i) => (
                                    <tr key={i} className="border-b dark:border-gray-600">
                                        <td className="px-3 py-2">{dx.prioritas}</td>
                                        <td className="px-3 py-2 font-mono">{dx.kode_penyakit}</td>
                                        <td className="px-3 py-2">{dx.nama_penyakit}</td>
                                        <td className="px-3 py-2">{dx.status_dx}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Tidak ada data diagnosa</p>
                    )}
                </div>

                {/* Procedures */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                        💉 Prosedur/Tindakan
                    </h2>
                    {data?.procedures && data.procedures.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">No</th>
                                    <th className="px-3 py-2 text-left">Kode ICD-9</th>
                                    <th className="px-3 py-2 text-left">Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.procedures.map((proc, i) => (
                                    <tr key={i} className="border-b dark:border-gray-600">
                                        <td className="px-3 py-2">{proc.prioritas}</td>
                                        <td className="px-3 py-2 font-mono">{proc.kode}</td>
                                        <td className="px-3 py-2">{proc.deskripsi}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Tidak ada data prosedur</p>
                    )}
                </div>

                {/* Resume */}
                {data?.resume && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            📝 Resume Medis
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <strong className="text-gray-700 dark:text-gray-300">Keluhan:</strong>
                                <p className="mt-1">{data.resume.keluhan_utama || '-'}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700 dark:text-gray-300">Pemeriksaan Fisik:</strong>
                                <p className="mt-1">{data.resume.pemeriksaan_fisik || '-'}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700 dark:text-gray-300">Diagnosa Akhir:</strong>
                                <p className="mt-1">{data.resume.diagnosa_akhir || '-'}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700 dark:text-gray-300">Terapi:</strong>
                                <p className="mt-1">{data.resume.terapi || '-'}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700 dark:text-gray-300">Dokter:</strong>
                                <p className="mt-1">{data.resume.nm_dokter || '-'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Treatments */}
                {data?.treatments_ralan_dr && data.treatments_ralan_dr.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            💊 Tindakan Dokter
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">Tanggal</th>
                                    <th className="px-3 py-2 text-left">Tindakan</th>
                                    <th className="px-3 py-2 text-left">Dokter</th>
                                    <th className="px-3 py-2 text-right">Biaya</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.treatments_ralan_dr.map((t, i) => (
                                    <tr key={i} className="border-b dark:border-gray-600">
                                        <td className="px-3 py-2">{t.tgl_perawatan}</td>
                                        <td className="px-3 py-2">{t.nm_perawatan}</td>
                                        <td className="px-3 py-2">{t.nm_dokter}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(t.biaya)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Laboratory */}
                {data?.laboratory && data.laboratory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            🔬 Laboratorium
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">Tanggal</th>
                                    <th className="px-3 py-2 text-left">Pemeriksaan</th>
                                    <th className="px-3 py-2 text-right">Biaya</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.laboratory.map((l, i) => (
                                    <tr key={i} className="border-b dark:border-gray-600">
                                        <td className="px-3 py-2">{l.tgl_periksa}</td>
                                        <td className="px-3 py-2">{l.nm_perawatan}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(l.biaya)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Radiology */}
                {data?.radiology && data.radiology.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            📷 Radiologi
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">Tanggal</th>
                                    <th className="px-3 py-2 text-left">Pemeriksaan</th>
                                    <th className="px-3 py-2 text-left">Hasil</th>
                                    <th className="px-3 py-2 text-right">Biaya</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.radiology.map((r, i) => (
                                    <tr key={i} className="border-b dark:border-gray-600">
                                        <td className="px-3 py-2">{r.tgl_periksa}</td>
                                        <td className="px-3 py-2">{r.nm_perawatan}</td>
                                        <td className="px-3 py-2">{r.hasil || '-'}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(r.biaya)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Medicines */}
                {data?.medicines_given && data.medicines_given.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            💊 Pemberian Obat
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">Tanggal</th>
                                    <th className="px-3 py-2 text-left">Nama Obat</th>
                                    <th className="px-3 py-2 text-right">Jumlah</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.medicines_given.map((m, i) => (
                                    <tr key={i} className="border-b dark:border-gray-600">
                                        <td className="px-3 py-2">{m.tgl_perawatan}</td>
                                        <td className="px-3 py-2">{m.nama_obat}</td>
                                        <td className="px-3 py-2 text-right">{m.jumlah} {m.satuan}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(m.total_biaya || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Billing */}
                {data?.billing && data.billing.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            💰 Rincian Biaya
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">No</th>
                                    <th className="px-3 py-2 text-left">Keterangan</th>
                                    <th className="px-3 py-2 text-right">Biaya</th>
                                    <th className="px-3 py-2 text-right">Jml</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.billing.map((b, i) => (
                                    <tr key={i} className="border-b dark:border-gray-600">
                                        <td className="px-3 py-2">{b.no}</td>
                                        <td className="px-3 py-2">{b.nm_perawatan}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(b.biaya)}</td>
                                        <td className="px-3 py-2 text-right">{b.jumlah}</td>
                                        <td className="px-3 py-2 text-right">{formatCurrency(b.total_biaya)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 dark:bg-gray-600 font-bold">
                                <tr>
                                    <td colSpan={4} className="px-3 py-2 text-right">TOTAL</td>
                                    <td className="px-3 py-2 text-right">
                                        {formatCurrency(data.billing.reduce((sum, b) => sum + b.total_biaya, 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* Documents */}
                {data?.documents && data.documents.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                            📁 Berkas Digital
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {data.documents.map((doc, i) => (
                                <div key={i} className="border dark:border-gray-600 rounded p-3 text-center">
                                    <div className="text-2xl mb-2">📄</div>
                                    <p className="text-sm font-medium">{doc.nama_berkas}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Print Button */}
                <div className="text-center mt-8 mb-6">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        🖨️ Cetak
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClaimDetailPage;
