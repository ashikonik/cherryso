/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { createTag, deleteTag } from "./actions"
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

export function TagClient({ initialTags }: { initialTags: any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
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
    await createTag(formData)
    setIsPending(false)
    setName("")
    setSlug("")
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Create Form */}
      <div className="md:col-span-1 border border-border bg-card p-6 rounded-xl shadow-sm h-fit">
        <h2 className="text-lg font-semibold mb-4">Add New Tag</h2>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              placeholder="e.g. Mechanical" 
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
              placeholder="e.g. mechanical" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Tag"}
          </Button>
        </form>
      </div>

      {/* Tags Table */}
      <div className="md:col-span-2 border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialTags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>{tag.slug}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure?")) {
                        await deleteTag(tag.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initialTags.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No tags found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
