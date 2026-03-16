import React, { useState, useEffect } from 'react';
import i18next from '../../i18n/index';
import flags from '../../i18n/flags.json';
import { ChevronDown } from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSwitcherProps {
  onLanguageChange?: () => void;
}

const languageOptions: LanguageOption[] = Object.values(flags).map((lang) => ({
  code: lang.code,
  name: lang.name,
  flag: lang.flag,
}));

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const initialLang = i18next.language || 'en';
    const fallbackLang =
      languageOptions.find((l) => l.code === initialLang) ? initialLang : 'en';

    setSelectedLanguage(fallbackLang);

    // No RTL — layout stays LTR for all languages
    document.documentElement.dir = 'ltr';

    const handleLanguageChange = () => {
      const newLang = i18next.language;
      setSelectedLanguage(newLang);
      // No dir change — always LTR
    };

    i18next.on('languageChanged', handleLanguageChange);
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const selectedOption = languageOptions.find((l) => l.code === selectedLanguage);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18next.changeLanguage(langCode);
    setIsOpen(false);
    onLanguageChange?.();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.language-switcher-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative language-switcher-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:border-gray-500 transition cursor-pointer h-[40px]"
      >
        {selectedOption && (
          <img
            src={selectedOption.flag}
            alt={`${selectedOption.name} flag`}
            className="w-5 h-5 rounded-sm"
          />
        )}
        <span className="text-black text-sm font-medium">
          {selectedOption?.name || 'English'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute top-full mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
          {languageOptions.map((option) => (
            <li
              key={option.code}
              onClick={() => handleLanguageChange(option.code)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={option.flag}
                alt={`${option.name} flag`}
                className="w-5 h-5 rounded-sm"
              />
              <span className="text-black text-sm font-medium">{option.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;