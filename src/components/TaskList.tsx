
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const TaskList = ({ tasks, onDeleteTask, onToggleComplete }: TaskListProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 hover:bg-red-600";
      case "medium":
        return "bg-amber-500 hover:bg-amber-600";
      case "low":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-slate-500 hover:bg-slate-600";
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No tasks yet. Add a task to get started!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={cn(
            "p-4 rounded-lg border transition-all duration-300 bg-background",
            task.completed && "bg-muted/50"
          )}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3
                  className={cn(
                    "text-lg font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDeleteTask(task.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {task.description && (
                <p
                  className={cn(
                    "mt-1 text-muted-foreground text-sm",
                    task.completed && "line-through"
                  )}
                >
                  {task.description}
                </p>
              )}
              
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                  </div>
                )}
                
                {task.category && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>{task.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
