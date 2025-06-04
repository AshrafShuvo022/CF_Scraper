// ✅ Next.js 14 + TypeScript + Tailwind CSS (with Confirm Modal and Preview Table)
"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

export default function Home() {
  const [division, setDivision] = useState("div. 2");
  const [index, setIndex] = useState("A");
  const [days, setDays] = useState("365");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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

  const downloadCSV = async () => {
    setShowConfirm(false);
    setLoading(true);

    const query = new URLSearchParams({
      division,
      index: index.toUpperCase(),
      days,
    });
    const url = `https://cf-scraper-v3fp.onrender.com/download_csv?${query.toString()}`;

    try {
const response = await fetch(url);
if (!response.ok) throw new Error("Failed to download file");

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
    } catch (error) {
      toast.error("❌ Failed to download CSV");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
        dark
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-tr from-purple-50 via-white to-blue-100 text-gray-800"
      }`}
    >
      <Toaster position="top-center" />

      <button
        onClick={() => setDark(!dark)}
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        {dark ? "☀ Light" : "🌙 Dark"}
      </button>

      <h2 className="text-4xl font-extrabold text-center mb-6 text-black dark:text-blue-700">
       🧠 Recent Codeforces Contest Problems Scraper
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6 border border-gray-200 dark:border-gray-600"
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

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          ) : (
            "Download CSV"
          )}
        </button>
      </form>

      <div className="w-full max-w-5xl mt-12">
        <h3 className="text-2xl font-bold mb-4 text-center text-black dark:text-blue-700">
          📊 Sample CSV Preview Table
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md">
            <thead>
              <tr className="bg-indigo-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white text-left">
                <th className="p-3">Contest Name</th>
                <th className="p-3">Problem Name</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Tags</th>
                <th className="p-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  contest_name: "Educational Codeforces Round 179 (Rated for Div. 2)",
                  problem_name: "Energy Crystals",
                  rating: "N/A",
                  tags: "greedy, implementation, math",
                  link: "https://codeforces.com/contest/2111/problem/A",
                },
                {
                  contest_name: "Codeforces Round 1028 (Div. 2)",
                  problem_name: "Gellyfish and Tricolor Pansy",
                  rating: "N/A",
                  tags: "games, greedy",
                  link: "https://codeforces.com/contest/2116/problem/A",
                },
                {
                  contest_name: "Codeforces Round 1026 (Div. 2)",
                  problem_name: "Fashionable Array",
                  rating: "800",
                  tags: "implementation, sortings",
                  link: "https://codeforces.com/contest/2110/problem/A",
                },
              ].map((p, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
                  <td className="p-3 whitespace-nowrap">{p.contest_name}</td>
                  <td className="p-3 whitespace-nowrap">{p.problem_name}</td>
                  <td className="p-3">{p.rating}</td>
                  <td className="p-3 text-sm">{p.tags}</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 underline"><a href={p.link} target="_blank">Link</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
