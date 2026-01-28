import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'error';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  @Output() fileSelected = new EventEmitter<File>();

  state: UploadState = 'idle';
  selectedFile: File | null = null;
  errorMessage: string = '';

  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  private readonly allowedExtensions = ['.pdf', '.txt', '.docx'];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.state = 'dragging';
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.state = 'idle';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.state = 'idle';

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = '';

    // Validate file type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      this.state = 'error';
      this.errorMessage = 'Invalid file type. Please upload a PDF, DOCX, or TXT file.';
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.state = 'error';
      this.errorMessage = 'File size exceeds 10MB limit.';
      return;
    }

    // Validate not empty
    if (file.size === 0) {
      this.state = 'error';
      this.errorMessage = 'File is empty.';
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  setUploading(): void {
    this.state = 'uploading';
  }

  setProcessing(): void {
    this.state = 'processing';
  }

  setError(message: string): void {
    this.state = 'error';
    this.errorMessage = message;
  }

  reset(): void {
    this.state = 'idle';
    this.selectedFile = null;
    this.errorMessage = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
