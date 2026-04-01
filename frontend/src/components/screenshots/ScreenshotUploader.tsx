import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ScreenshotUploaderProps {
  featureId: string;
  onUploaded?: () => void;
}

export function ScreenshotUploader({ featureId, onUploaded }: ScreenshotUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type, setType] = useState<"before" | "after">("before");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) {
        handleFile(f);
      }
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      await api.uploadScreenshot(featureId, formData);
      setFile(null);
      setPreview(null);
      onUploaded?.();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Card title="Upload Screenshot">
      <div className="space-y-4">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            dragOver
              ? "border-primary bg-primary-light/50"
              : "border-border hover:border-primary/50",
            preview && "p-4"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative w-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg object-contain max-h-64"
              />
              <button
                onClick={clearFile}
                className="absolute -right-2 -top-2 rounded-full bg-white border border-border p-1 shadow-sm hover:bg-canvas transition-colors"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-text-tertiary mb-2" />
              <p className="text-sm text-text-secondary mb-1">
                Drag and drop an image, or{" "}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-primary font-medium hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-text-tertiary">
                PNG, JPG, WebP up to 10MB
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Select
              label="Screenshot Type"
              options={[
                { label: "Before", value: "before" },
                { label: "After", value: "after" },
              ]}
              value={type}
              onChange={(e) =>
                setType(e.target.value as "before" | "after")
              }
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={!file}
            loading={uploading}
          >
            <ImageIcon className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>
    </Card>
  );
}
