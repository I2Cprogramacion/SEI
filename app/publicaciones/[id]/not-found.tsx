import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FileQuestion className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Publicación no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Lo sentimos, la publicación que buscas no existe o ha sido eliminada.
          </p>
          <Link href="/publicaciones">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a publicaciones
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
