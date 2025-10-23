import { ZplGenerator } from "./components/ZplGenerator";
import { PrinterSelect } from "./components/PrinterSelect";
import { Button } from "./components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { generateZpl, type LabelData } from "./lib/zpl/generator";
import Papa from "papaparse";
import "./index.css";

export function App() {
  const printMutation = useMutation({
    mutationFn: async ({ zpl, printer }: { zpl: string; printer: string }) => {
      const [hostname, shareName] = printer.split('\\\\')[1]?.split('\\') ?? [];
      
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: zpl,
          options: { hostname, shareName },
        }),
      });

      if (!response.ok) {
        throw new Error(`Print failed: ${response.statusText}`);
      }

      return response.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const printer = formData.get("printer") as string;
    const csvFile = formData.get("csvFile") as File | null;
    const qrCodeColumn = formData.get("qrCodeColumn") as string;
    const label1Column = formData.get("label1Column") as string;
    const label2Column = formData.get("label2Column") as string;
    const columns = parseInt(formData.get("columns") as string, 10);

    if (!csvFile) {
      alert("Please upload a CSV file");
      return;
    }

    if (!printer) {
      alert("Please select a printer");
      return;
    }

    if (!qrCodeColumn || !label1Column || !label2Column) {
      alert("Please select all required columns");
      return;
    }

    Papa.parse(csvFile, {
      complete: (results) => {
        const data = results.data as string[][];
        if (!data || data.length === 0) {
          alert("CSV file is empty");
          return;
        }

        const [headers, ...rows] = data;
        if (!headers) {
          alert("CSV headers not found");
          return;
        }

        const qrCodeIndex = headers.indexOf(qrCodeColumn);
        const label1Index = headers.indexOf(label1Column);
        const label2Index = headers.indexOf(label2Column);

        if (qrCodeIndex === -1 || label1Index === -1 || label2Index === -1) {
          alert("Selected columns not found in CSV");
          return;
        }

        const labels: LabelData[] = rows
          .filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''))
          .map(row => ({
            qrCode: row[qrCodeIndex] || '',
            line1: row[label1Index] || '',
            line2: row[label2Index] || '',
            line3: row[qrCodeIndex] || '',
          }));

        if (labels.length === 0) {
          alert("No valid data rows found in CSV");
          return;
        }

        const zpl = generateZpl({ labels, columns });
        printMutation.mutate({ zpl, printer });
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">ZPL Label Generator</h1>
      
      {printMutation.isSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
          Labels printed successfully!
        </div>
      )}
      
      {printMutation.isError && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          Error: {printMutation.error instanceof Error ? printMutation.error.message : 'Failed to print labels'}
        </div>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <PrinterSelect />
        <ZplGenerator />
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={printMutation.isPending}>
            {printMutation.isPending ? 'Printing...' : 'Generate & Print Labels'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default App;
