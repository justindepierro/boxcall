import React, { useState } from "react";
import { Search, Plus, FileText, Upload } from "lucide-react";
import { PlayGrid } from "../components/playbook/PlayGrid";
import { PlayFilters } from "../components/playbook/PlayFilters";
import { PlayBuilderWizard } from "../components/playbook/PlayBuilder/PlayBuilderWizard";
import { CSVImportModal } from "../components/playbook/CSVImport/CSVImportModal";

interface PlaybookPageState {
  searchQuery: string;
  showBuilder: boolean;
  showImport: boolean;
  selectedFilters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
}

export const PlaybookPage: React.FC = () => {
  const [state, setState] = useState<PlaybookPageState>({
    searchQuery: "",
    showBuilder: false,
    showImport: false,
    selectedFilters: {},
  });

  const handleSearch = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleOpenBuilder = () => {
    setState((prev) => ({ ...prev, showBuilder: true }));
  };

  const handleCloseBuilder = () => {
    setState((prev) => ({ ...prev, showBuilder: false }));
  };

  const handleOpenImport = () => {
    setState((prev) => ({ ...prev, showImport: true }));
  };

  const handleCloseImport = () => {
    setState((prev) => ({ ...prev, showImport: false }));
  };

  const handleFilterChange = (filters: typeof state.selectedFilters) => {
    setState((prev) => ({ ...prev, selectedFilters: filters }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-emerald-600 mr-3" />
              <h1 className="text-2xl font-bold text-slate-900">Playbook</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search plays, formations, or tags..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleOpenImport}
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </button>
              <button
                onClick={handleOpenBuilder}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Play
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-80 flex-shrink-0">
            <PlayFilters
              onFilterChange={handleFilterChange}
              selectedFilters={state.selectedFilters}
            />
          </aside>

          {/* Play Grid */}
          <main className="flex-1">
            <PlayGrid
              searchQuery={state.searchQuery}
              filters={state.selectedFilters}
            />
          </main>
        </div>
      </div>

      {/* Modals */}
      {state.showBuilder && (
        <PlayBuilderWizard
          isOpen={state.showBuilder}
          onClose={handleCloseBuilder}
        />
      )}

      {state.showImport && (
        <CSVImportModal isOpen={state.showImport} onClose={handleCloseImport} />
      )}
    </div>
  );
};
