import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function NotificationSettings() {
    const [pushEnabled, setPushEnabled] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_URL = "https://assistant-virtual-production.onrender.com/api/v1/notification_settings";

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                alert("No hay token de acceso. Inicia sesión.");
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setPushEnabled(data.push_enabled);
                    setEmailEnabled(data.email_enabled);
                } else {
                    const error = await res.json().catch(() => ({}));
                    alert("Error al cargar preferencias: " + (error.error || res.status));
                }
            } catch (e) {
                alert("Error de red al cargar preferencias");
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        const token = localStorage.getItem("token"); 
        if (!token) {
            alert("No hay token de acceso. Inicia sesión.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    push_enabled: pushEnabled,
                    email_enabled: emailEnabled,
                }),
            });
            if (res.ok) {
                alert("Preferencias guardadas");
            } else {
                const error = await res.json().catch(() => ({}));
                alert("Error al guardar preferencias: " + (error.error || res.status));
            }
        } catch (e) {
            alert("Error de red al guardar preferencias");
        }
        setLoading(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notificaciones</span>
            </h3>
            <div className="space-y-4 ml-7">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Notificaciones push</span>
                        <p className="text-sm text-muted-foreground">
                            Recibe alertas importantes
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPushEnabled(!pushEnabled)}
                        disabled={loading}
                    >
                        {pushEnabled ? "Desactivar" : "Activar"}
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Notificaciones por email</span>
                        <p className="text-sm text-muted-foreground">
                            Recibe resúmenes por correo
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEmailEnabled(!emailEnabled)}
                        disabled={loading}
                    >
                        {emailEnabled ? "Desactivar" : "Activar"}
                    </Button>
                </div>
            </div>
            <div className="mt-6">
                <Button
                    onClick={handleSave}
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? "Guardando..." : "Guardar preferencias"}
                </Button>
            </div>
        </div>
    );
}