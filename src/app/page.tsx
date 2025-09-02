"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Download, FileText, Code, CheckCircle, AlertCircle, Save, FolderOpen, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SchemaField {
  name: string
  label: string
  type: "text" | "textarea" | "select" | "date" | "number"
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface SchemaType {
  id: string
  name: string
  description: string
  fields: SchemaField[]
  example: string
}

interface SchemaTemplate {
  id: string
  name: string
  description: string
  schemaType: string
  data: Record<string, string>
  createdAt: string
}

const schemaTypes: SchemaType[] = [
  {
    id: "faq",
    name: "FAQ Page",
    description: "Frequently Asked Questions schema for better search visibility",
    fields: [
      { name: "mainEntity", label: "FAQ Questions & Answers", type: "textarea", required: true, placeholder: "Enter questions and answers in format:\nQ: What is your return policy?\nA: We offer 30-day returns on all items.\n\nQ: How long does shipping take?\nA: Standard shipping takes 3-5 business days." }
    ]
  },
  {
    id: "article",
    name: "Article",
    description: "News article, blog post, or other written content",
    fields: [
      { name: "headline", label: "Headline", type: "text", required: true, placeholder: "Article title" },
      { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Brief description of the article" },
      { name: "author", label: "Author", type: "text", required: true, placeholder: "Author name" },
      { name: "datePublished", label: "Publication Date", type: "date", required: true },
      { name: "image", label: "Image URL", type: "text", placeholder: "https://example.com/image.jpg" }
    ]
  },
  {
    id: "localbusiness",
    name: "Local Business",
    description: "Local business information for Google Maps and search",
    fields: [
      { name: "name", label: "Business Name", type: "text", required: true, placeholder: "Your business name" },
      { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Brief description of your business" },
      { name: "address", label: "Address", type: "textarea", required: true, placeholder: "Street address, city, state, zip code" },
      { name: "phone", label: "Phone", type: "text", placeholder: "(555) 123-4567" },
      { name: "website", label: "Website", type: "text", placeholder: "https://yourwebsite.com" },
      { name: "hours", label: "Hours", type: "textarea", placeholder: "Monday-Friday: 9AM-5PM\nSaturday: 10AM-4PM\nSunday: Closed" }
    ]
  },
  {
    id: "event",
    name: "Event",
    description: "Event information for better visibility in search results",
    fields: [
      { name: "name", label: "Event Name", type: "text", required: true, placeholder: "Event title" },
      { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Event description" },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "endDate", label: "End Date", type: "date", placeholder: "Optional" },
      { name: "location", label: "Location", type: "text", required: true, placeholder: "Event venue or address" },
      { name: "url", label: "Event URL", type: "text", placeholder: "https://example.com/event" }
    ]
  },
  {
    id: "product",
    name: "Product",
    description: "Product information for e-commerce pages",
    fields: [
      { name: "name", label: "Product Name", type: "text", required: true, placeholder: "Product name" },
      { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Product description" },
      { name: "price", label: "Price", type: "text", required: true, placeholder: "29.99" },
      { name: "currency", label: "Currency", type: "select", required: true, options: [
        { value: "USD", label: "USD" },
        { value: "EUR", label: "EUR" },
        { value: "GBP", label: "GBP" },
        { value: "CAD", label: "CAD" }
      ]},
      { name: "availability", label: "Availability", type: "select", required: true, options: [
        { value: "InStock", label: "In Stock" },
        { value: "OutOfStock", label: "Out of Stock" },
        { value: "PreOrder", label: "Pre-Order" }
      ]},
      { name: "image", label: "Image URL", type: "text", placeholder: "https://example.com/product.jpg" }
    ]
  },
  {
    id: "organization",
    name: "Organization",
    description: "Organization information for company pages",
    fields: [
      { name: "name", label: "Organization Name", type: "text", required: true, placeholder: "Company name" },
      { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Organization description" },
      { name: "url", label: "Website", type: "text", required: true, placeholder: "https://company.com" },
      { name: "logo", label: "Logo URL", type: "text", placeholder: "https://company.com/logo.jpg" },
      { name: "contactPoint", label: "Contact Information", type: "textarea", placeholder: "Contact type and details:\nCustomer Service: +1-555-123-4567\nSales: sales@company.com" }
    ]
  }
]

export default function Home() {
  const [selectedSchema, setSelectedSchema] = useState<string>("faq")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedSchema, setGeneratedSchema] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [templates, setTemplates] = useState<SchemaTemplate[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false)
  const [newTemplateName, setNewTemplateName] = useState<string>("")
  const [newTemplateDescription, setNewTemplateDescription] = useState<string>("")
  const { toast } = useToast()

  const currentSchema = schemaTypes.find(s => s.id === selectedSchema)

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const generateSchema = () => {
    const schema = currentSchema
    if (!schema) return

    // Clear previous validation errors
    setValidationErrors([])

    // Validate required fields
    const errors: string[] = []
    schema.fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].trim() === "")) {
        errors.push(`${field.label} is required`)
      }
    })

    // Additional validation for specific schema types
    if (schema.id === "faq" && formData.mainEntity) {
      const faqItems = parseFAQData(formData.mainEntity)
      if (faqItems.length === 0) {
        errors.push("At least one valid FAQ item (Q: and A:) is required")
      }
    }

    if (schema.id === "product" && formData.price) {
      const priceRegex = /^\d+(\.\d{1,2})?$/
      if (!priceRegex.test(formData.price)) {
        errors.push("Price must be a valid number (e.g., 29.99)")
      }
    }

    if (schema.id === "article" && formData.image) {
      try {
        new URL(formData.image)
      } catch {
        errors.push("Image URL must be a valid URL")
      }
    }

    if (schema.id === "localbusiness" && formData.website) {
      try {
        new URL(formData.website)
      } catch {
        errors.push("Website URL must be a valid URL")
      }
    }

    if (schema.id === "event" && formData.url) {
      try {
        new URL(formData.url)
      } catch {
        errors.push("Event URL must be a valid URL")
      }
    }

    if (schema.id === "organization" && formData.url) {
      try {
        new URL(formData.url)
      } catch {
        errors.push("Website URL must be a valid URL")
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      toast({
        title: "Validation Error",
        description: "Please fix the errors before generating schema.",
        variant: "destructive",
      })
      return
    }

    let jsonLd: any = {
      "@context": "https://schema.org",
      "@type": getSchemaType(schema.id)
    }

    switch (schema.id) {
      case "faq":
        const faqItems = parseFAQData(formData.mainEntity || "")
        jsonLd.mainEntity = faqItems
        break
      
      case "article":
        jsonLd.headline = formData.headline
        jsonLd.description = formData.description
        jsonLd.author = {
          "@type": "Person",
          "name": formData.author
        }
        jsonLd.datePublished = formData.datePublished
        if (formData.image) {
          jsonLd.image = formData.image
        }
        break
      
      case "localbusiness":
        jsonLd.name = formData.name
        jsonLd.description = formData.description
        jsonLd.address = parseAddress(formData.address || "")
        jsonLd.telephone = formData.phone
        if (formData.website) {
          jsonLd.url = formData.website
        }
        if (formData.hours) {
          jsonLd.openingHours = parseHours(formData.hours)
        }
        break
      
      case "event":
        jsonLd.name = formData.name
        jsonLd.description = formData.description
        jsonLd.startDate = formData.startDate
        if (formData.endDate) {
          jsonLd.endDate = formData.endDate
        }
        jsonLd.location = {
          "@type": "Place",
          "name": formData.location
        }
        if (formData.url) {
          jsonLd.url = formData.url
        }
        break
      
      case "product":
        jsonLd.name = formData.name
        jsonLd.description = formData.description
        jsonLd.offers = {
          "@type": "Offer",
          "price": formData.price,
          "priceCurrency": formData.currency,
          "availability": `https://schema.org/${formData.availability}`
        }
        if (formData.image) {
          jsonLd.image = formData.image
        }
        break
      
      case "organization":
        jsonLd.name = formData.name
        jsonLd.description = formData.description
        jsonLd.url = formData.url
        if (formData.logo) {
          jsonLd.logo = formData.logo
        }
        if (formData.contactPoint) {
          jsonLd.contactPoint = parseContactPoints(formData.contactPoint)
        }
        break
    }

    const schemaString = JSON.stringify(jsonLd, null, 2)
    setGeneratedSchema(schemaString)
    
    // Show success message
    toast({
      title: "Schema Generated Successfully!",
      description: "Your JSON-LD schema is ready to use.",
    })
  }

  const getSchemaType = (schemaId: string): string => {
    const typeMap: Record<string, string> = {
      faq: "FAQPage",
      article: "Article",
      localbusiness: "LocalBusiness",
      event: "Event",
      product: "Product",
      organization: "Organization"
    }
    return typeMap[schemaId] || "Thing"
  }

  const parseFAQData = (data: string): any[] => {
    const items = data.split('\n\n').filter(item => item.trim())
    return items.map(item => {
      const lines = item.split('\n')
      let question = ""
      let answer = ""
      
      lines.forEach(line => {
        if (line.startsWith('Q:')) {
          question = line.substring(2).trim()
        } else if (line.startsWith('A:')) {
          answer = line.substring(2).trim()
        }
      })
      
      return {
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answer
        }
      }
    }).filter(item => item.name && item.acceptedAnswer.text)
  }

  const parseAddress = (address: string): any => {
    const lines = address.split('\n').filter(line => line.trim())
    const addressObj: any = {
      "@type": "PostalAddress"
    }
    
    if (lines.length >= 1) addressObj.streetAddress = lines[0]
    if (lines.length >= 2) addressObj.addressLocality = lines[1]
    if (lines.length >= 3) addressObj.addressRegion = lines[2]
    if (lines.length >= 4) addressObj.postalCode = lines[3]
    
    return addressObj
  }

  const parseHours = (hours: string): string[] => {
    return hours.split('\n').filter(line => line.trim())
  }

  const parseContactPoints = (contact: string): any[] => {
    const items = contact.split('\n').filter(item => item.trim())
    return items.map(item => {
      const [type, value] = item.split(':').map(s => s.trim())
      return {
        "@type": "ContactPoint",
        "contactType": type,
        value: value
      }
    }).filter(item => item.contactType && item.value)
  }

  const copyToClipboard = async () => {
    if (!generatedSchema) return
    
    try {
      await navigator.clipboard.writeText(generatedSchema)
      setCopied(true)
      toast({
        title: "Copied to clipboard!",
        description: "Schema markup has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or manually copy the schema.",
        variant: "destructive",
      })
    }
  }

  const downloadSchema = () => {
    if (!generatedSchema) return
    
    const blob = new Blob([generatedSchema], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schema-${selectedSchema}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded!",
      description: "Schema markup has been downloaded as JSON file.",
    })
  }

  const saveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template.",
        variant: "destructive",
      })
      return
    }

    const hasRequiredData = currentSchema?.fields.some(field => 
      field.required && formData[field.name]?.trim()
    )

    if (!hasRequiredData) {
      toast({
        title: "No data to save",
        description: "Please fill in at least some required fields before saving as template.",
        variant: "destructive",
      })
      return
    }

    const newTemplate: SchemaTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim(),
      schemaType: selectedSchema,
      data: { ...formData },
      createdAt: new Date().toISOString()
    }

    setTemplates(prev => [...prev, newTemplate])
    setNewTemplateName("")
    setNewTemplateDescription("")
    setShowSaveDialog(false)
    
    toast({
      title: "Template saved!",
      description: `"${newTemplate.name}" has been saved to your templates.`,
    })
  }

  const loadTemplate = (template: SchemaTemplate) => {
    setSelectedSchema(template.schemaType)
    setFormData(template.data)
    setGeneratedSchema("") // Clear previous schema
    setValidationErrors([]) // Clear validation errors
    
    toast({
      title: "Template loaded!",
      description: `"${template.name}" has been loaded.`,
    })
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    toast({
      title: "Template deleted",
      description: "The template has been removed from your saved templates.",
    })
  }

  const clearForm = () => {
    setFormData({})
    setGeneratedSchema("")
    setValidationErrors([])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Structured Data Assistant</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create valid JSON-LD schema markup to improve your SEO and search visibility. 
            Generate structured data for FAQ pages, articles, local businesses, events, products, and organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Schema Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Schema Configuration
              </CardTitle>
              <CardDescription>
                Select a schema type and fill in the required information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="schema-type">Schema Type</Label>
                <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schema type" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemaTypes.map((schema) => (
                      <SelectItem key={schema.id} value={schema.id}>
                        {schema.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentSchema?.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                {currentSchema?.fields.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="min-h-[100px]"
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={formData[field.name] || ""}
                        onValueChange={(value) => handleFieldChange(field.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Please fix the following errors:
                  </h4>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save as Template</DialogTitle>
                      <DialogDescription>
                        Save your current form data as a reusable template for future use.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="My Business Template"
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-description">Description (Optional)</Label>
                        <Textarea
                          id="template-description"
                          value={newTemplateDescription}
                          onChange={(e) => setNewTemplateDescription(e.target.value)}
                          placeholder="Brief description of this template..."
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveTemplate}>
                          Save Template
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button onClick={clearForm} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                
                <Button onClick={generateSchema} className="flex-1">
                  <Code className="h-4 w-4 mr-2" />
                  Generate Schema
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Schema Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Generated Schema
                {generatedSchema && validationErrors.length === 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Your JSON-LD schema markup ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedSchema ? (
                <>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto max-h-96 overflow-y-auto">
                      <code>{generatedSchema}</code>
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                      {copied ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                    <Button onClick={downloadSchema} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">How to use this schema:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Copy the JSON-LD code above</li>
                      <li>Paste it into your WordPress page or post</li>
                      <li>Wrap it in a script tag: <code className="bg-blue-100 px-1 rounded">&lt;script type="application/ld+json"&gt;</code></li>
                      <li>Test your schema using Google's Rich Results Test</li>
                    </ol>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure your schema and click "Generate Schema" to see the output</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {templates.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Saved Templates
                </CardTitle>
                <CardDescription>
                  Your reusable schema templates for quick access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => {
                    const schemaType = schemaTypes.find(s => s.id === template.schemaType)
                    return (
                      <Card key={template.id} className="border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {schemaType?.name} • {new Date(template.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTemplate(template.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {template.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                          )}
                          <Button 
                            onClick={() => loadTemplate(template)}
                            className="w-full"
                            size="sm"
                          >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Load Template
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>About Structured Data</CardTitle>
              <CardDescription>
                Learn how structured data can improve your SEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Better Search Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Structured data helps search engines understand your content better, 
                    potentially leading to rich snippets in search results.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Higher Click-Through Rates</h4>
                  <p className="text-sm text-muted-foreground">
                    Rich snippets stand out in search results, attracting more clicks 
                    and driving more traffic to your website.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Improved User Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    Structured data enables features like breadcrumbs, ratings, 
                    and other interactive elements in search results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}