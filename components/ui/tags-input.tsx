"use client"

import React, { useState, useRef, KeyboardEvent } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
  maxTags?: number
  className?: string
  disabled?: boolean
  required?: boolean
}

export const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  placeholder = "Escribe y presiona Enter para agregar",
  label,
  maxTags = 10,
  className = "",
  disabled = false,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    
    // Validaciones
    if (!trimmedTag) return
    if (value.includes(trimmedTag)) return
    if (value.length >= maxTags) return
    
    onChange([...value, trimmedTag])
    setInputValue("")
  }

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index)
    onChange(newTags)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Si no hay texto y presiona backspace, eliminar la última etiqueta
      removeTag(value.length - 1)
    }
  }

  const handleAddClick = () => {
    addTag(inputValue)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-blue-900 font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="space-y-3">
        {/* Input para agregar etiquetas */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || value.length >= maxTags}
            className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
          />
          <Button
            type="button"
            onClick={handleAddClick}
            disabled={disabled || !inputValue.trim() || value.length >= maxTags}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Contador de etiquetas */}
        <div className="text-xs text-blue-600">
          {value.length}/{maxTags} etiquetas
        </div>

        {/* Etiquetas existentes */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200"
              >
                <span>{tag}</span>
                <Button
                  type="button"
                  onClick={() => removeTag(index)}
                  disabled={disabled}
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-blue-200 text-blue-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje de ayuda */}
        <div className="text-xs text-blue-600">
          <p>• Escribe una etiqueta y presiona Enter para agregarla</p>
          <p>• Haz clic en la X para eliminar una etiqueta</p>
          <p>• Máximo {maxTags} etiquetas permitidas</p>
        </div>
      </div>
    </div>
  )
}
