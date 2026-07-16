"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, MessageSquare, Edit2, Trash2 } from "lucide-react";
import { Template } from "@prisma/client";
import { useState } from "react";
import { TemplateDialog } from "./template-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TemplatesClientProps {
  data: Template[];
}

export function TemplatesClient({ data: initialData }: TemplatesClientProps) {
  const router = useRouter();
  const [data, setData] = useState<Template[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete template");

      toast.success("Template deleted");
      setData((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const openEdit = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  return (
    <>
      <TemplateDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        initialData={editingTemplate}
        onSuccess={(template, isEdit) => {
          if (isEdit) {
            setData((prev) => prev.map((t) => t.id === template.id ? template : t));
          } else {
            setData((prev) => [template, ...prev]);
          }
          setIsDialogOpen(false);
          router.refresh();
        }}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Templates</h2>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {data.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            No templates found. Create one to get started.
          </div>
        ) : (
          data.map((template) => (
            <Card key={template.id} className="bg-card border-border hover:border-primary/50 transition-all">
              <CardHeader className="relative pr-14">
                <CardTitle className="truncate">{template.name}</CardTitle>
                <CardDescription>Created on {new Date(template.createdAt).toISOString().split('T')[0]}</CardDescription>
                <div className="absolute top-4 right-4 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => openEdit(template, e)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDelete(template.id, e)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {template.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
