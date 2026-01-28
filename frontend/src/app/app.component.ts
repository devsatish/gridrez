import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './components/upload/upload.component';
import { SummaryComponent } from './components/summary/summary.component';
import { ResumeService } from './services/resume.service';
import { ResumeSummary } from './models/resume.model';

type AppView = 'upload' | 'summary';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UploadComponent, SummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private resumeService = inject(ResumeService);

  @ViewChild(UploadComponent) uploadComponent!: UploadComponent;

  currentView: AppView = 'upload';
  summary: ResumeSummary | null = null;
  errorMessage: string = '';

  onFileSelected(file: File): void {
    this.errorMessage = '';
    this.uploadComponent.setUploading();

    this.resumeService.uploadResume(file).subscribe({
      next: (response) => {
        if (response.status === 'completed') {
          this.uploadComponent.setProcessing();
          this.fetchSummary(response.id);
        } else if (response.status === 'error') {
          this.uploadComponent.setError('Failed to process resume');
        }
      },
      error: (err) => {
        const message = err.error?.detail || 'Failed to upload resume. Please try again.';
        this.uploadComponent.setError(message);
      }
    });
  }

  private fetchSummary(id: string): void {
    this.resumeService.pollForSummary(id).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.currentView = 'summary';
      },
      error: (err) => {
        const message = err.error?.detail || 'Failed to fetch resume summary.';
        this.uploadComponent.setError(message);
      }
    });
  }

  onUploadNew(): void {
    this.currentView = 'upload';
    this.summary = null;
    this.uploadComponent?.reset();
  }
}
