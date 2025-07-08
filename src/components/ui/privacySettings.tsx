import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define a type for the history items
type HistoryItem = {
    id: number;
    title: string;
    date: string;
    messageCount: number;
    type: string;
    pregunta: string;
    respuesta: string;
    documento_id: number | null;
};

export function PrivacySettings({ token }: { token: string }) {
    const [info, setInfo] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading2FA, setLoading2FA] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Simulación de activación de 2FA (debes crear el endpoint real en Flask)
    const handleActivate2FA = async () => {
        setLoading2FA(true);
        try {
            // Aquí deberías llamar a tu endpoint real de 2FA
            setTimeout(() => {
                setInfo("Autenticación de dos factores activada (simulado).");
                setLoading2FA(false);
            }, 1000);
        } catch {
            setInfo("Error de red.");
            setLoading2FA(false);
        }
    };

    // Obtener historial de conversaciones
    const handleGetHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch("https://assistant-virtual-production.onrender.com/api/v1/historial", { // Cambia aquí la URL
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data: HistoryItem[] = await res.json();
                setHistory(data);
                setShowHistory(true);
            } else {
                // Intenta extraer el mensaje de error del backend
                const errData = await res.json().catch(() => null);
                const errorMessage = errData?.message || "No se pudo obtener el historial.";
                setInfo(errorMessage);
            }
        } catch {
            setInfo("Error al obtener historial.");
        }
        setLoadingHistory(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacidad y Seguridad</span>
            </h3>
            <div className="space-y-4 ml-7">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Autenticación de dos factores</span>
                        <p className="text-sm text-muted-foreground">
                            Protege tu cuenta
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleActivate2FA}
                        disabled={loading2FA}
                    >
                        {loading2FA ? "Activando..." : "Activar"}
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Historial de conversaciones</span>
                        <p className="text-sm text-muted-foreground">
                            Gestiona tus datos
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGetHistory}
                        disabled={loadingHistory}
                    >
                        {loadingHistory ? "Cargando..." : "Gestionar"}
                    </Button>
                </div>
            </div>
            {info && (
                <div className="mt-4 text-sm text-blue-600">{info}</div>
            )}
            {showHistory && (
                <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Historial</h4>
                    {history.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-300">No hay conversaciones.</p>
                    ) : (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {history.map((item) => (
                                <li
                                    key={item.id}
                                    className="text-sm flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded px-3 py-2"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">{item.date}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Button
                        className="mt-2 bg-bank-blue-500 hover:bg-bank-blue-600 text-white"
                        size="sm"
                        onClick={() => setShowHistory(false)}
                    >
                        Cerrar
                    </Button>
                </div>
            )}
        </div>
    );
}