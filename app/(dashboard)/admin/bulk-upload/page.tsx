"use client";

import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Upload, AlertCircle, CheckCircle2, Download, FileSpreadsheet,
  Layers, Check, Loader2, Sparkles, RefreshCw, Eye, Info
} from "lucide-react";
import { GAME_FIELDS } from "@/lib/gameFields";

interface ParsedListing {
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  deliveryMethod: "automatic" | "manual" | "coordinate";
  deliveryTime: string;
  autoDeliveryData?: string;
  region?: string;
  rank?: string;
  customAttributes?: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export default function BulkUploadPage() {
  const games = useQuery(api.listings.getGames);
  const categories = useQuery(api.listings.getCategories);
  const bulkCreate = useMutation(api.admin.bulkCreateListings);

  const [gameId, setGameId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedListing[]>([]);
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedGame = useMemo(() => games?.find((g) => g._id === gameId), [games, gameId]);
  const selectedCategory = useMemo(() => categories?.find((c) => c._id === categoryId), [categories, categoryId]);

  // Download 10-Column CSV Template
  const download10ColTemplate = () => {
    const headers = [
      "Title",
      "Description",
      "Price",
      "ImageURLs",
      "DeliveryMethod",
      "DeliveryTime",
      "AutoDeliveryData",
      "Region",
      "Rank",
      "CustomAttributes",
    ];

    const sampleRow = [
      `"Level 100 Stacked ${selectedGame?.name || "Gaming"} Account"`,
      `"Full access with original email. Rare skins and high rank."`,
      "149.99",
      `"https://images.unsplash.com/photo-1542751371-adc38448a05e|https://images.unsplash.com/photo-1511512578047-dfb367046420"`,
      "automatic",
      "Instant",
      `"username:demo_user|password:SecretPass123"`,
      "Global",
      "Mythic / Diamond",
      `"level=100;gems=2500;verified=true"`,
    ];

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + sampleRow.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedGame?.slug || "igmart"}-10col-template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV parser supporting quotes, commas, and line breaks
  const parseCSV = (text: string): ParsedListing[] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && text[i + 1] === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== "")) rows.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== "")) rows.push(currentRow);
    }

    if (rows.length < 2) return [];

    // Header index map
    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const dataRows = rows.slice(1);

    const getCol = (row: string[], colNames: string[], def = "") => {
      for (const name of colNames) {
        const idx = headers.indexOf(name);
        if (idx !== -1 && row[idx] !== undefined) return row[idx].trim();
      }
      return def;
    };

    return dataRows.map((row) => {
      const errors: string[] = [];
      const title = getCol(row, ["title", "name", "itemtitle"], row[0] || "");
      const description = getCol(row, ["description", "desc", "details"], row[1] || "");
      const rawPrice = getCol(row, ["price", "cost", "amount"], row[2] || "0");
      const rawImages = getCol(row, ["imageurls", "images", "imageurl", "photos"], row[3] || "");
      const rawDeliveryMethod = getCol(row, ["deliverymethod", "delivery", "method"], row[4] || "manual").toLowerCase();
      const deliveryTime = getCol(row, ["deliverytime", "time"], row[5] || "24 hours");
      const autoDeliveryData = getCol(row, ["autodeliverydata", "credentials", "accountdata", "autodata"], row[6] || "");
      const region = getCol(row, ["region", "server", "location"], row[7] || "");
      const rank = getCol(row, ["rank", "tier", "level"], row[8] || "");
      const rawAttributes = getCol(row, ["customattributes", "attributes", "extra"], row[9] || "");

      if (!title) errors.push("Title is required");
      if (!description) errors.push("Description is required");
      const price = parseFloat(rawPrice.replace(/[^0-9.]/g, ""));
      if (isNaN(price) || price <= 0) errors.push("Valid price is required");

      const deliveryMethod =
        rawDeliveryMethod.includes("auto")
          ? "automatic"
          : rawDeliveryMethod.includes("coord")
          ? "coordinate"
          : "manual";

      // Parse images (separated by comma, pipe, or space)
      const imageUrls = rawImages
        ? rawImages.split(/[|,;\s]+/).map((u) => u.trim()).filter((u) => u.startsWith("http"))
        : [];

      // Parse custom attributes: "level=100;gems=2500" or JSON
      let customAttributes: Record<string, any> = {};
      if (rawAttributes) {
        try {
          if (rawAttributes.startsWith("{")) {
            customAttributes = JSON.parse(rawAttributes);
          } else {
            rawAttributes.split(";").forEach((pair) => {
              const [k, v] = pair.split("=");
              if (k && v) customAttributes[k.trim()] = v.trim();
            });
          }
        } catch {
          // ignore attribute parsing errors
        }
      }
      if (region) customAttributes.region = region;
      if (rank) customAttributes.rank = rank;

      return {
        title,
        description,
        price: isNaN(price) ? 0 : price,
        imageUrls: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1542751371-adc38448a05e"],
        deliveryMethod,
        deliveryTime,
        autoDeliveryData: autoDeliveryData || undefined,
        region,
        rank,
        customAttributes,
        isValid: errors.length === 0,
        errors,
      };
    });
  };

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      setFeedback({ type: "error", msg: "Please select a valid CSV file." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      const parsed = parseCSV(text);
      setParsedRows(parsed);
      setFeedback(null);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    const parsed = parseCSV(text);
    setParsedRows(parsed);
  };

  const handleExecuteUpload = async () => {
    if (!gameId || !categoryId) {
      setFeedback({ type: "error", msg: "Please select a Game and Category before uploading." });
      return;
    }

    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setFeedback({ type: "error", msg: "No valid rows found in the CSV. Please check your data." });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setFeedback(null);

    try {
      // Chunk uploads in batches of 25 for maximum stability
      const BATCH_SIZE = 25;
      let uploadedTotal = 0;

      for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
        const chunk = validRows.slice(i, i + BATCH_SIZE);
        const payload = chunk.map((r) => ({
          title: r.title,
          description: r.description,
          price: r.price,
          gameId: gameId as Id<"games">,
          categoryId: categoryId as Id<"categories">,
          deliveryMethod: r.deliveryMethod,
          deliveryTime: r.deliveryTime || "24 hours",
          autoDeliveryData: r.autoDeliveryData,
          images: r.imageUrls,
          attributes: r.customAttributes,
          isSeeded: false,
        }));

        await bulkCreate({ listings: payload });
        uploadedTotal += chunk.length;
        setUploadProgress(Math.round((uploadedTotal / validRows.length) * 100));
      }

      setFeedback({
        type: "success",
        msg: `Successfully imported ${uploadedTotal} listings to ${selectedGame?.name || "the catalog"}!`,
      });
      setCsvText("");
      setParsedRows([]);
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err?.message || "Failed to bulk upload listings. Please check server logs.",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              Staff Portal
            </span>
            <span className="text-[10px] bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-md border border-accent/20">
              10-Column CSV Plan
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text mt-1.5 flex items-center gap-2.5">
            <FileSpreadsheet className="text-primary" size={28} /> Bulk Listing Importer
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Upload dozens or hundreds of accounts and items instantly using a standardized 10-column spreadsheet.
          </p>
        </div>

        <button
          type="button"
          onClick={download10ColTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-text font-bold text-sm hover:bg-elevated hover:border-primary/40 transition-all shadow-sm"
        >
          <Download size={16} className="text-primary" />
          Download 10-Col Template
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-semibold border ${
            feedback.type === "success"
              ? "bg-success/10 text-success border-success/20"
              : "bg-danger/10 text-danger border-danger/20"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Target Game & Category Selector */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Layers size={18} className="text-primary" />
          <h2 className="font-heading font-bold text-base text-text">1. Select Target Category & Game</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Target Game *</label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-text font-semibold focus:outline-none focus:border-primary/60 transition-colors"
            >
              <option value="">-- Choose a Game --</option>
              {games?.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Target Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-text font-semibold focus:outline-none focus:border-primary/60 transition-colors"
            >
              <option value="">-- Choose Category --</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 10 Columns Info Pill */}
        <div className="bg-elevated/60 border border-border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Info size={16} className="text-primary flex-shrink-0" />
            <span>
              <strong>10 Standard Columns:</strong> Title, Description, Price, ImageURLs, DeliveryMethod, DeliveryTime, AutoDeliveryData, Region, Rank, CustomAttributes
            </span>
          </div>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
            Auto-detected
          </span>
        </div>
      </div>

      {/* CSV Source Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-primary" />
            <h2 className="font-heading font-bold text-base text-text">2. Upload CSV File or Paste Raw Text</h2>
          </div>
          <div className="flex bg-elevated p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === "upload" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"
              }`}
            >
              Drag & Drop File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === "paste" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {activeTab === "upload" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border hover:border-primary/40 bg-background hover:bg-elevated/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center pointer-events-none">
              <Upload size={26} />
            </div>
            <div className="text-center pointer-events-none">
              <p className="font-heading font-bold text-base text-text">
                Drop your 10-column CSV file here, or <span className="text-primary">browse files</span>
              </p>
              <p className="text-xs text-text-muted mt-1">Supports UTF-8 CSV exports from Excel, Google Sheets, or Numbers</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Title,Description,Price,ImageURLs,DeliveryMethod,DeliveryTime,AutoDeliveryData,Region,Rank,CustomAttributes\n"Account Title","Description here",99.99,"https://image.url",automatic,Instant,"user:pass",Global,Champion,"thLevel=16"`}
              className="w-full bg-background border border-border rounded-xl p-4 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        )}
      </div>

      {/* CSV Preview & Confirmation Table */}
      {parsedRows.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Eye size={18} className="text-primary" />
              <h2 className="font-heading font-bold text-base text-text">
                3. Preview & Validation ({parsedRows.length} rows)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-success/10 text-success border border-success/20 font-bold px-2.5 py-1 rounded-lg">
                ✓ {validCount} Valid
              </span>
              {invalidCount > 0 && (
                <span className="bg-danger/10 text-danger border border-danger/20 font-bold px-2.5 py-1 rounded-lg">
                  ✕ {invalidCount} Errors
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-elevated/70 text-text-muted font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Delivery</th>
                  <th className="py-3 px-4">Images</th>
                  <th className="py-3 px-4">Region/Rank</th>
                  <th className="py-3 px-4">Attributes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {parsedRows.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className={row.isValid ? "hover:bg-elevated/30" : "bg-danger/5"}>
                    <td className="py-3 px-4 text-text-muted font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md">
                          <Check size={12} /> Ready
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-md"
                          title={row.errors.join(", ")}
                        >
                          <AlertCircle size={12} /> {row.errors[0]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-text max-w-[220px] truncate">{row.title}</td>
                    <td className="py-3 px-4 font-bold text-text">${row.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize bg-elevated px-2 py-0.5 rounded border border-border text-[11px]">
                        {row.deliveryMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted">{row.imageUrls.length} imgs</td>
                    <td className="py-3 px-4 text-text-muted">{row.region || row.rank || "—"}</td>
                    <td className="py-3 px-4 text-text-muted font-mono text-[10px] max-w-[140px] truncate">
                      {Object.keys(row.customAttributes || {}).length > 0
                        ? JSON.stringify(row.customAttributes)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedRows.length > 50 && (
            <p className="text-center text-xs text-text-muted">
              Showing first 50 of {parsedRows.length} rows. All {validCount} valid rows will be uploaded.
            </p>
          )}

          {/* Upload Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
            <div className="text-xs text-text-muted">
              Ready to import to <strong>{selectedGame?.name || "selected game"}</strong> under{" "}
              <strong>{selectedCategory?.name || "selected category"}</strong>.
            </div>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={isProcessing || validCount === 0 || !gameId || !categoryId}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-heading font-black text-sm text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: "var(--gradient-brand)" }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Importing... {uploadProgress !== null ? `${uploadProgress}%` : ""}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Publish {validCount} Listings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
