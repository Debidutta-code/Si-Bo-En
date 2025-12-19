import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 1. Define schema
const ratePlanSchema = z.object({
  propertyName: z.string().min(2, "Property name must be at least 2 characters"),
  propertyCode: z.string().min(3, "Property code must be at least 3 characters"),
  ratePlanName: z.string().min(3, "Rate plan name must be at least 3 characters"),
})

type RatePlanType = z.infer<typeof ratePlanSchema>

export default function RatePlan() {
  const [ratePlan, setRatePlan] = useState<RatePlanType>({
    propertyName: "",
    propertyCode: "",
    ratePlanName: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof RatePlanType, string>>>({})

  const handleSubmit = () => {
    const result = ratePlanSchema.safeParse(ratePlan)
    if (!result.success) {
      // collect validation errors
      const newErrors: Partial<Record<keyof RatePlanType, string>> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof RatePlanType
        newErrors[field] = err.message
      })
      setErrors(newErrors)
    } else {
      setErrors({})
      console.log("✅ Valid data:", result.data)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl shadow bg-card space-y-4">
      <h2 className="text-xl font-semibold">Create Rate Plan</h2>

      <div>
        <Input
          placeholder="Property Name"
          value={ratePlan.propertyName}
          onChange={(e) => setRatePlan({ ...ratePlan, propertyName: e.target.value })}
        />
        {errors.propertyName && <p className="text-red-500 text-sm">{errors.propertyName}</p>}
      </div>

      <div>
        <Input
          placeholder="Property Code"
          value={ratePlan.propertyCode}
          onChange={(e) => setRatePlan({ ...ratePlan, propertyCode: e.target.value })}
        />
        {errors.propertyCode && <p className="text-red-500 text-sm">{errors.propertyCode}</p>}
      </div>

      <div>
        <Input
          placeholder="Rate Plan Name"
          value={ratePlan.ratePlanName}
          onChange={(e) => setRatePlan({ ...ratePlan, ratePlanName: e.target.value })}
        />
        {errors.ratePlanName && <p className="text-red-500 text-sm">{errors.ratePlanName}</p>}
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Create Rate Plan
      </Button>
    </div>
  )
}
