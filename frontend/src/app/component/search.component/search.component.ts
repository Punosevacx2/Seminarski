import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MilvusService } from '../../../services/services';

type Mode = 'semantic' | 'fulltext' | 'hybrid';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit{
  loading = false;
  error: string | null = null;
  results: any[] = [];
  activeMode: Mode | null = null;

  // 🔧 Bitno: ovo fali u tvojoj klasi
  query = '';

  constructor(private milvusService: MilvusService, private router: Router) {}

ngOnInit(): void {
  this.activeMode = 'semantic';
  const body= {"text": "Najbolji recepti"}
    this.milvusService.searchSemantic(body).subscribe({
      next: (res: any) => {
        this.results = res?.results ?? res?.data ?? res ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Došlo je do greške prilikom pretrage.';
        this.loading = false;
      }
    });; // opcionalno: listaj sve kolekcije na startu
  }

  openRecipeDetail(recipe: any): void {
    if (recipe?.id) {
      this.router.navigate(['/recipe', recipe.id]); // prilagodi rutu po potrebi
    }
  }

  onEnter(): void {
    this.run(this.activeMode || 'semantic');
  }

  run(mode: Mode): void {
    const text = (this.query || '').trim();
    if (!text) {
      this.error = 'Unesite tekst za pretragu.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = [];
    this.activeMode = mode;

    // 🔧 Sada šaljemo string, jer servis očekuje string
    const body = {"text": text};
    const req$ =
      mode === 'semantic'
        ? this.milvusService.searchSemantic(body)
        : mode === 'fulltext'
        ? this.milvusService.searchFulltext(body)
        : this.milvusService.searchHybrid(body);

    req$.subscribe({
      next: (res: any) => {
        this.results = res?.results ?? res?.data ?? res ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Došlo je do greške prilikom pretrage.';
        this.loading = false;
      }
    });
  }

  // Lep prikaz % i kad score nije u [0,1]
  scorePct(r: any): number {
    let s: number;
    if (this.activeMode === 'semantic') {
      s = Number(r?.semantic_score ?? 0);
    } else if (this.activeMode === 'fulltext') {
      s = Number(r?.fulltext_score ?? 0);
    } else {
      s = Number(r?.hybrid_score ?? 0);
    }
    if (Number.isNaN(s)) return 0;
    return s <= 1 ? s * 100 : Math.min(100, (s / (s + 10)) * 100);
  }
  
scorePct1(r: any): number {
  if (!this.results || this.results.length === 0) return 0;

  if (this.activeMode === 'semantic') {
    if (r.similarity !== undefined) {
      return Math.max(0, Math.min(100, r.similarity * 100));
    }

    if (r.distance !== undefined) {
      const distances = this.results
        .map(x => x.distance)
        .filter((d: number) => d !== undefined);

      const min = Math.min(...distances);
      const max = Math.max(...distances);
      if (max === min) return 100;

      const invNorm = (max - r.distance) / (max - min);
      return Math.max(0, Math.min(100, invNorm * 100));
    }

    if (r.score !== undefined) {
      return Math.max(0, Math.min(100, r.score * 100));
    }
    return 0;
  }

  if (this.activeMode === 'fulltext') {
    const scores = this.results
      .map(x => x.score ?? 0);
    const max = Math.max(...scores);
    if (max <= 0) return 0;

    const pct = (r.score / max) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  if (this.activeMode === 'hybrid') {
    const scores = this.results
      .map(x => x.score ?? 0);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    if (max === min) return 100;

    const norm = (r.score - min) / (max - min);
    return Math.max(0, Math.min(100, norm * 100));
  }

  return 0;
}


}
