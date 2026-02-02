import { Download } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { exportRepoDataToCSV } from '../utils/export';
import { Button } from '../components/ui/button';

const ExportButton = () => {
  const { selectedRepo, repoData } = useAppStore();

  const handleExport = () => {
    if (!selectedRepo || !repoData[selectedRepo]) {
      alert('No data available to export. Please analyze a repository first.');
      return;
    }

    exportRepoDataToCSV(repoData[selectedRepo]);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={!selectedRepo || !repoData[selectedRepo]}
      variant="export"
    >
      <Download className="mr-2 h-4 w-4" /> Export Data (CSV)
    </Button>
  );
};

export default ExportButton;