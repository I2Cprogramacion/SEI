import { HelpCircle, CheckCircle2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FieldHelpProps {
  message: string
  example?: string
  isValid?: boolean
  showValidation?: boolean
}

export function FieldHelp({ message, example, isValid, showValidation = false }: FieldHelpProps) {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-blue-400 hover:text-blue-600 cursor-help transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-sm">{message}</p>
            {example && (
              <p className="text-xs text-gray-400 mt-1">
                <span className="font-medium">Ejemplo:</span> {example}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showValidation && isValid && (
        <CheckCircle2 className="h-4 w-4 text-green-600 animate-in fade-in duration-200" />
      )}
    </div>
  )
}

