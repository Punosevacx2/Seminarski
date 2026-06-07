import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MilvusService } from '../../../services/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hybridsearch.component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './hybridsearch.component.html',
  styleUrl: './hybridsearch.component.scss',
})
export class HybridsearchComponent {
loading = false;
  error: string | null = null;
  results: any[] = [];

  // Parametri koje korisnik može menjati
  paramshybrid = {
    text: '',
    topK: 5,
    collectionName: 'Proba5',
    metricType: 'COSINE',
    filter: 'id > 10000'
  };

  indexParamsInput = '{"nprobe": 128}'; // korisnik može uneti svoj JSON string

  constructor(private milvusService: MilvusService,private router: Router) {}

openRecipeDetail(recipe: any): void {
  if (recipe.id) {
     this.router.navigate(['/recipe',this.paramshybrid.collectionName, recipe.id]);
  }
}


  onSearch(): void {
    if (!this.paramshybrid.text.trim()) {
      this.error = 'Unesite tekst za pretragu.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = [];

    let parsedIndexParams: any = {};
    try {
      parsedIndexParams = JSON.parse(this.indexParamsInput);
    } catch (e) {
      this.error = 'Neispravan JSON u Index Params polju.';
      this.loading = false;
      return;
    }
    console.log("Parametri za hybridni");
    console.log(this.paramshybrid);
    const body = {
      ...this.paramshybrid,
      indexParams: parsedIndexParams
    };

    console.log('📤 Šaljem na backend:', body);

    this.milvusService.searchVectorsHybrid(body).subscribe({
      next: (res) => {
        console.log('📥 Odgovor sa backenda:', res);
        this.results = res.results || res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Greška:', err);
        this.error = 'Došlo je do greške prilikom pretrage.';
        this.loading = false;
      }
    });
  }
}
