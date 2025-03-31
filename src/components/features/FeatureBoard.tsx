import { useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Feature, FeatureStatus } from "../../types/feature";
import {
  setFeatures,
  updateFeature,
  setModalOpen,
  setEditingFeature
} from "../../store/featureSlice";
import { RootState } from "../../store";
import { featureService } from "../../utils/featureService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Card from "../ui/Card";

const statusColumns: FeatureStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "completed"
];
const statusTitles = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  completed: "Completed"
};

const FeatureBoard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { features, activeTeam } = useSelector(
    (state: RootState) => state.features
  );

  useEffect(() => {
    const loadFeatures = async () => {
      if (!user) return;
      try {
        const fetchedFeatures = await featureService.getFeatures(activeTeam);
        dispatch(setFeatures({ team: activeTeam, features: fetchedFeatures }));
      } catch (error) {
        console.error("Error loading features:", error);
      }
    };
    loadFeatures();
  }, [dispatch, user, activeTeam]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId as FeatureStatus;
    const destStatus = destination.droppableId as FeatureStatus;

    const sourceFeatures = features[activeTeam].filter(
      (f) => f.status === sourceStatus
    );
    const feature = sourceFeatures[source.index];

    if (!feature) return;

    // Calculate new order
    const destFeatures = features[activeTeam].filter(
      (f) => f.status === destStatus
    );
    const newOrder = calculateNewOrder(destFeatures, destination.index);

    // Update feature status and order
    const updatedFeature: Feature = {
      ...feature,
      status: destStatus,
      order: newOrder
    };

    try {
      await featureService.updateFeature(updatedFeature);
      dispatch(updateFeature(updatedFeature));
    } catch (error) {
      console.error("Error updating feature:", error);
    }
  };

  const calculateNewOrder = (features: Feature[], index: number): number => {
    if (features.length === 0) return 1000;
    if (index === 0) return features[0].order / 2;
    if (index === features.length)
      return features[features.length - 1].order + 1000;
    return (features[index - 1].order + features[index].order) / 2;
  };

  const handleEditFeature = (feature: Feature) => {
    dispatch(setEditingFeature(feature));
    dispatch(setModalOpen(true));
  };

  const getPriorityColor = (priority: Feature["priority"]) => {
    switch (priority) {
      case "high":
        return "text-[var(--danger)]";
      case "medium":
        return "text-[var(--warning)]";
      case "low":
        return "text-[var(--success)]";
      default:
        return "text-[var(--text-secondary)]";
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {activeTeam === "frontend" ? "Frontend" : "Backend"} Features
          </h1>
        </div>
        <Button onClick={() => dispatch(setModalOpen(true))}>
          Add New Feature
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {statusColumns.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col h-full"
                >
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      {statusTitles[status]}
                    </h2>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {
                        features[activeTeam].filter((f) => f.status === status)
                          .length
                      }{" "}
                      items
                    </div>
                  </div>

                  <Card
                    className={`flex-1 overflow-y-auto p-4 ${
                      snapshot.isDraggingOver ? "bg-[var(--bg-hover)]" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      {features[activeTeam]
                        .filter((f) => f.status === status)
                        .sort((a, b) => a.order - b.order)
                        .map((feature, index) => (
                          <Draggable
                            key={feature.id}
                            draggableId={feature.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 rounded-lg border border-[var(--border-color)] ${
                                  snapshot.isDragging
                                    ? "bg-[var(--bg-secondary)] shadow-lg"
                                    : "bg-[var(--bg-card)]"
                                }`}
                                onClick={() => handleEditFeature(feature)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium text-[var(--text-primary)]">
                                    {feature.title}
                                  </h3>
                                  <span
                                    className={`text-sm ${getPriorityColor(
                                      feature.priority
                                    )}`}
                                  >
                                    {feature.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                                  {feature.description}
                                </p>
                                {feature.tags && feature.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {feature.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                    </div>
                    {provided.placeholder}
                  </Card>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default FeatureBoard;
