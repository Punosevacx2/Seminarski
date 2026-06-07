import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MilvusService } from '../../../services/services';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {
  recipe: any = null;
  loading = false;
  error: string | null = null;
  message: string | null=null;

  constructor(private route: ActivatedRoute, private milvusService: MilvusService) {}

  ngOnInit(): void {
    const collectionName = this.route.snapshot.paramMap.get('collectionName');
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if (id && collectionName) {
      this.fetchRecipe(id,collectionName);
    }
  }
  onDrop(){
    const id = this.route.snapshot.paramMap.get('id');
    const collectionName = this.route.snapshot.paramMap.get('collectionName');
    if (id && collectionName) {
      
    this.milvusService.deleteVector(Number(id),collectionName).subscribe({
    next: (res) => {
      this.message = `✅ Vector "${id}" uspešno obrisan!`;
      this.loading = false;

    },
    error: (err) => {
      this.error = '❌ Greška pri brisanju indeksa.';
      console.error(err);
      this.loading = false;
    }
  
  });
    }
  }
  fetchRecipe(id: string, collectionName: string): void {
  this.loading = true;
  console.log(id);
  this.milvusService.searchById(id,collectionName).subscribe({
    next: (res: any) => {
      console.log(res.data);
      if (res.data && res.data.length > 0) {
        this.recipe = res.data[0];  
      } else {
        this.recipe = null;
        console.warn('Nema rezultata za dati ID');
      }
      this.loading = false;
    },
    error: (err: any) => {
      console.error('❌ Greška pri dohvatanju recepta:', err);
      this.error = 'Nije moguće učitati detalje recepta.';
      this.loading = false;
    }
  });
}
  
}
