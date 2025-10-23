import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QrCodePreview } from "./QrCodePreview";
import Papa from "papaparse";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ZplGenerator() {
  const [csvData, setCsvData] = useState<{
    headers: string[];
    rows: string[][];
  }>({ headers: [], rows: [] });
  const [qrCodeColumn, setQrCodeColumn] = useState<string | null>(null);
  const [label1Column, setLabel1Column] = useState<string | null>(null);
  const [label2Column, setLabel2Column] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data as string[][];
          if (data && data.length > 0) {
            const [headers, ...rows] = data;
            setCsvData({ headers: headers || [], rows });
          } else {
            setCsvData({ headers: [], rows: [] });
          }
        },
      });
    }
  };



  const firstRow = csvData.rows[0];
  const qrCodeHeaderIndex = qrCodeColumn
    ? csvData.headers.indexOf(qrCodeColumn)
    : -1;
  const label1HeaderIndex = label1Column
    ? csvData.headers.indexOf(label1Column)
    : -1;
  const label2HeaderIndex = label2Column
    ? csvData.headers.indexOf(label2Column)
    : -1;

  const qrCodeData =
    (firstRow && qrCodeHeaderIndex !== -1
      ? firstRow[qrCodeHeaderIndex]
      : null) ?? null;
  const label1Data =
    (firstRow && label1HeaderIndex !== -1
      ? firstRow[label1HeaderIndex]
      : null) ?? null;
  const label2Data =
    (firstRow && label2HeaderIndex !== -1
      ? firstRow[label2HeaderIndex]
      : null) ?? null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Label Configuration</h2>
      <div>
        <Label htmlFor="csvFile">CSV File</Label>
        <Input
          id="csvFile"
          name="csvFile"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 my-4">
        <div>
          <Label>QR Code Column</Label>
          <Select name="qrCodeColumn" onValueChange={setQrCodeColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {csvData.headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Label 1 Column</Label>
          <Select name="label1Column" onValueChange={setLabel1Column}>
            <SelectTrigger>
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {csvData.headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Label 2 Column</Label>
          <Select name="label2Column" onValueChange={setLabel2Column}>
            <SelectTrigger>
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {csvData.headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <QrCodePreview
        qrCodeData={qrCodeData}
        label1Data={label1Data}
        label2Data={label2Data}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="columns">Columns</Label>
          <Input
            id="columns"
            name="columns"
            type="number"
            defaultValue={3}
          />
        </div>
      </div>
    </div>
  );
}
