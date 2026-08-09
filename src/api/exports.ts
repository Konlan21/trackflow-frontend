import { apiClient } from "./client";

async function downloadFile(path: string, filename: string) {
  const res = await apiClient.get(path, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportCsv = () => downloadFile("/user/export/csv", "trackflow_transactions.csv");
export const exportPdf = () => downloadFile("/user/export/pdf", "trackflow_report.pdf");