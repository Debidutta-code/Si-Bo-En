"use client";

import { usePathname } from "next/navigation";
import { Linkedin } from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { useTranslation } from "react-i18next";
import ZLogo from "../assets/revchilli.png";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";

// Static Colors
const FOOTER_BG = "#ffffff";
const FOOTER_TEXT = "#111827";
const FOOTER_MUTED = "#6b7280";
const FOOTER_ACCENT = "#2563eb";
const FOOTER_BORDER = "#e5e7eb";

const Footer = () => {
    const { t } = useTranslation();
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    const bookingContext = useSelector(
        (state: RootState) => state.booking
    );

    const propertyAddress =
        bookingContext.PropertyDetails?.address;

    const { logoIcon } =
        useBookingStorage(bookingContext);

    return (
        <footer
            id="contact"
            className={`${isHomePage ? "hidden" : ""}`}
            style={{
                backgroundColor: FOOTER_BG,
                borderTop: `1px solid ${FOOTER_BORDER}`,
            }}
        >
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <div className="relative w-28 h-16">
                            <Image
                                src={
                                    isHomePage
                                        ? ZLogo
                                        : (logoIcon || ZLogo)
                                }
                                alt="Hotel Logo"
                                fill
                                className="object-contain"
                                unoptimized={!!logoIcon}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="text-center flex-1 max-w-2xl">
                        <p
                            className="text-sm md:text-base leading-relaxed"
                            style={{
                                color: FOOTER_MUTED,
                            }}
                        >
                            {propertyAddress?.addressLine1 ? (
                                <>
                                    {propertyAddress.addressLine1}

                                    {propertyAddress.city &&
                                        `, ${propertyAddress.city}`}

                                    {propertyAddress.state &&
                                        `, ${propertyAddress.state}`}

                                    {propertyAddress.country &&
                                        `, ${propertyAddress.country}`}

                                    {propertyAddress.zipCode &&
                                        ` - ${propertyAddress.zipCode}`}
                                </>
                            ) : (
                                t("Footer.defaultAddress")
                            )}
                        </p>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex-shrink-0">
                        <a
                            href="https://www.linkedin.com/company/revchill/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-gray-100"
                            style={{
                                border: `1px solid ${FOOTER_BORDER}`,
                            }}
                        >
                            <Linkedin
                                className="w-4 h-4"
                                style={{
                                    color: FOOTER_ACCENT,
                                }}
                            />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div
                className="border-t"
                style={{
                    borderColor: FOOTER_BORDER,
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-2">

                    {/* reCAPTCHA */}
                    <p
                        className="text-center md:text-left text-xs font-light"
                        style={{
                            color: FOOTER_MUTED,
                        }}
                    >
                        {t("Footer.recaptcha.text")}{" "}

                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{
                                color: FOOTER_ACCENT,
                            }}
                        >
                            {t("Footer.recaptcha.privacyPolicy")}
                        </a>{" "}

                        {t("Footer.recaptcha.and")}{" "}

                        <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{
                                color: FOOTER_ACCENT,
                            }}
                        >
                            {t("Footer.recaptcha.termsOfService")}
                        </a>{" "}

                        {t("Footer.recaptcha.apply")}
                    </p>

                    {/* Powered By */}
                    <p
                        className="text-xs font-light whitespace-nowrap"
                        style={{
                            color: FOOTER_MUTED,
                        }}
                    >
                        {t("Footer.poweredBy")}{" "}

                        <a
                            href="https://www.revchill.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:underline"
                            style={{
                                color: FOOTER_ACCENT,
                            }}
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