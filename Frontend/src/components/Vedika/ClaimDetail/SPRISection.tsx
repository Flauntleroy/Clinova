import React from 'react';
import { SPRIDetail } from '../../../services/vedikaService';

interface SPRISectionProps {
    data: SPRIDetail | null;
}

const SPRISection: React.FC<SPRISectionProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="bg-white p-8 mb-4 border border-dashed border-gray-300 text-center text-gray-400 text-xs rounded uppercase tracking-widest font-bold">
                -- Surat Perintah Rawat Inap (SPRI) Tidak Tersedia --
            </div>
        );
    }

    return (
        <div className="bg-white mb-6 border border-gray-300 overflow-hidden shadow-sm">
            <div className="bg-gray-800 p-2 flex items-center text-white border-b border-gray-300">
                <div className="w-1.5 h-3 bg-emerald-500 mr-2 rounded-full"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider">Surat Perintah Rawat Inap (SPRI)</h3>
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
                            Surat Perintah Rawat Inap
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
                    <span className="text-xs font-mono tracking-widest mt-0.5">{data.no_surat}</span>
                </div>

                <div className="grid grid-cols-[1.5fr_1fr] gap-x-8 text-[11px]">
                    {/* Left Column */}
                    <div className="space-y-0.5">
                        <table className="w-full border-separate border-spacing-y-0.5">
                            <tbody>
                                <tr>
                                    <td className="w-40 align-top uppercase">Kepada Yth. Dokter</td>
                                    <td className="w-4 align-top">:</td>
                                    <td className="font-bold text-[13px] uppercase">{data.nama_dokter}</td>
                                </tr>
                                <tr>
                                    <td className="align-top uppercase">Di Poliklinik</td>
                                    <td className="align-top">:</td>
                                    <td className="uppercase">{data.nama_poli}</td>
                                </tr>
                                <tr>
                                    <td className="align-top py-2 italic font-bold" colSpan={3}>
                                        Mohon Pemeriksaan dan Penanganan Lebih Lanjut :
                                    </td>
                                </tr>
                                <tr>
                                    <td className="align-top">No. Kartu</td>
                                    <td className="align-top">:</td>
                                    <td className="font-bold text-[13px]">{data.no_kartu}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Nama Pasien</td>
                                    <td className="align-top">:</td>
                                    <td className="uppercase font-bold">{data.nama_pasien} &nbsp; ({data.jenis_kelamin})</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Tgl. Lahir</td>
                                    <td className="align-top">:</td>
                                    <td>{data.tgl_lahir}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Diagnosa Awal</td>
                                    <td className="align-top">:</td>
                                    <td>{data.diagnosa_awal || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="align-top">Tgl. Entri</td>
                                    <td className="align-top">:</td>
                                    <td>{data.tgl_rencana}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="mt-4">Demikian atas bantuannya, diucapkan banyak terima kasih.</p>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-0.5">
                        <div className="mt-16 flex flex-col items-center ml-auto w-fit mr-10">
                            <p className="text-[10px] mb-1">Mengetahui</p>
                            <div className="w-24 h-24 border border-black mb-1 p-0.5">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`SPRI No: ${data.no_surat}\nPasien: ${data.nama_pasien}\nDokter: ${data.nama_dokter}`)}`}
                                    alt="QR Code Tanda Tangan"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-[11px] uppercase font-bold">{data.nama_pasien}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-[9.5px] text-gray-800 leading-[1.2] space-y-0.5">
                    <p>Di-generate pada {new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' })}</p>
                </div>
            </div>
        </div>
    );
};

export default SPRISection;
