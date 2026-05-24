import React, { useState } from 'react';
import { apiService } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import Icons from '../common/Icons';

interface SalesUploadProps {
  restaurantId: string;
  onTrainingComplete?: () => void;
}

export const SalesUpload: React.FC<SalesUploadProps> = ({ restaurantId, onTrainingComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[] | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [training, setTraining] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setStatusMessage(null);
    
    // Preview first 5 rows
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const rows = text.split('\n').slice(0, 6);
        setPreview(rows);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setStatusMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurantId', restaurantId);
    
    try {
      const response = await apiService.uploadSalesData(formData);
      setUploading(false);
      
      if (response.success) {
        setStatusMessage(`Uploaded ${response.rows} rows of sales history!`);
        // Now train the model automatically
        await handleTrain();
      } else {
        setStatusMessage('Failed to upload sales history.');
      }
    } catch (err: any) {
      setUploading(false);
      setStatusMessage(`Upload error: ${err.message || err}`);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      const result = await apiService.trainModel(restaurantId);
      setTraining(false);
      
      if (result.success) {
        setStatusMessage(`Model trained! Accuracy: ${result.accuracy}%`);
        if (onTrainingComplete) {
          onTrainingComplete();
        }
      } else {
        setStatusMessage('Model training failed.');
      }
    } catch (err: any) {
      setTraining(false);
      setStatusMessage(`Training error: ${err.message || err}`);
    }
  };

  return React.createElement(
    Card,
    { 
      title: '📊 Upload Sales History',
      className: 'glass-panel hover-lift' 
    },
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' } },
      React.createElement(
        'p',
        { style: { color: 'var(--text-secondary)', fontSize: '0.85rem' } },
        'Export from your POS system as CSV with these columns: '
      ),
      React.createElement(
        'pre',
        {
          style: {
            background: 'var(--background-light)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem',
            fontSize: '0.75rem',
            overflowX: 'auto',
            color: 'var(--text-primary)',
            fontFamily: 'monospace'
          }
        },
        'date,day_of_week,meal_period,portions_sold,prepared_quantity\n2026-05-17,saturday,dinner,92,110\n2026-05-18,sunday,dinner,85,100'
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
          }
        },
        React.createElement('input', {
          id: 'sales-file-input',
          type: 'file',
          accept: '.csv',
          onChange: handleFileSelect,
          style: { display: 'none' }
        }),
        React.createElement(
          'label',
          {
            htmlFor: 'sales-file-input',
            className: 'btn btn-secondary',
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              padding: '0.65rem 1rem'
            }
          },
          React.createElement(Icons.Upload, { size: 16 }),
          file ? `Selected: ${file.name}` : 'Select CSV File'
        )
      ),
      preview && React.createElement(
        'div',
        { style: { marginTop: '0.5rem' } },
        React.createElement('h5', { style: { fontSize: '0.85rem', marginBottom: '0.2rem' } }, 'CSV Preview:'),
        React.createElement(
          'pre',
          {
            style: {
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
              maxHeight: '120px',
              overflowY: 'auto'
            }
          },
          preview.join('\n')
        )
      ),
      file && !uploading && !training && React.createElement(
        Button,
        {
          variant: 'primary',
          onClick: handleUpload,
          style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }
        },
        React.createElement(Icons.TrendingUp, { size: 16 }),
        'Upload & Train AI'
      ),
      uploading && React.createElement(
        'div',
        {
          style: {
            fontSize: '0.85rem',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            justifyContent: 'center',
            padding: '0.5rem 0'
          }
        },
        'Uploading sales file...'
      ),
      training && React.createElement(
        'div',
        {
          style: {
            fontSize: '0.85rem',
            color: 'var(--secondary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            justifyContent: 'center',
            padding: '0.5rem 0'
          }
        },
        'Training AI model on your data...'
      ),
      statusMessage && React.createElement(
        'div',
        {
          style: {
            fontSize: '0.85rem',
            color: statusMessage.includes('error') || statusMessage.includes('Failed') ? 'var(--danger)' : 'var(--primary-color)',
            textAlign: 'center',
            fontWeight: '600',
            marginTop: '0.5rem',
            padding: '0.4rem',
            background: statusMessage.includes('error') || statusMessage.includes('Failed') ? 'rgba(211, 47, 47, 0.05)' : 'rgba(46, 125, 50, 0.05)',
            border: `1px solid ${statusMessage.includes('error') || statusMessage.includes('Failed') ? 'rgba(211, 47, 47, 0.15)' : 'rgba(46, 125, 50, 0.15)'}`,
            borderRadius: 'var(--radius-sm)'
          }
        },
        statusMessage
      )
    )
  );
};

export default SalesUpload;
