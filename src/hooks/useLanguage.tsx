import { LanguageContext } from "@/components/ui/LanguageProvider";
import { useContext } from "react";

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  return ctx;
};