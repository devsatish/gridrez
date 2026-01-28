import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, switchMap, timer, filter, map, take } from 'rxjs';
import { ResumeUploadResponse, ResumeSummary } from '../models/resume.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/resumes`;

  uploadResume(file: File): Observable<ResumeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ResumeUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getSummary(id: string): Observable<ResumeSummary> {
    return this.http.get<ResumeSummary>(`${this.apiUrl}/${id}/summary`);
  }

  pollForSummary(id: string): Observable<ResumeSummary> {
    return timer(0, 2000).pipe(
      switchMap(() => this.getSummaryResponse(id)),
      map((response) => {
        if (response.status === 200 && response.body && 'id' in response.body) {
          return response.body as ResumeSummary;
        }
        return null;
      }),
      filter((summary): summary is ResumeSummary => summary !== null),
      take(1)
    );
  }

  private getSummaryResponse(id: string): Observable<HttpResponse<ResumeSummary | { detail: string }>> {
    return this.http.get<ResumeSummary>(`${this.apiUrl}/${id}/summary`, {
      observe: 'response'
    });
  }
}
