import { useParams } from "react-router-dom";
import Loader from "@/components/Loader/Loader";
import BackButton from "@/components/shared/BackButton";
import { Ban } from "lucide-react";
import StartStopSellForm from "./components/StartStopSellForm";
import { useTranslation } from "react-i18next";

export default function StartStopSell() {
    const { t } = useTranslation();
    const { propertyId } = useParams<{ propertyId: string }>();

    if (!propertyId) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center">
                <Loader text={t("StartStopSell.loading")} />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6">
                    <BackButton />
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                <Ban className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{t("StartStopSell.title")}</h1>
                                <p className="text-gray-600">{t("StartStopSell.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <StartStopSellForm propertyId={propertyId} />
            </div>
        </div>
    );
}