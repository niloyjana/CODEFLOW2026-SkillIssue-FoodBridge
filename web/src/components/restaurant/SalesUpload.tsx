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
      className: 'glass-panel hover-lift' 
    },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' } },
      React.createElement('div', { style: { padding: '0.6rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', color: 'var(--primary-color)' } },
        React.createElement(Icons.Database, { size: 20 })
      ),
      React.createElement('h3', { className: 'card-title', style: { margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-heading)' } }, 'AI Sales Training Data')
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
      React.createElement('div', { style: { background: 'rgba(255, 152, 0, 0.05)', borderLeft: '3px solid var(--secondary-color)', padding: '0.8rem 1rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' } },
        React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 } },
          'To improve AI surplus predictions, upload your historical POS sales data. Make sure it contains these columns:'
        )
      ),
      React.createElement(
        'div',
        { style: { position: 'relative' } },
        React.createElement('div', { style: { position: 'absolute', top: '-10px', left: '15px', background: 'var(--surface-light)', padding: '0 0.6rem', fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', borderRadius: '4px', border: '1px solid var(--border-light)' } }, 'example.csv'),
        React.createElement(
          'pre',
          {
            style: {
              background: '#1a1b26',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem 1rem 1rem 1rem',
              fontSize: '0.75rem',
              overflowX: 'auto',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: '1.6',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)'
            }
          },
          React.createElement('span', { style: { color: '#ff9e64' } }, 'date'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#ff9e64' } }, 'day_of_week'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#ff9e64' } }, 'meal_period'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#ff9e64' } }, 'portions_sold'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#ff9e64' } }, 'prepared_quantity'), 
          React.createElement('br', null),
          React.createElement('span', { style: { color: '#9ece6a' } }, '2026-05-17'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#bb9af7' } }, 'saturday'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#bb9af7' } }, 'dinner'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#7dcfff' } }, '92'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#7dcfff' } }, '110'),
          React.createElement('br', null),
          React.createElement('span', { style: { color: '#9ece6a' } }, '2026-05-18'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#bb9af7' } }, 'sunday'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#bb9af7' } }, 'dinner'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#7dcfff' } }, '85'), 
          React.createElement('span', { style: { color: '#a9b1d6' } }, ','),
          React.createElement('span', { style: { color: '#7dcfff' } }, '100')
        )
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
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              padding: '2rem 1rem',
              border: `2px dashed ${file ? 'var(--primary-color)' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-md)',
              background: file ? 'var(--primary-glow)' : 'var(--background-light)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' } },
            React.createElement(Icons.Upload, { size: 24, color: file ? 'var(--primary-color)' : 'var(--text-light)' })
          ),
          React.createElement('div', null,
            React.createElement('span', { style: { fontWeight: 600, color: file ? 'var(--primary-color)' : 'var(--text-primary)', display: 'block', fontSize: '1rem', marginBottom: '0.2rem' } }, file ? file.name : 'Click to select CSV'),
            React.createElement('span', { style: { fontSize: '0.8rem', color: 'var(--text-secondary)' } }, file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'or drag and drop your file here')
          )
        )
      ),
      preview && React.createElement(
        'div',
        { style: { marginTop: '0.5rem' } },
        React.createElement('h5', { style: { fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' } }, 'Preview (First 5 Rows):'),
        React.createElement(
          'pre',
          {
            style: {
              background: 'rgba(0,0,0,0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem',
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
          style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '0.5rem', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700 }
        },
        React.createElement(Icons.TrendingUp, { size: 18 }),
        'Upload & Train AI Model'
      ),
      (uploading || training) && React.createElement(
        'div',
        {
          style: {
            fontSize: '0.9rem',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            padding: '1rem 0',
            fontWeight: 600
          }
        },
        React.createElement(
          'div',
          {
            className: 'spinner',
            style: {
              width: '20px',
              height: '20px',
              border: '3px solid var(--primary-glow)',
              borderTopColor: 'var(--primary-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }
          }
        ),
        uploading ? 'Uploading sales data...' : 'Training Neural Network...'
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
            padding: '0.8rem',
            background: statusMessage.includes('error') || statusMessage.includes('Failed') ? 'rgba(211, 47, 47, 0.08)' : 'var(--primary-glow)',
            border: `1px solid ${statusMessage.includes('error') || statusMessage.includes('Failed') ? 'rgba(211, 47, 47, 0.2)' : 'var(--primary-light)'}`,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }
        },
        React.createElement(statusMessage.includes('error') || statusMessage.includes('Failed') ? Icons.AlertCircle : Icons.CheckCircle, { size: 16 }),
        statusMessage
      )
    )
  );
};

export default SalesUpload;
