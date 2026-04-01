import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeatureDetail } from "@/components/features/FeatureDetail";
import { useFeature, useFeatures } from "@/hooks/useFeatures";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { feature, loading, error } = useFeature(id!);
  const { deleteFeature } = useFeatures();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFeature(id!);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete feature:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-border" />
        <div className="h-6 w-96 animate-pulse rounded-lg bg-border" />
        <div className="h-40 animate-pulse rounded-xl border border-border bg-white" />
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-danger mb-4">{error || "Feature not found"}</p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Features
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/features/new?edit=${id}`)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <FeatureDetail feature={feature} />

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Feature"
      >
        <div>
          <p className="text-sm text-text-secondary mb-4">
            Are you sure you want to delete <strong>{feature.name}</strong>? This
            action cannot be undone and will remove all associated metrics,
            screenshots, and analysis data.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Feature
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
