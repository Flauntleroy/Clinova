import React from 'react';
import { LabExam } from '../../../services/vedikaService';

interface LabSectionProps {
    data: LabExam[];
}

const LabSection: React.FC<LabSectionProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {data.map((exam, idx) => (
                <div key={idx} className="bg-white border border-gray-300 overflow-hidden">
                    {/* Lab Header */}
                    <div className="bg-gray-800 p-2 flex items-center text-white border-b border-gray-300">
                        <div className="w-1.5 h-3 bg-emerald-500 mr-2 rounded-full"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider flex-1">
                            Hasil Laboratorium #{idx + 1}
                            <span className="ml-3 bg-gray-700 px-2 py-0.5 rounded text-[9px] border border-gray-600 font-normal">{exam.kode} - {exam.nama_tindakan}</span>
                        </h3>
                        <div className="bg-gray-700 px-2 py-0.5 rounded text-[9px] font-medium border border-gray-600">
                            Waktu: {exam.tgl_periksa} {exam.jam}
                        </div>
                    </div>

                    {/* Lab Parameters Table */}
                    <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-300 text-[9px] font-bold uppercase text-gray-500">
                        <div className="col-span-4 border-r border-gray-300 px-3 py-1">Parameter Pemeriksaan</div>
                        <div className="col-span-2 border-r border-gray-300 px-3 py-1 text-center">Hasil</div>
                        <div className="col-span-1 border-r border-gray-300 px-3 py-1 text-center">Satuan</div>
                        <div className="col-span-2 border-r border-gray-300 px-3 py-1 text-center">Nilai Rujukan</div>
                        <div className="col-span-3 px-3 py-1">Keterangan</div>
                    </div>

                    {(!exam.details || exam.details.length === 0) ? (
                        <div className="p-2 text-center text-gray-400 text-[10px]">Parameter detail tidak tersedia.</div>
                    ) : (
                        exam.details.map((detail, dIdx) => (
                            <div key={dIdx} className="grid grid-cols-12 text-[10px] border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                <div className="col-span-4 border-r border-gray-300 px-3 py-0.5 font-medium">{detail?.pemeriksaan || '-'}</div>
                                <div className="col-span-2 border-r border-gray-300 px-3 py-0.5 text-center font-bold">{detail?.nilai || '-'}</div>
                                <div className="col-span-1 border-r border-gray-300 px-3 py-0.5 text-center">{detail?.satuan || '-'}</div>
                                <div className="col-span-2 border-r border-gray-300 px-3 py-0.5 text-center">{detail?.nilai_rujukan || '-'}</div>
                                <div className="col-span-3 px-3 py-0.5 text-xs text-gray-400 italic truncate">{detail?.keterangan || '-'}</div>
                            </div>
                        ))
                    )}

                    {/* Doctor Info */}
                    <div className="bg-gray-50 px-3 py-1 text-[9px] flex justify-end border-t border-gray-200">
                        <span className="italic">Dokter Perujuk: <strong>{exam.dokter || '-'}</strong></span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LabSection;
