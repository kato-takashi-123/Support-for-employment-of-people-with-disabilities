import React from 'react';
import { CultivationRecord, WorkType, CropStage, ObservationStatus, FertilizerDetail } from '../types';
import { WORK_TYPE_DETAILS, CROP_STAGE_DETAILS, OBSERVATION_STATUS_DETAILS } from './constants';

const JP_HOLIDAYS: Record<string, string> = {
  "2024-01-01": "元日", "2024-01-08": "成人の日", "2024-02-11": "建国記念の日", "2024-02-12": "振替休日", "2024-02-23": "天皇誕生日", "2024-03-20": "春分の日", "2024-04-29": "昭和の日", "2024-05-03": "憲法記念日", "2024-05-04": "みどりの日", "2024-05-05": "こどもの日", "2024-05-06": "振替休日", "2024-07-15": "海の日", "2024-08-11": "山の日", "2024-08-12": "振替休日", "2024-09-16": "敬老の日", "2024-09-22": "秋分の日", "2024-09-23": "振替休日", "2024-10-14": "スポーツの日", "2024-11-03": "文化の日", "2024-11-04": "振替休日", "2024-11-23": "勤労感謝の日",
  "2025-01-01": "元日", "2025-01-13": "成人の日", "2025-02-11": "建国記念の日", "2025-02-23": "天皇誕生日", "2025-02-24": "振替休日", "2025-03-20": "春分の日", "2025-04-29": "昭和の日", "2025-05-03": "憲法記念日", "2025-05-04": "みどりの日", "2025-05-05": "こどもの日", "2025-05-06": "振替休日", "2025-07-21": "海の日", "2025-08-11": "山の日", "2025-09-15": "敬老の日", "2025-09-23": "秋分の日", "2025-10-13": "スポーツの日", "2025-11-03": "文化の日", "2025-11-24": "勤労感謝の日",
};

export const getDayInfo = (date: Date): { isHoliday: boolean, isSaturday: boolean, isSunday: boolean } => {
    const dateString = toISODateString(date);
    const dayOfWeek = date.getDay();
    return {
        isHoliday: !!JP_HOLIDAYS[dateString],
        isSaturday: dayOfWeek === 6,
        isSunday: dayOfWeek === 0,
    };
};

export const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateString = (dateString: string): Date => {
  if (!dateString) return new Date();
  const parts = dateString.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({ mimeType: file.type, data: base64Data });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const resizeImage = (file: File, maxPixels: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      
      const { width, height } = img;
      const currentPixels = width * height;

      const scale = currentPixels > maxPixels ? Math.sqrt(maxPixels / currentPixels) : 1;
      const newWidth = Math.floor(width * scale);
      const newHeight = Math.floor(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        img.src = '';
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const resizedBase64 = canvas.toDataURL('image/jpeg', 0.70); 
      
      canvas.width = 1;
      canvas.height = 1;
      img.src = '';

      resolve(resizedBase64);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(blobUrl);
      img.src = '';
      reject(err);
    };

    img.src = blobUrl;
  });
};

export const createThumbnail = (base64Str: string, maxWidth = 160, maxHeight = 160): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        img.src = '';
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const thumb = canvas.toDataURL('image/jpeg', 0.55); // 高圧縮率で極限まで軽量化
      
      // 明示的なメモリ解放
      canvas.width = 1;
      canvas.height = 1;
      img.src = '';
      
      resolve(thumb);
    };
    img.onerror = () => {
      img.src = '';
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

const parseCsvRow = (row: string): string[] => {
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (inQuotes && i + 1 < row.length && row[i+1] === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    fields.push(currentField);
    return fields;
};

export const importRecordsFromCsv = (csvText: string): CultivationRecord[] => {
    const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n');
    if (lines.length < 2) return [];

    const headers = lines.shift()!.trim().split(',');
    const expectedHeaders = [
        'ID', '日付', '作物名', '栽培レーン', '作業種類', '作物の状況', 
        '観察記録', '病害虫詳細', 'メモ', 'M-plus 1号 倍率', 'M-plus 2号 倍率'
    ];
    
    if (expectedHeaders.some((h, i) => headers[i] !== h)) {
        console.error('CSV Headers mismatch. Expected:', expectedHeaders, 'Got:', headers);
        throw new Error("CSVのヘッダー形式が正しくありません。");
    }

    const headerMap = headers.reduce((acc, header, index) => {
        acc[header] = index;
        return acc;
    }, {} as Record<string, number>);

    const WORK_TYPE_REVERSE_MAP = Object.fromEntries(Object.entries(WORK_TYPE_DETAILS).map(([key, { label }]) => [label, key as WorkType]));
    const CROP_STAGE_REVERSE_MAP = Object.fromEntries(Object.entries(CROP_STAGE_DETAILS).map(([key, { label }]) => [label, key as CropStage]));
    const OBSERVATION_STATUS_REVERSE_MAP = Object.fromEntries(Object.entries(OBSERVATION_STATUS_DETAILS).map(([key, { label }]) => [label, key as ObservationStatus]));

    return lines.filter(line => line.trim()).map(line => {
        const values = parseCsvRow(line.trim());
        const getVal = (header: string) => values[headerMap[header]] || '';
        
        const fertilizingDetails: FertilizerDetail[] = [];
        const mPlus1Dilution = parseInt(getVal('M-plus 1号 倍率'), 10);
        if (!isNaN(mPlus1Dilution) && mPlus1Dilution > 0) {
            fertilizingDetails.push({ fertilizerType: 'M-Plus-1', dilution: mPlus1Dilution });
        }
        const mPlus2Dilution = parseInt(getVal('M-plus 2号 倍率'), 10);
        if (!isNaN(mPlus2Dilution) && mPlus2Dilution > 0) {
            fertilizingDetails.push({ fertilizerType: 'M-Plus-2', dilution: mPlus2Dilution });
        }

        const record: CultivationRecord = {
            id: getVal('ID'),
            date: getVal('日付'),
            cropName: getVal('作物名'),
            cultivationLane: getVal('栽培レーン'),
            workTypes: getVal('作業種類') ? getVal('作業種類').split(', ').map(l => WORK_TYPE_REVERSE_MAP[l]).filter(Boolean) : [],
            cropStages: getVal('作物の状況') ? getVal('作物の状況').split(', ').map(l => CROP_STAGE_REVERSE_MAP[l]).filter(Boolean) : [],
            observationStatus: getVal('観察記録') ? getVal('観察記録').split(', ').map(l => OBSERVATION_STATUS_REVERSE_MAP[l]).filter(Boolean) : [],
            pestDetails: getVal('病害虫詳細') ? getVal('病害虫詳細').split(', ') : [],
            memo: getVal('メモ'),
            fertilizingDetails: fertilizingDetails.length > 0 ? fertilizingDetails : undefined,
            photoBase64: '',
            seedPackagePhotoFront: '',
            seedPackagePhotoBack: '',
        };
        return record;
    });
};

export const exportRecordsToCsv = (records: CultivationRecord[]): string => {
    const headers = [
        'ID', '日付', '作物名', '栽培レーン', '作業種類', '作物の状況', 
        '観察記録', '病害虫詳細', 'メモ', 'M-plus 1号 倍率', 'M-plus 2号 倍率'
    ];
    
    const sortedRecords = [...records].sort((a, b) => {
        const dateComparison = parseDateString(b.date).getTime() - parseDateString(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.cultivationLane.localeCompare(b.cultivationLane, undefined, { numeric: true });
    });

    const rows = sortedRecords.map(r => {
        const details = Array.isArray(r.fertilizingDetails) 
            ? r.fertilizingDetails 
            : r.fertilizingDetails ? [r.fertilizingDetails] : [];
        
        const mPlus1 = details.find(d => d.fertilizerType === 'M-Plus-1');
        const mPlus2 = details.find(d => d.fertilizerType === 'M-Plus-2');

        const row = {
            id: r.id,
            date: r.date,
            cropName: r.cropName,
            cultivationLane: r.cultivationLane,
            workTypes: r.workTypes?.map(wt => WORK_TYPE_DETAILS[wt]?.label).join(', ') || '',
            cropStages: r.cropStages?.map(cs => CROP_STAGE_DETAILS[cs]?.label).join(', ') || '',
            observationStatus: r.observationStatus?.map(os => OBSERVATION_STATUS_DETAILS[os]?.label).join(', ') || '',
            pestDetails: r.pestDetails?.join(', ') || '',
            memo: r.memo.replace(/"/g, '""'),
            mPlus1Dilution: mPlus1?.dilution?.toString() || '',
            mPlus2Dilution: mPlus2?.dilution?.toString() || '',
        };
        return Object.values(row).map(val => `"${val}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};