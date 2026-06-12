import i18n from "../i18n";

const formatNumber = (num?: number) => {
    if(!num) return "";
  const lang = i18n.language.split("-")[0];

  if (lang === "ar") {
    return new Intl.NumberFormat("ar-EG").format(num);
  }

  if (lang === "hi") {
    return new Intl.NumberFormat("hi-IN-u-nu-deva").format(num);
  }

  return new Intl.NumberFormat("en-IN").format(num);
};


const getLocale = (): string => {
  const lang = i18n.language.split("-")[0];
  if (lang === "ar") return "ar-EG";
  if (lang === "hi") return "hi-IN-u-nu-deva";
  return "en-IN";
};

export { formatNumber, getLocale };