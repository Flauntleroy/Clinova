import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { vedikaService, ClaimFullDetail } from '../../services/vedikaService';
import SEPSection from '../../components/Vedika/ClaimDetail/SEPSection';
import PatientSection from '../../components/Vedika/ClaimDetail/PatientSection';
import SOAPSection from '../../components/Vedika/ClaimDetail/SOAPSection';
import DiagnosisSection from '../../components/Vedika/ClaimDetail/DiagnosisSection';
import ProcedureSection from '../../components/Vedika/ClaimDetail/ProcedureSection';
import ActionsSection from '../../components/Vedika/ClaimDetail/ActionsSection';
import RoomSection from '../../components/Vedika/ClaimDetail/RoomSection';
import OperationSection from '../../components/Vedika/ClaimDetail/OperationSection';
import RadiologySection from '../../components/Vedika/ClaimDetail/RadiologySection';
import LabSection from '../../components/Vedika/ClaimDetail/LabSection';
import LabPASection from '../../components/Vedika/ClaimDetail/LabPASection';
import MedicineSection from '../../components/Vedika/ClaimDetail/MedicineSection';
import ResumeSection from '../../components/Vedika/ClaimDetail/ResumeSection';
import BillingSection from '../../components/Vedika/ClaimDetail/BillingSection';
import SPRISection from '../../components/Vedika/ClaimDetail/SPRISection';
import DigitalDocSection from '../../components/Vedika/ClaimDetail/DigitalDocSection';

// Custom Icons to avoid lucide-react dependency
const IconPrinter = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const IconArrowLeft = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const IconLoader = () => (
    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
);


const VedikaClaimDetail: React.FC = () => {
    const { noRawat } = useParams<{ noRawat: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ClaimFullDetail | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!noRawat) return;
            try {
                setLoading(true);
                const response = await vedikaService.getClaimFullDetail(noRawat);
                if (response.success) {
                    // Normalize status_lanjut to lowercase for easier component logic
                    const normalizedData = {
                        ...response.data,
                        status_lanjut: response.data.status_lanjut?.toLowerCase() || ''
                    };
                    setData(normalizedData);
                    console.log('VEDIKA_DEBUG: Full Claim Data Response:', normalizedData);
                    console.log('VEDIKA_DEBUG: SPRI Section:', normalizedData.spri);
                } else {
                    setError('Gagal mengambil data klaim.');
                }
            } catch (err: any) {
                setError(err.message || 'Terjadi kesalahan saat memproses permintaan.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [noRawat]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
                <div className="mb-4">
                    <IconLoader />
                </div>
                <p className="font-medium">Memuat data klaim lengkap...</p>
                <p className="text-xs uppercase mt-1 tracking-widest">{noRawat}</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 shadow-sm rounded">
                    <p className="font-bold">Error!</p>
                    <p>{error || 'Data tidak ditemukan.'}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                >
                    <IconArrowLeft /> Kembali ke Index
                </button>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 print:bg-white pb-12">
            {/* Action Header - Hidden on Print */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:hidden">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            title="Kembali"
                        >
                            <IconArrowLeft />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                Detail Klaim <span className="text-xs font-mono font-normal bg-gray-100 px-2 py-0.5 rounded">{data.patient.no_rawat}</span>
                            </h2>
                            <p className="text-xs text-gray-500">
                                {data.patient.nama_pasien} • {data.patient.no_rm}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all active:scale-95"
                    >
                        <IconPrinter /> Cetak
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-5xl mx-auto p-4 md:p-8">
                {/* Single Page Print Layout */}
                <div className="shadow-2xl print:shadow-none bg-white">
                    {/* Official Admission Documents */}
                    <SPRISection data={data.spri} />
                    <SEPSection data={data.sep} />

                    <div className="px-8 pb-8 print:px-0">
                        <PatientSection data={data.patient} />
                        <DiagnosisSection data={data.diagnoses} />
                        <ProcedureSection data={data.procedures} />
                        <SOAPSection data={data.soap_ralan} title="Pemeriksaan Rawat Jalan" />
                        <SOAPSection data={data.soap_ranap} title="Pemeriksaan Rawat Inap" />

                        {/* Batch 2 sections */}
                        <ActionsSection data={data.actions} />
                        <RoomSection data={data.room_stays} />
                        <OperationSection ops={data.operations} reports={data.op_reports} />
                        <RadiologySection data={data.radiology} />
                        <LabSection data={data.lab_exams} />
                        <LabPASection data={data.lab_pa_reports} />

                        {/* Batch 3 sections */}
                        <MedicineSection data={data.medicines} />
                        <ResumeSection ralan={data.resume_ralan} ranap={data.resume_ranap} />
                        <BillingSection data={data.billing} />
                        <DigitalDocSection data={data.documents} />

                        {/* Legal Print Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-300">
                            <div className="grid grid-cols-2 text-[10px]">
                                <div className="space-y-4">
                                    <div className="italic text-gray-500">
                                        Dokumen ini dicetak otomatis dari SIMRS MERA
                                        berdasarkan data rekam medis elektronik RS.
                                    </div>
                                    <div className="font-mono text-gray-400">
                                        Timestamp Cetak: {new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' })}<br />
                                        {/* ID Dokumen: {data.patient.no_rawat.replace(/\//g, '')}-{Date.now().toString().slice(-6)} */}
                                    </div>
                                </div>
                                {/* <div className="text-center">
                                    <p className="font-bold uppercase mb-12">Petunjuk/Dokter Penanggung Jawab</p>
                                    <p className="font-bold underline">{data.patient.dokter || ''}</p>
                                    <p className="text-gray-500">{data.patient.kd_dokter ? `SIP. ${data.patient.kd_dokter}` : ''}</p>
                                </div> */}
                            </div>

                            <div className="mt-8 text-center border-t border-dashed border-gray-200 pt-4">
                                <p className="text-[14px] font-black uppercase text-gray-800 tracking-tighter">
                                    {data.patient.nama_pasien} - {data.patient.no_rm}
                                </p>
                                <p className="text-[8px] text-gray-400 uppercase tracking-widest">
                                    MERA
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* CSS to ensure fixed formatting on print */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .shadow-2xl {
                        box-shadow: none !important;
                    }
                }
            `}} />
        </div>
    );
};

export default VedikaClaimDetail;
