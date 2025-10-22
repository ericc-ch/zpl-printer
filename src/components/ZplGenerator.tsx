import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ZplGenerator() {
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ZPL Generator</h1>
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
