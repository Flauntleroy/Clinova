import React from 'react';
import { SEPDetail } from '../../../services/vedikaService';

interface SEPSectionProps {
    data: SEPDetail | null;
}

const SEPSection: React.FC<SEPSectionProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white p-8 mb-4 border border-dashed border-gray-300 text-center text-gray-500 rounded">
                Data SEP tidak ditemukan atau belum ada SEP untuk nomor rawat ini.
            </div>
        );
    }

    return (
        <div className="bg-white mb-6 border border-gray-300 overflow-hidden">
            <div className="bg-gray-800 p-2 flex items-center text-white border-b border-gray-300">
                <div className="w-1.5 h-3 bg-emerald-500 mr-2 rounded-full"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Surat Eligibilitas Peserta (SEP)</h3>
            </div>
            <div className="p-4 print:p-0 font-sans text-black leading-[1.3]">
                {/* Header BPJS */}
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                        <img
                            src="/images/logo/bpjslogo.png"
                            alt="BPJS Kesehatan"
                            className="h-10 w-auto object-contain"
                        />
                    </div>
                    <div className="text-right mr-4">
                        <h2 className="text-xl font-bold tracking-tight uppercase">
                            Surat Eligibilitas Peserta
                        </h2>
                    </div>
                </div>

                {/* Barcode Section - Centered */}
                <div className="flex flex-col items-center mb-3">
                    <div className="w-56 h-10 border-x border-black flex items-center justify-center">
                        <div className="w-[90%] h-full flex gap-[1px] items-stretch py-1">
                            {[...Array(60)].map((_, i) => (
                                <div key={i} className={`flex-1 bg-black ${i % 3 === 0 ? 'w-[2px]' : 'w-[1px]'} ${i % 5 === 0 ? 'opacity-0' : ''}`} />
                            ))}
                        </div>
                    </div>
                    <span className="text-xs font-mono tracking-widest mt-0.5">{data.no_sep}</span>
                </div>

                {/* PRB Header */}
                <div className="mb-1">
                    <span className="font-bold text-[13px]">PRB :</span>
                </div>

                <div className="grid grid-cols-[1.5fr_1fr] gap-x-8 text-[11px]">
                    {/* Left Column */}
                    <div className="space-y-0.5">
                        <table className="w-full border-separate border-spacing-y-0.5">
                            <tbody>
                                <tr>
                                    <td className="w-36 align-top">No. SEP</td>
                                    <td className="w-4 align-top">:</td>
                                    <td className="font-bold text-[13px]">{data.no_sep}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Tgl. SEP</td>
                                    <td className="align-top">:</td>
                                    <td>{data.tgl_sep}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">No. Kartu</td>
                                    <td className="align-top">:</td>
                                    <td>{data.no_kartu} ( MR: {data.no_rm} )</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Nama Peserta</td>
                                    <td className="align-top">:</td>
                                    <td className="uppercase">{data.nama_peserta}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Tgl. Lahir</td>
                                    <td className="align-top">:</td>
                                    <td>{data.tgl_lahir} &nbsp; Kelamin: {data.jenis_kelamin}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">No. Telepon</td>
                                    <td className="align-top">:</td>
                                    <td>{data.no_telp || ''}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Spesialis/Sub Spesialis</td>
                                    <td className="align-top">:</td>
                                    <td>{data.poli_tujuan}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">DPJP Yg Melayani</td>
                                    <td className="align-top">:</td>
                                    <td className="uppercase">{data.dpjp}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Faskes Perujuk</td>
                                    <td className="align-top">:</td>
                                    <td>{data.faskes_perujuk}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Diagnosa Awal</td>
                                    <td className="align-top">:</td>
                                    <td className="max-w-[300px]">{data.diagnosa_awal}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Catatan</td>
                                    <td className="align-top">:</td>
                                    <td className="italic">{data.catatan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-0.5">
                        <table className="w-full border-separate border-spacing-y-0.5">
                            <tbody>
                                <tr>
                                    <td className="w-20 align-top">Peserta</td>
                                    <td className="w-4 align-top">:</td>
                                    <td className="font-medium text-[10px] uppercase">{data.peserta}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">COB</td>
                                    <td className="align-top">:</td>
                                    <td>{data.cob || ''}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Jns. Rawat</td>
                                    <td className="align-top">:</td>
                                    <td>{data.jenis_pelayanan === '1' ? 'R.Inap' : 'R.Jalan'}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Kls. Rawat</td>
                                    <td className="align-top">:</td>
                                    <td>Kelas {data.kelas_rawat}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Penjamin</td>
                                    <td className="align-top">:</td>
                                    <td>{data.penjamin || ''}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-16 flex flex-col items-center ml-auto w-fit mr-10">
                            <p className="text-[10px] mb-1">Pasien/Keluarga Pasien</p>
                            <div className="w-24 h-24 border border-black mb-1 p-0.5">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Telah ditandatangani secara elektronik oleh ${data.nama_peserta} pada ${data.tgl_sep}`)}`}
                                    alt="QR Code Tanda Tangan"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-[11px] uppercase">{data.nama_peserta}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-[9.5px] text-gray-800 leading-[1.2] space-y-0.5">
                    <p className="italic underline">*Saya Menyetujui BPJS Kesehatan menggunakan informasi Medis Pasien jika diperlukan.</p>
                    <p className="italic">**SEP bukan sebagai bukti penjaminan peserta</p>
                    <p>Di-generate pada {new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' })}</p>
                    <p>Masa berlaku {data.tgl_sep} s/d {data.batas_rujukan || '-'}</p>
                </div>
            </div>
        </div>
    );
};

export default SEPSection;
