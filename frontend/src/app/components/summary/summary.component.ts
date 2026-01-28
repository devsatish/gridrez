import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeSummary } from '../../models/resume.model';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  @Input() summary!: ResumeSummary;
  @Output() uploadNew = new EventEmitter<void>();

  onUploadNew(): void {
    this.uploadNew.emit();
  }

  get jsonOutput(): string {
    if (!this.summary) return '{}';
    const education = this.summary.education
      .map((edu) => {
        const year = edu.graduationYear ? ` (${edu.graduationYear})` : '';
        return `${edu.degree} - ${edu.institution}${year}`;
      })
      .join(' | ');
    
    const output: any = {
      name: this.summary.name,
      role: this.summary.currentRole,
      skills: this.summary.skills.join(' - '),
      education: education || '',
      summary: this.summary.summary
    };

    if (this.summary.email) output.email = this.summary.email;
    if (this.summary.phone) output.phone = this.summary.phone;
    if (this.summary.location) output.location = this.summary.location;
    
    if (this.hasSocialHandles()) {
      output.socialHandles = {};
      if (this.summary.socialHandles?.linkedin) output.socialHandles.linkedin = this.summary.socialHandles.linkedin;
      if (this.summary.socialHandles?.github) output.socialHandles.github = this.summary.socialHandles.github;
      if (this.summary.socialHandles?.twitter) output.socialHandles.twitter = this.summary.socialHandles.twitter;
      if (this.summary.socialHandles?.portfolio) output.socialHandles.portfolio = this.summary.socialHandles.portfolio;
      if (this.summary.socialHandles?.other && this.summary.socialHandles.other.length > 0) {
        output.socialHandles.other = this.summary.socialHandles.other;
      }
    }
    
    return JSON.stringify(output, null, 2);
  }

  hasContactInfo(): boolean {
    return !!(this.summary?.email || this.summary?.phone || this.summary?.location);
  }

  hasSocialHandles(): boolean {
    if (!this.summary?.socialHandles) return false;
    const sh = this.summary.socialHandles;
    return !!(sh.linkedin || sh.github || sh.twitter || sh.portfolio || 
              (sh.other && sh.other.length > 0));
  }

  formatSocialUrl(url: string | null | undefined, platform: string): string {
    if (!url) return '#';
    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, format based on platform
    const normalized = url.replace(/^@/, '').replace(/^\//, '');
    switch (platform) {
      case 'linkedin':
        if (normalized.includes('linkedin.com')) return `https://${normalized}`;
        return `https://linkedin.com/in/${normalized}`;
      case 'github':
        if (normalized.includes('github.com')) return `https://${normalized}`;
        return `https://github.com/${normalized}`;
      case 'twitter':
        if (normalized.includes('twitter.com') || normalized.includes('x.com')) {
          return `https://${normalized}`;
        }
        return `https://twitter.com/${normalized}`;
      default:
        return url.startsWith('http') ? url : `https://${url}`;
    }
  }

  getEducationText(): string {
    if (!this.summary || !this.summary.education || this.summary.education.length === 0) {
      return '';
    }
    const edu = this.summary.education[0];
    const degree = edu.degree || '';
    const institution = edu.institution || '';
    if (!degree && !institution) {
      return '';
    }
    return `${degree} - ${institution}`;
  }

  copyJson(): void {
    const jsonText = this.jsonOutput;
    navigator.clipboard.writeText(jsonText).then(() => {
      // You could add a toast notification here
      console.log('JSON copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy JSON:', err);
    });
  }

  copyRawText(): void {
    if (!this.summary?.rawText) return;
    navigator.clipboard.writeText(this.summary.rawText).then(() => {
      console.log('Raw text copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy raw text:', err);
    });
  }
}
