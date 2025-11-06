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
  const { theme, toggleTheme } = useTheme();

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
                  src="/logo.svg"
                  alt="CBA Exchange Logo"
                  fill
                  className="object-contain"
                  sizes="160px"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation - Dark background container only around nav links */}
          <nav className="hidden lg:flex items-center">
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-full px-6 py-2 border border-gray-700/30">
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
                          className="flex items-center gap-1 text-gray-300 hover:text-white font-medium text-sm transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer"
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
                        className="flex items-center gap-1 text-gray-300 hover:text-white font-medium text-sm transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5"
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
                className="flex items-center gap-1 text-gray-300 hover:text-white font-medium text-sm bg-gray-800/60 backdrop-blur-xl hover:bg-gray-700/60 px-3 py-2 rounded-lg transition-all duration-200 border border-gray-700/30"
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
                  className="absolute top-full mt-2 right-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-lg py-2 min-w-[140px] shadow-xl z-50"
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200 text-sm"
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
              className="p-2 text-gray-300 hover:text-white bg-gray-800/60 backdrop-blur-xl hover:bg-gray-700/60 rounded-lg transition-all duration-200 border border-gray-700/30"
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.button>

            {/* Auth Buttons */}
            <Link href="/login">
              <motion.button
                className="text-gray-300 hover:text-white font-medium text-sm bg-gray-800/60 backdrop-blur-xl hover:bg-gray-700/60 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-700/30"
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-indigo-500/30"
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
          className={`lg:hidden overflow-hidden ${
            isMobileMenuOpen ? "max-h-96" : "max-h-0"
          }`}
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl mx-4 my-4 p-6 space-y-4 border border-gray-700/30">
            {navItems.map((item, index) => (
              <div key={item.name}>
                {item.href.startsWith("/") ? (
                  <Link href={item.href}>
                    <motion.div
                      className="flex items-center justify-between text-gray-300 hover:text-white font-medium py-3 border-b border-gray-600/30 last:border-b-0 transition-colors duration-200 cursor-pointer"
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
                    className="flex items-center justify-between text-gray-300 hover:text-white font-medium py-3 border-b border-gray-600/30 last:border-b-0 transition-colors duration-200"
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

            <div className="pt-4 space-y-3 border-t border-gray-600/30">
              {/* Mobile Language & Theme */}
              <div className="flex items-center justify-between">
                <motion.div className="relative">
                  <motion.button
                    className="flex items-center gap-2 text-gray-300 hover:text-white font-medium bg-gray-700/50 px-3 py-2 rounded-lg transition-all duration-200"
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
                      className="absolute top-full mt-2 left-0 bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-lg py-2 min-w-[140px] shadow-xl z-50"
                    >
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200 text-sm"
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
                  className="p-2 text-gray-300 hover:text-white bg-gray-700/50 rounded-lg transition-all duration-200"
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </motion.button>
              </div>

              {/* Mobile Auth Buttons */}
              <Link href="/login" className="w-full">
                <motion.button
                  className="w-full text-gray-300 hover:text-white font-medium bg-gray-700/50 hover:bg-gray-600/50 px-4 py-3 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Log in
                </motion.button>
              </Link>

              <Link href="/register" className="w-full">
                <motion.button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200 shadow-lg"
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
