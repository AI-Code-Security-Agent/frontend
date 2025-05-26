export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  content: T | null;
}
