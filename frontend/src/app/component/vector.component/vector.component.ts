import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilvusService } from '../../../services/services';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vector.component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vector.component.html',
  styleUrl: './vector.component.scss',
})
export class VectorComponent {
 loadingCreate = false;
  errorCreate: string | null = null;
  messageCreate: string | null = null;
  loadingDrop = false;
  errorDrop: string | null = null;
  messageDrop: string | null = null;

  // Parametri za kreiranje kolekcije
  params = {
    title: '',
    description: '',
    collectionName: ''
  };
  dropParams={
    id: '',
    collectionName:''
  };

  constructor(private milvusService: MilvusService, private router: Router) {}

  // 1️⃣ Kreiranje kolekcije
  onCreateVector(): void {
    if (!this.params.title) {
      this.errorCreate = '⚠️ Unesite naziv Vectora!';
      return;
    }
    if (!this.params.collectionName) {
      this.errorCreate = '⚠️ Unesite naziv kolekcije!';
      return;
    }
    if (!this.params.description) {
      this.errorCreate = '⚠️ Unesite naziv opis!';
      return;
    }

    this.loadingCreate = true;
    this.errorCreate = null;
    this.messageCreate = null;
    const data={
      "title": this.params.title,
      "description":this.params.description,
      "collectionName":this.params.collectionName
    }

    this.milvusService.insertVector(data).subscribe({
      next: (res) => {
        this.messageCreate = `✅ Vector "${this.params.title}" kreiran!`;
        this.loadingCreate = false;
        this.params.title = '';
      },
      error: (err) => {
        this.errorCreate = '❌ Greška pri kreiranju kolekcije';
        console.error(err);
        this.loadingCreate = false;
      }
    });
  }

onDropVector(){
  if (!this.dropParams.collectionName || !this.dropParams.id) {
    this.errorDrop = "⚠️ Unesite naziv kolekcije i id!";
    return;
  }

  this.loadingDrop = true;
  this.errorDrop = null;
  this.messageDrop = null;

  console.log(`🗑️ Brisanje vektora: ${this.dropParams.id} iz kolekcije ${this.dropParams.collectionName}`);

  this.milvusService.deleteVector(Number(this.dropParams.id),this.dropParams.collectionName).subscribe({
    next: (res) => {
      this.messageDrop = `✅ Vector "${this.dropParams.id}" uspešno obrisan!`;
      this.loadingDrop = false;
    },
    error: (err) => {
      this.errorDrop = '❌ Greška pri brisanju vektora.';
      console.error(err);
      this.loadingDrop = false;
    }
  });
}

}
