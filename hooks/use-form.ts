import { useState, ChangeEvent, FormEvent } from "react"

type FormFieldValue = string | number | boolean | null | string[]

export interface FormState {
  [key: string]: FormFieldValue
}

export interface FormErrors {
  [key: string]: string
}

export interface UseFormOptions<T extends FormState> {
  initialValues: T
  onSubmit?: (values: T) => void | Promise<void>
  validate?: (values: T) => FormErrors
}

export function useForm<T extends FormState>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Manejar cambios en campos de formulario
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    // Manejar diferentes tipos de inputs
    let processedValue: FormFieldValue = value
    
    if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked
    } else if (
      (type === "number" || name.toLowerCase().includes("id")) && 
      value !== ""
    ) {
      processedValue = Number(value)
    } else if (
      (name.toLowerCase().includes("id")) && 
      value === ""
    ) {
      processedValue = null
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
    
    // Limpiar error cuando el usuario modifica el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Resetear formulario a valores iniciales
  const resetForm = () => {
    setFormData(initialValues)
    setErrors({})
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validar formulario si existe función de validación
    if (validate) {
      const validationErrors = validate(formData)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }
    
    setIsSubmitting(true)
    
    try {
      if (onSubmit) {
        await onSubmit(formData)
      }
      // No reseteamos automáticamente para permitir que el componente decida
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    setFormData,
    resetForm,
    handleSubmit
  }
} 