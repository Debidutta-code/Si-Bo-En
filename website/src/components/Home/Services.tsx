import React from "react";
import revchilliLogo from "../assets/revchilli.png";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Services() {
  const { t } = useTranslation();

  const services = [
    {
      titleKey: "Services.items.digitalMarketing.title",
      descKey: "Services.items.digitalMarketing.description",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200",
    },
    {
      titleKey: "Services.items.webDesign.title",
      descKey: "Services.items.webDesign.description",
      image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1200",
    },
    {
      titleKey: "Services.items.loyaltyProgram.title",
      descKey: "Services.items.loyaltyProgram.description",
      image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1200",
    },
    {
      titleKey: "Services.items.bookingEngine.title",
      descKey: "Services.items.bookingEngine.description",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200",
    },
    {
      titleKey: "Services.items.aiChatbot.title",
      descKey: "Services.items.aiChatbot.description",
      image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?q=80&w=1200",
    },
    {
      titleKey: "Services.items.distributionManagement.title",
      descKey: "Services.items.distributionManagement.description",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200",
    },
  ];

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-[#f2f2f2] border-b border-gray-300 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <img
            src={revchilliLogo.src}
            alt="RevChill logo"
            className="mx-auto h-24 md:h-28 w-auto mb-10"
          />
          <h1 className="text-2xl md:text-4xl font-bold text-[#1A98A6] tracking-wide leading-tight whitespace-pre-line">
            {t("Services.hero.title")}
          </h1>
          <p className="max-w-4xl mx-auto mt-8 text-xl text-black leading-relaxed">
            {t("Services.hero.description")}
          </p>
          <button className="mt-10 bg-[#1A98A6] hover:bg-[#168894] text-white px-10 py-4 rounded-2xl font-semibold tracking-[0.2em]">
            {t("Services.hero.contactUs")}
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section id="service" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-center text-[#1A98A6] mb-4">
          {t("Services.section.title")}
        </h2>
        <p className="text-center text-gray-600 mb-16">
          {t("Services.section.subtitle")}
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-[#1A98A6] text-white rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={service.image}
                alt={t(service.titleKey)}
                className="h-64 w-full object-cover"
              />
              <div className="p-8">
                <h4 className="text-2xl font-semibold mb-4">
                  {t(service.titleKey)}
                </h4>
                <p className="text-white/90 mb-6">{t(service.descKey)}</p>
                <button className="bg-white text-[#1A98A6] px-6 py-2 rounded font-medium hover:bg-gray-100">
                  {t("Services.section.consultBtn")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gray-100 py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-12 text-center">
          <h3 className="text-3xl font-bold text-[#1A98A6] mb-6">
            {t("Services.cta.title")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("Services.cta.description")}
          </p>
          <button className="bg-[#1A98A6] hover:bg-[#168894] text-white px-8 py-3 rounded font-medium">
            {t("Services.cta.btn")}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact-us" className="bg-[#1A98A6] pt-14 pb-10 px-6">
        <div className="max-w-5xl mx-auto bg-[#f2f2f2] rounded-3xl px-8 py-10 md:px-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="font-semibold text-black mb-4 text-base md:text-lg">
                {t("Services.footer.phone")}
              </h4>
              <p className="text-black text-base md:text-lg">
                {t("Services.footer.phoneNumber")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4 text-base md:text-lg">
                {t("Services.footer.email")}
              </h4>
              <p className="text-black text-base md:text-lg">
                {t("Services.footer.emailAddress")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-4 text-base md:text-lg">
                {t("Services.footer.follow")}
              </h4>
              <div className="flex justify-center md:justify-start space-x-3">
                <a
                  href="https://www.facebook.com/revchill.FZ?rdid=SxLrgKTGxx2TDvFV&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CQZoXKB8D%2F#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RevChill Facebook"
                  className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                >
                  <FaFacebookF size={13} />
                </a>
                <a
                  href="https://www.linkedin.com/company/revchill/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RevChill LinkedIn"
                  className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                >
                  <FaLinkedinIn size={13} />
                </a>
                <a
                  href="https://www.instagram.com/revchill_/?igsh=MWoyc2UyMWtvOTZvbg%3D%3D#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RevChill Instagram"
                  className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                >
                  <FaInstagram size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-8 text-white text-sm md:text-base font-semibold">
          {t("Services.footer.copyright")}
        </p>
      </footer>
    </div>
  );
}
