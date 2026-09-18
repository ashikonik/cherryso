"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { deleteProduct, updateProductStatus } from "./actions"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { QuickStockEdit } from "./QuickStockEdit"

export function ProductClient({ initialProducts }: { initialProducts: any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  return (
    <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted relative">
                    {product.images?.[0]?.url ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs">No img</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.sku}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <select 
                  className={`px-2 py-1 rounded-md text-xs font-medium capitalize border focus:ring-2 focus:ring-ring outline-none cursor-pointer ${
                    product.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900' :
                    product.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900' :
                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                  }`}
                  value={product.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as "draft" | "active" | "archived"
                    await updateProductStatus(product.id, newStatus)
                  }}
                >
                  <option value="draft" className="bg-background text-foreground">Draft</option>
                  <option value="active" className="bg-background text-foreground">Active</option>
                  <option value="archived" className="bg-background text-foreground">Archived</option>
                </select>
              </TableCell>
              <TableCell>৳{product.basePrice}</TableCell>
              <TableCell>
                <QuickStockEdit product={product} />
              </TableCell>
              <TableCell>{product.category?.name || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this product?")) {
                        await deleteProduct(product.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {initialProducts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No products found. Let&apos;s add some!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
