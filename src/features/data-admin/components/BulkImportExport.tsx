'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import useClientApi from '@/lib/axios/clientSide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Loader2,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkImportExportProps {
  /** API endpoint base (e.g., '/data-admin/courses/') */
  endpoint: string;
  /** Entity display name */
  entityName: string;
  /** Query key for invalidation after import */
  queryKey: string;
}

export function BulkImportExport({
  endpoint,
  entityName,
  queryKey
}: BulkImportExportProps) {
  const { api } = useClientApi();
  const [importOpen, setImportOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState('');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

  // Export
  const handleExport = async () => {
    if (!api) return;
    try {
      const response = await api.get(`${endpoint}export/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${entityName.toLowerCase().replace(/\s+/g, '_')}_export.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${entityName} data exported`);
    } catch {
      toast.error('Export failed');
    }
  };

  // Parse uploaded file
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          setParsedRows(jsonData as Record<string, any>[]);
          setStep('preview');
        } catch {
          toast.error(
            "Failed to parse file. Make sure it's a valid Excel or CSV file."
          );
        }
      };
      reader.readAsArrayBuffer(file);
    },
    []
  );

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        setParsedRows(jsonData as Record<string, any>[]);
        setStep('preview');
      } catch {
        toast.error('Failed to parse file.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Dry run (preview)
  const dryRunMutation = useMutation({
    mutationFn: () =>
      api!.post(`${endpoint}bulk-import/?dry_run=true`, { rows: parsedRows }),
    onSuccess: (res) => {
      setPreviewResult(res.data);
    },
    onError: () => toast.error('Validation failed')
  });

  // Actual import
  const importMutation = useMutation({
    mutationFn: () =>
      api!.post(`${endpoint}bulk-import/`, { rows: parsedRows }),
    onSuccess: (res) => {
      setPreviewResult(res.data);
      setStep('result');
      toast.success(
        `Import complete: ${res.data.summary.to_create} created, ${res.data.summary.to_update} updated`
      );
    },
    onError: () => toast.error('Import failed')
  });

  const handleOpenImport = () => {
    setParsedRows([]);
    setFileName('');
    setPreviewResult(null);
    setStep('upload');
    setImportOpen(true);
  };

  const handleClose = () => {
    setImportOpen(false);
    setParsedRows([]);
    setPreviewResult(null);
    setStep('upload');
  };

  const columns = parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [];

  return (
    <>
      <div className='flex items-center gap-1.5'>
        <Button
          variant='outline'
          size='sm'
          className='h-8 text-xs'
          onClick={handleExport}
        >
          <Download className='mr-1.5 h-3.5 w-3.5' />
          Export
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-8 text-xs'
          onClick={handleOpenImport}
        >
          <Upload className='mr-1.5 h-3.5 w-3.5' />
          Import
        </Button>
      </div>

      <Dialog open={importOpen} onOpenChange={handleClose}>
        <DialogContent className='flex max-h-[85vh] max-w-4xl flex-col'>
          <DialogHeader>
            <DialogTitle>
              {step === 'upload' && `Import ${entityName}s`}
              {step === 'preview' &&
                `Preview Import — ${parsedRows.length} rows`}
              {step === 'result' && 'Import Complete'}
            </DialogTitle>
            <DialogDescription>
              {step === 'upload' &&
                'Upload an Excel (.xlsx) or CSV file. Download existing data first to use as a template.'}
              {step === 'preview' &&
                'Review the data below. Click "Validate" to check for errors before importing.'}
              {step === 'result' &&
                'Import has been processed. See results below.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className='flex flex-1 flex-col items-center justify-center py-8'>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className='border-muted-foreground/20 hover:border-primary/40 w-full max-w-md cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors'
                onClick={() =>
                  document.getElementById('bulk-file-input')?.click()
                }
              >
                <FileSpreadsheet className='text-muted-foreground/40 mx-auto mb-4 h-12 w-12' />
                <p className='text-sm font-medium'>Drop Excel/CSV file here</p>
                <p className='text-muted-foreground mt-1 text-xs'>
                  or click to browse
                </p>
                <input
                  id='bulk-file-input'
                  type='file'
                  accept='.xlsx,.xls,.csv'
                  className='hidden'
                  onChange={handleFileUpload}
                />
              </div>
              <div className='mt-6'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-xs'
                  onClick={handleExport}
                >
                  <Download className='mr-1.5 h-3 w-3' />
                  Download template (current data)
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className='flex min-h-0 flex-1 flex-col'>
              <div className='mb-3 flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  <FileSpreadsheet className='mr-1 h-3 w-3' />
                  {fileName}
                </Badge>
                <Badge variant='secondary' className='text-xs'>
                  {parsedRows.length} rows
                </Badge>
                <Badge variant='secondary' className='text-xs'>
                  {columns.length} columns
                </Badge>

                {previewResult && (
                  <>
                    <Badge className='border-green-500/20 bg-green-500/10 text-xs text-green-500'>
                      {previewResult.summary.to_create} new
                    </Badge>
                    <Badge className='border-blue-500/20 bg-blue-500/10 text-xs text-blue-500'>
                      {previewResult.summary.to_update} updates
                    </Badge>
                    {previewResult.summary.errors > 0 && (
                      <Badge className='border-red-500/20 bg-red-500/10 text-xs text-red-500'>
                        {previewResult.summary.errors} errors
                      </Badge>
                    )}
                  </>
                )}
              </div>

              <ScrollArea className='flex-1 rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[60px] text-xs'>#</TableHead>
                      {previewResult && (
                        <TableHead className='w-[80px] text-xs'>
                          Status
                        </TableHead>
                      )}
                      {columns.slice(0, 8).map((col) => (
                        <TableHead key={col} className='text-xs'>
                          {col}
                        </TableHead>
                      ))}
                      {columns.length > 8 && (
                        <TableHead className='text-xs'>
                          +{columns.length - 8} more
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 50).map((row, idx) => {
                      const result = previewResult?.rows?.[idx];
                      const hasError = result?.status === 'error';
                      return (
                        <TableRow
                          key={idx}
                          className={hasError ? 'bg-red-500/5' : ''}
                        >
                          <TableCell className='text-muted-foreground text-xs'>
                            {idx + 1}
                          </TableCell>
                          {previewResult && (
                            <TableCell>
                              {result?.action === 'create' && (
                                <Badge className='bg-green-500/10 text-[10px] text-green-500'>
                                  New
                                </Badge>
                              )}
                              {result?.action === 'update' && (
                                <Badge className='bg-blue-500/10 text-[10px] text-blue-500'>
                                  Update
                                </Badge>
                              )}
                              {result?.action === 'error' && (
                                <Badge
                                  className='bg-red-500/10 text-[10px] text-red-500'
                                  title={JSON.stringify(result.errors)}
                                >
                                  Error
                                </Badge>
                              )}
                            </TableCell>
                          )}
                          {columns.slice(0, 8).map((col) => (
                            <TableCell
                              key={col}
                              className='max-w-[150px] truncate text-xs'
                            >
                              {String(row[col] ?? '')}
                            </TableCell>
                          ))}
                          {columns.length > 8 && (
                            <TableCell className='text-muted-foreground text-xs'>
                              ...
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {parsedRows.length > 50 && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + 2}
                          className='text-muted-foreground text-center text-xs'
                        >
                          ... and {parsedRows.length - 50} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && previewResult && (
            <div className='flex flex-1 flex-col items-center justify-center space-y-4 py-8'>
              <CheckCircle2 className='h-16 w-16 text-green-500' />
              <div className='space-y-1 text-center'>
                <p className='text-lg font-semibold'>Import Complete</p>
                <p className='text-muted-foreground text-sm'>
                  {previewResult.summary.to_create} created,{' '}
                  {previewResult.summary.to_update} updated
                  {previewResult.summary.errors > 0 &&
                    `, ${previewResult.summary.errors} errors`}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {step === 'upload' && (
              <Button variant='outline' onClick={handleClose}>
                Cancel
              </Button>
            )}
            {step === 'preview' && (
              <>
                <Button
                  variant='outline'
                  onClick={() => {
                    setStep('upload');
                    setParsedRows([]);
                    setPreviewResult(null);
                  }}
                >
                  <X className='mr-1.5 h-3.5 w-3.5' /> Change File
                </Button>
                {!previewResult ? (
                  <Button
                    onClick={() => dryRunMutation.mutate()}
                    disabled={dryRunMutation.isPending}
                  >
                    {dryRunMutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <RefreshCw className='mr-2 h-4 w-4' />
                    )}
                    Validate
                  </Button>
                ) : (
                  <Button
                    onClick={() => importMutation.mutate()}
                    disabled={
                      importMutation.isPending ||
                      previewResult.summary.errors ===
                        previewResult.summary.total
                    }
                  >
                    {importMutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Upload className='mr-2 h-4 w-4' />
                    )}
                    Import{' '}
                    {previewResult.summary.to_create +
                      previewResult.summary.to_update}{' '}
                    rows
                  </Button>
                )}
              </>
            )}
            {step === 'result' && <Button onClick={handleClose}>Done</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
