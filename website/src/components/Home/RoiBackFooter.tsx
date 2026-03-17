"use client";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { useTranslation } from "react-i18next";

// Fallback logos
import ZLogo from "../assets/revchilli.png";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";

const Footer = () => {
    const { t } = useTranslation();
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    // // Get booking context from Redux
    const bookingContext = useSelector((state: RootState) => state.booking);

    const propertyAddress = bookingContext.PropertyDetails?.address;
    // Use the shared hook to get colors and logo consistently
    const { colors, logoIcon } = useBookingStorage(bookingContext);

    const {
        primaryColor = "#c4ab8f",     // fallback
        secondaryColor = "#d4c4b0",
        tertiaryColor = "#b39a7e",
        buttonTextColor = "#2F2A1F"
    } = colors;

    // Social icons color - use tertiary for visibility on primary background
    const socialIconColor = tertiaryColor || "#b39a7e";

    // Final logo decision
    // const finalLogo = logoIcon || (isHomePage ? ZLogo : SLogo);

    return (
        <footer
            id="contact"
            className={`text-white  ${isHomePage ? "hidden" : ""} bg-white border-t-2 border-gray-300 `}

        >
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto ">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        <div className="relative w-32 h-20">
                            <Image
                                src={isHomePage ? ZLogo : (logoIcon || ZLogo)}
                                alt="Hotel Logo"
                                fill
                                className="object-contain"
                                unoptimized={!!logoIcon}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="text-center flex-1 max-w-2xl">
                        <p className="text-sm md:text-base leading-relaxed font-normal text-black">
                            {propertyAddress ? (
                                <>
                                    {propertyAddress.addressLine1 && `${propertyAddress.addressLine1}`}
                                    {propertyAddress.addressLine2 && `, ${propertyAddress.addressLine2}`}
                                    {propertyAddress.landmark && `, ${propertyAddress.landmark}`}
                                    {propertyAddress.location && `, ${propertyAddress.location}`}
                                    {propertyAddress.city && `, ${propertyAddress.city}`}
                                    {propertyAddress.state && `, ${propertyAddress.state}`}
                                    {propertyAddress.zipCode && ` - ${propertyAddress.zipCode}`}
                                    {propertyAddress.country && `, ${propertyAddress.country}`}
                                </>
                            ) : (
                                t("Footer.defaultAddress")
                            )}
                        </p>
                    </div>


                    {/* Social Media Icons */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            aria-label="Facebook"
                        >
                            <Facebook
                                className="w-6 h-6"
                                style={{ color: socialIconColor }}
                            />
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            aria-label="Instagram"
                        >
                            <Instagram
                                className="w-6 h-6"
                                style={{ color: socialIconColor }}
                            />
                        </a>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            aria-label="YouTube"
                        >
                            <Youtube
                                className="w-6 h-6"
                                style={{ color: socialIconColor }}
                            />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="py-3 border-t bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">

                    {/* reCAPTCHA Notice */}
                    <p
                        className="text-center md:text-left text-xs md:text-sm font-light"
                        style={{ color: "#2F2A1F" }}
                    >
                        {t("Footer.recaptcha.text")}{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: "#1A0DAB" }}
                        >
                            {t("Footer.recaptcha.privacyPolicy")}
                        </a>{" "}
                        {t("Footer.recaptcha.and")}{" "}
                        <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: "#1A0DAB" }}
                        >
                            {t("Footer.recaptcha.termsOfService")}
                        </a>{" "}
                        {t("Footer.recaptcha.apply")}
                    </p>

                    {/* Powered By */}
                    <p
                        className="text-xs md:text-sm font-light"
                        style={{ color: "#2F2A1F" }}
                    >
                        {t("Footer.poweredBy")}{" "}
                        <a
                            href="https://www.revchill.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                            style={{ color: "#1A0DAB" }}
                        >
                            Revchill
                        </a>
                    </p>

                </div>
            </div>

        </footer>
    );
};

export default Footer;