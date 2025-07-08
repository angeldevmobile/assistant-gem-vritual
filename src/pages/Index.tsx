import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { AIAssistantDashboard } from "@/components/AIAssistantDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register";

interface User {
	name: string;
	email: string;
	phone?: string;
}

const Index = () => {
	const [authMode, setAuthMode] = useState<AuthMode>("login");
	const [user, setUser] = useState<User | null>(null);
	const { toast } = useToast();

	const handleLogin = async (email: string, password: string) => {
		try {
			const response = await fetch("https://assistant-virtual-production.onrender.com/api/v1/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Error de inicio de sesión",
					description: data.detail || "Credenciales incorrectas.",
					variant: "destructive",
				});
				return;
			}

			// GUARDA EL TOKEN JWT AQUÍ
			if (data.access_token) {
				localStorage.setItem("token", data.access_token);
			}

			setUser({
				name: data.nombre || data.name || "Usuario",
				email: data.email,
				phone: data.telefono,
			});
			toast({
				title: "¡Bienvenido a Gurú!",
				description: "Tu asistente bancario IA está listo para ayudarte.",
			});
		} catch (error) {
			console.error("Error en el inicio de sesión:", error);
			toast({
				title: "Error de conexión",
				description: "No se pudo conectar con el servidor.",
				variant: "destructive",
			});
		}
	};

	const handleRegister = async (
		name: string,
		email: string,
		phone: string,
		password: string
	) => {
		try {
			if (!name || !email || !phone || !password) {
				toast({
					title: "Campos requeridos",
					description: "Completa todos los campos para registrarte.",
					variant: "destructive",
				});
				return;
			}

			const payload = {
				nombre: name,
				email: email,
				telefono: phone,
				password: password,
			};
			console.log("Payload enviado:", payload);

			console.log("Payload JSON:", JSON.stringify(payload));

			const response = await fetch("https://assistant-virtual-production.onrender.com/api/v1/registro-usuario", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			console.log("Status response:", response.status);

			const responseData = await response.clone().json().catch(() => null);
			console.log("Respuesta recibida:", responseData);
			if (responseData?.detail) {
				console.log("Detalle del error:", responseData.detail);
			}

			if (!response.ok) {
				let errorMsg = responseData?.detail;
				if (Array.isArray(errorMsg)) {
					errorMsg = errorMsg.map((e: { msg: string }) => e.msg).join(", ");
				} else if (typeof errorMsg === "object") {
					errorMsg = JSON.stringify(errorMsg);
				}
				toast({
					title: "Error al registrar",
					description: errorMsg || "Intenta con otro correo.",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "¡Cuenta creada exitosamente!",
				description: "Gurú te da la bienvenida a la nueva era bancaria.",
			});
			setAuthMode("login");
		} catch (err) {
			console.error("Error en fetch:", err);
			toast({
				title: "Error de conexión",
				description: "No se pudo conectar con el servidor.",
				variant: "destructive",
			});
		}
	};

	const handleLogout = () => {
		setUser(null);
		setAuthMode("login");
		toast({
			title: "Sesión cerrada",
			description: "Gurú te espera para tu próxima consulta.",
		});
	};

	if (user) {
		return <AIAssistantDashboard user={user} onLogout={handleLogout} />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-bank-blue-50 via-white to-bank-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background Animation */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-bank-blue-200/20 rounded-full animate-float"></div>
				<div
					className="absolute -bottom-40 -left-40 w-96 h-96 bg-bank-blue-300/10 rounded-full animate-float"
					style={{ animationDelay: "1s" }}></div>
				<div
					className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-bank-gold-400/5 rounded-full animate-float"
					style={{ animationDelay: "2s" }}></div>
			</div>

			{/* Theme Toggle */}
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			{/* Auth Forms */}
			<div className="relative z-10 w-full max-w-md">
				{authMode === "login" ? (
					<LoginForm
						onLogin={handleLogin}
						onSwitchToRegister={() => setAuthMode("register")}
					/>
				) : (
					<RegisterForm
						onRegister={handleRegister}
						onSwitchToLogin={() => setAuthMode("login")}
					/>
				)}
			</div>

			{/* Footer */}
			<div className="absolute bottom-4 left-4 right-4 text-center">
				<p className="text-sm text-muted-foreground">
					Gurú - Asistente Virtual IA para Entidades Bancarias
				</p>
				<p className="text-xs text-muted-foreground mt-1">
					Tecnología inteligente, segura y confiable
				</p>
			</div>
		</div>
	);
};

export default Index;
