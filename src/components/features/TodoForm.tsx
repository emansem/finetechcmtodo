import { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { todoService } from "../../utils/todoService";
import { addTodo, setError } from "../../store/todoSlice";
import Button from "../ui/Button";
import Card from "../ui/Card";

const TodoForm = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "frontend" | "backend" | "feature" | "bug"
  >("feature");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const newTodo = await todoService.addTodo({
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: Date.now(),
        userId: user.uid,
        category,
        priority
      });
      dispatch(addTodo(newTodo));
      setTitle("");
      setDescription("");
      setCategory("feature");
      setPriority("medium");
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "Failed to add todo")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            required
          />
        </div>
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px]"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="feature">Feature</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="bug">Bug</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          isLoading={isSubmitting}
          fullWidth
        >
          Add Todo
        </Button>
      </form>
    </Card>
  );
};

export default TodoForm;
