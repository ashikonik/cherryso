/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { createCategory, deleteCategory } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"

export function CategoryClient({ initialCategories }: { initialCategories: any[] }) {
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    const oldSlug = generateSlug(name)
    if (slug === "" || slug === oldSlug) {
      setSlug(generateSlug(newName))
    }
  }

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    formData.set("slug", slug)
    await createCategory(formData)
    setIsPending(false)
    setName("")
    setSlug("")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Create Form */}
      <div className="md:col-span-1 border border-border bg-card p-6 rounded-xl shadow-sm h-fit">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              placeholder="e.g. Keycaps" 
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input 
              id="slug" 
              name="slug" 
              required 
              placeholder="e.g. keycaps" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="parentId">Parent Category (Optional)</Label>
            <select 
              id="parentId" 
              name="parentId" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">None (Top Level)</option>
              {initialCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Category"}
          </Button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="md:col-span-2 border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  {initialCategories.find(c => c.id === category.parentId)?.name || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure?")) {
                        await deleteCategory(category.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initialCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
