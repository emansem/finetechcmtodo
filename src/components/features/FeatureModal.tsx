import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FeatureTeam,
  FeaturePriority,
  FeatureStatus
} from "../../types/feature";
import { addFeature, updateFeature } from "../../store/featureSlice";
import { RootState } from "../../store";
import { featureService } from "../../utils/featureService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureModal = ({ isOpen, onClose }: FeatureModalProps) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { editingFeature, activeTeam } = useSelector(
    (state: RootState) => state.features
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as FeaturePriority,
    team: activeTeam as FeatureTeam,
    status: "todo" as FeatureStatus,
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        team: activeTeam,
        status: "todo",
        tags: []
      });
      setTagInput("");
    }
  }, [isOpen, activeTeam]);

  useEffect(() => {
    if (editingFeature) {
      setFormData({
        title: editingFeature.title,
        description: editingFeature.description,
        priority: editingFeature.priority,
        team: editingFeature.team,
        status: editingFeature.status,
        tags: editingFeature.tags || []
      });
    }
  }, [editingFeature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const featureData = {
        ...formData,
        createdBy: user.uid,
        createdAt: editingFeature?.createdAt || Date.now(),
        updatedAt: Date.now(),
        order: editingFeature?.order || Date.now()
      };

      if (editingFeature) {
        const updatedFeature = {
          ...featureData,
          id: editingFeature.id
        };
        await featureService.updateFeature(updatedFeature);
        dispatch(updateFeature(updatedFeature));
      } else {
        const newFeature = await featureService.addFeature(featureData);
        dispatch(addFeature(newFeature));
      }

      handleClose();
    } catch (error) {
      console.error("Error saving feature:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      team: activeTeam,
      status: "todo",
      tags: []
    });
    setTagInput("");
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          {editingFeature ? "Edit Feature" : "Add New Feature"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value
                }))
              }
              className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[150px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Team
              </label>
              <select
                value={formData.team}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    team: e.target.value as FeatureTeam
                  }))
                }
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as FeaturePriority
                  }))
                }
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Tags
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-md flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[var(--text-secondary)] hover:text-[var(--danger)]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Add a tag"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                Add Tag
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={
                isSubmitting || !formData.title || !formData.description
              }
            >
              {editingFeature ? "Update Feature" : "Add Feature"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FeatureModal;
