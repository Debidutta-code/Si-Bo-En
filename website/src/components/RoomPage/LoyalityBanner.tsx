import { IPropertyLoyalityWithLoyality } from "@/src/app/(unauth)/Rooms/interface";
import {
  Award,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../utils/numLang";

export const LoyaltyProgramBanner = ({
  loyaltyProgram,
  primaryColor,
}: {
  loyaltyProgram: IPropertyLoyalityWithLoyality | null;
  primaryColor: string;
  onSignUpSuccess?: (email: string) => void;
  onLogoutSuccess?: () => void;
  onDiscountVerified?: (discount: { type: string; value: number; currencyCode: string }) => void;
}) => {
  const { t } = useTranslation();

  const getDiscountDisplay = () => {
    const levels = loyaltyProgram?.CreationLoyaltyConfig?.LoyalityLevels;
    if (levels && levels.length > 0) {
      return `${t("LoyaltyBanner.uptoOffPercent", {
        value: formatNumber(levels[0].discountPercentage),
      })}`;
    }

    return `${t("LoyaltyBanner.offPercent", {
      value: formatNumber(loyaltyProgram?.CreationLoyaltyConfig?.discountValue),
    })}`;
  };


  if (!loyaltyProgram || !loyaltyProgram.CreationLoyaltyConfig) {
    return null;
  }
  const program = loyaltyProgram.CreationLoyaltyConfig;
  const isBasicProgram = program.BasicLoyaltyProgram !== null;
  const loyaltyLogo =
    loyaltyProgram.loyalityConfigLogo ??
    (isBasicProgram && program.BasicLoyaltyProgram?.logo?.[0]
      ? program.BasicLoyaltyProgram.logo[0]
      : null);

  return (
    <>
      <div className="max-h-[348px] min-h-[348px] overflow-y-scroll custom-scrollbar">
        <div className="max-w-7xl  h-full mx-auto">
          <div
            className="relative h-full overflow-hidden rounded-xl shadow-md border"
            data-loyalty-banner
            style={{
              borderColor: `${primaryColor}20`,
              background: "white",
            }}
          >


            <div className="p-3 sm:p-4 h-full min-h-[348px]  flex flex-col gap-2.5">
              {/* Header Row: Logo + Property Name + Badge */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {loyaltyLogo ? (
                    <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-200">
                      <div className="relative w-10 h-8 sm:w-12 sm:h-9">
                        <Image
                          src={loyaltyLogo}
                          alt="Loyalty Program"
                          fill
                          className="rounded object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-gray-50 rounded-lg p-2 border flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                      style={{ borderColor: `${primaryColor}20` }}
                    >
                      <Award
                        className="w-5 h-5 sm:w-6 sm:h-6 opacity-20"
                        style={{ color: primaryColor }}
                      />
                    </div>
                  )}
                </div>

                {/* Property Name + Label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Award
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                      {loyaltyProgram._translations?.propertyName || loyaltyProgram.propertyName}
                    </h2>
                    <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                      {t("LoyaltyBanner.loyaltyProgram")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Program Terms */}
              {program.loyaltyConditions &&
                program.loyaltyConditions.filter((c) => c.isActive).length >
                0 && (
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <CheckCircle2
                        className="w-3 h-3"
                        style={{ color: primaryColor }}
                      />
                      {t("programTerms")}
                    </h3>
                    <div className="space-y-1  custom-scrollbar">
                      {program.loyaltyConditions
                        .filter((condition) => condition.isActive && condition.isDeleted == false)
                        .map((condition, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-1.5 bg-gray-50 rounded p-1.5"
                          >
                            <CheckCircle2
                              className="w-3 h-3 flex-shrink-0 mt-0.5"
                              style={{ color: primaryColor }}
                            />
                            <span className="text-[10px] sm:text-xs text-gray-700 leading-snug">
                              {condition._translations?condition._translations.text : condition.text}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}




              {/* Bottom Row: Discount Badge + Spacer + (Join/Logout) */}
              <div className="flex items-center gap-2 mt-auto flex-wrap sm:flex-nowrap">
                {/* Discount Badge */}
                <div
                  className="px-2.5 py-1 rounded-lg text-white text-[10px] sm:text-xs font-bold whitespace-nowrap flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {getDiscountDisplay()}
                </div>

                <div className="flex-1" />


              </div>
            </div>
          </div>
        </div>
      </div>



      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${primaryColor}40;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${primaryColor}60;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};
