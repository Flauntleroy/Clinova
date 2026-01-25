import React from 'react';
import { LabPAReport } from '../../../services/vedikaService';

interface LabPASectionProps {
    data: LabPAReport[];
}

const LabPASection: React.FC<LabPASectionProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="space-y-6 mb-8 pt-2">
            {data.map((report, idx) => (
                <div key={idx} className="bg-white border border-gray-300 overflow-hidden shadow-sm">
                    {/* Unified Header Style - Gray 800 with Emerald Accent Pill */}
                    <div className="bg-gray-800 p-2 flex items-center text-white border-b border-gray-300">
                        <div className="w-1.5 h-3 bg-emerald-500 mr-2 rounded-full"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                            Hasil Pemeriksaan Laboratorium PA #{idx + 1}
                            {report.no_sediaan && <span className="ml-3 bg-gray-700 px-2 py-0.5 rounded text-[9px] border border-gray-600 font-normal">{report.no_sediaan}</span>}
                        </h3>
                        <div className="ml-auto bg-gray-700 px-2 py-0.5 rounded text-[9px] font-medium border border-gray-600">
                            SELESAI: {report.tgl_hasil} {report.jam_hasil}
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-4 space-y-4">
                        {/* Metadata Table */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[10px] bg-gray-50/50 p-4 border border-gray-200 rounded">
                            <div className="space-y-1.5 font-sans">
                                <div className="flex">
                                    <span className="w-24 text-gray-500 font-bold uppercase">No. RM</span>
                                    <span className="font-bold text-gray-900">: {report.no_rm}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-24 text-gray-500 font-bold uppercase">Nama Pasien</span>
                                    <span className="font-bold text-gray-900">: {report.nama_pasien}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-24 text-gray-500 font-bold uppercase">JK / Umur</span>
                                    <span className="font-medium text-gray-700">: {report.jk_umur}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-24 text-gray-500 font-bold uppercase shrink-0">Alamat</span>
                                    <span className="font-medium text-gray-600">: {report.alamat}</span>
                                </div>
                                <div className="flex pt-1 mt-1 border-t border-gray-200">
                                    <span className="w-24 text-emerald-700 font-extrabold uppercase">No. Sediaan</span>
                                    <span className="font-black text-gray-900">: {report.no_sediaan || '-'}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 font-sans">
                                <div className="flex">
                                    <span className="w-32 text-gray-500 font-bold uppercase">No. Periksa</span>
                                    <span className="font-bold text-gray-900">: {report.no_rawat}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500 font-bold uppercase">No. Order</span>
                                    <span className="font-medium text-gray-700">: {report.no_order || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500 font-bold uppercase">Poliklinik</span>
                                    <span className="font-medium text-gray-700">: {report.poli}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 text-gray-500 font-bold uppercase">Waktu Permintaan</span>
                                    <span className="font-medium text-gray-600">: {report.tgl_permintaan} {report.jam_permintaan}</span>
                                </div>
                                <div className="flex pt-1 mt-1 border-t border-gray-200">
                                    <span className="w-32 text-emerald-700 font-extrabold uppercase">Jenis Periksa</span>
                                    <span className="font-bold">: {report.pemeriksaan_pa}</span>
                                </div>
                            </div>
                        </div>

                        {/* Findings Sections */}
                        <div className="space-y-4">
                            <section>
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                                    Diagnosa Klinik
                                </h4>
                                <div className="bg-white p-3 border border-gray-200 rounded text-[11px] text-gray-800 font-medium leading-relaxed min-h-[30px]">
                                    {report.diagnosa_klinis || '-'}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <section>
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                                        Pemeriksaan Makroskopik
                                    </h4>
                                    <div className="bg-white p-3 border border-gray-200 rounded text-[11px] text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                                        {report.makroskopik || '-'}
                                    </div>
                                </section>
                                <section>
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                                        Pemeriksaan Mikroskopik
                                    </h4>
                                    <div className="bg-white p-3 border border-gray-200 rounded text-[11px] text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                                        {report.mikroskopik || '-'}
                                    </div>
                                </section>
                            </div>

                            <section className="bg-gray-50 p-4 border border-gray-200 rounded">
                                <h4 className="text-[9px] font-black text-gray-800 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-emerald-600 rounded-full"></span>
                                    Kesimpulan Akhir
                                </h4>
                                <div className="text-[13px] text-gray-900 font-black italic leading-relaxed">
                                    {report.kesimpulan || '-'}
                                </div>
                                {report.kesan && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-500 italic">
                                        Catatan/Kesan: {report.kesan}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Signature Footer */}
                        <div className="flex justify-between items-end pt-2">
                            <div className="text-[8px] text-gray-300 font-medium uppercase tracking-tighter">
                                Electronic Pathology Report System • SIMRS Clinova
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Dokter Penanggung Jawab,</p>
                                <p className="text-[11px] font-extrabold text-gray-800 mt-1 underline decoration-emerald-200 underline-offset-4 decoration-2">{report.nama_dokter}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">SIP. {report.kd_dokter}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LabPASection;
