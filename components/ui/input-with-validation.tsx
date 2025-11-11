import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { FieldHelp } from "./field-help"

interface InputWithValidationProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  helpText?: string
  example?: string
  error?: string
  isValid?: boolean
  showValidation?: boolean
  required?: boolean
}

export function InputWithValidation({
  label,
  helpText,
  example,
  error,
  isValid,
  showValidation = false,
  required = false,
  value,
  ...props
}: InputWithValidationProps) {
  const hasValue = value !== undefined && value !== null && String(value).length > 0
  const showCheck = showValidation && hasValue && isValid && !error
  const showError = hasValue && (error || (showValidation && !isValid))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-blue-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helpText && <FieldHelp message={helpText} example={example} />}
        </div>
        {showCheck && (
          <div className="flex items-center gap-1 text-xs text-green-600 animate-in fade-in duration-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>Válido</span>
          </div>
        )}
      </div>
      
      <div className="relative">
        <Input
          {...props}
          value={value}
          className={`${props.className || ""} ${
            showCheck 
              ? "border-green-300 focus:border-green-400 focus:ring-green-400" 
              : showError 
                ? "border-red-300 focus:border-red-400 focus:ring-red-400" 
                : ""
          }`}
        />
        {showCheck && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
        )}
        {showError && (
          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

