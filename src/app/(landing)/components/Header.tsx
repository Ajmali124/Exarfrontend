"use client";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("En");
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = mounted ? theme === "dark" : false;
  const logoSrc = isDarkMode ? "/logo.svg" : "/logodark.svg";
  const navSurfaceClasses = isDarkMode
    ? "bg-gray-800/60 border border-gray-700/30 text-gray-300"
    : "bg-white/80 border border-gray-200/70 text-gray-700 shadow-lg";
  const buttonSurfaceClasses = isDarkMode
    ? "bg-gray-800/60 border border-gray-700/30 text-gray-300 hover:bg-gray-700/60 hover:text-white"
    : "bg-white/80 border border-gray-200/70 text-gray-700 hover:bg-white hover:text-gray-900 shadow";
  const desktopLinkClasses = isDarkMode
    ? "text-gray-300 hover:text-white"
    : "text-gray-700 hover:text-gray-900";
  const mobilePanelClasses = isDarkMode
    ? "bg-gray-800/90 border border-gray-700/40 text-gray-100"
    : "bg-white/95 border border-gray-200/80 text-gray-800 shadow-2xl";
  const mobileControlClasses = isDarkMode
    ? "bg-gray-700/50 text-gray-200"
    : "bg-gray-100 text-gray-800 border border-gray-200/80";
  const mobileLoginButtonClasses = isDarkMode
    ? "bg-gray-700/60 text-gray-100 hover:bg-gray-600/60"
    : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200/80";
  const desktopSignupButtonClasses = isDarkMode
    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-indigo-500/30"
    : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-green-400/40";
  const mobileSignupButtonClasses = isDarkMode
    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
    : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg";

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: "En", name: "English" },
    { code: "Es", name: "Español" },
    { code: "Fr", name: "Français" },
    { code: "De", name: "Deutsch" },
    { code: "Zh", name: "中文" },
    { code: "Ja", name: "日本語" },
    { code: "Ko", name: "한국어" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      name: "Markets",
      href: "/markets",
      hasDropdown: false,
    },
    {
      name: "Spot",
      href: "/spot",
      hasDropdown: false,
    },
    {
      name: "Futures",
      href: "/Futures",
      hasDropdown: false,
    },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "backdrop-blur-xl border-b border-white/5" : ""
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Full width container - completely transparent */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3">
              {/* Logo from public folder */}
              <div className="w-40 h-10 relative">
                <Image
                  src={logoSrc}
                  alt="CBA Exchange Logo"
                  fill
                  className="object-contain"
                  sizes="160px"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div
              className={`${navSurfaceClasses} backdrop-blur-xl rounded-full px-6 py-2`}
            >
              <div className="flex items-center space-x-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="relative group"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {item.href.startsWith("/") ? (
                      <Link href={item.href}>
                        <motion.div
                          className={`flex items-center gap-1 ${desktopLinkClasses} font-medium text-sm transition-colors duration-200 py-2 px-3 rounded-lg ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"} cursor-pointer`}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {item.name}
                          {item.hasDropdown && (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                          )}
                        </motion.div>
                      </Link>
                    ) : (
                      <motion.a
                        href={item.href}
                        className={`flex items-center gap-1 ${desktopLinkClasses} font-medium text-sm transition-colors duration-200 py-2 px-3 rounded-lg ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"} cursor-pointer`}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.name}
                        {item.hasDropdown && (
                          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                        )}
                      </motion.a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Language Selector with Dropdown */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                className={`flex items-center gap-1 font-medium text-sm px-3 py-2 rounded-lg transition-all duration-200 backdrop-blur-xl ${buttonSurfaceClasses}`}
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                {selectedLanguage}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isLanguageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Language Dropdown */}
              {isLanguageOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute top-full mt-2 right-0 rounded-xl py-2 min-w-[160px] shadow-xl z-50 backdrop-blur-xl ${
                    isDarkMode
                      ? "bg-gray-800/95 border border-gray-700/30"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        isDarkMode
                          ? "text-gray-200 hover:text-white hover:bg-gray-700/50"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      }`}
                      onClick={() => {
                        setSelectedLanguage(language.code);
                        setIsLanguageOpen(false);
                      }}
                    >
                      <span className="font-medium">{language.code}</span>
                      <span className="ml-2 text-gray-400">
                        {language.name}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              className={`${buttonSurfaceClasses} p-2 rounded-lg transition-all duration-200 backdrop-blur-xl`}
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.button>

            {/* Auth Buttons */}
            <Link href="/login">
              <motion.button
                className={`${buttonSurfaceClasses} font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-xl`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Log in
              </motion.button>
            </Link>

            <Link href="/register">
              <motion.button
                className={desktopSignupButtonClasses}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign up
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 backdrop-blur-xl transition-all duration-300 border border-gray-700/30"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className="lg:hidden overflow-hidden"
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div
            className={`${mobilePanelClasses} backdrop-blur-xl rounded-b-2xl px-4 py-6 space-y-4 w-full`}
          >
            {navItems.map((item, index) => (
              <div key={item.name}>
                {item.href.startsWith("/") ? (
                  <Link href={item.href}>
                    <motion.div
                      className={`flex items-center justify-between font-medium py-3 border-b last:border-b-0 transition-colors duration-200 cursor-pointer ${
                        isDarkMode
                          ? "text-gray-200 hover:text-white border-gray-600/30 hover:bg-white/5"
                          : "text-gray-800 hover:text-gray-900 border-gray-200 hover:bg-gray-50 rounded-lg px-2"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{item.name}</span>
                      {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                    </motion.div>
                  </Link>
                ) : (
                  <motion.a
                    href={item.href}
                    className={`flex items-center justify-between font-medium py-3 border-b last:border-b-0 transition-colors duration-200 ${
                      isDarkMode
                        ? "text-gray-200 hover:text-white border-gray-600/30 hover:bg-white/5"
                        : "text-gray-800 hover:text-gray-900 border-gray-200 hover:bg-gray-50 rounded-lg px-2"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                  </motion.a>
                )}
              </div>
            ))}

            <div
              className={`pt-4 border-t ${
                isDarkMode ? "border-gray-600/30" : "border-gray-200/70"
              } flex flex-col gap-4`}
            >
              {/* Mobile Language & Theme */}
              <div className="flex items-center justify-between gap-4">
                <motion.div className="relative flex-1">
                  <motion.button
                    className={`flex w-full items-center justify-between font-medium px-3 py-2 rounded-lg transition-all duration-200 ${mobileControlClasses}`}
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedLanguage}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isLanguageOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  {/* Mobile Language Dropdown */}
                  {isLanguageOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute top-full mt-2 left-0 rounded-xl py-2 min-w-[140px] shadow-xl z-50 backdrop-blur-xl ${
                        isDarkMode
                          ? "bg-gray-800/95 border border-gray-700/40"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                            isDarkMode
                              ? "text-gray-200 hover:text-white hover:bg-gray-700/50"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          }`}
                          onClick={() => {
                            setSelectedLanguage(language.code);
                            setIsLanguageOpen(false);
                          }}
                        >
                          <span className="font-medium">{language.code}</span>
                          <span className="ml-2 text-gray-400">
                            {language.name}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                <motion.button
                  className={`p-2 rounded-lg transition-all duration-200 ${mobileControlClasses}`}
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  aria-label="Toggle theme"
                >
                  {mounted ? (
                    theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </motion.button>
              </div>

              {/* Mobile Auth Buttons */}
              <Link href="/login" className="w-full">
                <motion.button
                  className={`w-full font-medium px-4 py-3 rounded-lg transition-all duration-200 ${mobileLoginButtonClasses}`}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Log in
                </motion.button>
              </Link>

              <Link href="/register" className="w-full">
                <motion.button
                  className={`w-full font-medium px-4 py-3 rounded-lg transition-all duration-200 ${mobileSignupButtonClasses}`}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign up
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom border with subtle gradient - only when scrolled */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
      )}
    </motion.header>
  );
}
