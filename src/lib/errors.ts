import { toast } from "sonner";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function handleApiError(error: unknown) {
  let message = "Something went wrong. Please try again.";

  if (error instanceof AppError) {
    message = error.message;
  } else if (error instanceof Error) {
    // Only log the actual error for debugging, don't show it to the user unless it's a known safe error
    console.error("Caught Error:", error);
    if (error.message.includes("fetch")) {
      message = "Network error. Please check your connection.";
    }
  } else {
    console.error("Unknown error:", error);
  }

  toast.error(message);
}
