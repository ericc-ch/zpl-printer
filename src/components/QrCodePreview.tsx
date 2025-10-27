import { Card, CardContent } from "@/components/ui/card";

interface QrCodePreviewProps {
  qrCodeData: string | null;
  label1Data: string | null;
  label2Data: string | null;
}

export function QrCodePreview({ qrCodeData, label1Data, label2Data }: QrCodePreviewProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center p-6">
        <div className="flex space-x-4 overflow-hidden">
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center overflow-hidden">
            <p className="text-gray-500 truncate">{qrCodeData || "QR Code"}</p>
          </div>
          <div className="flex flex-col justify-between overflow-hidden">
            <p className="text-lg font-semibold truncate">{label1Data || "Label 1"}</p>
            <p className="text-lg truncate">{label2Data || "Label 2"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
