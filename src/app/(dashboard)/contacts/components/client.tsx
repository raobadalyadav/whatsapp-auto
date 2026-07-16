"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Loader2, Edit2, Trash2 } from "lucide-react";
import { Contact } from "@prisma/client";
import { useState, useRef } from "react";
import { ContactDialog } from "./contact-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ContactsClientProps {
  data: Contact[];
}

export function ContactsClient({ data: initialData }: ContactsClientProps) {
  const router = useRouter();
  const [data, setData] = useState<Contact[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('first'));
        let phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
        let tagsIdx = headers.findIndex(h => h.includes('tag'));

        if (nameIdx === -1) nameIdx = 0;
        if (phoneIdx === -1) phoneIdx = 1;

        const parsedContacts = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(s => s?.trim());
          const name = cols[nameIdx];
          const phone = cols[phoneIdx];
          const tags = tagsIdx !== -1 && cols[tagsIdx] ? cols[tagsIdx] : "CSV Import";
          
          if (name && phone) {
            parsedContacts.push({ name, phone, tags });
          }
        }

        if (parsedContacts.length === 0) {
          toast.error("No valid contacts found in CSV");
          return;
        }

        const response = await fetch("/api/contacts/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: parsedContacts }),
        });

        if (!response.ok) throw new Error("Failed to upload contacts");

        toast.success(`Successfully imported ${parsedContacts.length} contacts!`);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Failed to parse or upload CSV");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contact");

      toast.success("Contact deleted");
      setData((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingContact(null);
    setIsDialogOpen(true);
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <ContactDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        initialData={editingContact}
        onSuccess={(contact, isEdit) => {
          if (isEdit) {
            setData((prev) => prev.map((c) => c.id === contact.id ? contact : c));
          } else {
            setData((prev) => [contact, ...prev]);
          }
          setIsDialogOpen(false);
          router.refresh();
        }}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Contacts</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import CSV
          </Button>
          <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
      </div>
      
      <Card className="mt-4 border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle>Manage Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No contacts found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>
                      {contact.tags ? (
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                          {contact.tags}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(contact.createdAt).toISOString().split('T')[0]}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(contact)}>
                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
