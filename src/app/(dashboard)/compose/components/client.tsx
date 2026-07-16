"use client";

import { useState, useMemo } from "react";
import { Contact, Template } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Clock, CheckSquare, Square, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComposeClientProps {
  contacts: Contact[];
  templates: Template[];
}

export function ComposeClient({ contacts, templates }: ComposeClientProps) {
  const router = useRouter();
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [sendAt, setSendAt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const lowerQuery = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.phone.toLowerCase().includes(lowerQuery) ||
      (c.tags && c.tags.toLowerCase().includes(lowerQuery))
    );
  }, [contacts, searchQuery]);

  const toggleContact = (id: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleSchedule = async (isSendNow: boolean) => {
    if (selectedContacts.size === 0) {
      return toast.error("Please select at least one contact");
    }
    if (!selectedTemplate) {
      return toast.error("Please select a template");
    }
    
    let sendTime = sendAt;
    if (isSendNow) {
      sendTime = new Date().toISOString();
    } else if (!sendAt) {
      return toast.error("Please specify a time to schedule");
    } else {
      sendTime = new Date(sendAt).toISOString();
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          contactIds: Array.from(selectedContacts),
          sendAt: sendTime,
        }),
      });

      if (!response.ok) throw new Error("Failed to schedule");
      
      toast.success(isSendNow ? "Message queued for sending!" : "Message scheduled successfully!");
      
      if (isSendNow) {
        // Kick off the background worker immediately for "Send Now"
        fetch("/api/cron").catch(console.error);
      }

      router.push("/schedules");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-primary mb-6">Compose Message</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border flex flex-col h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>1. Select Recipients</CardTitle>
                <CardDescription>{selectedContacts.size} of {contacts.length} selected</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                className="h-8 text-xs"
              >
                {selectedContacts.size === filteredContacts.length && filteredContacts.length > 0 ? (
                  <><Square className="w-3 h-3 mr-1" /> Deselect All</>
                ) : (
                  <><CheckSquare className="w-3 h-3 mr-1" /> Select All</>
                )}
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search contacts by name, phone or tag..."
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 max-h-[500px] overflow-y-auto space-y-2 pr-2">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => toggleContact(contact.id)}
                className={`p-3 rounded-md border cursor-pointer transition-all flex items-center justify-between ${selectedContacts.has(contact.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              >
                <div>
                  <div className="font-medium text-sm">{contact.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{contact.phone}</div>
                </div>
                {contact.tags && (
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    {contact.tags}
                  </span>
                )}
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <div className="text-sm text-center py-8 text-muted-foreground">
                {searchQuery ? "No contacts match your search." : "No contacts available."}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>2. Select Template</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">-- Choose a template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {selectedTemplate && (
                <div className="mt-4 p-4 rounded-md bg-secondary/50 border border-border text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                  {templates.find(t => t.id === selectedTemplate)?.content}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>3. Schedule & Send</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Schedule For Later (Optional)</Label>
                <Input 
                  type="datetime-local" 
                  value={sendAt}
                  onChange={(e) => setSendAt(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  className="w-full sm:w-1/2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11" 
                  onClick={() => handleSchedule(false)}
                  disabled={isSubmitting || !sendAt}
                >
                  <Clock className="w-4 h-4 mr-2" /> Schedule
                </Button>
                <Button 
                  className="w-full sm:w-1/2 bg-primary text-primary-foreground hover:bg-primary/90 h-11" 
                  onClick={() => handleSchedule(true)}
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" /> Send Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
