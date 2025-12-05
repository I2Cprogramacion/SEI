import { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, Shield, Users, FileText, Award, Clock, Download, UserCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Preguntas Frecuentes - SEI",
  description: "Preguntas frecuentes sobre el Sistema Estatal de Investigadores",
}

const faqCategories = [
  {
    title: "General",
    icon: HelpCircle,
    questions: [
      {
        question: "¿Qué es el Sistema Estatal de Investigadores?",
        answer: "El SEI es una plataforma web integral diseñada para gestionar perfiles académicos, publicaciones científicas y proyectos de investigación de manera centralizada y eficiente. Permite a investigadores e instituciones tener un espacio digital para mostrar su trabajo y colaborar.",
      },
      {
        question: "¿Es gratuito usar la plataforma?",
        answer: "Sí, el SEI es una plataforma de acceso completamente gratuito para investigadores e instituciones académicas. No hay costos de registro ni cuotas de membresía.",
      },
      {
        question: "¿La plataforma está disponible 24/7?",
        answer: "Sí, la plataforma está desplegada en infraestructura en la nube con alta disponibilidad. Puedes acceder en cualquier momento. En caso de mantenimiento programado, se notificará con anticipación.",
      },
    ],
  },
  {
    title: "Registro y Cuenta",
    icon: UserCheck,
    questions: [
      {
        question: "¿Cómo puedo registrarme?",
        answer: "Ve a la página de registro, completa el formulario con tus datos académicos y profesionales (nombre, institución, grado académico, etc.), y verifica tu email con el código de 6 dígitos que recibirás. Opcionalmente, puedes subir tu CV en PDF para que el sistema extraiga automáticamente tu información.",
      },
      {
        question: "¿Necesito conocimientos técnicos para usar la plataforma?",
        answer: "No. La plataforma está diseñada para ser intuitiva y fácil de usar. Los investigadores pueden registrarse, crear perfiles y gestionar sus publicaciones sin necesidad de conocimientos técnicos avanzados. Si tienes dudas, contáctanos.",
      },
      {
        question: "¿Olvidé mi contraseña, qué hago?",
        answer: "En la página de inicio de sesión, haz clic en 'Olvidé mi contraseña'. Recibirás un correo electrónico con instrucciones para restablecer tu contraseña de forma segura.",
      },
      {
        question: "¿Puedo actualizar mi información después de registrarme?",
        answer: "Sí, puedes editar tu perfil en cualquier momento desde tu panel de usuario. Ve a 'Mi Perfil' y actualiza la información que necesites.",
      },
    ],
  },
  {
    title: "Seguridad y Privacidad",
    icon: Shield,
    questions: [
      {
        question: "¿Mis datos están seguros?",
        answer: "Absolutamente. Utilizamos autenticación segura con Clerk, encriptación de datos sensibles, y seguimos las mejores prácticas de seguridad. Los datos personales como CURP y RFC nunca son accesibles públicamente.",
      },
      {
        question: "¿Quién puede ver mi información?",
        answer: "Tu perfil público muestra información básica como nombre, institución, áreas de investigación y publicaciones. Datos sensibles como correo electrónico, CURP y RFC solo son visibles para ti y administradores autorizados.",
      },
      {
        question: "¿Puedo hacer mi perfil privado?",
        answer: "Los perfiles básicos son públicos para facilitar la colaboración académica. Sin embargo, puedes controlar qué publicaciones y proyectos aparecen en tu perfil público.",
      },
    ],
  },
  {
    title: "Perfiles y Visibilidad",
    icon: Users,
    questions: [
      {
        question: "¿Puedo ver perfiles de otros investigadores sin registrarme?",
        answer: "Sí, los perfiles públicos de investigadores son accesibles sin necesidad de crear una cuenta. Sin embargo, para acceder a funcionalidades completas como mensajería, conexiones y gestión de tu propio perfil, necesitas registrarte.",
      },
      {
        question: "¿Cómo funciona el sistema de niveles SNI?",
        answer: "El sistema clasifica a los investigadores en niveles similares al Sistema Nacional de Investigadores (Candidato, Nivel I, II, III, Emérito), permitiendo identificar trayectorias académicas y reconocimiento científico.",
      },
      {
        question: "¿Cómo puedo destacar mi perfil?",
        answer: "Completa toda tu información académica, agrega tus publicaciones con DOI, sube tu fotografía profesional, y mantén actualizado tu perfil. Los perfiles completos tienen mayor visibilidad en búsquedas.",
      },
    ],
  },
  {
    title: "Publicaciones y Documentos",
    icon: FileText,
    questions: [
      {
        question: "¿Puedo subir mis publicaciones?",
        answer: "Sí, puedes gestionar tus publicaciones científicas, agregar archivos PDF, asignar DOI, especificar autores, y hacerlas visibles en tu perfil público.",
      },
      {
        question: "¿Qué es el OCR automatizado?",
        answer: "Es una funcionalidad que extrae automáticamente información de tu CV en PDF (nombre, institución, grados académicos, experiencia, etc.) para facilitar el proceso de registro y ahorrarte tiempo de captura manual.",
      },
      {
        question: "¿Qué formatos de archivo acepta la plataforma?",
        answer: "Aceptamos PDF para CVs y publicaciones, y archivos ZIP para conjuntos de documentos. Las imágenes de perfil pueden ser JPG o PNG.",
      },
      {
        question: "¿Hay un límite de tamaño para los archivos?",
        answer: "Los archivos PDF pueden tener hasta 10 MB, y las fotografías de perfil hasta 5 MB. Si necesitas subir archivos más grandes, contacta al soporte técnico.",
      },
    ],
  },
  {
    title: "Sistema de Reconocimiento",
    icon: Award,
    questions: [
      {
        question: "¿Cómo se asignan los niveles SNI?",
        answer: "Los niveles son asignados por evaluadores autorizados basándose en tu trayectoria académica, publicaciones, proyectos y contribuciones al campo de investigación.",
      },
      {
        question: "¿Puedo solicitar una revisión de mi nivel?",
        answer: "Sí, puedes solicitar una revisión desde tu panel de usuario si consideras que tu nivel no refleja tu trayectoria actual. Un evaluador revisará tu solicitud.",
      },
    ],
  },
  {
    title: "Funcionalidades y Características",
    icon: Clock,
    questions: [
      {
        question: "¿Puedo colaborar con otros investigadores en la plataforma?",
        answer: "Sí, puedes conectarte con otros investigadores, enviar mensajes, y colaborar en proyectos. También puedes etiquetar coautores en publicaciones.",
      },
      {
        question: "¿Puedo exportar mis datos?",
        answer: "Sí, puedes exportar tu información y publicaciones en diferentes formatos (PDF, CSV) desde tu panel de usuario en cualquier momento.",
      },
      {
        question: "¿Cómo funciona el buscador?",
        answer: "El buscador global permite encontrar investigadores, publicaciones y proyectos por palabras clave, área de investigación, institución, o nombre. Usa filtros avanzados para refinar tus búsquedas.",
      },
    ],
  },
  {
    title: "Administración",
    icon: Download,
    questions: [
      {
        question: "¿Quién puede ser administrador?",
        answer: "Los administradores son designados por el equipo técnico o la institución responsable del SEI. No es posible auto-asignarse permisos de administrador por razones de seguridad.",
      },
      {
        question: "¿Qué puede hacer un administrador?",
        answer: "Los administradores pueden gestionar usuarios, aprobar perfiles de investigadores, asignar roles de evaluador, moderar contenido, y acceder a estadísticas del sistema.",
      },
      {
        question: "¿Cómo reporto un problema o error?",
        answer: "Puedes reportar problemas técnicos desde el formulario de contacto en la plataforma, o enviando un correo al equipo de soporte técnico.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Preguntas Frecuentes</h1>
        <p className="text-muted-foreground text-lg">
          Encuentra respuestas a las preguntas más comunes sobre el Sistema Estatal de Investigadores
        </p>
      </div>

      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.title}
              </CardTitle>
              <CardDescription>
                {category.questions.length} preguntas en esta categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`item-${categoryIndex}-${faqIndex}`}
                  >
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle>¿No encuentras lo que buscas?</CardTitle>
          <CardDescription>
            Si tu pregunta no está respondida aquí, no dudes en contactarnos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Nuestro equipo de soporte está disponible para ayudarte con cualquier duda o problema que tengas.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="mailto:daron.tarin@i2c.com.mx"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-fit"
            >
              Enviar Email
            </a>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">O escríbenos directamente a:</p>
              <a 
                href="mailto:daron.tarin@i2c.com.mx" 
                className="text-base font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                daron.tarin@i2c.com.mx
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
