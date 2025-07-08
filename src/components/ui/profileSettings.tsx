import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

type UserType = {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    rol?: string;
};

export function ProfileSettings({
    user,
    onUserUpdate,
}: {
    user: UserType;
    onUserUpdate: (u: UserType) => void;
}) {
    const [editOpen, setEditOpen] = useState(false);
    const [pwdOpen, setPwdOpen] = useState(false);
    const [form, setForm] = useState({ nombre: user.nombre, email: user.email, telefono: user.telefono || "" });
    const [pwd, setPwd] = useState({ old: "", new1: "", new2: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleEdit = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch("https://assistant-virtual-production.onrender.com/api/v1/update_user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, email_original: user.email }),
            });
            const data = await res.json();
            if (data.error) setMsg(data.error);
            else {
                onUserUpdate(data);
                setEditOpen(false);
            }
        } catch {
            setMsg("Error de conexión");
        }
        setLoading(false);
    };

    const handlePwd = async () => {
        setLoading(true);
        setMsg("");
        if (pwd.new1 !== pwd.new2) {
            setMsg("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch("https://assistant-virtual-production.onrender.com/api/v1/change_password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, old: pwd.old, new: pwd.new1 }),
            });
            const data = await res.json();
            if (data.error) setMsg(data.error);
            else {
                setPwdOpen(false);
            }
        } catch {
            setMsg("Error de conexión");
        }
        setLoading(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Perfil</span>
            </h3>
            <div className="space-y-4 ml-7">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Información personal</span>
                        <p className="text-sm text-muted-foreground">
                            Nombre: {user.nombre} <br />
                            Email: {user.email} <br />
                            Teléfono: {user.telefono || "-"}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                        Editar
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-medium">Cambiar contraseña</span>
                        <p className="text-sm text-muted-foreground">
                            Mantén tu cuenta segura
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPwdOpen(true)}>
                        Cambiar
                    </Button>
                </div>
            </div>
            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar perfil">
                <div className="space-y-3">
                    <Input
                        placeholder="Nombre"
                        value={form.nombre}
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    />
                    <Input
                        placeholder="Email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                    <Input
                        placeholder="Teléfono"
                        value={form.telefono}
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    />
                    {msg && <div className="text-red-500 text-sm">{msg}</div>}
                    <Button onClick={handleEdit} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </Modal>
            <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="Cambiar contraseña">
                <div className="space-y-3">
                    <Input
                        type="password"
                        placeholder="Contraseña actual"
                        value={pwd.old}
                        onChange={e => setPwd(p => ({ ...p, old: e.target.value }))}
                    />
                    <Input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={pwd.new1}
                        onChange={e => setPwd(p => ({ ...p, new1: e.target.value }))}
                    />
                    <Input
                        type="password"
                        placeholder="Repetir nueva contraseña"
                        value={pwd.new2}
                        onChange={e => setPwd(p => ({ ...p, new2: e.target.value }))}
                    />
                    {msg && <div className="text-red-500 text-sm">{msg}</div>}
                    <Button onClick={handlePwd} disabled={loading}>
                        {loading ? "Cambiando..." : "Cambiar"}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}