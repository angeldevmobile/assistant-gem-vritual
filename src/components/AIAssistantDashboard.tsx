import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "./ThemeToggle";
import BankIcon from "./BankIcon";
import AIAssistantIcon from "./AIAssistantIcon";
import {
	Send,
	Mic,
	FileText,
	Image,
	History,
	LogOut,
	Upload,
	Sparkles,
	Settings,
	Paperclip,
	MessageCircle,
	FileCheck,
	Check,
	X,
	Clock,
	Download,
	Eye,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Modal } from "./ui/modal";
import { NotificationSettings } from "@/components/ui/notificationSettings";
import { AppearanceSettings } from "@/components/ui/appearanceSettings";
import { PrivacySettings } from "@/components/ui/privacySettings";
import { ProfileSettings } from "@/components/ui/profileSettings";

interface Message {
	id: number;
	type: "user" | "assistant";
	content: string;
	timestamp: Date;
}

interface AIAssistantDashboardProps {
	user: { name: string; email: string };
	onLogout: () => void;
}

type UserType = {
	id: number;
	nombre: string;
	email: string;
	telefono?: string;
	rol?: string;
};

interface Document {
	id: number;
	name: string;
	type: "pdf" | "image";
	size: string;
	uploadDate: Date;
	status: "validated" | "invalid" | "pending";
	thumbnail?: string;
}

interface HistoryItem {
	id: number;
	title: string;
	date: Date;
	messageCount: number;
	type: "document" | "query" | "validation";
}

type ActiveScreen =
	| "chat"
	| "documents"
	| "validation"
	| "settings"
	| "history";

// Define el tipo para el resultado de validación
type ValidationResult =
	| { error: string }
	| { coincidencias: Record<string, unknown>[] };

interface BackendDocument {
	id: number;
	name: string;
	uploadDate: string;
	type: "pdf" | "image";
	status: "validado" | "cargado" | "invalidado";
	size: string;
}

export const AIAssistantDashboard = ({
	user,
	onLogout,
}: AIAssistantDashboardProps) => {
	const [activeScreen, setActiveScreen] = useState<ActiveScreen>("chat");
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [isDragActive, setIsDragActive] = useState(false);
	const token = localStorage.getItem("token") || "";
	const [userState, setUserState] = useState<UserType>({
		id: 0,
		nombre: user.name ?? "",
		email: user.email,
		telefono: "",
		rol: "cliente",
	});
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [sheetId, setSheetId] = useState("");
	const [validationResult, setValidationResult] =
		useState<ValidationResult | null>(null);
	const [isValidating, setIsValidating] = useState(false);
	const [uploadedDoc, setUploadedDoc] = useState<{
		name: string;
		id?: number;
	} | null>(null);
	const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

	const [userDocuments, setUserDocuments] = useState<Document[]>([]);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);
	useEffect(() => {
		const fetchUserDocuments = async () => {
			try {
				const response = await fetch(
					`https://assistant-virtual-production.onrender.com/api/v1/listar_documentos?user_email=${encodeURIComponent(
						user.email
					)}`
				);
				const docs: BackendDocument[] = await response.json();
				setUserDocuments(
					docs.map((doc) => ({
						...doc,
						status:
							doc.status === "validado"
								? "validated"
								: doc.status === "cargado"
								? "pending"
								: "invalid",
						uploadDate: new Date(doc.uploadDate),
					}))
				);
			} catch (e) {
				setUserDocuments([]);
			}
		};
		fetchUserDocuments();
	}, [user.email]);

	const [history, setHistory] = useState([]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		console.log("Token JWT usado para historial:", token); // Log del token
		if (!token) {
			setHistory([]);
			return;
		}
		fetch(`https://assistant-virtual-production.onrender.com/api/v1/historial`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(async (res) => {
				console.log("Status historial:", res.status); // Log del status HTTP
				const data = await res.json().catch(() => null);
				console.log("Respuesta historial:", data);
				if (!res.ok)
					throw new Error(data?.msg || "No autorizado o token inválido");
				return data;
			})
			.then((data) => setHistory(Array.isArray(data) ? data : []))
			.catch((err) => {
				console.error("Error obteniendo historial:", err);
				setHistory([]);
			});
	}, []);

	const handleSendMessage = async () => {
		if (!inputMessage.trim()) return;

		const newMessage: Message = {
			id: messages.length + 1,
			type: "user",
			content: inputMessage,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, newMessage]);
		setInputMessage("");

		try {
			const response = await fetch("https://assistant-virtual-production.onrender.com/api/v1/assistant", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					question: inputMessage,
					user_email: user.email,
					document_id: uploadedDoc?.id,
				}),
			});

			const data = await response.json();

			const assistantMessage: Message = {
				id: messages.length + 2,
				type: "assistant",
				content:
					data.respuesta ||
					"Ocurrió un error al obtener la respuesta del asistente.",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
			// TTS: lee la respuesta del asistente usando Google Cloud TTS
			// speakText(assistantMessage.content);
		} catch (error) {
			const errorMessage: Message = {
				id: messages.length + 2,
				type: "assistant",
				content:
					"Ocurrió un error al conectar con el asistente. Intenta de nuevo.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		}
	};

	const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(
		null
	);
	const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

	const handleViewHistory = async (item: HistoryItem) => {
		setSelectedHistory(item);
		setIsHistoryModalOpen(true);
		try {
			const res = await fetch(
				`https://assistant-virtual-production.onrender.com/api/v1/historial/${item.id}/messages`
			);
			const data: {
				id: number;
				type: "user" | "assistant";
				content: string;
				timestamp: string;
			}[] = await res.json();
			setHistoryMessages(
				data.map((msg, idx) => ({
					id: msg.id ?? idx + 1,
					type: msg.type,
					content: msg.content,
					timestamp: new Date(msg.timestamp),
				}))
			);
		} catch {
			setHistoryMessages([]);
		}
	};

	// Nueva función para validar documento contra Google Sheets
	const handleValidateWithSheet = async () => {
		if (!uploadedDoc?.id || !sheetId.trim()) {
			setValidationResult({ error: "Falta documento o Sheet ID" });
			return;
		}
		setIsValidating(true);
		setValidationResult(null);
		try {
			const response = await fetch(
				"https://assistant-virtual-production.onrender.com/api/v1/validar-documento-sheets",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						document_id: uploadedDoc.id,
						sheet_id: sheetId.trim(),
					}),
				}
			);
			const data = await response.json();
			setValidationResult(data);
		} catch (err) {
			setValidationResult({ error: "Error de conexión" });
		}
		setIsValidating(false);
	};

	// Cambia esta función para usar tu backend TTS (Google Cloud)
	const speakText = async (text: string) => {
		try {
			const res = await fetch("https://assistant-virtual-production.onrender.com/api/v1/tts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});
			const data = await res.json();
			if (data.audio) {
				const audio = new Audio("data:audio/mp3;base64," + data.audio);
				audio.play();
			}
		} catch (err) {
			console.error("Error reproduciendo TTS:", err);
		}
	};

	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
		null
	);

	const handleVoiceToggle = async () => {
		if (isListening) {
			mediaRecorder?.stop();
			setIsListening(false);
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			let chunks: BlobPart[] = [];

			recorder.ondataavailable = (e) => chunks.push(e.data);

			recorder.onstop = () => {
				const audioBlob = new Blob(chunks, { type: "audio/webm" });
				sendAudioToBackend(audioBlob);
				chunks = [];
			};

			recorder.start();
			setMediaRecorder(recorder);
			setIsListening(true);
		} catch (err) {
			console.error("Error accediendo al micrófono:", err);
		}
	};

	const sendAudioToBackend = async (audioBlob: Blob) => {
		const formData = new FormData();
		formData.append("audio", audioBlob);

		// Usa el email del usuario y el ID del documento subido
		formData.append("user_email", user.email);
		if (uploadedDoc?.id) formData.append("document_id", String(uploadedDoc.id));

		try {
			const response = await fetch(
				"https://assistant-virtual-production.onrender.com/api/v1/speech-to-text",
				{
					method: "POST",
					body: formData,
				}
			);

			const data = await response.json();

			if (data.transcript && data.text) {
				setMessages((prev) => [
					...prev,
					{
						id: prev.length + 1,
						type: "user",
						content: data.transcript,
						timestamp: new Date(),
					},
					{
						id: prev.length + 2,
						type: "assistant",
						content: data.text,
						timestamp: new Date(),
					},
				]);
				if (data.audio) {
					const audio = new Audio("data:audio/mp3;base64," + data.audio);
					audio.play();
				}
				setInputMessage("");
			} else {
				console.warn("No se detectó voz o texto");
			}
		} catch (err) {
			console.error("Error enviando audio:", err);
		}
	};

	// Cambia esta función para abrir el input de archivo
	const handleFileUpload = () => {
		fileInputRef.current?.click();
	};

	// Nueva función para manejar la carga del archivo
	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);
		formData.append("user_email", user.email);

		try {
			const response = await fetch(
				"https://assistant-virtual-production.onrender.com/api/v1/upload_document",
				{
					method: "POST",
					body: formData,
				}
			);
			const data = await response.json();
			setUploadedDoc({ name: file.name, id: data.document_id }); // Guarda el ID retornado
		} catch (err) {
			// Opcional: puedes mostrar un mensaje de error en el chat si falla la carga
		}
	};

	// Handler para drag & drop
	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragActive(false);
		const file = e.dataTransfer.files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append("file", file);
		formData.append("user_email", user.email);
		try {
			const response = await fetch(
				"https://assistant-virtual-production.onrender.com/api/v1/upload_document",
				{
					method: "POST",
					body: formData,
				}
			);
			const data = await response.json();
			setUploadedDoc({ name: file.name, id: data.document_id });
		} catch (err) {
			// Manejo de error opcional
		}
	};

	// Handler para drag events
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragActive(true);
	};
	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragActive(false);
	};

	const getStatusIcon = (status: Document["status"]) => {
		switch (status) {
			case "validated":
				return <Check className="w-5 h-5 text-green-500" />;
			case "invalid":
				return <X className="w-5 h-5 text-red-500" />;
			case "pending":
				return <Clock className="w-5 h-5 text-yellow-500" />;
		}
	};

	const getStatusText = (status: Document["status"]) => {
		switch (status) {
			case "validated":
				return "Validado";
			case "invalid":
				return "No válido";
			case "pending":
				return "Pendiente";
		}
	};

	const getStatusColor = (status: Document["status"]) => {
		switch (status) {
			case "validated":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "invalid":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
		}
	};

	const getTypeIcon = (type: HistoryItem["type"]) => {
		switch (type) {
			case "document":
				return <FileText className="w-4 h-4" />;
			case "validation":
				return <FileCheck className="w-4 h-4" />;
			case "query":
				return <MessageCircle className="w-4 h-4" />;
		}
	};

	const sidebarItems = [
		{ id: "chat", label: "Chat IA", icon: MessageCircle },
		{ id: "validation", label: "Validar Documentos", icon: FileCheck },
		{ id: "documents", label: "Documentos", icon: FileText },
		{ id: "history", label: "Historial", icon: History },
		{ id: "settings", label: "Configuración", icon: Settings },
	];

	const renderMainContent = () => {
		switch (activeScreen) {
			case "chat":
				return (
					<Card className="h-[600px] flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200/50 dark:border-blue-700/50 shadow-2xl">
						<CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-t-lg">
							<CardTitle className="text-lg flex items-center space-x-2">
								<AIAssistantIcon className="w-6 h-6" />
								<span>Gurú - Asistente IA</span>
								<div className="ml-auto flex items-center space-x-2">
									<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
									<span className="text-sm">En línea</span>
								</div>
							</CardTitle>
						</CardHeader>
						{/*Cambios aquí */}
						<CardContent className="flex-1 flex flex-col min-h-0 p-0 bg-gradient-to-b from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
							<div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 overscroll-contain">
								{messages.map((message) => (
									<div
										key={message.id}
										className={`flex ${
											message.type === "user" ? "justify-end" : "justify-start"
										} animate-fade-in`}>
										<div
											className={`max-w-[80%] p-4 rounded-2xl shadow-lg break-words ${
												message.type === "user"
													? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white"
													: "bg-gradient-to-r from-white to-blue-50 dark:from-gray-700 dark:to-gray-600 text-foreground border border-blue-200 dark:border-gray-600"
											} transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
											<p className="text-sm break-words">{message.content}</p>
											<p className="text-xs opacity-70 mt-2">
												{message.timestamp.toLocaleTimeString()}
											</p>
										</div>
									</div>
								))}
								{uploadedDoc && (
									<div className="flex justify-start animate-fade-in">
										<div className="max-w-[80%] p-4 rounded-2xl shadow-lg bg-gradient-to-r from-white to-blue-50 border border-blue-200">
											<p className="text-sm font-bold">
												📄 Documento cargado: {uploadedDoc.name}
											</p>
											<p className="text-xs mt-2 text-muted-foreground">
												Ahora puedes hacer preguntas sobre este documento.
											</p>
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
							<div className="p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-[15px]">
								<div className="flex items-center space-x-2">
									<input
										type="file"
										accept=".pdf,image/*"
										ref={fileInputRef}
										style={{ display: "none" }}
										onChange={handleFileChange}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={handleFileUpload}
										className="transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900">
										<Paperclip className="w-4 h-4" />
									</Button>
									<Input
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										placeholder="Pregunta a Gurú sobre tus consultas bancarias..."
										onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
										className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80"
									/>
									<Button
										variant={isListening ? "default" : "outline"}
										size="icon"
										onClick={handleVoiceToggle}
										className={`transition-all duration-300 ${
											isListening
												? "bg-red-500 hover:bg-red-600 animate-pulse-slow"
												: "hover:bg-blue-100 dark:hover:bg-blue-900"
										}`}>
										<Mic className="w-4 h-4" />
									</Button>
									<Button
										onClick={handleSendMessage}
										className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:opacity-90 transition-all duration-300 transform hover:scale-105">
										<Send className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				);

			case "validation":
				return (
					<Card className="h-[600px] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900/20 border-2 border-green-200/50 dark:border-green-700/50">
						<CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
							<CardTitle className="flex items-center space-x-2">
								<FileCheck className="w-6 h-6" />
								<span>Validar Documentos</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="space-y-6">
								<div className="text-center">
									<div
										className={`w-24 h-24 mx-auto bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mb-4 border-2 transition-all duration-200 ${
											isDragActive
												? "border-green-500 ring-4 ring-green-200/50"
												: "border-transparent"
										}`}
										onDrop={handleDrop}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}>
										<Upload className="w-12 h-12 text-green-600" />
									</div>
									<h3 className="text-lg font-semibold mb-2">
										Sube tu documento
									</h3>
									<p className="text-muted-foreground">
										Arrastra y suelta archivos PDF o imágenes aquí
									</p>
									<div className="mt-4 flex justify-center">
										<input
											type="file"
											accept=".pdf,image/*"
											ref={fileInputRef}
											style={{ display: "none" }}
											onChange={handleFileChange}
										/>
										<Button
											variant="outline"
											onClick={handleFileUpload}
											className="flex items-center space-x-2">
											<Upload className="w-5 h-5 mr-2" />
											<span>Seleccionar archivo</span>
										</Button>
									</div>
									{uploadedDoc && (
										<div className="mt-4 text-green-700 dark:text-green-300 text-sm">
											<Check className="inline w-4 h-4 mr-1" />
											Archivo cargado:{" "}
											<span className="font-semibold">{uploadedDoc.name}</span>
										</div>
									)}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<Button
										variant="outline"
										className="h-20 flex-col space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20"
										onClick={handleFileUpload}>
										<FileText className="w-8 h-8 text-green-600" />
										<span>Validar PDF</span>
									</Button>
									<Button
										variant="outline"
										className="h-20 flex-col space-y-2 hover:bg-green-50 dark:hover:bg-green-900/20"
										onClick={handleFileUpload}>
										<Image className="w-8 h-8 text-green-600" />
										<span>Analizar Imagen</span>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				);

			case "documents":
				return (
					<>
						<Card className="h-[600px] bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-yellow-900/20 border-2 border-yellow-200/50 dark:border-yellow-700/50">
							<CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
								<CardTitle className="flex items-center space-x-2">
									<FileText className="w-6 h-6" />
									<span>Documentos</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<ScrollArea className="h-[500px]">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{userDocuments.map((doc) => (
											<Card
												key={doc.id}
												className="hover:shadow-lg transition-all duration-300 hover:scale-105">
												<CardContent className="p-4">
													<div className="flex items-start space-x-3">
														<div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
															{doc.type === "pdf" ? (
																<FileText className="w-6 h-6 text-orange-600" />
															) : (
																<Image className="w-6 h-6 text-orange-600" />
															)}
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="font-medium text-sm truncate">
																{doc.name}
															</h4>
															<p className="text-xs text-muted-foreground">
																{doc.size}
															</p>
															<p className="text-xs text-muted-foreground">
																{doc.uploadDate instanceof Date
																	? doc.uploadDate.toLocaleDateString()
																	: new Date(
																			doc.uploadDate
																	  ).toLocaleDateString()}
															</p>
														</div>
														<div className="flex flex-col items-end space-y-2">
															<div
																className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
																	doc.status
																)}`}>
																{getStatusIcon(doc.status)}
																<span>{getStatusText(doc.status)}</span>
															</div>
															<div className="flex space-x-1">
																<Button
																	variant="outline"
																	size="sm"
																	className="h-6 w-6 p-0"
																	onClick={() => setPreviewDoc(doc)}>
																	<Eye className="w-3 h-3" />
																</Button>
																<Button
																	variant="outline"
																	size="sm"
																	className="h-6 w-6 p-0"
																	onClick={() => {
																		const url = `https://assistant-virtual-production.onrender.com/api/v1/document/${
																			doc.id
																		}?user_email=${encodeURIComponent(
																			user.email
																		)}`;
																		const link = document.createElement("a");
																		link.href = url;
																		link.download = doc.name;
																		document.body.appendChild(link);
																		link.click();
																		document.body.removeChild(link);
																	}}>
																	<Download className="w-3 h-3" />
																</Button>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
						<Modal
							open={!!previewDoc}
							onClose={() => setPreviewDoc(null)}
							title={previewDoc?.name}>
							{previewDoc && previewDoc.type === "pdf" ? (
								<iframe
									src={`https://assistant-virtual-production.onrender.com/api/v1/document/${
										previewDoc.id
									}?user_email=${encodeURIComponent(user.email)}`}
									title="Vista previa PDF"
									className="w-full h-96 rounded border"
								/>
							) : previewDoc ? (
								<img
									src={`https://assistant-virtual-production.onrender.com/api/v1/document/${
										previewDoc.id
									}?user_email=${encodeURIComponent(user.email)}`}
									alt={previewDoc.name}
									className="max-w-full max-h-96 rounded border mx-auto"
								/>
							) : null}
						</Modal>
					</>
				);

			case "history":
				return (
					<>
						<Card className="h-[600px] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 border-2 border-purple-200/50 dark:border-purple-700/50">
							<CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
								<CardTitle className="flex items-center space-x-2">
									<History className="w-6 h-6" />
									<span>Historial de Conversaciones</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<ScrollArea className="h-[500px]">
									<div className="space-y-4">
										{history.map((item) => (
											<Card
												key={item.id}
												className="hover:shadow-lg transition-all duration-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 cursor-pointer">
												<CardContent className="p-4">
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
															{getTypeIcon(item.type)}
														</div>
														<div className="flex-1">
															<h4 className="font-medium text-sm">
																{item.title}
															</h4>
															<div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
																<span>
																	{new Date(item.date).toLocaleDateString()}
																</span>
																<span>•</span>
																<span>
																	{new Date(item.date).toLocaleTimeString()}
																</span>
																<span>•</span>
																<span>{item.messageCount} mensajes</span>
															</div>
														</div>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleViewHistory(item)}>
															Ver
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
						<Modal
							open={isHistoryModalOpen}
							onClose={() => setIsHistoryModalOpen(false)}
							title={selectedHistory?.title || "Conversación"}>
							<ScrollArea className="max-h-96">
								<div className="space-y-4">
									{historyMessages.length === 0 && (
										<p className="text-center text-muted-foreground">
											No hay mensajes para mostrar.
										</p>
									)}
									{historyMessages.map((msg) => (
										<div
											key={msg.id}
											className={`flex ${
												msg.type === "user" ? "justify-end" : "justify-start"
											}`}>
											<div
												className={`max-w-[80%] p-3 rounded-xl shadow ${
													msg.type === "user"
														? "bg-blue-100 text-blue-900"
														: "bg-gray-100 text-gray-900"
												}`}>
												<p className="text-sm">{msg.content}</p>
												<p className="text-xs opacity-60 mt-1">
													{msg.timestamp.toLocaleString()}
												</p>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						</Modal>
					</>
				);

			case "settings":
				return (
					<Card className="h-[600px] bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900/20 border-2 border-gray-200/50 dark:border-gray-700/50">
						<CardHeader className="bg-gradient-to-r from-gray-500 to-slate-500 text-white">
							<CardTitle className="flex items-center space-x-2">
								<Settings className="w-6 h-6" />
								<span>Configuración</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<ScrollArea className="h-[500px]">
								<div className="space-y-6">
									<AppearanceSettings />
									<NotificationSettings />
									<PrivacySettings token={token} />
									<ProfileSettings
										user={userState}
										onUserUpdate={setUserState}
									/>
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-bank-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
			{/* Header */}
			<header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<BankIcon className="w-10 h-10" />
						<div>
							<h1 className="text-2xl font-bold bg-gradient-banking bg-clip-text text-transparent flex items-center gap-2">
								<Sparkles className="w-5 h-5 text-bank-blue-500" />
								Gurú
							</h1>
							<p className="text-sm text-muted-foreground">
								Asistente Bancario IA
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<span className="text-sm font-medium">
							Hola, {userState.nombre}
						</span>
						<ThemeToggle />
						<Button
							variant="outline"
							size="sm"
							onClick={onLogout}
							className="hover:bg-red-50 hover:text-red-600 transition-colors duration-300">
							<LogOut className="w-4 h-4 mr-2" />
							Salir
						</Button>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Sidebar */}
				<div className="lg:col-span-1 space-y-4">
					<Card className="glass-effect dark:glass-effect-dark">
						<CardHeader>
							<CardTitle className="text-lg flex items-center space-x-2">
								<AIAssistantIcon className="w-6 h-6" />
								<span>Menú Principal</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{sidebarItems.map((item) => (
								<Button
									key={item.id}
									variant={activeScreen === item.id ? "default" : "outline"}
									className={`w-full justify-start transition-all duration-300 ${
										activeScreen === item.id
											? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
											: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
									}`}
									onClick={() => setActiveScreen(item.id as ActiveScreen)}>
									<item.icon className="w-4 h-4 mr-2" />
									{item.label}
								</Button>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<div className="lg:col-span-3">{renderMainContent()}</div>
			</div>

			{/* Modal para ver historial */}
			<Modal
				open={isHistoryModalOpen}
				onClose={() => setIsHistoryModalOpen(false)}
				title={`Historial - ${selectedHistory?.title}`}>
				<CardContent>
					<div className="space-y-4">
						{historyMessages.length === 0 ? (
							<p className="text-center text-muted-foreground">
								Sin mensajes en este historial.
							</p>
						) : (
							historyMessages.map((msg) => (
								<div
									key={msg.id}
									className={`flex ${
										msg.type === "user" ? "justify-end" : "justify-start"
									}`}>
									<div
										className={`max-w-[80%] p-4 rounded-2xl shadow-lg break-words ${
											msg.type === "user"
												? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white"
												: "bg-gradient-to-r from-white to-blue-50 dark:from-gray-700 dark:to-gray-600 text-foreground border border-blue-200 dark:border-gray-600"
										} transition-all duration-300`}>
										<p className="text-sm break-words">{msg.content}</p>
										<p className="text-xs opacity-70 mt-2">
											{msg.timestamp.toLocaleTimeString()}
										</p>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Modal>
		</div>
	);
};
