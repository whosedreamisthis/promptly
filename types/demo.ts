export interface DemoResponse {
  success: boolean;
  data: { token: string } | null;
  error: string | null;
}
