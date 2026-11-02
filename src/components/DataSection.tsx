import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  Download,
  Database,
  Filter,
  Search,
  CheckSquare,
  Square,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { PatientRecord, CalculatedKPIs } from '../types';
import { SAMPLE_PATIENT_RECORDS, CSV_HEADERS } from '../data/sampleDataset';

interface DataSectionProps {
  records: PatientRecord[];
  selectedIds: Set<string>;
  onSelectIdsChange: (newSet: Set<string>) => void;
  onRecordsChange: (newRecords: PatientRecord[]) => void;
  kpis: CalculatedKPIs;
}

export const DataSection: React.FC<DataSectionProps> = ({
  records,
  selectedIds,
  onSelectIdsChange,
  onRecordsChange,
  kpis,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDistinctView, setShowDistinctView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const parsedRecords: PatientRecord[] = results.data.map((row: any, idx: number) => ({
            id: row.id || row.Patient_ID || `PT-${1000 + idx + 1}`,
            Patient_Persona: row.Patient_Persona || row.Persona || 'General Patient',
            Age_Group: row.Age_Group || row.Age || '18-50',
            Visit_Type: row.Visit_Type || 'Outpatient',
            Service_Line: row.Service_Line || 'General Medicine',
            Year: parseInt(row.Year, 10) || 2025,
            Patient_Satisfaction: Math.min(5, Math.max(1, parseFloat(row.Patient_Satisfaction) || 3)),
            Communication_Rating: Math.min(5, Math.max(1, parseFloat(row.Communication_Rating) || 3)),
            Followup_Compliance: parseInt(row.Followup_Compliance, 10) === 1 ? 1 : 0,
            Portal_Usage: parseInt(row.Portal_Usage, 10) === 1 ? 1 : 0,
            Readmission_Risk: ['High', 'Moderate', 'Low'].includes(row.Readmission_Risk)
              ? row.Readmission_Risk
              : 'Low',
            AI_Risk_Flag: row.AI_Risk_Flag || 'Standard Review',
            Comment: (row.Comment || row.Patient_Comment || row.Feedback || '').trim() || 'No comment recorded',
          }));

          onRecordsChange(parsedRecords);
          const allIds = new Set(parsedRecords.map((r) => r.id));
          onSelectIdsChange(allIds);
        }
      },
      error: (err) => {
        alert(`Error parsing CSV: ${err.message}`);
      },
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSample = () => {
    const csv = Papa.unparse(records.length > 0 ? records : SAMPLE_PATIENT_RECORDS);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hospital_patient_experience_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetToSample = () => {
    onRecordsChange(SAMPLE_PATIENT_RECORDS);
    const allIds = new Set(SAMPLE_PATIENT_RECORDS.map((r) => r.id));
    onSelectIdsChange(allIds);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      onSelectIdsChange(new Set());
    } else {
      onSelectIdsChange(new Set(records.map((r) => r.id)));
    }
  };

  const toggleRecord = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectIdsChange(next);
  };

  // Filtered list
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.Comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.Service_Line.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.Patient_Persona.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'ALL' || r.Service_Line === serviceFilter;
    const matchesFlag = flagFilter === 'ALL' || r.AI_Risk_Flag === flagFilter;
    return matchesSearch && matchesService && matchesFlag;
  });

  const serviceLines = Array.from(new Set(records.map((r) => r.Service_Line)));
  const aiFlags = Array.from(new Set(records.map((r) => r.AI_Risk_Flag)));

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Patient Experience Dataset
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedIds.size} of {records.length} records selected
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {kpis.distinctComments.length} distinct comments
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload custom CSV or adjust selected cohort. Aggregates are computed via JavaScript.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload CSV
          </button>

          <button
            onClick={handleDownloadSample}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handleResetToSample}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Reset Sample
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main expandable body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Controls: Search, Filters, Distinct comments toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search comments, ID, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Service line filter */}
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Service Lines ({serviceLines.length})</option>
                {serviceLines.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* AI Risk Flag filter */}
              <select
                value={flagFilter}
                onChange={(e) => setFlagFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Risk Flags ({aiFlags.length})</option>
                {aiFlags.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Right toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                {selectedIds.size === records.length ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-teal-600" /> Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> Select All ({records.length})
                  </>
                )}
              </button>

              <button
                onClick={() => setShowDistinctView(!showDistinctView)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                  showDistinctView
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showDistinctView ? 'Show Full Records' : 'Show Distinct Comments (' + kpis.distinctComments.length + ')'}</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: DISTINCT COMMENTS (Prompt requirement: Send each distinct comment to an agent once) */}
          {showDistinctView ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
                <span className="font-bold">Optimization Principle: </span>
                Distinct comments are deduplicated across records. Only these {kpis.distinctComments.length} unique comments are sent to Agents 1, 3, and 6, each with its repetition count and associated risk flags.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {kpis.distinctComments.map((dc) => (
                  <div
                    key={dc.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs">
                          {dc.id}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Appears in {dc.count} records ({((dc.count / (kpis.totalRecords || 1)) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Avg Comm: {dc.avgCommunicationRating}/5
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{dc.comment}"
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-medium text-slate-500">Flags:</span>
                      {Object.entries(dc.aiRiskFlagCounts).map(([flag, cnt]) => (
                        <span
                          key={flag}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          {flag}: {cnt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VIEW 2: FULL RECORD TABLE */
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size > 0 && selectedIds.size === records.length}
                          onChange={toggleSelectAll}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="p-3 font-mono">Patient ID</th>
                      <th className="p-3">Persona</th>
                      <th className="p-3">Age</th>
                      <th className="p-3">Visit Type</th>
                      <th className="p-3">Service Line</th>
                      <th className="p-3">Year</th>
                      <th className="p-3 text-center">Sat (1-5)</th>
                      <th className="p-3 text-center">Comm (1-5)</th>
                      <th className="p-3 text-center">Follow-up</th>
                      <th className="p-3 text-center">Portal</th>
                      <th className="p-3">Readmission</th>
                      <th className="p-3">AI Risk Flag</th>
                      <th className="p-3 min-w-[280px]">Patient Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="p-8 text-center text-slate-400">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => {
                        const isSelected = selectedIds.has(r.id);
                        return (
                          <tr
                            key={r.id}
                            onClick={() => toggleRecord(r.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/70 dark:hover:bg-teal-950/40'
                                : 'bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleRecord(r.id)}
                                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                              {r.id}
                            </td>
                            <td className="p-3">{r.Patient_Persona}</td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{r.Age_Group}</td>
                            <td className="p-3">{r.Visit_Type}</td>
                            <td className="p-3 font-medium text-slate-900 dark:text-slate-200">{r.Service_Line}</td>
                            <td className="p-3 font-mono text-slate-500">{r.Year}</td>
                            <td className="p-3 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded ${
                                r.Patient_Satisfaction >= 4
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : r.Patient_Satisfaction <= 2
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {r.Patient_Satisfaction}★
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">
                              {r.Communication_Rating}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                r.Followup_Compliance === 1
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {r.Followup_Compliance === 1 ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                r.Portal_Usage === 1
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {r.Portal_Usage === 1 ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                r.Readmission_Risk === 'High'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : r.Readmission_Risk === 'Moderate'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {r.Readmission_Risk}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                r.AI_Risk_Flag.includes('Human')
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : r.AI_Risk_Flag.includes('Bias')
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : r.AI_Risk_Flag.includes('Hallucination')
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {r.AI_Risk_Flag}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-400 max-w-sm truncate" title={r.Comment}>
                              "{r.Comment}"
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
