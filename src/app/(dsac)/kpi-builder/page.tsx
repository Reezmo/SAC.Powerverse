"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit2 } from "lucide-react";
import { FieldEditor } from "@/components/submit/FieldEditor";
import type { FieldDef } from "@/lib/types/schema";

export default function KPIBuilderPage() {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldDef | null>(null);

  function handleOpenNew() {
    setEditingField(null);
    setIsEditorOpen(true);
  }

  function handleOpenEdit(field: FieldDef) {
    setEditingField(field);
    setIsEditorOpen(true);
  }

  function handleSaveField(savedField: FieldDef) {
    setFields((prev) => {
      const exists = prev.some((f) => f.id === savedField.id);
      if (exists) {
        return prev.map((f) => (f.id === savedField.id ? savedField : f));
      }
      return [...prev, savedField];
    });
    setIsEditorOpen(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            KPI Form Builder
          </h2>
          <p className="text-sm text-muted-foreground">
            Define the structured data requirements for entity submissions.
          </p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No fields added yet. Click &quot;Add Field&quot; to start building
          your form schema.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <Card key={field.id} className="py-0">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">
                    {field.label}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({field.id})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {field.type}{" "}
                    {field.validation.required && "• Required"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(field)}
                >
                  <Edit2 className="h-4 w-4 mr-2" aria-hidden="true" /> Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isEditorOpen && (
        <FieldEditor
          key={editingField?.id ?? "new"}
          open={isEditorOpen}
          field={editingField}
          onSave={handleSaveField}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
