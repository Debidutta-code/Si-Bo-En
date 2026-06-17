import { IPropertyLoyalityWithLoyality } from "@/src/app/(unauth)/Rooms/interface";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export const LoyaltyContainer = ({
  loyaltyProgram,
  primaryColor,
  onToggleChange,
  toggleOn,
}: {
  loyaltyProgram: IPropertyLoyalityWithLoyality | null;
  primaryColor: string;
  onToggleChange: (isOn: boolean) => void;
  toggleOn: boolean;
}) => {
  const { t } = useTranslation();

  const handleToggle = () => {
    onToggleChange?.(!toggleOn);
  };

  if (!loyaltyProgram || !loyaltyProgram.CreationLoyaltyConfig) return null;

  const program = loyaltyProgram.CreationLoyaltyConfig;
  const loyaltyLogo =
    loyaltyProgram.loyalityConfigLogo ??
    program.BasicLoyaltyProgram?.logo?.[0] ??
    null;

  const activeConditions = (program.loyaltyConditions ?? []).filter(
    (condition) => condition.isActive && !condition.isDeleted
  );

  const activeSpecialConditions = (program.loyaltySpecialConditions ?? []).filter(
    (special) => special.isActive && !special.isDeleted
  );

  return (
    <>
      <div className="w-full">
        <div
          className="relative w-full bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-4 sm:px-6 sm:py-5 overflow-hidden"
          data-loyalty-banner
        >
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">


              {activeSpecialConditions.map((special) => (
                <div key={special.id} className="flex flex-col gap-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                    {special._translations?special._translations.title:special.title}
                  </span>
                  {special.subTitle && (
                    <span className="text-xs text-gray-500 leading-snug text-justify">
                      {special._translations?.subTitle ?? special.subTitle}
                    </span>
                  )}
                </div>
              ))}
            </div>


            <div className="flex flex-row md:flex-col items-center justify-between gap-3 flex-shrink-0">
              {loyaltyLogo && (
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <Image
                    src={loyaltyLogo}
                    alt="Loyalty Program Logo"
                    fill
                    className="rounded-lg object-contain border border-gray-200"
                  />
                </div>
              )}

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">
                    {t("LoyaltyContainer.loyaltyDiscount")}
                  </span>
                  <button
                    onClick={handleToggle}
                    aria-label="Toggle loyalty discount"
                    className="relative inline-flex items-center w-10 sm:w-11 h-5 sm:h-6 rounded-full focus:outline-none flex-shrink-0 transition-colors duration-200"
                    style={{
                      backgroundColor: toggleOn ? "#22C55E" : "#D1D5DB",
                    }}
                  >
                    <span
                      className={`inline-block w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        toggleOn ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};