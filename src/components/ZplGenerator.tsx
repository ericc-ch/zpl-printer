import { useState } from "react";
import { QrCodePreview } from "./QrCodePreview";
import Papa from "papaparse";

export function ZplGenerator() {
  const [csvData, setCsvData] = useState<{
    headers: string[];
    rows: string[][];
  }>({ headers: [], rows: [] });
  const [qrCodeColumn, setQrCodeColumn] = useState<string | null>(null);
  const [label1Column, setLabel1Column] = useState<string | null>(null);
  const [label2Column, setLabel2Column] = useState<string | null>(null);
  const [label3Column, setLabel3Column] = useState<string | null>(null);

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
  const label3HeaderIndex = label3Column
    ? csvData.headers.indexOf(label3Column)
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
  const label3Data =
    (firstRow && label3HeaderIndex !== -1
      ? firstRow[label3HeaderIndex]
      : null) ?? null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Label Configuration</h2>
      <div>
        <label htmlFor="csvFile">CSV File</label>
        <input
          id="csvFile"
          name="csvFile"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 my-4">
        <div>
          <label>QR Code Column</label>
          <select name="qrCodeColumn" onChange={(e) => setQrCodeColumn(e.target.value)}>
            <option value="">Select a column</option>
            {csvData.headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Label 1 Column</label>
          <select name="label1Column" onChange={(e) => setLabel1Column(e.target.value)}>
            <option value="">Select a column</option>
            {csvData.headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Label 2 Column</label>
          <select name="label2Column" onChange={(e) => setLabel2Column(e.target.value)}>
            <option value="">Select a column</option>
            {csvData.headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Label 3 Column</label>
          <select name="label3Column" onChange={(e) => setLabel3Column(e.target.value)}>
            <option value="">Select a column</option>
            {csvData.headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
      </div>
      <QrCodePreview
        qrCodeData={qrCodeData}
        label1Data={label1Data}
        label2Data={label2Data}
        label3Data={label3Data}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="columns">Columns</label>
          <input
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
