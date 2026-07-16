"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Template } from "@prisma/client";

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (template: Template, isEdit?: boolean) => void;
  initialData?: Template | null;
}

export function TemplateDialog({ isOpen, onClose, onSuccess, initialData }: TemplateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || "",
        content: initialData.content || "",
      });
    } else if (!isOpen) {
      setFormData({ name: "", content: "" });
    }
  }, [initialData, isOpen]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = initialData ? `/api/templates/${initialData.id}` : "/api/templates";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save template");

      const template = await response.json();
      toast.success(initialData ? "Template updated successfully" : "Template created successfully");
      onSuccess(template, !!initialData);
      setFormData({ name: "", content: "" });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Template" : "Create Template"}</DialogTitle>
          <DialogDescription>
            You can use variables like {"{{name}}"} or {"{{firstname}}"} in your message content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Morning Greeting" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Message Content</Label>
            <textarea
              id="content"
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Good Morning, {{name}}! Have a great day!"
              required
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Saving..." : (initialData ? "Update Template" : "Save Template")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
