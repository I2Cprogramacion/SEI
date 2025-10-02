"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegistroSimplePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code2FA, setCode2FA] = useState("");
  const [pending2FA, setPending2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/auth/registro-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.pending_2fa) {
        setPending2FA(true);
        setSuccess("Código enviado a tu correo electrónico");
      } else {
        setError(data.error || "Error en el registro");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code2FA }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("¡Registro y verificación exitosos! Ya puedes iniciar sesión.");
      } else {
        setError(data.error || "Código incorrecto o expirado");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Registro simple con 2FA</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
      {!pending2FA ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <Input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
          <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
          <Button type="submit" disabled={isLoading}>Registrarse</Button>
        </form>
      ) : (
        <form onSubmit={handle2FA} className="space-y-4">
          <Input type="text" placeholder="Código de verificación" value={code2FA} onChange={e => setCode2FA(e.target.value)} required maxLength={6} disabled={isLoading} />
          <Button type="submit" disabled={isLoading || code2FA.length !== 6}>Verificar código</Button>
        </form>
      )}
    </div>
  );
}
