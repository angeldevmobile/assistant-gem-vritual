import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
const LANGUAGES = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
];

export function AppearanceSettings() {
    const { language, setLanguage } = useLanguage();

    const handleLanguageChange = () => {
        setLanguage(language === "es" ? "en" : "es");
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Apariencia</span>
            </h3>
            <div className="space-y-4 ml-7">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Tema</span>
                        <p className="text-sm text-muted-foreground">
                            Cambia entre tema claro y oscuro
                        </p>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Idioma</span>
                        <p className="text-sm text-muted-foreground">
                            {LANGUAGES.find((l) => l.code === language)?.label}{" "}
                            (predeterminado)
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLanguageChange}
                    >
                        Cambiar
                    </Button>
                </div>
            </div>
        </div>
    );
}