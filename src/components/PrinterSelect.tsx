import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/rpc/client";

export function PrinterSelect() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["printers"],
    queryFn: async () => {
      const res = await apiClient("/api/printers", {
        method: "GET",
      });
      return res.data;
    },
  });

  const printers = data?.printers;

  return (
    <div className="space-y-2">
      <Label htmlFor="printer-select">Printer</Label>
      <Select name="printer" disabled={isPending || isError}>
        <SelectTrigger id="printer-select">
          <SelectValue placeholder={isPending ? "Loading printers..." : isError ? "Error loading printers" : "Select a printer"} />
        </SelectTrigger>
        <SelectContent>
          {printers && printers.length > 0 ? (
            printers.map((printer) => (
              <SelectItem key={printer.name} value={printer.name}>
                {printer.name} {printer.isDefault ? "(Default)" : ""}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No printers found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {isError && (
        <p className="text-sm text-red-600">
          Failed to load printers: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}
    </div>
  );
}
