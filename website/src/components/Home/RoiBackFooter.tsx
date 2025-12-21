"use client";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import SLogo from "../assets/SLogo.png";
import ZLogo from "../assets/ZLogo.png";

const Footer = () => {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    return (
        <footer id="contact" className="bg-[#c4ab8f] text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto ">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        <Image
                            src={isHomePage ? ZLogo : SLogo}
                            alt="Company Logo"
                            width={isHomePage ? 140 : 180}
                            height={80}
                            className="object-contain"
                        />
                    </div>

                    {/* Address Section */}
                    <div className="text-center flex-1 max-w-2xl">
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed font-light">
                            Arena-3, 3rd Floor, STPI ELITE Building, Gothapatna, Khordha, Odisha - 751003
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
                            <Facebook className="w-6 h-6 text-gray-700" />
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-6 h-6 text-gray-700" />
                        </a>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity"
                            aria-label="YouTube"
                        >
                            <Youtube className="w-6 h-6 text-gray-700" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-[#d4c4b0] py-3 border-t border-[#b39a7e]">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-gray-700 text-xs md:text-sm font-light">
                        This site is protected by reCAPTCHA and the Google{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline"
                        >
                            Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline"
                        >
                            Terms of Service
                        </a>{" "}
                        apply.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;