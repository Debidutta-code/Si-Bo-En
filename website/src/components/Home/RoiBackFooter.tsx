"use client";
import { usePathname } from "next/navigation";
import { CloudCog, Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";

// Fallback logos
import SLogo from "../assets/revchilli.png";
import ZLogo from "../assets/revchilli.png";
import { useBookingStorage } from "@/src/hooks/useBookingStorage";

const Footer = () => {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    // // Get booking context from Redux
    const bookingContext = useSelector((state: RootState) => state.booking);

    const propertyAddress = bookingContext.PropertyDetails?.address;
    console.log(propertyAddress);
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
    const finalLogo = logoIcon || (isHomePage ? ZLogo : SLogo);

    return (
        <footer
            id="contact"
            className="text-white"
            style={{ backgroundColor: `${primaryColor}80` }}
        >
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto ">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        {logoIcon ? (
                            <div className="relative w-32 h-20">
                                <Image
                                    src={logoIcon}
                                    alt="Hotel Logo"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <Image
                                src={isHomePage ? ZLogo : SLogo}
                                alt="Company Logo"
                                width={isHomePage ? 140 : 180}
                                height={80}
                                className="object-contain"
                            />
                        )}
                    </div>

                    {/* Address Section */}
                    <div className="text-center flex-1 max-w-2xl">
                        <p className="text-sm md:text-base leading-relaxed font-light text-[#2F2A1F]">
                            {propertyAddress?.addressLine1
                                ? `${propertyAddress.addressLine1}`
                                : "Dubai, United Arab Emirates"}
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
                        This site is protected by reCAPTCHA and the Google{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: "#1A0DAB" }}
                        >
                            Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: "#1A0DAB" }}
                        >
                            Terms of Service
                        </a>{" "}
                        apply.
                    </p>

                    {/* Powered By */}
                    <p
                        className="text-xs md:text-sm font-light"
                        style={{ color: "#2F2A1F" }}
                    >
                        Powered by{" "}
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