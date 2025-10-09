"use client";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function IniciarSesionPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Iniciar sesión</h1>
          <p className="text-blue-600">Accede a tu cuenta de investigador en SECCTI</p>
        </div>
        <div className="my-8">
          <SignIn
            path="/iniciar-sesion"
            routing="path"
            appearance={{
              elements: {
                card: "shadow-lg rounded-xl border border-blue-200",
                headerTitle: "text-blue-900 font-bold",
                socialButtons: "bg-blue-100",
                footerAction: "hidden",
              },
              variables: {
                colorPrimary: "#1e40af",
                colorText: "#1e3a8a",
              },
            }}
          />
        </div>
        <div className="text-center text-sm text-blue-600">
          <p>
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="text-blue-700 underline underline-offset-4 hover:text-blue-900">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
