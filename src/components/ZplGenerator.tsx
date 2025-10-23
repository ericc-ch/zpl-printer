import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QrCodePreview } from './QrCodePreview';
import Papa from 'papaparse';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export function ZplGenerator() {
  const [csvData, setCsvData] = useState<{ headers: string[], rows: string[][] }>({ headers: [], rows: [] });
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

  const [columns, setColumns] = useState(3);
  const [stickerWidth, setStickerWidth] = useState(33);
  const [stickerHeight, setStickerHeight] = useState(15);
  const [horizontalGap, setHorizontalGap] = useState(2);
  const [verticalGap, setVerticalGap] = useState(3);

  const stickerStyles: React.CSSProperties = {
    width: `${stickerWidth}mm`,
    height: `${stickerHeight}mm`,
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, ${stickerWidth}mm)`,
    gap: `${verticalGap}mm ${horizontalGap}mm`,
    marginTop: '2rem',
  };

  const firstRow = csvData.rows[0];
  const qrCodeHeaderIndex = qrCodeColumn ? csvData.headers.indexOf(qrCodeColumn) : -1;
  const label1HeaderIndex = label1Column ? csvData.headers.indexOf(label1Column) : -1;
  const label2HeaderIndex = label2Column ? csvData.headers.indexOf(label2Column) : -1;

  const qrCodeData = (firstRow && qrCodeHeaderIndex !== -1 ? firstRow[qrCodeHeaderIndex] : null) ?? null;
  const label1Data = (firstRow && label1HeaderIndex !== -1 ? firstRow[label1HeaderIndex] : null) ?? null;
  const label2Data = (firstRow && label2HeaderIndex !== -1 ? firstRow[label2HeaderIndex] : null) ?? null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ZPL Generator</h1>
      <div>
        <Label htmlFor="csvFile">CSV File</Label>
        <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} />
      </div>
      <div className="grid grid-cols-3 gap-4 my-4">
        <div>
          <Label>QR Code Column</Label>
          <Select onValueChange={setQrCodeColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {csvData.headers.map((header) => (
                <SelectItem key={header} value={header}>{header}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Label 1 Column</Label>
          <Select onValueChange={setLabel1Column}>
            <SelectTrigger>
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {csvData.headers.map((header) => (
                <SelectItem key={header} value={header}>{header}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Label 2 Column</Label>
          <Select onValueChange={setLabel2Column}>
            <SelectTrigger>
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {csvData.headers.map((header) => (
                <SelectItem key={header} value={header}>{header}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <QrCodePreview qrCodeData={qrCodeData} label1Data={label1Data} label2Data={label2Data} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="columns">Columns</Label>
          <Input id="columns" type="number" value={columns} onChange={e => setColumns(parseInt(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="stickerWidth">Sticker Width (mm)</Label>
          <Input id="stickerWidth" type="number" value={stickerWidth} onChange={e => setStickerWidth(parseInt(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="stickerHeight">Sticker Height (mm)</Label>
          <Input id="stickerHeight" type="number" value={stickerHeight} onChange={e => setStickerHeight(parseInt(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="horizontalGap">Horizontal Gap (mm)</Label>
          <Input id="horizontalGap" type="number" value={horizontalGap} onChange={e => setHorizontalGap(parseInt(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="verticalGap">Vertical Gap (mm)</Label>
          <Input id="verticalGap" type="number" value={verticalGap} onChange={e => setVerticalGap(parseInt(e.target.value))} />
        </div>
      </div>

      <div style={gridStyles}>
        {Array.from({ length: columns * 3 }).map((_, i) => (
          <div key={i} style={stickerStyles} />
        ))}
      </div>
    </div>
  );
}
