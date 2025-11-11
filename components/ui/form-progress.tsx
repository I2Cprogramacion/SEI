import { Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface FormSection {
  id: string
  title: string
  completed: boolean
}

interface FormProgressProps {
  sections: FormSection[]
  currentSection?: string
}

export function FormProgress({ sections, currentSection }: FormProgressProps) {
  const completedCount = sections.filter(s => s.completed).length
  const totalCount = sections.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <div className="sticky top-20 bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-blue-900">Progreso del formulario</h3>
          <span className="text-xs text-blue-600">
            {completedCount} de {totalCount} secciones
          </span>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="space-y-1">
          {sections.map((section, index) => (
            <div 
              key={section.id}
              className={`flex items-center gap-2 text-sm transition-all ${
                section.id === currentSection 
                  ? "text-blue-700 font-medium" 
                  : section.completed 
                    ? "text-green-600" 
                    : "text-gray-500"
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                section.completed 
                  ? "bg-green-100 text-green-700" 
                  : section.id === currentSection
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {section.completed ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs">{section.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

