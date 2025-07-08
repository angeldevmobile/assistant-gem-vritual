import { useState, ReactNode } from "react";
import { LanguageContext } from "./LanguageProvider";

type Language = "es" | "en";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("es");
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};