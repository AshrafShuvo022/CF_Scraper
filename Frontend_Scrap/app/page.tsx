// ✅ Next.js 14 + TypeScript + Tailwind CSS (with Confirm Modal and Preview Table)
"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

export default function Home() {
  const [division, setDivision] = useState("div. 2");
  const [index, setIndex] = useState("A");
  const [days, setDays] = useState("365");
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // For long loading warning
  const [longLoading, setLongLoading] = useState(false);

  // For persistent download success message
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  // Submit handler for the download button
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[a-zA-Z]$/.test(index)) {
      setError("❗ Index must be a single letter like A, B, C");
      return;
    }
    if (isNaN(Number(days)) || Number(days) <= 0) {
      setError("❗ Days must be a positive number");
      return;
    }

    setShowConfirm(true);
  };

  // Fetch preview data (for the preview table)
  const fetchPreview = async () => {
    setPreviewLoading(true);
    setError("");

    const query = new URLSearchParams({
      division,
      index: index.toUpperCase(),
      days,
    });

    try {
      const res = await fetch(`https://cf-scraper-v3fp.onrender.com/preview_csv?${query.toString()}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setPreviewData([]);
      } else {
        setPreviewData(data.data || []);
      }
    } catch (err) {
      setError("❌ Failed to fetch preview data");
      setPreviewData([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download CSV file
  const downloadCSV = async () => {
    setShowConfirm(false);
    setDownloadLoading(true);

    // Show info toast when download starts
    toast.info("Preparing your CSV file. Please wait...");

    const query = new URLSearchParams({
      division,
      index: index.toUpperCase(),
      days,
    });
    const url = `https://cf-scraper-v3fp.onrender.com/download_csv?${query.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        toast.error("❌ Backend responded with error");
        throw new Error(`Failed response: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const fileName = `cf_${division.replace(/\s/g, "")}_problem_${index.toLowerCase()}.csv`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("✅ File downloaded successfully!");
      setShowDownloadSuccess(true); // Show persistent message
    } catch (error) {
      console.error("Download error:", error);
      toast.error("❌ Something went wrong while downloading the file.");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Long loading warning effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (previewLoading) {
      timer = setTimeout(() => setLongLoading(true), 5000);
    } else {
      setLongLoading(false);
    }
    return () => clearTimeout(timer);
  }, [previewLoading]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-start p-4 transition-colors duration-300 ${
        dark
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-tr from-purple-50 via-white to-blue-100 text-gray-800"
      } overflow-y-auto`}
    >
      <Toaster position="top-center" />

      <button
        onClick={() => setDark(!dark)}
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        {dark ? "☀ Light" : "🌙 Dark"}
      </button>

      <h2 className="text-4xl font-extrabold text-center mb-6 text-black dark:text-white">
        🧠 Recent Codeforces Contest Problems Scraper
      </h2>

      <form
        onSubmit={handleSubmit}
        className={`bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6 border border-gray-200 dark:border-gray-600 ${
          previewLoading || downloadLoading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <h1 className="text-2xl font-extrabold text-center text-black dark:text-white">
          Codeforces CSV Downloader
        </h1>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-white">Division</label>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          >
            <option value="div. 1">Div. 1</option>
            <option value="div. 2">Div. 2</option>
            <option value="div. 3">Div. 3</option>
            <option value="div. 4">Div. 4</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-white">Problem Index</label>
          <input
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            placeholder="e.g., A"
            className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-white">Days Back</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <p className="text-center text-xs text-gray-600 dark:text-gray-400">
          📁 File: cf_{division.replace(/\s/g, "")}_problem_{index.toLowerCase()}.csv
        </p>

        {/* Button to Load Preview */}
        <button
          type="button"
          onClick={fetchPreview}
          className="w-full flex justify-center items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          disabled={previewLoading}
        >
          {previewLoading ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          ) : (
            "Load Preview"
          )}
        </button>

        {/* Button to Download CSV */}
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          disabled={downloadLoading}
        >
          {downloadLoading ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          ) : (
            "Download CSV"
          )}
        </button>
      </form>

      {/* Progress bar for download loading */}
      {downloadLoading && (
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 mb-2">
          <div className="h-1 bg-blue-500 animate-pulse w-full"></div>
        </div>
      )}

      {/* Wait message for download loading */}
      {downloadLoading && (
        <div className="text-center text-blue-600 dark:text-blue-400 mb-2">
          Preparing your CSV file. Please wait...
        </div>
      )}

      <div className="w-full max-w-5xl mt-12">
        <h3 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
          📊 Sample CSV Preview Table
        </h3>

        {/* Progress bar for preview loading */}
        {previewLoading && (
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 mb-2">
            <div className="h-1 bg-purple-500 animate-pulse w-full"></div>
          </div>
        )}

        {/* Long loading warning */}
        {longLoading && (
          <div className="text-center text-yellow-600 dark:text-yellow-400 mb-2">
            This may take a while. Please wait...
          </div>
        )}

        <div className="w-full">
          <table className="min-w-full w-full table-fixed bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md">
            <thead>
              <tr className="bg-indigo-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white text-left">
                <th className="p-3 w-1/4">Contest Name</th>
                <th className="p-3 w-1/4">Problem Name</th>
                <th className="p-3 w-1/12">Rating</th>
                <th className="p-3 w-1/4">Tags</th>
                <th className="p-3 w-1/6">Link</th>
              </tr>
            </thead>
            <tbody>
              {previewLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-300">
                    Loading...
                  </td>
                </tr>
              ) : previewData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-300">
                    No data found.
                  </td>
                </tr>
              ) : (
                previewData.map((p, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
                    <td className="p-3 truncate max-w-xs">{p.contest_name}</td>
                    <td className="p-3 truncate max-w-xs">{p.problem_name}</td>
                    <td className="p-3">{p.rating}</td>
                    <td className="p-3 text-sm break-words max-w-xs">{p.tags}</td>
                    <td className="p-3 text-blue-600 dark:text-blue-400 underline">
                      <a href={p.link} target="_blank" rel="noopener noreferrer">Link</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent download success message */}
      {showDownloadSuccess && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <span className="text-xl">✅</span>
            <span>Your CSV file has been downloaded!</span>
            <button
              onClick={() => setShowDownloadSuccess(false)}
              className="ml-4 px-2 py-1 rounded bg-green-800 hover:bg-green-700 text-white text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Confirm Download</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to download the CSV for <b>{division}</b> / Problem <b>{index.toUpperCase()}</b> within the last <b>{days}</b> days?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded dark:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={downloadCSV}
                className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
