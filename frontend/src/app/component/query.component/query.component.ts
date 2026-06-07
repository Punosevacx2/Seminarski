import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MilvusService } from '../../../services/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-query.component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss',
})
export class QueryComponent {
loading = false;
  error: string | null = null;
  results: any[] = [];

  // Parametri koje korisnik može menjati
  paramsquery = {
    collectionName: 'Proba5',
    filter: 'id > 10000'
  };

  constructor(private milvusService: MilvusService,private router: Router) {}

openRecipeDetail(recipe: any): void {
  if (recipe.id) {
    console.log("Treba da pisenime id ispod");
    console.log(recipe.id);
     this.router.navigate(['/recipe',this.paramsquery.collectionName, recipe.id]);
  }
}

  onSearch(): void {
    this.loading = true;
    this.error = null;
    this.results = [];

    const body = {
      ...this.paramsquery
    };

    console.log('📤 Šaljem na backend:', body);

    this.milvusService.queryFilter(body).subscribe({
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
